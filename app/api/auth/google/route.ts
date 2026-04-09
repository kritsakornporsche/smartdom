import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    // Redirect to signin with error if no client ID is setup yet
    return NextResponse.redirect(new URL('/signin?error=Google_OAuth_Not_Configured', request.url));
  }

  // Use the origin URL for dynamic redirect_uri matching
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  // Standard Google OAuth 2.0 URL
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=online&prompt=select_account`;

  return NextResponse.redirect(googleAuthUrl);
}
