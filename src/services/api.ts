import { 
  UserAccount, 
  AttendanceRecord, 
  LeaveRecord, 
  OffSiteRecord, 
  WFHRequest, 
  AppSettings, 
  DashboardKPIs,
  MigrationResult
} from '../types';

// Default Apps Script Web App Endpoint URL (can be customized by user in settings or env)
const DEFAULT_GAS_URL = (import.meta as any).env?.VITE_GAS_API_URL || '';

export class ApiService {
  private static apiUrl: string = localStorage.getItem('nny_gas_api_url') || DEFAULT_GAS_URL;

  public static getApiUrl(): string {
    return this.apiUrl;
  }

  public static setApiUrl(url: string): void {
    this.apiUrl = url.trim();
    localStorage.setItem('nny_gas_api_url', this.apiUrl);
  }

  /**
   * Universal fetcher for Google Apps Script Web App API (doPost / doGet)
   */
  private static async callGasApi<T>(action: string, payload?: any, userInfo?: UserAccount | null): Promise<T> {
    if (!this.apiUrl) {
      console.warn(`[ApiService] VITE_GAS_API_URL is not set. Executing local simulated action: ${action}`);
      return this.handleFallbackMock<T>(action, payload, userInfo);
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // GAS Web Apps expect text/plain for CORS preflight avoidance
        },
        body: JSON.stringify({
          action,
          payload,
          userInfo,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (err: any) {
      console.error(`[ApiService] Call failed for ${action}:`, err);
      // If network fails, attempt local fallback or throw error
      throw new Error(err.message || 'ไม่สามารถเชื่อมต่อกับระบบ Google Apps Script ได้');
    }
  }

  // --- AUTHENTICATION ---
  public static async login(username: string, password: string): Promise<{ success: boolean; user?: UserAccount; payload?: any; message?: string }> {
    return this.callGasApi('loginAndGetPayload', [username, password]);
  }

  // --- HIGH-SPEED CHECK-IN / CHECK-OUT ---
  public static async checkIn(sessionData: any, user: UserAccount): Promise<{ success: boolean; message: string; attendId?: string; checkInTime?: string }> {
    return this.callGasApi('checkIn', [sessionData, user], user);
  }

  public static async checkOut(attendId: string, sessionData: any, user: UserAccount): Promise<{ success: boolean; message: string; checkOutTime?: string }> {
    return this.callGasApi('checkOut', [attendId, sessionData, user], user);
  }

  public static async getTodayAttendance(userId: string): Promise<{ success: boolean; payload: AttendanceRecord[]; today: string }> {
    return this.callGasApi('getTodayAttendanceRealTime', [userId]);
  }

  public static async getMyAttendanceHistory(userId: string, startDate?: string, endDate?: string): Promise<{ success: boolean; payload: AttendanceRecord[] }> {
    return this.callGasApi('getMyAttendanceHistory', [userId, startDate, endDate]);
  }

  // --- OFF-SITE TRIPS ---
  public static async saveRecord(recordData: any, user: UserAccount): Promise<{ success: boolean; message: string }> {
    return this.callGasApi('saveRecord', [recordData, user], user);
  }

  public static async getOffSiteRecords(user: UserAccount): Promise<{ success: boolean; payload: OffSiteRecord[] }> {
    return this.callGasApi('getOffSiteRecords', [user], user);
  }

  // --- LEAVE RECORDS ---
  public static async saveLeaveRecord(recordData: any, user: UserAccount): Promise<{ success: boolean; message: string; leaveId?: string; duplicateLeave?: boolean; duplicates?: any[] }> {
    return this.callGasApi('saveLeaveRecord', [recordData, user], user);
  }

  public static async getLeaveRecords(user: UserAccount): Promise<{ success: boolean; payload: LeaveRecord[] }> {
    return this.callGasApi('getLeaveRecords', [user], user);
  }

  public static async generateLeavePdfOnServer(leaveId: string, user: UserAccount): Promise<{ success: boolean; message: string; fileUrl?: string; fileId?: string }> {
    return this.callGasApi('generateLeavePdfOnServer', [leaveId, user], user);
  }

  // --- WFH REQUESTS ---
  public static async saveWFHRequest(wfhPayload: any, user: UserAccount): Promise<{ success: boolean; message: string; docUrl?: string }> {
    return this.callGasApi('saveWFHRequest', [wfhPayload, user], user);
  }

  public static async getWFHRequests(user: UserAccount): Promise<{ success: boolean; payload: WFHRequest[] }> {
    return this.callGasApi('getWFHRequests', [user], user);
  }

  // --- AUTOMATED DRIVE MIGRATION ---
  public static async migrateOldFoldersToNewAccount(): Promise<MigrationResult> {
    return this.callGasApi<MigrationResult>('migrateOldFoldersToNewAccount');
  }

  // --- DASHBOARDS & INITIAL DATA ---
  public static async getPublicDashboardData(): Promise<{ success: boolean; payload: any }> {
    return this.callGasApi('getPublicDashboardData');
  }

  public static async getHrExecutiveDashboardData(filters?: any): Promise<{ success: boolean; payload: any }> {
    return this.callGasApi('getHrExecutiveDashboardData', [filters]);
  }

  // --- FALLBACK MOCK DATA FOR PREVIEW/TESTING ---
  private static handleFallbackMock<T>(action: string, payload?: any, userInfo?: any): T {
    const defaultUser: UserAccount = {
      UserID: 'user-001',
      Username: 'admin1234',
      FullName: 'ผู้ดูแลระบบ สสจ.นครนายก',
      Position: 'นักวิชาการคอมพิวเตอร์',
      Department: 'กลุ่มงานสารสนเทศ',
      Role: 'AdminHR',
      IsActive: true,
      Email: 'nyhr26000@gmail.com',
      CID: '1269900000000',
      PhoneNumber: '0812345678',
      PersonnelType: 'ข้าราชการ'
    };

    switch (action) {
      case 'loginAndGetPayload':
      case 'loginUser':
        return {
          success: true,
          user: defaultUser,
          message: 'เข้าสู่ระบบสำเร็จ (โหมดจำลองระบบพร้อมเชื่อมต่อ Google Sheets)',
          payload: {
            appSettings: {
              positions: ['นายแพทย์สาธารณสุขจังหวัด', 'นักวิชาการสาธารณสุข', 'พยาบาลวิชาชีพ', 'เภสัชกร', 'นักวิชาการคอมพิวเตอร์'],
              departments: ['บริหารทั่วไป', 'สารสนเทศ', 'พัฒนายุทธศาสตร์', 'ส่งเสริมสุขภาพ', 'อนามัยสิ่งแวดล้อม'],
              budgetTypes: ['ไม่เบิก', 'เงินบำรุง', 'งบประมาณแผ่นดิน'],
              travelTypes: ['ในจังหวัด', 'นอกจังหวัด'],
              holidays: [{ date: '2026-07-28', note: 'วันเฉลิมพระชนมพรรษา' }],
              provinces: ['นครนายก', 'กรุงเทพมหานคร', 'ปทุมธานี', 'ปราจีนบุรี'],
              systemConfigs: {
                OrganizationName: 'สำนักงานสาธารณสุขจังหวัดนครนายก',
                OrganizationSubtext: 'MOPH Official HR Records System',
                OfficeLat: '14.2366800',
                OfficeLng: '101.2344368',
                OfficeRadius: '50'
              }
            },
            allActiveUsers: [defaultUser],
            records: [],
            leaves: [],
            wfhRequests: []
          }
        } as unknown as T;

      case 'checkIn':
        return {
          success: true,
          message: 'ลงเวลาเข้างานสำเร็จ (High-speed Check-in)',
          attendId: 'atd-' + Date.now(),
          checkInTime: new Date().toISOString()
        } as unknown as T;

      case 'checkOut':
        return {
          success: true,
          message: 'ลงเวลาออกงานสำเร็จ',
          checkOutTime: new Date().toISOString()
        } as unknown as T;

      case 'migrateOldFoldersToNewAccount':
        return {
          success: true,
          message: 'ย้ายข้อมูลจากบัญชี arpasree104@gmail.com ไปยัง nyhr26000@gmail.com สำเร็จ (42 ไฟล์ ใน 6 โฟลเดอร์)',
          copiedFilesCount: 42,
          copiedFoldersCount: 6,
          destinationFolderUrl: 'https://drive.google.com/drive/folders/nyhr26000_migrated',
          details: [
            'สร้างโฟลเดอร์ปลายทาง: สสจ.นย_เอกสารบันทึกไปราชการ_NEW/Migrated_Files_Arpasree104',
            'คัดลอกไฟล์จาก 1lO3wm5XZpnZ4aq7LVmO1vj1__0l2AIJt รวม 24 ไฟล์',
            'คัดลอกไฟล์จาก 1EnY73K4NaAGCbopf3HwgxFAHBQnr0AKl รวม 18 ไฟล์',
            'ตั้งค่าสิทธิ์การเข้าถึง ANYONE_WITH_LINK และเจ้าของสิทธิ์ nyhr26000@gmail.com เรียบร้อยแล้ว'
          ]
        } as unknown as T;

      default:
        return {
          success: true,
          message: 'ดำเนินการสำเร็จ (Mock response)',
          payload: []
        } as unknown as T;
    }
  }
}
