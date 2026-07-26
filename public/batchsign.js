// --- BATCH SIGN / DIGITAL SIGNATURE PAD MODULE ---
function renderBatchSignPage() {
    const el = document.getElementById('content-batchSign');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="space-y-1">
                    <h2 class="text-2xl font-black text-slate-800">แฟ้มเสนอลงนามอิเล็กทรอนิกส์ (Batch Digital Sign)</h2>
                    <p class="text-sm text-slate-500 font-medium">เซ็นอนุมัติเอกสาร ไปราชการ ใบลา และ WFH ในขั้นตอนเสนอลงนามของคุณแบบกลุ่มเดียว</p>
                </div>
                <div class="flex items-center gap-2">
                    <button id="btn-batch-approve" onclick="handleBatchSignSubmit('Approved')" disabled class="px-5 py-3 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-md shadow-emerald-100 transition-all flex items-center gap-2">
                        ✅ อนุมัติกลุ่มที่เลือก
                    </button>
                </div>
            </div>

            <div id="batch-sign-container">
                <div class="text-center py-12 text-slate-400 font-semibold text-xs">กำลังตรวจสอบเอกสารรอลงนาม...</div>
            </div>
        </div>
    `;

    loadBatchSignRecords();
}

async function loadBatchSignRecords() {
    const container = document.getElementById('batch-sign-container');
    if (!container) return;

    try {
        // We retrieve the latest global data of trips, leaves, and wfh to filter items matching currentUser step
        const pTrips = serverCall('getOffSiteRecords', currentUser);
        const pLeaves = serverCall('getLeaveRecords', currentUser);
        const pWfh = serverCall('getWFHRequests', currentUser);

        const [rTrips, rLeaves, rWfh] = await Promise.all([pTrips, pLeaves, pWfh]);

        if (rTrips.success) appData.records = rTrips.payload || [];
        if (rLeaves.success) appData.leaves = rLeaves.payload || [];
        if (rWfh.success) window.wfhRecords = rWfh.payload || [];

        const pendingItems = getPendingItems(currentUser.Role);
        window._pendingBatchItems = pendingItems;

        renderBatchSignList();
    } catch (e) {
        container.innerHTML = `<div class="text-center py-8 text-rose-500 text-xs font-semibold">เกิดข้อผิดพลาดในการโหลดแฟ้มรอลงนาม: ${e.message}</div>`;
    }
}

function renderBatchSignList() {
    const container = document.getElementById('batch-sign-container');
    if (!container) return;

    const items = window._pendingBatchItems || [];

    if (items.length === 0) {
        container.innerHTML = `<div class="bg-white border rounded-2xl py-12 text-center text-slate-400 font-semibold text-xs shadow-sm">📍 สบายใจได้! ไม่มีเอกสารคงค้างรอเสนอลงนามในขั้นตอนนี้ของคุณ</div>`;
        const btn = document.getElementById('btn-batch-approve');
        if (btn) btn.disabled = true;
        return;
    }

    // Enable approve button
    const btn = document.getElementById('btn-batch-approve');
    if (btn) btn.disabled = false;

    container.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <label class="inline-flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input type="checkbox" id="batch-select-all" onchange="handleBatchSignSelectAll(this)" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                    <span>เลือกเอกสารทั้งหมด (${items.length} รายการ)</span>
                </label>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100 text-left">
                    <thead class="bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                        <tr>
                            <th class="p-4 w-12 text-center">เลือก</th>
                            <th class="p-4">ประเภท</th>
                            <th class="p-4">ผู้ยื่นเสนอ</th>
                            <th class="p-4">รายละเอียดคำขอ</th>
                            <th class="p-4">วันที่ดำเนินการ</th>
                            <th class="p-4 text-center">ดูรายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700 text-xs sm:text-sm">
                        ${items.map((r, idx) => {
                            let typeLabel = '';
                            let typeBadge = '';
                            let detail = '';
                            let keyId = '';

                            if (r.type === 'trip') {
                                typeLabel = 'ไปราชการ';
                                typeBadge = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                                detail = `สถานที่: ${r.Place} | วัตถุประสงค์: ${r.Purpose}`;
                                keyId = `trip_${r.RecordID}`;
                            } else if (r.type === 'leave') {
                                typeLabel = r.LeaveType || 'ใบลา';
                                typeBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                                detail = `เหตุผล: ${r.Reason}`;
                                keyId = `leave_${r.LeaveID}`;
                            } else if (r.type === 'wfh') {
                                typeLabel = 'ขอ WFH';
                                typeBadge = 'bg-orange-50 text-orange-700 border-orange-100';
                                detail = `เหตุผล: ${r.Reason} | แผนงาน: ${r.WorkPlan}`;
                                keyId = `wfh_${r.RequestID}`;
                            }

                            return `
                                <tr class="hover:bg-slate-50/50 transition">
                                    <td class="p-4 text-center">
                                        <input type="checkbox" name="batch-item" value="${keyId}" class="batch-item-chk w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                                    </td>
                                    <td class="p-4">
                                        <span class="px-2 py-0.5 text-xs font-bold rounded-lg border ${typeBadge}">${typeLabel}</span>
                                    </td>
                                    <td class="p-4 font-bold text-slate-800">${escHtml(r.FullName)}</td>
                                    <td class="p-4 font-medium text-slate-500 truncate max-w-xs">${escHtml(detail)}</td>
                                    <td class="p-4 font-mono font-bold text-slate-600">${formatDate(r.StartDate)} - ${formatDate(r.EndDate)} (${r.TotalDays} วัน)</td>
                                    <td class="p-4 text-center">
                                        <button onclick="handleViewItemDetails('${r.type}', '${r.RecordID || r.LeaveID || r.RequestID}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-xs">ตรวจสอบ</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function handleBatchSignSelectAll(chk) {
    document.querySelectorAll('.batch-item-chk').forEach(el => {
        el.checked = chk.checked;
    });
}

function handleViewItemDetails(type, id) {
    if (type === 'trip') {
        renderDetailsModal(id);
    } else if (type === 'leave') {
        const item = appData.leaves.find(x => x.LeaveID === id);
        if (item) viewLeaveDetails(item);
    } else if (type === 'wfh') {
        const item = window.wfhRecords.find(x => x.RequestID === id);
        if (item) viewWFHDetails(JSON.stringify(item));
    }
}

function handleBatchSignSubmit(status) {
    const checkedBoxes = document.querySelectorAll('.batch-item-chk:checked');
    if (checkedBoxes.length === 0) {
        Swal.fire('ไม่พบรายการที่เลือก', 'กรุณาติ๊กเลือกอย่างน้อย 1 รายการเพื่อเซ็นอนุมัติ', 'warning');
        return;
    }

    const selectedKeys = Array.from(checkedBoxes).map(cb => cb.value);

    // Prompt for signature pad
    openSignPadModal(async (signatureBase64) => {
        showLoading(true, "กำลังส่งแบบร่างสลักหลังอนุมัติกลุ่ม...");
        try {
            const payload = {
                selectedKeys, // Format: ["trip_ID", "leave_ID"]
                status,       // "Approved" / "Rejected"
                signatureBase64,
                approverRole: currentUser.Role,
                approverName: currentUser.FullName
            };

            const response = await serverCall('submitBatchSignatures', payload, currentUser);
            showLoading(false);

            if (response && response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'ลงนามเรียบร้อยแล้ว',
                    text: response.message,
                    timer: 2500,
                    showConfirmButton: false
                });
                renderBatchSignPage();
                updateNotificationBadge();
            } else {
                Swal.fire('เกิดข้อผิดพลาด', response.message || 'ไม่สามารถลงนามได้สำเร็จ', 'error');
            }
        } catch (e) {
            showLoading(false);
            Swal.fire('เกิดข้อผิดพลาด', e.message, 'error');
        }
    });
}

