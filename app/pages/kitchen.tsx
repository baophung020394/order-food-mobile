import { useOrderContext } from "@/context/OrderContext";
import { useTableContext } from "@/context/TableContext";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChefHat,
  Clock,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ItemStatus = "waiting" | "preparing" | "ready" | "served" | "cancelled";
interface KitchenItem {
  id: string;
  order_id: string;
  table_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  status: ItemStatus;
  note: string;
  received_at: string;
}

const statusConfig: Record<
  ItemStatus,
  { label: string; icon: any; color: string }
> = {
  waiting: { label: "Chờ làm", icon: Clock, color: "#FFB347" },
  preparing: { label: "Đang làm", icon: AlertCircle, color: "#FF9800" },
  ready: { label: "Sẵn sàng", icon: CheckCircle, color: "#4ECDC4" },
  served: { label: "Đã phục vụ", icon: CheckCircle, color: "#9CA3AF" },
  cancelled: { label: "Đã hủy", icon: AlertCircle, color: "#F44336" },
};

const Kitchen = () => {
  const { orders, refreshOrders, loading } = useOrderContext();
  const { tables } = useTableContext();
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<ItemStatus | "all">("all");
  const router = useRouter();

  // Fetch all orders (we'll filter "sent" and "in_kitchen" on client side)
  useEffect(() => {
    refreshOrders({
      limit: 100,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Transform orders to kitchen items
  useEffect(() => {
    const items: KitchenItem[] = [];
    orders.forEach((order) => {
      if (order.status === "sent" || order.status === "in_kitchen") {
        (order.items || []).forEach((orderItem: any) => {
          items.push({
            id: orderItem.id,
            order_id: order.id,
            table_id: order.table_id,
            menu_item_id: orderItem.menu_item_id,
            menu_item_name: orderItem.menu_item_name || orderItem.menu_item_id,
            quantity: orderItem.quantity,
            status: (orderItem.status as ItemStatus) || "waiting",
            note: orderItem.note || "",
            received_at: order.created_at,
          });
        });
      }
    });
    setKitchenItems(items);
  }, [orders]);

  const getTableNumber = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    return table?.table_number || "N/A";
  };

  const handleStatusChange = (itemId: string, newStatus: ItemStatus) => {
    setKitchenItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  const filteredItems = kitchenItems.filter((item) => {
    if (filterStatus === "all")
      return item.status !== "served" && item.status !== "cancelled";
    return item.status === filterStatus;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} giờ trước`;
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Aurora Background */}
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

      <View className="flex-1">
        {/* Header */}
        <View className="px-5 py-4 relative z-10">
          <View className="flex-row items-center gap-3 mb-2">
            <Pressable
              className="rounded-full p-2"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              onPress={() => router.back()}
            >
              <ArrowLeft size={22} color="#fff" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">
                Màn hình bếp
              </Text>
              <Text className="text-base text-white/80 mt-1">
                {loading ? "Đang tải..." : `${filteredItems.length} món đang chờ`}
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          className="mb-4 relative z-10 max-h-11"
        >
          <TouchableOpacity
            className={`rounded-full px-5 py-2.5 ${
              filterStatus === "all"
                ? "bg-white"
                : "bg-white/80"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => setFilterStatus("all")}
          >
            <Text
              className={`text-base font-semibold ${
                filterStatus === "all" ? "text-[#667eea]" : "text-gray-600"
              }`}
            >
              Đang làm
            </Text>
          </TouchableOpacity>
          {Object.entries(statusConfig)
            .filter(([status]) => status !== "served" && status !== "cancelled")
            .map(([status, config]) => (
              <TouchableOpacity
                key={status}
                className={`rounded-full px-5 py-2.5 ${
                  filterStatus === status
                    ? "bg-white"
                    : "bg-white/80"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => setFilterStatus(status as ItemStatus)}
              >
                <Text
                  className={`text-base font-semibold ${
                    filterStatus === status ? "text-[#667eea]" : "text-gray-600"
                  }`}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>

        {/* Kitchen Items List */}
        {loading && kitchenItems.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#667eea" />
            <Text className="text-gray-500 mt-4">Đang tải đơn hàng...</Text>
          </View>
        ) : (
          <ScrollView 
            className="px-4 pb-9"
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => {
                  refreshOrders({
                    limit: 100,
                  });
                }}
              />
            }
          >
            {filteredItems.length === 0 ? (
              <View className="py-16 w-full justify-center items-center">
                <ChefHat size={48} color="#ccc" />
                <Text className="text-gray-400 mt-4 text-lg">Không có món nào đang chờ</Text>
              </View>
            ) : (
              filteredItems.map((item) => {
                const config = statusConfig[item.status];
                const StatusIcon = config.icon;
                return (
                  <View
                    key={item.id}
                    className="bg-white rounded-3xl mb-4 overflow-hidden"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 5,
                      borderLeftWidth: 4,
                      borderLeftColor: config.color,
                    }}
                  >
                    <View className="p-4">
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="font-bold text-lg text-gray-900 mb-1">
                            Bàn {getTableNumber(item.table_id)}
                          </Text>
                          <Text className="text-sm text-gray-500 mb-2">
                            {formatTime(item.received_at)}
                          </Text>
                        </View>
                        <View
                          className="px-3 py-1.5 rounded-full flex-row items-center"
                          style={{ backgroundColor: `${config.color}20` }}
                        >
                          <StatusIcon size={14} color={config.color} style={{ marginRight: 4 }} />
                          <Text
                            className="text-xs font-bold"
                            style={{ color: config.color }}
                          >
                            {config.label}
                          </Text>
                        </View>
                      </View>
                      <View className="mb-3">
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="font-semibold text-base text-gray-900 flex-1">
                            {item.menu_item_name}
                          </Text>
                          <Text className="font-bold text-lg text-gray-900 ml-2">
                            x{item.quantity}
                          </Text>
                        </View>
                        {item.note ? (
                          <View className="bg-gray-50 rounded-xl p-2 mt-2">
                            <Text className="text-xs text-gray-600 italic">
                              Ghi chú: {item.note}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View className="flex-row gap-2">
                        {item.status === "waiting" && (
                          <TouchableOpacity
                            className="flex-1 rounded-xl items-center justify-center py-3"
                            style={{ backgroundColor: `${config.color}20` }}
                            onPress={() => handleStatusChange(item.id, "preparing")}
                          >
                            <Text className="font-bold text-base" style={{ color: config.color }}>
                              Bắt đầu làm
                            </Text>
                          </TouchableOpacity>
                        )}
                        {item.status === "preparing" && (
                          <TouchableOpacity
                            className="flex-1 rounded-xl items-center justify-center py-3"
                            style={{ backgroundColor: config.color }}
                            onPress={() => handleStatusChange(item.id, "ready")}
                          >
                            <Text className="font-bold text-base text-white">
                              Hoàn thành
                            </Text>
                          </TouchableOpacity>
                        )}
                        {item.status === "ready" && (
                          <View className="flex-1 rounded-xl items-center justify-center py-3"
                            style={{ backgroundColor: "#e9ecef" }}
                          >
                            <Text className="font-bold text-base text-gray-500">
                              Chờ phục vụ
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Kitchen;
