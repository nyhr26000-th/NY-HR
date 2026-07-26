// --- LEAVES (VACATION / SICK / PERSONAL LEAVE) MODULE ---
function renderLeavesPage() {
    const el = document.getElementById('content-leaves');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="space-y-1">
                    <h2 class="text-2xl font-black text-slate-800">ระบบบริหารวันลาพักผ่อน / ลากิจ / ลาป่วย</h2>
                    <p class="text-sm text-slate-500 font-medium">ยื่นใบลา ตรวจสอบสถิติการลา และประวัติวันลาคงเหลือสะสมของคุณ</p>
                </div>
                <button onclick="renderLeaveModal()" class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-md shadow-emerald-100 transition-all flex items-center gap-2">
                    ✍️ เขียนใบลาออนไลน์
                </button>
            </div>

            <div id="leaves-list-container">
                <div class="text-center py-12 text-slate-400 font-semibold text-xs">กำลังโหลดประวัติใบลา...</div>
            </div>
        </div>
    `;

    loadLeaveRecords();
}

async function loadLeaveRecords() {
    const container = document.getElementById('leaves-list-container');
    if (!container) return;

    try {
        const response = await serverCall('getLeaveRecords', currentUser);
        if (response && response.success) {
            appData.leaves = response.payload || [];
            renderLeavesList();
        } else {
            container.innerHTML = `<div class="text-center py-8 text-rose-500 text-xs font-semibold">เกิดข้อผิดพลาดในการโหลดข้อมูล: ${response.message}</div>`;
        }
    } catch (e) {
        container.innerHTML = `<div class="text-center py-8 text-rose-500 text-xs font-semibold">ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ระบบลาได้: ${e.message}</div>`;
    }
}

function renderLeavesList() {
    const container = document.getElementById('leaves-list-container');
    if (!container) return;

    const { mine, team } = splitMyAndTeam(appData.leaves, 'UserID');
    const activeTab = window._leavesTabActive || 'mine';

    let html = '';
    if (canSeeTeamData()) {
        html += renderTwoTabBar('ประวัติการลาของฉัน', mine.length, getTeamLabel(), team.length, 'window._leavesTabActive="mine";renderLeavesList();', 'window._leavesTabActive="team";renderLeavesList();', activeTab);
    }

    const currentRecords = activeTab === 'mine' ? mine : team;

    if (currentRecords.length === 0) {
        html += `<div class="bg-white border rounded-2xl py-12 text-center text-slate-400 font-semibold text-xs shadow-sm">ไม่มีประวัติใบลาคงเหลือให้แสดงผล</div>`;
        container.innerHTML = html;
        return;
    }

    html += `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100 text-left">
                    <thead class="bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                        <tr>
                            <th class="p-4 sm:p-5">ผู้ขอลา</th>
                            <th class="p-4 sm:p-5">ประเภทลา</th>
                            <th class="p-4 sm:p-5">วันที่ลา</th>
                            <th class="p-4 sm:p-5">จำนวนวัน</th>
                            <th class="p-4 sm:p-5">สถานะ</th>
                            <th class="p-4 sm:p-5 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700 text-xs sm:text-sm">
                        ${currentRecords.map(r => {
                            let statusBadge = '';
                            if (r.Status === 'Pending') {
                                statusBadge = `<span class="px-2.5 py-1 text-xs rounded-full font-bold border border-orange-100 bg-orange-50 text-orange-600">รออนุมัติ</span>`;
                            } else if (r.Status === 'Approved') {
                                statusBadge = `<span class="px-2.5 py-1 text-xs rounded-full font-bold border border-emerald-100 bg-emerald-50 text-emerald-600">อนุมัติแล้ว</span>`;
                            } else if (r.Status === 'Rejected') {
                                statusBadge = `<span class="px-2.5 py-1 text-xs rounded-full font-bold border border-rose-100 bg-rose-50 text-rose-600">ปฏิเสธ</span>`;
                            } else if (r.Status === 'Cancelled') {
                                statusBadge = `<span class="px-2.5 py-1 text-xs rounded-full font-bold border border-slate-100 bg-slate-50 text-slate-500">ยกเลิกแล้ว</span>`;
                            }

                            const isMine = String(r.UserID) === String(currentUser.UserID);
                            
                            return `
                                <tr class="hover:bg-slate-50/50 transition">
                                    <td class="p-4 sm:p-5 font-bold text-slate-800">${escHtml(r.FullName)}</td>
                                    <td class="p-4 sm:p-5 font-bold text-indigo-600">${escHtml(r.LeaveType)}</td>
                                    <td class="p-4 sm:p-5 font-medium">${formatDate(r.StartDate)} - ${formatDate(r.EndDate)}</td>
                                    <td class="p-4 sm:p-5 font-mono font-bold">${r.TotalDays} วัน</td>
                                    <td class="p-4 sm:p-5">${statusBadge}</td>
                                    <td class="p-4 sm:p-5 text-center">
                                        <div class="inline-flex gap-1.5">
                                            <button onclick="viewLeaveDetails('${escHtml(JSON.stringify(r))}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-xs">ข้อมูล</button>
                                            ${isMine && r.Status === 'Pending' ? `<button onclick="deleteLeave('${r.LeaveID}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg transition text-xs border border-rose-100">ลบ</button>` : ''}
                                            ${isMine && r.Status === 'Approved' ? `<button onclick="cancelApprovedLeave('${r.LeaveID}')" class="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg transition text-xs border border-orange-100">ขอยกเลิกลา</button>` : ''}
                                            <button onclick="handleGenerateDoc('${r.LeaveID}')" class="p-1.5 bg-slate-100 hover:bg-slate-200 text-indigo-600 rounded-lg transition" title="พิมพ์ใบลา PDF"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderLeaveModal() {
    Swal.fire({
        title: 'เขียนใบลาออนไลน์',
        html: `
            <form id="leave-form" class="text-left text-xs sm:text-sm space-y-4 max-w-xl mx-auto p-1 font-medium">
                <div>
                    <label class="block text-slate-600 font-bold mb-1">ประเภทวันลา:</label>
                    <select id="leave-type" required class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="ลาพักผ่อน">ลาพักผ่อน</option>
                        <option value="ลากิจส่วนตัว">ลากิจส่วนตัว</option>
                        <option value="ลาป่วย">ลาป่วย</option>
                        <option value="ลาคลอดบุตร">ลาคลอดบุตร</option>
                        <option value="ลาช่วยเหลือภริยาคลอดบุตร">ลาช่วยเหลือภริยาคลอดบุตร</option>
                        <option value="ลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล">ลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล</option>
                    </select>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">วันที่เริ่มต้นลา:</label>
                        <input id="leave-start-date" type="date" required value="${getCEDateString()}" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">วันที่สิ้นสุดลา:</label>
                        <input id="leave-end-date" type="date" required value="${getCEDateString()}" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    </div>
                </div>

                <div>
                    <label class="block text-slate-600 font-bold mb-1">เนื่องจาก/เหตุผลความจำเป็นในการลา:</label>
                    <textarea id="leave-reason" required placeholder="ระบุเหตุผลความจำเป็น เช่น เดินทางกลับภูมิลำเนาต่างจังหวัด / มีไข้สูง ปวดศีรษะ / ติดต่อทำธุระส่วนตัวที่อำเภอ..." class="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20"></textarea>
                </div>

                <div>
                    <label class="block text-slate-600 font-bold mb-1">บุคคลผู้ติดต่อได้และที่อยู่ระหว่างลา:</label>
                    <input id="leave-address" type="text" placeholder="ระบุที่อยู่พร้อมเบอร์โทรติดต่อ เช่น บ้านเลขที่ 99/9 ต.ท่าทราย อ.เมือง จ.นครนายก โทร 081-xxxxxxx" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: '✉️ ยื่นใบลาและส่งอนุมัติ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#64748b',
        customClass: { popup: 'rounded-3xl max-w-xl' },
        preConfirm: async () => {
            const form = document.getElementById('leave-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }

            const leaveType = document.getElementById('leave-type').value;
            const startDate = document.getElementById('leave-start-date').value;
            const endDate = document.getElementById('leave-end-date').value;
            const reason = document.getElementById('leave-reason').value;
            const address = document.getElementById('leave-address').value;

            // Calculate total days on client side for verification
            const totalDays = calculateDurationClientSide([{ start: startDate, end: endDate }], appData.appSettings?.holidays || []);

            if (totalDays <= 0) {
                Swal.showValidationMessage('ไม่พบวันทำการที่เป็นช่วงวันทำการปกติ กรุณาเลือกช่วงวันลาพักผ่อนใหม่ที่ถูกต้อง');
                return false;
            }

            return {
                leaveType,
                startDate,
                endDate,
                totalDays,
                reason,
                address
            };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            showLoading(true, "กำลังส่งใบลาเข้าระบบอนุมัติแบบดิจิทัล...");
            try {
                const response = await serverCall('saveLeaveRecord', result.value, currentUser);
                showLoading(false);
                if (response && response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'ยื่นใบลาสำเร็จ',
                        text: response.message,
                        timer: 2000,
                        showConfirmButton: false
                    });
                    loadLeaveRecords();
                    updateNotificationBadge();
                } else {
                    Swal.fire('ข้อผิดพลาด', response.message || 'บันทึกรายการลาไม่สำเร็จ', 'error');
                }
            } catch (err) {
                showLoading(false);
                Swal.fire('ข้อผิดพลาด', err.message, 'error');
            }
        }
    });
}

