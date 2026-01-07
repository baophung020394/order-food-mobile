import { Order, OrderStatus } from '@/context/OrderContext';
import { Platform } from 'react-native';

// Helper function để đảm bảo URL có protocol
const ensureProtocol = (url: string): string => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `http://${url}`;
};

// Helper function để lấy API base URL (qua gateway port 3000)
const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (envUrl && envUrl.trim()) {
    let baseUrl = envUrl.trim();
    
    // Nếu chỉ là path (bắt đầu bằng /), thì thêm default host
    if (baseUrl.startsWith('/')) {
      const defaultHost = Platform.OS === 'android' 
        ? '10.0.2.2:3000' 
        : '192.168.1.10:3000';
      baseUrl = `${defaultHost}${baseUrl}`;
    }
    
    // Đảm bảo có protocol
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = ensureProtocol(baseUrl);
    }
    
    // Android Emulator cần dùng 10.0.2.2 thay vì localhost
    if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
      baseUrl = baseUrl.replace('localhost', '10.0.2.2');
    }
    
    // Validate final URL
    if (baseUrl && (baseUrl.startsWith('http://') || baseUrl.startsWith('https://'))) {
      return baseUrl;
    }
  }
  
  // Default API URL - Gateway port 3000
  let baseUrl = '192.168.1.10:3000/api/v1';
  
  if (Platform.OS === 'android') {
    baseUrl = '10.0.2.2:3000/api/v1';
  }
  
  return ensureProtocol(baseUrl);
};

// Interface cho API response
interface ApiOrderItem {
  id: string;
  orderId: string;
  dishId: string;
  dishName: string;
  quantity: number;
  price: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiOrder {
  id: string;
  tableId: string;
  status: string;
  totalAmount: string;
  notes?: string;
  createdBy: string;
  items: ApiOrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  data: ApiOrder[];
  total: number;
  pageInfo?: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Map API status to app OrderStatus
const mapApiStatusToOrderStatus = (apiStatus: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    'pending': 'draft',
    'draft': 'draft',
    'sent': 'sent',
    'in_kitchen': 'in_kitchen',
    'preparing': 'in_kitchen',
    'served': 'served',
    'completed': 'completed',
    'cancelled': 'cancelled',
  };
  return statusMap[apiStatus.toLowerCase()] || 'draft';
};

// Transform API order to app Order format
const transformApiOrder = (apiOrder: ApiOrder): Order => {
  // Validate required fields
  if (!apiOrder.id) {
    throw new Error('API order response is missing required field: id');
  }
  if (!apiOrder.tableId) {
    throw new Error('API order response is missing required field: tableId');
  }
  if (!apiOrder.status) {
    throw new Error('API order response is missing required field: status');
  }

  // Parse totalAmount from string to number
  const totalAmount = parseFloat(apiOrder.totalAmount) || 0;
  
  // Calculate subtotal from items
  const subtotal = apiOrder.items.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price) || 0;
    return sum + (itemPrice * item.quantity);
  }, 0);

  // Calculate tax (assuming 10% VAT)
  const tax = subtotal * 0.1;
  
  // Calculate discount (default 0)
  const discount = 0;

  // Transform items
  const orderItems = apiOrder.items.map((item) => {
    const itemPrice = parseFloat(item.price) || 0;
    return {
      id: item.id,
      menu_item_id: item.dishId,
      menu_item_name: item.dishName,
      quantity: item.quantity,
      price: itemPrice,
      unit_price: itemPrice, // For backward compatibility
      note: item.notes || '',
      status: 'waiting', // Default status
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      // For backward compatibility with existing components
      menu_snapshot: {
        id: item.dishId,
        name: item.dishName,
        price: itemPrice,
      },
    };
  });

  return {
    id: apiOrder.id,
    table_id: apiOrder.tableId,
    created_by: apiOrder.createdBy,
    status: mapApiStatusToOrderStatus(apiOrder.status),
    subtotal: subtotal,
    tax: tax,
    discount: discount,
    total: totalAmount,
    notes: apiOrder.notes || '',
    created_at: apiOrder.createdAt,
    updated_at: apiOrder.updatedAt,
    items: orderItems,
  };
};

