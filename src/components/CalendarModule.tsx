import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, UserCheck, Plane, FileText } from 'lucide-react';

export const CalendarModule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              ปฏิทินการปฏิบัติงาน สสจ.นครนายก
            </h2>
            <p className="text-xs text-slate-500">
              {thaiMonths[month]} {year + 543}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-700 min-w-[120px] text-center">
            {thaiMonths[month]} {year + 543}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend Indicators */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>เข้างานปกติ</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>ลางาน</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <span>ไปราชการ</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>WFH</span>
        </span>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 py-2 border-b">
        {daysOfWeek.map((d, i) => (
          <div key={d} className={i === 0 || i === 6 ? 'text-rose-500' : ''}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before month start */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-100" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isToday =
            dayNum === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={`day-${dayNum}`}
              className={`h-20 p-2 rounded-xl border text-xs flex flex-col justify-between transition hover:border-emerald-400 cursor-pointer ${
                isToday
                  ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={isToday ? 'px-1.5 py-0.5 bg-emerald-600 text-white rounded-md text-[10px]' : ''}>
                  {dayNum}
                </span>
              </div>

              {/* Sample badges */}
              {dayNum % 5 === 0 && (
                <span className="px-1.5 py-0.5 text-[9px] bg-purple-100 text-purple-700 font-bold rounded truncate">
                  🍃 ลาพักผ่อน
                </span>
              )}
              {dayNum % 7 === 2 && (
                <span className="px-1.5 py-0.5 text-[9px] bg-indigo-100 text-indigo-700 font-bold rounded truncate">
                  ✈️ ไปราชการ
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
