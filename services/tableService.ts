import { Table, TableStatus } from '@/context/TableContext';
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
interface ApiTable {
  id: string;
  tableNumber: string;
  seats: number;
  location: string;
  status: string;
  currentOrderId: string | null;
  qrCodes?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface LocationGroup {
  location: string;
  tables: ApiTable[];
  count: number;
}

interface TablesByLocationResponse {
  data: LocationGroup[];
  total: number;
  pageInfo?: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Transform API table to app Table format
const transformApiTable = (apiTable: ApiTable): Table => {
  // Validate required fields
  if (!apiTable.id) {
    throw new Error('API table response is missing required field: id');
  }
  if (!apiTable.tableNumber) {
    throw new Error('API table response is missing required field: tableNumber');
  }
  if (typeof apiTable.seats !== 'number') {
    throw new Error('API table response is missing or invalid field: seats');
  }
  if (!apiTable.location) {
    throw new Error('API table response is missing required field: location');
  }

  return {
    id: apiTable.id,
    table_number: apiTable.tableNumber,
    seats: apiTable.seats,
    location: apiTable.location.toLowerCase(), // Normalize to lowercase for consistency
    status: (apiTable.status as TableStatus) || 'available',
    current_order_id: apiTable.currentOrderId || null,
  };
};

class TableService {
  private baseUrl: string;

  constructor() {
    let baseUrl = getApiBaseUrl();
    
    // Validate và fix baseUrl nếu cần
    if (!baseUrl || (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://'))) {
      console.warn('⚠️ Invalid baseUrl detected, using default:', baseUrl);
      // Fallback to default gateway
      const defaultHost = Platform.OS === 'android' 
        ? '10.0.2.2:3000' 
        : '192.168.1.10:3000';
      baseUrl = ensureProtocol(`${defaultHost}/api/v1`);
    }
    
    this.baseUrl = baseUrl;
    console.log('🔗 Table Service API Base URL (Gateway):', this.baseUrl);
    console.log('🔗 EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    console.log('🔗 Platform:', Platform.OS);
  }

  async getTablesByLocation(): Promise<Table[]> {
    try {
      // Đảm bảo baseUrl không có trailing slash và endpoint có leading slash
      let baseUrl = this.baseUrl.trim();
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      
      const endpoint = '/tables/by-location';
      const url = `${baseUrl}${endpoint}`;
      
      // Validate URL
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        const errorMsg = `Invalid URL: "${url}". Base URL: "${this.baseUrl}". Please check EXPO_PUBLIC_API_URL environment variable.`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('📤 Fetching tables from gateway:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📥 Tables response status:', response.status);
      console.log('📥 Response URL:', response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Tables fetch failed:', errorText);
        throw {
          message: `Failed to fetch tables: ${response.status}`,
          statusCode: response.status,
        };
      }

      const data: TablesByLocationResponse = await response.json();
      console.log('📥 Tables response data:', data);

      // Flatten the grouped data into a single array of tables
      const allTables: Table[] = [];
      data.data.forEach((locationGroup) => {
        locationGroup.tables.forEach((apiTable) => {
          allTables.push(transformApiTable(apiTable));
        });
      });

      console.log('✅ Transformed tables:', allTables.length);
      return allTables;
    } catch (error: any) {
      console.error('❌ Error fetching tables:', error);
      throw {
        message: error.message || 'Failed to fetch tables',
        statusCode: error.statusCode || 500,
      };
    }
  }

  async createTable(
    tableData: {
      tableNumber: string;
      seats: number;
      location: string;
      status?: string;
    },
    accessToken?: string
  ): Promise<Table> {
    try {
      let baseUrl = this.baseUrl.trim();
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      
      const endpoint = '/tables';
      const url = `${baseUrl}${endpoint}`;
      
      // Validate URL
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        const errorMsg = `Invalid URL: "${url}". Base URL: "${this.baseUrl}". Please check EXPO_PUBLIC_API_URL environment variable.`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('📤 Creating table:', url, tableData);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tableNumber: tableData.tableNumber,
          seats: tableData.seats,
          location: tableData.location,
          status: tableData.status || 'available',
        }),
      });

      console.log('📥 Create table response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create table failed:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw {
          message: errorData.message || `Failed to create table: ${response.status}`,
          statusCode: response.status,
        };
      }

      const responseText = await response.text();
      console.log('📥 Create table response raw text:', responseText);
      
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('📥 Create table response data:', JSON.stringify(responseData, null, 2));

      // Handle different response formats
      let apiTable: ApiTable;
      if (responseData.data && typeof responseData.data === 'object') {
        // Format: { data: ApiTable }
        apiTable = responseData.data;
        console.log('✅ Using response.data format');
      } else if (responseData.id) {
        // Format: ApiTable directly
        apiTable = responseData as ApiTable;
        console.log('✅ Using direct response format');
      } else {
        console.error('❌ Unknown response format:', responseData);
        throw new Error(`Invalid response format from API. Expected 'data' object or direct table object, got: ${JSON.stringify(responseData)}`);
      }

      // Validate that we have required fields
      if (!apiTable.id) {
        console.error('❌ Response missing id:', JSON.stringify(apiTable, null, 2));
        throw new Error('Response from API is missing required field: id');
      }

      console.log('📋 Transforming API table:', JSON.stringify(apiTable, null, 2));
      const createdTable = transformApiTable(apiTable);
      console.log('✅ Created table (transformed):', JSON.stringify(createdTable, null, 2));
      return createdTable;
    } catch (error: any) {
      console.error('❌ Error creating table:', error);
      throw {
        message: error.message || 'Failed to create table',
        statusCode: error.statusCode || 500,
      };
    }
  }
}

export const tableService = new TableService();













