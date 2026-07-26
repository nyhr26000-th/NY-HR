import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { Settings, Save, CheckCircle, HelpCircle, ExternalLink } from 'lucide-react';
import Swal from 'sweetalert2';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [gasUrl, setGasUrl] = useState(ApiService.getApiUrl());

  if (!isOpen) return null;

  const handleSave = () => {
    ApiService.setApiUrl(gasUrl);
    Swal.fire({
      icon: 'success',
      title: 'บันทึก API URL สำเร็จ',
      text: 'ระบบจะใช้ Google Apps Script Endpoint นี้ในการรับส่งข้อมูล',
      timer: 1500,
      showConfirmButton: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 animate-scale-up">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                ตั้งค่า Google Apps Script Web App Endpoint
              </h3>
              <p className="text-xs text-slate-500">
                สำหรับใช้งาน Vercel Frontend เชื่อมต่อกับ Google Sheet/Drive (nyhr26000@gmail.com)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Google Apps Script Web App URL (doPost/doGet):
            </label>
            <input
              type="text"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-2 text-slate-600">
            <p className="font-bold text-indigo-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>วิธีรับ Web App URL จาก Google Apps Script:</span>
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-700">
              <li>คัดลอกไฟล์ <code className="bg-white px-1 py-0.5 rounded border">/gas/Code.gs</code> ไปใส่ใน Google Apps Script บัญชี <strong className="text-emerald-700">nyhr26000@gmail.com</strong></li>
              <li>กดปุ่ม <strong>Deploy (การทำให้ใช้งานได้)</strong> &rarr; <strong>New Deployment</strong></li>
              <li>เลือกประเภท: <strong>Web app</strong></li>
              <li>ตั้งค่า Execute as: <strong>Me (nyhr26000@gmail.com)</strong></li>
              <li>ตั้งค่า Who has access: <strong>Anyone (ทุกคน)</strong></li>
              <li>คัดลอก Web App URL ที่ได้มาใส่ในช่องด้านบนนี้</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่า</span>
          </button>
        </div>
      </div>
    </div>
  );
};
