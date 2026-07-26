// --- SYSTEM SETTINGS, PERSONAL SETTINGS & HR UTILITIES MODULE ---
function renderUsersPage(users) {
    const el = document.getElementById('content-users');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 class="text-2xl font-black text-slate-800">จัดการสิทธิ์ผู้ใช้งานและบุคลากร</h2>
                <p class="text-sm text-slate-500 font-medium">แต่งตั้งบทบาทผู้ตรวจอนุมัติกลุ่มงาน ฝ่ายทรัพยากรบุคคล (HR) หรือผู้บริหารระดับสูง (Director / Deputy)</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-100 text-left text-xs sm:text-sm">
                        <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b">
                            <tr>
                                <th class="p-4">บุคลากร</th>
                                <th class="p-4">ตำแหน่ง</th>
                                <th class="p-4">กลุ่มงาน</th>
                                <th class="p-4">ระดับบทบาท (Role)</th>
                                <th class="p-4 text-center">แก้ไขสิทธิ์</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${users.map(u => `
                                <tr class="hover:bg-slate-50/50 transition">
                                    <td class="p-4 font-bold text-slate-800">${escHtml(u.FullName)}</td>
                                    <td class="p-4 text-slate-500 font-medium">${escHtml(u.Position)}</td>
                                    <td class="p-4 text-slate-600">${escHtml(u.Department)}</td>
                                    <td class="p-4"><span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">${escHtml(u.Role)}</span></td>
                                    <td class="p-4 text-center">
                                        <button onclick="editUser('${escHtml(JSON.stringify(u))}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition">สิทธิ์บทบาท</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function editUser(jsonStr) {
    const u = JSON.parse(jsonStr);
    
    Swal.fire({
        title: 'กำหนดสิทธิ์บทบาทบุคลากร',
        html: `
            <div class="text-left text-xs sm:text-sm space-y-4 max-w-sm mx-auto font-medium p-1">
                <div>
                    <label class="block text-slate-500 font-bold mb-1">ชื่อบุคลากร:</label>
                    <div class="p-2.5 bg-slate-100 rounded-xl text-slate-800 font-bold">${escHtml(u.FullName)}</div>
                </div>
                <div>
                    <label class="block text-slate-500 font-bold mb-1">กลุ่มงาน:</label>
                    <div class="p-2.5 bg-slate-100 rounded-xl text-slate-700">${escHtml(u.Department)}</div>
                </div>
                <div>
                    <label class="block text-slate-600 font-bold mb-1">แต่งตั้งสิทธิ์บทบาท (Role):</label>
                    <select id="edit-user-role" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="User" ${u.Role === 'User' ? 'selected' : ''}>User (บุคลากรทั่วไป)</option>
                        <option value="DeptHead" ${u.Role === 'DeptHead' ? 'selected' : ''}>DeptHead (หัวหน้ากลุ่มงาน)</option>
                        <option value="DeputyDirDept" ${u.Role === 'DeputyDirDept' ? 'selected' : ''}>DeputyDirDept (รองนายแพทย์สาธารณสุขจังหวัด-ฝ่ายบริหารงานทั่วไป)</option>
                        <option value="DeputyDirHR" ${u.Role === 'DeputyDirHR' ? 'selected' : ''}>DeputyDirHR (รองนายแพทย์สาธารณสุขจังหวัด-ฝ่ายทรัพยากรบุคคล)</option>
                        <option value="Director" ${u.Role === 'Director' ? 'selected' : ''}>Director (นายแพทย์สาธารณสุขจังหวัดนครนายก)</option>
                        <option value="AdminHR" ${u.Role === 'AdminHR' ? 'selected' : ''}>AdminHR (ฝ่ายทรัพยากรบุคคลของสำนักงาน)</option>
                        <option value="Admin" ${u.Role === 'Admin' ? 'selected' : ''}>Admin (ผู้ดูแลระบบกลาง)</option>
                    </select>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '💾 บันทึกสิทธิ์ใหม่',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#64748b',
        customClass: { popup: 'rounded-3xl' }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const newRole = document.getElementById('edit-user-role').value;
            showLoading(true, "กำลังอัปเดตสิทธิ์บทบาทในฐานข้อมูล...");
            try {
                const response = await serverCall('updateUserRole', { targetUserId: u.UserID, newRole }, currentUser);
                showLoading(false);
                if (response && response.success) {
                    Swal.fire('สำเร็จ', response.message, 'success');
                    // Refresh users data
                    const uRes = await serverCall('getUsersList', currentUser);
                    if (uRes.success) {
                        appData.users = uRes.payload || [];
                        renderUsersPage(appData.users);
                    }
                } else {
                    Swal.fire('เกิดข้อผิดพลาด', response.message, 'error');
                }
            } catch (e) {
                showLoading(false);
                Swal.fire('เกิดข้อผิดพลาด', e.message, 'error');
            }
        }
    });
}

