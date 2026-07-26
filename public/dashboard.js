// --- DASHBOARD / KPI STATS MODULE (CHART.JS INTEGRATION) ---
function renderDashboardPage() {
    const el = document.getElementById('content-dashboard');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6">
            <!-- Summary KPI Widgets Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="kpi-box bg-gradient-to-br from-indigo-50/80 to-indigo-100/30 border border-indigo-100">
                    <p class="text-xs font-bold text-indigo-600 uppercase tracking-wider">ไปราชการทั้งหมด</p>
                    <h3 class="text-3xl font-black text-indigo-950 mt-1" id="kpi-trips-count">0</h3>
                    <p class="text-[10px] text-slate-400 mt-1 font-bold">รายการที่ได้รับอนุมัติในระบบ</p>
                </div>

                <div class="kpi-box bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 border border-emerald-100">
                    <p class="text-xs font-bold text-emerald-600 uppercase tracking-wider">บันทึกวันลาพักผ่อน</p>
                    <h3 class="text-3xl font-black text-emerald-950 mt-1" id="kpi-leaves-count">0</h3>
                    <p class="text-[10px] text-slate-400 mt-1 font-bold">วันลาทั้งหมดสะสมปีนี้</p>
                </div>

                <div class="kpi-box bg-gradient-to-br from-orange-50/80 to-orange-100/30 border border-orange-100">
                    <p class="text-xs font-bold text-orange-600 uppercase tracking-wider">ปฏิบัติงาน WFH</p>
                    <h3 class="text-3xl font-black text-orange-950 mt-1" id="kpi-wfh-count">0</h3>
                    <p class="text-[10px] text-slate-400 mt-1 font-bold">สถิติจำนวนวันทำงานนอกที่ตั้ง</p>
                </div>

                <div class="kpi-box bg-gradient-to-br from-rose-50/80 to-rose-100/30 border border-rose-100">
                    <p class="text-xs font-bold text-rose-600 uppercase tracking-wider">สถานะรอลงนามคุณ</p>
                    <h3 class="text-3xl font-black text-rose-950 mt-1" id="kpi-pending-count">0</h3>
                    <p class="text-[10px] text-slate-400 mt-1 font-bold">รายการเอกสารรอตรวจสอบสิทธิ์</p>
                </div>
            </div>

            <!-- Analytical Charts Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">📊 สถิติการลาจำแนกตามประเภท (วันลาแยกตามหมวดหมู่)</h3>
                    <div class="h-64 flex items-center justify-center relative">
                        <canvas id="chart-leave-types" class="max-h-full max-w-full"></canvas>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">📈 แนวโน้มสถิติเดินทางปฏิบัติราชการรายเดือน</h3>
                    <div class="h-64 flex items-center justify-center relative">
                        <canvas id="chart-monthly-trips" class="max-h-full max-w-full"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadDashboardData();
}

async function loadDashboardData() {
    const kpiTrips = document.getElementById('kpi-trips-count');
    const kpiLeaves = document.getElementById('kpi-leaves-count');
    const kpiWfh = document.getElementById('kpi-wfh-count');
    const kpiPending = document.getElementById('kpi-pending-count');

    if (!kpiTrips) return;

    // Filter and update KPIs
    const approvedTrips = (appData.records || []).filter(r => r.Status === 'Approved');
    const approvedLeaves = (appData.leaves || []).filter(l => l.Status === 'Approved');
    const approvedWfh = (window.wfhRecords || []).filter(w => w.Status === 'Approved');
    const pendingCount = getPendingCount(currentUser.Role);

    kpiTrips.innerText = approvedTrips.length;
    kpiLeaves.innerText = approvedLeaves.reduce((acc, curr) => acc + (parseFloat(curr.TotalDays) || 0), 0) + ' วัน';
    kpiWfh.innerText = approvedWfh.reduce((acc, curr) => acc + (parseFloat(curr.TotalDays) || 0), 0) + ' วัน';
    kpiPending.innerText = pendingCount;

    // Delay chart generation until canvas is fully rendered in DOM
    setTimeout(() => {
        renderDashboardCharts(approvedTrips, appData.leaves || []);
    }, 100);
}

function renderDashboardCharts(trips, leaves) {
    // 1. Leave Types Pie/Doughnut Chart
    const leaveCanvas = document.getElementById('chart-leave-types');
    if (leaveCanvas && typeof Chart !== 'undefined') {
        const leaveCounts = {};
        leaves.forEach(l => {
            if (l.Status === 'Approved') {
                const type = l.LeaveType || 'อื่นๆ';
                leaveCounts[type] = (leaveCounts[type] || 0) + (parseFloat(l.TotalDays) || 0);
            }
        });

        const labels = Object.keys(leaveCounts);
        const data = Object.values(leaveCounts);

        if (window._leaveChartInstance) window._leaveChartInstance.destroy();
        window._leaveChartInstance = new Chart(leaveCanvas, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['ไม่มีประวัติวันลา'],
                datasets: [{
                    data: data.length > 0 ? data : [1],
                    backgroundColor: [
                        '#10b981', // Emerald
                        '#3b82f6', // Blue
                        '#f59e0b', // Amber
                        '#ec4899', // Pink
                        '#8b5cf6', // Violet
                        '#cbd5e1'  // Slate (no data)
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, font: { family: 'Prompt', size: 11 } }
                    }
                }
            }
        });
    }

    // 2. Monthly Trips Line/Bar Chart
    const tripsCanvas = document.getElementById('chart-monthly-trips');
    if (tripsCanvas && typeof Chart !== 'undefined') {
        const monthlyCounts = Array(12).fill(0);
        const monthsThai = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

        trips.forEach(t => {
            const d = new Date(t.StartDate);
            if (!isNaN(d.getTime())) {
                const monthIdx = d.getMonth();
                monthlyCounts[monthIdx]++;
            }
        });

        if (window._tripsChartInstance) window._tripsChartInstance.destroy();
        window._tripsChartInstance = new Chart(tripsCanvas, {
            type: 'bar',
            data: {
                labels: monthsThai,
                datasets: [{
                    label: 'จำนวนครั้ง (ครั้ง)',
                    data: monthlyCounts,
                    backgroundColor: 'rgba(79, 70, 229, 0.85)', // Indigo
                    borderRadius: 6,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { family: 'Prompt', size: 10 } }
                    },
                    x: {
                        ticks: { font: { family: 'Prompt', size: 10 } }
                    }
                }
            }
        });
    }
}
