import tablesDataRaw from "@/services/fake-data/tables.json";
import { tableService } from "@/services/tableService";
import { useAuth } from "./AuthContext";
import React, { createContext, useContext, useEffect, useState } from "react";

export type TableStatus = "available" | "occupied" | "reserved" | "dirty";

export interface Table {
  id: string;
  table_number: string;
  seats: number;
  location: string;
  status: TableStatus;
  current_order_id: string | null;
  [key: string]: any;
}

type TableContextType = {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  updateTable: (id: string, newData: Partial<Table>) => void;
  setTableStatus: (id: string, status: TableStatus) => void;
  refreshTables: () => Promise<void>;
  createTable: (tableData: { tableNumber: string; seats: number; location: string; status?: string }) => Promise<Table>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const { accessToken } = useAuth();

  const fetchTables = async () => {
    try {
      const fetchedTables = await tableService.getTablesByLocation();
      setTables(fetchedTables);
    } catch (err: any) {
      console.error('Failed to fetch tables from API gateway, using fallback data:', err);
      // Fallback to fake data if API fails
      setTables(tablesDataRaw as Table[]);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const updateTable = (id: string, newData: Partial<Table>) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === id ? { ...table, ...newData } : table
      )
    );
  };
  const setTableStatus = (id: string, status: TableStatus) => {
    setTables((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  };

  const refreshTables = async () => {
    await fetchTables();
  };

  const createTable = async (tableData: { tableNumber: string; seats: number; location: string; status?: string }) => {
    try {
      const newTable = await tableService.createTable(tableData, accessToken || undefined);
      setTables((prev) => [...prev, newTable]);
      return newTable;
    } catch (error: any) {
      console.error('Failed to create table:', error);
      throw error;
    }
  };

  return (
    <TableContext.Provider value={{ tables, setTables, updateTable, setTableStatus, refreshTables, createTable }}>
      {children}
    </TableContext.Provider>
  );
};

export function useTableContext() {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error("useTableContext must be within TableProvider");
  return ctx;
}
