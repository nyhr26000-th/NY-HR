// --- GLOBAL STATE ---
let currentUser = null;
let appData = {
    adminReportData: [],
    userReportData: [],
    deptReportData: [],
    publicData: {},
    records: [],
    leaves: []
};
let globalHistoryRecordsMap = {};
let chartInstances = {};
let checkinLat = null;
let checkinLng = null;
let checkinWatchId = null;
 
function escHtml(v) {
     return String(v === undefined || v === null ? '' : v)
       .replace(/&/g, '&amp;').replace(/</g, '&lt;')
       .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
       .replace(/'/g, '&#039;');
}

window.showLateHistoryModal = function(name, detailsStr) {
    let details = [];
    try { details = JSON.parse(detailsStr.replace(/&quot;/g, '"')); } catch(e) { console.error(e); }
    if (!details || details.length === 0) {
        Swal.fire('ไม่พบข้อมูล', 'ไม่มีประวัติการมาสายของ ' + name, 'info');
        return;
    }
    let html = '<div class="text-left"><table class="w-full text-sm border-collapse"><thead class="bg-gray-50 border-b"><tr><th class="p-2 text-left">วันที่</th><th class="p-2 text-center">เวลาเข้างาน</th></tr></thead><tbody>';
    details.forEach(function(d) {
       const dStr = formatDate(d.date);
       html += '<tr class="border-b"><td class="p-2">' + dStr + '</td><td class="p-2 text-center text-red-600 font-medium">' + d.time + ' น.</td></tr>';
    });
    html += '</tbody></table></div>';
    Swal.fire({
       title: 'ประวัติมาสาย: ' + name,
       html: html,
       confirmButtonText: 'ปิด',
       confirmButtonColor: '#10b981',
       width: '400px'
    });
};

// --- TEAM VISIBILITY HELPERS ---
const teamViewRoles = ['DeptHead', 'DeputyDeptHead', 'DeputyDirDept', 'AdminHR', 'HR', 'Executive', 'Director', 'DeputyDirHR', 'Secretary'];
function canSeeTeamData() { return currentUser && teamViewRoles.includes(currentUser.Role); }
function getTeamLabel() {
    if (['DeptHead','DeputyDeptHead','DeputyDirDept'].includes(currentUser.Role)) return 'เจ้าหน้าที่ในกลุ่มงาน';
    return 'เจ้าหน้าที่ทั้งหมด';
}
function splitMyAndTeam(records, userIdField) {
    userIdField = userIdField || 'UserID';
    var myUid = String(currentUser.UserID);
    var mine = records.filter(function(r) { return String(r[userIdField]) === myUid; });
    var team = records.filter(function(r) { return String(r[userIdField]) !== myUid; });
    return { mine: mine, team: team };
}
function renderTwoTabBar(tab1Label, tab1Count, tab2Label, tab2Count, onTab1, onTab2, activeTab) {
    activeTab = activeTab || 'mine';
    var mineActive = activeTab === 'mine';
    var teamActive = activeTab === 'team';
    var thirdActive = activeTab === 'approved';
    return '<div class="flex border-b border-gray-200 mb-4 bg-white rounded-t-lg">' +
        '<button onclick="' + onTab1 + '" class="flex-1 py-3 text-center font-bold text-sm transition focus:outline-none ' + (mineActive ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50' : 'text-gray-500 hover:text-emerald-500') + '">' + tab1Label + ' <span class="ml-1 px-2 py-0.5 rounded-full text-xs ' + (mineActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600') + '">' + tab1Count + '</span></button>' +
        '<button onclick="' + onTab2 + '" class="flex-1 py-3 text-center font-bold text-sm transition focus:outline-none ' + (teamActive || thirdActive && tab2Label==='อนุมัติแล้ว' ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-500') + '">' + tab2Label + ' <span class="ml-1 px-2 py-0.5 rounded-full text-xs ' + (teamActive || thirdActive && tab2Label==='อนุมัติแล้ว' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600') + '">' + tab2Count + '</span></button>' +
    '</div>';
}
function renderThreeTabBar(tab1Label, tab1Count, tab2Label, tab2Count, tab3Label, tab3Count, onTab1, onTab2, onTab3, activeTab) {
    activeTab = activeTab || 'mine';
    var mineActive = activeTab === 'mine';
    var teamActive = activeTab === 'team';
    var thirdActive = activeTab === 'approved';
    return '<div class="flex border-b border-gray-200 mb-4 bg-white rounded-t-lg">' +
        '<button onclick="' + onTab1 + '" class="flex-1 py-3 text-center font-bold text-sm transition focus:outline-none ' + (mineActive ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50' : 'text-gray-500 hover:text-emerald-500') + '">' + tab1Label + ' <span class="ml-1 px-2 py-0.5 rounded-full text-xs ' + (mineActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600') + '">' + tab1Count + '</span></button>' +
        '<button onclick="' + onTab2 + '" class="flex-1 py-3 text-center font-bold text-sm transition focus:outline-none ' + (teamActive ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-500') + '">' + tab2Label + ' <span class="ml-1 px-2 py-0.5 rounded-full text-xs ' + (teamActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600') + '">' + tab2Count + '</span></button>' +
        '<button onclick="' + onTab3 + '" class="flex-1 py-3 text-center font-bold text-sm transition focus:outline-none ' + (thirdActive ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-purple-500') + '">' + tab3Label + ' <span class="ml-1 px-2 py-0.5 rounded-full text-xs ' + (thirdActive ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600') + '">' + tab3Count + '</span></button>' +
    '</div>';
}
window._recordsTabActive = 'mine';
window._leavesTabActive = 'mine';

const showLoading = (show, title = 'กำลังประมวลผล...') => {
  if (show) {
    Swal.fire({ title, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  } else {
    Swal.close();
  }
};

const serverCall = (functionName, ...args) => {
    return new Promise((resolve, reject) => {
        if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run
                .withSuccessHandler(response => resolve(response))
                .withFailureHandler(error => reject(error))
                [functionName](...args); 
        } else {
            const apiUrl = localStorage.getItem('nny_gas_api_url') || (window.parent && window.parent.localStorage ? window.parent.localStorage.getItem('nny_gas_api_url') : '') || 'https://script.google.com/macros/s/AKfycbxyGYM8VTTCgaoO-VTSqlI3tKMRv0aMrS_jA7zYMF-jwoU5_yeqcKEKNPySudWzOecjrA/exec';
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: functionName,
                    payload: args,
                    userInfo: currentUser,
                    timestamp: new Date().toISOString()
                })
            })
            .then(r => r.json())
            .then(res => resolve(res))
            .catch(err => reject(err));
        }
    });
};

