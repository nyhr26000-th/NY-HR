import React from 'react';
import { UserAccount } from '../types';
import { 
  BarChart3, 
  Calendar, 
  PenTool, 
  Clock, 
  Home, 
  MapPin, 
  FileText, 
  FileBarChart, 
  Settings, 
  Package,
  X,
  User
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
  const isHR = user && ['AdminHR', 'HR', 'Admin', 'Director', 'DeputyDirHR', 'Executive', 'DeptHead'].includes(user.Role);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar', label: 'ปฏิทิน', icon: Calendar },
    { id: 'batchSign', label: 'แฟ้มรอลงนาม', icon: PenTool },
    { id: 'checkin', label: 'ลงเวลาทำงาน', icon: Clock, badge: 'High-Speed' },
    { id: 'wfh', label: 'WFH', icon: Home },
    { id: 'offsite', label: 'ไปราชการ', icon: MapPin },
    { id: 'leave', label: 'ระบบยื่นใบลา', icon: FileText },
    { id: 'reports', label: 'รายงาน', icon: FileBarChart },
    { id: 'settings', label: 'ตั้งค่าส่วนตัว', icon: Settings },
    { id: 'procurement', label: 'ระบบเสนอพัสดุ', icon: Package },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-between z-50 border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 ${
          isOpen
            ? 'w-64 translate-x-0 opacity-100'
            : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden md:pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Sidebar Branding Header */}
            <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-[#090d16]">
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                  ระบบปฏิบัติงาน สสอ.
                </h2>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  NN-YPHO Official System
                </p>
              </div>
              <button
                onClick={onClose}
                className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu Links */}
            <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
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
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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

          {/* Bottom User Card (Matching Image 3 & 4 bottom left) */}
          {user && (
            <div className="p-3 border-t border-slate-800/80 bg-[#090d16]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.FullName ? user.FullName.charAt(0) : <User className="w-4 h-4" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {user.FullName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                    {user.Position || user.Role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

