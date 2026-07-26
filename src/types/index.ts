export type UserRole = 
  | 'User' 
  | 'TeamLead' 
  | 'DeptHead' 
  | 'DeputyDeptHead' 
  | 'DeputyDirDept' 
  | 'AdminHR' 
  | 'HR' 
  | 'DeputyDirHR' 
  | 'Secretary' 
  | 'Director' 
  | 'Executive' 
  | 'Admin';

export interface UserAccount {
  UserID: string;
  Username: string;
  FullName: string;
  Position: string;
  Department: string;
  Role: UserRole;
  IsActive: boolean;
  Email?: string;
  CID?: string;
  Prefix?: string;
  FirstName?: string;
  LastName?: string;
  Gender?: string;
  PositionLevel?: string;
  Avatar?: string;
  Address?: string;
  PhoneNumber?: string;
  PersonnelType?: string;
  SignatureBase64?: string;
  SignatureBase64_2?: string;
  VacationCarryOver?: number;
  VacationCurrentYear?: number;
  VacationTotalEntitlement?: number;
  SickPersonalLimit?: number;
  InitialVacationUsed?: number;
  InitialSickUsed?: number;
  InitialPersonalUsed?: number;
}

export interface AttendanceRecord {
  AttendID: string;
  Date: string;
  DateStr?: string;
  UserID: string;
  FullName: string;
  Position?: string;
  Department?: string;
  Session?: 'morning' | 'noon' | 'evening';
  CheckInTime?: string;
  CheckInPhoto?: string;
  CheckInLat?: number | string;
  CheckInLng?: number | string;
  CheckInTimeAfternoon?: string;
  CheckInAfternoonPhoto?: string;
  CheckInAfternoonLat?: number | string;
  CheckInAfternoonLng?: number | string;
  CheckOutTime?: string;
  CheckOutPhoto?: string;
  CheckOutLat?: number | string;
  CheckOutLng?: number | string;
  LocationConsent?: boolean;
  WorkType?: 'normal' | 'offsite' | 'wfh' | string;
  Status?: 'ontime' | 'late1' | 'late2' | 'absent' | 'leave' | 'travel' | string;
  Notes?: string;
  IsDeleted?: boolean;
  Timestamp?: string;
  WFHSubmission?: {
    TaskTitle?: string;
    WorkReport?: string;
    Files_JSON?: string;
    AttachPhoto?: string;
    AttachFile?: string;
    AttachLink?: string;
  };
}

export interface LeaveRecord {
  'leave id': string;
  Timestamp: string;
  UserID: string;
  FullName: string;
  Position: string;
  Department: string;
  'ประเภทการลา': string;
  'เหตุผลการลา': string;
  'วันที่เริ่มต้นลา': string;
  'วันสุดท้ายที่ลา': string;
  'มีกำหนดกี่วัน': number | string;
  'ที่อยู่ติดต่อ'?: string;
  phonenumber?: string;
  'Leave form Link'?: string;
  Files_JSON?: string;
  Status: string;
  ReturnReason?: string;
  IsDeleted?: boolean;
  RecordedByUserID?: string;
  MainDocFile_JSON?: string;
  TargetUserID?: string;
  WorkflowHistory_JSON?: string;
}

export interface OffSiteRecord {
  ID: string;
  Timestamp: string;
  UserID: string;
  FullName: string;
  Position: string;
  Department: string;
  TravelPurpose: string;
  TravelDates_JSON: string;
  CalculatedDuration: string;
  TravelType: string;
  Province: string;
  Location: string;
  Organizer: string;
  BudgetType: string;
  BudgetAmount: number;
  Files_JSON?: string;
  Status: string;
  ReturnReason?: string;
  IsDeleted?: boolean;
  RecordedByUserID?: string;
  MainDocFile_JSON?: string;
  TargetUserID?: string;
  ReferenceDoc?: string;
  DepartureTime?: string;
  ReturnTime?: string;
  VehicleType?: string;
  LicensePlate?: string;
  DriverName?: string;
  BudgetSource?: string;
  WorkflowHistory_JSON?: string;
}

export interface WFHRequest {
  RequestID: string;
  'วันที่บันทึก'?: string;
  'ชื่อสกุล'?: string;
  FullName?: string;
  'ประเภทการจ้าง'?: string;
  'ตำแหน่ง'?: string;
  Position?: string;
  'ระดับ'?: string;
  'กลุ่มงาน'?: string;
  Department?: string;
  'งาน'?: string;
  'เลขที่บ้านWFH'?: string;
  'ตำบล'?: string;
  'อำเภอ'?: string;
  'จังหวัด'?: string;
  'เหตุผลWFH'?: string;
  'ความประสงค์WFH'?: string;
  'วันที่ขอWFH'?: string;
  'รวมวัน'?: number | string;
  'หมายเลขโทรศัพท์ติดต่อ'?: string;
  DocLink?: string;
  Status?: string;
  TargetUserID?: string;
  CancelReason?: string;
  WorkflowHistory_JSON?: string;
  UserID?: string;
  tasks?: WFHTask[];
}

export interface WFHTask {
  AssignID?: string;
  RequestID?: string;
  'วันที่ขอWFH'?: string;
  date?: string;
  'ภารกิจที่มอบหมาย'?: string;
  taskDesc?: string;
  'ตัวชี้วัดผลงาน'?: string;
  kpi?: string;
  'ระยะเวลาดำเนินการ'?: string;
  duration?: string;
  'กิจกรรม'?: string;
  'ผลของงาน'?: string;
  'AttachFile'?: string;
  'AttachPhoto'?: string;
  'AttachLink'?: string;
  'หมายเหตุ'?: string;
  'ผลการตรวจงาน'?: string;
  'ผู้ตรวจงาน'?: string;
  Note?: string;
  'ส่งให้ใครตรวจ'?: string;
  'สถานะส่งงาน WFH'?: string;
}

export interface SystemConfig {
  OrganizationName: string;
  OrganizationSubtext: string;
  OfficeLat: string;
  OfficeLng: string;
  OfficeRadius: string;
}

export interface AppSettings {
  positions: string[];
  departments: string[];
  budgetTypes: string[];
  travelTypes: string[];
  holidays: Array<{ date: string; note: string }>;
  provinces: string[];
  systemConfigs: SystemConfig;
}

export interface DashboardKPIs {
  peopleToday: number;
  totalUsers: number;
  totalTrips: number;
  inProvinceTrips: number;
  outOfProvinceTrips: number;
  totalDuration: number;
  totalBudget: number;
  attendanceDays?: number;
  lateDays?: number;
  wfhDays?: number;
  totalLeaveDays?: number;
  totalTripDays?: number;
  departments?: number;
  personnelTypes?: number;
}

export interface MigrationResult {
  success: boolean;
  message: string;
  copiedFilesCount?: number;
  copiedFoldersCount?: number;
  destinationFolderUrl?: string;
  details?: string[];
}
