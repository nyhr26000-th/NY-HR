import React, { useState, useEffect } from 'react';
import { UserAccount, WFHRequest } from '../types';
import { ApiService } from '../services/api';
import Swal from 'sweetalert2';
import { Home, Plus, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

interface WFHModuleProps {
  user: UserAccount;
}

export const WFHModule: React.FC<WFHModuleProps> = ({ user }) => {
  const [requests, setRequests] = useState<WFHRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [houseNo, setHouseNo] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [district, setDistrict] = useState('เมืองนครนายก');
  const [province, setProvince] = useState('นครนายก');
  const [reason, setReason] = useState('ปฏิบัติงานวิเคราะห์และสรุปรายงานนอกสถานที่ตั้ง');
  const [phone, setPhone] = useState(user.PhoneNumber || '');
  const [datesStr, setDatesStr] = useState('');

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getWFHRequests(user);
      if (res.success && res.payload) {
        setRequests(res.payload);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user.UserID]);

  const handleSubmitWFH = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datesStr.trim() || !phone.trim()) {
      Swal.fire('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุวันที่ขอ WFH และเบอร์โทรศัพท์ติดต่อ', 'warning');
      return;
    }

    Swal.fire({
      title: 'กำลังบันทึกคำขอ WFH...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const dates = datesStr.split(',').map((d) => d.trim());
      const payload = {
        empType: user.PersonnelType || 'ข้าราชการ',
        level: user.PositionLevel || '-',
        jobTask: user.Position,
        houseNo,
        subDistrict,
        district,
        province,
        reason,
        intent: 'เพื่อปฏิบัติงานให้แล้วเสร็จตามเป้าหมายตัวชี้วัด',
        datesStr,
        dates,
        totalDays: dates.length,
        phone,
        tasks: [
          {
            date: dates[0] || '',
            duration: '08.30-16.30 น.',
            taskDesc: 'จัดทำและสรุปรายงานผลการปฏิบัติงานประจำสัปดาห์',
            kpi: 'รายงานแล้วเสร็จ 100%'
          }
        ]
      };

      const res = await ApiService.saveWFHRequest(payload, user);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'สร้างคำขอ WFH สำเร็จ!',
          text: res.message,
          timer: 2000,
          showConfirmButton: false
        });
        setDatesStr('');
        loadRequests();
      } else {
        Swal.fire('ไม่สามารถบันทึกได้', res.message, 'error');
      }
    } catch (err: any) {
      Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Home className="w-6 h-6 text-purple-600" />
            <span>ระบบขอปฏิบัติงาน WFH</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ยื่นขออนุญาตปฏิบัติงานนอกสถานที่ตั้ง (Work From Home) และติดตามสถานะ
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="p-2.5 text-slate-600 hover:text-purple-600 hover:bg-slate-100 rounded-xl transition"
          title="รีเฟรชรายการ"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
          <Plus className="w-5 h-5 text-purple-600" />
          <span>สร้างคำขอ WFH ใหม่</span>
        </h3>

        <form onSubmit={handleSubmitWFH} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">บ้านเลขที่/ที่พัก:</label>
              <input
                type="text"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                placeholder="เช่น 123/4 ม.1"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">ตำบล:</label>
              <input
                type="text"
                value={subDistrict}
                onChange={(e) => setSubDistrict(e.target.value)}
                placeholder="เช่น นครนายก"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">อำเภอ:</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">จังหวัด:</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">วันที่ขอ WFH (คั่นด้วยเครื่องหมายจุลภาค ,):</label>
              <input
                type="text"
                required
                value={datesStr}
                onChange={(e) => setDatesStr(e.target.value)}
                placeholder="เช่น 01/08/2569, 02/08/2569"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">เบอร์โทรศัพท์ติดต่อ:</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081xxxxxxx"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">เหตุผลความจำเป็นในการขอ WFH:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              บันทึกคำขอ WFH
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-3">
          ประวัติคำขอ WFH ของคุณ
        </h3>

        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.RequestID}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-purple-700 text-sm">
                    ขอ WFH วันที่: {r['วันที่ขอWFH'] || '-'} ({r['รวมวัน'] || 1} วัน)
                  </p>
                  <p className="text-slate-600 mt-1">
                    สถานที่: ต.{r['ตำบล']} อ.{r['อำเภอ']} จ.{r['จังหวัด']}
                  </p>
                  <p className="text-slate-500">เหตุผล: {r['เหตุผลWFH']}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {r.Status || 'อนุมัติแล้ว'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            ไม่พบประวัติคำขอ WFH
          </div>
        )}
      </div>
    </div>
  );
};
