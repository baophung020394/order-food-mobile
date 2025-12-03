import { useAuth } from "@/context/AuthContext";
import { useTableContext } from "@/context/TableContext";
import usersData from "@/services/fake-data/users.json";
import { BlurView } from "expo-blur";
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
  const groupedTables = useMemo(
    () =>
      tables.reduce((acc: Record<string, Table[]>, table) => {
        if (!acc[table.location]) acc[table.location] = [];
        acc[table.location].push(table);
        return acc;
      }, {}),
    [tables]
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
      console.error("Logout error:", error);
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
    <View className="flex-1" style={{ backgroundColor: "#3B82F6" }}>
      {/* Gradient Background Layers */}
      <View
        className="absolute inset-0"
        style={{
          backgroundColor: "#9333EA",
          opacity: 0.5,
        }}
      />
      <View
        className="absolute inset-0"
        style={{
          backgroundColor: "#EC4899",
          opacity: 0.3,
        }}
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <BlurView
          intensity={20}
          tint="light"
          className="flex-row items-center justify-between px-6 py-5"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Light source highlight */}
          <View
            className="absolute top-0 left-0 right-0 h-1/2"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          />
          <View className="flex-row items-center gap-x-4">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.3)",
              }}
            >
              <UtensilsCrossed color="#FFFFFF" size={24} />
            </View>
            <View>
              <Text className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>
                Restaurant POS
              </Text>
              <Text
                className="text-sm"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                {user?.full_name}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center rounded-2xl px-4 py-2.5"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={18} color="#FFFFFF" className="mr-2" />
            <Text
              className="text-sm font-semibold"
              style={{ color: "#FFFFFF" }}
            >
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </BlurView>
        {/* Quick Actions */}
        <View className="flex-row flex-wrap justify-between px-4 mt-6 mb-4 gap-3">
          <BlurView
            intensity={15}
            tint="light"
            className="flex-1 h-24 rounded-3xl items-center justify-center overflow-hidden"
            style={{
              minWidth: 78,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            {/* Light reflection */}
            <View
              className="absolute top-0 left-0 right-0 h-1/3"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
            <TouchableOpacity
              className="flex-1 w-full h-full items-center justify-center"
              onPress={() => router.push("/(tabs)/orders")}
              activeOpacity={0.8}
            >
            <ClipboardList size={28} color="#FFFFFF" />
              <Text
                className="mt-2 text-sm font-semibold"
                style={{ color: "#FFFFFF" }}
              >
                Đơn hàng
              </Text>
            </TouchableOpacity>
          </BlurView>
          <BlurView
            intensity={15}
            tint="light"
            className="flex-1 h-24 rounded-3xl items-center justify-center overflow-hidden"
            style={{
              minWidth: 78,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            {/* Light reflection */}
            <View
              className="absolute top-0 left-0 right-0 h-1/3"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
            <TouchableOpacity
              className="flex-1 w-full h-full items-center justify-center"
              onPress={() => router.push("/pages/kitchen")}
              activeOpacity={0.8}
            >
            <ChefHat size={28} color="#FFFFFF" />
              <Text
                className="mt-2 text-sm font-semibold"
                style={{ color: "#FFFFFF" }}
              >
                Bếp
              </Text>
            </TouchableOpacity>
          </BlurView>
          <BlurView
            intensity={15}
            tint="light"
            className="flex-1 h-24 rounded-3xl items-center justify-center overflow-hidden"
            style={{
              minWidth: 78,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            {/* Light reflection */}
            <View
              className="absolute top-0 left-0 right-0 h-1/3"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
            <TouchableOpacity
              className="flex-1 w-full h-full items-center justify-center"
              onPress={() => router.push("/pages/Menu")}
              activeOpacity={0.8}
            >
            <MenuIcon size={28} color="#FFFFFF" />
              <Text
                className="mt-2 text-sm font-semibold"
                style={{ color: "#FFFFFF" }}
              >
                Thực đơn
              </Text>
            </TouchableOpacity>
          </BlurView>
          <BlurView
            intensity={15}
            tint="light"
            className="flex-1 h-24 rounded-3xl items-center justify-center overflow-hidden"
            style={{
              minWidth: 78,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            {/* Light reflection */}
            <View
              className="absolute top-0 left-0 right-0 h-1/3"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
            <TouchableOpacity
              className="flex-1 w-full h-full items-center justify-center"
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.8}
            >
              <User size={28} color="#FFFFFF" />
              <Text
                className="mt-2 text-sm font-semibold"
                style={{ color: "#FFFFFF" }}
              >
                Tài khoản
              </Text>
            </TouchableOpacity>
          </BlurView>
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
              return (
                <BlurView
                  key={status}
                  intensity={15}
                  tint="light"
                  className="w-[47%] rounded-3xl p-5 flex-row items-center justify-between overflow-hidden"
                  style={{
                    marginBottom: 10,
                    minWidth: 140,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {/* Light reflection */}
                  <View
                    className="absolute top-0 left-0 right-0 h-1/3"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                    }}
                  />
                  <View>
                    <Text
                      className="text-xs"
                      style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      {config.label}
                    </Text>
                    <Text
                      className="text-3xl font-bold mt-1"
                      style={{ color: "#FFFFFF" }}
                    >
                      {count}
                    </Text>
                  </View>
                  <View
                    className="w-5 h-5 rounded-full"
                    style={{
                      backgroundColor:
                        config.bg === "bg-green-500"
                          ? "#10B981"
                          : config.bg === "bg-orange-500"
                          ? "#F59E0B"
                          : config.bg === "bg-blue-500"
                          ? "#3B82F6"
                          : "#EF4444",
                    }}
                  />
                </BlurView>
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
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <Users size={18} color="#FFFFFF" />
                </View>
                <Text
                  className="text-lg font-bold capitalize"
                  style={{ color: "#FFFFFF" }}
                >
                  Khu vực: {location}
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-x-3">
                {(locationTables as Table[]).map((table) => {
                  const config = statusConfig[table.status as TableStatus];
                  const statusColors: Record<string, string> = {
                    available: "rgba(16, 185, 129, 0.3)",
                    occupied: "rgba(245, 158, 11, 0.3)",
                    reserved: "rgba(59, 130, 246, 0.3)",
                    dirty: "rgba(239, 68, 68, 0.3)",
                  };
                  return (
                    <Pressable
                      key={table.id}
                      onPress={() => handleTableClick(table)}
                      className="mb-3 rounded-3xl overflow-hidden"
                      style={({ pressed }) => ({
                        minWidth: 110,
                        width: 110,
                        marginRight: 0,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <BlurView
                        intensity={10}
                        tint="light"
                        className="p-5 items-center justify-center rounded-3xl"
                        style={{
                          backgroundColor:
                            statusColors[table.status] ||
                            "rgba(255, 255, 255, 0.2)",
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.4)",
                        }}
                      >
                        {/* Light reflection */}
                        <View
                          className="absolute top-0 left-0 right-0 h-1/3"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                          }}
                        />
                        <View className="p-5 items-center justify-center w-full">
                        <Text
                          className="text-3xl font-bold mb-2"
                          style={{ color: "#FFFFFF" }}
                        >
                          {table.table_number}
                        </Text>
                        <View
                          className="flex-row items-center rounded-2xl px-3 py-1 mb-2"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderWidth: 1,
                            borderColor: "rgba(255, 255, 255, 0.3)",
                          }}
                        >
                          <Users
                            size={12}
                            color="#FFFFFF"
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: "#FFFFFF" }}
                          >
                            {table.seats} chỗ
                          </Text>
                        </View>
                        <Text
                          className="text-xs font-medium"
                          style={{ color: "rgba(255, 255, 255, 0.9)" }}
                        >
                          {config.label}
                        </Text>
                        </View>
                      </BlurView>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
