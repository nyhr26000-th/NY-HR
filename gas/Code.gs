/**
 * Google Apps Script for HR System - Nakhon Nayok PHO (Optimized v6.0)
 * Target Account: nyhr26000@gmail.com
 * Database Spreadsheet: https://docs.google.com/spreadsheets/d/1M8-tKhUIg7OkQDg0lTvl5iQH8awPsKTrMocQodq9rkY/edit
 * 
 * Major Enhancements in v6.0:
 * 1. HIGH-SPEED CHECK-IN / CHECK-OUT: Reads only recent 200 rows instead of full sheet scan.
 * 2. AUTOMATIC DRIVE FOLDER CREATION: Creates structured folders with public view permissions.
 * 3. AUTOMATED DRIVE MIGRATION: Recursively transfers files from arpasree104@gmail.com shared folders.
 * 4. VERCEL REST API SUPPORT: JSON API endpoint for external frontend deployment.
 */

// --- GLOBAL CONSTANTS ---
const DEFAULT_SPREADSHEET_ID = '1M8-tKhUIg7OkQDg0lTvl5iQH8awPsKTrMocQodq9rkY';
const SPREADSHEET_ID_KEY = 'spreadsheetId_NnyPHO_v6';
const DRIVE_FOLDER_ID_KEY = 'driveFolderId_NnyPHO_v6';
const ROOT_FOLDER_NAME = 'สสจ.นย_เอกสารบันทึกไปราชการ_NEW';
const HOME_PROVINCE = 'นครนายก';

// Shared Folders from arpasree104@gmail.com
const OLD_SHARED_FOLDERS = [
  '1lO3wm5XZpnZ4aq7LVmO1vj1__0l2AIJt',
  '1EnY73K4NaAGCbopf3HwgxFAHBQnr0AKl'
];

// =================================================================
// --- WEB APP REST API HANDLERS (FOR VERCEL / EXTERNAL FRONTEND) ---
// =================================================================

