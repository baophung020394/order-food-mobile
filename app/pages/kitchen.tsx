import ordersData from "@/services/fake-data/orders.json";
import tablesData from "@/services/fake-data/tables.json";
import { BlurView } from "expo-blur";
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
        <View className="flex-1">
          {/* Header */}
          <BlurView
            intensity={20}
            tint="light"
            className="px-6 py-5 rounded-b-3xl overflow-hidden"
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
            <View className="flex-row items-center gap-4">
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
              <View>
                <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                  Màn hình bếp
                </Text>
                <Text className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {filteredItems.length} món đang chờ
                </Text>
              </View>
            </View>
          </BlurView>
          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 3 }}
            className="py-0 my-4 px-4"
          >
            <TouchableOpacity
              className="px-5 py-2.5 rounded-3xl"
              style={{
                backgroundColor: filterStatus === "all" ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={() => setFilterStatus("all")}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: '#FFFFFF' }}
              >
                Đang làm
              </Text>
            </TouchableOpacity>
            {Object.entries(statusConfig)
              .filter(([status]) => status !== "served" && status !== "cancelled")
              .map(([status, config]) => {
                const isActive = filterStatus === status;
                return (
                  <TouchableOpacity
                    key={status}
                    className="px-5 py-2.5 rounded-3xl"
                    style={{
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                    onPress={() => setFilterStatus(status as ItemStatus)}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: '#FFFFFF' }}
                    >
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
          {/* Kitchen Items Grid */}
          <ScrollView className="px-4 pb-9">
            <View className="flex-row flex-wrap">
              {filteredItems.map((item) => {
                const config = statusConfig[item.status];
                const StatusIcon = config.icon;
                return (
                  <BlurView
                    key={item.id}
                    intensity={15}
                    tint="light"
                    className="w-full rounded-3xl p-5 my-3 mr-3 flex-1 min-w-[160px] max-w-[480px] overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {/* Light reflection */}
                    <View
                      className="absolute top-0 left-0 right-0 h-1/4"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                      }}
                    />
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="font-bold text-xl" style={{ color: '#FFFFFF' }}>
                          Bàn {getTableNumber(item.table_id)}
                        </Text>
                        <Text className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {formatTime(item.received_at)}
                        </Text>
                      </View>
                      <View
                        className="flex-row items-center px-3 py-1.5 rounded-2xl ml-2"
                        style={{ 
                          gap: 4,
                          backgroundColor: config.color === 'bg-yellow-400' ? 'rgba(234, 179, 8, 0.3)' :
                                         config.color === 'bg-orange-400' ? 'rgba(251, 146, 60, 0.3)' :
                                         config.color === 'bg-green-500' ? 'rgba(16, 185, 129, 0.3)' :
                                         config.color === 'bg-gray-400' ? 'rgba(156, 163, 175, 0.3)' :
                                         'rgba(239, 68, 68, 0.3)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        <StatusIcon
                          color="#FFFFFF"
                          size={12}
                          style={{ marginRight: 4 }}
                        />
                        <Text className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
                          {config.label}
                        </Text>
                      </View>
                    </View>
                    <View className="mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <View className="flex-row justify-between items-center">
                        <Text className="font-bold text-lg flex-1" style={{ color: '#FFFFFF' }}>
                          {item.menu_item_name}
                        </Text>
                        <Text className="font-bold text-xl ml-2" style={{ color: '#FFFFFF' }}>
                          x{item.quantity}
                        </Text>
                      </View>
                      {item.note ? (
                        <View 
                          className="px-3 py-2 mt-2 rounded-2xl"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          <Text className="text-xs italic" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            Ghi chú: {item.note}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View className="flex-row mt-4">
                      {item.status === "waiting" && (
                        <TouchableOpacity
                          className="flex-1 rounded-2xl items-center justify-center py-3"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          }}
                          onPress={() => handleStatusChange(item.id, "preparing")}
                        >
                          <Text className="font-bold text-sm" style={{ color: '#FFFFFF' }}>
                            Bắt đầu làm
                          </Text>
                        </TouchableOpacity>
                      )}
                      {item.status === "preparing" && (
                        <TouchableOpacity
                          className="flex-1 rounded-2xl items-center justify-center py-3"
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.3)',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          }}
                          onPress={() => handleStatusChange(item.id, "ready")}
                        >
                          <Text className="font-bold text-sm" style={{ color: '#FFFFFF' }}>
                            Hoàn thành
                          </Text>
                        </TouchableOpacity>
                      )}
                      {item.status === "ready" && (
                        <View 
                          className="flex-1 rounded-2xl items-center justify-center py-3"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          <Text className="font-bold text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Chờ phục vụ
                          </Text>
                        </View>
                      )}
                    </View>
                  </BlurView>
                );
              })}
            </View>
            {filteredItems.length === 0 && (
              <View className="items-center justify-center mt-20 mb-6">
                <View 
                  className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <ChefHat size={40} color="#FFFFFF" />
                </View>
                <Text className="text-base mt-2 text-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Không có món nào cần làm
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Kitchen;
