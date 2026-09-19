'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface EvalSummary {
  count: number;
  averages: Record<string, number>;
  task_pass_rates: Record<string, number | null>;
}

const SAT_LABELS: Record<string, string> = {
  sat_usability: 'ความง่ายใช้งาน',
  sat_design: 'ความสวยงาม/UI',
  sat_reliability: 'ความน่าเชื่อถือ',
  sat_performance: 'ความเร็ว',
  sat_communication: 'ระบบแชท',
  sat_qr_payment: 'QR Payment',
  sat_notifications: 'การแจ้งเตือน',
  sat_maintenance: 'แจ้งซ่อม',
  sat_billing: 'ระบบบิล',
  sat_overall: 'ความพึงพอใจรวม',
};

const TASK_LABELS: Record<string, string> = {
  task_login: 'เข้าสู่ระบบ',
  task_qr_payment: 'QR ชำระเงิน',
  task_view_contract: 'ดูสัญญา',
  task_maintenance: 'แจ้งซ่อม',
  task_services: 'ขอบริการ',
  task_chat: 'แชท',
  task_submit_slip: 'ส่งสลิป',
  task_billing_history: 'ประวัติบิล',
  task_contract_check: 'ตรวจสัญญา',
  task_announcements: 'ดูประกาศ',
  task_move_out: 'แจ้งย้ายออก',
};

function getAvgColor(val: number) {
  if (val >= 4.21) return 'text-emerald-400';
  if (val >= 3.41) return 'text-green-400';
  if (val >= 2.61) return 'text-amber-400';
  if (val >= 1.81) return 'text-orange-400';
  return 'text-rose-400';
}

function getAvgLabel(val: number) {
  if (val >= 4.21) return 'มากที่สุด';
  if (val >= 3.41) return 'มาก';
  if (val >= 2.61) return 'ปานกลาง';
  if (val >= 1.81) return 'น้อย';
  return 'น้อยที่สุด';
}

export default function EvaluationResultsPage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<EvalSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tenant/evaluation?dormId=1')
      .then(r => r.json())
      .then(d => { if (d.success) setSummary(d.summary); })
      .finally(() => setLoading(false));
  }, []);

  const overallAvg = summary
    ? Object.values(summary.averages).filter(v => v > 0).reduce((a, b) => a + b, 0) /
      Object.values(summary.averages).filter(v => v > 0).length
    : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-black text-primary uppercase tracking-widest">แบบประเมินผู้เช่า · ชุดที่ 2</p>
          <h1 className="text-3xl font-black text-foreground mt-1">ผลการประเมิน</h1>
          <p className="text-slate-400 text-sm mt-1">สรุปผลจากผู้ตอบแบบสอบถามทั้งหมด</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !summary ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <h3 className="text-lg font-black text-foreground">ยังไม่มีข้อมูลแบบประเมิน</h3>
            <p className="text-slate-400 text-sm mt-2">รอให้ผู้เช่ากรอกแบบประเมินก่อน</p>
          </div>
        ) : (
          <>
            {/* Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-primary/30 rounded-3xl p-6 text-center">
                <p className="text-5xl font-black text-primary">{summary.count}</p>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">ผู้ตอบทั้งหมด</p>
              </div>
              <div className="bg-card border border-emerald-500/30 rounded-3xl p-6 text-center">
                <p className={`text-5xl font-black ${getAvgColor(overallAvg)}`}>{overallAvg.toFixed(2)}</p>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">คะแนนเฉลี่ยรวม / 5.00</p>
                <p className={`text-xs font-black mt-1 ${getAvgColor(overallAvg)}`}>{getAvgLabel(overallAvg)}</p>
              </div>
              <div className="bg-card border border-amber-500/30 rounded-3xl p-6 text-center">
                <p className="text-5xl font-black text-amber-400">
                  {Object.values(summary.task_pass_rates).filter(v => v !== null).length > 0
                    ? Math.round(Object.values(summary.task_pass_rates).filter(v => v !== null).reduce((a, b) => a + (b ?? 0), 0) /
                        Object.values(summary.task_pass_rates).filter(v => v !== null).length)
                    : '-'}%
                </p>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">อัตราผ่านงานเฉลี่ย</p>
              </div>
            </div>

            {/* Task pass rates */}
            <div className="bg-card border border-border rounded-3xl p-6">
              <h2 className="text-base font-black text-foreground mb-5">ส่วนที่ 2: อัตราผ่านงาน (%)</h2>
              <div className="space-y-3">
                {Object.entries(summary.task_pass_rates).map(([key, rate]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-32 shrink-0">{TASK_LABELS[key] || key}</span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${(rate ?? 0) >= 80 ? 'bg-emerald-500' : (rate ?? 0) >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${rate ?? 0}%` }}
                      />
                    </div>
                    <span className={`text-sm font-black w-10 text-right ${(rate ?? 0) >= 80 ? 'text-emerald-400' : (rate ?? 0) >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {rate !== null ? `${rate}%` : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Satisfaction averages */}
            <div className="bg-card border border-border rounded-3xl p-6">
              <h2 className="text-base font-black text-foreground mb-5">ส่วนที่ 3: คะแนนความพึงพอใจเฉลี่ย (1-5)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(summary.averages).map(([key, avg]) => (
                  <div key={key} className="flex items-center justify-between bg-secondary/30 rounded-2xl px-4 py-3">
                    <span className="text-xs font-bold text-slate-300">{SAT_LABELS[key] || key}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i <= Math.round(avg) ? (avg >= 4 ? 'bg-emerald-400' : avg >= 3 ? 'bg-amber-400' : 'bg-rose-400') : 'bg-secondary'}`} />
                        ))}
                      </div>
                      <span className={`text-sm font-black ${getAvgColor(avg)}`}>{avg.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Interpretation */}
              <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-3 text-[10px] font-bold text-slate-400">
                <span className="text-emerald-400">● 4.21-5.00 มากที่สุด</span>
                <span className="text-green-400">● 3.41-4.20 มาก</span>
                <span className="text-amber-400">● 2.61-3.40 ปานกลาง</span>
                <span className="text-orange-400">● 1.81-2.60 น้อย</span>
                <span className="text-rose-400">● 1.00-1.80 น้อยที่สุด</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
