const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'staff' | 'kitchen';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'Đăng nhập thất bại',
          statusCode: response.status,
        } as ApiError;
      }

      return data;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw {
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        statusCode: 0,
      } as ApiError;
    }
  }

  async register(userData: {
    username: string;
    password: string;
    fullName: string;
    role?: 'admin' | 'staff' | 'kitchen';
  }): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          role: userData.role || 'staff',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'Đăng ký thất bại',
          statusCode: response.status,
        } as ApiError;
      }

      return data;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw {
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        statusCode: 0,
      } as ApiError;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'Làm mới token thất bại',
          statusCode: response.status,
        } as ApiError;
      }

      return data;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw {
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        statusCode: 0,
      } as ApiError;
    }
  }

  async getProfile(accessToken: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'Lấy thông tin người dùng thất bại',
          statusCode: response.status,
        } as ApiError;
      }

      return data;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw {
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        statusCode: 0,
      } as ApiError;
    }
  }
}

export const authService = new AuthService();

