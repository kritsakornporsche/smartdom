'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants');
      const data = await res.json();
      if (data.success) {
        setTenants(data.data);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-background border-b border-border flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">จัดการผู้เช่า</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">รายชื่อและข้อมูลติดต่อผู้เช่าทั้งหมดในระบบ</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-accent/30 border-b border-border">
                      <th className="px-6 py-4 text-sm font-black uppercase tracking-wider text-muted-foreground">รายชื่อผู้เช่า</th>
                      <th className="px-6 py-4 text-sm font-black uppercase tracking-wider text-muted-foreground">อีเมล</th>
                      <th className="px-6 py-4 text-sm font-black uppercase tracking-wider text-muted-foreground">เบอร์โทรศัพท์</th>
                      <th className="px-6 py-4 text-sm font-black uppercase tracking-wider text-muted-foreground">วันที่เข้าร่วม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : tenants.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                          ไม่พบรายชื่อผู้เช่าในระบบ
                        </td>
                      </tr>
                    ) : (
                      tenants.map((t) => (
                        <tr key={t.id} className="hover:bg-accent/10 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                                {t.name.charAt(0)}
                              </div>
                              <span className="text-sm font-bold text-foreground">{t.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-muted-foreground">{t.email}</td>
                          <td className="px-6 py-5 text-sm font-bold text-foreground">{t.phone || '-'}</td>
                          <td className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {new Date(t.created_at).toLocaleDateString('th-TH')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
