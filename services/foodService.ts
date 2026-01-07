import { Platform } from 'react-native';

// Helper function để đảm bảo URL có protocol
const ensureProtocol = (url: string): string => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `http://${url}`;
};

// Helper function để lấy API base URL
const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (envUrl && envUrl.trim()) {
    let baseUrl = envUrl.trim();
    
    if (baseUrl.startsWith('/')) {
      const defaultHost = Platform.OS === 'android' 
        ? '10.0.2.2:3000' 
        : '192.168.1.10:3000';
      baseUrl = `${defaultHost}${baseUrl}`;
    }
    
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = ensureProtocol(baseUrl);
    }
    
    if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
      baseUrl = baseUrl.replace('localhost', '10.0.2.2');
    }
    
    if (baseUrl && (baseUrl.startsWith('http://') || baseUrl.startsWith('https://'))) {
      return baseUrl;
    }
  }
  
  let baseUrl = '192.168.1.10:3000/api/v1';
  
  if (Platform.OS === 'android') {
    baseUrl = '10.0.2.2:3000/api/v1';
  }
  
  return ensureProtocol(baseUrl);
};

// Interface cho API response
interface ApiDish {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: string;
  imageUrl: string | null;
  status: string;
  preparationTime: number;
  spiceLevel: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  calories: number | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiCategory {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  dishes: ApiDish[];
  createdAt: string;
  updatedAt: string;
}

interface FoodCategoriesResponse {
  data: ApiCategory[];
  total: number;
  pageInfo?: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Transform API dish to app MenuItem format
const transformApiDish = (dish: ApiDish, categoryName: string): any => {
  // Map category name to category key
  const categoryMap: Record<string, string> = {
    'Món Chính': 'main',
    'Khai Vị': 'starter',
    'Tráng Miệng': 'dessert',
    'Đồ Uống': 'drink',
  };
  
  const categoryKey = categoryMap[categoryName] || 'main';
  
  return {
    id: dish.id,
    name: dish.name,
    description: dish.description,
    price: parseFloat(dish.price) || 0,
    category: categoryKey,
    is_available: dish.status === 'available',
    prep_time_minutes: dish.preparationTime || 0,
    image_url: dish.imageUrl || undefined,
  };
};

class FoodService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
    console.log('🔧 FoodService initialized with base URL:', this.baseUrl);
  }

  async getFoodCategories(params?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }, accessToken?: string): Promise<{ categories: ApiCategory[]; dishes: any[]; total: number }> {
    try {
      let baseUrl = this.baseUrl.trim();
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      const endpoint = '/food/categories';
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (params?.isActive !== undefined) {
        queryParams.append('isActive', params.isActive.toString());
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `${baseUrl}${endpoint}?${queryString}` : `${baseUrl}${endpoint}`;

      if (!url || !url.startsWith('http')) {
        const errorMsg = `Invalid URL: "${url}". Base URL: "${this.baseUrl}". Please check EXPO_PUBLIC_API_URL environment variable.`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('📤 Fetching food categories:', url);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📥 Get food categories response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get food categories failed:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw {
          message: errorData.message || `Failed to fetch food categories: ${response.status}`,
          statusCode: response.status,
        };
      }

      const responseText = await response.text();
      console.log('📥 Get food categories response raw text:', responseText);
      
      let responseData: FoodCategoriesResponse;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('📥 Get food categories response data:', JSON.stringify(responseData, null, 2));

      // Transform all dishes from all categories into a flat list
      const allDishes: any[] = [];
      responseData.data.forEach((category) => {
        category.dishes.forEach((dish) => {
          allDishes.push(transformApiDish(dish, category.name));
        });
      });

      console.log('✅ Fetched food categories:', responseData.data.length, 'categories,', allDishes.length, 'dishes');

      return {
        categories: responseData.data,
        dishes: allDishes,
        total: responseData.total || responseData.data.length,
      };
    } catch (error: any) {
      console.error('❌ Error fetching food categories:', error);
      throw {
        message: error.message || 'Failed to fetch food categories',
        statusCode: error.statusCode || 500,
      };
    }
  }

  async getDishDetail(dishId: string, accessToken?: string): Promise<ApiDish & { category?: ApiCategory }> {
    try {
      let baseUrl = this.baseUrl.trim();
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      const endpoint = `/food/dishes/${dishId}`;
      const url = `${baseUrl}${endpoint}`;

      if (!url || !url.startsWith('http')) {
        const errorMsg = `Invalid URL: "${url}". Base URL: "${this.baseUrl}". Please check EXPO_PUBLIC_API_URL environment variable.`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('📤 Fetching dish detail:', url);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📥 Get dish detail response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get dish detail failed:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw {
          message: errorData.message || `Failed to fetch dish detail: ${response.status}`,
          statusCode: response.status,
        };
      }

      const responseData = await response.json();
      console.log('✅ Fetched dish detail:', responseData.id);

      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching dish detail:', error);
      throw {
        message: error.message || 'Failed to fetch dish detail',
        statusCode: error.statusCode || 500,
      };
    }
  }
}

export const foodService = new FoodService();

