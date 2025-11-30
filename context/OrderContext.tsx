import ordersDataRaw from "@/services/fake-data/orders.json";
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
  [key: string]: any;
}

type OrderContextType = {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  updateOrder: (id: string, newData: Partial<Order>) => void;
  createOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(ordersDataRaw as Order[]);
  }, []);

  const updateOrder = (id: string, newData: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, ...newData, updated_at: new Date().toISOString() } : order
      )
    );
  };
  const createOrder = (order: Order) => {
    setOrders((prev) => [{ ...order, updated_at: new Date().toISOString() }, ...prev]);
  };
  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  return (
    <OrderContext.Provider value={{ orders, setOrders, updateOrder, createOrder, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export function useOrderContext() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrderContext must be within OrderProvider");
  return ctx;
}
