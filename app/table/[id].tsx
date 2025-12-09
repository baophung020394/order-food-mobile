import { MenuSelectionDialog } from "@/components/MenuSelectDialog";
import { useOrderContext } from "@/context/OrderContext";
import { useTableContext } from "@/context/TableContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, Plus, Send } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const statusConfig = {
  available: { label: "Trống", className: "bg-green-500" },
  occupied: { label: "Có khách", className: "bg-orange-500" },
  reserved: { label: "Đã đặt", className: "bg-blue-500" },
  dirty: { label: "Dọn dẹp", className: "bg-red-500" },
};
type TableStatus = keyof typeof statusConfig;
const itemStatusConfig = {
  waiting: { label: "Chờ", className: "bg-yellow-400" },
  preparing: { label: "Đang làm", className: "bg-orange-500" },
  ready: { label: "Sẵn sàng", className: "bg-blue-500" },
  served: { label: "Đã phục vụ", className: "bg-green-500" },
  sent: { label: "Đã gửi", className: "bg-emerald-600" }
};
type ItemStatus = keyof typeof itemStatusConfig;

export default function TableDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { orders, updateOrder, createOrder } = useOrderContext();
  const { tables, updateTable } = useTableContext();
  const [table, setTable] = useState<any>(null);
  const [showMenuDialog, setShowMenuDialog] = useState(false);

  useEffect(() => {
    const foundTable = tables.find((t) => t.id === id);
    setTable(foundTable);
  }, [id, tables]);

  const order = useMemo(() => orders.find((o) => o.table_id === id), [orders, id]);

  const handleCreateOrder = () => {
    setShowMenuDialog(true);
  };
  const handleAddItems = () => {
    setShowMenuDialog(true);
  };
  const handleMenuSelection = (items: any[]) => {
    const orderItems = items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      order_id: order?.id || `order-${Date.now()}`,
      menu_item_id: item.menu_item.id,
      menu_snapshot: {
        id: item.menu_item.id,
        name: item.menu_item.name,
        price: item.menu_item.price,
        category: item.menu_item.category,
      },
      quantity: item.quantity,
      unit_price: item.menu_item.price,
      note: item.note,
      status: "waiting",
    }));
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    if (order) {
      updateOrder(order.id, {
        items: [...order.items, ...orderItems],
        subtotal: order.subtotal + subtotal,
        tax: order.tax + tax,
        total: order.total + total,
      });
      if (table && order.id) updateTable(table.id, { status: "occupied", current_order_id: order.id });
    } else {
      const newOrder = {
        id: `order-${Date.now()}`,
        table_id: id,
        created_by: "user-2",
        status: "draft" as const,
        subtotal,
        tax,
        discount: 0,
        total,
        notes: "",
        metadata: { source: "staff" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: orderItems,
      };
      createOrder(newOrder);
      if (table && newOrder.id) updateTable(table.id, { status: "occupied", current_order_id: newOrder.id });
    }
    Toast.show({ type: "success", text1: "Đã thêm món", text2: `Đã thêm ${items.length} món vào đơn hàng` });
    setShowMenuDialog(false);
  };
  const handleSendToKitchen = () => {
    if (order) {
      updateOrder(order.id, { status: "sent" });
      if (table && order.id) updateTable(table.id, { status: "occupied", current_order_id: order.id });
      Toast.show({ type: "success", text1: "Đã gửi đến bếp", text2: "Đơn hàng đã được gửi đến nhà bếp" });
      setTimeout(() => {
        router.back();
      }, 1500);
    }
  };
  const handleMarkServed = (itemId: string) => {
    if (order) {
      const updatedItems = order.items.map((item: any) =>
        item.id === itemId ? { ...item, status: "served" } : item
      );
      const allServed = updatedItems.every((item: any) => item.status === "served");
      const updateData: any = { items: updatedItems };
      if (allServed) updateData.status = "served";
      updateOrder(order.id, updateData);
      Toast.show({
        type: "success",
        text1: "Đã phục vụ",
        text2: "Món ăn đã được đánh dấu là đã phục vụ"
      });
    }
  };
  const handlePayment = () => {
    if (order) {
      updateOrder(order.id, { status: "completed" });
      updateTable(table.id, { status: "available", current_order_id: null });
      Toast.show({ type: "success", text1: "Đã thanh toán", text2: "Đơn hàng đã được hoàn thành" });
      setTimeout(() => {
        router.back();
      }, 1200);
    }
  };

  if (!table) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}>
        <Text className="text-lg" style={{ color: '#1e293b' }}>Không tìm thấy bàn</Text>
      </SafeAreaView>
    );
  }
  if (order && order.status === "completed") {
    setTimeout(() => router.back(), 300);
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}>
        <Text className="text-lg" style={{ color: 'rgba(34, 197, 94, 0.9)' }}>Đơn hàng đã hoàn thành</Text>
      </SafeAreaView>
    );
  }
  const tableStatus = (table.status as TableStatus) || "available";
  return (
    <SafeAreaView className="flex-1 pb-10" style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}>
      {/* Header */}
      <View 
        className="flex-row items-center gap-3 pb-3 pt-5 px-4 z-10"
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
          onPress={() => router.back()} 
          className="p-2 mr-2 rounded-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <ArrowLeft size={22} color="#1e293b" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold" style={{ color: '#1e293b' }}>Bàn {table.table_number}</Text>
          <Text className="text-sm" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>{table.seats} chỗ ngồi - {table.location}</Text>
        </View>
        <View 
          className={`rounded-lg px-4 py-1.5 min-w-[70px] items-center ${statusConfig[tableStatus].className}`}
          style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }}
        >
          <Text className="text-white text-[13px] font-semibold capitalize">{statusConfig[tableStatus].label}</Text>
        </View>
      </View>
      {/* Main Content */}
      <ScrollView className="flex-1 px-4 pt-5 pb-24">
        {!order ? (
          <View 
            className="rounded-xl p-8 items-center mt-10"
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
            <Text className="mb-4" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>Chưa có đơn hàng</Text>
            <TouchableOpacity 
              className="flex-row items-center px-5 py-3 rounded-xl" 
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }}
              onPress={handleCreateOrder}
            >
              <Plus size={18} color="#fff" className="mr-2" />
              <Text className="text-white font-semibold text-base ml-2">Tạo đơn hàng mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Order Info */}
            <View 
              className="rounded-2xl p-4 mb-6"
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
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-bold text-base" style={{ color: '#1e293b' }}>Đơn hàng #{String(order.id).slice(-6)}</Text>
                <View 
                  className="rounded-full px-3 py-0.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 1,
                    borderColor: 'rgba(59, 130, 246, 0.6)',
                  }}
                >
                  <Text className="text-sm font-semibold" style={{ color: 'rgba(59, 130, 246, 0.9)' }}>{order.status}</Text>
                </View>
              </View>
              {!!order.notes && (
                <View 
                  className="rounded-lg p-2 mb-3"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Text className="text-sm" style={{ color: '#1e293b' }}><Text className="font-semibold">Ghi chú:</Text> {order.notes}</Text>
                </View>
              )}
              {order.items?.map((item: any) => {
                const itemStatus = (item.status as ItemStatus) || 'waiting';
                return (
                  <View 
                    key={item.id} 
                    className="rounded-xl p-4 mb-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    <View className="flex-row justify-between items-start gap-2 mb-2">
                      <View className="flex-1">
                        <Text className="font-semibold text-base" style={{ color: '#1e293b' }}>{item.menu_snapshot.name}</Text>
                        <Text className="text-xs mt-1" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>SL: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</Text>
                        {!!item.note && <Text className="text-xs mt-1" style={{ color: 'rgba(251, 146, 60, 0.9)' }}>Ghi chú: {item.note}</Text>}
                      </View>
                      <View 
                        className={`rounded-lg px-2 py-1 items-center min-w-[60px] ${itemStatusConfig[itemStatus].className}`}
                        style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }}
                      >
                        <Text className="text-white text-xs">{itemStatusConfig[itemStatus].label}</Text>
                      </View>
                    </View>
                    {item.status === "ready" && (
                      <TouchableOpacity 
                        className="flex-row w-full mt-2 py-2 rounded-xl items-center justify-center" 
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.5)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        }}
                        onPress={() => handleMarkServed(item.id)}
                      >
                        <Check size={16} color="#fff" className="mr-2" />
                        <Text className="text-white font-medium ml-2">Đánh dấu đã phục vụ</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              {/* Order Summary */}
              <View className="mt-5 pt-4" style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.3)' }}>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-base" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>Tạm tính:</Text>
                  <Text className="text-base" style={{ color: '#1e293b' }}>${Number(order.subtotal).toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-base" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>Thuế:</Text>
                  <Text className="text-base" style={{ color: '#1e293b' }}>${Number(order.tax).toFixed(2)}</Text>
                </View>
                {!!order.discount && order.discount > 0 && (
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-base" style={{ color: 'rgba(34, 197, 94, 0.9)' }}>Giảm giá:</Text>
                    <Text className="text-base" style={{ color: 'rgba(34, 197, 94, 0.9)' }}>-${Number(order.discount).toFixed(2)}</Text>
                  </View>
                )}
                <View className="flex-row justify-between mt-1">
                  <Text className="text-lg font-bold" style={{ color: '#1e293b' }}>Tổng cộng:</Text>
                  <Text className="text-lg font-bold" style={{ color: 'rgba(34, 197, 94, 0.9)' }}>${Number(order.total).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {/* Actions fixed bottom */}
      <View 
        className="absolute left-0 right-0 bottom-0 p-4 flex-row gap-3"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.3)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10
        }}
      >
        {!order ? null : (
          <>
            <TouchableOpacity 
              className="flex-1 flex-row items-center justify-center rounded-lg py-3" 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }}
              onPress={handleAddItems}
            >
              <Plus size={18} color="#1e293b" className="mr-2" />
              <Text className="ml-2 font-semibold text-base" style={{ color: '#1e293b' }}>Thêm món</Text>
            </TouchableOpacity>
            {order.status === "draft" && (
              <TouchableOpacity 
                className="flex-1 flex-row items-center justify-center rounded-lg py-3" 
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
                onPress={handleSendToKitchen}
              >
                <Send size={18} color="#fff" className="mr-2" />
                <Text className="ml-2 font-semibold text-base text-white">Gửi bếp</Text>
              </TouchableOpacity>
            )}
            {order.status === "served" && (
              <TouchableOpacity 
                className="flex-1 flex-row items-center justify-center rounded-lg py-3" 
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.5)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
                onPress={handlePayment}
              >
                <Check size={18} color="#fff" className="mr-2" />
                <Text className="ml-2 font-semibold text-base text-white">Thanh toán</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
      <MenuSelectionDialog
        open={showMenuDialog}
        onClose={() => setShowMenuDialog(false)}
        onConfirm={handleMenuSelection}
      />
    </SafeAreaView>
  );
}
