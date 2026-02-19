// API Service for Backend Integration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Set authentication token
  setTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Clear authentication tokens
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Always get the latest tokens from localStorage
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');

    const config = {
      headers: {
        ...options.headers
      },
      ...options
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
      console.log(`Sending token for ${url}`, config.headers);
    } else {
      console.warn(`No token found for ${url}`);
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        // Prevent infinite loop if we are already refreshing
        if (url.includes('/auth/refresh')) {
          throw new Error('Refresh token invalid');
        }

        try {
          await this.refreshAccessToken();
          // Retry the original request with new token
          config.headers.Authorization = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, config);

          if (retryResponse.status === 401) {
            this.clearTokens();
            window.location.href = '/login';
          }

          return retryResponse;
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          this.clearTokens();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        console.error('Access Forbidden');
        // Optionally handle forbidden access (e.g. redirect to dashboard)
      }

      return response;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.token, data.refreshToken);
      } else {
        // Refresh token also expired, logout user
        this.clearTokens();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      window.location.href = '/login';
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: 'GET'
    });
  }

  // POST request
  async post(endpoint, data = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  // POST request for file uploads
  async postFormData(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Authentication APIs
  async signup(userData) {
    try {
      const response = await this.post('/auth/signup', userData);
      const data = await response.json();

      if (response.ok) {
        this.setTokens(data.token, data.refreshToken);
        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: { message: 'Network error occurred' } };
    }
  }

  async login(email, password) {
    try {
      const response = await this.post('/auth/login', { email, password });
      const data = await response.json();

      if (response.ok) {
        this.setTokens(data.token, data.refreshToken);
        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: { message: 'Network error occurred' } };
    }
  }

  async logout() {
    try {
      await this.post('/auth/logout');
      this.clearTokens();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens even if API call fails
      this.clearTokens();
      return { success: false, error: { message: 'Network error occurred' } };
    }
  }

  async getProfile() {
    try {
      const response = await this.get('/auth/profile');
      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: { message: 'Network error occurred' } };
    }
  }

  // Resume APIs
  getResumeUrl(id) {
    return `${API_BASE_URL}/resume/view/${id}`;
  }

  // Public Job APIs
  async getPublicJob(id) {
    return this.get(`/public/jobs/${id}`);
  }

  async applyForJob(id, formData) {
    return this.postFormData(`/public/jobs/${id}/apply`, formData);
  }

  // Hiring Form APIs
  async getHiringForms() {
    return this.get('/hiring-forms');
  }

  async getJobApplications(id) {
    return this.get(`/hiring-forms/${id}/applications`);
  }

  async updateResumeStatus(id, status, reason) {
    return this.put(`/resume/${id}/status`, { status, reason });
  }

  async startBulkEvaluation(jobId, promptId, candidateIds) {
    return this.post('/evaluation/bulk', { jobId, promptId, candidateIds });
  }

  async bulkEvaluateResumes(jobId, promptId, candidateIds) {
    return this.startBulkEvaluation(jobId, promptId, candidateIds);
  }

  async getJobProgress(jobId) {
    return this.get(`/evaluation/progress/${jobId}`);
  }

  async getEvaluationResults(jobId) {
    return this.get(`/evaluation/results/${jobId}`);
  }

  async evaluateAllQueued() {
    return this.post('/evaluation/queue/all');
  }

  async getPromptsByIndustry(industryId) {
    return this.get(`/prompts/industry/${industryId}?all=true`);
  }

  async getAllPrompts() {
    return this.get('/prompts');
  }

  async getIndustries() {
    return this.get('/industries');
  }

  // Analytics APIs
  async getEmployerDashboardStats() {
    return this.get('/system-analytics/employer');
  }

  async getSystemStats(params) {
    return this.get('/system-analytics/dashboard', params);
  }

  async getResumeProcessingMetrics(params) {
    return this.get('/system-analytics/resume-processing', params);
  }

  async getAIUsageAnalytics(params) {
    return this.get('/system-analytics/ai-usage', params);
  }

  async getEvaluationQualityMetrics(params) {
    return this.get('/system-analytics/evaluation-quality', params);
  }

  async getRecruiterPatterns(params) {
    return this.get('/system-analytics/recruiter-patterns', params);
  }

  async getIndustryDistribution(params) {
    return this.get('/system-analytics/industry-distribution', params);
  }

  async getCostAnalytics(params) {
    return this.get('/system-analytics/cost', params);
  }

  async getEvaluationsList(params) {
    return this.get('/system-analytics/evaluations', params);
  }

  // Company Management APIs
  async getCompanies(params) {
    return this.get('/company', params);
  }

  async createCompany(data) {
    return this.post('/company', data);
  }

  async updateCompany(id, data) {
    return this.put(`/company/${id}`, data);
  }

  async deactivateCompany(id) {
    return this.delete(`/company/${id}`);
  }

  // HR User Management APIs
  async getHRUsers(params) {
    return this.get('/hr-user', params);
  }

  async createHRUser(data) {
    return this.post('/hr-user', data);
  }

  async updateHRUser(id, data) {
    return this.put(`/hr-user/${id}`, data);
  }

  async deleteHRUser(id) {
    return this.delete(`/hr-user/${id}`);
  }

  // System Settings APIs
  async getSystemSettings() {
    return this.get('/system-settings');
  }

  async updateSystemSettings(data) {
    return this.put('/system-settings', data);
  }

  // Contact APIs
  async sendContactMessage(data) {
    return this.post('/public/contact', data);
  }

  async getAllContacts() {
    return this.get('/contact');
  }

  async deleteContact(id) {
    return this.delete(`/contact/${id}`);
  }

  // Portfolio APIs
  async getPortfolioData() {
    return this.get('/public/portfolio');
  }

  async updatePortfolioData(data) {
    return this.put('/portfolio', data);
  }

  // Verification method to check API connectivity
  async verifyApiConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'API connection successful',
          data
        };
      } else {
        return {
          success: false,
          message: `API health check failed: ${response.status}`
        };
      }
    } catch (error) {
      console.error('API verification error:', error);
      return {
        success: false,
        message: 'API connection failed',
        error: error.message
      };
    }
  }
}

const apiService = new ApiService();
export default apiService;