const getCEYear = () => parseInt(new Date().toISOString().substring(0, 4), 10);
const getCEDateString = () => new Date().toISOString().split('T')[0];
const isHRRole = (role) => ['AdminHR','HR','Admin','Director','DeputyDirHR'].includes(String(role || '').trim());
const isAdminHrOrHr = (role) => ['AdminHR','HR'].includes(String(role || '').trim());

function validatePngFile(file, label) {
    if (!file) return true;
    const name = String(file.name || '').toLowerCase();
    if (file.type !== 'image/png' && !name.endsWith('.png')) {
        Swal.fire('ไฟล์ไม่ถูกต้อง', (label || 'ลายเซ็น') + ' ต้องเป็นไฟล์ PNG เท่านั้น', 'error');
        return false;
    }
    return true;
}

function readSignaturePngBase64(file, label) {
    return new Promise((resolve, reject) => {
        if (!validatePngFile(file, label)) return reject((label || 'ลายเซ็น') + ' ต้องเป็นไฟล์ PNG เท่านั้น');
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = String(ev.target.result || '');
            if (!dataUrl.startsWith('data:image/png;base64,')) return reject((label || 'ลายเซ็น') + ' ต้องเป็นไฟล์ PNG เท่านั้น');
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 300, MAX_HEIGHT = 150;
                let width = img.width, height = img.height;
                if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
                else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                
                let scale = 1.0;
                let base64 = "";
                const ctx = canvas.getContext('2d');
                do {
                    canvas.width = Math.round(width * scale);
                    canvas.height = Math.round(height * scale);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    base64 = canvas.toDataURL('image/png').split(',')[1];
                    scale *= 0.8;
                } while (base64.length > 49000 && scale > 0.15);
                
                if (base64.length > 49000) {
                    return reject('ขนาดภาพของลายเซ็นใหญ่เกินข้อจำกัดของระบบ (เกิน 50,000 อักขระ) แม้จะบีบอัดแล้ว กรุณาใช้ไฟล์อื่นหรือวาดลายเซ็นแทน');
                }
                resolve(base64);
            };
            img.onerror = () => reject((label || 'ลายเซ็น') + ' ไม่สามารถอ่านไฟล์ภาพได้ กรุณาใช้ PNG ที่ถูกต้อง');
            img.src = dataUrl;
        };
        reader.onerror = () => reject('ไม่สามารถอ่านไฟล์ได้');
        reader.readAsDataURL(file);
    });
}

const formatDate = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', calendar: 'buddhist' });
};
const formatDateLong = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', calendar: 'buddhist' });
};
const formatDateTimeThai = (isoString) => {
  if (!isoString) return '-';
  const dateArr = new Date(isoString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', calendar: 'buddhist' }).split(' ');
  const timeStr = new Date(isoString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  return `${dateArr[0]} ${dateArr[1]}. ${dateArr[2]} ${timeStr} น.`;
};
const formatInputDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0];
};
const formatInputTime = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
      let t = new Date(timeStr);
      let h = t.getHours().toString().padStart(2, '0');
      let m = t.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
  }
  return timeStr;
};
function calculateDurationClientSide(dateRanges, holidays = []) {
   const uniqueWorkDays = new Set();
   const holidayDates = holidays.map(h => h.date);
   dateRanges.forEach(range => {
       if (!range.start || !range.end) return;
       let currentDate = new Date(range.start);
       const endDate = new Date(range.end);
       while(currentDate <= endDate) {
           const dayOfWeek = currentDate.getDay();
           const dateString = currentDate.toISOString().split('T')[0];
           if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(dateString)) {
               uniqueWorkDays.add(dateString);
           }
           currentDate.setDate(currentDate.getDate() + 1);
       }
   });
   return uniqueWorkDays.size;
}
const uploadFiles = async (fileInput) => {
   if (!fileInput.files.length) return [];
   const uploadPromises = Array.from(fileInput.files).map(file => {
       return new Promise((resolve, reject) => {
           const reader = new FileReader();
           reader.onload = () => {
               const fileObject = { fileName: file.name, mimeType: file.type, base64Data: reader.result.split(',')[1] };
               google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).uploadFileToDrive(fileObject);
           };
           reader.onerror = error => reject(error);
           reader.readAsDataURL(file);
       });
   });
   showLoading(true, `กำลังอัปโหลด ${fileInput.files.length} ไฟล์...`);
   const results = await Promise.all(uploadPromises);
   showLoading(false);
   return results;
};

