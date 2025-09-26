// API Service Layer for Backend Communication
const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Employee Authentication
  async authenticateEmployee(employeeId, password) {
    return this.request('/employee/authenticate', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password }),
    });
  }

  // Punch In/Out APIs
  async punchInScan(employeeId, password, qrToken) {
    return this.request('/punchin/scan', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password, qrToken }),
    });
  }

  async punchOut(employeeId, password) {
    return this.request('/punchout', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password }),
    });
  }

  // Owner manual punch out
  async ownerPunchOut(employeeId, ownerId, shopId) {
    return this.request('/punchout', {
      method: 'POST',
      body: JSON.stringify({ employeeId, ownerId, shopId }),
    });
  }

  // Get punch records
  async getEmployeePunchRecords(employeeId, startDate = null, endDate = null, limit = 50) {
    let endpoint = `/employee/${employeeId}/punch-records?limit=${limit}`;
    if (startDate) endpoint += `&startDate=${startDate}`;
    if (endDate) endpoint += `&endDate=${endDate}`;
    
    return this.request(endpoint);
  }

  async getShopPunchRecords(shopId, startDate = null, endDate = null, limit = 100) {
    let endpoint = `/shop/${shopId}/punch-records?limit=${limit}`;
    if (startDate) endpoint += `&startDate=${startDate}`;
    if (endDate) endpoint += `&endDate=${endDate}`;
    
    return this.request(endpoint);
  }

  // QR Code Generation (for owners)
  async generatePunchInQR(ownerId, shopId) {
    return this.request('/punchin/generate', {
      method: 'POST',
      body: JSON.stringify({ ownerId, shopId }),
    });
  }

  // Employee availability management
  async updateEmployeeAvailability(employeeId, availabilities) {
    return this.request(`/employee/${employeeId}/availability`, {
      method: 'POST',
      body: JSON.stringify({ availabilities }),
    });
  }

  async getEmployeeAvailability(employeeId) {
    return this.request(`/employee/${employeeId}/availability`);
  }

  // Owner APIs
  async getOwner(googleId) {
    return this.request(`/owner/${googleId}`);
  }

  async getOwnerShop(ownerId) {
    return this.request(`/owner/${ownerId}/shop`);
  }

  async addEmployee(ownerId, shopId, employeeData) {
    return this.request('/owner/add-employee', {
      method: 'POST',
      body: JSON.stringify({ ownerId, shopId, ...employeeData }),
    });
  }

  // Google OAuth
  async getGoogleAuthUrl() {
    return this.request('/auth/google');
  }

  async getAuthStatus() {
    return this.request('/auth/status');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
