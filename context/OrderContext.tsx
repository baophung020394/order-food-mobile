import { orderService } from "@/services/orderService";
import { useAuth } from "@/context/AuthContext";
import React, { createContext, useContext, useEffect, useState } from "react";

export type OrderStatus = "draft" | "sent" | "in_kitchen" | "served" | "completed" | "cancelled";

export interface Order {
  id: string;
  table_id: string;
  created_by: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  [key: string]: any;
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  price: number;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

type OrderContextType = {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  updateOrder: (id: string, newData: Partial<Order>) => void;
  updateOrderViaApi: (id: string, data: { status?: string; notes?: string; items?: Array<{ dishId: string; dishName: string; quantity: number; price: number }> }) => Promise<Order>;
  createOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  refreshOrders: (params?: { status?: string; tableId?: string; page?: number; limit?: number }) => Promise<void>;
  getOrderByTableId: (tableId: string) => Promise<Order | null>;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  const fetchOrders = async (params?: { status?: string; tableId?: string; page?: number; limit?: number }) => {
    try {
      setLoading(true);
      const result = await orderService.getOrders(params, accessToken || undefined);
      setOrders(result.orders);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      // Fallback to empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch orders on mount
    fetchOrders();
  }, []);

  const refreshOrders = async (params?: { status?: string; tableId?: string; page?: number; limit?: number }) => {
    await fetchOrders(params);
  };

  const getOrderByTableId = async (tableId: string): Promise<Order | null> => {
    try {
      setLoading(true);
      const orders = await orderService.getOrderByTableId(tableId, accessToken || undefined);
      // Return the first order (most recent) or null if no orders
      return orders.length > 0 ? orders[0] : null;
    } catch (error: any) {
      console.error('Failed to fetch order by table ID:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = (id: string, newData: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, ...newData, updated_at: new Date().toISOString() } : order
      )
    );
  };

  const updateOrderViaApi = async (
    id: string,
    data: {
      status?: string;
      notes?: string;
      items?: Array<{
        dishId: string;
        dishName: string;
        quantity: number;
        price: number;
      }>;
    }
  ): Promise<Order> => {
    try {
      setLoading(true);
      const updatedOrder = await orderService.updateOrder(id, data, accessToken || undefined);
      
      // Update local state with the updated order
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? updatedOrder : order
        )
      );
      
      return updatedOrder;
    } catch (error: any) {
      console.error('Failed to update order via API:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const createOrder = (order: Order) => {
    setOrders((prev) => [{ ...order, updated_at: new Date().toISOString() }, ...prev]);
  };
  
  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  return (
    <OrderContext.Provider value={{ orders, setOrders, updateOrder, updateOrderViaApi, createOrder, deleteOrder, refreshOrders, getOrderByTableId, loading }}>
      {children}
    </OrderContext.Provider>
  );
};

export function useOrderContext() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrderContext must be within OrderProvider");
  return ctx;
}