// --- PUBLIC PAGE RENDERING LOGIC ---
function renderPublicShell() {
    document.getElementById('app-container').innerHTML = `
            <div class="flex flex-col min-h-screen">
                <header class="bg-white shadow-sm sticky top-0 z-10 no-print">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                        <div class="flex items-center space-x-3 sm:space-x-4 overflow-hidden">
                            <img src="https://img1.pic.in.th/images/moph.png" alt="MOPH Logo" class="h-10 sm:h-12 flex-shrink-0">
                            <div class="overflow-hidden">
                                <h1 class="text-lg sm:text-2xl font-bold text-green-600 truncate">สสจ.นครนายก</h1>
                                <p class="text-xs sm:text-sm text-gray-500 hidden sm:block">MOPH Official HR Records System</p>
                            </div>
                        </div>
                    </div>
                    <nav class="border-b border-gray-200">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-4 sm:space-x-8" id="public-tabs">
                            <button data-tab="calendar" class="public-tab-btn py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">ปฏิทิน</button>
                            <button data-tab="dashboard" class="public-tab-btn py-4 px-1 border-b-2 font-medium text-sm border-gray-500 text-gray-600">Dashboard ภาพรวม</button>
                            <button data-tab="login" class="public-tab-btn py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">เข้าสู่ระบบ / ลงทะเบียน</button>
                        </div>
                    </nav>
                </header>
                <main id="main-content" class="flex-grow p-4 md:p-6"></main>
            </div>`;
}
function showPublicContent(tabId, data) {
   window.scrollTo(0, 0);
   const mainContent = document.getElementById('main-content');
   if (!mainContent) return;
   document.querySelectorAll('.public-tab-btn').forEach(btn => {
       const isCurrent = btn.dataset.tab === tabId || (tabId === 'register' && btn.dataset.tab === 'login');
       btn.classList.toggle('border-emerald-500', isCurrent);
       btn.classList.toggle('text-emerald-600', isCurrent);
       btn.classList.toggle('border-transparent', !isCurrent);
       btn.classList.toggle('text-gray-500', !isCurrent);
   });
   switch (tabId) {
       case 'dashboard':
           const d = data || (window.appData && window.appData.publicData) || {};
            mainContent.innerHTML = d.kpis ? renderDashboardKpis(d.kpis) + renderDashboardCharts('public') : '<div class="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</div>';
            if(d.charts) renderPublicCharts(d.charts);
           break;
       case 'calendar':
          mainContent.innerHTML = renderCalendarView();
          renderCalendar(getCEYear(), new Date().getMonth(), (data && data.calendarEvents) || (appData && appData.publicData && appData.publicData.calendarEvents) || {});
          break;
       case 'login':
           mainContent.innerHTML = renderLoginPage();
           break;
       case 'register':
           mainContent.innerHTML = renderRegisterPage();
           handleGetInitialDataForRegistration();
           break;
   }
}

function renderDashboardKpis(kpis) {
   if (!kpis) return '<div class="text-center p-8 text-gray-500">ไม่สามารถแสดงผลข้อมูลสถิติได้</div>';
   const title = (currentUser && ((currentUser.Role === 'AdminHR' || currentUser.Role === 'HR') || currentUser.Role === 'Executive' || currentUser.Role === 'DeptHead' || currentUser.Role === 'DeputyDeptHead')) ? '(ข้อมูลตามตัวกรอง)' : '(ข้อมูลภาพรวม)';
   return `
       <div class="mb-6">
           <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <div class="kpi-box flex items-center"><div class="p-3 bg-blue-100 rounded-lg"><svg class="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008z" /></svg></div><div class="ml-4"><p class="text-3xl font-bold text-blue-600">${kpis.peopleToday.toLocaleString()}</p><p class="text-sm text-gray-500">ไปราชการวันนี้</p></div></div>
               <div class="kpi-box flex items-center"><div class="p-3 bg-green-100 rounded-lg"><svg class="w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.962 0L14.25 6h5.25a3 3 0 013 3v5.25L17.25 18a3 3 0 01-3 3h-5.25a3 3 0 01-3-3v-5.25L3.75 6H9l4.5 4.5z" /></svg></div><div class="ml-4"><p class="text-3xl font-bold text-green-600">${kpis.totalUsers.toLocaleString()}</p><p class="text-sm text-gray-500">บุคลากรทั้งหมด</p></div></div>
               <div class="kpi-box flex items-center"><div class="p-3 bg-indigo-100 rounded-lg"><svg class="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M10 15h4M7.5 7.5h9v-3a3 3 0 00-3-3h-3a3 3 0 00-3 3v3z" /></svg></div><div class="ml-4"><p class="text-3xl font-bold text-indigo-600">${kpis.totalTrips.toLocaleString()}</p><p class="text-sm text-gray-500">เดินทาง ${title}</p><p class="text-xs text-gray-400">ใน จ.${kpis.inProvinceTrips} / นอก จ.${kpis.outOfProvinceTrips}</p></div></div>
               <div class="kpi-box flex items-center"><div class="p-3 bg-purple-100 rounded-lg"><svg class="w-8 h-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v-.75A.75.75 0 015.25 4.5h-.75m0 0H3.75m9 12c.621 0 1.125-.504 1.125-1.125V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108v8.642a2.25 2.25 0 002.25 2.25h2.25m-3-3.75a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" /></svg></div><div class="ml-4"><p class="text-3xl font-bold text-purple-600">${kpis.totalBudget.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 })}</p><p class="text-sm text-gray-500">งบประมาณ ${title}</p></div></div>
           </div>
       </div>`;
}
function renderDashboardCharts(contextId) {
    return `
        <div id="charts-container-${contextId}" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow flex flex-col h-80"><h3 class="font-semibold text-gray-700 text-center mb-4">จำนวนครั้งตามกลุ่มงาน</h3><div class="relative flex-grow"><canvas id="${contextId}DeptChart"></canvas></div></div>
            <div class="bg-white p-6 rounded-lg shadow flex flex-col h-80"><h3 class="font-semibold text-gray-700 text-center mb-4">เดินทางรายเดือน (ปีงบประมาณ)</h3><div class="relative flex-grow"><canvas id="${contextId}MonthChart"></canvas></div></div>
        </div>`;
}
function renderPublicCharts(chartsData) {
    setTimeout(() => { 
        if (!chartsData) return;
        ['publicDept', 'publicMonth'].forEach(id => { if(chartInstances[id]) chartInstances[id].destroy(); });
        
        const { byDepartment, byFiscalYear } = chartsData;
        
        const deptCtx = document.getElementById('publicDeptChart')?.getContext('2d');
        if(deptCtx) {
            chartInstances.publicDept = new Chart(deptCtx, {
                type: 'bar', data: { labels: Object.keys(byDepartment), datasets: [{ label: 'จำนวนครั้ง', data: Object.values(byDepartment), backgroundColor: 'rgba(16, 185, 129, 0.7)' }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
            });
        }
        const monthCtx = document.getElementById('publicMonthChart')?.getContext('2d');
        if(monthCtx && byFiscalYear) {
            const fiscalMonths = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
            const fiscalYears = Object.keys(byFiscalYear).sort((a,b) => b-a); 
            
            const datasets = fiscalYears.slice(0, 3).map((year, index) => {
                const yearData = byFiscalYear[year];
                const fiscalData = [...yearData.slice(9), ...yearData.slice(0, 9)];
                return {
                    label: `ปีงบประมาณ ${year}`,
                    data: fiscalData,
                    borderColor: index === 0 ? 'rgba(16, 185, 129, 1)' : (index === 1 ? 'rgba(59, 130, 246, 1)' : 'rgba(168, 85, 247, 1)'),
                    backgroundColor: index === 0 ? 'rgba(16, 185, 129, 0.1)' : (index === 1 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)'),
                    borderWidth: 2,
                    fill: true
                };
             });
             chartInstances.publicMonth = new Chart(monthCtx, {
                 type: 'line', data: { labels: fiscalMonths, datasets: datasets },
                 options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 }} } }
             });
         }
     }, 100);
}
 
