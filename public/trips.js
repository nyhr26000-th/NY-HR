// --- OFFICIAL TRIP RECORDS (ไปราชการ) MODULE ---
function renderRecordsPage(records) {
    const el = document.getElementById('content-records');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="space-y-1">
                    <h2 class="text-2xl font-black text-slate-800">ระบบขออนุมัติไปปฏิบัติราชการ</h2>
                    <p class="text-sm text-slate-500 font-medium">จัดการ บันทึก ตรวจสอบสถานะการขออนุมัติเดินทางไปราชการในและต่างจังหวัด</p>
                </div>
                <button onclick="renderRecordModal()" class="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-md shadow-indigo-100 transition-all flex items-center gap-2">
                    ➕ สร้างใบขออนุมัติไปราชการ
                </button>
            </div>

            <div id="records-list-container">
                <div class="text-center py-12 text-slate-400 font-semibold text-xs">กำลังโหลดรายการขอไปราชการ...</div>
            </div>
        </div>
    `;

    loadRecordRecords();
}

async function loadRecordRecords() {
    const container = document.getElementById('records-list-container');
    if (!container) return;

    try {
        const response = await serverCall('getOffSiteRecords', currentUser);
        if (response && response.success) {
            appData.records = response.payload || [];
            renderRecordsList();
        } else {
            container.innerHTML = `<div class="text-center py-8 text-rose-500 text-xs font-semibold">เกิดข้อผิดพลาด: ${response.message}</div>`;
        }
    } catch (e) {
        container.innerHTML = `<div class="text-center py-8 text-rose-500 text-xs font-semibold">ไม่สามารถเชื่อมต่อระบบขอไปราชการได้: ${e.message}</div>`;
    }
}

function renderRecordsList() {
    const container = document.getElementById('records-list-container');
    if (!container) return;

    const { mine, team } = splitMyAndTeam(appData.records, 'UserID');
    const activeTab = window._recordsTabActive || 'mine';

    let html = '';
    if (canSeeTeamData()) {
        html += renderTwoTabBar('รายการขอไปราชการของฉัน', mine.length, getTeamLabel(), team.length, 'window._recordsTabActive="mine";renderRecordsList();', 'window._recordsTabActive="team";renderRecordsList();', activeTab);
    }

    const currentRecords = activeTab === 'mine' ? mine : team;

    if (currentRecords.length === 0) {
        html += `<div class="bg-white border rounded-2xl py-12 text-center text-slate-400 font-semibold text-xs shadow-sm">ไม่มีข้อมูลประวัติรายการเดินทางไปราชการของคุณ</div>`;
        container.innerHTML = html;
        return;
    }

    html += `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100 text-left">
                    <thead class="bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                        <tr>
                            <th class="p-4 sm:p-5">ผู้ขออนุญาต</th>
                            <th class="p-4 sm:p-5">สถานที่ไปราชการ</th>
                            <th class="p-4 sm:p-5">ช่วงวันที่</th>
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
                            } else if (r.Status === 'Returned') {
                                statusBadge = `<span class="px-2.5 py-1 text-xs rounded-full font-bold border border-blue-100 bg-blue-50 text-blue-600">แก้ไขเพิ่มเติม</span>`;
                            }

                            const isMine = String(r.UserID) === String(currentUser.UserID);
                            
                            return `
                                <tr class="hover:bg-slate-50/50 transition">
                                    <td class="p-4 sm:p-5 font-bold text-slate-800">${escHtml(r.FullName)}</td>
                                    <td class="p-4 sm:p-5 font-bold text-indigo-600">${escHtml(r.Place)}</td>
                                    <td class="p-4 sm:p-5 font-medium">${formatDate(r.StartDate)} - ${formatDate(r.EndDate)}</td>
                                    <td class="p-4 sm:p-5 font-mono font-bold">${r.TotalDays} วัน</td>
                                    <td class="p-4 sm:p-5">${statusBadge}</td>
                                    <td class="p-4 sm:p-5 text-center">
                                        <div class="inline-flex gap-1.5">
                                            <button onclick="renderDetailsModal('${r.RecordID}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-xs">ข้อมูล</button>
                                            ${isMine && (r.Status === 'Pending' || r.Status === 'Returned') ? `<button onclick="renderRecordModal('${r.RecordID}')" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg transition text-xs border border-indigo-100">แก้ไข</button>` : ''}
                                            <button onclick="handleGenerateDocWord('${r.RecordID}')" class="p-1.5 bg-slate-100 hover:bg-slate-200 text-indigo-600 rounded-lg transition" title="ดาวน์โหลดใบสั่งราชการ (.docx)"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
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

