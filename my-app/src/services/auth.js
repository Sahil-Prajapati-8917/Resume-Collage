// Authentication Service for Master Admin Features

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Set authentication tokens
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

  // Get current user profile
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: { message: 'Failed to fetch profile' } };
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { success: false, error: { message: 'Network error' } };
    }
  }

  // Check if user has master admin role
  async isMasterAdmin() {
    try {
      const profile = await this.getProfile();
      if (profile.success) {
        return profile.data.role === 'master_admin';
      }
      return false;
    } catch (error) {
      console.error('Master admin check error:', error);
      return false;
    }
  }

  // Check if user has ops admin role
  async isOpsAdmin() {
    try {
      const profile = await this.getProfile();
      if (profile.success) {
        return profile.data.role === 'ops_admin';
      }
      return false;
    } catch (error) {
      console.error('Ops admin check error:', error);
      return false;
    }
  }

  // Check if user has admin privileges (master or ops admin)
  async isAdmin() {
    return await this.isMasterAdmin() || await this.isOpsAdmin();
  }

  // Check if user has specific permission
  async hasPermission(permission) {
    try {
      const profile = await this.getProfile();
      if (profile.success) {
        // Master admin has all permissions
        if (profile.data.role === 'master_admin') {
          return true;
        }
        // Check specific permission
        return profile.data.permissions && profile.data.permissions[permission] === true;
      }
      return false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // Get user's company access
  async getUserCompany() {
    try {
      const profile = await this.getProfile();
      if (profile.success) {
        return profile.data.company;
      }
      return null;
    } catch (error) {
      console.error('Company fetch error:', error);
      return null;
    }
  }

  // Logout user
  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      this.clearTokens();
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: { message: 'Logout failed' } };
      }
    } catch (error) {
      console.error('Logout error:', error);
      this.clearTokens();
      return { success: false, error: { message: 'Network error' } };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;