function renderLoginPage() {
   return `
     <div class="flex items-center justify-center w-full py-8">
         <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border">
             <h2 class="text-2xl font-bold text-gray-800 text-center">เข้าสู่ระบบ</h2>
             <form id="login-form" class="space-y-6">
                 <div>
                     <label for="username" class="text-sm font-medium text-gray-700">ชื่อผู้ใช้งาน</label>
                     <input id="username" type="text" autocomplete="username" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
                 </div>
                 <div>
                     <label for="password" class="text-sm font-medium text-gray-700">รหัสผ่าน</label>
                      <div class="mt-1 relative w-full flex items-center">
                          <input id="password" type="password" autocomplete="current-password" required class="block w-full px-4 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                          <button type="button" id="toggle-password-visibility" title="ดู/ซ่อนรหัสผ่าน" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none z-10">
                              <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <svg id="eye-slash-icon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                          </button>
                      </div>
                 </div>
                 <div class="flex items-center justify-between mb-2">
                     <div class="flex items-center">
                         <input id="remember_me" name="remember_me" type="checkbox" checked class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer">
                         <label for="remember_me" class="ml-2 block text-sm text-gray-900 cursor-pointer">ผูกติดอุปกรณ์นี้ (ไม่ต้องล็อคอินอีก)</label>
                     </div>
                 </div>
                 <div>
                     <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 font-bold transition">เข้าสู่ระบบ</button>
                 </div>
                 <div class="text-center"><button type="button" id="forgot-password-btn" class="text-sm font-medium text-orange-600 hover:text-orange-700">ลืมรหัสผ่าน?</button></div>
             </form>
             <div class="text-center"><p class="text-sm text-gray-600">ยังไม่มีบัญชี? <button type="button" id="show-register-btn" class="font-medium text-emerald-600 hover:text-emerald-500 font-bold">ลงทะเบียนที่นี่</button></p></div>
         </div>
     </div>`;
}

function renderRegisterPage() {
   return `
     <div class="flex items-center justify-center w-full py-8">
       <div class="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg border">
           <h1 class="text-2xl font-bold text-gray-800 text-center">สร้างบัญชีผู้ใช้งาน</h1>
           <form id="register-form" class="space-y-4">
           <div>
               <label for="reg-cid" class="text-sm font-medium text-gray-700">เลขบัตรประชาชน (CID)</label>
               <input id="reg-cid" name="reg-cid" type="text" inputmode="numeric" pattern="[0-9]{13}" maxlength="13" required placeholder="กรอกเลขบัตรประชาชน 13 หลัก" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,13)">
               <p class="text-xs text-gray-500 mt-1">ใช้ตรวจสอบการลงทะเบียนซ้ำ กรุณากรอกเป็นตัวเลข 13 หลัก</p>
           </div>
           <div><label for="reg-fullname" class="text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label><input id="reg-fullname" type="text" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"></div>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><label for="reg-position" class="text-sm font-medium text-gray-700">ตำแหน่ง</label><select id="reg-position" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-white"></select></div>
               <div><label for="reg-department" class="text-sm font-medium text-gray-700">กลุ่มงาน</label><select id="reg-department" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-white"></select></div>
           </div>
           <div><label for="reg-username" class="text-sm font-medium text-gray-700">ชื่อผู้ใช้งาน (Username)</label><input id="reg-username" type="text" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"></div>
           <div><label for="reg-email" class="text-sm font-medium text-gray-700">อีเมล์สำหรับแจ้งรหัสผ่าน</label><input id="reg-email" type="email" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="name@example.com"></div>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                   <label for="reg-password" class="text-sm font-medium text-gray-700">รหัสผ่าน</label>
                   <input id="reg-password" type="password" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md">
               </div>
               <div>
                   <label for="reg-confirm-password" class="text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
                   <input id="reg-confirm-password" type="password" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md">
               </div>
           </div>
           <p class="text-xs text-gray-500 mt-2">คำแนะนำ: รหัสผ่านต้องขึ้นต้นด้วยตัวอักษรภาษาอังกฤษ และตามด้วยตัวเลขหรือตัวอักษร</p>
           <div class="pt-2"><button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 font-bold transition">ยืนยันการลงทะเบียน</button></div>
           </form>
           <div class="text-center"><p class="text-sm text-gray-600">มีบัญชีอยู่แล้ว? <button type="button" id="show-login-btn" class="font-medium text-emerald-600 hover:text-emerald-500 font-bold">กลับไปหน้าเข้าสู่ระบบ</button></p></div>
       </div>
     </div>`;
}

