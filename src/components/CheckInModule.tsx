import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, AttendanceRecord } from '../types';
import { ApiService } from '../services/api';
import Swal from 'sweetalert2';
import { Camera, Clock, MapPin, RefreshCw, CheckCircle2, AlertCircle, Sun, Sunrise, Sunset, Sparkles } from 'lucide-react';

interface CheckInModuleProps {
  user: UserAccount;
}

export const CheckInModule: React.FC<CheckInModuleProps> = ({ user }) => {
  const [workType, setWorkType] = useState<'normal' | 'offsite' | 'wfh'>('normal');
  const [offsiteTask, setOffsiteTask] = useState('');
  const [offsiteLocation, setOffsiteLocation] = useState('');
  const [timeString, setTimeString] = useState('');
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState<string>('กำลังค้นหาพิกัด GPS...');
  const [isGpsValid, setIsGpsValid] = useState<boolean>(false);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<'in' | 'in-afternoon' | 'out'>('in');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number>(1.1);
  const [clarity, setClarity] = useState<number>(1.05);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Office Coordinates (สสจ.นครนายก)
  const OFFICE_LAT = 14.2366800;
  const OFFICE_LNG = 101.2344368;
  const OFFICE_RADIUS_METERS = 50;

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeString(new Date().toLocaleTimeString('th-TH'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Geolocation Tracker
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('อุปกรณ์นี้ไม่รองรับ GPS Geolocation');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        // Calculate distance to Office
        const R = 6371e3;
        const lat1 = OFFICE_LAT * Math.PI / 180;
        const lat2 = lat * Math.PI / 180;
        const dl = (lat - OFFICE_LAT) * Math.PI / 180;
        const dL = (lng - OFFICE_LNG) * Math.PI / 180;
        const a = Math.sin(dl / 2) * Math.sin(dl / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dL / 2) * Math.sin(dL / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        setDistanceMeters(Math.round(dist));
        if (dist <= OFFICE_RADIUS_METERS) {
          setIsGpsValid(true);
          setLocationStatus(`📍 ในพื้นที่สำนักงาน (ห่าง ${Math.round(dist)} เมตร)`);
        } else {
          setIsGpsValid(false);
          setLocationStatus(`⚠️ นอกรัศมีสำนักงาน (ห่าง ${Math.round(dist)} เมตร - อนุญาตในรัศมี ${OFFICE_RADIUS_METERS}ม.)`);
        }
      },
      (err) => {
        setLocationStatus('⚠️ ไม่พบสัญญาณ GPS หรือผู้ใช้ไม่ได้เปิดสิทธิ์ระบุตำแหน่ง');
        setIsGpsValid(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Load Today Attendance Status
  const loadTodayState = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getTodayAttendance(user.UserID);
      if (res.success && res.payload) {
        setTodayAttendance(res.payload);
      }
    } catch (e: any) {
      console.error('Failed to load today state', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodayState();
  }, [user.UserID]);

  // Open Camera Stream
  const startCamera = async (type: 'in' | 'in-afternoon' | 'out') => {
    if (workType === 'normal' && !isGpsValid) {
      const confirmResult = await Swal.fire({
        title: 'อยู่นอกพื้นที่สำนักงาน',
        text: `ตำแหน่งปัจจุบันของคุณห่างจาก สสจ.นครนายก ${distanceMeters || '?'} เมตร (เกิน ${OFFICE_RADIUS_METERS}ม.) ต้องการสลับเป็น 'ปฏิบัติงานนอกพื้นที่' หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'สลับเป็นนอกพื้นที่',
        cancelButtonText: 'ยกเลิก'
      });

      if (confirmResult.isConfirmed) {
        setWorkType('offsite');
      } else {
        return;
      }
    }

    if (workType === 'offsite' && (!offsiteTask.trim() || !offsiteLocation.trim())) {
      Swal.fire('ข้อมูลไม่ครบ', 'กรุณาระบุเรื่องที่ปฏิบัติงานและสถานที่ติดต่อราชการ', 'warning');
      return;
    }

    setCameraType(type);
    setCapturedImage(null);
    setShowCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      Swal.fire('กล้องขัดข้อง', 'ไม่สามารถเปิดกล้องหน้าได้ กรุณาตรวจสอบการอนุญาตใช้งานกล้อง', 'error');
      setShowCamera(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCapturedImage(null);
  };

  // Capture Photo with Watermark
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 800;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror image for natural selfie feeling
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.filter = `brightness(${brightness}) contrast(${clarity})`;
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    // Watermark
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, height - 70, width, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Prompt, sans-serif';
    ctx.fillText(`สสจ.นครนายก - ${new Date().toLocaleString('th-TH')}`, 16, height - 40);
    ctx.font = '13px Prompt, sans-serif';
    ctx.fillText(`GPS: ${coords.lat?.toFixed(5) || '-'}, ${coords.lng?.toFixed(5) || '-'} | ${workType.toUpperCase()}`, 16, height - 16);

    const base64 = canvas.toDataURL('image/jpeg', 0.75);
    setCapturedImage(base64);
  };

  // Submit Check-in or Check-out
  const handleConfirmAttendance = async () => {
    if (!capturedImage) return;

    closeCamera();
    Swal.fire({
      title: 'กำลังบันทึกเวลาเข้า-ออกงาน...',
      text: 'ระบบทำงานความเร็วสูงกำลังประมวลผล',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const extraNotes = workType === 'offsite' ? `นอกพื้นที่: ${offsiteTask} @ ${offsiteLocation}` : '';

      if (cameraType === 'in' || cameraType === 'in-afternoon') {
        const payload = {
          session: cameraType === 'in-afternoon' ? 'noon' : 'morning',
          photo_base64: capturedImage,
          lat: coords.lat,
          lng: coords.lng,
          workType,
          notes: extraNotes
        };

        const res = await ApiService.checkIn(payload, user);
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'ลงเวลาเข้างานสำเร็จ!',
            text: `เวลา ${new Date().toLocaleTimeString('th-TH')}`,
            timer: 2000,
            showConfirmButton: false
          });
          loadTodayState();
        } else {
          Swal.fire('เกิดข้อผิดพลาด', res.message, 'error');
        }
      } else {
        const activeRec = todayAttendance.find((r) => !r.CheckOutTime);
        const attendId = activeRec ? activeRec.AttendID : '';

        const payload = {
          photo_base64: capturedImage,
          lat: coords.lat,
          lng: coords.lng,
          workType,
          notes: extraNotes
        };

        const res = await ApiService.checkOut(attendId, payload, user);
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'ลงเวลาออกงานสำเร็จ!',
            text: 'ขอบคุณสำหรับการปฏิบัติงานครับ',
            timer: 2000,
            showConfirmButton: false
          });
          loadTodayState();
        } else {
          Swal.fire('เกิดข้อผิดพลาด', res.message, 'error');
        }
      }
    } catch (err: any) {
      Swal.fire('เกิดข้อผิดพลาดในการเชื่อมต่อ', err.message, 'error');
    }
  };

  const todayRecord = todayAttendance.length > 0 ? todayAttendance[0] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Speed Tag */}
      <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>ลงเวลาปฏิบัติงาน (High-Speed Check-in)</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full">
              v6.0 Optimized
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            สำนักงานสาธารณสุขจังหวัดนครนายก - บันทึกลง Google Sheet Direct
          </p>
        </div>

        <button
          onClick={loadTodayState}
          className="p-2.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Main Checkin Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Work Type Options */}
        <div className="flex flex-wrap justify-center gap-3">
          <label
            className={`cursor-pointer px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              workType === 'normal'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <input
              type="radio"
              name="wt"
              value="normal"
              checked={workType === 'normal'}
              onChange={() => setWorkType('normal')}
              className="hidden"
            />
            🏢 ปฏิบัติงานปกติ ณ ที่ตั้ง
          </label>

          <label
            className={`cursor-pointer px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              workType === 'offsite'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <input
              type="radio"
              name="wt"
              value="offsite"
              checked={workType === 'offsite'}
              onChange={() => setWorkType('offsite')}
              className="hidden"
            />
            📍 ปฏิบัติงานนอกพื้นที่
          </label>

          <label
            className={`cursor-pointer px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              workType === 'wfh'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <input
              type="radio"
              name="wt"
              value="wfh"
              checked={workType === 'wfh'}
              onChange={() => setWorkType('wfh')}
              className="hidden"
            />
            🏠 ปฏิบัติงาน WFH
          </label>
        </div>

        {/* Offsite Details Inputs */}
        {workType === 'offsite' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 animate-fade-in">
            <input
              type="text"
              placeholder="1. เรื่อง/ภารกิจที่ไปปฏิบัติงานนอกพื้นที่"
              value={offsiteTask}
              onChange={(e) => setOffsiteTask(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="2. แผนก/หน่วยงาน/สถานที่ไปติดต่อราชการ"
              value={offsiteLocation}
              onChange={(e) => setOffsiteLocation(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Realtime Digital Clock */}
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-emerald-400 font-mono text-3xl font-black rounded-2xl shadow-inner border border-slate-800">
            <Clock className="w-7 h-7 text-emerald-500 animate-pulse" />
            <span>{timeString || '--:--:--'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">{locationStatus}</p>
        </div>

        {/* Action Buttons: Morning, Afternoon, Checkout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => startCamera('in')}
            disabled={!!(todayRecord && todayRecord.CheckInTime)}
            className={`py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition ${
              todayRecord && todayRecord.CheckInTime
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Sunrise className="w-5 h-5" />
            <span>🌅 เข้างาน (เช้า)</span>
          </button>

          <button
            onClick={() => startCamera('in-afternoon')}
            disabled={!!(todayRecord && todayRecord.CheckInTimeAfternoon)}
            className={`py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition ${
              todayRecord && todayRecord.CheckInTimeAfternoon
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span>☀️ เช็คอินบ่าย</span>
          </button>

          <button
            onClick={() => startCamera('out')}
            disabled={!todayRecord || !!todayRecord.CheckOutTime}
            className={`py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition ${
              !todayRecord || !!todayRecord.CheckOutTime
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Sunset className="w-5 h-5" />
            <span>🌙 เลิกงาน</span>
          </button>
        </div>
      </div>

      {/* Today's Status Log Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 border-b pb-3 mb-4">
          ประวัติการลงเวลาสำหรับวันนี้ ({new Date().toLocaleDateString('th-TH')})
        </h3>

        {todayRecord ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="font-bold text-emerald-800 block mb-1">🌅 เข้างานเช้า:</span>
              <p className="text-slate-700 font-mono text-sm">
                {todayRecord.CheckInTime
                  ? new Date(todayRecord.CheckInTime).toLocaleTimeString('th-TH')
                  : 'ยังไม่ได้ลงเวลา'}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="font-bold text-amber-800 block mb-1">☀️ เช็คอินบ่าย:</span>
              <p className="text-slate-700 font-mono text-sm">
                {todayRecord.CheckInTimeAfternoon
                  ? new Date(todayRecord.CheckInTimeAfternoon).toLocaleTimeString('th-TH')
                  : 'ยังไม่ได้ลงเวลา'}
              </p>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="font-bold text-indigo-800 block mb-1">🌙 เลิกงาน:</span>
              <p className="text-slate-700 font-mono text-sm">
                {todayRecord.CheckOutTime
                  ? new Date(todayRecord.CheckOutTime).toLocaleTimeString('th-TH')
                  : 'ยังไม่ได้ลงเวลา'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-sm">
            ยังไม่มีประวัติการลงเวลาในวันนี้
          </div>
        )}
      </div>

      {/* Selfie Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center p-4 space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <span>ถ่ายภาพเซลฟี่เพื่อยืนยันเวลา</span>
            </h3>

            {/* Video or Preview Canvas */}
            <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden border-2 border-emerald-500 shadow-lg">
              {!capturedImage ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                  style={{ filter: `brightness(${brightness}) contrast(${clarity})` }}
                />
              ) : (
                <img src={capturedImage} alt="Captured Selfie" className="w-full h-full object-cover" />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Beauty Controls */}
            {!capturedImage && (
              <div className="w-full space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>ความสว่าง:</span>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.05"
                    value={brightness}
                    onChange={(e) => setBrightness(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Camera Actions */}
            <div className="flex gap-3 w-full pt-2">
              {!capturedImage ? (
                <>
                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
                  >
                    📸 ถ่ายรูป
                  </button>
                  <button
                    onClick={closeCamera}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition"
                  >
                    ยกเลิก
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConfirmAttendance}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
                  >
                    ✅ ยืนยันบันทึกเวลา
                  </button>
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition"
                  >
                    ถ่ายใหม่
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
