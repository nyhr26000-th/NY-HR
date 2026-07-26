import React from 'react';
import { UserAccount } from '../types';
import { LogOut, RefreshCw, Database, Settings, Shield, User } from 'lucide-react';

interface HeaderProps {
  user: UserAccount | null;
  onLogout: () => void;
  onRefresh: () => void;
  onOpenMigration: () => void;
  onOpenApiSettings: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onRefresh,
  onOpenMigration,
  onOpenApiSettings,
  onToggleSidebar,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Left Side Logo & Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <img
            src="https://img1.pic.in.th/images/moph.png"
            alt="MOPH Logo"
            className="h-10 w-auto flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          <div className="overflow-hidden">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">
              สำนักงานสาธารณสุขจังหวัดนครนายก
            </h1>
            <p className="text-xs text-emerald-600 font-medium hidden sm:block">
              ระบบบริหารงานบุคคล & Check-in / Drive Integration (nyhr26000@gmail.com)
            </p>
          </div>
        </div>

        {/* Right Side Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Drive Migration Tool Button */}
          {user && (user.Role === 'AdminHR' || user.Role === 'HR' || user.Role === 'Admin') && (
            <button
              onClick={onOpenMigration}
              className="flex items-center space-x-1 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-semibold shadow-sm transition"
              title="ย้ายข้อมูลจาก Google Drive บัญชีเดิม (arpasree104@gmail.com)"
            >
              <Database className="w-4 h-4 text-amber-600" />
              <span className="hidden lg:inline">ย้ายไฟล์ Drive เดิม</span>
            </button>
          )}

          {/* API Settings / GAS URL */}
          <button
            onClick={onOpenApiSettings}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition border border-slate-200"
            title="ตั้งค่า Web App API URL สำหรับ Vercel"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Clear Cache & Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition border border-slate-200"
            title="รีเฟรช / ล้าง Cache ความเร็ว"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Info & Logout */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-800">{user.FullName}</p>
                <p className="text-[10px] text-slate-500">{user.Role} - {user.Department}</p>
              </div>

              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user.FullName ? user.FullName.charAt(0) : <User className="w-4 h-4" />}
              </div>

              <button
                onClick={onLogout}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
              Guest Mode
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