function renderCalendarView() {
   return `
       <div class="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
           <div id="calendar-header" class="flex items-center justify-between mb-4">
               <button id="prev-month-btn" class="p-2 rounded-full hover:bg-gray-200 font-bold">&lt;</button>
               <h2 id="calendar-month-year" class="text-xl font-bold text-gray-800"></h2>
               <button id="next-month-btn" class="p-2 rounded-full hover:bg-gray-200 font-bold">&gt;</button>
           </div>
           <div id="calendar-grid" class="grid grid-cols-7 gap-1 text-center"></div>
       </div>
   `;
}
function renderCalendar(year, month, events = {}) {
   const calendarGrid = document.getElementById('calendar-grid');
   const calendarHeader = document.getElementById('calendar-month-year');
   if (!calendarGrid || !calendarHeader) return;
   calendarGrid.innerHTML = '';
   const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
   calendarHeader.textContent = `${monthNames[month]} ${year + 543}`;
   calendarHeader.dataset.year = year;
   calendarHeader.dataset.month = month;
   const daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
   daysOfWeek.forEach(day => {
       calendarGrid.innerHTML += `<div class="font-bold text-gray-600 py-2">${day}</div>`;
   });
   const firstDayOfMonth = new Date(year, month, 1).getDay();
   const daysInMonth = new Date(year, month + 1, 0).getDate();
   for (let i = 0; i < firstDayOfMonth; i++) {
       calendarGrid.innerHTML += `<div></div>`;
   }
   for (let day = 1; day <= daysInMonth; day++) {
       const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
       const dayEvents = events[dateStr] || [];
       const dayLeaves = appData.publicData.calendarLeaves ? appData.publicData.calendarLeaves[dateStr] || [] : [];
       const dayAttds = appData.publicData.calendarAttendance ? appData.publicData.calendarAttendance[dateStr] || {ontime:[], late:[]} : {ontime:[], late:[]};
       let badgeHtml = '';
       
       const hasAttds = dayAttds.ontime.length > 0 || dayAttds.late.length > 0;
       const dayPendingTrips = dayEvents.filter(e => e.isPending);
       const dayApprovedTrips = dayEvents.filter(e => !e.isPending);
       const hasAnyEvents = dayEvents.length > 0 || dayLeaves.length > 0 || hasAttds;
       
       if (hasAnyEvents) {
          badgeHtml = `<div class="absolute top-1 right-1 flex flex-wrap gap-1 justify-end max-w-[80%]">`;
          if(dayApprovedTrips.length > 0) badgeHtml += `<span class="bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center font-bold" title="ไปราชการ">${dayApprovedTrips.length}</span>`;
          if(dayPendingTrips.length > 0) badgeHtml += `<span class="bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center font-bold" title="ไปราชการรออนุมัติ">${dayPendingTrips.length}</span>`;
          if(dayLeaves.length > 0) badgeHtml += `<span class="bg-purple-500 text-white text-[10px] w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center font-bold" title="ลางาน">${dayLeaves.length}</span>`;
          if(dayAttds.ontime.length > 0) badgeHtml += `<span class="bg-blue-500 text-white text-[10px] w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center font-bold" title="มาทันเวลา">${dayAttds.ontime.length}</span>`;
          if(dayAttds.late.length > 0) badgeHtml += `<span class="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center font-bold" title="มาสาย">${dayAttds.late.length}</span>`;
          badgeHtml += `</div>`;
       }
       calendarGrid.innerHTML += `
           <div class="calendar-day border rounded-lg p-2 h-20 sm:h-24 relative ${hasAnyEvents ? 'has-events' : ''}" data-date="${dateStr}">
               <span class="text-sm font-bold text-slate-800">${day}</span>
               ${badgeHtml}
           </div>`;
   }
}


