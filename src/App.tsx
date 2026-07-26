import React, { useState } from 'react';
import { MigrationModal } from './components/MigrationModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { Settings, Database } from 'lucide-react';

export default function App() {
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 font-sans">
      {/* Top System Utility Bar for Settings & Deployment Config */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs border-b border-slate-800 flex justify-between items-center z-50 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-200">สสจ.นครนายก (MOPH Official System)</span>
          <span className="text-slate-500 hidden sm:inline">| Google Sheets + Drive Connected</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsApiSettingsOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold transition border border-slate-700"
            title="ตั้งค่า Web App / Google Sheet API URL"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ตั้งค่า Google Sheet API URL</span>
          </button>

          <button
            onClick={() => setIsMigrationOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold transition border border-slate-700"
            title="ย้ายข้อมูล / ข้อมูลตัวอย่าง"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">การเชื่อมต่อ Google Drive</span>
          </button>
        </div>
      </div>

      {/* Main Full-Fidelity Application View */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
        <iframe
          id="main-app-frame"
          src="/app.html"
          className="w-full h-full border-none"
          title="สสจ.นครนายก Official System"
          allow="camera; geolocation; microphone; downloads"
        />
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

