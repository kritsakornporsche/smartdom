import Link from 'next/link';

const MOCK_PARCELS = [
  { id: 1, tracking_number: 'TH012345678X', courier: 'Flash Express', arrival_date: new Date().toISOString(), status: 'Pending', type: 'กล่องขนาดกลาง' },
  { id: 2, tracking_number: 'RB987654321TH', courier: 'Thailand Post', arrival_date: new Date(Date.now() - 86400000).toISOString(), status: 'Picked Up', type: 'ซองจดหมาย' },
];

export default function ParcelsPage() {
  const pendingParcels = MOCK_PARCELS.filter(p => p.status === 'Pending');
  const pickedUpParcels = MOCK_PARCELS.filter(p => p.status === 'Picked Up');

  return (
    <div className="p-8 lg:p-10 hidden-scrollbar">
      <div className="max-w-5xl mx-auto pb-16 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <Link href="/tenant" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A08D74] hover:text-[#3E342B] transition-colors mb-4">
              <span className="w-6 h-px bg-[#A08D74]"></span> กลับหน้าหลัก
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-[#3E342B] tracking-tight">
              จัดการพัสดุ
            </h1>
            <p className="text-[#8B7355] font-medium mt-3">
              ตรวจสอบสถานะพัสดุที่ส่งมาถึงหอพักของคุณ
            </p>
          </div>
        </div>

        {/* Pending Parcels */}
        <section className="bg-white rounded-[3rem] border border-[#E5DFD3] p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          
          <h2 className="text-2xl font-black text-[#3E342B] flex items-center gap-4 mb-8 relative z-10">
            <span className="relative flex h-4 w-4">
              {pendingParcels.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>}
              <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
            </span>
            พัสดุที่รอรับ ({pendingParcels.length})
          </h2>

          {pendingParcels.length === 0 ? (
             <div className="bg-[#FAF8F5] border-2 border-dashed border-[#E5DFD3] rounded-[2rem] p-12 text-center relative z-10">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📦</div>
               <p className="text-[#A08D74] font-bold">ไม่มีพัสดุใหม่ในขณะนี้</p>
             </div>
          ) : (
            <div className="grid gap-6 relative z-10">
              {pendingParcels.map(parcel => (
                 <div key={parcel.id} className="bg-[#FAF8F5] border border-[#E5DFD3] rounded-[2rem] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                        🚚
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#3E342B]">{parcel.tracking_number}</h3>
                        <p className="text-[#8B7355] font-medium text-sm mt-1">{parcel.courier} • {parcel.type}</p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#A08D74] mb-1">วันที่มาถึง</p>
                      <p className="text-[#3E342B] font-bold">{new Date(parcel.arrival_date).toLocaleString('th-TH')}</p>
                      <button className="mt-3 px-6 py-2 bg-[#3E342B] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#3E342B]/20 hover:bg-[#2A231D] transition-colors">
                        รับพัสดุแล้ว
                      </button>
                    </div>
                 </div>
              ))}
            </div>
          )}
        </section>

        {/* History */}
        <section>
          <h2 className="text-xl font-black text-[#3E342B] flex items-center gap-4 mb-6">
            <div className="w-2 h-6 bg-[#A08D74] rounded-full"></div>ประวัติการรับพัสดุ
          </h2>
          <div className="grid gap-4">
              {pickedUpParcels.map(parcel => (
                 <div key={parcel.id} className="bg-white border border-[#E5DFD3] rounded-2xl p-5 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                    <div>
                      <h4 className="font-bold text-[#3E342B]">{parcel.tracking_number}</h4>
                      <p className="text-xs text-[#8B7355]">{parcel.courier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#4CAF50] font-bold mb-1">✅ รับแล้ว</p>
                      <p className="text-[11px] text-[#A08D74]">{new Date(parcel.arrival_date).toLocaleDateString('th-TH')}</p>
                    </div>
                 </div>
              ))}
          </div>
        </section>

      </div>
    </div>
  );
}