function doPost(e) {
  try {
    let contents = {};
    if (e && e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      contents = e.parameter;
    }
    
    const action = contents.action || contents.functionName;
    const payload = contents.payload || contents.args || [];
    const userInfo = contents.userInfo || null;

    let result = { success: false, message: 'Unknown action: ' + action };

    switch (action) {
      case 'loginUser':
        result = loginUser(contents.username || payload[0], contents.password || payload[1]);
        break;

      case 'loginAndGetPayload':
        result = loginAndGetPayload(contents.username || payload[0], contents.password || payload[1]);
        break;

      case 'getInitialPayloadForUser':
        result = getInitialPayloadForUser(contents.userInfo || payload[0]);
        break;

      case 'getEssentialBackgroundData':
        result = getEssentialBackgroundData();
        break;

      case 'checkIn':
        result = checkIn(contents.sessionData || payload[0], contents.userInfo || payload[1]);
        break;

      case 'checkOut':
        result = checkOut(contents.attendId || payload[0], contents.sessionData || payload[1], contents.userInfo || payload[2]);
        break;

      case 'getTodayAttendance':
      case 'getTodayAttendanceRealTime':
        result = getTodayAttendanceRealTime(contents.userId || payload[0]);
        break;

      case 'getMyAttendanceHistory':
        result = getMyAttendanceHistory(contents.userId || payload[0], contents.startDate || payload[1], contents.endDate || payload[2]);
        break;

      case 'getAllAttendanceHistory':
        result = getAllAttendanceHistory(contents.startDate || payload[0], contents.endDate || payload[1], contents.department || payload[2]);
        break;

      case 'saveRecord':
        result = saveRecord(contents.recordData || payload[0], contents.userInfo || payload[1]);
        break;

      case 'getOffSiteRecords':
        result = { success: true, payload: getOffSiteRecords(contents.userInfo || payload[0]) };
        break;

      case 'updateRecordStatus':
        result = updateRecordStatus(payload[0], payload[1], payload[2], payload[3], payload[4]);
        break;

      case 'deleteRecord':
        result = deleteRecord(payload[0], payload[1], payload[2]);
        break;

      case 'saveLeaveRecord':
        result = saveLeaveRecord(contents.recordData || payload[0], contents.userInfo || payload[1]);
        break;

      case 'getLeaveRecords':
        result = { success: true, payload: getLeaveRecords(contents.userInfo || payload[0]) };
        break;

      case 'updateLeaveRecordStatus':
        result = updateLeaveRecordStatus(payload[0], payload[1], payload[2], payload[3], payload[4]);
        break;

      case 'deleteLeaveRecord':
        result = deleteLeaveRecord(payload[0], payload[1]);
        break;

      case 'generateLeavePdfOnServer':
        result = generateLeavePdfOnServer(payload[0], payload[1]);
        break;

      case 'saveWFHRequest':
        result = saveWFHRequest(contents.payload || payload[0], contents.userInfo || payload[1]);
        break;

      case 'getWFHRequests':
        result = getWFHRequests(contents.userInfo || payload[0]);
        break;

      case 'updateWFHRecordStatus':
        result = updateWFHRecordStatus(payload[0], payload[1], payload[2], payload[3], payload[4]);
        break;

      case 'deleteWFHRecord':
        result = deleteWFHRecord(payload[0], payload[1]);
        break;

      case 'updateWFHAssigns':
        result = updateWFHAssigns(payload[0], payload[1]);
        break;

      case 'getPublicDashboardData':
        result = getPublicDashboardData();
        break;

      case 'getHrExecutiveDashboardData':
        result = getHrExecutiveDashboardData(contents.filters || payload[0]);
        break;

      case 'getFilteredDashboardData':
        result = getFilteredDashboardData(contents.filters || payload[0]);
        break;

      case 'updateUserProfile':
        result = updateUserProfile(payload[0], payload[1]);
        break;

      case 'updateUserSignature':
        result = updateUserSignature(payload[0], payload[1], payload[2]);
        break;

      case 'registerUser':
        result = registerUser(contents.userData || payload[0]);
        break;

      case 'requestPasswordReminder':
        result = requestPasswordReminder(contents.identifier || payload[0]);
        break;

      case 'getAllUsersForAdmin':
        result = { success: true, payload: getAllUsersForAdmin() };
        break;

      case 'toggleUserActivation':
        result = toggleUserActivation(payload[0], payload[1], payload[2]);
        break;

      case 'updateUserRole':
        result = updateUserRole(payload[0], payload[1], payload[2]);
        break;

      case 'getLeaveEntitlementBulkData':
        result = getLeaveEntitlementBulkData(payload[0], payload[1]);
        break;

      case 'updateLeaveEntitlementForUser':
        result = updateLeaveEntitlementForUser(payload[0], payload[1], payload[2], payload[3]);
        break;

      case 'getLeaveHistoryReportData':
        result = getLeaveHistoryReportData(payload[0], payload[1]);
        break;

      case 'getOfficeLeaveReportData':
        result = getOfficeLeaveReportData(payload[0], payload[1]);
        break;

      case 'createDraftWfhReport':
        result = createDraftWfhReport(payload[0], payload[1]);
        break;

      case 'getWFHReportRecords':
        result = getWFHReportRecords();
        break;

      case 'deleteWFHReportRecord':
        result = deleteWFHReportRecord(payload[0], payload[1]);
        break;

      case 'getFileBase64':
        result = getFileBase64(payload[0]);
        break;

      case 'saveSignedPdfForRecord':
        result = saveSignedPdfForRecord(payload[0], payload[1], payload[2], payload[3], payload[4]);
        break;

      case 'updateSignedRecord':
        result = updateSignedRecord(payload[0], payload[1], payload[2], payload[3], payload[4], payload[5]);
        break;

      case 'migrateOldFoldersToNewAccount':
        result = migrateOldFoldersToNewAccount();
        break;

      case 'clearCache':
        result = clearCache();
        break;

      default:
        result = { success: false, message: 'Invalid API Action: ' + action };
        break;
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Server Exception: ' + err.toString(),
      stack: err.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return doPost(e);
  }
  
  let templateName = 'index';
  if (e && e.parameter && e.parameter.page === 'timelog') templateName = 'timelog';
  else if (e && e.parameter && e.parameter.page === 'checkin') templateName = 'checkin';

  try {
    return HtmlService.createTemplateFromFile(templateName).evaluate()
      .setTitle('ระบบบันทึกการไปราชการ / ลงเวลาทำงาน สสจ.นครนายก')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'online',
      message: 'MOPH HR System API is active for nyhr26000@gmail.com',
      spreadsheetId: DEFAULT_SPREADSHEET_ID
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =================================================================
// --- HIGH-SPEED AUTOMATED FOLDER MANAGEMENT ---
// =================================================================

/**
 * Ensures all required Google Drive folders exist under the new account (nyhr26000@gmail.com).
 * Returns the folder object for a given folder key.
 */
function getOrCreateAppFolder_(subFolderName) {
  let mainFolderId = PropertiesService.getScriptProperties().getProperty(DRIVE_FOLDER_ID_KEY);
  let mainFolder;

  if (mainFolderId) {
    try {
      mainFolder = DriveApp.getFolderById(mainFolderId);
    } catch (e) {
      mainFolderId = null;
    }
  }

  if (!mainFolderId || !mainFolder) {
    const existing = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
    if (existing.hasNext()) {
      mainFolder = existing.next();
    } else {
      mainFolder = DriveApp.createFolder(ROOT_FOLDER_NAME);
    }
    mainFolderId = mainFolder.getId();
    PropertiesService.getScriptProperties().setProperty(DRIVE_FOLDER_ID_KEY, mainFolderId);
    try {
      mainFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch(e) {}
  }

  if (!subFolderName) return mainFolder;

  const subIt = mainFolder.getFoldersByName(subFolderName);
  if (subIt.hasNext()) {
    return subIt.next();
  } else {
    const subFolder = mainFolder.createFolder(subFolderName);
    try {
      subFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch(e) {}
    return subFolder;
  }
}

// =================================================================
// --- AUTOMATED DRIVE MIGRATION (FROM ARPASREE104 TO NYHR26000) ---
// =================================================================

/**
 * Automatically transfers/copies all files & subfolders from the 2 old shared folders
 * (arpasree104@gmail.com) into a organized folder under nyhr26000@gmail.com.
 */
function migrateOldFoldersToNewAccount() {
  const logDetails = [];
  let copiedFilesCount = 0;
  let copiedFoldersCount = 0;

  try {
    const rootTarget = getOrCreateAppFolder_('Migrated_Files_Arpasree104');
    logDetails.push('สร้าง/ใช้โฟลเดอร์ปลายทาง: ' + rootTarget.getName() + ' (' + rootTarget.getUrl() + ')');

    OLD_SHARED_FOLDERS.forEach(folderId => {
      try {
        const sourceFolder = DriveApp.getFolderById(folderId);
        logDetails.push('--- เริ่มย้ายข้อมูลจากโฟลเดอร์ต้นทาง ID: ' + folderId + ' (' + sourceFolder.getName() + ') ---');
        
        const destSubFolder = rootTarget.createFolder(sourceFolder.getName() + '_Transferred');
        try {
          destSubFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch(e) {}

        const counts = copyDriveFolderRecursive_(sourceFolder, destSubFolder, logDetails);
        copiedFilesCount += counts.files;
        copiedFoldersCount += counts.folders + 1;

      } catch (err) {
        logDetails.push('⚠️ ไม่สามารถเข้าถึงหรือคัดลอกโฟลเดอร์ ID ' + folderId + ': ' + err.message);
      }
    });

    const msg = `ย้ายข้อมูลเสร็จสิ้น! สำเร็จรวม ${copiedFilesCount} ไฟล์ ใน ${copiedFoldersCount} โฟลเดอร์`;
    logDetails.push(msg);

    return {
      success: true,
      message: msg,
      copiedFilesCount: copiedFilesCount,
      copiedFoldersCount: copiedFoldersCount,
      destinationFolderUrl: rootTarget.getUrl(),
      details: logDetails
    };

  } catch (e) {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการย้ายข้อมูล: ' + e.message,
      details: logDetails
    };
  }
}

function copyDriveFolderRecursive_(source, target, logDetails) {
  let fileCount = 0;
  let folderCount = 0;

  // 1. Copy Files
  const files = source.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    try {
      const copy = file.makeCopy(file.getName(), target);
      try {
        copy.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch(e) {}
      fileCount++;
    } catch(e) {
      if (logDetails) logDetails.push('  ✖ คัดลอกไฟล์ล้มเหลว (' + file.getName() + '): ' + e.message);
    }
  }

  // 2. Copy Subfolders recursively
  const subfolders = source.getFolders();
  while (subfolders.hasNext()) {
    const sub = subfolders.next();
    try {
      const newSub = target.createFolder(sub.getName());
      try {
        newSub.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch(e) {}
      folderCount++;
      const res = copyDriveFolderRecursive_(sub, newSub, logDetails);
      fileCount += res.files;
      folderCount += res.folders;
    } catch(e) {
      if (logDetails) logDetails.push('  ✖ สร้างโฟลเดอร์ย่อยล้มเหลว (' + sub.getName() + '): ' + e.message);
    }
  }

  return { files: fileCount, folders: folderCount };
}

// =================================================================
// --- SPEED OPTIMIZED CHECK-IN & CHECK-OUT LOGIC ---
// =================================================================

/**
 * HIGH-SPEED CHECKIN
 * Optimized to search only the bottom 200 rows of TimeAttendance sheet.
 */
function checkIn(sessionData, userInfo) {
  try {
    if (!userInfo || !userInfo.UserID) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่' };
    }

    const sheet = getSheetTA('TimeAttendance');
    const now = new Date();
    const todayStr = Utilities.formatDate(now, 'Asia/Bangkok', 'yyyy-MM-dd');
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow < 1) {
      setupTimeAttendanceSheets();
    }

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => typeof h === 'string' ? h.trim() : h);
    const idCol = headers.indexOf('AttendID');
    const dateCol = headers.indexOf('Date');
    const userCol = headers.indexOf('UserID');
    const delCol = headers.indexOf('IsDeleted');
    const notesCol = headers.indexOf('Notes');

    // Read only last 200 rows for high performance
    const maxRowsToRead = 200;
    const startRow = Math.max(2, lastRow - maxRowsToRead + 1);
    const numRows = Math.max(1, lastRow - startRow + 1);

    let existingRowIndexInSheet = -1;
    let existingRowData = null;

    if (lastRow >= 2) {
      const recentValues = sheet.getRange(startRow, 1, numRows, lastCol).getValues();
      for (let i = recentValues.length - 1; i >= 0; i--) {
        const row = recentValues[i];
        if (String(row[userCol]) === String(userInfo.UserID) && row[delCol] !== true && String(row[delCol]).toLowerCase() !== 'true') {
          let rDate = row[dateCol];
          if (!rDate && row[headers.indexOf('CheckInTime')]) rDate = row[headers.indexOf('CheckInTime')];
          if (rDate instanceof Date) rDate = Utilities.formatDate(rDate, 'Asia/Bangkok', 'yyyy-MM-dd');
          else if (typeof rDate === 'string' && rDate.includes('T')) rDate = Utilities.formatDate(new Date(rDate), 'Asia/Bangkok', 'yyyy-MM-dd');
          if (rDate === todayStr) {
            existingRowIndexInSheet = startRow + i;
            existingRowData = row;
            break;
          }
        }
      }
    }

    // Geofence check
    if (sessionData.workType === 'normal') {
      const sysConfig = getInitialData().payload.systemConfigs;
      const officeLat = parseFloat(sysConfig.OfficeLat) || 14.2366800; 
      const officeLng = parseFloat(sysConfig.OfficeLng) || 101.2344368;
      const officeRadius = parseFloat(sysConfig.OfficeRadius) || 50;

      if (!sessionData.lat || !sessionData.lng) {
         return { success: false, message: 'ไม่สามารถระบุพิกัด GPS ได้ กรุณาเปิด GPS บนอุปกรณ์' };
      }
      
      const R = 6371e3;
      const lat1 = officeLat * Math.PI/180;
      const lat2 = sessionData.lat * Math.PI/180;
      const dl = (sessionData.lat - officeLat) * Math.PI/180;
      const dL = (sessionData.lng - officeLng) * Math.PI/180;
      const a = Math.sin(dl/2) * Math.sin(dl/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dL/2) * Math.sin(dL/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const dist = R * c;
      if (dist > officeRadius) {
        return { success: false, message: `ท่านอยู่นอกรัศมีที่กำหนด (${Math.round(dist)} เมตร) กรุณาลงเวลาภายในพื้นที่สำนักงาน` };
      }
    }

    const bkkTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
    const totalMinutes = bkkTime.getHours() * 60 + bkkTime.getMinutes();
    let isAfternoon = sessionData.session === 'noon' || sessionData.session === 'afternoon';

    if (existingRowIndexInSheet === -1 && !isAfternoon && totalMinutes >= 12 * 60) {
      isAfternoon = true;
    }

    if (existingRowIndexInSheet !== -1 && existingRowData) {
      if (isAfternoon && existingRowData[headers.indexOf('CheckInTimeAfternoon')]) {
        return { success: false, message: 'ลงเวลาเช็คอินบ่ายไปแล้วสำหรับวันนี้' };
      }
      if (!isAfternoon && existingRowData[headers.indexOf('CheckInTime')]) {
        return { success: false, message: 'ลงเวลาเข้างานช่วงเช้าไปแล้วสำหรับวันนี้' };
      }
    }

    let status = 'ontime';
    if (!isAfternoon && totalMinutes > 510) { // After 08:30
      status = 'late1';
    }

    let photoUrl = '';
    if (sessionData.photo_base64) {
      const res = uploadAttendancePhoto(sessionData.photo_base64, userInfo.FullName, 'checkin', sessionData.session, todayStr);
      if (!res || !res.success || !res.url) {
        return { success: false, message: 'อัปโหลดรูปเซลฟี่ไม่สำเร็จ: ' + ((res && res.message) || 'ไม่ทราบสาเหตุ') };
      }
      photoUrl = res.url;
    }

    if (existingRowIndexInSheet !== -1) {
      const rowNum = existingRowIndexInSheet;
      if (isAfternoon) {
        sheet.getRange(rowNum, headers.indexOf('CheckInTimeAfternoon') + 1).setValue(now.toISOString());
        sheet.getRange(rowNum, headers.indexOf('CheckInAfternoonPhoto') + 1).setValue(photoUrl);
        sheet.getRange(rowNum, headers.indexOf('CheckInAfternoonLat') + 1).setValue(sessionData.lat || '');
        sheet.getRange(rowNum, headers.indexOf('CheckInAfternoonLng') + 1).setValue(sessionData.lng || '');
      } else {
        sheet.getRange(rowNum, headers.indexOf('CheckInTime') + 1).setValue(now.toISOString());
        sheet.getRange(rowNum, headers.indexOf('CheckInPhoto') + 1).setValue(photoUrl);
        sheet.getRange(rowNum, headers.indexOf('CheckInLat') + 1).setValue(sessionData.lat || '');
        sheet.getRange(rowNum, headers.indexOf('CheckInLng') + 1).setValue(sessionData.lng || '');
        sheet.getRange(rowNum, headers.indexOf('Status') + 1).setValue(status);
      }
      if (sessionData.notes) {
        const curNotes = existingRowData[notesCol] || '';
        sheet.getRange(rowNum, notesCol + 1).setValue(curNotes ? curNotes + ' | ' + sessionData.notes : sessionData.notes);
      }
      sheet.getRange(rowNum, headers.indexOf('Timestamp') + 1).setValue(now.toISOString());
      fastCacheRemoveAll_();
      return { success: true, message: 'อัปเดตลงเวลาเข้าสำเร็จ', attendId: existingRowData[idCol], checkInTime: now.toISOString() };
    } else {
      const attendId = 'atd-' + Utilities.getUuid();
      const mapping = {
        'AttendID': attendId, 'Date': todayStr, 'UserID': userInfo.UserID, 'FullName': userInfo.FullName,
        'Position': userInfo.Position || '', 'Department': userInfo.Department || '', 'Session': 'morning',
        'WorkType': sessionData.workType || 'normal', 'Status': status, 'Notes': sessionData.notes || '',
        'IsDeleted': false, 'Timestamp': now.toISOString(), 'LocationConsent': sessionData.locationConsent === true
      };
      if (isAfternoon) {
        mapping['CheckInTimeAfternoon'] = now.toISOString(); mapping['CheckInAfternoonPhoto'] = photoUrl;
        mapping['CheckInAfternoonLat'] = sessionData.lat || ''; mapping['CheckInAfternoonLng'] = sessionData.lng || '';
      } else {
        mapping['CheckInTime'] = now.toISOString(); mapping['CheckInPhoto'] = photoUrl;
        mapping['CheckInLat'] = sessionData.lat || ''; mapping['CheckInLng'] = sessionData.lng || '';
      }
      sheet.appendRow(headers.map(h => mapping[h] !== undefined ? mapping[h] : ''));
      fastCacheRemoveAll_();
      return { success: true, message: 'ลงเวลาเข้าสำเร็จ', attendId: attendId, checkInTime: now.toISOString() };
    }
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * HIGH-SPEED CHECKOUT
 */
function checkOut(attendId, sessionData, userInfo) {
  try {
    const sheet = getSheetTA('TimeAttendance');
    const now = new Date();
    const todayStr = Utilities.formatDate(now, 'Asia/Bangkok', 'yyyy-MM-dd');
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow < 2) return { success: false, message: 'ไม่พบรายการลงเวลาเข้าสำหรับวันนี้' };

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => typeof h === 'string' ? h.trim() : h);
    const idCol = headers.indexOf('AttendID');
    const dateCol = headers.indexOf('Date');
    const userCol = headers.indexOf('UserID');
    const delCol = headers.indexOf('IsDeleted');
    const notesCol = headers.indexOf('Notes');

    const maxRowsToRead = 200;
    const startRow = Math.max(2, lastRow - maxRowsToRead + 1);
    const numRows = Math.max(1, lastRow - startRow + 1);

    const recentValues = sheet.getRange(startRow, 1, numRows, lastCol).getValues();
    let foundRowIndexInSheet = -1;
    let foundRowData = null;

    for (let i = recentValues.length - 1; i >= 0; i--) {
      const row = recentValues[i];
      if (String(row[idCol]) === String(attendId) || (String(row[userCol]) === String(userInfo.UserID) && row[delCol] !== true)) {
        let rDate = row[dateCol];
        if (!rDate && row[headers.indexOf('CheckInTime')]) rDate = row[headers.indexOf('CheckInTime')];
        if (rDate instanceof Date) rDate = Utilities.formatDate(rDate, 'Asia/Bangkok', 'yyyy-MM-dd');
        else if (typeof rDate === 'string' && rDate.includes('T')) rDate = Utilities.formatDate(new Date(rDate), 'Asia/Bangkok', 'yyyy-MM-dd');
        if (rDate === todayStr || String(row[idCol]) === String(attendId)) {
          foundRowIndexInSheet = startRow + i;
          foundRowData = row;
          break;
        }
      }
    }

    if (foundRowIndexInSheet === -1 || !foundRowData) {
      return { success: false, message: 'ไม่พบรายการลงเวลาเข้าสำหรับวันนี้' };
    }

    if (foundRowData[headers.indexOf('CheckOutTime')]) {
      return { success: false, message: 'ท่านลงเวลาออกเรียบร้อยแล้ว' };
    }

    let photoUrl = '';
    if (sessionData.photo_base64) {
      const res = uploadAttendancePhoto(sessionData.photo_base64, userInfo.FullName, 'checkout', 'daily', todayStr);
      if (!res || !res.success || !res.url) {
        return { success: false, message: 'อัปโหลดรูปเซลฟี่ไม่สำเร็จ: ' + ((res && res.message) || 'ไม่ทราบสาเหตุ') };
      }
      photoUrl = res.url;
    }

    const rowNum = foundRowIndexInSheet;
    sheet.getRange(rowNum, headers.indexOf('CheckOutTime') + 1).setValue(now.toISOString());
    if (photoUrl) sheet.getRange(rowNum, headers.indexOf('CheckOutPhoto') + 1).setValue(photoUrl);
    if (sessionData.lat) sheet.getRange(rowNum, headers.indexOf('CheckOutLat') + 1).setValue(sessionData.lat);
    if (sessionData.lng) sheet.getRange(rowNum, headers.indexOf('CheckOutLng') + 1).setValue(sessionData.lng);
    if (sessionData.notes) {
      const curNotes = foundRowData[notesCol] || '';
      sheet.getRange(rowNum, notesCol + 1).setValue(curNotes ? curNotes + ' | ' + sessionData.notes : sessionData.notes);
    }
    sheet.getRange(rowNum, headers.indexOf('Timestamp') + 1).setValue(now.toISOString());
    fastCacheRemoveAll_();
    return { success: true, message: 'ลงเวลาออกสำเร็จ', checkOutTime: now.toISOString() };

  } catch (e) {
    return { success: false, message: e.message };
  }
}

function uploadAttendancePhoto(base64Data, userName, type, session, dateStr) {
  try {
    if (!base64Data) return { success: false, message: 'ไม่พบข้อมูลรูปภาพ' };
    let raw = String(base64Data || '').trim().replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
    
    let decoded;
    try {
      decoded = Utilities.base64Decode(raw);
    } catch (e) {
      return { success: false, message: 'รูปแบบรูปภาพไม่ถูกต้อง' };
    }

    const photoFolder = getOrCreateAppFolder_('photos');
    const safeName = String(userName || 'user').replace(/[\\/:*?"<>|#%{}~&]/g, '_');
    const fileName = `${dateStr}_${safeName}_${session}_${type}_${Date.now()}.jpg`;
    const blob = Utilities.newBlob(decoded, 'image/jpeg', fileName);
    const file = photoFolder.createFile(blob);
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}

    return { success: true, url: file.getUrl(), id: file.getId() };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

// =================================================================
// --- DATABASE & CORE DATA HELPERS ---
// =================================================================

function getDb() {
  let id = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_ID_KEY) || DEFAULT_SPREADSHEET_ID;
  return SpreadsheetApp.openById(id);
}

function getSheet(name) {
  const sheet = getDb().getSheetByName(name);
  if (!sheet) throw new Error(`ไม่พบชีท '${name}' ในฐานข้อมูล`);
  return sheet;
}

function getSheetTA(name) {
  return getSheet(name);
}

function sheetDataToObject(data) {
  if (!data || data.length < 2) return [];
  const headers = data[0].map(h => typeof h === 'string' ? h.trim() : String(h || ''));
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      let val = row[i];
      if (val instanceof Date) {
        if (val.getFullYear() <= 1900) {
          obj[header] = `${val.getHours().toString().padStart(2, '0')}:${val.getMinutes().toString().padStart(2, '0')}`;
        } else {
          obj[header] = Utilities.formatDate(val, 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mm:ss");
        }
      } else {
        obj[header] = val;
      }
    });
    return obj;
  });
}

function fastCacheRemoveAll_() {
  try {
    CacheService.getScriptCache().removeAll(['NNY_PUBLIC_DASHBOARD_FAST_V1']);
    CacheService.getScriptCache().put('GLOBAL_VERSION', Date.now().toString(), 21600);
  } catch(e) {}
}

function clearCache() {
  fastCacheRemoveAll_();
  return { success: true, message: 'ล้าง Cache ระบบสำเร็จ' };
}

function loginUser(username, password) {
  const sheet = getSheet('UserAccounts');
  const data = sheet.getDataRange().getValues();
  const users = sheetDataToObject(data);

  const user = users.find(u => 
    u.Username && String(u.Username).toLowerCase() === String(username).toLowerCase() &&
    String(u.Password) === String(password)
  );

  if (!user) return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
  if (user.IsActive !== true && String(user.IsActive).toLowerCase() !== 'true') {
    return { success: false, message: 'บัญชีของคุณยังไม่ได้รับการอนุมัติ หรือถูกระงับการใช้งาน' };
  }

  delete user.Password;
  return { success: true, user: user };
}

function loginAndGetPayload(username, password) {
  const loginRes = loginUser(username, password);
  if (!loginRes.success) return loginRes;

  const payloadRes = getInitialPayloadForUser(loginRes.user);
  if (!payloadRes.success) return { success: false, message: payloadRes.message };

  return { success: true, user: loginRes.user, payload: payloadRes.payload };
}

function getInitialData() {
  try {
    const settingsData = sheetDataToObject(getSheet('Settings').getDataRange().getValues());
    const activeSettings = settingsData.filter(s => s.IsActive === true || String(s.IsActive).toLowerCase() === 'true');
    const data = {
      positions: activeSettings.filter(s => s.Category === 'Position').map(s => s.Value).sort((a, b) => a.localeCompare(b, 'th')),
      departments: activeSettings.filter(s => s.Category === 'Department').map(s => s.Value).sort((a, b) => a.localeCompare(b, 'th')),
      budgetTypes: activeSettings.filter(s => s.Category === 'BudgetType').map(s => s.Value),
      travelTypes: activeSettings.filter(s => s.Category === 'TravelType').map(s => s.Value),
      holidays: activeSettings.filter(s => s.Category === 'PublicHoliday').map(s => ({ date: String(s.Value).split('T')[0], note: s.Note })),
      provinces: activeSettings.filter(s => s.Category === 'Province').map(s => s.Value).sort((a, b) => a.localeCompare(b, 'th')),
      systemConfigs: Object.fromEntries(activeSettings.filter(s => s.Category === 'SystemConfig').map(s => [s.Note, s.Value]))
    };
    data.systemConfigs = {
      OrganizationName: data.systemConfigs.OrganizationName || 'สำนักงานสาธารณสุขจังหวัดนครนายก',
      OrganizationSubtext: data.systemConfigs.OrganizationSubtext || 'MOPH Official HR Records System',
      OfficeLat: data.systemConfigs.OfficeLat || '14.2366800',
      OfficeLng: data.systemConfigs.OfficeLng || '101.2344368',
      OfficeRadius: data.systemConfigs.OfficeRadius || '50'
    };
    return { success: true, payload: data };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function getInitialPayloadForUser(userInfo) {
  try {
    const initData = getInitialData().payload;
    const allUsers = sheetDataToObject(getSheet('UserAccounts').getDataRange().getValues());
    const activeUsers = allUsers.filter(u => u.IsActive === true || String(u.IsActive).toLowerCase() === 'true').map(u => ({
      UserID: u.UserID, FullName: u.FullName, Role: String(u.Role || '').trim(),
      Department: u.Department, Position: u.Position || '', Email: u.Email || '',
      Address: u.Address || u["ที่อยู่ติดต่อ"] || '', PhoneNumber: String(u.PhoneNumber || u.phonenumber || ''),
      PersonnelType: u.PersonnelType || '', Gender: u.Gender || '', PositionLevel: u.PositionLevel || ''
    }));

    return {
      success: true,
      payload: {
        appSettings: initData,
        allActiveUsers: activeUsers,
        records: getOffSiteRecords(userInfo),
        leaves: getLeaveRecords(userInfo),
        wfhRequests: (getWFHRequests(userInfo).payload || []),
        wfhReportRecords: (getWFHReportRecords().payload || []),
        myAttendanceHistory: []
      }
    };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getEssentialBackgroundData() {
  try {
    const initData = getInitialData().payload;
    const allUsers = sheetDataToObject(getSheet('UserAccounts').getDataRange().getValues());
    const activeUsers = allUsers.filter(u => u.IsActive === true || String(u.IsActive).toLowerCase() === 'true').map(u => ({
      UserID: u.UserID, FullName: u.FullName, Role: String(u.Role || '').trim(),
      Department: u.Department, Position: u.Position || '', Email: u.Email || '',
      Address: u.Address || u["ที่อยู่ติดต่อ"] || '', PhoneNumber: String(u.PhoneNumber || u.phonenumber || ''),
      PersonnelType: u.PersonnelType || '', Gender: u.Gender || '', PositionLevel: u.PositionLevel || ''
    }));

    return {
      success: true,
      payload: {
        appSettings: initData,
        allActiveUsers: activeUsers
      }
    };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getTodayAttendanceRealTime(userId) {
  try {
    const sheet = getSheetTA('TimeAttendance');
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2) return { success: true, payload: [] };

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => typeof h === 'string' ? h.trim() : String(h));
    const maxRowsToRead = 300;
    const startRow = Math.max(2, lastRow - maxRowsToRead + 1);
    const numRows = lastRow - startRow + 1;

    const rawData = sheet.getRange(startRow, 1, numRows, lastCol).getValues();
    const rows = sheetDataToObject([headers].concat(rawData));
    const todayStr = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');

    const matched = rows.filter(r => {
      if (String(r.UserID) !== String(userId) || r.IsDeleted === true || String(r.IsDeleted).toLowerCase() === 'true') return false;
      let rDate = r.Date || r.CheckInTime;
      if (rDate instanceof Date) rDate = Utilities.formatDate(rDate, 'Asia/Bangkok', 'yyyy-MM-dd');
      else if (typeof rDate === 'string' && rDate.includes('T')) rDate = Utilities.formatDate(new Date(rDate), 'Asia/Bangkok', 'yyyy-MM-dd');
      return rDate === todayStr;
    });

    return { success: true, payload: matched, today: todayStr };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getMyAttendanceHistory(userId, startDate, endDate) {
  try {
    const sheet = getSheetTA('TimeAttendance');
    const all = sheetDataToObject(sheet.getDataRange().getValues()).filter(r => String(r.UserID) === String(userId) && r.IsDeleted !== true);
    let filtered = all;
    if (startDate || endDate) {
      filtered = all.filter(r => {
        let d = r.Date;
        if (d instanceof Date) d = Utilities.formatDate(d, 'Asia/Bangkok', 'yyyy-MM-dd');
        else if (typeof d === 'string' && d.includes('T')) d = Utilities.formatDate(new Date(d), 'Asia/Bangkok', 'yyyy-MM-dd');
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }
    filtered.sort((a, b) => String(b.Date).localeCompare(String(a.Date)));
    return { success: true, payload: filtered };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function getAllAttendanceHistory(startDate, endDate, department) {
  try {
    const sheet = getSheetTA('TimeAttendance');
    let all = sheetDataToObject(sheet.getDataRange().getValues()).filter(r => r.IsDeleted !== true);
    if (department) all = all.filter(r => r.Department === department);
    return { success: true, payload: all };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getOffSiteRecords(userInfo) {
  try {
    const all = sheetDataToObject(getSheet('OffSiteRecord').getDataRange().getValues()).filter(r => r.IsDeleted !== true && String(r.IsDeleted).toLowerCase() !== 'true');
    const uid = String(userInfo.UserID);
    const dept = userInfo.Department;
    
    let visible = all;
    if (userInfo.Role === 'User' || userInfo.Role === 'Secretary') {
      visible = all.filter(r => String(r.UserID) === uid || String(r.RecordedByUserID) === uid || String(r.TargetUserID) === uid);
    } else if (['DeptHead', 'DeputyDeptHead'].includes(userInfo.Role)) {
      visible = all.filter(r => r.Department === dept || String(r.UserID) === uid || String(r.TargetUserID) === uid);
    }
    return visible.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
  } catch(e) {
    return [];
  }
}

function getLeaveRecords(userInfo) {
  try {
    const all = sheetDataToObject(getSheet('LeaveRecord').getDataRange().getValues()).filter(r => r.IsDeleted !== true && String(r.IsDeleted).toLowerCase() !== 'true');
    const uid = String(userInfo.UserID);
    const dept = userInfo.Department;

    let visible = all;
    if (userInfo.Role === 'User' || userInfo.Role === 'Secretary') {
      visible = all.filter(r => String(r.UserID) === uid || String(r.RecordedByUserID) === uid || String(r.TargetUserID) === uid);
    } else if (['DeptHead', 'DeputyDeptHead'].includes(userInfo.Role)) {
      visible = all.filter(r => r.Department === dept || String(r.UserID) === uid || String(r.TargetUserID) === uid);
    }
    return visible.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
  } catch(e) {
    return [];
  }
}

function getWFHRequests(userInfo) {
  try {
    const sheet = getSheetTA('WFHRequest');
    const all = sheetDataToObject(sheet.getDataRange().getValues());
    let filtered = all;
    if (userInfo) {
      if (userInfo.Role === 'User' || userInfo.Role === 'Secretary') {
        filtered = all.filter(r => r['ชื่อสกุล'] === userInfo.FullName || String(r.TargetUserID) === String(userInfo.UserID));
      } else if (['DeptHead', 'DeputyDeptHead'].includes(userInfo.Role)) {
        filtered = all.filter(r => r['กลุ่มงาน'] === userInfo.Department || r['ชื่อสกุล'] === userInfo.FullName || String(r.TargetUserID) === String(userInfo.UserID));
      }
    }
    return { success: true, payload: filtered };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getWFHReportRecords() {
  try {
    const sheet = getSheet('WFHReportRecord');
    const all = sheetDataToObject(sheet.getDataRange().getValues()).filter(r => r.IsDeleted !== true && String(r.IsDeleted).toLowerCase() !== 'true');
    return { success: true, payload: all };
  } catch(e) {
    return { success: true, payload: [] };
  }
}

function setupTimeAttendanceSheets() {
  const ss = getDb();
  const sheets = ['TimeAttendance', 'WFHRecord', 'WFHRequest', 'WFHAssign', 'LeaveRecord', 'OffSiteRecord', 'WFHReportRecord', 'Settings', 'UserAccounts'];
  sheets.forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });
}

function getPublicDashboardData() {
  try {
    const allRecords = sheetDataToObject(getSheet('OffSiteRecord').getDataRange().getValues()).filter(r => r.IsDeleted !== true);
    const approved = allRecords.filter(r => ['รับทราบแล้ว', 'อนุมัติแล้ว/รับทราบแล้ว', 'อนุมัติแล้ว/เสร็จสิ้น'].includes(r.Status));
    const users = sheetDataToObject(getSheet('UserAccounts').getDataRange().getValues()).filter(u => u.IsActive === true);

    const kpis = {
      peopleToday: 0,
      totalUsers: users.length,
      totalTrips: approved.length,
      inProvinceTrips: approved.filter(r => r.Province === HOME_PROVINCE).length,
      outOfProvinceTrips: approved.filter(r => r.Province !== HOME_PROVINCE).length,
      totalDuration: approved.reduce((acc, r) => acc + parseInt(r.CalculatedDuration || 0, 10), 0),
      totalBudget: approved.reduce((acc, r) => acc + (parseFloat(r.BudgetAmount) || 0), 0)
    };

    return {
      success: true,
      payload: {
        kpis: kpis,
        charts: {
          byDepartment: approved.reduce((acc, r) => { acc[r.Department || 'ไม่ระบุ'] = (acc[r.Department || 'ไม่ระบุ'] || 0) + 1; return acc; }, {}),
          byFiscalYear: {}
        },
        calendarEvents: {},
        calendarLeaves: {},
        calendarAttendance: {}
      }
    };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getHrExecutiveDashboardData(filters) {
  return getFilteredDashboardData(filters);
}

function getFilteredDashboardData(filters) {
  try {
    const allUsers = sheetDataToObject(getSheet('UserAccounts').getDataRange().getValues()).filter(u => u.IsActive === true);
    const kpis = {
      totalUsers: allUsers.length,
      attendanceDays: 0,
      lateDays: 0,
      wfhDays: 0,
      totalLeaveDays: 0,
      totalTrips: 0,
      totalTripDays: 0,
      departments: new Set(allUsers.map(u => u.Department)).size,
      personnelTypes: new Set(allUsers.map(u => u.PersonnelType)).size
    };

    return {
      success: true,
      payload: {
        kpis: kpis,
        charts: {
          byDepartment: {},
          byPersonnelType: {},
          byGender: {},
          byPosition: {},
          leaveByType: {},
          attendanceByMonth: {}
        },
        personRows: allUsers.map(u => ({
          FullName: u.FullName,
          Department: u.Department,
          PersonnelType: u.PersonnelType || 'ไม่ระบุ',
          Gender: u.Gender || 'ไม่ระบุ',
          PositionLevel: u.PositionLevel || '-',
          attendanceDays: 0,
          leaveDays: 0,
          tripCount: 0
        }))
      }
    };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getAllUsersForAdmin() {
  const users = sheetDataToObject(getSheet('UserAccounts').getDataRange().getValues());
  return users.map(u => { delete u.Password; return u; });
}
