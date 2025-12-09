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
    <SafeAreaView className="flex-1" style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}>
      {/* Header */}
      <View 
        className="px-4 py-4 flex-row items-center gap-3"
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
        <Pressable
          className="rounded-full p-1 mr-2"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)',
          }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color="#1e293b" />
        </Pressable>
        <Text className="text-xl font-bold" style={{ color: '#1e293b' }}>Danh sách đơn hàng</Text>
      </View>
      {/* Search & Filter */}
      <View className="px-4 py-3">
        <View className="relative mb-2">
          <Search
            size={18}
            color="rgba(30, 41, 59, 0.6)"
            style={{ position: "absolute", left: 14, top: 13, zIndex: 1 }}
          />
          <TextInput
            className="h-11 pl-10 pr-3 rounded-lg text-[15px]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.5)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
            placeholder="Tìm theo số bàn..."
            placeholderTextColor="rgba(30, 41, 59, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mt-2 pb-1">
          <Pressable
            onPress={() => setFilterStatus("all")}
            className="px-4 py-2 rounded-full border mr-2"
            style={filterStatus === "all" ? {
              backgroundColor: 'rgba(34, 197, 94, 0.4)',
              borderColor: 'rgba(255, 255, 255, 0.6)',
              borderWidth: 1,
            } : {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              borderWidth: 1,
            }}
          >
            <Text className="font-semibold" style={{ color: filterStatus === "all" ? "#fff" : "#1e293b" }}>Tất cả</Text>
          </Pressable>
          {Object.entries(statusConfig).map(([status, config]) => (
            <Pressable
              key={status}
              onPress={() => setFilterStatus(status as OrderStatus)}
              className="px-4 py-2 rounded-full border mr-2"
              style={filterStatus === status ? {
                backgroundColor: config.bg + 'CC',
                borderColor: 'rgba(255, 255, 255, 0.6)',
                borderWidth: 1,
              } : {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1,
              }}
            >
              <Text className="font-semibold" style={{ color: filterStatus === status ? "#fff" : "#1e293b" }}>{config.label}</Text>
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
            <Text style={{ color: 'rgba(30, 41, 59, 0.6)' }}>Không tìm thấy đơn hàng nào</Text>
          </View>
        }
        renderItem={({ item: order }) => {
          const config = statusConfig[order.status as OrderStatus];
          const StatusIcon = config.icon;
          return (
            <Pressable
              key={order.id}
              className="mb-3 rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.4)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              }}
              onPress={() => router.push(`/table/${order.table_id}`)}
            >
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-lg font-bold" style={{ color: '#1e293b' }}>Bàn {getTableNumber(order.table_id)}</Text>
                    <View style={{ backgroundColor: config.bg + 'CC', flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 3, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                      <StatusIcon size={13} color="#fff" style={{ marginRight: 2 }} />
                      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>{config.label}</Text>
                    </View>
                  </View>
                  <Text className="text-sm mb-1" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>{formatDate(order.created_at)}</Text>
                  {order.notes ? (
                    <Text className="text-xs italic" style={{ color: 'rgba(251, 146, 60, 0.9)' }}>Ghi chú: {order.notes}</Text>
                  ) : null}
                </View>
                <View className="items-end justify-end min-w-[95px]">
                  <Text className="text-lg font-bold" style={{ color: 'rgba(34, 197, 94, 0.9)' }}>{formatCurrency(order.total)}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
