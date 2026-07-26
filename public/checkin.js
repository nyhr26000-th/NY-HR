// --- CHECK-IN / ATTENDANCE MODULE ---
function renderCheckinPage() {
    const el = document.getElementById('content-checkin');
    if (!el) return;
    
    el.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
                <div class="space-y-2">
                    <h2 class="text-2xl font-black text-slate-800">ลงเวลาปฏิบัติงาน (Check-In / Out)</h2>
                    <p class="text-sm text-slate-500 font-medium">บันทึกเวลาปฏิบัติราชการ สสจ.นครนายก ด้วยพิกัดและภาพถ่ายแบบเรียลไทม์</p>
                </div>
                
                <div class="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 sm:p-6 max-w-sm mx-auto">
                    <div class="text-4xl font-mono font-black text-emerald-600 tracking-wider" id="live-clock">--:--:--</div>
                    <div class="text-xs text-slate-400 mt-1 font-bold">${formatDateLong(getCEDateString())}</div>
                </div>

                <div id="checkin-status-block" class="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 max-w-sm mx-auto text-amber-800 text-xs font-semibold hidden">
                    กรุณาอนุญาตพิกัดตำแหน่ง (GPS) เพื่อทำการลงเวลาทำงาน
                </div>

                <div class="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                    <button id="btn-checkin" onclick="openCameraForAttendance('CheckIn')" class="flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-md shadow-emerald-200 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        🌅 ลงเวลาเข้างาน
                    </button>
                    <button id="btn-checkout" onclick="openCameraForAttendance('CheckOut')" class="flex-1 py-4 px-6 bg-rose-600 hover:bg-rose-700 text-white font-black text-base rounded-2xl shadow-md shadow-rose-200 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        🌙 ลงเวลาเลิกงาน
                    </button>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 class="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span>ประวัติการลงเวลาทำงานวันนี้</span>
                    </h3>
                    <button onclick="loadTodayAttendanceState(false)" class="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50 transition" title="ดึงข้อมูลล่าสุด">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.228 10H18.228M4 4a9 9 0 018-4c4.14 0 7.5 3.36 7.5 7.5M4 4h5v5" /></svg>
                    </button>
                </div>
                <div id="checkin-history-today" class="space-y-3">
                    <div class="text-center py-6 text-slate-400 text-xs font-semibold">กำลังตรวจสอบข้อมูล...</div>
                </div>
            </div>
        </div>
    `;

    initCheckinPage();
}

function initCheckinPage() {
    // Setup live clock
    const clockEl = document.getElementById('live-clock');
    if (clockEl) {
        clearInterval(window.checkinClockInterval);
        window.checkinClockInterval = setInterval(() => {
            const clock = document.getElementById('live-clock');
            if (clock) clock.innerText = new Date().toLocaleTimeString('th-TH');
        }, 1000);
    }

    // Get current GPS location continuously
    if (navigator.geolocation) {
        if (checkinWatchId) navigator.geolocation.clearWatch(checkinWatchId);
        checkinWatchId = navigator.geolocation.watchPosition(
            (pos) => {
                checkinLat = pos.coords.latitude;
                checkinLng = pos.coords.longitude;
                const block = document.getElementById('checkin-status-block');
                if (block) block.classList.add('hidden');
            },
            (err) => {
                console.error("GPS Watch failed:", err);
                const block = document.getElementById('checkin-status-block');
                if (block) {
                    block.innerText = "ไม่สามารถรับพิกัดตำแหน่งได้ กรุณาเปิดระบบระบุตำแหน่ง GPS บนอุปกรณ์";
                    block.classList.remove('hidden');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        const block = document.getElementById('checkin-status-block');
        if (block) {
            block.innerText = "อุปกรณ์นี้ไม่รองรับระบบระบุตำแหน่ง GPS";
            block.classList.remove('hidden');
        }
    }

    loadTodayAttendanceState(true);
}

async function loadTodayAttendanceState(skipBackgroundFetch) {
    const historyContainer = document.getElementById('checkin-history-today');
    if (!historyContainer) return;

    if (!skipBackgroundFetch) {
        historyContainer.innerHTML = `<div class="text-center py-6 text-slate-400 text-xs font-semibold">กำลังโหลดข้อมูล...</div>`;
    }

    try {
        const response = await serverCall('getTodayAttendanceRealTime', currentUser.UserID);
        if (response && response.success) {
            const records = response.payload || [];
            if (records.length === 0) {
                historyContainer.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs font-semibold">ไม่มีรายการบันทึกของวันนี้ สามารถกดลงเวลาทำงานได้ทันที</div>`;
                return;
            }

            historyContainer.innerHTML = records.map(r => {
                const isCheckin = String(r.RecordType).toLowerCase().includes('in');
                const badgeStyle = isCheckin ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100';
                const timeLabel = isCheckin ? 'เข้างาน' : 'เลิกงาน';
                
                return `
                    <div class="border border-slate-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50 hover:bg-slate-50 transition">
                        <div class="flex items-center gap-3">
                            <span class="px-2.5 py-1 text-xs font-bold rounded-lg border ${badgeStyle}">${timeLabel}</span>
                            <div>
                                <p class="text-sm font-bold text-slate-800">${formatDateTimeThai(r.Timestamp)}</p>
                                <p class="text-xs text-slate-400 font-semibold">${r.Note || 'ไม่มีหมายเหตุ'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 self-end sm:self-auto">
                            ${r.PhotoUrl ? `
                                <button onclick="expandPhoto('${r.PhotoUrl}')" class="p-1 hover:bg-slate-200 rounded-lg transition" title="ดูภาพถ่าย">
                                    <img src="${getDirectImageUrl(r.PhotoUrl)}" class="w-8 h-8 rounded-lg object-cover border border-slate-200">
                                </button>
                            ` : ''}
                            <button onclick="showHistoryDetail('${escHtml(JSON.stringify(r))}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition">รายละเอียด</button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            historyContainer.innerHTML = `<div class="text-center py-6 text-rose-500 text-xs font-semibold">เกิดข้อผิดพลาดในการดึงข้อมูลวันนี้: ${response.message}</div>`;
        }
    } catch (e) {
        historyContainer.innerHTML = `<div class="text-center py-6 text-rose-500 text-xs font-semibold">ไม่สามารถติดต่อเซิร์ฟเวอร์ได้: ${e.message}</div>`;
    }
}

function openCameraForAttendance(type, targetAttendId, noteOverride) {
    if (!checkinLat || !checkinLng) {
        Swal.fire({
            icon: 'warning',
            title: 'พิกัด GPS ไม่พร้อมใช้งาน',
            text: 'กรุณารอระบบระบุตำแหน่ง GPS หรืออนุญาตให้เบราว์เซอร์เข้าถึงตำแหน่งที่ตั้ง แล้วลองใหม่อีกครั้ง',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }

    const typeLabel = type === 'CheckIn' ? 'ลงเวลาเข้างาน' : 'ลงเวลาเลิกงาน';
    
    Swal.fire({
        title: typeLabel,
        html: `
            <div class="space-y-4 text-center">
                <div class="relative max-w-xs mx-auto overflow-hidden bg-slate-900 rounded-2xl aspect-video flex items-center justify-center border border-slate-700 shadow-inner">
                    <video id="webcam" autoplay playsinline class="w-full h-full object-cover"></video>
                    <canvas id="photo-canvas" class="hidden"></canvas>
                    <div id="camera-loading" class="absolute inset-0 flex items-center justify-center text-white text-xs font-bold bg-slate-950/80">กำลังเปิดกล้อง...</div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 text-left mb-1">ระบุหมายเหตุ/กิจกรรม (ถ้ามี):</label>
                    <input id="attendance-note" type="text" value="${noteOverride || ''}" placeholder="ระบุปฏิบัติงาน ณ... / ทำความสะอาด / WFH..." class="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '📸 ถ่ายภาพและบันทึก',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: type === 'CheckIn' ? '#059669' : '#e11d48',
        cancelButtonColor: '#64748b',
        customClass: { popup: 'rounded-3xl' },
        didOpen: async () => {
            const video = document.getElementById('webcam');
            const loading = document.getElementById('camera-loading');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
                window.cameraStream = stream;
                if (video) {
                    video.srcObject = stream;
                    if (loading) loading.classList.add('hidden');
                }
            } catch (err) {
                console.error("Camera access failed:", err);
                if (loading) loading.innerText = "ไม่สามารถเชื่อมต่อกล้องถ่ายภาพได้ กรุณาตรวจสอบสิทธิ์กล้อง";
            }
        },
        willClose: () => {
            if (window.cameraStream) {
                window.cameraStream.getTracks().forEach(track => track.stop());
                window.cameraStream = null;
            }
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const video = document.getElementById('webcam');
            const canvas = document.getElementById('photo-canvas');
            const noteInput = document.getElementById('attendance-note');
            
            if (!video || !canvas) return;

            const ctx = canvas.getContext('2d');
            canvas.width = 320;
            canvas.height = 240;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Photo = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

            const note = noteInput ? noteInput.value.trim() : '';

            showLoading(true, "กำลังบันทึกเวลาทำงาน...");
            try {
                const payload = {
                    recordType: type,
                    latitude: checkinLat,
                    longitude: checkinLng,
                    note: note,
                    photoBase64: base64Photo,
                    attendId: targetAttendId || ''
                };
                
                const response = await serverCall(type === 'CheckIn' ? 'checkIn' : 'checkOut', payload, currentUser);
                showLoading(false);
                
                if (response && response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'บันทึกเวลาเรียบร้อย',
                        text: response.message,
                        timer: 2000,
                        showConfirmButton: false
                    });
                    loadTodayAttendanceState(false);
                    
                    // Trigger dynamic notification updates
                    updateNotificationBadge();
                } else {
                    Swal.fire('เกิดข้อผิดพลาด', response.message || 'บันทึกเวลาไม่สำเร็จ', 'error');
                }
            } catch (err) {
                showLoading(false);
                Swal.fire('ข้อผิดพลาด', err.message, 'error');
            }
        }
    });
}