class OrderService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
    console.log('🔧 OrderService initialized with base URL:', this.baseUrl);
  }

  async getOrders(params?: {
    status?: string;
    tableId?: string;
    page?: number;
    limit?: number;
  }, accessToken?: string): Promise<{ orders: Order[]; total: number; pageInfo?: any }> {
    try {
      let baseUrl = this.baseUrl.trim();
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      const endpoint = '/orders';
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.tableId) {
        queryParams.append('tableId', params.tableId);
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
      
      console.log('📤 Fetching orders:', url);

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

      console.log('📥 Get orders response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get orders failed:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw {
          message: errorData.message || `Failed to fetch orders: ${response.status}`,
          statusCode: response.status,
        };
      }

      const responseText = await response.text();
      console.log('📥 Get orders response raw text:', responseText);
      
      let responseData: OrdersResponse;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('📥 Get orders response data:', JSON.stringify(responseData, null, 2));

      // Transform API orders to app format
      const orders = responseData.data.map((apiOrder) => {
        try {
          return transformApiOrder(apiOrder);
        } catch (error: any) {
          console.error('❌ Error transforming order:', apiOrder.id, error);
          throw error;
        }
      });

      console.log('✅ Fetched orders:', orders.length);

      return {
        orders,
        total: responseData.total || orders.length,
        pageInfo: responseData.pageInfo,
      };
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      throw {
        message: error.message || 'Failed to fetch orders',
        statusCode: error.statusCode || 500,
      };
    }
  }

  async getOrderByTableId(tableId: string, accessToken?: string): Promise<Order[]> {
    try {
      let baseUrl = this.baseUrl.trim();
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      const endpoint = `/orders/table/${tableId}`;
      const url = `${baseUrl}${endpoint}`;

      if (!url || !url.startsWith('http')) {
        const errorMsg = `Invalid URL: "${url}". Base URL: "${this.baseUrl}". Please check EXPO_PUBLIC_API_URL environment variable.`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('📤 Fetching order by table ID:', url);

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

      console.log('📥 Get order by table ID response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get order by table ID failed:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw {
          message: errorData.message || `Failed to fetch order: ${response.status}`,
          statusCode: response.status,
        };
      }

      const responseText = await response.text();
      console.log('📥 Get order by table ID response raw text:', responseText);
      
      let apiOrders: ApiOrder[];
      try {
        const parsed = JSON.parse(responseText);
        // Response có thể là array trực tiếp hoặc có wrapper { data: [...] }
        if (Array.isArray(parsed)) {
          apiOrders = parsed;
        } else if (parsed.data && Array.isArray(parsed.data)) {
          apiOrders = parsed.data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('📥 Get order by table ID response data:', JSON.stringify(apiOrders, null, 2));

      // Transform API orders to app format
      const orders = apiOrders.map((apiOrder) => {
        try {
          return transformApiOrder(apiOrder);
        } catch (error: any) {
          console.error('❌ Error transforming order:', apiOrder.id, error);
          throw error;
        }
      });

      console.log('✅ Fetched orders by table ID:', orders.length);

      return orders;
    } catch (error: any) {
      console.error('❌ Error fetching order by table ID:', error);
      throw {
        message: error.message || 'Failed to fetch order',
        statusCode: error.statusCode || 500,
      };
    }
  }

  async updateOrder(
    orderId: string,
    data: {
      status?: string;
      notes?: string;
      items?: Array<{
        dishId: string;
        dishName: string;
        quantity: number;
        price: number;
      }>;
    },
    accessToken?: string
  ): Promise<Order> {
    try {
      let baseUrl = this.baseUrl.trim();
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      const endpoint = `/orders/${orderId}`;
      const url = `${baseUrl}${endpoint}`;

      if (!url || !url.startsWith('http')) {
        const errorMsg = `Invalid URL: "${url}". Base URL: "${this.baseUrl}". Please check EXPO_PUBLIC_API_URL environment variable.`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('📤 Updating order:', url);
      console.log('📤 Update order data:', JSON.stringify(data, null, 2));

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      console.log('📥 Update order response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update order failed:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw {
          message: errorData.message || `Failed to update order: ${response.status}`,
          statusCode: response.status,
        };
      }

      const responseText = await response.text();
      console.log('📥 Update order response raw text:', responseText);
      
      let apiOrder: ApiOrder;
      try {
        apiOrder = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('📥 Update order response data:', JSON.stringify(apiOrder, null, 2));

      // Transform API order to app format
      const order = transformApiOrder(apiOrder);

      console.log('✅ Updated order:', order.id);

      return order;
    } catch (error: any) {
      console.error('❌ Error updating order:', error);
      throw {
        message: error.message || 'Failed to update order',
        statusCode: error.statusCode || 500,
      };
    }
  }
}

export const orderService = new OrderService();

