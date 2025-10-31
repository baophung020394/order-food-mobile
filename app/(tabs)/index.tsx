import tablesDataRaw from "@/services/fake-data/tables.json";
import usersData from "@/services/fake-data/users.json";
import { useRouter } from "expo-router";
import { LogOut, Users, UtensilsCrossed } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const statusConfig = {
  available: { label: "Trống", bg: "#4CAF50" },
  occupied: { label: "Có khách", bg: "#FF9800" },
  reserved: { label: "Đã đặt", bg: "#2196F3" },
  dirty: { label: "Dọn dẹp", bg: "#F44336" },
};

type TableStatus = keyof typeof statusConfig;

type Table = {
  id: string;
  table_number: string;
  seats: number;
  location: string;
  status: TableStatus;
  current_order_id: string | null;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Lấy user từ user mẫu, thực tế lấy từ AsyncStorage hoặc context
    const demoUser = usersData[0];
    setUser(demoUser);
    const safeTables = (tablesDataRaw as any[]).map(table => ({
      ...table,
      status: table.status as TableStatus,
    })) as Table[];
    setTables(safeTables);
  }, []);

  // Group by location
  const groupedTables = tables.reduce((acc: Record<string, Table[]>, table) => {
    if (!acc[table.location]) acc[table.location] = [];
    acc[table.location].push(table);
    return acc;
  }, {});

  const handleLogout = () => {
    Toast.show({
      type: "success",
      text1: "Đăng xuất thành công",
    });
    router.replace("/(auth)/sign-in");
  };

  const handleTableClick = (table: Table) => {
    router.push(`/table/${table.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F8F8]">
      {/* Header */}
      <View className="border-b bg-white shadow-sm flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center gap-x-3">
          <View className="w-10 h-10 bg-[#388E3C] rounded-full items-center justify-center mr-3">
            <UtensilsCrossed color="#fff" size={22} />
          </View>
          <View>
            <Text className="text-xl font-bold text-[#222]">Restaurant POS</Text>
            <Text className="text-sm text-gray-500">{user?.full_name}</Text>
          </View>
        </View>
        <TouchableOpacity className="flex-row items-center border border-[#E0E0E0] rounded-md px-3 py-2" onPress={handleLogout}>
          <LogOut size={18} color="#222" className="mr-1" />
          <Text className="text-sm font-medium ml-1">Đăng xuất</Text>
        </TouchableOpacity>
      </View>
      {/* Content */}
      <ScrollView className="flex-1 px-3 pb-5" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Stats */}
        <View className="flex-row flex-wrap mt-6 mb-4 justify-between gap-y-3">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = tables.filter((t) => t.status === status).length;
            return (
              <View key={status} className="w-[47%] bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm mb-2" style={{marginBottom: 10, minWidth: 140}}>
                <View>
                  <Text className="text-sm text-gray-400">{config.label}</Text>
                  <Text className="text-2xl font-bold mt-1">{count}</Text>
                </View>
                <View style={{ backgroundColor: config.bg, width: 18, height: 18, borderRadius: 9 }} />
              </View>
            );
          })}
        </View>
        {/* By location group */}
        {Object.entries(groupedTables).map(([location, locationTables]) => (
          <View key={location} className="mt-3">
            <View className="flex-row gap-2 items-center mb-4">
              <Users size={18} color="#222" />
              <Text className="text-lg font-semibold capitalize">Khu vực: {location}</Text>
            </View>
            <View className="flex-row flex-wrap gap-x-3">
              {(locationTables as Table[]).map((table) => {
                const config = statusConfig[table.status as TableStatus];
                return (
                  <Pressable
                    key={table.id}
                    onPress={() => handleTableClick(table)}
                    className="mb-3"
                    style={{ minWidth: 105, width: 108, backgroundColor: config.bg, borderRadius: 16, marginRight: 12, shadowColor: '#aaa', shadowOpacity: 0.08, elevation: 2 }}
                  >
                    <View className="p-4 items-center justify-center">
                      <Text className="text-2xl font-bold text-white mb-1">{table.table_number}</Text>
                      <View className="flex-row items-center bg-white/20 rounded-full px-3 py-0.5 mb-1 mt-1">
                        <Users size={14} color="#fff" style={{marginRight: 4}} />
                        <Text className="ml-1 text-xs text-white font-semibold">{table.seats} chỗ</Text>
                      </View>
                      <Text className="text-white text-xs font-medium mt-1">{config.label}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
