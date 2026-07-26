// --- WORK FROM HOME (WFH) MODULE ---
function renderWFHPage() {
    const el = document.getElementById('content-wfh');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="space-y-1">
                    <h2 class="text-2xl font-black text-slate-800">ขออนุมัติปฏิบัติงานนอกที่ตั้ง (WFH)</h2>
                    <p class="text-sm text-slate-500 font-medium">ยื่นเอกสารการขอปฏิบัติราชการ WFH พร้อมแนบเอกสารแผนการทำงานรายวัน</p>
                </div>
                <button onclick="openWFHForm()" class="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-md shadow-indigo-100 transition-all flex items-center gap-2">
                    ➕ สร้างใบขออนุมัติ WFH
                </button>
            </div>

            <div id="wfh-records-container">
                <div class="text-center py-12 text-slate-400 font-semibold text-xs">กำลังโหลดข้อมูล WFH...</div>
            </div>
        </div>
    `;

    loadWFHRecords();
}

async function loadWFHRecords() {
    const container = document.getElementById('wfh-records-container');
    if (!container) return;

    try {
        const response = await serverCall('getWFHRequests', currentUser);
        if (response && response.success) {
            window.wfhRecords = response.payload || [];
            renderWFHRecordsList();
        } else {
            container.innerHTML = `<div class="text-center py-8 text-rose-500 text-xs font-semibold">เกิดข้อผิดพลาด: ${response.message}</div>`;
        }
    } catch (e) {
        container.innerHTML = `<div class="text-center py-8 text-rose-500 text-xs font-semibold">ไม่สามารถเชื่อมต่อระบบได้: ${e.message}</div>`;
    }
}

function renderWFHRecordsList() {
    const container = document.getElementById('wfh-records-container');
    if (!container) return;

    const { mine, team } = splitMyAndTeam(window.wfhRecords, 'UserID');
    const activeTab = window._wfhTabActive || 'mine';

    let html = '';
    if (canSeeTeamData()) {
        html += renderTwoTabBar('รายการของฉัน', mine.length, getTeamLabel(), team.length, 'window._wfhTabActive="mine";renderWFHRecordsList();', 'window._wfhTabActive="team";renderWFHRecordsList();', activeTab);
    }

    const currentRecords = activeTab === 'mine' ? mine : team;

    if (currentRecords.length === 0) {
        html += `<div class="bg-white border rounded-2xl py-12 text-center text-slate-400 font-semibold text-xs shadow-sm">ไม่มีข้อมูลการขอปฏิบัติราชการ WFH ที่สามารถเข้าถึงได้</div>`;
        container.innerHTML = html;
        return;
    }

    html += `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100 text-left">
                    <thead class="bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                        <tr>
                            <th class="p-4 sm:p-5">ผู้ขออนุมัติ</th>
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
                                statusBadge = `<span class="px-2.5 py-1 text-xs rounded-full font-bold border border-rose-100 bg-rose-50 text-rose-600">ไม่อนุมัติ</span>`;
                            } else {
                                statusBadge = `<span class="px-2.5 py-1 text-xs rounded-full font-bold border border-slate-100 bg-slate-50 text-slate-600">${r.Status}</span>`;
                            }

                            const isMine = String(r.UserID) === String(currentUser.UserID);
                            
                            return `
                                <tr class="hover:bg-slate-50/50 transition">
                                    <td class="p-4 sm:p-5 font-bold text-slate-800">${escHtml(r.FullName)}</td>
                                    <td class="p-4 sm:p-5 font-medium">${formatDate(r.StartDate)} - ${formatDate(r.EndDate)}</td>
                                    <td class="p-4 sm:p-5 font-mono font-bold">${r.TotalDays} วัน</td>
                                    <td class="p-4 sm:p-5">${statusBadge}</td>
                                    <td class="p-4 sm:p-5 text-center">
                                        <div class="inline-flex gap-1.5">
                                            <button onclick="viewWFHDetails('${escHtml(JSON.stringify(r))}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-xs">ดูข้อมูล</button>
                                            ${isMine && r.Status === 'Pending' ? `<button onclick="cancelWFHRecord('${r.RequestID}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg transition text-xs border border-rose-100">ยกเลิก</button>` : ''}
                                            ${isMine && r.Status === 'Approved' ? `<button onclick="openWFHSubmitWork('${r.RequestID}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-xs flex items-center gap-1">📋 ส่งงาน</button>` : ''}
                                            <button onclick="printWFHRequest('${escHtml(JSON.stringify(r))}')" class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition" title="พิมพ์รายงาน"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg></button>
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

function openWFHForm(record) {
    const isEdit = !!record;
    
    Swal.fire({
        title: isEdit ? 'แก้ไขใบขออนุมัติ WFH' : 'ขออนุมัติปฏิบัติงานนอกที่ตั้ง (WFH)',
        html: `
            <form id="wfh-form" class="text-left text-xs sm:text-sm space-y-4 max-w-xl mx-auto p-1 font-medium">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">วันที่เริ่มต้น:</label>
                        <input id="wfh-start-date" type="date" required value="${isEdit ? formatInputDate(record.StartDate) : getCEDateString()}" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-slate-600 font-bold mb-1">วันที่สิ้นสุด:</label>
                        <input id="wfh-end-date" type="date" required value="${isEdit ? formatInputDate(record.EndDate) : getCEDateString()}" class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>

                <div>
                    <label class="block text-slate-600 font-bold mb-1">เหตุผล/ความจำเป็นในการปฏิบัติราชการนอกที่ตั้งตั้ง:</label>
                    <textarea id="wfh-reason" required placeholder="ระบุเหตุผลความจำเป็น เช่น เพื่อความคล่องตัวในการจัดทำข้อมูลระบบ และหลีกเลี่ยงการเดินทางข้ามจังหวัด..." class="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20">${isEdit ? escHtml(record.Reason) : ''}</textarea>
                </div>

                <div>
                    <label class="block text-slate-600 font-bold mb-1">รายละเอียดงานที่ต้องการนำไปทำ (ระบุแบบแผนรายวัน):</label>
                    <textarea id="wfh-work-plan" required placeholder="เช่น 1. จัดทำและสรุปประมวลระบบข้อมูล nyhr26000 2. ปรับปรุงพอร์ทัล 3. ตรวจสอบรายงานประวัติ" class="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24">${isEdit ? escHtml(record.WorkPlan) : ''}</textarea>
                </div>

                <div>
                    <label class="block text-slate-600 font-bold mb-1">เอกสารหลักฐาน/แผนงานแนบ (PDF/รูปภาพ - ถ้ามี):</label>
                    <input id="wfh-files" type="file" multiple class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <p class="text-[10px] text-slate-400 mt-1 font-semibold">สามารถแนบไฟล์คำสั่ง หรือแผนการปฏิบัติงานเพิ่มเติมได้ (อัปโหลดเข้าสู่ Google Drive อัตโนมัติ)</p>
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: isEdit ? '💾 บันทึกการแก้ไข' : '✉️ ยื่นใบคำขอ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#64748b',
        customClass: { popup: 'rounded-3xl max-w-2xl' },
        preConfirm: async () => {
            const form = document.getElementById('wfh-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }

            const startDate = document.getElementById('wfh-start-date').value;
            const endDate = document.getElementById('wfh-end-date').value;
            const reason = document.getElementById('wfh-reason').value;
            const workPlan = document.getElementById('wfh-work-plan').value;
            const fileInput = document.getElementById('wfh-files');

            const totalDays = calculateDurationClientSide([{ start: startDate, end: endDate }], appData.appSettings?.holidays || []);

            if (totalDays <= 0) {
                Swal.showValidationMessage('ไม่พบวันทำการในช่วงวันที่ที่เลือก กรุณาตรวจสอบวันเสาร์-อาทิตย์ หรือวันหยุดราชการ');
                return false;
            }

            let uploadedFiles = [];
            if (fileInput && fileInput.files.length > 0) {
                try {
                    uploadedFiles = await uploadFiles(fileInput);
                } catch (err) {
                    Swal.showValidationMessage('อัปโหลดไฟล์หลักฐานล้มเหลว: ' + err.message);
                    return false;
                }
            }

            return {
                startDate,
                endDate,
                totalDays,
                reason,
                workPlan,
                files: uploadedFiles,
                requestID: isEdit ? record.RequestID : ''
            };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            showLoading(true, "กำลังยื่นคำขออนุมัติ WFH...");
            try {
                const response = await serverCall('saveWFHRequest', result.value, currentUser);
                showLoading(false);
                if (response && response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'ยื่นใบคำขอสำเร็จ',
                        text: response.message,
                        timer: 2000,
                        showConfirmButton: false
                    });
                    loadWFHRecords();
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

async function cancelWFHRecord(requestId) {
    Swal.fire({
        title: 'ยืนยันการยกเลิก?',
        text: 'คุณต้องการยกเลิกคำขอปฏิบัติงานนอกที่ตั้งนี้หรือไม่ (ข้อมูลจะไม่ถูกลบแต่สถานะจะเปลี่ยนเป็น Cancelled)',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'ใช่, ยกเลิกคำขอ',
        cancelButtonText: 'ปิด'
    }).then(async (result) => {
        if (result.isConfirmed) {
            showLoading(true, 'กำลังยกเลิกรายการ...');
            try {
                const response = await serverCall('cancelWFHRecord', requestId, currentUser);
                showLoading(false);
                if (response && response.success) {
                    Swal.fire('สำเร็จ', response.message, 'success');
                    loadWFHRecords();
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

function openWFHSubmitWork(requestId) {
    Swal.fire({
        title: 'รายงานสรุปผลการปฏิบัติราชการ WFH',
        html: `
            <form id="wfh-submit-form" class="text-left text-xs sm:text-sm space-y-4 max-w-xl mx-auto p-1 font-medium">
                <div>
                    <label class="block text-slate-600 font-bold mb-1">สรุปรายงานผลการทำงานรายวัน (ระบุผลลัพธ์ที่ได้):</label>
                    <textarea id="wfh-work-report" required placeholder="เช่น 1. จัดทำข้อมูลระบบ nyhr26000 เสร็จเรียบร้อยแล้ว 2. ดำเนินการวิเคราะห์และแก้ไข Bug ใน iframe สำเร็จ 3. ส่งข้อมูลออกรายงาน..." class="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32"></textarea>
                </div>
                <div>
                    <label class="block text-slate-600 font-bold mb-1">แนบไฟล์รายงานผลสำเร็จ (PDF/ZIP/รูปภาพ - ถ้ามี):</label>
                    <input id="wfh-report-files" type="file" multiple class="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: '💾 ส่งรายงานสรุปงาน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#059669',
        cancelButtonColor: '#64748b',
        customClass: { popup: 'rounded-3xl max-w-2xl' },
        preConfirm: async () => {
            const form = document.getElementById('wfh-submit-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }

            const workReport = document.getElementById('wfh-work-report').value;
            const fileInput = document.getElementById('wfh-report-files');

            let uploadedFiles = [];
            if (fileInput && fileInput.files.length > 0) {
                try {
                    uploadedFiles = await uploadFiles(fileInput);
                } catch (err) {
                    Swal.showValidationMessage('อัปโหลดไฟล์หลักฐานผลงานล้มเหลว: ' + err.message);
                    return false;
                }
            }

            return {
                requestId,
                workReport,
                files: uploadedFiles
            };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            showLoading(true, "กำลังบันทึกรายงานความก้าวหน้า WFH...");
            try {
                const response = await serverCall('saveWFHReportSummary', result.value, currentUser);
                showLoading(false);
                if (response && response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'ส่งรายงานสรุปสำเร็จ',
                        text: response.message,
                        timer: 2000,
                        showConfirmButton: false
                    });
                    loadWFHRecords();
                    updateNotificationBadge();
                } else {
                    Swal.fire('ข้อผิดพลาด', response.message || 'บันทึกสรุปผลงานไม่สำเร็จ', 'error');
                }
            } catch (err) {
                showLoading(false);
                Swal.fire('ข้อผิดพลาด', err.message, 'error');
            }
        }
    });
}

function viewWFHDetails(jsonStr) {
    const r = JSON.parse(jsonStr);
    
    let filesHtml = '';
    if (r.Files && r.Files.length > 0) {
        filesHtml = r.Files.map(f => `<a href="${f.url}" target="_blank" class="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">📎 ${escHtml(f.name)}</a>`).join('<br>');
    } else {
        filesHtml = '<span class="text-slate-400">ไม่มีไฟล์แนบ</span>';
    }

    let reportHtml = '';
    if (r.WorkReport) {
        let reportFilesHtml = '';
        if (r.ReportFiles && r.ReportFiles.length > 0) {
            reportFilesHtml = r.ReportFiles.map(f => `<a href="${f.url}" target="_blank" class="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1">📎 ${escHtml(f.name)}</a>`).join('<br>');
        }
        reportHtml = `
            <div class="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2 mt-4">
                <h4 class="font-bold text-emerald-800 text-xs sm:text-sm">📌 สรุปผลการปฏิบัติงาน WFH</h4>
                <p class="text-xs sm:text-sm text-slate-800 whitespace-pre-line">${escHtml(r.WorkReport)}</p>
                ${reportFilesHtml ? `<div class="pt-1.5 text-xs">${reportFilesHtml}</div>` : ''}
            </div>
        `;
    }

    Swal.fire({
        title: 'รายละเอียดคำขออนุมัติ WFH',
        html: `
            <div class="text-left text-xs sm:text-sm space-y-3.5 p-1 max-h-[70vh] overflow-y-auto font-medium">
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">ผู้ยื่นคำขอ</span><span class="col-span-2 font-bold text-slate-800">${escHtml(r.FullName)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">กลุ่มงาน</span><span class="col-span-2 text-slate-800">${escHtml(r.Department)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">ช่วงวันที่ขอ</span><span class="col-span-2 text-slate-800 font-bold">${formatDate(r.StartDate)} - ${formatDate(r.EndDate)} (${r.TotalDays} วัน)</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">เหตุผลความจำเป็น</span><span class="col-span-2 text-slate-800 whitespace-pre-line">${escHtml(r.Reason)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">แผนงานประจำวัน</span><span class="col-span-2 text-slate-800 whitespace-pre-line">${escHtml(r.WorkPlan)}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">ไฟล์แนบแผนงาน</span><span class="col-span-2">${filesHtml}</span></div>
                <div class="grid grid-cols-3 border-b pb-2"><span class="font-bold text-slate-500">สถานะปัจจุบัน</span><span class="col-span-2 text-slate-800 font-bold">${escHtml(r.Status)} (ขั้นตอน: ${escHtml(r.WorkflowStep || '-')})</span></div>
                ${reportHtml}
            </div>
        `,
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'rounded-3xl max-w-xl' }
    });
}

function printWFHRequest(record) {
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    document.body.appendChild(frame);
    
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>ใบขออนุมัติปฏิบัติราชการนอกที่ตั้ง (WFH)</title>
            <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Prompt', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                .text-center { text-align: center; }
                .title { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
                .meta-box { border: 1px solid #ddd; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
                .label { font-weight: bold; color: #555; }
                .field { margin-bottom: 10px; }
                .sign-box { margin-top: 40px; text-align: right; }
            </style>
        </head>
        <body>
            <div class="text-center">
                <img src="https://img1.pic.in.th/images/moph.png" style="height: 60px;">
                <h1 class="title">บันทึกข้อความขออนุมัติปฏิบัติงานนอกสถานที่ตั้ง (Work From Home)</h1>
            </div>
            <div class="meta-box">
                <div class="field"><span class="label">ผู้ขออนุมัติ:</span> ${record.FullName}</div>
                <div class="field"><span class="label">ตำแหน่ง:</span> ${record.Position}</div>
                <div class="field"><span class="label">สังกัดกลุ่มงาน:</span> ${record.Department}</div>
                <div class="field"><span class="label">ความจำเป็นและเหตุผล:</span><br>${record.Reason}</div>
                <div class="field"><span class="label">แผนงานปฏิบัติการประจำวัน:</span><br>${record.WorkPlan}</div>
                <div class="field"><span class="label">ระหว่างวันที่:</span> ${formatDateLong(record.StartDate)} ถึงวันที่ ${formatDateLong(record.EndDate)} รวม ${record.TotalDays} วันทำการ</div>
            </div>
            <div class="sign-box">
                <p>ลงชื่อ.......................................................... ผู้ขออนุมัติ</p>
                <p>(${record.FullName})</p>
                <p>วันที่........./......../...............</p>
            </div>
            <script>
                window.onload = function() { window.print(); };
            </script>
        </body>
        </html>
    `);
    doc.close();
    
    setTimeout(() => { document.body.removeChild(frame); }, 5000);
}