function renderRecordModal(recordId) {
    const isEdit = !!recordId;
    const r = isEdit ? appData.records.find(item => item.RecordID === recordId) : null;
    
    Swal.fire({
        title: isEdit ? 'แก้ไขใบขออนุมัติไปราชการ' : 'ขออนุมัติเดินทางไปปฏิบัติราชการ',
        html: `
            <form id="record-form" class="text-left text-xs sm:text-sm space-y-4 max-w-xl mx-auto p-1 font-medium">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">ประเภทจังหวัด:</label>
                        <select id="record-travel-type" required class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="ในจังหวัด" ${r && r.TravelType === 'ในจังหวัด' ? 'selected' : ''}>ในจังหวัด</option>
                            <option value="นอกจังหวัด" ${r && r.TravelType === 'นอกจังหวัด' ? 'selected' : ''}>นอกจังหวัด</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">ประเภทงบประมาณ:</label>
                        <select id="record-budget-type" required class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="ไม่เบิก" ${r && r.BudgetType === 'ไม่เบิก' ? 'selected' : ''}>ไม่เบิกงบประมาณ</option>
                            <option value="เงินบำรุง" ${r && r.BudgetType === 'เงินบำรุง' ? 'selected' : ''}>เงินบำรุง</option>
                            <option value="งบประมาณแผ่นดิน" ${r && r.BudgetType === 'งบประมาณแผ่นดิน' ? 'selected' : ''}>งบประมาณแผ่นดิน</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">วันที่เริ่มต้น:</label>
                        <input id="record-start-date" type="date" required value="${isEdit ? formatInputDate(r.StartDate) : getCEDateString()}" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">วันที่สิ้นสุด:</label>
                        <input id="record-end-date" type="date" required value="${isEdit ? formatInputDate(r.EndDate) : getCEDateString()}" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>

                <div>
                    <label class="block text-slate-600 font-bold mb-1">สถานที่ไปราชการ (รายละเอียดปลายทาง):</label>
                    <input id="record-place" type="text" required value="${isEdit ? escHtml(r.Place) : ''}" placeholder="ระบุเช่น ณ โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านดง ต.สาริกา อ.เมือง" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>

                <div>
                    <label class="block text-slate-600 font-bold mb-1">เรื่อง/วัตถุประสงค์ในการไปราชการครั้งนี้:</label>
                    <textarea id="record-purpose" required placeholder="เช่น เพื่อร่วมประชุมชี้แจงแนวทางการดำเนินงานกองทุนหลักประกันสุขภาพระดับท้องถิ่น และประเมินผลการจัดระบบบริการสุขภาพปฐมภูมิ..." class="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20">${isEdit ? escHtml(r.Purpose) : ''}</textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">พาหนะเดินทาง:</label>
                        <select id="record-vehicle" required class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="รถยนต์ส่วนกลาง" ${r && r.Vehicle === 'รถยนต์ส่วนกลาง' ? 'selected' : ''}>รถยนต์ส่วนกลาง</option>
                            <option value="รถยนต์ส่วนบุคคล" ${r && r.Vehicle === 'รถยนต์ส่วนบุคคล' ? 'selected' : ''}>รถยนต์ส่วนบุคคล</option>
                            <option value="รถโดยสารประจำทาง" ${r && r.Vehicle === 'รถโดยสารประจำทาง' ? 'selected' : ''}>รถโดยสารประจำทาง</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">จังหวัดปลายทาง:</label>
                        <select id="record-province" required class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <!-- Populated on open based on app settings -->
                        </select>
                    </div>
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: isEdit ? '💾 บันทึกการแก้ไข' : '✉️ ยื่นใบคำขอ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#64748b',
        customClass: { popup: 'rounded-3xl max-w-2xl' },
        didOpen: () => {
            const provSelect = document.getElementById('record-province');
            if (provSelect && appData.appSettings && appData.appSettings.provinces) {
                provSelect.innerHTML = appData.appSettings.provinces.map(p => `<option value="${p}" ${r && r.Province === p ? 'selected' : ''}>${p}</option>`).join('');
            }
        },
        preConfirm: async () => {
            const form = document.getElementById('record-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }

            const travelType = document.getElementById('record-travel-type').value;
            const budgetType = document.getElementById('record-budget-type').value;
            const startDate = document.getElementById('record-start-date').value;
            const endDate = document.getElementById('record-end-date').value;
            const place = document.getElementById('record-place').value;
            const purpose = document.getElementById('record-purpose').value;
            const vehicle = document.getElementById('record-vehicle').value;
            const province = document.getElementById('record-province').value;

            const totalDays = calculateDurationClientSide([{ start: startDate, end: endDate }], appData.appSettings?.holidays || []);

            if (totalDays <= 0) {
                Swal.showValidationMessage('ไม่พบวันทำการที่เดินทางจริง กรุณาเลือกวันที่เป็นวันปกติ');
                return false;
            }

            return {
                travelType,
                budgetType,
                startDate,
                endDate,
                totalDays,
                place,
                purpose,
                vehicle,
                province,
                recordID: isEdit ? r.RecordID : ''
            };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            showLoading(true, "กำลังบันทึกคำขอไปราชการ...");
            try {
                const response = await serverCall('saveRecord', result.value, currentUser);
                showLoading(false);
                if (response && response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'ยื่นคำขอสำเร็จแล้ว',
                        text: response.message,
                        timer: 2000,
                        showConfirmButton: false
                    });
                    loadRecordRecords();
                    updateNotificationBadge();
                } else {
                    Swal.fire('ข้อผิดพลาด', response.message || 'บันทึกคำขอไม่สำเร็จ', 'error');
                }
            } catch (err) {
                showLoading(false);
                Swal.fire('ข้อผิดพลาด', err.message, 'error');
            }
        }
    });
}

function renderDetailsModal(recordId) {
    const r = appData.records.find(item => item.RecordID === recordId);
    if (!r) return;

    Swal.fire({
        title: 'รายละเอียดคำขอไปราชการ',
        html: `
            <div class="text-left text-xs sm:text-sm space-y-3.5 p-1 max-h-[70vh] overflow-y-auto font-medium">
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">ผู้ยื่นคำขอ</span><span class="col-span-2 font-bold text-slate-800">${escHtml(r.FullName)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">กลุ่มงาน</span><span class="col-span-2 text-slate-800">${escHtml(r.Department)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">ประเภทจังหวัด</span><span class="col-span-2 text-indigo-600 font-bold">${escHtml(r.TravelType)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">ประเภทงบประมาณ</span><span class="col-span-2 text-slate-800">${escHtml(r.BudgetType)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">เดินทางระหว่าง</span><span class="col-span-2 text-slate-800 font-bold">${formatDate(r.StartDate)} - ${formatDate(r.EndDate)} (${r.TotalDays} วัน)</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">สถานที่ปลายทาง</span><span class="col-span-2 text-slate-800">${escHtml(r.Place)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">เรื่อง/วัตถุประสงค์</span><span class="col-span-2 text-slate-800 whitespace-pre-line">${escHtml(r.Purpose)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">พาหนะที่ใช้</span><span class="col-span-2 text-slate-800">${escHtml(r.Vehicle)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">จังหวัด</span><span class="col-span-2 text-slate-800">${escHtml(r.Province)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">สถานะล่าสุด</span><span class="col-span-2 text-slate-800 font-bold">${escHtml(r.Status)} (ขั้นตอน: ${escHtml(r.WorkflowStep || '-')})</span></div>
            </div>
        `,
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'rounded-3xl max-w-xl' }
    });
}

async function handleGenerateDocWord(recordId) {
    showLoading(true, "กำลังส่งออกไฟล์ใบสั่งราชการ (.docx)...");
    try {
        const response = await serverCall('generateTripDocOnServer', recordId, currentUser);
        showLoading(false);
        if (response && response.success && response.fileUrl) {
            Swal.fire({
                icon: 'success',
                title: 'ดาวน์โหลดไฟล์สำเร็จ',
                html: `<p class="text-sm font-medium mb-4">ใบสั่งราชการฉบับทางการเสร็จสิ้นแล้ว สามารถเปิดใน Microsoft Word ได้ทันที</p>
                       <a href="${response.fileUrl}" target="_blank" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md inline-block text-xs">📂 ดาวน์โหลดไฟล์ (.docx)</a>`,
                confirmButtonText: 'ปิด',
                confirmButtonColor: '#64748b',
                customClass: { popup: 'rounded-3xl' }
            });
        } else {
            Swal.fire('ดาวน์โหลดล้มเหลว', response.message || 'ไม่มีสิทธิ์หรือระบบขัดข้อง', 'error');
        }
    } catch (e) {
        showLoading(false);
        Swal.fire('เกิดข้อผิดพลาด', e.message, 'error');
    }
}
