import {
  AuthResponse,
  AuthUser,
  CompanySettings,
  DashboardStats,
  EmployeeProfile,
  FullEmployee,
  PublicCardData,
} from '../types/index.ts';

const TOKEN_KEY = 'uhf_auth_token';
const USER_KEY = 'uhf_auth_user';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to save token to localStorage', e);
    }
  },
  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear token', e);
    }
  },
  getUser: (): AuthUser | null => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: AuthUser): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as any;
    err.status = response.status;
    err.code = data?.code;
    err.data = data;
    throw err;
  }

  return data as T;
}

export const api = {
  auth: {
    login: async (identifier: string, password: string): Promise<AuthResponse> => {
      const res = await request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      tokenStorage.set(res.token);
      tokenStorage.setUser(res.user);
      return res;
    },
    getMe: async (): Promise<{ user: AuthUser; profile: EmployeeProfile | null }> => {
      return request('/api/auth/me');
    },
    logout: async (): Promise<void> => {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } catch (err) {
        console.warn('Logout request completed with local cleanup');
      } finally {
        tokenStorage.clear();
      }
    },
  },

  public: {
    getCard: async (employeeId: string): Promise<PublicCardData> => {
      return request<PublicCardData>(`/api/public/card/${encodeURIComponent(employeeId)}`);
    },
    getQR: async (
      employeeId: string
    ): Promise<{
      employeeId: string;
      fullName: string;
      cardUrl: string;
      pngDataUrl: string;
      svgString: string;
    }> => {
      return request(`/api/public/qr/${encodeURIComponent(employeeId)}`);
    },
    getCompany: async (): Promise<CompanySettings> => {
      return request<CompanySettings>('/api/public/company');
    },
    getVCardDownloadUrl: (employeeId: string): string => {
      return `/api/public/vcard/${encodeURIComponent(employeeId)}`;
    },
  },

  employee: {
    getProfile: async (): Promise<{
      user: AuthUser;
      profile: EmployeeProfile;
      company: CompanySettings;
    }> => {
      return request('/api/employee/profile');
    },
    updateProfile: async (
      data: Partial<EmployeeProfile>
    ): Promise<{ message: string; profile: EmployeeProfile }> => {
      return request('/api/employee/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
      return request('/api/employee/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
  },

  admin: {
    getStats: async (): Promise<DashboardStats> => {
      return request<DashboardStats>('/api/admin/stats');
    },
    getNextId: async (): Promise<{ nextId: string }> => {
      return request<{ nextId: string }>('/api/admin/next-id');
    },
    getEmployees: async (params?: {
      search?: string;
      status?: string;
      department?: string;
    }): Promise<FullEmployee[]> => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.department) searchParams.set('department', params.department);
      const q = searchParams.toString();
      return request<FullEmployee[]>(`/api/admin/employees${q ? `?${q}` : ''}`);
    },
    getEmployee: async (id: string): Promise<FullEmployee> => {
      return request<FullEmployee>(`/api/admin/employees/${encodeURIComponent(id)}`);
    },
    createEmployee: async (payload: any): Promise<{ message: string; employee: FullEmployee }> => {
      return request('/api/admin/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    updateEmployee: async (
      id: string,
      payload: any
    ): Promise<{ message: string; employee: FullEmployee }> => {
      return request(`/api/admin/employees/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    toggleStatus: async (
      id: string,
      status?: string
    ): Promise<{ message: string; status: string }> => {
      return request(`/api/admin/employees/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    resetPassword: async (id: string, newPassword: string): Promise<{ message: string }> => {
      return request(`/api/admin/employees/${encodeURIComponent(id)}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });
    },
    deleteEmployee: async (id: string): Promise<{ message: string }> => {
      return request(`/api/admin/employees/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
    getCompanySettings: async (): Promise<CompanySettings> => {
      return request<CompanySettings>('/api/admin/company');
    },
    updateCompanySettings: async (
      payload: Partial<CompanySettings>
    ): Promise<{ message: string; company: CompanySettings }> => {
      return request('/api/admin/company', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
  },

  upload: {
    companyLogo: async (
      dataUri: string,
      fileName?: string
    ): Promise<{ message: string; url: string; publicId: string; company: CompanySettings }> => {
      return request('/api/upload/company-logo', {
        method: 'POST',
        body: JSON.stringify({ image: dataUri, fileName }),
      });
    },
    employeePhoto: async (
      dataUri: string,
      employeeId?: string,
      fileName?: string
    ): Promise<{ message: string; url: string; publicId: string; employeeId: string }> => {
      return request('/api/upload/employee-photo', {
        method: 'POST',
        body: JSON.stringify({ image: dataUri, employeeId, fileName }),
      });
    },
  },
};
