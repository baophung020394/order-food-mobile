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
    <SafeAreaView className="flex-1" style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}>
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-4 py-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.3)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center gap-x-3">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.4)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            <UtensilsCrossed color="#fff" size={22} />
          </View>
          <View>
            <Text className="text-xl font-bold" style={{ color: '#1e293b' }}>
              Restaurant POS
            </Text>
            <Text className="text-sm" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>{user?.full_name}</Text>
          </View>
        </View>
        <TouchableOpacity
          className="flex-row items-center rounded-md px-3 py-2"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)',
          }}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={18} color="#1e293b" className="mr-1" />
          <Text className="text-sm font-medium ml-1" style={{ color: '#1e293b' }}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
      {/* Quick Actions */}
      <View className="flex-row flex-wrap justify-between px-3 mt-4 mb-2 gap-2">
        <TouchableOpacity
          className="flex-1 h-20 rounded-xl items-center justify-center mr-2"
          style={{ 
            minWidth: 78,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
          onPress={() => router.push("/(tabs)/orders")}
          activeOpacity={0.80}
        >
          <ClipboardList size={28} color="#1e293b" />
          <Text className="mt-2 text-base font-semibold" style={{ color: '#1e293b' }}>
            Đơn hàng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-20 rounded-xl items-center justify-center mr-2"
          style={{ 
            minWidth: 78,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
          onPress={() => router.push("/pages/kitchen")}
          activeOpacity={0.80}
        >
          <ChefHat size={28} color="#1e293b" />
          <Text className="mt-2 text-base font-semibold" style={{ color: '#1e293b' }}>Bếp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-20 rounded-xl items-center justify-center mr-2"
          style={{ 
            minWidth: 78,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
          onPress={() => router.push("/pages/Menu")}
          activeOpacity={0.80}
        >
          <MenuIcon size={28} color="#1e293b" />
          <Text className="mt-2 text-base font-semibold" style={{ color: '#1e293b' }}>Thực đơn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-20 rounded-xl items-center justify-center"
          style={{ 
            minWidth: 78,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.80}
        >
          <User size={28} color="#1e293b" />
          <Text className="mt-2 text-base font-semibold" style={{ color: '#1e293b' }}>Tài khoản</Text>
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
                className="w-[47%] rounded-xl p-4 flex-row items-center justify-between mb-2"
                style={{ 
                  marginBottom: 10, 
                  minWidth: 140,
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <View>
                  <Text className="text-sm" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>{config.label}</Text>
                  <Text className="text-2xl font-bold mt-1" style={{ color: '#1e293b' }}>{count}</Text>
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
              <Users size={18} color="#1e293b" />
              <Text className="text-lg font-semibold capitalize" style={{ color: '#1e293b' }}>
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
                    className="mb-3"
                    style={{
                      minWidth: 105,
                      width: 108,
                      borderRadius: 16,
                      marginRight: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 12,
                      elevation: 6,
                    }}
                  >
                    <View className="p-4 items-center justify-center">
                      <Text className="text-2xl font-bold mb-1" style={{ color: '#1e293b' }}>
                        {table.table_number}
                      </Text>
                      <View 
                        className="flex-row items-center rounded-full px-3 py-0.5 mb-1 mt-1"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                      >
                        <Users size={14} color="#1e293b" style={{marginRight: 4}} />
                        <Text className="ml-1 text-xs font-semibold" style={{ color: '#1e293b' }}>
                          {table.seats} chỗ
                        </Text>
                      </View>
                      <Text className="text-xs font-medium mt-1" style={{ color: '#1e293b' }}>
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
