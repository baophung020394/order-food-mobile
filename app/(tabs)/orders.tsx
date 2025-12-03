import { useOrderContext } from "@/context/OrderContext";
import tablesData from "@/services/fake-data/tables.json";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, Clock, Search, XCircle } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const statusConfig = {
  draft: { label: "Nháp", icon: Clock, bg: "#888" },
  sent: { label: "Đã gửi", icon: Clock, bg: "#2196F3" },
  in_kitchen: { label: "Đang nấu", icon: Clock, bg: "#FF9800" },
  served: { label: "Đã phục vụ", icon: CheckCircle, bg: "#4CAF50" },
  completed: { label: "Hoàn thành", icon: CheckCircle, bg: "#388E3C" },
  cancelled: { label: "Đã hủy", icon: XCircle, bg: "#F44336" },
};
type OrderStatus = keyof typeof statusConfig;

export default function Orders() {
  const { orders } = useOrderContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const router = useRouter();

  const getTableNumber = (tableId: string) => {
    const table = tablesData.find((t) => t.id === tableId);
    return table?.table_number || "N/A";
  };
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = getTableNumber(order.table_id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#3B82F6' }}>
      {/* Gradient Background Layers */}
      <View 
        className="absolute inset-0"
        style={{
          backgroundColor: '#9333EA',
          opacity: 0.5,
        }}
      />
      <View 
        className="absolute inset-0"
        style={{
          backgroundColor: '#EC4899',
          opacity: 0.3,
        }}
      />
      
      <SafeAreaView className="flex-1">
        {/* Header */}
        <BlurView
          intensity={20}
          tint="light"
          className="px-6 py-5 flex-row items-center gap-4"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Light source highlight */}
          <View
            className="absolute top-0 left-0 right-0 h-1/2"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
          />
          <Pressable
            className="rounded-2xl p-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
          <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Đơn hàng</Text>
        </BlurView>
      {/* Search & Filter */}
      <View className="px-4 py-5">
        <View className="relative mb-4">
          <Search
            size={18}
            color="rgba(255, 255, 255, 0.8)"
            style={{ position: "absolute", left: 16, top: 14, zIndex: 1 }}
          />
          <BlurView
            intensity={15}
            tint="light"
            className="h-12 pl-12 pr-4 rounded-3xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
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
            <TextInput
              className="h-full text-base"
              style={{
                color: '#FFFFFF',
              }}
              placeholder="Tìm theo số bàn..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </BlurView>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="flex-row mt-2 pb-1"
          contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
        >
          <BlurView
            intensity={15}
            tint="light"
            className="px-5 py-2.5 rounded-3xl overflow-hidden max-h-10"
            style={{
              backgroundColor: filterStatus === "all" ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              flexShrink: 0,
            }}
          >
            <Pressable
              onPress={() => setFilterStatus("all")}
              className="w-full h-full items-center justify-center"
            >
              <Text className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Tất cả</Text>
            </Pressable>
          </BlurView>
          {Object.entries(statusConfig).map(([status, config]) => {
            const isActive = filterStatus === status;
            return (
              <BlurView
                key={status}
                intensity={15}
                tint="light"
                className="px-5 py-2.5 rounded-3xl overflow-hidden max-h-10"
                style={{
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  flexShrink: 0,
                }}
              >
                <Pressable
                  onPress={() => setFilterStatus(status as OrderStatus)}
                  className="w-full h-full items-center justify-center"
                >
                  <Text className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>{config.label}</Text>
                </Pressable>
              </BlurView>
            );
          })}
        </ScrollView>
      </View>
      {/* Orders List */}
      <FlatList
        className="px-4"
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="py-20 w-full justify-center items-center">
            <Text className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Không tìm thấy đơn hàng</Text>
          </View>
        }
        renderItem={({ item: order }) => {
          const config = statusConfig[order.status as OrderStatus];
          const StatusIcon = config.icon;
          return (
            <Pressable
              key={order.id}
              className="mb-4 rounded-3xl overflow-hidden"
              onPress={() => router.push(`/table/${order.table_id}`)}
            >
              <BlurView
                intensity={15}
                tint="light"
                className="p-5 rounded-3xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
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
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <View className="flex-row items-center gap-3 mb-2">
                    <Text className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Bàn {getTableNumber(order.table_id)}</Text>
                    <View 
                      style={{ 
                        backgroundColor: config.bg + 'CC',
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        borderRadius: 16, 
                        paddingHorizontal: 10, 
                        paddingVertical: 4,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      <StatusIcon size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "bold" }}>{config.label}</Text>
                    </View>
                  </View>
                  <Text className="text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{formatDate(order.created_at)}</Text>
                  {order.notes ? (
                    <Text className="text-xs italic" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Ghi chú: {order.notes}</Text>
                  ) : null}
                </View>
                <View className="items-end justify-end min-w-[95px]">
                  <Text className="text-xl font-bold" style={{ color: '#FFFFFF' }}>{formatCurrency(order.total)}</Text>
                </View>
              </View>
              </BlurView>
            </Pressable>
          );
        }}
      />
      </SafeAreaView>
    </View>
  );
}
