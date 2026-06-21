import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const MYSQL_BASE = 'mysql://root:@localhost:3306';
const platformSql = neon(`${MYSQL_BASE}/smartdom_platform`);

export async function POST(req: Request) {
  try {
    const { dormId, packageId } = await req.json();
    if (!dormId || !packageId) {
      return NextResponse.json({ success: false, message: 'Missing dormId or packageId' }, { status: 400 });
    }

    // 1. Get package details
    const pkgs = await platformSql`SELECT * FROM packages WHERE id = ${packageId} AND is_active = 1 LIMIT 1`;
    if (pkgs.length === 0) return NextResponse.json({ success: false, message: 'แพ็กเกจไม่ถูกต้องหรือถูกยกเลิกแล้ว' }, { status: 400 });
    const pkg = pkgs[0];

    // 2. Check coin balance
    const regs = await platformSql`SELECT coins FROM dormitory_registry WHERE id = ${dormId} LIMIT 1`;
    if (regs.length === 0) return NextResponse.json({ success: false, message: 'ไม่พบหอพักในระบบ' }, { status: 400 });
    const currentCoins = regs[0].coins;

    if (currentCoins < pkg.price) {
      return NextResponse.json({ success: false, message: 'เหรียญไม่เพียงพอ กรุณาเติมเงิน' }, { status: 400 });
    }

    // 3. Deduct coins
    await platformSql`UPDATE dormitory_registry SET coins = coins - ${pkg.price} WHERE id = ${dormId}`;

    // 4. Record coin transaction
    await platformSql`
      INSERT INTO coin_transactions (dormitory_id, type, amount, description)
      VALUES (${dormId}, 'Spend', ${pkg.price}, ${`ซื้อแพ็กเกจ ${pkg.name}`})
    `;

    // 5. Update or Create Subscription
    // Find current active subscription
    const currentSubs = await platformSql`
      SELECT id, end_date FROM subscriptions 
      WHERE dormitory_id = ${dormId} AND status = 'Active' 
      ORDER BY end_date DESC LIMIT 1
    `;

    let newStartDate = new Date();
    if (currentSubs.length > 0) {
      const currentEndDate = new Date(currentSubs[0].end_date);
      if (currentEndDate > newStartDate) {
        newStartDate = currentEndDate; // Extend from current end date
      }
      // Set old ones to Expired if we are replacing completely? 
      // For simplicity, we just add a new row and old ones naturally expire, or we can mark them as Expired.
      await platformSql`UPDATE subscriptions SET status = 'Expired' WHERE dormitory_id = ${dormId}`;
    }

    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + (pkg.duration_days || 30));

    await platformSql`
      INSERT INTO subscriptions (dormitory_id, package_id, status, start_date, end_date, amount_paid)
      VALUES (${dormId}, ${pkg.id}, 'Active', ${newStartDate.toISOString().replace('T', ' ').substring(0, 19)}, ${newEndDate.toISOString().replace('T', ' ').substring(0, 19)}, ${pkg.price})
    `;

    // Note: We DO NOT record Platform Revenue here because revenue was recorded at TopUp time.
    // Buying a package with coins is just an internal deduction.

    return NextResponse.json({ success: true, message: 'ต่ออายุแพ็กเกจสำเร็จ!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
