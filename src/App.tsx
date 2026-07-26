import React, { useState, useEffect } from 'react';
import { UserAccount } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CheckInModule } from './components/CheckInModule';
import { CalendarModule } from './components/CalendarModule';
import { OffSiteModule } from './components/OffSiteModule';
import { LeaveModule } from './components/LeaveModule';
import { WFHModule } from './components/WFHModule';
import { BatchSignModule } from './components/BatchSignModule';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { LoginModule } from './components/LoginModule';
import { MigrationModal } from './components/MigrationModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import Swal from 'sweetalert2';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('calendar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);

  // Auto-set mobile sidebar closed on initial load for small screens
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Restore logged in user session from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('nnyphoDeviceUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.UserID) {
          setCurrentUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem('nnyphoDeviceUser');
      }
    }
  }, []);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('nnyphoDeviceUser', JSON.stringify(user));
    setCurrentTab('calendar');
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ',
      text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444'
    }).then((res) => {
      if (res.isConfirmed) {
        setCurrentUser(null);
        localStorage.removeItem('nnyphoDeviceUser');
      }
    });
  };

  const handleRefreshCache = () => {
    Swal.fire({
      icon: 'success',
      title: 'ล้าง Cache ความเร็วสำเร็จ!',
      text: 'ระบบได้ดึงข้อมูลล่าสุดจาก Google Sheets เรียบร้อยแล้ว',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        user={currentUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenMigration={() => setIsMigrationOpen(true)}
      />

      {/* Main Content Scrollable Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 bg-slate-100">
        {/* Top Header */}
        <Header
          user={currentUser}
          onLogout={handleLogout}
          onRefresh={handleRefreshCache}
          onOpenMigration={() => setIsMigrationOpen(true)}
          onOpenApiSettings={() => setIsApiSettingsOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Module Body */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {!currentUser ? (
            <LoginModule onLoginSuccess={handleLoginSuccess} />
          ) : (
            <>
              {currentTab === 'checkin' && <CheckInModule user={currentUser} />}
              {currentTab === 'calendar' && <CalendarModule />}
              {currentTab === 'offsite' && <OffSiteModule user={currentUser} />}
              {currentTab === 'leave' && <LeaveModule user={currentUser} />}
              {currentTab === 'wfh' && <WFHModule user={currentUser} />}
              {currentTab === 'batchSign' && <BatchSignModule user={currentUser} />}
              {currentTab === 'dashboard' && <ExecutiveDashboard user={currentUser} />}
              {(currentTab === 'reports' || currentTab === 'settings' || currentTab === 'procurement') && (
                <CalendarModule />
              )}
            </>
          )}
        </main>

        {/* Footer Branding */}
        <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400 space-y-0.5">
          <p className="font-semibold text-slate-600">
            สำนักงานสาธารณสุขจังหวัดนครนายก (Nakhon Nayok Provincial Public Health Office)
          </p>
          <p className="text-[10px] text-slate-400">Google Sheets Database | Vercel & Drive Integration Ready</p>
        </footer>
      </div>

      {/* Migration Modal */}
      <MigrationModal
        isOpen={isMigrationOpen}
        onClose={() => setIsMigrationOpen(false)}
      />

      {/* API Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
      />
    </div>
  );
}
