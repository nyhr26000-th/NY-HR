import React from 'react';
import { UserAccount } from '../types';
import { PenTool, CheckSquare, FileText, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface BatchSignModuleProps {
  user: UserAccount;
}

export const BatchSignModule: React.FC<BatchSignModuleProps> = ({ user }) => {
  const handleBatchSignAlert = () => {
    Swal.fire({
      title: 'แฟ้มรอลงนามเอกสาร',
      text: 'ระบบดึงเอกสาร PDF ใบลา คำขอไปราชการ และคำขอ WFH จาก Google Drive มายังหน้าต่างนี้เพื่อลงนามแบบรวมหลายรายการ',
      icon: 'info',
      confirmButtonText: 'รับทราบ'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PenTool className="w-6 h-6 text-indigo-600" />
            <span>แฟ้มรอลงนามเอกสาร (Batch E-Signature)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            เปิดตรวจสอบและประทับลายเซ็นอิเล็กทรอนิกส์ลงบน PDF โดยตรง
          </p>
        </div>

        <button
          onClick={handleBatchSignAlert}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          คู่มือการลงนาม
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-3">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">ไม่มีเอกสารค้างรอลงนามในขณะนี้</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          เมื่อมีคำขอใบลาหรือบันทึกไปราชการส่งมาถึงคุณ เอกสาร PDF จะปรากฏในแฟ้มนี้เพื่อให้คุณลงชื่อและส่งต่อได้ทันที
        </p>
      </div>
    </div>
  );
};