// --- WORKSPACE SHELL & TAB NAVIGATION ---
function renderAppShell() {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'calendar', label: 'ปฏิทิน' },
        { id: 'batchSign', label: 'แฟ้มรอลงนาม' },
        { id: 'checkin', label: 'ลงเวลาทำงาน' },
        { id: 'wfh', label: 'WFH' },
        { id: 'records', label: 'ไปราชการ' },
        { id: 'leaves', label: 'ลา' },
        { id: 'wfhReport', label: 'รายงาน WFH', isReport: true },
        { id: 'report', label: 'รายงานไปราชการ', isReport: true },
        { id: 'leaveReport', label: 'รายงานประวัติการลา', isReport: true },
        { id: 'personalSettings', label: 'ตั้งค่าส่วนตัว' }
    ];

    if (currentUser && ['AdminHR', 'HR', 'Admin'].includes(currentUser.Role)) {
        menuItems.splice(menuItems.length - 1, 0, 
            { id: 'users', label: 'จัดการผู้ใช้งาน' },
            { id: 'settings', label: 'ตั้งค่าระบบ' },
            { id: 'leaveEntitlementBulk', label: 'บันทึกสิทธิ/สถิติลา' }
        );
    }

    document.getElementById('app-container').innerHTML = `
        <div id="app-view" class="flex min-h-screen relative">
            <!-- Sidebar Backdrop for Mobile -->
            <div id="sidebar-backdrop" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 hidden md:hidden"></div>

            <!-- Sidebar Navigation Panel (Sticky, Hideable) -->
            <aside id="sidebar-panel" class="fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0f172a] text-slate-100 flex flex-col justify-between z-50 border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0">
                <div class="flex flex-col h-full justify-between">
                    <div>
                        <!-- Header -->
                        <div class="p-4 border-b border-slate-800/80 flex justify-between items-center bg-[#090d16]">
                            <div>
                                <h2 class="text-xs sm:text-sm font-extrabold text-white tracking-wide">ระบบปฏิบัติงาน สสจ.นครนายก</h2>
                                <p class="text-[10px] text-emerald-400 font-mono mt-0.5">NNYPHO HR System</p>
                            </div>
                            <button id="sidebar-close-btn" class="md:hidden text-slate-400 hover:text-white p-1 rounded-lg">
                                &times;
                            </button>
                        </div>

                        <!-- Navigation Links -->
                        <nav class="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]" id="main-tabs">
                            ${menuItems.map(item => `
                                <button data-tab="${item.id}" class="main-tab-btn w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-slate-300 hover:bg-slate-800/70 hover:text-white">
                                    <span>${item.label}</span>
                                </button>
                            `).join('')}
                        </nav>
                    </div>

                    <!-- User Profile Card -->
                    <div class="p-3 border-t border-slate-800/80 bg-[#090d16]">
                        <div class="flex items-center space-x-2.5">
                            <div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                ${currentUser.FullName ? currentUser.FullName.charAt(0) : 'U'}
                            </div>
                            <div class="overflow-hidden min-w-0 flex-1">
                                <p class="text-xs font-bold text-white truncate leading-tight">${currentUser.FullName}</p>
                                <p class="text-[10px] text-slate-400 truncate leading-tight mt-0.5">${currentUser.Position || currentUser.Role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <!-- Main Content Workspace -->
            <div class="flex-grow flex flex-col min-w-0 bg-slate-100 min-h-screen">
                <header class="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 flex justify-between items-center sticky top-0 z-30 shadow-xs">
                    <div class="flex items-center space-x-3">
                        <button id="hamburger-btn" class="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition focus:outline-none border border-slate-200 shadow-xs" title="ซ่อน/แสดง Sidebar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                        </button>
                        <div>
                            <h1 class="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight leading-tight">ระบบบริหารงานบุคคล สสจ.นครนายก</h1>
                            <p class="text-[11px] text-slate-500 font-medium hidden sm:block">MOPH Trip, Leaves, and Work From Home Administration System</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-2">
                        <!-- User Info Header -->
                        <div class="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200 mr-2">
                            <div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mr-1">
                                ${currentUser.FullName ? currentUser.FullName.charAt(0) : 'U'}
                            </div>
                            <div class="text-left">
                                <p class="text-xs font-bold text-slate-800 leading-none truncate max-w-[160px]">${currentUser.FullName}</p>
                                <p class="text-[10px] text-slate-500 mt-0.5 leading-none">${currentUser.Position || currentUser.Role}</p>
                            </div>
                        </div>

                        <!-- Logout Button -->
                        <button id="logout-btn" class="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-xs transition" title="ออกจากระบบ">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"/></svg>
                        </button>
                    </div>
                </header>

                <main class="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    ${menuItems.map(item => `<div id="content-${item.id}" class="main-tab-content hidden"></div>`).join('')}
                </main>
            </div>
        </div>
        <div id="modal-placeholder"></div>
    `;

    // Sidebar Toggle logic
    const sidebar = document.getElementById('sidebar-panel');
    const backdrop = document.getElementById('sidebar-backdrop');
    let isOpen = true;

    const toggleSidebar = () => {
        isOpen = !isOpen;
        if (window.innerWidth < 768) {
            if (sidebar) sidebar.classList.toggle('-translate-x-full', !isOpen);
            if (backdrop) backdrop.classList.toggle('hidden', !isOpen);
        } else {
            if (sidebar) {
                sidebar.classList.toggle('w-64', isOpen);
                sidebar.classList.toggle('w-0', !isOpen);
                sidebar.classList.toggle('opacity-0', !isOpen);
                sidebar.classList.toggle('overflow-hidden', !isOpen);
            }
        }
    };

    const hBtn = document.getElementById('hamburger-btn');
    if (hBtn) hBtn.onclick = toggleSidebar;
    const cBtn = document.getElementById('sidebar-close-btn');
    if (cBtn) cBtn.onclick = toggleSidebar;
    if (backdrop) backdrop.onclick = toggleSidebar;
}

async function showUserTabContent(tabId) {
    window.scrollTo(0, 0);
    document.querySelectorAll('.main-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.main-tab-btn').forEach(el => {
        const active = tabId === el.dataset.tab;
        el.classList.toggle('bg-emerald-600', active);
        el.classList.toggle('text-white', active);
        el.classList.toggle('shadow-md', active);
        el.classList.toggle('text-slate-300', !active);
    });

    const contentEl = document.getElementById(`content-${tabId}`);
    if (contentEl) contentEl.classList.remove('hidden');

    switch (tabId) {
        case 'calendar':
            if (contentEl) {
                contentEl.innerHTML = renderCalendarView();
                renderCalendar(getCEYear(), new Date().getMonth(), appData.publicData ? appData.publicData.calendarEvents || {} : {});
            }
            break;
        case 'checkin':
            if (typeof renderCheckinPage === 'function') renderCheckinPage();
            break;
        case 'wfh':
            if (typeof renderWFHPage === 'function') renderWFHPage();
            break;
        case 'records':
            if (typeof renderRecordsPage === 'function') renderRecordsPage();
            break;
        case 'leaves':
            if (typeof renderLeavesPage === 'function') renderLeavesPage();
            break;
        case 'batchSign':
            if (typeof renderBatchSignPage === 'function') renderBatchSignPage();
            break;
        case 'dashboard':
            if (typeof renderDashboardPage === 'function') renderDashboardPage();
            break;
        case 'personalSettings':
            if (typeof renderPersonalSettingsPage === 'function') renderPersonalSettingsPage();
            break;
        case 'users':
            if (typeof renderUsersPage === 'function') renderUsersPage();
            break;
        case 'settings':
            if (typeof renderSettingsPage === 'function') renderSettingsPage();
            break;
        case 'leaveEntitlementBulk':
            if (typeof renderLeaveEntitlementBulkPage === 'function') renderLeaveEntitlementBulkPage();
            break;
        case 'wfhReport':
            if (typeof renderWfhReportPage === 'function') renderWfhReportPage();
            break;
        case 'report':
            if (typeof renderUserReportPage === 'function') renderUserReportPage();
            break;
        case 'leaveReport':
            if (typeof renderLeaveReportPage === 'function') renderLeaveReportPage();
            break;
    }
}


