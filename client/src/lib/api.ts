const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  token?: string;
  message?: string;
  error?: string;
  email?: string;
  blockchain?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('honeychain_token');
    }
    return null;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async get<T = any>(endpoint: string, auth: boolean = true): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(auth),
    });
    return res.json();
  }

  async post<T = any>(endpoint: string, data: any, auth: boolean = true): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(auth),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async put<T = any>(endpoint: string, data: any, auth: boolean = true): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(auth),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async delete<T = any>(endpoint: string, auth: boolean = true): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(auth),
    });
    return res.json();
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth helpers
export const authApi = {
  register: (data: any) => api.post('/auth/register', data, false),
  verifyOtp: (data: { email: string, otp: string }) => api.post('/auth/verify-otp', data, false),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data, false),
  getMe: () => api.get('/auth/me'),
};

// Beekeeper helpers
export const beekeeperApi = {
  submitProfile: (data: any) => api.post('/beekeepers/profile', data),
  getMyProfile: () => api.get('/beekeepers/me'),
  updateProfile: (data: any) => api.put('/beekeepers/me', data),
  listAll: (params?: string) => api.get(`/beekeepers${params ? `?${params}` : ''}`),
  getById: (id: string) => api.get(`/beekeepers/${id}`),
  get: (id: string) => api.get(`/beekeepers/${id}`),
  approve: (id: string) => api.put(`/beekeepers/${id}/approve`, {}),
  reject: (id: string, reason: string) => api.put(`/beekeepers/${id}/reject`, { reason }),
  suspend: (id: string) => api.put(`/beekeepers/${id}/suspend`, {}),
};

// Hive helpers
export const hiveApi = {
  create: (data: any) => api.post('/hives', data),
  listMine: () => api.get('/hives'),
  getById: (id: string) => api.get(`/hives/${id}`),
  get: (id: string) => api.get(`/hives/${id}`),
  update: (id: string, data: any) => api.put(`/hives/${id}`, data),
  delete: (id: string) => api.delete(`/hives/${id}`),
};

// Batch helpers
export const batchApi = {
  create: (data: any) => api.post('/batches', data),
  listMine: (params?: string) => api.get(`/batches${params ? `?${params}` : ''}`),
  listAll: (params?: string) => api.get(`/batches/all${params ? `?${params}` : ''}`),
  getById: (id: string) => api.get(`/batches/${id}`),
  get: (id: string) => api.get(`/batches/${id}`),
  updateStatus: (id: string, statusOrData: any, notes?: string) => {
    const payload = typeof statusOrData === 'string' ? { status: statusOrData, notes } : statusOrData;
    return api.put(`/batches/${id}/status`, payload);
  },
  getQR: (id: string) => api.get(`/batches/${id}/qr`),
  verify: (batchCode: string) => api.get(`/batches/verify/${batchCode}`, false),
};

// Quality helpers
export const qualityApi = {
  extractReport: (imageBase64: string) => api.post('/quality/extract-report', { image: imageBase64 }),
  submitTest: (batchIdOrData: any, maybePayload?: any) => {
    if (typeof batchIdOrData === 'string' && maybePayload) {
      const { labName, reportNumber, remarks, labReportImage, ...rest } = maybePayload;
      const parameters = {
          reducingSugar: rest.reducingSugar,
          sucrose: rest.sucrose,
          moisture: rest.moisture,
          ash: rest.ash,
          fiehesTest: rest.fiehesTest,
          hmf: rest.hmf,
          fgRatio: rest.fgRatio,
          specificGravity: rest.specificGravity,
          acidity: rest.acidity,
          proline: rest.proline
        };
        return api.post('/quality/test', { batchId: batchIdOrData, labName, reportNumber, remarks, parameters, labReportImage });
    }
    return api.post('/quality/test', batchIdOrData);
  },
  getByBatch: (batchId: string) => api.get(`/quality/batch/${batchId}`),
  getPending: () => api.get('/quality/pending'),
  getAll: () => api.get('/quality/all'),
};

// Admin helpers
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getBatchAnalytics: (params?: string) => api.get(`/admin/analytics/batches${params ? `?${params}` : ''}`),
  getQualityAnalytics: (params?: string) => api.get(`/admin/analytics/quality${params ? `?${params}` : ''}`),
};

// Fraud helpers
export const fraudApi = {
  getAlerts: (params?: string) => api.get(`/fraud/alerts${params ? `?${params}` : ''}`),
  getStats: () => api.get('/fraud/alerts/stats'),
  getBatchAlerts: (batchId: string) => api.get(`/fraud/alerts/batch/${batchId}`),
  updateAlert: (id: string, status: string, adminNotes?: string) => api.put(`/fraud/alerts/${id}`, { status, adminNotes }),
  // Beekeeper dispute
  getMyAlerts: () => api.get('/fraud/my-alerts'),
  submitDispute: (alertId: string, reason: string, evidence?: string) => api.post(`/fraud/dispute/${alertId}`, { reason, evidence }),
  // Admin final decision
  finalDecision: (id: string, decision: string, adminNotes?: string) => api.put(`/fraud/alerts/${id}/final-decision`, { decision, adminNotes }),
};
