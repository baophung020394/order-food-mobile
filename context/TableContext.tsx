import React, { createContext, useContext, useEffect, useState } from "react";
import tablesDataRaw from "@/services/fake-data/tables.json";

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
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    setTables(tablesDataRaw as Table[]);
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

  return (
    <TableContext.Provider value={{ tables, setTables, updateTable, setTableStatus }}>
      {children}
    </TableContext.Provider>
  );
};

export function useTableContext() {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error("useTableContext must be within TableProvider");
  return ctx;
}
