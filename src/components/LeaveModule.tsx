import React, { useState, useEffect } from 'react';
import { UserAccount, LeaveRecord } from '../types';
import { ApiService } from '../services/api';
import Swal from 'sweetalert2';
import { FileText, Plus, RefreshCw, FileCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface LeaveModuleProps {
  user: UserAccount;
}

export const LeaveModule: React.FC<LeaveModuleProps> = ({ user }) => {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState('ลาพักผ่อน');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationDays, setDurationDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState('พักผ่อนประจำปี');
  const [contactAddress, setContactAddress] = useState(user.Address || '');
  const [phoneNumber, setPhoneNumber] = useState(user.PhoneNumber || '');

  const loadLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getLeaveRecords(user);
      if (res.success && res.payload) {
        setLeaves(res.payload);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [user.UserID]);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      Swal.fire('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุวันที่เริ่มต้นและสิ้นสุดการลา', 'warning');
      return;
    }

    setIsSubmitting(true);
    Swal.fire({
      title: 'กำลังบันทึกข้อมูลการลา...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const payload = {
        LeaveType: leaveType,
        StartDate: startDate,
        EndDate: endDate,
        DurationDays: durationDays,
        LeaveReason: leaveReason,
        ContactAddress: contactAddress,
        PhoneNumber: phoneNumber
      };

      const res = await ApiService.saveLeaveRecord(payload, user);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'ยื่นใบลาสำเร็จ!',
          text: 'ข้อมูลบันทึกลงตาราง LeaveRecord เรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        });
        // Reset form
        setStartDate('');
        setEndDate('');
        loadLeaves();
      } else {
        Swal.fire('ไม่สามารถยื่นใบลาได้', res.message, 'error');
      }
    } catch (err: any) {
      Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePdf = async (leaveId: string) => {
    Swal.fire({
      title: 'กำลังสร้างไฟล์ PDF ใบลา...',
      text: 'ระบบกำลังดึงข้อมูลและใส่ตราครุฑ/สถิติวันลา',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res = await ApiService.generateLeavePdfOnServer(leaveId, user);
      if (res.success && res.fileUrl) {
        Swal.fire({
          icon: 'success',
          title: 'สร้างไฟล์ใบลาสำเร็จ!',
          html: `<a href="${res.fileUrl}" target="_blank" class="text-indigo-600 underline font-bold">คลิกที่นี่เพื่อเปิดดู PDF ใบลา</a>`,
          confirmButtonText: 'ตกลง'
        });
        loadLeaves();
      } else {
        Swal.fire('สร้างไฟล์ไม่สำเร็จ', res.message, 'error');
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
            <FileText className="w-6 h-6 text-purple-600" />
            <span>ระบบยื่นใบลาอิเล็กทรอนิกส์</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ยื่นใบลาป่วย ลากิจ ลาพักผ่อน และสร้างเอกสารลงนามคำร้องอัตโนมัติ
          </p>
        </div>

        <button
          onClick={loadLeaves}
          className="p-2.5 text-slate-600 hover:text-purple-600 hover:bg-slate-100 rounded-xl transition"
          title="รีเฟรชรายการ"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
        </button>
      </div>

      {/* Leave Application Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
          <Plus className="w-5 h-5 text-purple-600" />
          <span>แบบฟอร์มขออนุญาตลา</span>
        </h3>

        <form onSubmit={handleSubmitLeave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">ประเภทการลา:</label>
              <select
                value={leaveType}
                onChange={(e) => {
                  setLeaveType(e.target.value);
                  if (e.target.value === 'ลาพักผ่อน') setLeaveReason('พักผ่อนประจำปี');
                  else setLeaveReason('');
                }}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-medium"
              >
                <option value="ลาพักผ่อน">ลาพักผ่อน</option>
                <option value="ลากิจส่วนตัว">ลากิจส่วนตัว</option>
                <option value="ลาป่วย">ลาป่วย</option>
                <option value="ลาคลอดบุตร">ลาคลอดบุตร</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">ตั้งแต่วันที่:</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">ถึงวันที่:</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">จำนวน (วันทำการ):</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={durationDays}
                onChange={(e) => setDurationDays(parseFloat(e.target.value) || 1)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">เหตุผลการลา:</label>
              <input
                type="text"
                required
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="ระบุเหตุผลในการขอลางาน..."
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">ที่อยู่ติดต่อระหว่างลา:</label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="ระบุที่อยู่ระหว่างลา..."
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">เบอร์โทรศัพท์ติดต่อ:</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="081xxxxxxx"
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
            >
              ยื่นใบลา
            </button>
          </div>
        </form>
      </div>

      {/* Leave Records List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-3">
          ประวัติการขอลางานของคุณ
        </h3>

        {leaves.length > 0 ? (
          <div className="space-y-3">
            {leaves.map((rec) => (
              <div
                key={rec['leave id']}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-purple-700 text-sm">{rec['ประเภทการลา']}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                      {rec['มีกำหนดกี่วัน']} วัน
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    วันที่: {rec['วันที่เริ่มต้นลา']} ถึง {rec['วันสุดท้ายที่ลา']}
                  </p>
                  <p className="text-slate-500">เหตุผล: {rec['เหตุผลการลา']}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                    {rec.Status || 'รอผู้สร้างลงนาม'}
                  </span>

                  <button
                    onClick={() => handleGeneratePdf(rec['leave id'])}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-[11px] transition flex items-center space-x-1"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>สร้าง PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            ไม่พบประวัติการขอลางาน
          </div>
        )}
      </div>
    </div>
  );
};
