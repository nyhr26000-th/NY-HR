import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { UserAccount } from '../types';
import Swal from 'sweetalert2';
import { LogIn, Key, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginModuleProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginModule: React.FC<LoginModuleProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin1234');
  const [password, setPassword] = useState('admin1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน', 'warning');
      return;
    }

    setIsLoading(true);
    Swal.fire({
      title: 'กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res = await ApiService.login(username, password);
      Swal.close();

      if (res.success && res.user) {
        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: `ยินดีต้อนรับ ${res.user.FullName}`,
          timer: 1500,
          showConfirmButton: false
        });
        onLoginSuccess(res.user);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: res.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
        });
      }
    } catch (err: any) {
      Swal.close();
      Swal.fire('เกิดข้อผิดพลาดในการเชื่อมต่อ', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-8 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">
              ระบบบริหารงานบุคคล สสจ.นครนายก
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              MOPH High-Speed HR & Time Attendance Management
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">ชื่อผู้ใช้งาน (Username):</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้งาน"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">รหัสผ่าน (Password):</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </button>
          </div>
        </form>

        {/* Demo Creds Footer */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500 text-center space-y-1">
          <p className="font-bold text-slate-700">บัญชีสำหรับทดสอบระบบ (Demo User):</p>
          <p className="font-mono">Username: admin1234 / Password: admin1234</p>
        </div>
      </div>
    </div>
  );
};
