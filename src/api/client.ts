
const API_BASE_URL = 'http://localhost/spk-backend/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  // Students methods
  async getStudents() {
    return this.request<any[]>('/students');
  }

  async createStudent(student: any) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
  }

  async updateStudent(id: string, student: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    });
  }

  async deleteStudent(id: string) {
    return this.request(`/students/${id}`, { method: 'DELETE' });
  }

  // Criteria methods
  async getCriteria() {
    return this.request<any[]>('/criteria');
  }

  async updateCriteria(id: string, criteria: any) {
    return this.request(`/criteria/${id}`, {
      method: 'PUT',
      body: JSON.stringify(criteria),
    });
  }

  // Criteria comparison methods
  async getCriteriaComparisons() {
    return this.request<any[]>('/criteria/comparisons');
  }

  async saveCriteriaComparison(comparison: any) {
    return this.request('/criteria/comparisons', {
      method: 'POST',
      body: JSON.stringify(comparison),
    });
  }

  // Student scores methods
  async getStudentScores() {
    return this.request<any[]>('/students/scores');
  }

  async saveStudentScores(scores: any[]) {
    return this.request('/students/scores', {
      method: 'POST',
      body: JSON.stringify({ scores }),
    });
  }

  // AHP calculation methods
  async calculateAHP() {
    return this.request('/ahp/calculate', { method: 'POST' });
  }

  async getAHPResults() {
    return this.request<any[]>('/ahp/results');
  }

  async resetAHPResults() {
    return this.request('/ahp/results', { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
