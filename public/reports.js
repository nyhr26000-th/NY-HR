// --- REPORTS (WFH / TRIPS / LEAVES) MODULE ---
function renderWfhReportPage() {
    const el = document.getElementById('content-wfhReport');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="space-y-1">
                    <h2 class="text-2xl font-black text-slate-800">รายงานข้อมูลปฏิบัติงานนอกสถานที่ตั้ง (WFH)</h2>
                    <p class="text-sm text-slate-500 font-medium">ดูรายงานเชิงวิเคราะห์ผลผลิต แผนงานประจำวัน และประวัติสรุปความก้าวหน้าโครงการ</p>
                </div>
                <button onclick="exportWfhToExcel()" class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm">
                    📥 ส่งออกไฟล์ Excel (.xlsx)
                </button>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div id="wfh-report-list-container">
                    <!-- Loaded dynamically from local state -->
                </div>
            </div>
        </div>
    `;

    loadWfhReportList();
}

function loadWfhReportList() {
    const container = document.getElementById('wfh-report-list-container');
    if (!container) return;

    const records = window.wfhRecords || [];
    if (records.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-slate-400 font-semibold text-xs">ไม่พบข้อมูลสถิติการขอปฏิบัติงาน WFH ในระบบ</div>`;
        return;
    }

    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 text-left text-xs sm:text-sm">
                <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b">
                    <tr>
                        <th class="p-4">บุคลากร</th>
                        <th class="p-4">กลุ่มงาน</th>
                        <th class="p-4">ช่วงวันที่</th>
                        <th class="p-4">วันทำงาน</th>
                        <th class="p-4">สถานะ</th>
                        <th class="p-4">ผลงานสรุป</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${records.map(r => `
                        <tr class="hover:bg-slate-50/50 transition">
                            <td class="p-4 font-bold text-slate-800">${escHtml(r.FullName)}</td>
                            <td class="p-4 text-slate-500">${escHtml(r.Department)}</td>
                            <td class="p-4 font-medium">${formatDate(r.StartDate)} - ${formatDate(r.EndDate)}</td>
                            <td class="p-4 font-mono font-bold">${r.TotalDays} วัน</td>
                            <td class="p-4"><span class="px-2 py-0.5 text-xs font-bold rounded-lg ${r.Status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}">${r.Status}</span></td>
                            <td class="p-4 text-slate-500 max-w-xs truncate">${escHtml(r.WorkReport || 'ยังไม่รายงานส่งผลงาน')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderUserReportPage() {
    const el = document.getElementById('content-report');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="space-y-1">
                    <h2 class="text-2xl font-black text-slate-800">รายงานประวัติไปราชการรายกลุ่มบุคคล</h2>
                    <p class="text-sm text-slate-500 font-medium">สรุปข้อมูลสถิติการยื่นคำขออนุมัติเดินทางไปปฏิบัติตามแผนคำสั่ง</p>
                </div>
                <button onclick="exportTripToExcel()" class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm">
                    📥 ส่งออกไฟล์ Excel (.xlsx)
                </button>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div id="trip-report-list-container"></div>
            </div>
        </div>
    `;

    loadTripReportList();
}

function loadTripReportList() {
    const container = document.getElementById('trip-report-list-container');
    if (!container) return;

    const records = appData.records || [];
    if (records.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-slate-400 font-semibold text-xs">ไม่พบรายการประวัติสถิติไปราชการในระบบขณะนี้</div>`;
        return;
    }

    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 text-left text-xs sm:text-sm">
                <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b">
                    <tr>
                        <th class="p-4">บุคลากร</th>
                        <th class="p-4">สังกัดกลุ่มงาน</th>
                        <th class="p-4">สถานที่ไปราชการ</th>
                        <th class="p-4">เรื่อง/วัตถุประสงค์</th>
                        <th class="p-4">ระหว่างวันที่</th>
                        <th class="p-4 text-center">งบประมาณ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${records.map(r => `
                        <tr class="hover:bg-slate-50/50 transition">
                            <td class="p-4 font-bold text-slate-800">${escHtml(r.FullName)}</td>
                            <td class="p-4 text-slate-500">${escHtml(r.Department)}</td>
                            <td class="p-4 font-bold text-indigo-600">${escHtml(r.Place)}</td>
                            <td class="p-4 text-slate-500 max-w-xs truncate">${escHtml(r.Purpose)}</td>
                            <td class="p-4 font-medium">${formatDate(r.StartDate)} - ${formatDate(r.EndDate)} (${r.TotalDays} วัน)</td>
                            <td class="p-4 text-center font-bold text-slate-700">${escHtml(r.BudgetType)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderLeaveReportPage() {
    const el = document.getElementById('content-leaveReport');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="space-y-1">
                    <h2 class="text-2xl font-black text-slate-800">รายงานข้อมูลและสถิติวันลาสะสม</h2>
                    <p class="text-sm text-slate-500 font-medium">ประมวลผลข้อมูลลาประเภทพักผ่อน ลาป่วย ลากิจ ทั่วทั้งสำนักงาน สสจ.นครนายก</p>
                </div>
                <button onclick="exportLeaveToExcel()" class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm">
                    📥 ส่งออกไฟล์ Excel (.xlsx)
                </button>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div id="leave-report-list-container"></div>
            </div>
        </div>
    `;

    loadLeaveReportList();
}

function loadLeaveReportList() {
    const container = document.getElementById('leave-report-list-container');
    if (!container) return;

    const records = appData.leaves || [];
    if (records.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-slate-400 font-semibold text-xs">ไม่พบสถิติวันลาในระบบสำหรับการส่งรายงาน</div>`;
        return;
    }

    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 text-left text-xs sm:text-sm">
                <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b">
                    <tr>
                        <th class="p-4">บุคลากร</th>
                        <th class="p-4">สังกัดกลุ่มงาน</th>
                        <th class="p-4">ประเภทใบลา</th>
                        <th class="p-4">ช่วงวันที่ขอลา</th>
                        <th class="p-4">จำนวนวันลา</th>
                        <th class="p-4">เหตุผลความจำเป็น</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${records.map(r => `
                        <tr class="hover:bg-slate-50/50 transition">
                            <td class="p-4 font-bold text-slate-800">${escHtml(r.FullName)}</td>
                            <td class="p-4 text-slate-500">${escHtml(r.Department)}</td>
                            <td class="p-4 font-bold text-emerald-600">${escHtml(r.LeaveType)}</td>
                            <td class="p-4 font-medium">${formatDate(r.StartDate)} - ${formatDate(r.EndDate)}</td>
                            <td class="p-4 font-mono font-bold text-slate-700">${r.TotalDays} วัน</td>
                            <td class="p-4 text-slate-500 max-w-xs truncate">${escHtml(r.Reason)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// --- XLSX EXPORTS ---
function exportWfhToExcel() {
    if (!window.wfhRecords || window.wfhRecords.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(window.wfhRecords.map(r => ({
        "ผู้ยื่นคำอนุมัติ": r.FullName,
        "ตำแหน่ง": r.Position,
        "กลุ่มงาน": r.Department,
        "วันที่เริ่มต้น": formatDate(r.StartDate),
        "วันที่สิ้นสุด": formatDate(r.EndDate),
        "รวมจำนวนวัน": r.TotalDays,
        "เหตุผลความจำเป็น": r.Reason,
        "แผนงานปฏิบัติ": r.WorkPlan,
        "สรุปความก้าวหน้าผลงาน": r.WorkReport || '-',
        "ขั้นตอนปัจจุบัน": r.WorkflowStep,
        "สถานะคำขอ": r.Status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WFH Report");
    XLSX.writeFile(wb, "WFH_Report_NY_MOPH.xlsx");
}

function exportTripToExcel() {
    if (!appData.records || appData.records.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(appData.records.map(r => ({
        "ผู้เดินทาง": r.FullName,
        "สังกัดกลุ่มงาน": r.Department,
        "ประเภทการเดินทาง": r.TravelType,
        "ประเภทงบประมาณ": r.BudgetType,
        "วันที่เริ่ม": formatDate(r.StartDate),
        "วันที่สิ้นสุด": formatDate(r.EndDate),
        "จำนวนวัน": r.TotalDays,
        "สถานที่ไปราชการ": r.Place,
        "วัตถุประสงค์": r.Purpose,
        "พาหนะที่ใช้": r.Vehicle,
        "จังหวัด": r.Province,
        "ขั้นตอนล่าสุด": r.WorkflowStep,
        "สถานะใบขอ": r.Status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Official Trip Report");
    XLSX.writeFile(wb, "Official_Trip_Report_NY_MOPH.xlsx");
}

function exportLeaveToExcel() {
    if (!appData.leaves || appData.leaves.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(appData.leaves.map(r => ({
        "ชื่อบุคลากร": r.FullName,
        "กลุ่มงาน": r.Department,
        "ประเภทวันลา": r.LeaveType,
        "วันที่เริ่มต้น": formatDate(r.StartDate),
        "วันที่สิ้นสุด": formatDate(r.EndDate),
        "จำนวนวันลา": r.TotalDays,
        "เหตุผลคำขอ": r.Reason,
        "ที่อยู่ระหว่างลา": r.Address,
        "ขั้นตอนล่าสุด": r.WorkflowStep,
        "สถานะคำขอ": r.Status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leave Records Report");
    XLSX.writeFile(wb, "Leave_Report_NY_MOPH.xlsx");
}
