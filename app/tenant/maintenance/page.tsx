'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MaintenanceRequest {
  id: number;
  issue_type: string;
  description: string;
  status: string;
  created_at: string;
  image_url: string;
}

export default function TenantMaintenancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [issueType, setIssueType] = useState('ทั่วไป');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
      return;
    }
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      fetchRequests();
    }
  }, [status]);

  const fetchRequests = async () => {
    try {
      const apiRes = await fetch('/api/tenant/maintenance/list');
      const json = await apiRes.json();
      if (json.success) setRequests(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/tenant/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_type: issueType, description, image_url: imageUrl }),
      });
      const json = await res.json();
      if (json.success) {
        setShowForm(false);
        setDescription('');
        setIssueType('ทั่วไป');
        setImageUrl('');
        fetchRequests();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') return null;

  return (
    <div className="p-8 lg:p-10">
      <div className="max-w-4xl mx-auto pb-16 space-y-12">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[#3E342B] mb-2">การดูแลรักษา (Maintenance)</h1>
            <p className="text-[#8B7355] font-medium">แจ้งปัญหาและติดตามกระบวนการซ่อมแซมภายในห้องพัก</p>
          </div>
          {!showForm && (
            <button 
                onClick={() => setShowForm(true)}
                className="bg-[#8B7355] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-[#8B7355]/20 hover:scale-105 active:scale-95 transition-all"
            >
                + แจ้งซ่อมใหม่
            </button>
          )}
        </header>

        {showForm && (
          <div className="bg-white rounded-[2.5rem] border border-[#E5DFD3] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-black text-[#3E342B] mb-8">แบบฟอร์มแจ้งซ่อม</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-wider text-[#A08D74] px-1">ประเภทปัญหา</label>
                <select 
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20"
                >
                    <option>ทั่วไป</option>
                    <option>ระบบไฟฟ้า</option>
                    <option>ระบบประปา</option>
                    <option>เครื่องปรับอากาศ</option>
                    <option>เฟอร์นิเจอร์</option>
                    <option>อื่นๆ</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-wider text-[#A08D74] px-1">รายละเอียดปัญหา</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="กรุณาระบุปัญหาที่พบ เช่น ไฟเพดานดวงกลางดับ, น้ำหยดใต้ซิงค์..."
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 min-h-[150px]"
                    required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-wider text-[#A08D74] px-1">แนบรูปภาพ (ถ้ามี)</label>
                <div className={`mt-2 flex justify-center rounded-2xl border-2 border-dashed px-6 pt-5 pb-6 ${imageUrl ? 'border-[#8B7355] bg-[#FAF8F5]' : 'border-[#E5DFD3] hover:border-[#8B7355]'} transition-colors relative`}>
                  <div className="space-y-1 text-center">
                    {imageUrl ? (
                      <div className="relative w-full h-48 mx-auto overflow-hidden rounded-xl">
                        <img src={imageUrl} alt="Preview" className="object-cover w-full h-full" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-bold rounded-xl cursor-pointer pointer-events-none">คลิกเพื่อเปลี่ยนรูปภาพ</span>
                      </div>
                    ) : (
                      <svg className={`mx-auto h-12 w-12 text-[#DCD3C6] ${uploadingImage ? 'animate-bounce' : ''}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <div className="flex text-sm text-[#8B7355] justify-center mt-2">
                       <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" disabled={uploadingImage} />
                       <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-center w-full focus-within:outline-none focus-within:ring-2 focus-within:ring-[#8B7355] focus-within:ring-offset-2">
                         <span>{uploadingImage ? 'กำลังอัปโหลด...' : imageUrl ? 'เปลี่ยนรูปภาพ' : 'คลิกเพื่ออัปโหลดไฟล์'}</span>
                       </label>
                    </div>
                    {!imageUrl && <p className="text-xs text-[#A08D74] mt-1">PNG, JPG ขนาดไม่เกิน 5MB</p>}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 border border-[#E5DFD3] text-[#A08D74] rounded-2xl font-bold text-sm hover:bg-[#FAF8F5]"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-4 bg-[#8B7355] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#8B7355]/20 disabled:opacity-50"
                >
                  {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งเรื่องแจ้งซ่อม'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-black text-[#3E342B] flex items-center gap-3">
             ประวัติการแจ้งซ่อมล่วงหน้า
             <span className="text-xs bg-[#F2EFE9] text-[#8B7355] px-2 py-0.5 rounded-lg">{requests.length}</span>
          </h2>
          
          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-20 animate-pulse text-[#A08D74]">กำลังโหลดข้อมูล...</div>
            ) : requests.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-[#E5DFD3] rounded-[2.5rem] p-20 text-center">
                <p className="text-[#A08D74] font-bold">ยังไม่มีประวัติการแจ้งซ่อม</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white rounded-[2.5rem] border border-[#E5DFD3] shadow-sm overflow-hidden flex items-stretch hover:shadow-xl transition-all group">
                   <div className={`w-4 shrink-0 ${
                      req.status === 'Pending' ? 'bg-[#E9C46A]' :
                      req.status === 'In Progress' ? 'bg-[#2196F3]' :
                      'bg-[#4CAF50]'
                   }`}></div>
                   <div className="p-8 flex-1 flex flex-col md:flex-row justify-between gap-6 md:items-center">
                     <div>
                       <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-black text-[#3E342B]">{req.issue_type}</h3>
                            <span className="text-sm font-bold text-[#C2B7A8] uppercase tracking-wider">#{req.id.toString().padStart(4, '0')}</span>
                       </div>
                       <p className="text-[#8B7355] text-sm mb-4 leading-normal font-medium">"{req.description}"</p>
                       <div className="text-sm text-[#A08D74] font-bold tracking-wider uppercase flex items-center gap-2">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         {new Date(req.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       </div>
                     </div>
                     
                     {req.image_url && (
                        <div className="shrink-0 ml-0 md:ml-4 mb-4 md:mb-0 w-full md:w-32 h-32 rounded-2xl overflow-hidden border border-[#E5DFD3]">
                           <img src={req.image_url} alt="Damage" className="w-full h-full object-cover" />
                        </div>
                     )}

                     <div className="shrink-0">
                        <span className={`inline-block px-6 py-2.5 text-sm font-black uppercase tracking-wide rounded-full border-2 ${
                          req.status === 'Pending' ? 'bg-[#FAF3E8] text-[#D4A373] border-[#E9C46A]' :
                          req.status === 'In Progress' ? 'bg-[#E3F2FD] text-[#2196F3] border-[#BBDEFB]' :
                          'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]'
                        }`}>
                          {req.status === 'Pending' ? 'รอดำเนินการ' : req.status === 'In Progress' ? 'กำลังซ่อมแซม' : 'เสร็จสิ้น'}
                        </span>
                     </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
