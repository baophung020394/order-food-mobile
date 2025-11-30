import { Platform } from 'react-native';

// Helper function để đảm bảo URL có protocol
const ensureProtocol = (url: string): string => {
  if (!url) return url;
  // Nếu đã có protocol thì return luôn
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Thêm http:// nếu chưa có
  return `http://${url}`;
};

// Helper function để xử lý localhost trên các platform khác nhau
const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  // Nếu đã set trong .env thì dùng luôn (đảm bảo có protocol)
  if (envUrl) {
    let baseUrl = ensureProtocol(envUrl);
    
    // Android Emulator cần dùng 10.0.2.2 thay vì localhost
    if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
      baseUrl = baseUrl.replace('localhost', '10.0.2.2');
      console.log('🤖 Android Emulator detected - Using 10.0.2.2 instead of localhost');
    }
    
    // iOS Simulator có thể dùng localhost, nhưng thiết bị thật thì không
    // Nếu đang chạy trên thiết bị thật và dùng localhost, cần thay bằng IP
    // (Code sẽ giữ nguyên localhost cho iOS Simulator)
    
    return baseUrl;
  }
  
  // Nếu không có .env, dùng default IP của máy dev
  // Default: dùng IP của máy dev (cần thay bằng IP thực tế của bạn)
  let baseUrl = '192.168.1.14:3000/api/v1';
  
  // Android Emulator cần dùng 10.0.2.2
  if (Platform.OS === 'android') {
    baseUrl = '10.0.2.2:3000/api/v1';
    console.log('🤖 Android Emulator detected - Using 10.0.2.2');
  }
  
  // Đảm bảo URL có protocol
  return ensureProtocol(baseUrl);
};

const API_BASE_URL = getApiBaseUrl();

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
    // Debug: Log API URL để kiểm tra
    console.log('🔗 API Base URL:', this.baseUrl);
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Sử dụng this.baseUrl thay vì hardcode
      const loginUrl = `${this.baseUrl}/auth/login`;
      // const loginUrl = `${this.baseUrl}/auth/login`;
      console.log('📤 Login request to:', loginUrl);
      console.log('📤 Login credentials:', { username: credentials.username });
      console.log('📤 Full URL:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📥 Login response status:', response.status);
      console.log('📥 Login response headers:', Object.fromEntries(response.headers.entries()));
      
      // Kiểm tra content-type trước khi parse JSON
      const contentType = response.headers.get('content-type');
      console.log('📥 Response content-type:', contentType);
      
      let data;
      try {
        const text = await response.text();
        console.log('📥 Response raw text:', text);
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw {
          message: 'Server trả về dữ liệu không hợp lệ',
          statusCode: response.status,
        } as ApiError;
      }
      
      console.log('📥 Login response data:', data);

      if (!response.ok) {
        console.error('❌ Login failed:', data);
        throw {
          message: data.message || data.error || 'Đăng nhập thất bại',
          statusCode: response.status,
        } as ApiError;
      }

      console.log('✅ Login successful');
      return data;
    } catch (error: any) {
      console.error('❌ Login error details:', {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        stack: error.stack,
      });
      
      // Nếu đã có statusCode thì throw luôn (đã xử lý ở trên)
      if (error.statusCode !== undefined) {
        throw error;
      }
      
      // Network error - có thể do không kết nối được đến server
      const errorMessage = error.message || 'Unknown error';
      console.error('❌ Network error - Check if API Gateway is running at:', this.baseUrl);
      console.error('❌ Error type:', error.name);
      console.error('❌ Error message:', errorMessage);
      
      // Kiểm tra các loại lỗi phổ biến
      if (errorMessage.includes('Network request failed') || 
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('timeout')) {
        throw {
          message: `Không thể kết nối đến server tại ${this.baseUrl}. Vui lòng kiểm tra:\n1. API Gateway có đang chạy không?\n2. URL có đúng không?\n3. Nếu dùng thiết bị thật, đã thay localhost bằng IP chưa?`,
          statusCode: 0,
        } as ApiError;
      }
      
      throw {
        message: `Lỗi: ${errorMessage}`,
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

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      const headers: HeadersInit = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      const body = refreshToken ? JSON.stringify({ refreshToken }) : undefined;

      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers,
        body,
      });

      // Nếu logout thành công hoặc token đã hết hạn (401), vẫn coi là thành công
      if (!response.ok && response.status !== 401) {
        const data = await response.json().catch(() => ({}));
        throw {
          message: data.message || 'Đăng xuất thất bại',
          statusCode: response.status,
        } as ApiError;
      }

      // Logout thành công
      console.log('✅ Logout successful');
    } catch (error: any) {
      // Nếu có lỗi network hoặc server, vẫn tiếp tục logout ở client
      // (clear local storage) để đảm bảo user có thể logout ngay cả khi server down
      console.warn('⚠️ Logout API call failed, but continuing with local logout:', error.message);
      // Không throw error để app vẫn có thể logout ở client side
    }
  }
}

export const authService = new AuthService();

