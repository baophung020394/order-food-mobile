import { useAuth } from "@/context/AuthContext";
import { useTableContext } from "@/context/TableContext";
import usersData from "@/services/fake-data/users.json";
import { useRouter } from "expo-router";
import {
  ChefHat,
  ClipboardList,
  LogOut,
  MenuIcon,
  User,
  Users,
  UtensilsCrossed,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
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
  available: { label: "Trống", bg: "bg-green-500" },
  occupied: { label: "Có khách", bg: "bg-orange-500" },
  reserved: { label: "Đã đặt", bg: "bg-blue-500" },
  dirty: { label: "Dọn dẹp", bg: "bg-red-500" },
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
  const { tables } = useTableContext();
  const { logout: logoutAuth, user: authUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Sử dụng user từ AuthContext thay vì fake data
    if (authUser) {
      setUser(authUser);
    } else {
      // Fallback to demo user nếu chưa có auth user
      const demoUser = usersData[0];
      setUser(demoUser);
    }
  }, [authUser]);

  // Group by location (auto memoized)
  const groupedTables = useMemo(() =>
    tables.reduce((acc: Record<string, Table[]>, table) => {
      if (!acc[table.location]) acc[table.location] = [];
      acc[table.location].push(table);
      return acc;
    }, {}), [tables]
  );

  const handleLogout = async () => {
    try {
      // Gọi logout từ AuthContext (sẽ gọi API và clear local storage)
      await logoutAuth();
      Toast.show({
        type: "success",
        text1: "Đăng xuất thành công",
      });
      router.replace("/(auth)/sign-in");
    } catch (error: any) {
      console.error('Logout error:', error);
      Toast.show({
        type: "error",
        text1: "Đăng xuất thất bại",
        text2: error?.message || "Vui lòng thử lại",
      });
    }
  };

  const handleTableClick = (table: Table) => {
    router.push(`/table/${table.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      {/* Header */}
      <View className="border-b bg-white shadow-sm flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center gap-x-3">
          <View className="w-10 h-10 bg-green-700 rounded-full items-center justify-center mr-3">
            <UtensilsCrossed color="#fff" size={22} />
          </View>
          <View>
            <Text className="text-xl font-bold text-zinc-900">
              Restaurant POS
            </Text>
            <Text className="text-sm text-gray-500">{user?.full_name}</Text>
          </View>
        </View>
        <TouchableOpacity
          className="flex-row items-center border border-gray-300 rounded-md px-3 py-2 bg-white active:bg-gray-100"
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={18} color="#222" className="mr-1" />
          <Text className="text-sm font-medium ml-1">Đăng xuất</Text>
        </TouchableOpacity>
      </View>
      {/* Quick Actions */}
      <View className="flex-row flex-wrap justify-between px-3 mt-4 mb-2 gap-2">
        <TouchableOpacity
          className="flex-1 h-20 bg-white rounded-xl items-center justify-center mr-2 shadow-sm active:scale-95 active:bg-gray-100"
          style={{ minWidth: 78 }}
          onPress={() => router.push("/(tabs)/orders")}
          activeOpacity={0.80}
        >
          <ClipboardList size={28} color="#4B5563" />
          <Text className="mt-2 text-base font-semibold text-gray-800">
            Đơn hàng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-20 bg-white rounded-xl items-center justify-center mr-2 shadow-sm active:scale-95 active:bg-gray-100"
          style={{ minWidth: 78 }}
          onPress={() => router.push("/pages/kitchen")}
          activeOpacity={0.80}
        >
          <ChefHat size={28} color="#4B5563" />
          <Text className="mt-2 text-base font-semibold text-gray-800">Bếp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-20 bg-white rounded-xl items-center justify-center mr-2 shadow-sm active:scale-95 active:bg-gray-100"
          style={{ minWidth: 78 }}
          onPress={() => router.push("/pages/Menu")}
          activeOpacity={0.80}
        >
          <MenuIcon size={28} color="#4B5563" />
          <Text className="mt-2 text-base font-semibold text-gray-800">Thực đơn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-20 bg-white rounded-xl items-center justify-center shadow-sm active:scale-95 active:bg-gray-100"
          style={{ minWidth: 78 }}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.80}
        >
          <User size={28} color="#4B5563" />
          <Text className="mt-2 text-base font-semibold text-gray-800">Tài khoản</Text>
        </TouchableOpacity>
      </View>
      {/* Content */}
      <ScrollView
        className="flex-1 px-3 pb-5"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Stats */}
        <View className="flex-row flex-wrap mt-6 mb-4 justify-between gap-y-3">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = tables.filter((t) => t.status === status).length;
            return (
              <View
                key={status}
                className={`w-[47%] bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm mb-2 active:scale-95`}
                style={{ marginBottom: 10, minWidth: 140 }}
              >
                <View>
                  <Text className="text-sm text-gray-400">{config.label}</Text>
                  <Text className="text-2xl font-bold mt-1">{count}</Text>
                </View>
                <View className={`w-[18px] h-[18px] rounded-full ${config.bg}`} />
              </View>
            );
          })}
        </View>
        {/* By location group */}
        {Object.entries(groupedTables).map(([location, locationTables]) => (
          <View key={location} className="mt-3">
            <View className="flex-row gap-2 items-center mb-4">
              <Users size={18} color="#222" />
              <Text className="text-lg font-semibold capitalize">
                Khu vực: {location}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-x-3">
              {(locationTables as Table[]).map((table) => {
                const config = statusConfig[table.status as TableStatus];
                return (
                  <Pressable
                    key={table.id}
                    onPress={() => handleTableClick(table)}
                    className={`mb-3 active:scale-95 ${config.bg}`}
                    style={{
                      minWidth: 105,
                      width: 108,
                      borderRadius: 16,
                      marginRight: 12,
                      shadowColor: "#aaa",
                      shadowOpacity: 0.08,
                      elevation: 2,
                    }}
                  >
                    <View className="p-4 items-center justify-center">
                      <Text className="text-2xl font-bold text-white mb-1">
                        {table.table_number}
                      </Text>
                      <View className="flex-row items-center bg-white/20 rounded-full px-3 py-0.5 mb-1 mt-1">
                        <Users size={14} color="#fff" style={{marginRight: 4}} />
                        <Text className="ml-1 text-xs text-white font-semibold">
                          {table.seats} chỗ
                        </Text>
                      </View>
                      <Text className="text-white text-xs font-medium mt-1">
                        {config.label}
                      </Text>
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
