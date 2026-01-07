import { useAuth } from "@/context/AuthContext";
import { useTableContext } from "@/context/TableContext";
import usersData from "@/services/fake-data/users.json";
import { useRouter } from "expo-router";
import {
  ChefHat,
  ClipboardList,
  LogOut,
  MenuIcon,
  Plus,
  TrendingUp,
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
  available: { label: "Trống", bg: "bg-green-500", color: "#4CAF50" },
  occupied: { label: "Có khách", bg: "bg-orange-500", color: "#FF9800" },
  reserved: { label: "Đã đặt", bg: "bg-blue-500", color: "#2196F3" },
  dirty: { label: "Dọn dẹp", bg: "bg-red-500", color: "#F44336" },
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
    if (authUser) {
      setUser(authUser);
    } else {
      const demoUser = usersData[0];
      setUser(demoUser);
    }
  }, [authUser]);

  const groupedTables = useMemo(() =>
    tables.reduce((acc: Record<string, Table[]>, table) => {
      if (!acc[table.location]) acc[table.location] = [];
      acc[table.location].push(table);
      return acc;
    }, {}), [tables]
  );

  const handleTableClick = (table: Table) => {
    router.push(`/table/${table.id}`);
  };

  const handleLogout = async () => {
    try {
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

  return (
    <SafeAreaView className="flex-1">
      {/* Aurora Gradient Background */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          backgroundColor: "#667eea",
          opacity: 0.4,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          backgroundColor: "#764ba2",
          opacity: 0.3,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: 300,
          backgroundColor: "#f093fb",
          opacity: 0.2,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 150,
          backgroundColor: "#4facfe",
          opacity: 0.25,
        }}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 relative z-10">
        <View className="flex-row items-center gap-x-3">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <UtensilsCrossed color="#fff" size={24} />
          </View>
          <View>
            <Text className="text-2xl font-bold text-white">Restaurant POS</Text>
            <Text className="text-sm text-white/80">{user?.full_name}</Text>
          </View>
        </View>
        <TouchableOpacity
          className="flex-row items-center rounded-full px-4 py-2"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View className="flex-row flex-wrap justify-between px-4 mt-2 mb-4 gap-2 relative z-10">
        <TouchableOpacity
          className="flex-1 h-24 rounded-2xl items-center justify-center mr-2"
          style={{
            minWidth: 85,
            backgroundColor: "rgba(255,255,255,0.95)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
          onPress={() => router.push("/(tabs)/orders")}
          activeOpacity={0.85}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: "#FF6B9D" }}>
            <ClipboardList size={24} color="#fff" />
          </View>
          <Text className="text-sm font-bold text-gray-800">Đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-24 rounded-2xl items-center justify-center mr-2"
          style={{
            minWidth: 85,
            backgroundColor: "rgba(255,255,255,0.95)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
          onPress={() => router.push("/pages/kitchen")}
          activeOpacity={0.85}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: "#4ECDC4" }}>
            <ChefHat size={24} color="#fff" />
          </View>
          <Text className="text-sm font-bold text-gray-800">Bếp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-24 rounded-2xl items-center justify-center mr-2"
          style={{
            minWidth: 85,
            backgroundColor: "rgba(255,255,255,0.95)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
          onPress={() => router.push("/pages/Menu")}
          activeOpacity={0.85}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: "#FFB347" }}>
            <MenuIcon size={24} color="#fff" />
          </View>
          <Text className="text-sm font-bold text-gray-800">Thực đơn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-24 rounded-2xl items-center justify-center"
          style={{
            minWidth: 85,
            backgroundColor: "rgba(255,255,255,0.95)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.85}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: "#9B59B6" }}>
            <User size={24} color="#fff" />
          </View>
          <Text className="text-sm font-bold text-gray-800">Tài khoản</Text>
        </TouchableOpacity>
      </View>

      {/* Create Table Button */}
      <View className="px-4 mb-4 relative z-10">
        <TouchableOpacity
          className="rounded-2xl py-4 flex-row items-center justify-center"
          style={{
            backgroundColor: "#667eea",
            shadowColor: "#667eea",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
          onPress={() => router.push("/pages/create-table" as any)}
          activeOpacity={0.85}
        >
          <Plus size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text className="text-white font-bold text-base">Tạo bàn mới</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 pb-5"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats CTA */}
        <TouchableOpacity
          className="rounded-3xl p-6 mb-6 mt-2 overflow-hidden"
          style={{
            backgroundColor: "#667eea",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
          onPress={() => router.push("/(tabs)/orders")}
          activeOpacity={0.9}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "40%",
              height: "100%",
              backgroundColor: "#764ba2",
              opacity: 0.6,
            }}
          />
          <View className="flex-row items-center justify-between relative z-10">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white mb-2">
                Quản lý đơn hàng
              </Text>
              <Text className="text-white/90 text-base mb-4">
                Xem và quản lý tất cả đơn hàng của bạn
              </Text>
              <View className="flex-row items-center bg-white/20 rounded-full px-4 py-2 self-start">
                <TrendingUp size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white font-semibold">Xem đơn hàng</Text>
              </View>
            </View>
            <View className="w-20 h-20 rounded-full items-center justify-center bg-white/20 ml-4">
              <ClipboardList size={40} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Stats Cards */}
        <View className="flex-row flex-wrap mb-6 justify-between gap-y-3">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = tables.filter((t) => t.status === status).length;
            return (
              <View
                key={status}
                className="w-[47%] rounded-3xl p-5 overflow-hidden"
                style={{
                  minWidth: 140,
                  backgroundColor: "rgba(255,255,255,0.95)",
                  shadowColor: config.color,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: `${config.color}30`,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "60%",
                    height: "100%",
                    backgroundColor: config.color,
                    opacity: 0.1,
                  }}
                />
                <View className="flex-row items-center justify-between relative z-10">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-600 font-medium mb-1">{config.label}</Text>
                    <Text className="text-4xl font-bold" style={{ color: config.color }}>{count}</Text>
                  </View>
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ 
                      backgroundColor: `${config.color}20`,
                      shadowColor: config.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <View className={`w-6 h-6 rounded-full`} style={{ backgroundColor: config.color }} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Tables by Location */}
        {Object.entries(groupedTables).map(([location, locationTables]) => {
          const locationColors: Record<string, string> = {
            "main hall": "#FF6B9D",
            "patio": "#4ECDC4",
            "terrace": "#FFB347",
            "vip": "#9B59B6",
          };
          const locationKey = location.toLowerCase();
          const locationColor = locationColors[locationKey] || "#667eea";
          
          // Format location name: capitalize each word
          const formatLocationName = (loc: string) => {
            return loc
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
          };
          
          return (
            <View key={location} className="mt-4 mb-6">
              <View className="flex-row gap-3 items-center mb-4 px-1">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ 
                    backgroundColor: `${locationColor}20`,
                    shadowColor: locationColor,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Users size={20} color={locationColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900">
                    Khu vực: {formatLocationName(location)}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    {locationTables.length} bàn
                  </Text>
                </View>
              </View>
              <View className="flex-row flex-wrap gap-x-3">
                {(locationTables as Table[]).map((table) => {
                  const config = statusConfig[table.status as TableStatus];
                  return (
                    <Pressable
                      key={table.id}
                      onPress={() => handleTableClick(table)}
                      className="mb-3 rounded-3xl overflow-hidden"
                      style={{
                        minWidth: 105,
                        width: 108,
                        backgroundColor: config.color,
                        shadowColor: config.color,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.25,
                        shadowRadius: 10,
                        elevation: 8,
                        borderWidth: 2,
                        borderColor: "rgba(255,255,255,0.3)",
                      }}
                    >
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: "40%",
                          height: "100%",
                          backgroundColor: "rgba(255,255,255,0.1)",
                        }}
                      />
                      <View className="p-4 items-center justify-center relative z-10">
                        <Text className="text-3xl font-bold text-white mb-2">
                          {table.table_number}
                        </Text>
                        <View className="flex-row items-center bg-white/25 rounded-full px-3 py-1.5 mb-2 mt-1"
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 2,
                            elevation: 2,
                          }}
                        >
                          <Users size={14} color="#fff" style={{marginRight: 4}} />
                          <Text className="ml-1 text-xs text-white font-bold">
                            {table.seats} chỗ
                          </Text>
                        </View>
                        <View 
                          className="px-2 py-1 rounded-lg"
                          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                        >
                          <Text className="text-white text-xs font-semibold">
                            {config.label}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
