import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import menuItemsDataJson from "./fake-data/menu-items.json";
import ordersDataJson from "./fake-data/orders.json";
import tablesDataJson from "./fake-data/tables.json";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  prep_time_minutes: number;
  metadata: { dietary: string[] };
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_snapshot: {
    id: string;
    name: string;
    price: number;
    category: string;
  };
  quantity: number;
  unit_price: number;
  note: string;
  status: "waiting" | "preparing" | "ready" | "served" | "cancelled";
}

interface Order {
  id: string;
  table_id: string;
  created_by: string;
  status: "draft" | "sent" | "in_kitchen" | "served" | "completed" | "cancelled";
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string;
  metadata: { source: string };
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface Table {
  id: string;
  table_number: string;
  seats: number;
  location: string;
  status: "available" | "occupied" | "reserved" | "dirty";
  current_order_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DataContextType {
  tables: Table[];
  orders: Order[];
  menuItems: MenuItem[];
  updateTable: (id: string, updates: Partial<Table>) => void;
  createOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  createMenuItem: (menuItem: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  getOrderByTableId: (tableId: string) => Order | undefined;
  getTableById: (id: string) => Table | undefined;
  getMenuItemById: (id: string) => MenuItem | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    // Load initial data from JSON files
    setTables(tablesDataJson as Table[]);
    setOrders(ordersDataJson as Order[]);
    setMenuItems(menuItemsDataJson as MenuItem[]);
  }, []);

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === id
          ? { ...table, ...updates, updated_at: new Date().toISOString() }
          : table
      )
    );
  };

  const createOrder = (order: Order) => {
    setOrders((prev) => [...prev, order]);
    // Update table status
    updateTable(order.table_id, {
      status: "occupied",
      current_order_id: order.id,
    });
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, ...updates, updated_at: new Date().toISOString() }
          : order
      )
    );

    // Update table status based on order status
    if (updates.status === "completed" || updates.status === "cancelled") {
      const order = orders.find((o) => o.id === id);
      if (order) {
        updateTable(order.table_id, {
          status: "available",
          current_order_id: null,
        });
      }
    }
  };

  const deleteOrder = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      // Update table status if needed
      updateTable(order.table_id, {
        status: "available",
        current_order_id: null,
      });
    }
  };

  const getOrderByTableId = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table?.current_order_id) {
      return orders.find((o) => o.id === table.current_order_id);
    }
    return undefined;
  };

  const getTableById = (id: string) => {
    return tables.find((t) => t.id === id);
  };

  const createMenuItem = (menuItem: MenuItem) => {
    setMenuItems((prev) => [...prev, menuItem]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updated_at: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getMenuItemById = (id: string) => {
    return menuItems.find((m) => m.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        tables,
        orders,
        menuItems,
        updateTable,
        createOrder,
        updateOrder,
        deleteOrder,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        getOrderByTableId,
        getTableById,
        getMenuItemById,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};
