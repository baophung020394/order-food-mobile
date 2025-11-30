import ordersData from "@/services/fake-data/orders.json";
import tablesData from "@/services/fake-data/tables.json";
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
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Types ---
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
  waiting: { label: "Chờ làm", icon: Clock, color: "bg-yellow-400" },
  preparing: { label: "Đang làm", icon: AlertCircle, color: "bg-orange-400" },
  ready: { label: "Sẵn sàng", icon: CheckCircle, color: "bg-green-500" },
  served: { label: "Đã phục vụ", icon: CheckCircle, color: "bg-gray-400" },
  cancelled: { label: "Đã hủy", icon: AlertCircle, color: "bg-red-500" },
};

const Kitchen = () => {
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<ItemStatus | "all">("all");

  const router = useRouter();

  useEffect(() => {
    // Transform orders data to kitchen items
    const items: KitchenItem[] = [];
    (ordersData as any[]).forEach((order) => {
      if (order.status === "sent" || order.status === "in_kitchen") {
        (order.items || []).forEach((orderItem: any) => {
          items.push({
            id: orderItem.id,
            order_id: order.id,
            table_id: order.table_id,
            menu_item_id: orderItem.menu_item_id,
            menu_item_name:
              orderItem.menu_snapshot?.name || orderItem.menu_item_id,
            quantity: orderItem.quantity,
            status: orderItem.status as ItemStatus,
            note: orderItem.note || "",
            received_at: order.created_at,
          });
        });
      }
    });
    setKitchenItems(items);
  }, []);

  const getTableNumber = (tableId: string) => {
    const table = (tablesData as any[]).find((t) => t.id === tableId);
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
    <SafeAreaView className="flex-1 bg-[#F8F8F8]">
      <View className="flex-1 bg-[#F8F8F8]">
        {/* Header */}
        <View className="border-b border-[#E0E0E0] bg-white px-5 py-2 shadow-sm">
          <View className="flex-row items-center gap-3">
            <Pressable
              className="rounded-full bg-gray-100 p-1 mr-2"
              onPress={() => router.back()}
            >
              <ArrowLeft size={22} color="#222" />
            </Pressable>
            <View>
              <Text className="text-xl font-bold text-[#222]">
                Màn hình bếp
              </Text>
              <Text className="text-base text-gray-500 mt-1">
                {filteredItems.length} món đang chờ
              </Text>
            </View>
          </View>
        </View>
        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 2 }}
          className="py-0 my-3 px-3"
        >
          <TouchableOpacity
            className={`rounded-full px-4 py-1.5 mr-2 border ${
              filterStatus === "all"
                ? "bg-green-700 border-green-700"
                : "bg-white border-[#eee]"
            }`}
            onPress={() => setFilterStatus("all")}
          >
            <Text
              className={`text-base font-semibold ${
                filterStatus === "all" ? "text-white" : "text-[#222]"
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
                className={`rounded-full px-4 py-1.5 mr-2 border ${
                  filterStatus === status
                    ? "bg-green-700 border-green-700"
                    : "bg-white border-[#eee]"
                }`}
                onPress={() => setFilterStatus(status as ItemStatus)}
              >
                <Text
                  className={`text-base font-semibold ${
                    filterStatus === status ? "text-white" : "text-[#222]"
                  }`}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
        {/* Kitchen Items Grid */}
        <ScrollView className="px-3 pb-9">
          <View className="flex-row flex-wrap">
            {filteredItems.map((item) => {
              const config = statusConfig[item.status];
              const StatusIcon = config.icon;
              return (
                <View
                  key={item.id}
                  className="w-full bg-white rounded-2xl p-4 my-2 mr-3 shadow-sm flex-1 min-w-[160px] max-w-[480px]"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-bold text-lg text-[#222]">
                        Bàn {getTableNumber(item.table_id)}
                      </Text>
                      <Text className="text-[13px] text-gray-400 mt-1">
                        {formatTime(item.received_at)}
                      </Text>
                    </View>
                    <View
                      className={`flex-row items-center px-3 py-1 rounded-full ml-2 ${config.color}`}
                      style={{ gap: 4 }}
                    >
                      <StatusIcon
                        color="#fff"
                        size={14}
                        style={{ marginRight: 4 }}
                      />
                      <Text className="text-white text-xs font-bold ml-1">
                        {config.label}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="font-semibold text-base text-[#212121]">
                        {item.menu_item_name}
                      </Text>
                      <Text className="font-bold text-lg text-[#181818]">
                        x{item.quantity}
                      </Text>
                    </View>
                    {item.note ? (
                      <Text className="text-xs text-gray-500 bg-gray-100 px-2 py-1 mt-1 rounded italic">
                        Ghi chú: {item.note}
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-row mt-3">
                    {item.status === "waiting" && (
                      <TouchableOpacity
                        className="flex-1 bg-gray-100 rounded-lg items-center justify-center py-2 mr-2"
                        onPress={() => handleStatusChange(item.id, "preparing")}
                      >
                        <Text className="font-bold text-green-800 text-base">
                          Bắt đầu làm
                        </Text>
                      </TouchableOpacity>
                    )}
                    {item.status === "preparing" && (
                      <TouchableOpacity
                        className="flex-1 bg-green-500 rounded-lg items-center justify-center py-2 mr-2"
                        onPress={() => handleStatusChange(item.id, "ready")}
                      >
                        <Text className="font-bold text-white text-base">
                          Hoàn thành
                        </Text>
                      </TouchableOpacity>
                    )}
                    {item.status === "ready" && (
                      <View className="flex-1 bg-gray-100 rounded-lg items-center justify-center py-2 mr-2">
                        <Text className="font-bold text-gray-400 text-base">
                          Chờ phục vụ
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          {filteredItems.length === 0 && (
            <View className="items-center justify-center mt-16 mb-6 opacity-80">
              <ChefHat size={65} color="#9CA3AF" style={{ opacity: 0.5 }} />
              <Text className="text-gray-400 text-xl mt-3 text-center">
                Không có món nào cần làm
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Kitchen;
