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
        className="px-6 py-5 flex-row items-center gap-4 rounded-b-3xl"
        style={{ 
          backgroundColor: '#EEEEEE',
          ...neumorphicOutset,
        }}
      >
        <Pressable
          className="rounded-2xl p-2"
          style={{ 
            backgroundColor: '#EEEEEE',
            ...neumorphicInset,
          }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#64748B" />
        </Pressable>
        <Text className="text-2xl font-bold" style={{ color: '#64748B' }}>Đơn hàng</Text>
      </View>
      {/* Search & Filter */}
      <View className="px-4 py-5">
        <View className="relative mb-4">
          <Search
            size={18}
            color="#94A3B8"
            style={{ position: "absolute", left: 16, top: 14, zIndex: 1 }}
          />
          <TextInput
            className="h-12 pl-12 pr-4 rounded-3xl text-base"
            style={{ 
              backgroundColor: '#EEEEEE',
              color: '#64748B',
              ...neumorphicInset,
            }}
            placeholder="Tìm theo số bàn..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 mt-2 pb-1">
          <Pressable
            onPress={() => setFilterStatus("all")}
            className={`px-5 py-2.5 rounded-3xl`}
            style={{
              backgroundColor: filterStatus === "all" ? '#B8D4E3' : '#EEEEEE',
              ...(filterStatus === "all" ? neumorphicInset : neumorphicOutset),
            }}
          >
            <Text className="font-semibold text-sm" style={{ color: filterStatus === "all" ? '#64748B' : '#94A3B8' }}>Tất cả</Text>
          </Pressable>
          {Object.entries(statusConfig).map(([status, config]) => {
            const pastelColors: Record<string, string> = {
              draft: '#D4C5E8',
              sent: '#B8D4E3',
              in_kitchen: '#F4D1AE',
              served: '#C4E4D4',
              completed: '#C4E4D4',
              cancelled: '#F2C2D1',
            };
            const isActive = filterStatus === status;
            return (
              <Pressable
                key={status}
                onPress={() => setFilterStatus(status as OrderStatus)}
                className="px-5 py-2.5 rounded-3xl"
                style={{
                  backgroundColor: isActive ? pastelColors[status] || '#EEEEEE' : '#EEEEEE',
                  ...(isActive ? neumorphicInset : neumorphicOutset),
                }}
              >
                <Text className="font-semibold text-sm" style={{ color: isActive ? '#64748B' : '#94A3B8' }}>{config.label}</Text>
              </Pressable>
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
            <Text className="text-base" style={{ color: '#94A3B8' }}>Không tìm thấy đơn hàng</Text>
          </View>
        }
        renderItem={({ item: order }) => {
          const config = statusConfig[order.status as OrderStatus];
          const StatusIcon = config.icon;
          const pastelColors: Record<string, string> = {
            draft: '#D4C5E8',
            sent: '#B8D4E3',
            in_kitchen: '#F4D1AE',
            served: '#C4E4D4',
            completed: '#C4E4D4',
            cancelled: '#F2C2D1',
          };
          return (
            <Pressable
              key={order.id}
              className="mb-4 rounded-3xl p-5"
              style={{
                backgroundColor: '#EEEEEE',
                ...neumorphicOutset,
              }}
              onPress={() => router.push(`/table/${order.table_id}`)}
            >
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <View className="flex-row items-center gap-3 mb-2">
                    <Text className="text-xl font-bold" style={{ color: '#64748B' }}>Bàn {getTableNumber(order.table_id)}</Text>
                    <View 
                      style={{ 
                        backgroundColor: pastelColors[order.status] || '#EEEEEE',
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: 16,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        ...neumorphicInset,
                      }}
                    >
                      <StatusIcon size={12} color="#64748B" style={{ marginRight: 4 }} />
                      <Text style={{ color: "#64748B", fontSize: 11, fontWeight: "bold" }}>{config.label}</Text>
                    </View>
                  </View>
                  <Text className="text-sm mb-2" style={{ color: '#94A3B8' }}>{formatDate(order.created_at)}</Text>
                  {order.notes ? (
                    <Text className="text-xs italic" style={{ color: '#94A3B8' }}>Ghi chú: {order.notes}</Text>
                  ) : null}
                </View>
                <View className="items-end justify-end min-w-[95px]">
                  <Text className="text-xl font-bold" style={{ color: '#64748B' }}>{formatCurrency(order.total)}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
