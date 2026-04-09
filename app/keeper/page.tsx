import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function KeeperIndexPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/signin');
  }

  const role = (session.user as any).role;
  const subRole = (session.user as any).sub_role;

  if (role !== 'keeper') {
    redirect('/');
  }

  if (subRole === 'maid') {
    redirect('/keeper/maid');
  } else if (subRole === 'technician') {
    redirect('/keeper/technician');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">ไม่พบประเภทพนักงานของคุณ</h1>
        <p className="text-muted-foreground">กรุณาติดต่อผู้ดูแลระบบเพื่อกำหนดบทบาท (แม่บ้าน หรือ ช่างซ่อม)</p>
      </div>
    </div>
  );
}
