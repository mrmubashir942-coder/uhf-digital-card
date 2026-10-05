import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { getSeedData } from '../prisma/seed.ts';
import {
  User,
  EmployeeProfile,
  CompanySettings,
  FullEmployee,
  AccountStatus,
  Role,
  DashboardStats,
} from '../src/types/index.ts';

const getSafeDirname = (): string => {
  try {
    if (typeof __dirname !== 'undefined' && __dirname) {
      return __dirname;
    }
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {}
  return process.cwd();
};

const _dir = getSafeDirname();
const DATA_DIR = path.resolve(_dir, '../data');
const DB_PATH = path.resolve(DATA_DIR, 'db.json');

export interface StoredUser extends User {
  passwordHash: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  profiles: EmployeeProfile[];
  companySettings: CompanySettings;
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    profiles: [],
    companySettings: {
      id: 'default-uhf-company',
      companyName: 'UHF Solutions',
      website: 'https://uhfsolutions.com',
      email: 'contact@uhfsolutions.com',
      phone: '+1 (800) 555-0199',
      officeAddress: 'Suite 400, Technology Park, Silicon Boulevard, CA 94025',
      primaryColor: '#0f172a',
      accentColor: '#2563eb',
      updatedAt: new Date().toISOString(),
    },
  };
  private isLoaded = false;
  private savePromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch {
      // In serverless environments, root filesystem may be read-only
    }
  }

  public async init(): Promise<void> {
    if (this.isLoaded) return;
    this.ensureDataDir();

    // Check candidate paths where data/db.json might be located (bundled or standalone)
    const candidatePaths = [
      DB_PATH,
      path.resolve(process.cwd(), 'data/db.json'),
      path.resolve(_dir, '../data/db.json'),
      path.resolve(_dir, '../../data/db.json'),
      path.resolve(_dir, 'data/db.json'),
    ];

    for (const cand of candidatePaths) {
      if (fs.existsSync(cand)) {
        try {
          const raw = fs.readFileSync(cand, 'utf-8');
          this.data = JSON.parse(raw);
          this.isLoaded = true;
          return;
        } catch (err) {
          console.error(`Failed reading ${cand}:`, err);
        }
      }
    }

    // Seed database
    console.log('Seeding UHF Solutions initial database...');
    const seed = await getSeedData();

    const adminId = 'usr_admin_001';
    const adminUser: StoredUser = {
      id: adminId,
      employeeId: seed.admin.employeeId,
      email: seed.admin.email,
      passwordHash: seed.admin.passwordHash,
      role: seed.admin.role as Role,
      status: seed.admin.status as AccountStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const adminProfile: EmployeeProfile = {
      id: 'prof_admin_001',
      userId: adminId,
      employeeId: seed.admin.employeeId,
      ...seed.admin.profile,
      showPhone: true,
      showWhatsapp: true,
      showEmail: true,
      showLinkedin: true,
      showAddress: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users = [adminUser];
    this.data.profiles = [adminProfile];

    seed.employees.forEach((emp, index) => {
      const uId = `usr_emp_${index + 1}`;
      const pId = `prof_emp_${index + 1}`;

      const user: StoredUser = {
        id: uId,
        employeeId: emp.employeeId,
        email: emp.email,
        passwordHash: emp.passwordHash,
        role: emp.role as Role,
        status: emp.status as AccountStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const profile: EmployeeProfile = {
        id: pId,
        userId: uId,
        employeeId: emp.employeeId,
        ...emp.profile,
        showPhone: true,
        showWhatsapp: true,
        showEmail: true,
        showLinkedin: true,
        showAddress: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.data.users.push(user);
      this.data.profiles.push(profile);
    });

    this.data.companySettings = seed.company;
    this.isLoaded = true;
    await this.save();
    console.log('Database initialized successfully with UHF Solutions default records.');
  }

  private async save(): Promise<void> {
    try {
      this.ensureDataDir();
      const tempPath = `${DB_PATH}.tmp.${Date.now()}`;
      const json = JSON.stringify(this.data, null, 2);
      await fs.promises.writeFile(tempPath, json, 'utf-8');
      await fs.promises.rename(tempPath, DB_PATH);
    } catch (err) {
      // In serverless environments where filesystem is read-only, in-memory updates still persist during the lambda container's warm lifecycle
      console.warn('Could not persist to local db file (read-only filesystem in serverless):', err);
    }
  }

  public async getNextEmployeeId(): Promise<string> {
    await this.init();
    const ids = this.data.users
      .map((u) => u.employeeId)
      .filter((id) => id.startsWith('UHF-'))
      .map((id) => {
        const num = parseInt(id.replace('UHF-', ''), 10);
        return isNaN(num) ? 0 : num;
      });
    const maxNum = ids.length > 0 ? Math.max(...ids) : 0;
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    return `UHF-${nextNum}`;
  }

  public async findUserByEmployeeIdOrEmail(identifier: string): Promise<StoredUser | null> {
    await this.init();
    if (!identifier || typeof identifier !== 'string') return null;
    const clean = identifier.trim().toLowerCase();

    // 1. Direct match on employeeId or full email
    let user = this.data.users.find(
      (u) =>
        u.employeeId.toLowerCase() === clean ||
        u.email.toLowerCase() === clean
    );
    if (user) return user;

    // 2. Convenience match: "admin" matches ADMIN-001 or admin@uhfsolutions.com
    if (clean === 'admin' || clean === 'administrator') {
      const admin = this.data.users.find((u) => u.role === 'ADMIN');
      if (admin) return admin;
    }

    // 3. Match email username prefix before '@' (e.g. "ahmed" matches "ahmed@uhfsolutions.com")
    user = this.data.users.find(
      (u) => u.email.toLowerCase().split('@')[0] === clean
    );
    if (user) return user;

    // 4. Normalized employeeId match (e.g. "uhf001" matches "UHF-001")
    const strippedClean = clean.replace(/[^a-z0-9]/g, '');
    if (strippedClean.length >= 2) {
      user = this.data.users.find(
        (u) => u.employeeId.toLowerCase().replace(/[^a-z0-9]/g, '') === strippedClean
      );
    }

    return user || null;
  }

  public async findUserById(id: string): Promise<StoredUser | null> {
    await this.init();
    const user = this.data.users.find((u) => u.id === id);
    return user || null;
  }

  public async getProfileByUserId(userId: string): Promise<EmployeeProfile | null> {
    await this.init();
    const profile = this.data.profiles.find((p) => p.userId === userId);
    return profile || null;
  }

  public async getProfileByEmployeeId(employeeId: string): Promise<EmployeeProfile | null> {
    await this.init();
    const profile = this.data.profiles.find(
      (p) => p.employeeId.toLowerCase() === employeeId.toLowerCase().trim()
    );
    return profile || null;
  }

  public async getFullEmployeeByEmployeeId(employeeId: string): Promise<FullEmployee | null> {
    await this.init();
    const user = this.data.users.find(
      (u) => u.employeeId.toLowerCase() === employeeId.toLowerCase().trim()
    );
    if (!user) return null;
    const profile = this.data.profiles.find((p) => p.userId === user.id);
    if (!profile) return null;

    const { passwordHash: _, ...safeUser } = user;
    return {
      ...safeUser,
      profile,
    };
  }

  public async getFullEmployeeById(id: string): Promise<FullEmployee | null> {
    await this.init();
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const profile = this.data.profiles.find((p) => p.userId === user.id);
    if (!profile) return null;

    const { passwordHash: _, ...safeUser } = user;
    return {
      ...safeUser,
      profile,
    };
  }

  public async getAllEmployees(filter?: {
    search?: string;
    status?: string;
    department?: string;
  }): Promise<FullEmployee[]> {
    await this.init();
    let result = this.data.users
      .filter((u) => u.role === 'EMPLOYEE' || u.role === 'ADMIN')
      .map((u) => {
        const prof = this.data.profiles.find((p) => p.userId === u.id);
        const { passwordHash: _, ...safeUser } = u;
        return {
          ...safeUser,
          profile: prof || {
            id: `prof_${u.id}`,
            userId: u.id,
            employeeId: u.employeeId,
            fullName: 'Unknown',
            designation: 'Staff',
            department: 'General',
            showPhone: true,
            showWhatsapp: true,
            showEmail: true,
            showLinkedin: true,
            showAddress: true,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          },
        };
      });

    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter((e) => e.status === filter.status);
    }

    if (filter?.department && filter.department !== 'ALL') {
      result = result.filter(
        (e) => e.profile.department.toLowerCase() === filter.department?.toLowerCase()
      );
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.employeeId.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.profile.fullName.toLowerCase().includes(q) ||
          e.profile.designation.toLowerCase().includes(q) ||
          e.profile.department.toLowerCase().includes(q)
      );
    }

    // Sort: recent first
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async createEmployee(payload: {
    employeeId: string;
    fullName: string;
    email: string;
    temporaryPassword: string;
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
    role?: Role;
    status?: AccountStatus;
  }): Promise<FullEmployee> {
    await this.init();

    // Check uniqueness
    const existing = this.data.users.find(
      (u) =>
        u.employeeId.toLowerCase() === payload.employeeId.toLowerCase() ||
        u.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (existing) {
      throw new Error('An employee with this Employee ID or Email already exists.');
    }

    const passwordHash = await bcrypt.hash(payload.temporaryPassword || 'Password123!', 10);
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const profId = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id,
      employeeId: payload.employeeId.toUpperCase().trim(),
      email: payload.email.toLowerCase().trim(),
      passwordHash,
      role: payload.role || 'EMPLOYEE',
      status: payload.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    const newProfile: EmployeeProfile = {
      id: profId,
      userId: id,
      employeeId: newUser.employeeId,
      fullName: payload.fullName.trim(),
      designation: payload.designation.trim(),
      department: payload.department.trim(),
      phone: payload.phone?.trim() || undefined,
      whatsapp: payload.whatsapp?.trim() || undefined,
      officePhone: payload.officePhone?.trim() || undefined,
      companyEmail: payload.companyEmail?.trim() || payload.email.trim(),
      linkedin: payload.linkedin?.trim() || undefined,
      website: payload.website?.trim() || undefined,
      officeAddress: payload.officeAddress?.trim() || undefined,
      bio: payload.bio?.trim() || undefined,
      profilePhoto: payload.profilePhoto || undefined,
      showPhone: true,
      showWhatsapp: true,
      showEmail: true,
      showLinkedin: true,
      showAddress: true,
      createdAt: now,
      updatedAt: now,
    };

    this.data.users.push(newUser);
    this.data.profiles.push(newProfile);
    await this.save();

    const { passwordHash: _, ...safeUser } = newUser;
    return {
      ...safeUser,
      profile: newProfile,
    };
  }

  public async updateEmployee(
    id: string,
    payload: {
      fullName?: string;
      email?: string;
      designation?: string;
      department?: string;
      phone?: string;
      whatsapp?: string;
      officePhone?: string;
      companyEmail?: string;
      linkedin?: string;
      website?: string;
      officeAddress?: string;
      bio?: string;
      profilePhoto?: string;
      role?: Role;
      status?: AccountStatus;
      showPhone?: boolean;
      showWhatsapp?: boolean;
      showEmail?: boolean;
      showLinkedin?: boolean;
      showAddress?: boolean;
      nfcEnabled?: boolean;
    }
  ): Promise<FullEmployee> {
    await this.init();
    const userIndex = this.data.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error('Employee not found');
    }

    const user = this.data.users[userIndex];
    const profileIndex = this.data.profiles.findIndex((p) => p.userId === id);
    if (profileIndex === -1) {
      throw new Error('Employee profile not found');
    }

    const profile = this.data.profiles[profileIndex];
    const now = new Date().toISOString();

    if (payload.email && payload.email !== user.email) {
      const emailConflict = this.data.users.find(
        (u) => u.id !== id && u.email.toLowerCase() === payload.email?.toLowerCase().trim()
      );
      if (emailConflict) {
        throw new Error('Email is already taken by another employee.');
      }
      user.email = payload.email.toLowerCase().trim();
    }

    if (payload.role) user.role = payload.role;
    if (payload.status) user.status = payload.status;
    user.updatedAt = now;

    // Update profile
    if (payload.fullName !== undefined) profile.fullName = payload.fullName.trim();
    if (payload.designation !== undefined) profile.designation = payload.designation.trim();
    if (payload.department !== undefined) profile.department = payload.department.trim();
    if (payload.phone !== undefined) profile.phone = payload.phone.trim();
    if (payload.whatsapp !== undefined) profile.whatsapp = payload.whatsapp.trim();
    if (payload.officePhone !== undefined) profile.officePhone = payload.officePhone.trim();
    if (payload.companyEmail !== undefined) profile.companyEmail = payload.companyEmail.trim();
    if (payload.linkedin !== undefined) profile.linkedin = payload.linkedin.trim();
    if (payload.website !== undefined) profile.website = payload.website.trim();
    if (payload.officeAddress !== undefined) profile.officeAddress = payload.officeAddress.trim();
    if (payload.bio !== undefined) profile.bio = payload.bio.trim();
    if (payload.profilePhoto !== undefined) profile.profilePhoto = payload.profilePhoto;
    if (payload.showPhone !== undefined) profile.showPhone = payload.showPhone;
    if (payload.showWhatsapp !== undefined) profile.showWhatsapp = payload.showWhatsapp;
    if (payload.showEmail !== undefined) profile.showEmail = payload.showEmail;
    if (payload.showLinkedin !== undefined) profile.showLinkedin = payload.showLinkedin;
    if (payload.showAddress !== undefined) profile.showAddress = payload.showAddress;
    if (payload.nfcEnabled !== undefined) profile.nfcEnabled = payload.nfcEnabled;

    profile.updatedAt = now;

    this.data.users[userIndex] = user;
    this.data.profiles[profileIndex] = profile;
    await this.save();

    const { passwordHash: _, ...safeUser } = user;
    return {
      ...safeUser,
      profile,
    };
  }

  public async updateEmployeeSelfProfile(
    userId: string,
    allowed: {
      phone?: string;
      whatsapp?: string;
      linkedin?: string;
      website?: string;
      bio?: string;
      profilePhoto?: string;
      nfcEnabled?: boolean;
    }
  ): Promise<EmployeeProfile> {
    await this.init();
    const profileIndex = this.data.profiles.findIndex((p) => p.userId === userId);
    if (profileIndex === -1) {
      throw new Error('Profile not found');
    }

    const profile = this.data.profiles[profileIndex];
    if (allowed.phone !== undefined) profile.phone = allowed.phone.trim();
    if (allowed.whatsapp !== undefined) profile.whatsapp = allowed.whatsapp.trim();
    if (allowed.linkedin !== undefined) profile.linkedin = allowed.linkedin.trim();
    if (allowed.website !== undefined) profile.website = allowed.website.trim();
    if (allowed.bio !== undefined) profile.bio = allowed.bio.trim();
    if (allowed.profilePhoto !== undefined) profile.profilePhoto = allowed.profilePhoto;
    if (allowed.nfcEnabled !== undefined) profile.nfcEnabled = allowed.nfcEnabled;
    profile.updatedAt = new Date().toISOString();

    this.data.profiles[profileIndex] = profile;
    await this.save();
    return profile;
  }

  public async toggleStatus(id: string, newStatus?: AccountStatus): Promise<AccountStatus> {
    await this.init();
    const user = this.data.users.find((u) => u.id === id);
    if (!user) throw new Error('Employee not found');

    user.status = newStatus || (user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
    user.updatedAt = new Date().toISOString();
    await this.save();
    return user.status;
  }

  public async updatePassword(id: string, newPlainPassword: string): Promise<void> {
    await this.init();
    const user = this.data.users.find((u) => u.id === id);
    if (!user) throw new Error('Employee not found');

    user.passwordHash = await bcrypt.hash(newPlainPassword, 10);
    user.updatedAt = new Date().toISOString();
    await this.save();
  }

  public async deleteEmployee(id: string): Promise<void> {
    await this.init();
    const user = this.data.users.find((u) => u.id === id);
    if (!user) throw new Error('Employee not found');

    if (user.role === 'ADMIN' && this.data.users.filter((u) => u.role === 'ADMIN').length <= 1) {
      throw new Error('Cannot delete the sole Administrator account.');
    }

    this.data.users = this.data.users.filter((u) => u.id !== id);
    this.data.profiles = this.data.profiles.filter((p) => p.userId !== id);
    await this.save();
  }

  public async getCompanySettings(): Promise<CompanySettings> {
    await this.init();
    return this.data.companySettings;
  }

  public async updateCompanySettings(payload: Partial<CompanySettings>): Promise<CompanySettings> {
    await this.init();
    this.data.companySettings = {
      ...this.data.companySettings,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    await this.save();
    return this.data.companySettings;
  }

  public async getDashboardStats(): Promise<DashboardStats> {
    await this.init();
    const totalEmployees = this.data.users.length;
    const activeCount = this.data.users.filter((u) => u.status === 'ACTIVE').length;
    const inactiveCount = this.data.users.filter((u) => u.status === 'INACTIVE').length;

    const departmentSet = new Set<string>();
    this.data.profiles.forEach((p) => {
      if (p.department) departmentSet.add(p.department);
    });

    const recent = await this.getAllEmployees();

    return {
      totalEmployees,
      activeCount,
      inactiveCount,
      departmentsCount: departmentSet.size,
      departments: Array.from(departmentSet),
      recentEmployees: recent.slice(0, 5),
    };
  }
}

export const db = new Database();