async function deleteLeave(id) {
    Swal.fire({
        title: 'ยืนยันการลบรายการลา?',
        text: 'ประวัติและข้อมูลใบลาฉบับนี้จะถูกลบออกจากระบบอย่างถาวร',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'ลบข้อมูลใบลา',
        cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
        if (result.isConfirmed) {
            showLoading(true, 'กำลังดำเนินการลบข้อมูล...');
            try {
                const response = await serverCall('deleteLeave', id, currentUser);
                showLoading(false);
                if (response && response.success) {
                    Swal.fire('สำเร็จ', response.message, 'success');
                    loadLeaveRecords();
                    updateNotificationBadge();
                } else {
                    Swal.fire('ข้อผิดพลาด', response.message, 'error');
                }
            } catch (e) {
                showLoading(false);
                Swal.fire('ข้อผิดพลาด', e.message, 'error');
            }
        }
    });
}

async function cancelApprovedLeave(recordId) {
    Swal.fire({
        title: 'ขอยกเลิกวันลาที่อนุมัติแล้ว?',
        text: 'ระบบจะยื่นคำขอ "ขอยกเลิกวันลา" ส่งไปยังกลุ่มงานทรัพยากรบุคคลและหัวหน้ากลุ่มงานของคุณเพื่อตรวจสอบพิจารณาอีกครั้ง',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'ยื่นคำขอยกเลิกวันลา',
        cancelButtonText: 'ปิด'
    }).then(async (result) => {
        if (result.isConfirmed) {
            showLoading(true, 'กำลังยื่นเรื่องยกเลิกวันลา...');
            try {
                const response = await serverCall('cancelApprovedLeave', recordId, currentUser);
                showLoading(false);
                if (response && response.success) {
                    Swal.fire('ยื่นเรื่องสำเร็จ', response.message, 'success');
                    loadLeaveRecords();
                    updateNotificationBadge();
                } else {
                    Swal.fire('ข้อผิดพลาด', response.message, 'error');
                }
            } catch (e) {
                showLoading(false);
                Swal.fire('ข้อผิดพลาด', e.message, 'error');
            }
        }
    });
}

