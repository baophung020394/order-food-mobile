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
    <SafeAreaView className="flex-1" style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}>
      <View className="flex-1">
        {/* Header */}
        <View 
          className="px-5 py-2"
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
          <View className="flex-row items-center gap-3">
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
            <View>
              <Text className="text-xl font-bold" style={{ color: '#1e293b' }}>
                Màn hình bếp
              </Text>
              <Text className="text-base mt-1" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>
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
            className="rounded-full px-4 py-1.5 mr-2 border"
            style={filterStatus === "all" ? {
              backgroundColor: 'rgba(34, 197, 94, 0.4)',
              borderColor: 'rgba(255, 255, 255, 0.6)',
              borderWidth: 1,
            } : {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              borderWidth: 1,
            }}
            onPress={() => setFilterStatus("all")}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: filterStatus === "all" ? "#fff" : "#1e293b" }}
            >
              Đang làm
            </Text>
          </TouchableOpacity>
          {Object.entries(statusConfig)
            .filter(([status]) => status !== "served" && status !== "cancelled")
            .map(([status, config]) => (
              <TouchableOpacity
                key={status}
                className="rounded-full px-4 py-1.5 mr-2 border"
                style={filterStatus === status ? {
                  backgroundColor: 'rgba(34, 197, 94, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  borderWidth: 1,
                } : {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  borderWidth: 1,
                }}
                onPress={() => setFilterStatus(status as ItemStatus)}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: filterStatus === status ? "#fff" : "#1e293b" }}
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
                  className="w-full rounded-2xl p-4 my-2 mr-3 flex-1 min-w-[160px] max-w-[480px]"
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
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-bold text-lg" style={{ color: '#1e293b' }}>
                        Bàn {getTableNumber(item.table_id)}
                      </Text>
                      <Text className="text-[13px] mt-1" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>
                        {formatTime(item.received_at)}
                      </Text>
                    </View>
                    <View
                      className={`flex-row items-center px-3 py-1 rounded-full ml-2 ${config.color}`}
                      style={{ gap: 4, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }}
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
                      <Text className="font-semibold text-base" style={{ color: '#1e293b' }}>
                        {item.menu_item_name}
                      </Text>
                      <Text className="font-bold text-lg" style={{ color: '#1e293b' }}>
                        x{item.quantity}
                      </Text>
                    </View>
                    {item.note ? (
                      <View 
                        className="px-2 py-1 mt-1 rounded"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                        }}
                      >
                        <Text className="text-xs italic" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>
                          Ghi chú: {item.note}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View className="flex-row mt-3">
                    {item.status === "waiting" && (
                      <TouchableOpacity
                        className="flex-1 rounded-lg items-center justify-center py-2 mr-2"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.4)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        }}
                        onPress={() => handleStatusChange(item.id, "preparing")}
                      >
                        <Text className="font-bold text-base" style={{ color: 'rgba(34, 197, 94, 0.9)' }}>
                          Bắt đầu làm
                        </Text>
                      </TouchableOpacity>
                    )}
                    {item.status === "preparing" && (
                      <TouchableOpacity
                        className="flex-1 rounded-lg items-center justify-center py-2 mr-2"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.5)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        }}
                        onPress={() => handleStatusChange(item.id, "ready")}
                      >
                        <Text className="font-bold text-base text-white">
                          Hoàn thành
                        </Text>
                      </TouchableOpacity>
                    )}
                    {item.status === "ready" && (
                      <View 
                        className="flex-1 rounded-lg items-center justify-center py-2 mr-2"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                        }}
                      >
                        <Text className="font-bold text-base" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>
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
              <ChefHat size={65} color="rgba(30, 41, 59, 0.4)" style={{ opacity: 0.5 }} />
              <Text className="text-xl mt-3 text-center" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>
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
