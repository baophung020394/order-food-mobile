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

  // Neumorphic shadow styles
  const neumorphicOutset = {
    shadowColor: '#D1D1D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  };
  const neumorphicInset = {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: -4,
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#E8E8E8' }}>
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-6 py-5 rounded-b-3xl"
        style={{ 
          backgroundColor: '#EEEEEE',
          ...neumorphicOutset,
        }}
      >
        <View className="flex-row items-center gap-x-4">
          <View 
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ 
              backgroundColor: '#EEEEEE',
              ...neumorphicInset,
            }}
          >
            <UtensilsCrossed color="#94A3B8" size={24} />
          </View>
          <View>
            <Text className="text-2xl font-bold" style={{ color: '#64748B' }}>
              Restaurant POS
            </Text>
            <Text className="text-sm" style={{ color: '#94A3B8' }}>{user?.full_name}</Text>
          </View>
        </View>
        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-4 py-2.5"
          style={{ 
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#64748B" className="mr-2" />
          <Text className="text-sm font-semibold" style={{ color: '#64748B' }}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
      {/* Quick Actions */}
      <View className="flex-row flex-wrap justify-between px-4 mt-6 mb-4 gap-3">
        <TouchableOpacity
          className="flex-1 h-24 rounded-3xl items-center justify-center"
          style={{ 
            minWidth: 78,
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
          onPress={() => router.push("/(tabs)/orders")}
          activeOpacity={0.7}
        >
          <ClipboardList size={28} color="#94A3B8" />
          <Text className="mt-2 text-sm font-semibold" style={{ color: '#64748B' }}>
            Đơn hàng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-24 rounded-3xl items-center justify-center"
          style={{ 
            minWidth: 78,
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
          onPress={() => router.push("/pages/kitchen")}
          activeOpacity={0.7}
        >
          <ChefHat size={28} color="#94A3B8" />
          <Text className="mt-2 text-sm font-semibold" style={{ color: '#64748B' }}>Bếp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-24 rounded-3xl items-center justify-center"
          style={{ 
            minWidth: 78,
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
          onPress={() => router.push("/pages/Menu")}
          activeOpacity={0.7}
        >
          <MenuIcon size={28} color="#94A3B8" />
          <Text className="mt-2 text-sm font-semibold" style={{ color: '#64748B' }}>Thực đơn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-24 rounded-3xl items-center justify-center"
          style={{ 
            minWidth: 78,
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.7}
        >
          <User size={28} color="#94A3B8" />
          <Text className="mt-2 text-sm font-semibold" style={{ color: '#64748B' }}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
      {/* Content */}
      <ScrollView
        className="flex-1 px-4 pb-5"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Stats */}
        <View className="flex-row flex-wrap mt-4 mb-4 justify-between gap-y-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = tables.filter((t) => t.status === status).length;
            const pastelColors: Record<string, string> = {
              available: '#C4E4D4',
              occupied: '#F4D1AE',
              reserved: '#B8D4E3',
              dirty: '#F2C2D1',
            };
            return (
              <View
                key={status}
                className="w-[47%] rounded-3xl p-5 flex-row items-center justify-between"
                style={{ 
                  marginBottom: 10, 
                  minWidth: 140,
                  backgroundColor: '#EEEEEE',
                  ...neumorphicOutset,
                }}
              >
                <View>
                  <Text className="text-xs font-medium" style={{ color: '#94A3B8' }}>{config.label}</Text>
                  <Text className="text-3xl font-bold mt-1" style={{ color: '#64748B' }}>{count}</Text>
                </View>
                <View 
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: pastelColors[status] || '#D4C5E8' }}
                />
              </View>
            );
          })}
        </View>
        {/* By location group */}
        {Object.entries(groupedTables).map(([location, locationTables]) => (
          <View key={location} className="mt-6">
            <View className="flex-row gap-3 items-center mb-5">
              <View 
                className="w-10 h-10 rounded-2xl items-center justify-center"
                style={{ 
                  backgroundColor: '#EEEEEE',
                  ...neumorphicInset,
                }}
              >
                <Users size={18} color="#94A3B8" />
              </View>
              <Text className="text-lg font-bold capitalize" style={{ color: '#64748B' }}>
                Khu vực: {location}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-x-3">
              {(locationTables as Table[]).map((table) => {
                const config = statusConfig[table.status as TableStatus];
                const pastelColors: Record<string, string> = {
                  available: '#C4E4D4',
                  occupied: '#F4D1AE',
                  reserved: '#B8D4E3',
                  dirty: '#F2C2D1',
                };
                return (
                  <Pressable
                    key={table.id}
                    onPress={() => handleTableClick(table)}
                    className="mb-3 rounded-3xl"
                    style={{
                      minWidth: 110,
                      width: 110,
                      marginRight: 0,
                      backgroundColor: pastelColors[table.status] || '#D4C5E8',
                      ...neumorphicOutset,
                    }}
                  >
                    <View className="p-5 items-center justify-center">
                      <Text className="text-3xl font-bold mb-2" style={{ color: '#64748B' }}>
                        {table.table_number}
                      </Text>
                      <View 
                        className="flex-row items-center rounded-2xl px-3 py-1 mb-2"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.5)',
                          ...neumorphicInset,
                        }}
                      >
                        <Users size={12} color="#64748B" style={{marginRight: 4}} />
                        <Text className="text-xs font-semibold" style={{ color: '#64748B' }}>
                          {table.seats} chỗ
                        </Text>
                      </View>
                      <Text className="text-xs font-medium" style={{ color: '#64748B' }}>
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
