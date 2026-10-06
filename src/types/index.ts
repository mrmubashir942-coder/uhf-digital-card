// UHF Solutions Digital Card Types

export type Role = 'ADMIN' | 'EMPLOYEE';
export type AccountStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  designation: string;
  department: string;
  phone?: string;
  whatsapp?: string;
  officePhone?: string;
  companyEmail?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
  officeAddress?: string;
  bio?: string;
  profilePhoto?: string;
  nfcEnabled?: boolean;
  showPhone: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
  showLinkedin: boolean;
  showTwitter?: boolean;
  showGithub?: boolean;
  showAddress: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FullEmployee extends User {
  profile: EmployeeProfile;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  logoUrl?: string;
  website: string;
  email: string;
  phone: string;
  officeAddress: string;
  linkedin?: string;
  twitter?: string;
  primaryColor?: string;
  accentColor?: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  employeeId: string;
  email: string;
  role: Role;
  status: AccountStatus;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  profile?: EmployeeProfile;
}

export interface PublicCardData {
  employeeId: string;
  fullName: string;
  designation: string;
  department: string;
  phone?: string;
  whatsapp?: string;
  officePhone?: string;
  email?: string;
  companyEmail?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
  officeAddress?: string;
  bio?: string;
  profilePhoto?: string;
  status: AccountStatus;
  company: {
    companyName: string;
    logoUrl?: string;
    website: string;
    email: string;
    phone: string;
    officeAddress: string;
    linkedin?: string;
  };
}

export interface DashboardStats {
  totalEmployees: number;
  activeCount: number;
  inactiveCount: number;
  departmentsCount: number;
  departments: string[];
  recentEmployees: FullEmployee[];
}

export type ActivityActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PROFILE_UPDATE'
  | 'PASSWORD_CHANGE'
  | 'PHOTO_UPLOAD'
  | 'EMPLOYEE_CREATE'
  | 'EMPLOYEE_UPDATE'
  | 'EMPLOYEE_STATUS_CHANGE'
  | 'COMPANY_SETTINGS_UPDATE'
  | 'COMPANY_LOGO_UPLOAD'
  | 'CARD_VIEW'
  | 'VCARD_DOWNLOAD'
  | 'QR_CODE_DOWNLOAD';

export type ActivityCategory = 'AUTH' | 'PROFILE' | 'ADMIN' | 'INTERACTION';

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorId?: string;
  actorName: string;
  actorRole: Role | 'PUBLIC' | 'SYSTEM';
  action: ActivityActionType;
  category: ActivityCategory;
  targetId?: string;
  targetName?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}
