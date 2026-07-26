import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, X, User } from 'lucide-react';

interface DayDetailModalProps {
  dayNum: number;
  monthName: string;
  yearThai: number;
  onClose: () => void;
}

const STAFF_NAMES = [
  'นายสิริรัฐ ทองทรานต์',
  'นางสาวมลิดา กฤษลานุวัตน์',
  'นายพคิน นิลบุตดา',
  'นางสาวเปมิกา รอดทำพล',
  'นางสาวสุภาพร ขาวเผือก',
  'นางสาวศิริพรรณ พันธุ์ศิริ',
  'นางสาววราภรณ์ หงสากินันท์',
  'นายธนากร กิตติชัย',
  'นางสาวกานดา วิชิตชัย',
  'นายภาณุเดช มีสุข',
  'นางสาวพิมพ์ลภัส สมบูรณ์',
  'นายณัฐพงษ์ เจริญทรัพย์',
  'นางสาวอารียา บรรจง',
  'นายชยพล สุวรรณรัตน์'
];

export const CalendarModule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Default to July 2026 (2569) matching screenshots
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'office' | 'offsite' | 'wfh' | 'trip' | 'leave'>('office');

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const thaiShortMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to generate consistent count badges for each day of month matching screenshot style
  const getDayCounts = (dayNum: number) => {
    // Generate realistic counts matching screenshot patterns
    const isWeekend = (firstDayOfMonth + dayNum - 1) % 7 === 0 || (firstDayOfMonth + dayNum - 1) % 7 === 6;
    if (isWeekend) {
      if (dayNum === 18) return { office: 0, offsite: 0, wfh: 0, trip: 1, leave: 0 };
      return { office: 0, offsite: 0, wfh: 0, trip: 0, leave: 0 };
    }

    // Weekdays matching counts in image 3
    const seed = dayNum * 17;
    const office = 1 + (seed % 12);
    const offsite = (seed % 3 === 0) ? 1 + (seed % 9) : 0;
    const wfh = (seed % 5 === 0) ? 1 + (seed % 5) : 0;
    const trip = 55 + (seed % 22);
    const leave = 1 + (seed % 38);

    return { office, offsite, wfh, trip, leave };
  };

  // Detailed lists generator for the day modal matching Image 4
  const getDayDetailData = (dayNum: number) => {
    const counts = getDayCounts(dayNum);

    // Mock realistic staff rows for selected day
    const officeStaff = [
      { name: 'นายสิริรัฐ ทองทรานต์', time: '06:50:21', status: 'normal' },
      { name: 'นางสาวมลิดา กฤษลานุวัตน์', time: '06:55:52', status: 'normal' },
      { name: 'นายพคิน นิลบุตดา', time: '07:21:24', status: 'normal' },
      { name: 'นางสาวเปมิกา รอดทำพล', time: '07:22:34', status: 'normal' },
      { name: 'นางสาวสุภาพร ขาวเผือก', time: '07:32:42', status: 'normal' },
      { name: 'นางสาวศิริพรรณ พันธุ์ศิริ', time: '07:56:12', status: 'normal' },
      { name: 'นางสาววราภรณ์ หงสากินันท์', time: '08:05:10', status: 'late' },
      { name: 'นายธนากร กิตติชัย', time: '08:12:45', status: 'late' },
    ];

    const offsiteStaff = [
      { name: 'นายภาณุเดช มีสุข', time: '08:15:00', note: 'ลงพื้นที่ตรวจการ รพ.สต.บ้านนา' },
      { name: 'นางสาวกานดา วิชิตชัย', time: '08:30:12', note: 'ออกหน่วยปฐมภูมิเคลื่อนที่' },
      { name: 'นายณัฐพงษ์ เจริญทรัพย์', time: '08:45:00', note: 'นิเทศงานกลุ่มงานสารสนเทศ' }
    ];

    const wfhStaff = [
      { name: 'นางสาวพิมพ์ลภัส สมบูรณ์', time: '08:30:00', note: 'จัดทำรายงานสรุป KPI ประจำไตรมาส' }
    ];

    const tripStaff = [
      { name: 'นายชยพล สุวรรณรัตน์', time: '07:30:00', note: 'ประชุมกระทรวงสาธารณสุข นนทบุรี' },
      { name: 'นางสาวอารียา บรรจง', time: '08:00:00', note: 'อบรมพัฒนาศักยภาพบุคลากร เขตสุขภาพที่ 4' },
      { name: 'นายสมชาย ดีเลิศ', time: '08:15:00', note: 'ประชุมสัมมนาวิชาการ สป.สธ.' },
      { name: 'นางสาวกนกวรรณ จันทร์สว่าง', time: '08:30:00', note: 'เข้าร่วมประชุมเชิงปฏิบัติการ' }
    ];

    const leaveStaff = [
      { name: 'นายพิชัย สุขสำราญ', leaveType: 'ลาพักผ่อน', note: 'ลาพักผ่อนประจำปี (1 วัน)' },
      { name: 'นางสาวสิริมา ใจดี', leaveType: 'ลากิจส่วนตัว', note: 'ติดต่อภารกิจส่วนตัว' },
      { name: 'นายอนุชา เข็มทอง', leaveType: 'ลาป่วย', note: 'มีอาการไข้หวัด แพทย์ให้พักผ่อน' },
      { name: 'นางสาววิภาวี รัตนอุบล', leaveType: 'ลาพักผ่อน', note: 'ลาพักผ่อนประจำปี' },
      { name: 'นายชัยวัฒน์ สุวรรณกูล', leaveType: 'ลาพักผ่อน', note: 'ลาพักผ่อนประจำปี' },
      { name: 'นางสาวนภาวรรณ นามสกุล', leaveType: 'ลากิจส่วนตัว', note: 'ลากิจจำเป็น' }
    ];

    return {
      totalOffice: counts.office > 0 ? counts.office + 70 : 76,
      totalOffsite: counts.offsite > 0 ? counts.offsite + 18 : 21,
      totalWfh: counts.wfh > 0 ? counts.wfh : 1,
      totalTrip: counts.trip > 0 ? counts.trip : 4,
      totalLeave: counts.leave > 0 ? counts.leave : 6,
      officeStaff,
      offsiteStaff,
      wfhStaff,
      tripStaff,
      leaveStaff
    };
  };

  const modalData = selectedDay ? getDayDetailData(selectedDay) : null;

  return (
    <div className="space-y-4">
      {/* Main Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-4">
        {/* Month Navigation Title */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600 font-bold text-lg"
            title="เดือนก่อนหน้า"
          >
            &lt;
          </button>
          
          <h2 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">
            {thaiMonths[month]} {year + 543}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600 font-bold text-lg"
            title="เดือนถัดไป"
          >
            &gt;
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-xs sm:text-sm py-2 border-b border-slate-200">
          {daysOfWeek.map((d, i) => (
            <div key={d} className={i === 0 || i === 6 ? 'text-rose-600 font-black' : 'text-slate-700'}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[75px] sm:min-h-[90px] bg-slate-50/40 rounded-xl border border-dashed border-slate-100" />
          ))}

          {/* Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const counts = getDayCounts(dayNum);
            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => {
                  setSelectedDay(dayNum);
                  setActiveTab('office');
                }}
                className={`min-h-[75px] sm:min-h-[95px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer hover:border-emerald-500 hover:shadow-xs ${
                  isToday
                    ? 'bg-emerald-50/60 border-emerald-500 font-bold shadow-2xs'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50/80'
                }`}
              >
                {/* Day Number */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm font-extrabold ${isToday ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {dayNum}
                  </span>
                </div>

                {/* Badge Count Indicators matching Image 3 */}
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {/* Office Green Pill */}
                  {counts.office > 0 && (
                    <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-extrabold bg-emerald-500 text-white rounded-full shadow-2xs">
                      <span>🟢</span>
                      <span>{counts.office}</span>
                    </span>
                  )}

                  {/* Offsite Cyan/Teal Pill */}
                  {counts.offsite > 0 && (
                    <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-extrabold bg-cyan-500 text-white rounded-full shadow-2xs">
                      <span>🟢</span>
                      <span>{counts.offsite}</span>
                    </span>
                  )}

                  {/* WFH Orange Pill */}
                  {counts.wfh > 0 && (
                    <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-extrabold bg-amber-500 text-white rounded-full shadow-2xs">
                      <span>🟠</span>
                      <span>{counts.wfh}</span>
                    </span>
                  )}

                  {/* Trip Blue Pill */}
                  {counts.trip > 0 && (
                    <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-extrabold bg-indigo-600 text-white rounded-full shadow-2xs">
                      <span>🔵</span>
                      <span>{counts.trip}</span>
                    </span>
                  )}

                  {/* Leave Purple Pill */}
                  {counts.leave > 0 && (
                    <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-extrabold bg-purple-600 text-white rounded-full shadow-2xs">
                      <span>🟣</span>
                      <span>{counts.leave}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal (Matching Image 4) */}
      {selectedDay && modalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Title */}
            <div className="p-4 sm:p-5 text-center border-b border-slate-100">
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-800">
                ข้อมูลวันที่ {selectedDay} {thaiShortMonths[month]} {year + 543}
              </h3>
            </div>

            {/* Modal Navigation Tabs (5 Categories matching Image 4) */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto text-xs sm:text-sm font-bold text-slate-600">
              <button
                onClick={() => setActiveTab('office')}
                className={`flex-1 min-w-[120px] py-3 text-center transition border-b-2 ${
                  activeTab === 'office'
                    ? 'border-emerald-600 text-emerald-600 font-extrabold bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                ปฏิบัติงาน ณ ที่ตั้ง ({modalData.totalOffice})
              </button>

              <button
                onClick={() => setActiveTab('offsite')}
                className={`flex-1 min-w-[100px] py-3 text-center transition border-b-2 ${
                  activeTab === 'offsite'
                    ? 'border-cyan-600 text-cyan-600 font-extrabold bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                นอกพื้นที่ ({modalData.totalOffsite})
              </button>

              <button
                onClick={() => setActiveTab('wfh')}
                className={`flex-1 min-w-[80px] py-3 text-center transition border-b-2 ${
                  activeTab === 'wfh'
                    ? 'border-amber-600 text-amber-600 font-extrabold bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                WFH ({modalData.totalWfh})
              </button>

              <button
                onClick={() => setActiveTab('trip')}
                className={`flex-1 min-w-[100px] py-3 text-center transition border-b-2 ${
                  activeTab === 'trip'
                    ? 'border-indigo-600 text-indigo-600 font-extrabold bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                ไปราชการ ({modalData.totalTrip})
              </button>

              <button
                onClick={() => setActiveTab('leave')}
                className={`flex-1 min-w-[80px] py-3 text-center transition border-b-2 ${
                  activeTab === 'leave'
                    ? 'border-purple-600 text-purple-600 font-extrabold bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                ลา ({modalData.totalLeave})
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Tab Header Stats Bar (Image 4 format) */}
              {activeTab === 'office' && (
                <div className="bg-slate-100/80 rounded-xl p-2.5 flex items-center justify-center gap-4 text-xs font-bold text-slate-700">
                  <span className="text-emerald-700">มาทำงาน (51)</span>
                  <span className="text-rose-600">(22)</span>
                  <span className="text-amber-600">เข้างานสาย (3)</span>
                </div>
              )}

              {/* Staff List View */}
              <div className="space-y-2.5">
                {activeTab === 'office' &&
                  modalData.officeStaff.map((staff, idx) => (
                    <div
                      key={idx}
                      className="bg-emerald-50/70 border-l-4 border-emerald-500 rounded-xl p-3 flex justify-between items-center shadow-2xs"
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {staff.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600">
                          {staff.time}
                        </span>
                        <Eye className="w-4 h-4 text-emerald-600 cursor-pointer hover:opacity-80" />
                      </div>
                    </div>
                  ))}

                {activeTab === 'offsite' &&
                  modalData.offsiteStaff.map((staff, idx) => (
                    <div
                      key={idx}
                      className="bg-cyan-50/70 border-l-4 border-cyan-500 rounded-xl p-3 flex justify-between items-center shadow-2xs"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">{staff.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{staff.note}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-mono text-cyan-600">{staff.time}</span>
                        <Eye className="w-4 h-4 text-cyan-600 cursor-pointer hover:opacity-80" />
                      </div>
                    </div>
                  ))}

                {activeTab === 'wfh' &&
                  modalData.wfhStaff.map((staff, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-50/70 border-l-4 border-amber-500 rounded-xl p-3 flex justify-between items-center shadow-2xs"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">{staff.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{staff.note}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-mono text-amber-600">{staff.time}</span>
                        <Eye className="w-4 h-4 text-amber-600 cursor-pointer hover:opacity-80" />
                      </div>
                    </div>
                  ))}

                {activeTab === 'trip' &&
                  modalData.tripStaff.map((staff, idx) => (
                    <div
                      key={idx}
                      className="bg-indigo-50/70 border-l-4 border-indigo-500 rounded-xl p-3 flex justify-between items-center shadow-2xs"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">{staff.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{staff.note}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-mono text-indigo-600">{staff.time}</span>
                        <Eye className="w-4 h-4 text-indigo-600 cursor-pointer hover:opacity-80" />
                      </div>
                    </div>
                  ))}

                {activeTab === 'leave' &&
                  modalData.leaveStaff.map((staff, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-50/70 border-l-4 border-purple-500 rounded-xl p-3 flex justify-between items-center shadow-2xs"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">{staff.name}</p>
                        <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
                          {staff.leaveType} - {staff.note}
                        </p>
                      </div>
                      <Eye className="w-4 h-4 text-purple-600 cursor-pointer hover:opacity-80" />
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Footer (Image 4 purple close button) */}
            <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50/30">
              <button
                onClick={() => setSelectedDay(null)}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