// --- SYSTEM INITIALIZATION & SESSION ROUTING ---
async function loadPublicPage() {
    renderPublicShell();
    showPublicContent('calendar');

    showLoading(true, 'กำลังโหลดข้อมูลสถิติของสำนักงาน...');
    try {
        const response = await serverCall('getPublicData');
        showLoading(false);
        if (response && response.success) {
            appData.publicData = response.payload || {};
            // Render default calendar
            const now = new Date();
            renderCalendar(now.getFullYear(), now.getMonth(), appData.publicData.calendarEvents || {});
            
            // Render KPI stats
            const kpiRes = await serverCall('getPublicKpis');
            if (kpiRes && kpiRes.success) {
                const kpis = kpiRes.payload || { totalUsers: 0, totalTrips: 0, inProvinceTrips: 0, outOfProvinceTrips: 0, totalBudget: 0 };
                const kpiContainer = document.getElementById('public-kpis-container');
                if (kpiContainer) {
                    kpiContainer.innerHTML = renderKPIWidgets(kpis, "ทั้งปีงบประมาณ");
                }
            }

            // Render Public Chart.js statistics
            const chartRes = await serverCall('getPublicChartsData');
            if (chartRes && chartRes.success) {
                renderPublicCharts(chartRes.payload);
            }
        }
    } catch (e) {
        showLoading(false);
        console.error("Failed to load public data:", e);
    }

    // Auto-login session check (Remember Me check)
    const storedUser = sessionStorage.getItem('nnyphoUser') || localStorage.getItem('nnyphoDeviceUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            loginSuccessRoute();
        } catch (e) {
            console.error("Session restore failed:", e);
        }
    }
}

async function loginSuccessRoute() {
    showLoading(true, 'กำลังเข้าสู่ห้องทำงานดิจิทัลของคุณ...');
    try {
        const response = await serverCall('getGlobalData', currentUser);
        showLoading(false);
        if (response && response.success) {
            appData = { ...appData, ...(response.payload || {}) };
            
            // Render full workspace shell
            renderAppShell();
            
            // Set default landing tab
            showUserTabContent('checkin');
            
            // Populate initial notification badges
            updateNotificationBadge();
        } else {
            Swal.fire('การโหลดเซสชันผิดพลาด', response.message || 'ข้อมูลผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง', 'error');
            handleLogout();
        }
    } catch (e) {
        showLoading(false);
        Swal.fire('เชื่อมต่อล้มเหลว', 'ไม่สามารถเชื่อมโยงระบบ: ' + e.message, 'error');
        handleLogout();
    }
}



// --- FORM HANDLING ---
async function submitLogin(e) {
    e.preventDefault();
    const uInput = document.getElementById('username');
    const pInput = document.getElementById('password');
    const rememberMe = document.getElementById('remember_me');

    if (!uInput || !pInput) return;

    const username = uInput.value.trim();
    const password = pInput.value;

    showLoading(true, 'กำลังสแกนยืนยันชื่อผู้ใช้...');
    try {
        const response = await serverCall('loginUser', { username, password });
        showLoading(false);
        if (response && response.success) {
            currentUser = response.payload || response.user;
            
            // Save Session
            sessionStorage.setItem('nnyphoUser', JSON.stringify(currentUser));
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('nnyphoDeviceUser', JSON.stringify(currentUser));
            }

            Swal.fire({
                icon: 'success',
                title: 'ยินดีต้อนรับเข้าสู่ระบบ',
                text: response.message,
                timer: 1500,
                showConfirmButton: false
            });

            loginSuccessRoute();
        } else {
            Swal.fire('ข้อมูลเข้าสู่ระบบไม่ถูกต้อง', response.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านผิดพลาด', 'error');
        }
    } catch (err) {
        showLoading(false);
        Swal.fire('ผิดพลาด', err.message, 'error');
    }
}

async function submitRegister(e) {
    e.preventDefault();
    const cid = document.getElementById('reg-cid').value.trim();
    const fullname = document.getElementById('reg-fullname').value.trim();
    const position = document.getElementById('reg-position').value;
    const department = document.getElementById('reg-department').value;
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPassword) {
        Swal.fire('รหัสผ่านไม่ตรงกัน', 'กรุณายืนยันรหัสผ่านใหม่อีกครั้งให้ถูกต้องตรงกัน', 'warning');
        return;
    }

    showLoading(true, 'กำลังตรวจสอบคุณสมบัติและบันทึกผู้ใช้ใหม่...');
    try {
        const payload = { cid, fullname, position, department, username, email, password };
        const response = await serverCall('registerUser', payload);
        showLoading(false);
        if (response && response.success) {
            Swal.fire({
                icon: 'success',
                title: 'ลงทะเบียนสำเร็จ',
                text: response.message || 'กรุณารอการตรวจสอบและอนุมัติสิทธิ์สลักชื่อจากผู้จัดการทรัพยากรบุคคล',
                confirmButtonText: 'กลับไปหน้าล็อคอิน',
                confirmButtonColor: '#10b981'
            }).then(() => {
                showPublicContent('login');
            });
        } else {
            Swal.fire('ลงทะเบียนล้มเหลว', response.message, 'error');
        }
    } catch (err) {
        showLoading(false);
        Swal.fire('ข้อผิดพลาด', err.message, 'error');
    }
}