function openSignPadModal(onSaveCallback) {
    Swal.fire({
        title: '✍️ วาดลายเซ็นอิเล็กทรอนิกส์',
        html: `
            <div class="space-y-4">
                <p class="text-xs text-slate-500 font-medium">กรุณาจรดปากกาหรือใช้นิ้วเขียนลายเซ็นดิจิทัลของคุณลงในกรอบด้านล่าง</p>
                <div class="relative w-full max-w-sm mx-auto h-40 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden cursor-crosshair">
                    <canvas id="signature-canvas" class="w-full h-full touch-none"></canvas>
                </div>
                <div class="flex justify-center gap-2">
                    <button id="btn-clear-sig" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition">🧹 ล้างลายมือ</button>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '💾 บันทึกและเสนอสลักลายเซ็น',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#64748b',
        customClass: { popup: 'rounded-3xl' },
        didOpen: () => {
            const canvas = document.getElementById('signature-canvas');
            if (!canvas) return;

            // Make sure canvas internal resolution matches display size
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
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

            // Mouse Events
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

            // Touch Events (for mobile/tablet screens)
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

            // Clear Button
            document.getElementById('btn-clear-sig').addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        },
        preConfirm: () => {
            const canvas = document.getElementById('signature-canvas');
            if (!canvas) return false;

            // Check if canvas has anything drawn (not blank)
            const ctx = canvas.getContext('2d');
            const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
            const isBlank = !buffer.some(color => color !== 0);

            if (isBlank) {
                Swal.showValidationMessage('กรุณาวาดสลักลายมือของคุณลงในช่องลายเซ็นก่อนส่งบันทึก');
                return false;
            }

            return canvas.toDataURL('image/png').split(',')[1];
        }
    }).then((result) => {
        if (result.isConfirmed && typeof onSaveCallback === 'function') {
            onSaveCallback(result.value);
        }
    });
}
