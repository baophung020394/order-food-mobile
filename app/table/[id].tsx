import ordersData from "@/services/fake-data/orders.json";
import tablesData from "@/services/fake-data/tables.json";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, Plus, Send } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const statusConfig = {
  available: { label: "Trống", bg: "#4CAF50" },
  occupied: { label: "Có khách", bg: "#FF9800" },
  reserved: { label: "Đã đặt", bg: "#2196F3" },
  dirty: { label: "Dọn dẹp", bg: "#F44336" },
};
type TableStatus = keyof typeof statusConfig;

const itemStatusConfig = {
  waiting: { label: "Chờ", bg: "#FFD600" },
  preparing: { label: "Đang làm", bg: "#FF9800" },
  ready: { label: "Sẵn sàng", bg: "#2196F3" },
  served: { label: "Đã phục vụ", bg: "#4CAF50" },
  sent: { label: "Đã gửi", bg: "#388E3C" }
};
type ItemStatus = keyof typeof itemStatusConfig;

export default function TableDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [table, setTable] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const foundTable = tablesData.find((t) => t.id === id);
    setTable(foundTable);
    if (foundTable?.current_order_id) {
      const foundOrder = ordersData.find((o) => o.id === foundTable.current_order_id);
      setOrder(foundOrder);
    }
  }, [id]);

  const handleSendToKitchen = () => {
    Toast.show({ type: "success", text1: "Đã gửi đến bếp", text2: "Đơn hàng đã được gửi đến nhà bếp" });
  };
  const handleMarkServed = (itemId: string) => {
    Toast.show({ type: "success", text1: "Đã phục vụ", text2: "Món ăn đã được đánh dấu là đã phục vụ" });
  };

  if (!table) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F8F8F8]">
        <Text className="text-center text-lg">Không tìm thấy bàn</Text>
      </SafeAreaView>
    );
  }

  const tableStatus = (table.status as TableStatus) || "available";

  return (
    <SafeAreaView className="flex-1 bg-[#F8F8F8]">
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b bg-white shadow pb-3 pt-5 px-4">
        <Pressable onPress={() => router.back()} className="p-2 mr-2 rounded-full bg-gray-100">
          <ArrowLeft size={22} color="#333" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold">Bàn {table.table_number}</Text>
          <Text className="text-sm text-gray-400">{table.seats} chỗ ngồi - {table.location}</Text>
        </View>
        <View style={{ backgroundColor: statusConfig[tableStatus].bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, alignItems: 'center', minWidth: 70 }}>
          <Text className="text-white text-[13px] font-semibold capitalize">{statusConfig[tableStatus].label}</Text>
        </View>
      </View>
      <ScrollView className="flex-1 px-4 pt-5 pb-20">
        {!order ? (
          <View className="bg-white rounded-xl p-8 shadow-sm items-center mt-10">
            <Text className="text-gray-400 mb-4">Chưa có đơn hàng</Text>
            <TouchableOpacity className="flex-row items-center bg-[#388E3C] px-5 py-3 rounded-xl" onPress={() => Toast.show({ type: 'info', text1: 'Tính năng chưa khả dụng', text2: 'Bấm này để tạo đơn mới!' })}>
              <Plus size={18} color="#fff" className="mr-2" />
              <Text className="text-white font-semibold text-base ml-2">Tạo đơn hàng mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Order Info */}
            <View className="bg-white rounded-2xl shadow p-4 mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-bold text-base">Đơn hàng #{order.id.slice(-6)}</Text>
                <View className="rounded-full border border-[#2196F3] px-3 py-0.5 bg-white">
                  <Text className="text-[#2196F3] text-sm font-semibold">{order.status}</Text>
                </View>
              </View>
              {order.notes ? (
                <View className="bg-blue-50 rounded-lg p-2 mb-3">
                  <Text className="text-sm"><Text className="font-semibold">Ghi chú:</Text> {order.notes}</Text>
                </View>
              ) : null}
              {/* Order Items */}
              {order.items?.map((item: any) => {
                const itemStatus = (item.status as ItemStatus) || 'waiting';
                return (
                  <View key={item.id} className="border rounded-xl p-4 mb-3 bg-gray-50">
                    <View className="flex-row justify-between items-start gap-2 mb-2">
                      <View className="flex-1">
                        <Text className="font-semibold text-base">{item.menu_snapshot.name}</Text>
                        <Text className="text-xs text-gray-500 mt-1">SL: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</Text>
                        {!!item.note && <Text className="text-xs text-orange-500 mt-1">Ghi chú: {item.note}</Text>}
                      </View>
                      <View style={{ backgroundColor: itemStatusConfig[itemStatus].bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, alignItems: 'center', minWidth: 60 }}>
                        <Text className="text-white text-xs">{itemStatusConfig[itemStatus].label}</Text>
                      </View>
                    </View>
                    {item.status === "ready" && (
                      <TouchableOpacity className="flex-row w-full bg-[#4CAF50] mt-2 py-2 rounded-xl items-center justify-center" onPress={() => handleMarkServed(item.id)}>
                        <Check size={16} color="#fff" className="mr-2" />
                        <Text className="text-white font-medium ml-2">Đánh dấu đã phục vụ</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              {/* Order Summary */}
              <View className="border-t border-gray-200 mt-5 pt-4">
                <View className="flex-row justify-between mb-1 text-sm">
                  <Text className="text-base text-gray-600">Tạm tính:</Text>
                  <Text className="text-base">${Number(order.subtotal).toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-1 text-sm">
                  <Text className="text-base text-gray-600">Thuế:</Text>
                  <Text className="text-base">${Number(order.tax).toFixed(2)}</Text>
                </View>
                {!!order.discount && order.discount > 0 && (
                  <View className="flex-row justify-between mb-1 text-green-600">
                    <Text className="text-base">Giảm giá:</Text>
                    <Text className="text-base">-${Number(order.discount).toFixed(2)}</Text>
                  </View>
                )}
                <View className="flex-row justify-between mt-1 text-lg">
                  <Text className="text-lg font-bold">Tổng cộng:</Text>
                  <Text className="text-lg font-bold text-[#4CAF50]">${Number(order.total).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {/* actions fixed bottom */}
      {order && (
        <View className="absolute left-0 right-0 bottom-0 p-4 bg-white border-t border-gray-200 flex-row gap-3" style={{shadowColor:'#aaa', shadowOpacity:0.12, elevation:6, paddingBottom: Platform.OS === 'ios' ? 20 : 10}}>
          <TouchableOpacity className="flex-1 bg-gray-200 flex-row items-center justify-center rounded-lg py-3" onPress={() => Toast.show({ type: 'info', text1: 'Chưa hỗ trợ thêm món!' })}>
            <Plus size={18} color="#222" className="mr-2" />
            <Text className="ml-2 font-semibold text-base">Thêm món</Text>
          </TouchableOpacity>
          {(order.status === "draft" || order.status === "in_kitchen" || order.status === "sent") && (
            <TouchableOpacity className="flex-1 bg-[#2196F3] flex-row items-center justify-center rounded-lg py-3" onPress={handleSendToKitchen}>
              <Send size={18} color="#fff" className="mr-2" />
              <Text className="ml-2 font-semibold text-base text-white">Gửi bếp</Text>
            </TouchableOpacity>
          )}
          {order.status === "served" && (
            <TouchableOpacity className="flex-1 bg-[#4CAF50] flex-row items-center justify-center rounded-lg py-3">
              <Check size={18} color="#fff" className="mr-2" />
              <Text className="ml-2 font-semibold text-base text-white">Thanh toán</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
