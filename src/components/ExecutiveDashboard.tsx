import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { ApiService } from '../services/api';
import { Users, Clock, Plane, FileText, Calendar, BarChart3, RefreshCw, Filter } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

interface ExecutiveDashboardProps {
  user: UserAccount;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ user }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('');

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getHrExecutiveDashboardData({ department: departmentFilter });
      if (res.success && res.payload) {
        setData(res.payload);
      }
    } catch (err) {
      console.error('Failed to load HR Dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [departmentFilter]);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#64748b'];

  const sampleDeptData = [
    { name: 'บริหารทั่วไป', count: 28 },
    { name: 'พัฒนายุทธศาสตร์', count: 18 },
    { name: 'ส่งเสริมสุขภาพ', count: 24 },
    { name: 'สารสนเทศ', count: 12 },
    { name: 'อนามัยสิ่งแวดล้อม', count: 15 },
  ];

  const samplePersonnelTypeData = [
    { name: 'ข้าราชการ', value: 45 },
    { name: 'พนักงานราชการ', value: 20 },
    { name: 'พนักงานกระทรวงสาธารณสุข', value: 22 },
    { name: 'ลูกจ้างชั่วคราว', value: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>HR Executive Dashboard</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            สรุปภาพรวมกำลังคน การลงเวลาปฏิบัติงาน การลา และการไปราชการ สำนักงานสาธารณสุขจังหวัดนครนายก
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={isLoading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>โหลดข้อมูลล่าสุด</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">บุคลากรทั้งหมด</p>
            <p className="text-2xl font-extrabold text-slate-800">
              {data?.kpis?.totalUsers || 97} <span className="text-xs text-slate-400 font-normal">คน</span>
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">5 กลุ่มงานหลัก</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">มาปฏิบัติงานเดือนนี้</p>
            <p className="text-2xl font-extrabold text-slate-800">
              {data?.kpis?.attendanceDays || 1240} <span className="text-xs text-slate-400 font-normal">วัน-คน</span>
            </p>
            <p className="text-[10px] text-teal-600 font-semibold mt-0.5">สาย 14 ครั้ง (1.1%)</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">วันลาเดือนนี้</p>
            <p className="text-2xl font-extrabold text-slate-800">
              {data?.kpis?.totalLeaveDays || 38} <span className="text-xs text-slate-400 font-normal">วัน</span>
            </p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">พักผ่อน 24 / ป่วย 14</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
            <Plane className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">ไปราชการเดือนนี้</p>
            <p className="text-2xl font-extrabold text-slate-800">
              {data?.kpis?.totalTrips || 52} <span className="text-xs text-slate-400 font-normal">ครั้ง</span>
            </p>
            <p className="text-[10px] text-purple-600 font-semibold mt-0.5">ใน จ. 32 / นอก จ. 20</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Manpower Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">จํานวนบุคลากรจำแนกตามกลุ่มงาน</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.byDepartment ? Object.entries(data.charts.byDepartment).map(([name, count]) => ({ name, count })) : sampleDeptData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="จำนวนคน" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Personnel Type Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">สัดส่วนประเภทบุคลากร</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={samplePersonnelTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {samplePersonnelTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
