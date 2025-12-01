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
      <View className="flex-1">
        {/* Header */}
        <View 
          className="px-6 py-5 rounded-b-3xl"
          style={{
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
        >
          <View className="flex-row items-center gap-4">
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
            <View>
              <Text className="text-2xl font-bold" style={{ color: '#64748B' }}>
                Màn hình bếp
              </Text>
              <Text className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                {filteredItems.length} món đang chờ
              </Text>
            </View>
          </View>
        </View>
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
              backgroundColor: filterStatus === "all" ? '#B8D4E3' : '#EEEEEE',
              ...(filterStatus === "all" ? neumorphicInset : neumorphicOutset),
            }}
            onPress={() => setFilterStatus("all")}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: filterStatus === "all" ? '#64748B' : '#94A3B8' }}
            >
              Đang làm
            </Text>
          </TouchableOpacity>
          {Object.entries(statusConfig)
            .filter(([status]) => status !== "served" && status !== "cancelled")
            .map(([status, config]) => {
              const pastelColors: Record<string, string> = {
                waiting: '#F4D1AE',
                preparing: '#F4D1AE',
                ready: '#C4E4D4',
              };
              const isActive = filterStatus === status;
              return (
                <TouchableOpacity
                  key={status}
                  className="px-5 py-2.5 rounded-3xl"
                  style={{
                    backgroundColor: isActive ? pastelColors[status] || '#EEEEEE' : '#EEEEEE',
                    ...(isActive ? neumorphicInset : neumorphicOutset),
                  }}
                  onPress={() => setFilterStatus(status as ItemStatus)}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: isActive ? '#64748B' : '#94A3B8' }}
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
              const pastelColors: Record<string, string> = {
                waiting: '#F4D1AE',
                preparing: '#F4D1AE',
                ready: '#C4E4D4',
              };
              return (
                <View
                  key={item.id}
                  className="w-full rounded-3xl p-5 my-3 mr-3 flex-1 min-w-[160px] max-w-[480px]"
                  style={{
                    backgroundColor: '#EEEEEE',
                    ...neumorphicOutset,
                  }}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="font-bold text-xl" style={{ color: '#64748B' }}>
                        Bàn {getTableNumber(item.table_id)}
                      </Text>
                      <Text className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                        {formatTime(item.received_at)}
                      </Text>
                    </View>
                    <View
                      className="flex-row items-center px-3 py-1.5 rounded-2xl ml-2"
                      style={{ 
                        gap: 4,
                        backgroundColor: pastelColors[item.status] || '#D4C5E8',
                        ...neumorphicInset,
                      }}
                    >
                      <StatusIcon
                        color="#64748B"
                        size={12}
                        style={{ marginRight: 4 }}
                      />
                      <Text className="text-xs font-bold" style={{ color: '#64748B' }}>
                        {config.label}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3 border-t pt-3" style={{ borderTopColor: '#D1D1D1' }}>
                    <View className="flex-row justify-between items-center">
                      <Text className="font-bold text-lg flex-1" style={{ color: '#64748B' }}>
                        {item.menu_item_name}
                      </Text>
                      <Text className="font-bold text-xl ml-2" style={{ color: '#64748B' }}>
                        x{item.quantity}
                      </Text>
                    </View>
                    {item.note ? (
                      <View 
                        className="px-3 py-2 mt-2 rounded-2xl"
                        style={{
                          backgroundColor: '#EEEEEE',
                          ...neumorphicInset,
                        }}
                      >
                        <Text className="text-xs italic" style={{ color: '#94A3B8' }}>
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
                          backgroundColor: '#EEEEEE',
                          ...neumorphicOutset,
                        }}
                        onPress={() => handleStatusChange(item.id, "preparing")}
                      >
                        <Text className="font-bold text-sm" style={{ color: '#64748B' }}>
                          Bắt đầu làm
                        </Text>
                      </TouchableOpacity>
                    )}
                    {item.status === "preparing" && (
                      <TouchableOpacity
                        className="flex-1 rounded-2xl items-center justify-center py-3"
                        style={{
                          backgroundColor: '#C4E4D4',
                          ...neumorphicInset,
                        }}
                        onPress={() => handleStatusChange(item.id, "ready")}
                      >
                        <Text className="font-bold text-sm" style={{ color: '#64748B' }}>
                          Hoàn thành
                        </Text>
                      </TouchableOpacity>
                    )}
                    {item.status === "ready" && (
                      <View 
                        className="flex-1 rounded-2xl items-center justify-center py-3"
                        style={{
                          backgroundColor: '#EEEEEE',
                          ...neumorphicInset,
                        }}
                      >
                        <Text className="font-bold text-sm" style={{ color: '#94A3B8' }}>
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
            <View className="items-center justify-center mt-20 mb-6">
              <View 
                className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
                style={{
                  backgroundColor: '#EEEEEE',
                  ...neumorphicInset,
                }}
              >
                <ChefHat size={40} color="#94A3B8" />
              </View>
              <Text className="text-base mt-2 text-center" style={{ color: '#94A3B8' }}>
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
