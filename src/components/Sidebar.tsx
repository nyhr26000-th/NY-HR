import React from 'react';
import { UserAccount } from '../types';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  FileText, 
  Home, 
  PenTool, 
  BarChart3, 
  Users, 
  FolderSync, 
  Settings as SettingsIcon,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  user: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMigration: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  isOpen,
  onClose,
  onOpenMigration,
}) => {
  const isHR = user && ['AdminHR', 'HR', 'Admin', 'Director', 'DeputyDirHR'].includes(user.Role);

  const menuItems = [
    { id: 'checkin', label: 'ลงเวลาปฏิบัติงาน (Check-in)', icon: Clock, badge: 'High-Speed' },
    { id: 'calendar', label: 'ปฏิทินปฏิบัติงาน', icon: Calendar },
    { id: 'offsite', label: 'บันทึกการไปราชการ', icon: MapPin },
    { id: 'leave', label: 'ระบบยื่นใบลา', icon: FileText },
    { id: 'wfh', label: 'ขออนุญาต WFH', icon: Home },
    { id: 'batchSign', label: 'แฟ้มรอลงนามเอกสาร', icon: PenTool },
  ];

  if (isHR) {
    menuItems.push({ id: 'dashboard', label: 'HR Executive Dashboard', icon: BarChart3 });
    menuItems.push({ id: 'migration', label: 'ย้ายข้อมูล Google Drive', icon: FolderSync });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between z-50 transition-transform duration-300 transform md:relative md:translate-x-0 border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
            <div>
              <h2 className="text-sm font-bold text-emerald-400 tracking-wide uppercase">
                ระบบ HR สสจ.นครนายก
              </h2>
              <p className="text-[11px] text-slate-400">Vercel + Google Sheet API</p>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-md"
            >
              &times;
            </button>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'migration') {
                      onOpenMigration();
                    } else {
                      onSelectTab(item.id);
                    }
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Account Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-200">Google Drive Account:</p>
            <p className="text-emerald-400 font-mono truncate">nyhr26000@gmail.com</p>
            <p className="text-[10px] text-slate-500">Sheet ID: 1gPcT9EfC6aZ...</p>
          </div>
        </div>
      </aside>
    </>
  );
};
