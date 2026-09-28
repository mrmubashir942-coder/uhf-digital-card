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
  website?: string;
  officeAddress?: string;
  bio?: string;
  profilePhoto?: string;
  showPhone: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
  showLinkedin: boolean;
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
