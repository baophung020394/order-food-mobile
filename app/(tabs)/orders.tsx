import { useOrderContext } from "@/context/OrderContext";
import { useTableContext } from "@/context/TableContext";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, ClipboardList, Clock, Search, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const statusConfig = {
  draft: { label: "Nháp", icon: Clock, bg: "#888", color: "#888" },
  sent: { label: "Đã gửi", icon: Clock, bg: "#2196F3", color: "#2196F3" },
  in_kitchen: { label: "Đang nấu", icon: Clock, bg: "#FF9800", color: "#FF9800" },
  served: { label: "Đã phục vụ", icon: CheckCircle, bg: "#4CAF50", color: "#4CAF50" },
  completed: { label: "Hoàn thành", icon: CheckCircle, bg: "#388E3C", color: "#388E3C" },
  cancelled: { label: "Đã hủy", icon: XCircle, bg: "#F44336", color: "#F44336" },
};
type OrderStatus = keyof typeof statusConfig;

// Map app status to API status
const mapStatusToApi = (status: OrderStatus | "all"): string | undefined => {
  if (status === "all") return undefined;
  const statusMap: Record<OrderStatus, string> = {
    draft: "pending",
    sent: "sent",
    in_kitchen: "in_kitchen",
    served: "served",
    completed: "completed",
    cancelled: "cancelled",
  };
  return statusMap[status];
};

export default function Orders() {
  const { orders, refreshOrders, loading } = useOrderContext();
  const { tables } = useTableContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const router = useRouter();

  // Fetch orders when filter changes
  useEffect(() => {
    const apiStatus = mapStatusToApi(filterStatus);
    refreshOrders({
      status: apiStatus,
      limit: 50, // Fetch more orders for better UX
    });
  }, [filterStatus]);

  const getTableNumber = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    return table?.table_number || "N/A";
  };

  // Filter orders by search query (client-side filtering for search)
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = getTableNumber(order.table_id).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
    <SafeAreaView className="flex-1">
      {/* Aurora Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          backgroundColor: "#667eea",
          opacity: 0.3,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: 200,
          backgroundColor: "#764ba2",
          opacity: 0.2,
        }}
      />

      {/* Header */}
      <View className="px-4 py-4 flex-row items-center gap-3 relative z-10">
        <Pressable
          className="rounded-full p-2"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color="#fff" />
        </Pressable>
        <Text className="text-2xl font-bold text-white flex-1">Danh sách đơn hàng</Text>
      </View>

      {/* Search & Filter */}
      <View className="px-4 pb-3 relative z-10">
        <View className="relative mb-3">
          <Search
            size={18}
            color="#999"
            style={{ position: "absolute", left: 14, top: 13, zIndex: 1 }}
          />
          <TextInput
            className="h-12 bg-white pl-10 pr-3 rounded-2xl text-[15px]"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            placeholder="Tìm theo số bàn..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          <Pressable
            onPress={() => setFilterStatus("all")}
            className={`px-5 py-2.5 rounded-full ${filterStatus === "all" ? "bg-white" : "bg-white/80"}`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className={`font-semibold ${filterStatus === "all" ? "text-[#667eea]" : "text-gray-600"}`}>Tất cả</Text>
          </Pressable>
          {Object.entries(statusConfig).map(([status, config]) => (
            <Pressable
              key={status}
              onPress={() => setFilterStatus(status as OrderStatus)}
              className={`px-5 py-2.5 rounded-full ${filterStatus === status ? "bg-white" : "bg-white/80"}`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text className={`font-semibold ${filterStatus === status ? "text-[#667eea]" : "text-gray-600"}`}>{config.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-gray-500 mt-4">Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          className="px-4 pt-2"
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshing={loading}
          onRefresh={() => {
            const apiStatus = mapStatusToApi(filterStatus);
            refreshOrders({
              status: apiStatus,
              limit: 50,
            });
          }}
          ListEmptyComponent={
            <View className="py-16 w-full justify-center items-center">
              <ClipboardList size={48} color="#ccc" />
              <Text className="text-gray-400 mt-4 text-lg">
                {searchQuery ? "Không tìm thấy đơn hàng nào" : "Chưa có đơn hàng nào"}
              </Text>
            </View>
          }
        renderItem={({ item: order }) => {
          const config = statusConfig[order.status as OrderStatus];
          const StatusIcon = config.icon;
          
          return (
            <Pressable
              key={order.id}
              className="bg-white mb-4 rounded-3xl overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 5,
              }}
              onPress={() => router.push(`/table/${order.table_id}`)}
            >
              {/* Order Preview Header */}
              <View className="p-5" style={{ backgroundColor: config.color, opacity: 0.1 }}>
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-lg font-bold text-gray-900">Bàn {getTableNumber(order.table_id)}</Text>
                    <Text className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</Text>
                  </View>
                  <View
                    className="px-3 py-1.5 rounded-full flex-row items-center"
                    style={{ backgroundColor: config.color }}
                  >
                    <StatusIcon size={14} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>{config.label}</Text>
                  </View>
                </View>
              </View>

              {/* Order Details */}
              <View className="p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-sm text-gray-500 mb-1">Chi tiết đơn hàng</Text>
                    <Text className="text-base font-semibold text-gray-800">
                      {order.items?.length || 0} món đã đặt
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm text-gray-500 mb-1">Tổng tiền</Text>
                    <Text className="text-2xl font-bold" style={{ color: config.color }}>
                      {formatCurrency(order.total)}
                    </Text>
                  </View>
                </View>
                {order.notes ? (
                  <View className="bg-gray-50 rounded-xl p-3 mt-2">
                    <Text className="text-xs text-gray-600 italic">Ghi chú: {order.notes}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        }}
        />
      )}
    </SafeAreaView>
  );
}
