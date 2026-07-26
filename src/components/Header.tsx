import React from 'react';
import { UserAccount } from '../types';
import { LogOut, RefreshCw, Database, Settings, Bell, Menu, User } from 'lucide-react';

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="w-full px-4 sm:px-6 py-2.5 flex justify-between items-center">
        {/* Left Side: Hamburger Menu Toggle Button & Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition focus:outline-none border border-slate-200 shadow-xs"
            title="ซ่อน / แสดง เมนู (Toggle Sidebar)"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight leading-tight">
              ระบบบริหารงานบุคคล สสจ.นครนายก
            </h1>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              MOPH Trip, Leaves, and Work From Home Administration System
            </p>
          </div>
        </div>

        {/* Right Side Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Drive Migration Tool Button */}
          {user && (user.Role === 'AdminHR' || user.Role === 'HR' || user.Role === 'Admin') && (
            <button
              onClick={onOpenMigration}
              className="hidden lg:flex items-center space-x-1 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-semibold shadow-xs transition"
              title="ย้ายข้อมูลจาก Google Drive บัญชีเดิม (arpasree104@gmail.com)"
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>ย้ายไฟล์ Drive</span>
            </button>
          )}

          {/* API Settings / GAS URL */}
          <button
            onClick={onOpenApiSettings}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition border border-slate-200 shadow-xs"
            title="ตั้งค่า Web App API URL"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Clear Cache & Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition border border-slate-200 shadow-xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notification Bell with Badge */}
          <button
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            title="การแจ้งเตือน"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-white shadow-xs">
              29
            </span>
          </button>

          {/* User Info & Logout Button */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.FullName ? user.FullName.charAt(0) : <User className="w-4 h-4" />}
              </div>

              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[160px]">
                  {user.FullName}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                  {user.Position || user.Role}
                </p>
              </div>

              <button
                onClick={onLogout}
                className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-xs transition"
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