// --- DELEGATE CLICK EVENT LISTENERS ---
document.addEventListener('click', function(e) {
    // 1. Sidebar tab navigation
    const tabBtn = e.target.closest('.main-tab-btn');
    if (tabBtn) {
        const tabId = tabBtn.dataset.tab;
        showUserTabContent(tabId);
        return;
    }

    // 2. Public tab buttons
    const pubTabBtn = e.target.closest('.public-tab-btn');
    if (pubTabBtn) {
        const subTabId = pubTabBtn.dataset.tab;
        showPublicContent(subTabId);
        return;
    }

    // 3. Logout
    if (e.target.id === 'logout-btn') {
        handleLogout();
        return;
    }

    // 4. Toggle password visibility
    if (e.target.closest('#toggle-password-visibility')) {
        const pwdInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eye-icon');
        const eyeSlashIcon = document.getElementById('eye-slash-icon');
        if (pwdInput && eyeIcon && eyeSlashIcon) {
            const isPwd = pwdInput.type === 'password';
            pwdInput.type = isPwd ? 'text' : 'password';
            eyeIcon.classList.toggle('hidden', !isPwd);
            eyeSlashIcon.classList.toggle('hidden', isPwd);
        }
        return;
    }

    // 5. Calendar click cell
    const calendarCell = e.target.closest('.calendar-day');
    if (calendarCell) {
        const dateStr = calendarCell.dataset.date;
        if (dateStr) {
            handleCalendarCellClick(dateStr);
        }
    }
});

// Helper for calendar item click
function handleCalendarCellClick(dateStr) {
    // Collect active events
    const dayTrips = (appData.publicData.calendarEvents && appData.publicData.calendarEvents[dateStr]) || [];
    const dayLeaves = (appData.publicData.calendarLeaves && appData.publicData.calendarLeaves[dateStr]) || [];
    const dayAttds = (appData.publicData.calendarAttendance && appData.publicData.calendarAttendance[dateStr]) || { ontime: [], late: [] };

    if (dayTrips.length === 0 && dayLeaves.length === 0 && dayAttds.ontime.length === 0 && dayAttds.late.length === 0) {
        return; // Empty
    }

    let html = `<div class="text-left text-xs sm:text-sm space-y-4 max-h-[60vh] overflow-y-auto font-medium p-1">`;
    
    if (dayTrips.length > 0) {
        html += `<div class="space-y-2">
            <h4 class="font-bold text-indigo-700 border-b pb-1">🚗 รายการไปราชการ (${dayTrips.length} รายการ)</h4>`;
        dayTrips.forEach(t => {
            html += `<div class="p-2 bg-slate-50 border rounded-xl">
                <p class="font-bold text-slate-800">${escHtml(t.FullName)}</p>
                <p class="text-xs text-slate-500">${escHtml(t.Position)} - ${escHtml(t.Department)}</p>
                <p class="text-xs text-indigo-600 mt-1 font-semibold">📍 ${escHtml(t.Place)}</p>
                <p class="text-[10px] text-slate-400">วัตถุประสงค์: ${escHtml(t.Purpose)}</p>
            </div>`;
        });
        html += `</div>`;
    }

    if (dayLeaves.length > 0) {
        html += `<div class="space-y-2">
            <h4 class="font-bold text-emerald-700 border-b pb-1">🌿 รายการลางาน (${dayLeaves.length} รายการ)</h4>`;
        dayLeaves.forEach(l => {
            html += `<div class="p-2 bg-slate-50 border rounded-xl">
                <p class="font-bold text-slate-800">${escHtml(l.FullName)}</p>
                <p class="text-xs text-emerald-700 font-bold">${escHtml(l.LeaveType)}</p>
                <p class="text-[10px] text-slate-400">เหตุผล: ${escHtml(l.Reason)}</p>
            </div>`;
        });
        html += `</div>`;
    }

    if (dayAttds.ontime.length > 0 || dayAttds.late.length > 0) {
        html += `<div class="space-y-2">
            <h4 class="font-bold text-slate-700 border-b pb-1">⏰ เวลาบันทึกเข้างานประจำวัน</h4>`;
        
        if (dayAttds.ontime.length > 0) {
            html += `<p class="text-[11px] font-bold text-emerald-600">มาทันเวลา:</p>
            <div class="flex flex-wrap gap-1.5 pb-2">
                ${dayAttds.ontime.map(o => `<span class="px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-[10px] font-bold">${escHtml(o.name)} (${o.time})</span>`).join('')}
            </div>`;
        }

        if (dayAttds.late.length > 0) {
            html += `<p class="text-[11px] font-bold text-rose-500">มาสาย:</p>
            <div class="flex flex-wrap gap-1.5">
                ${dayAttds.late.map(l => `<span class="px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-[10px] font-bold">${escHtml(l.name)} (${l.time})</span>`).join('')}
            </div>`;
        }
        
        html += `</div>`;
    }

    html += `</div>`;

    Swal.fire({
        title: 'กิจกรรมและเวลาปฏิบัติงาน: ' + formatDateLong(dateStr),
        html: html,
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'rounded-3xl' }
    });
}

// --- FORM SUBMIT BINDERS ---
document.addEventListener('submit', function(e) {
    if (e.target.id === 'login-form') {
        submitLogin(e);
    } else if (e.target.id === 'register-form') {
        submitRegister(e);
    }
});

// START SYSTEM ON PAGE LOAD
document.addEventListener('DOMContentLoaded', loadPublicPage);