function renderSettingsPage(settings) {
    const el = document.getElementById('content-settings');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 class="text-2xl font-black text-slate-800">ตั้งค่าระบบส่วนกลาง (Admin Settings)</h2>
                <p class="text-sm text-slate-500 font-medium">กำหนดวันหยุดนักขัตฤกษ์ และจังหวัดปลายทางสำหรับบันทึกสั่งราชการ</p>
            </div>

            <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">วันหยุดราชการ/วันหยุดนักขัตฤกษ์ (YYYY-MM-DD เรียงลำดับคั่นด้วยจุลภาค):</label>
                    <textarea id="settings-holidays" class="w-full p-4 border border-slate-300 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28 font-mono text-sm" placeholder="2026-01-01, 2026-04-13, 2026-04-14, 2026-05-01">${(settings.holidays || []).join(', ')}</textarea>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">รายชื่อจังหวัดเดินทางปลายทางที่ระบุได้ (คั่นด้วยจุลภาค):</label>
                    <textarea id="settings-provinces" class="w-full p-4 border border-slate-300 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28 font-mono text-sm" placeholder="นครนายก, กรุงเทพมหานคร, ปทุมธานี, นนทบุรี, สมุทรปราการ">${(settings.provinces || []).join(', ')}</textarea>
                </div>

                <div class="flex justify-end pt-4 border-t border-slate-100">
                    <button onclick="saveSettings()" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-md transition">💾 บันทึกการกำหนดค่า</button>
                </div>
            </div>
        </div>
    `;
}

async function saveSettings() {
    const holidaysInput = document.getElementById('settings-holidays').value;
    const provincesInput = document.getElementById('settings-provinces').value;

    const holidays = holidaysInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const provinces = provincesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

    showLoading(true, "กำลังอัปโหลดโครงร่างตั้งค่าระบบส่วนกลาง...");
    try {
        const response = await serverCall('saveSystemSettings', { holidays, provinces }, currentUser);
        showLoading(false);
        if (response && response.success) {
            Swal.fire('บันทึกสำเร็จ', response.message, 'success');
            appData.appSettings = { holidays, provinces };
        } else {
            Swal.fire('ล้มเหลว', response.message, 'error');
        }
    } catch (e) {
        showLoading(false);
        Swal.fire('ข้อผิดพลาด', e.message, 'error');
    }
}

function renderPersonalSettingsPage() {
    const el = document.getElementById('content-personalSettings');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 class="text-2xl font-black text-slate-800">ตั้งค่าส่วนตัวผู้ใช้งาน (Personal Profile)</h2>
                <p class="text-sm text-slate-500 font-medium">ตรวจสอบข้อมูลประวัติ หรือลงทะเบียนสลักตราลายมือชื่อดิจิทัลของคุณ</p>
            </div>

            <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-bold text-slate-600 mb-1">ชื่อ-นามสกุล:</label>
                        <div class="p-3 bg-slate-50 border rounded-xl text-slate-800 font-bold">${escHtml(currentUser.FullName)}</div>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-600 mb-1">ตำแหน่งทางการ:</label>
                        <div class="p-3 bg-slate-50 border rounded-xl text-slate-700">${escHtml(currentUser.Position)}</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-bold text-slate-600 mb-1">กลุ่มงาน/สังกัดฝ่าย:</label>
                        <div class="p-3 bg-slate-50 border rounded-xl text-slate-700">${escHtml(currentUser.Department)}</div>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-600 mb-1">ระดับสิทธิ์การใช้งาน:</label>
                        <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-black">${escHtml(currentUser.Role)}</div>
                    </div>
                </div>

                <div class="border-t border-slate-100 pt-6 space-y-4 text-center">
                    <h3 class="text-left font-bold text-slate-800 text-sm">✍️ ตราลายเซ็นอิเล็กทรอนิกส์ส่วนตัว</h3>
                    <div class="relative w-full max-w-sm mx-auto h-40 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden cursor-crosshair">
                        <canvas id="personal-signature-canvas" class="w-full h-full touch-none"></canvas>
                    </div>
                    <div class="flex justify-center gap-3">
                        <button id="btn-clear-pers-sig" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">🧹 ล้างวาดใหม่</button>
                        <button onclick="savePersonalSignature()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition">💾 เซฟและเปิดใช้งานลายเซ็น</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    initPersonalSignatureCanvas();
}

function initPersonalSignatureCanvas() {
    const canvas = document.getElementById('personal-signature-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    function getTouchPos(touchEvent) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastX = x;
        lastY = y;
    });

    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);

    canvas.addEventListener('touchstart', (e) => {
        drawing = true;
        const pos = getTouchPos(e);
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!drawing) return;
        const pos = getTouchPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', () => drawing = false);

    document.getElementById('btn-clear-pers-sig').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

async function savePersonalSignature() {
    const canvas = document.getElementById('personal-signature-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    const isBlank = !buffer.some(color => color !== 0);

    if (isBlank) {
        Swal.fire('ลายเซ็นว่างเปล่า', 'กรุณาเซ็นชื่อลงในกรอบวาดลายเซ็นก่อนทำการกดยืนยันบันทึก', 'warning');
        return;
    }

    const signatureBase64 = canvas.toDataURL('image/png').split(',')[1];
    
    showLoading(true, "กำลังอัปโหลดสลักชื่อดิจิทัลเข้าสู่โปรไฟล์...");
    try {
        const response = await serverCall('savePersonalSignature', { signatureBase64 }, currentUser);
        showLoading(false);
        if (response && response.success) {
            Swal.fire('ลงทะเบียนลายเซ็นสำเร็จ', response.message, 'success');
        } else {
            Swal.fire('เกิดข้อผิดพลาด', response.message, 'error');
        }
    } catch (e) {
        showLoading(false);
        Swal.fire('เกิดข้อผิดพลาด', e.message, 'error');
    }
}

function renderLeaveEntitlementBulkPage() {
    const el = document.getElementById('content-leaveEntitlementBulk');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 class="text-2xl font-black text-slate-800">บันทึกสถิติและโควตาวันลาสะสม (HR Utility)</h2>
                <p class="text-sm text-slate-500 font-medium font-bold">บันทึกประวัติวันลาคงค้างสะสม หรือแก้ไขกำหนดโควตาพักผ่อนรายปีของข้าราชการ/ลูกจ้าง</p>
            </div>

            <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <form id="bulk-leave-form" class="space-y-4 text-left text-xs sm:text-sm font-medium">
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">เลือกบุคลากรเป้าหมาย:</label>
                        <select id="bulk-leave-user" required class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <!-- Populated dynamically with users list -->
                        </select>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-slate-600 font-bold mb-1">วันลาพักผ่อนสะสมปีนี้ (คงเหลือยกยอดมาจากปีที่แล้ว):</label>
                            <input id="bulk-leave-accumulated" type="number" required min="0" max="30" value="0" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold font-mono">
                        </div>
                        <div>
                            <label class="block text-slate-600 font-bold mb-1">โควตาลาพักผ่อนที่ได้รับปีปัจจุบัน (ปกติคือ 10 วันทำการ):</label>
                            <input id="bulk-leave-entitled" type="number" required min="10" max="10" value="10" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold font-mono">
                        </div>
                    </div>

                    <div class="flex justify-end pt-4 border-t border-slate-100">
                        <button type="submit" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-md transition">💾 อัปเดตข้อมูลสถิติวันลาสะสม</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Populate user selection dropdown
    const select = document.getElementById('bulk-leave-user');
    if (select && appData.users) {
        select.innerHTML = appData.users.map(u => `<option value="${u.UserID}">${escHtml(u.FullName)} (${escHtml(u.Department)} / ${escHtml(u.Position)})</option>`).join('');
    }

    // Submit handler
    const form = document.getElementById('bulk-leave-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const targetUserId = document.getElementById('bulk-leave-user').value;
            const accumulatedDays = document.getElementById('bulk-leave-accumulated').value;
            const entitledDays = document.getElementById('bulk-leave-entitled').value;

            showLoading(true, "กำลังแก้ไขข้อมูลสถิติประวัติสะสมโควตาลา...");
            try {
                const response = await serverCall('saveLeaveEntitlements', { targetUserId, accumulatedDays, entitledDays }, currentUser);
                showLoading(false);
                if (response && response.success) {
                    Swal.fire('อัปเดตข้อมูลสำเร็จ', response.message, 'success');
                } else {
                    Swal.fire('ล้มเหลว', response.message, 'error');
                }
            } catch (err) {
                showLoading(false);
                Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
            }
        });
    }
}
