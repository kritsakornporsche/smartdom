'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Package {
  id: number;
  name: string;
  price: number;
  max_rooms: number;
  duration_days: number;
  features: string[];
}

interface WalletData {
  coins: number;
  transactions: any[];
}

interface CurrentSub {
  package_name: string;
  status: string;
  end_date: string;
}

export default function OwnerSubscription() {
  const { data: session } = useSession();
  const [activeDormId, setActiveDormId] = useState<number | null>(null);
  
  const [packages, setPackages] = useState<Package[]>([]);
  const [wallet, setWallet] = useState<WalletData>({ coins: 0, transactions: [] });
  const [currentSub, setCurrentSub] = useState<CurrentSub | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(500);

  const loadData = async () => {
    setLoading(true);
    try {
      const email = session?.user?.email || 'owner@smartdom.com';
      const savedDb = localStorage.getItem('selectedDormDbName');
      
      // Load Current Sub & Dorm Info
      const resS = await fetch(`/api/owner/onboarding?email=${email}${savedDb ? `&dormDbName=${savedDb}` : ''}`);
      const dataS = await resS.json();
      
      if (dataS.success) {
        const dId = dataS.dorm?.id;
        setActiveDormId(dId);
        
        if (dataS.subscription) {
          setCurrentSub(dataS.subscription);
        } else {
          setCurrentSub(null);
        }
        
        if (dId) {
          // Load Wallet
          const resW = await fetch(`/api/owner/wallet?dormId=${dId}`);
          const dataW = await resW.json();
          if (dataW.success) setWallet({ coins: dataW.coins, transactions: dataW.transactions });
        }
      }

      // Load Packages
      const resP = await fetch('/api/platform/packages');
      const dataP = await resP.json();
      if (dataP.success) setPackages(dataP.data.filter((p: any) => p.is_active));
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      loadData();
    }
  }, [session]);

  const handleTopUp = async () => {
    if (!activeDormId || topUpAmount <= 0) return;
    const res = await fetch('/api/owner/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dormId: activeDormId, amount: topUpAmount }),
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      setShowTopUp(false);
      loadData();
    } else {
      alert(data.message);
    }
  };

  const handleBuyPackage = async (pkg: Package) => {
    if (!activeDormId) return;
    if (wallet.coins < pkg.price) {
      alert('เหรียญไม่เพียงพอ กรุณาเติมเงิน');
      setShowTopUp(true);
      return;
    }
    if (!confirm(`ยืนยันการใช้ ${pkg.price} เหรียญ เพื่อซื้อแพ็กเกจ ${pkg.name} ใช่หรือไม่?`)) return;

    const res = await fetch('/api/owner/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dormId: activeDormId, packageId: pkg.id }),
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) loadData();
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#080F1E]">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#080F1E]">
      <header className="h-20 bg-[#0F172A]/60 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">แพ็กเกจและกระเป๋าเงิน</h1>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Subscription & Wallet</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Current Status & Wallet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Current Sub */}
            <div className="bg-[#0F172A] border border-white/20 rounded-2xl p-8 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
              <p className="text-white/50 font-bold text-xs uppercase tracking-widest mb-2">แพ็กเกจปัจจุบัน</p>
              <h2 className="text-3xl font-black text-white mb-2">{currentSub?.package_name || 'ไม่มีแพ็กเกจ'}</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentSub?.status === 'Active' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                }`}>
                  {currentSub?.status || 'Expired'}
                </span>
                {currentSub?.end_date && (
                  <span className="text-white/50 text-sm font-semibold">
                    หมดอายุ: {new Date(currentSub.end_date).toLocaleDateString('th-TH')}
                  </span>
                )}
              </div>
            </div>

            {/* Wallet */}
            <div className="bg-gradient-to-br from-[#2C241B] to-[#3E342B] rounded-2xl p-8 shadow-lg text-white flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <p className="text-white/60 font-bold text-xs uppercase tracking-widest">ยอดเหรียญคงเหลือ</p>
                <div className="bg-yellow-500/20 text-yellow-400 p-2 rounded-xl">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
              </div>
              <h2 className="text-5xl font-black mb-6">{Number(wallet.coins).toLocaleString()} <span className="text-lg text-white/50">เหรียญ</span></h2>
              <button
                onClick={() => setShowTopUp(true)}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-[#2C241B] rounded-xl font-black transition-colors"
              >
                + เติมเงิน
              </button>
            </div>
          </div>

          {/* Package List */}
          <div>
            <h3 className="text-white font-black text-xl mb-6">ซื้อ/ต่ออายุแพ็กเกจ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map(pkg => (
                <div key={pkg.id} className="bg-[#0F172A] border border-white/20 rounded-2xl p-6 shadow-sm hover:border-primary hover:shadow-md transition-all flex flex-col">
                  <h4 className="text-lg font-black text-white mb-2">{pkg.name}</h4>
                  <p className="text-3xl font-black text-primary mb-1">{Number(pkg.price).toLocaleString()} <span className="text-sm text-white/50">เหรียญ</span></p>
                  <p className="text-white/50 text-xs font-semibold mb-6">รองรับ {pkg.max_rooms} ห้อง • {pkg.duration_days} วัน</p>
                  
                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/80 font-medium">
                        <span className="text-[#10B981] mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleBuyPackage(pkg)}
                    className="w-full py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-black transition-all"
                  >
                    เลือกแพ็กเกจนี้
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTopUp(false)}>
          <div className="bg-[#0F172A] rounded-3xl p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              </div>
              <h2 className="text-white font-black text-xl">เติมเหรียญ</h2>
              <p className="text-white/50 text-sm mt-1">1 บาท = 1 เหรียญ</p>
            </div>

            <div className="space-y-3 mb-6">
              {[100, 500, 1000, 3000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(amt)}
                  className={`w-full py-3 rounded-xl font-black transition-all border-2 ${
                    topUpAmount === amt 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-white/20 text-white/50 hover:border-primary/50'
                  }`}
                >
                  {amt.toLocaleString()} เหรียญ
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="text-white/50 text-xs font-bold uppercase block mb-2">หรือระบุจำนวนเอง (บาท)</label>
              <input
                type="number"
                value={topUpAmount}
                onChange={e => setTopUpAmount(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-black focus:outline-none focus:border-primary text-center"
              />
            </div>

            <button 
              onClick={handleTopUp}
              className="w-full py-4 bg-primary text-white rounded-xl font-black text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
            >
              ยืนยันการเติมเงิน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