function getDirectImageUrl(url) {
    if (!url) return '';
    if (url.includes('id=')) {
        const id = url.split('id=')[1];
        return `https://docs.google.com/uc?export=view&id=${id}`;
    }
    return url;
}

function expandPhoto(src) {
    Swal.fire({
        imageUrl: getDirectImageUrl(src),
        imageAlt: 'ภาพหลักฐานลงเวลาทำงาน',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: { image: 'rounded-2xl max-h-[70vh] object-contain' }
    });
}

function showHistoryDetail(jsonStr) {
    const r = JSON.parse(jsonStr);
    const isCheckin = String(r.RecordType).toLowerCase().includes('in');
    
    Swal.fire({
        title: isCheckin ? 'รายละเอียดการเข้างาน' : 'รายละเอียดการเลิกงาน',
        html: `
            <div class="text-left text-xs sm:text-sm space-y-3 p-2 font-medium">
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">ประเภท</span><span class="col-span-2 font-bold text-slate-800">${isCheckin ? 'เข้างาน' : 'เลิกงาน'}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">วันเวลา</span><span class="col-span-2 text-slate-800 font-mono">${formatDateTimeThai(r.Timestamp)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">พิกัด GPS</span><span class="col-span-2 text-indigo-600 font-mono font-bold">${r.Latitude}, ${r.Longitude}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">หมายเหตุ</span><span class="col-span-2 text-slate-800">${r.Note || '-'}</span></div>
                ${r.LocationVerified ? `<div class="bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-center font-bold text-xs">✅ ยืนยันตำแหน่งปฏิบัติงานในพิกัดเสาหลัก (สสจ.นครนายก)</div>` : `<div class="bg-amber-50 border border-amber-100 text-amber-800 p-2.5 rounded-xl text-center font-bold text-xs">📍 นอกสถานที่ตั้ง/นอกพิกัดระยะรัศมีเสาหลัก สสจ.</div>`}
            </div>
        `,
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'rounded-3xl' }
    });
}
