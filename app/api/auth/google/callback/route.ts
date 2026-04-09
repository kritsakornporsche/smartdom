import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=No_Code', request.url));
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    // 1. Exchange auth code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
        throw new Error('Failed to fetch access token');
    }

    // 2. Fetch user profile from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileRes.json();

    if (!profileData.email) {
      throw new Error('Google profile did not return an email');
    }

    // 3. Connect to database and check/insert user
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Default role for new Google logins
    let role = 'tenant';
    
    let users = await sql`SELECT id, name, email, role FROM users WHERE email = ${profileData.email}`;
    
    if (users.length === 0) {
      // Create new user automatically from Google Profile
      const result = await sql`
        INSERT INTO users (email, password, name, role) 
        VALUES (${profileData.email}, 'google-oauth', ${profileData.name || profileData.email}, ${role})
        RETURNING id, name, email, role
      `;
      users = result;
    }

    const user = users[0];

    // 4. Set session cookies
    const cookieStore = await cookies();
    cookieStore.set('session_role', user.role, { path: '/', httpOnly: false });
    cookieStore.set('session_user', JSON.stringify({ id: user.id, name: user.name, email: user.email }), { path: '/', httpOnly: false });

    // 5. Redirect based on role
    let redirectUrl = '/';
    if (user.role === 'admin') redirectUrl = '/admin';
    if (user.role === 'tenant') redirectUrl = '/tenant';
    if (user.role === 'keeper') redirectUrl = '/keeper';

    return NextResponse.redirect(new URL(redirectUrl, request.url));

  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent(error.message)}`, request.url));
  }
}
