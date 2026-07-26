import React, { useState, useEffect } from 'react';
import { UserAccount, OffSiteRecord } from '../types';
import { ApiService } from '../services/api';
import Swal from 'sweetalert2';
import { MapPin, Plus, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

interface OffSiteModuleProps {
  user: UserAccount;
}

export const OffSiteModule: React.FC<OffSiteModuleProps> = ({ user }) => {
  const [records, setRecords] = useState<OffSiteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [purpose, setSetPurpose] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [province, setProvince] = useState('นครนายก');
  const [travelType, setTravelType] = useState('ในจังหวัด');
  const [organizer, setOrganizer] = useState('');
  const [budgetType, setBudgetType] = useState('ไม่เบิก');
  const [budgetAmount, setBudgetAmount] = useState(0);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getOffSiteRecords(user);
      if (res.success && res.payload) {
        setRecords(res.payload);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [user.UserID]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !startDate || !endDate || !location.trim()) {
      Swal.fire('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุวัตถุประสงค์ วันที่เดินทาง และสถานที่', 'warning');
      return;
    }

    Swal.fire({
      title: 'กำลังบันทึกข้อมูลไปราชการ...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const payload = {
        TravelPurpose: purpose,
        TravelDates: [{ start: startDate, end: endDate }],
        TravelType: travelType,
        Province: province,
        Location: location,
        Organizer: organizer || 'สสจ.นครนายก',
        BudgetType: budgetType,
        BudgetAmount: budgetAmount
      };

      const res = await ApiService.saveRecord(payload, user);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกข้อมูลไปราชการสำเร็จ!',
          timer: 2000,
          showConfirmButton: false
        });
        setSetPurpose('');
        setStartDate('');
        setEndDate('');
        setLocation('');
        loadRecords();
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
            <MapPin className="w-6 h-6 text-indigo-600" />
            <span>ระบบบันทึกการไปราชการ</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            แจ้งและขออนุมัติเดินทางไปราชการในจังหวัด / นอกจังหวัด
          </p>
        </div>

        <button
          onClick={loadRecords}
          className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
          title="รีเฟรชรายการ"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" />
          <span>แจ้งขอไปราชการใหม่</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">เรื่อง / วัตถุประสงค์:</label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setSetPurpose(e.target.value)}
              placeholder="ระบุวัตถุประสงค์การไปราชการ..."
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div>
              <label className="block text-slate-700 font-bold mb-1">ประเภท:</label>
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-medium"
              >
                <option value="ในจังหวัด">ในจังหวัด</option>
                <option value="นอกจังหวัด">นอกจังหวัด</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">จังหวัด:</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">สถานที่ไปราชการ:</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ระบุสถานที่..."
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">หน่วยงานผู้จัด:</label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="เช่น สสจ.นครนายก, กรมอนามัย..."
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              บันทึกข้อมูลไปราชการ
            </button>
          </div>
        </form>
      </div>

      {/* Record Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-3">
          รายการบันทึกไปราชการของคุณ
        </h3>

        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((r) => (
              <div
                key={r.ID}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-indigo-700 text-sm">{r.TravelPurpose}</p>
                  <p className="text-slate-600 mt-1">
                    สถานที่: {r.Location} จ.{r.Province} ({r.TravelType})
                  </p>
                  <p className="text-slate-500">
                    ระยะเวลา: {r.CalculatedDuration || '1 วัน'} | งบประมาณ: {r.BudgetType} ({r.BudgetAmount || 0} บาท)
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {r.Status || 'รับทราบแล้ว'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            ไม่พบรายการไปราชการ
          </div>
        )}
      </div>
    </div>
  );
};
