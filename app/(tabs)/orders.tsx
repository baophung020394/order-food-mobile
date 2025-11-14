import { useOrderContext } from "@/context/OrderContext";
import tablesData from "@/services/fake-data/tables.json";
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
    <SafeAreaView className="flex-1 bg-[#F8F8F8]">
      {/* Header */}
      <View className="bg-white border-b shadow-sm px-4 py-4 flex-row items-center gap-3">
        <Pressable
          className="rounded-full bg-gray-100 p-1 mr-2"
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color="#222" />
        </Pressable>
        <Text className="text-xl font-bold">Danh sách đơn hàng</Text>
      </View>
      {/* Search & Filter */}
      <View className="px-4 py-3 bg-[#F8F8F8]">
        <View className="relative mb-2">
          <Search
            size={18}
            color="#999"
            style={{ position: "absolute", left: 14, top: 13 }}
          />
          <TextInput
            className="h-11 bg-white pl-10 pr-3 rounded-lg border border-[#E0E0E0] text-[15px]"
            placeholder="Tìm theo số bàn..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mt-2 pb-1">
          <Pressable
            onPress={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-full border mr-2 ${filterStatus === "all" ? "bg-[#4CAF50] border-[#4CAF50]" : "bg-white border-[#E0E0E0]"}`}
          >
            <Text className={`font-semibold ${filterStatus === "all" ? "text-white" : "text-[#333]"}`}>Tất cả</Text>
          </Pressable>
          {Object.entries(statusConfig).map(([status, config]) => (
            <Pressable
              key={status}
              onPress={() => setFilterStatus(status as OrderStatus)}
              className={`px-4 py-2 rounded-full border mr-2 ${filterStatus === status ? `bg-[${config.bg}] border-[${config.bg}]` : "bg-white border-[#E0E0E0]"}`}
            >
              <Text className={`font-semibold ${filterStatus === status ? "text-white" : "text-[#333]"}`}>{config.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {/* Orders List */}
      <FlatList
        className="px-4"
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="py-16 w-full justify-center items-center">
            <Text className="text-gray-400">Không tìm thấy đơn hàng nào</Text>
          </View>
        }
        renderItem={({ item: order }) => {
          const config = statusConfig[order.status as OrderStatus];
          const StatusIcon = config.icon;
          return (
            <Pressable
              key={order.id}
              className="bg-white mb-3 rounded-xl p-4 shadow-sm border border-[#F1F1F1]"
              onPress={() => router.push(`/table/${order.table_id}`)}
            >
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-lg font-bold">Bàn {getTableNumber(order.table_id)}</Text>
                    <View style={{ backgroundColor: config.bg, flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 3 }}>
                      <StatusIcon size={13} color="#fff" style={{ marginRight: 2 }} />
                      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>{config.label}</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-400 mb-1">{formatDate(order.created_at)}</Text>
                  {order.notes ? (
                    <Text className="text-xs text-[#FF9800] italic">Ghi chú: {order.notes}</Text>
                  ) : null}
                </View>
                <View className="items-end justify-end min-w-[95px]">
                  <Text className="text-lg font-bold text-[#388E3C]">{formatCurrency(order.total)}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
