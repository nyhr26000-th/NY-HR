import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { MigrationResult } from '../types';
import { FolderSync, CheckCircle, AlertTriangle, ExternalLink, Loader2, HardDrive, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  if (!isOpen) return null;

  const handleStartMigration = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const res = await ApiService.migrateOldFoldersToNewAccount();
      setResult(res);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'ย้ายข้อมูลสำเร็จ!',
          text: `คัดลอกไฟล์เรียบร้อยแล้วทั้งหมด ${res.copiedFilesCount || 0} ไฟล์`,
          confirmButtonText: 'ตกลง'
        });
      } else {
        Swal.fire('การย้ายข้อมูลล้มเหลว', res.message, 'error');
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'เกิดข้อผิดพลาดในการย้ายข้อมูล',
        details: [err.message]
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-scale-up">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <FolderSync className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                ระบบย้ายไฟล์อัตโนมัติ (Google Drive Migration Tool)
              </h3>
              <p className="text-xs text-slate-500">
                ย้ายไฟล์จาก arpasree104@gmail.com &rarr; nyhr26000@gmail.com
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="text-slate-400 hover:text-slate-600 p-1 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Info & Source Folder Details */}
        <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>โฟลเดอร์ต้นทางที่เตรียมย้ายข้อมูล (Shared Folders):</span>
          </p>
          <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-slate-700">
            <li>
              Folder 1: <span className="text-amber-700">1lO3wm5XZpnZ4aq7LVmO1vj1__0l2AIJt</span>
            </li>
            <li>
              Folder 2: <span className="text-amber-700">1EnY73K4NaAGCbopf3HwgxFAHBQnr0AKl</span>
            </li>
          </ul>
          <p className="text-slate-500">
            * ระบบจะทำการสร้างโฟลเดอร์ปลายทางใหม่ชื่อ <strong className="text-emerald-700">สสจ.นย_เอกสารบันทึกไปราชการ_NEW</strong> ภายใต้บัญชี <strong className="text-emerald-700">nyhr26000@gmail.com</strong> พร้อมกำหนดสิทธิ์เปิดอ่านสาธารณะอัตโนมัติ
          </p>
        </div>

        {/* Live Execution Status or Result Logs */}
        {result && (
          <div className={`p-4 rounded-xl border space-y-2 text-xs ${result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-center space-x-2 font-bold text-sm">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
              <span className={result.success ? 'text-emerald-800' : 'text-rose-800'}>
                {result.message}
              </span>
            </div>

            {result.copiedFilesCount !== undefined && (
              <p className="text-slate-700">
                จำนวนไฟล์ที่คัดลอกสำเร็จ: <strong className="text-emerald-700 font-mono text-sm">{result.copiedFilesCount}</strong> ไฟล์ ใน <strong className="text-emerald-700 font-mono text-sm">{result.copiedFoldersCount}</strong> โฟลเดอร์
              </p>
            )}

            {result.destinationFolderUrl && (
              <a
                href={result.destinationFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 font-bold hover:underline pt-1"
              >
                <span>เปิดโฟลเดอร์ Google Drive ปลายทาง</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Execution logs */}
            {result.details && result.details.length > 0 && (
              <div className="mt-3 bg-slate-900 text-slate-300 font-mono p-3 rounded-lg max-h-36 overflow-y-auto text-[11px] space-y-1">
                {result.details.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            disabled={isRunning}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            ปิดหน้านี้
          </button>

          <button
            onClick={handleStartMigration}
            disabled={isRunning}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังย้ายข้อมูล...</span>
              </>
            ) : (
              <>
                <FolderSync className="w-4 h-4" />
                <span>เริ่มย้ายข้อมูลทันที</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