function viewLeaveDetails(record) {
    const r = typeof record === 'string' ? JSON.parse(record) : record;
    Swal.fire({
        title: 'รายละเอียดบันทึกการลา',
        html: `
            <div class="text-left text-xs sm:text-sm space-y-3.5 p-1 max-h-[70vh] overflow-y-auto font-medium">
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">ผู้ยื่นคำลา</span><span class="col-span-2 font-bold text-slate-800">${escHtml(r.FullName)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">ประเภทการลา</span><span class="col-span-2 text-indigo-600 font-bold">${escHtml(r.LeaveType)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">วันที่ลา</span><span class="col-span-2 text-slate-800 font-bold">${formatDate(r.StartDate)} - ${formatDate(r.EndDate)} (${r.TotalDays} วัน)</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">เหตุผลความจำเป็น</span><span class="col-span-2 text-slate-800 whitespace-pre-line">${escHtml(r.Reason)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">ที่ติดต่อระหว่างลา</span><span class="col-span-2 text-slate-800">${escHtml(r.Address || '-')}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">สถานะอนุมัติ</span><span class="col-span-2 text-slate-800 font-bold">${escHtml(r.Status)} (ขั้นตอน: ${escHtml(r.WorkflowStep || '-')})</span></div>
            </div>
        `,
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#10b981',
        customClass: { popup: 'rounded-3xl max-w-xl' }
    });
}

async function handleGenerateDoc(leaveId) {
    showLoading(true, "กำลังประมวลผลคำขอเอกสารใบลาฉบับทางการ...");
    try {
        const response = await serverCall('generateLeavePdfOnServer', leaveId, currentUser);
        showLoading(false);
        if (response && response.success && response.fileUrl) {
            Swal.fire({
                icon: 'success',
                title: 'จัดเตรียมเอกสารสำเร็จ',
                html: `<p class="text-sm font-medium mb-4">ระบบได้ทำการสร้างใบลาและประทับตราอนุมัติแบบทางการเรียบร้อยแล้ว</p>
                       <a href="${response.fileUrl}" target="_blank" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md inline-block text-xs">📂 เปิดไฟล์ใบลา (PDF)</a>`,
                confirmButtonText: 'ปิด',
                confirmButtonColor: '#64748b',
                customClass: { popup: 'rounded-3xl' }
            });
        } else {
            Swal.fire('จัดทำเอกสารไม่สำเร็จ', response.message || 'ไม่มีสิทธิ์จัดทำหรือข้อมูลไม่ถูกต้อง', 'error');
        }
    } catch (e) {
        showLoading(false);
        Swal.fire('เกิดข้อผิดพลาด', e.message, 'error');
    }
}
