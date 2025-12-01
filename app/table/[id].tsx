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

  if (!table) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: '#E8E8E8' }}>
        <Text className="text-base" style={{ color: '#94A3B8' }}>Không tìm thấy bàn</Text>
      </SafeAreaView>
    );
  }
  if (order && order.status === "completed") {
    setTimeout(() => router.back(), 300);
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: '#E8E8E8' }}>
        <Text className="text-base" style={{ color: '#64748B' }}>Đơn hàng đã hoàn thành</Text>
      </SafeAreaView>
    );
  }
  const tableStatus = (table.status as TableStatus) || "available";
  const pastelColors: Record<string, string> = {
    available: '#C4E4D4',
    occupied: '#F4D1AE',
    reserved: '#B8D4E3',
    dirty: '#F2C2D1',
  };
  return (
    <SafeAreaView className="flex-1 pb-10" style={{ backgroundColor: '#E8E8E8' }}>
      {/* Header */}
      <View 
        className="flex-row items-center gap-4 rounded-b-3xl pb-4 pt-5 px-6 z-10"
        style={{
          backgroundColor: '#EEEEEE',
          ...neumorphicOutset,
        }}
      >
        <Pressable 
          onPress={() => router.back()} 
          className="p-2 rounded-2xl"
          style={{
            backgroundColor: '#EEEEEE',
            ...neumorphicInset,
          }}
        >
          <ArrowLeft size={20} color="#64748B" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-bold" style={{ color: '#64748B' }}>Bàn {table.table_number}</Text>
          <Text className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>{table.seats} chỗ - {table.location}</Text>
        </View>
        <View 
          className="px-4 py-2 rounded-2xl min-w-[80px] items-center"
          style={{
            backgroundColor: pastelColors[tableStatus] || '#D4C5E8',
            ...neumorphicInset,
          }}
        >
          <Text className="text-xs font-semibold" style={{ color: '#64748B' }}>{statusConfig[tableStatus].label}</Text>
        </View>
      </View>
      {/* Main Content */}
      <ScrollView className="flex-1 px-4 pt-6 pb-24">
        {!order ? (
          <View 
            className="rounded-3xl p-10 items-center mt-10"
            style={{
              backgroundColor: '#EEEEEE',
              ...neumorphicOutset,
            }}
          >
            <Text className="mb-6" style={{ color: '#94A3B8' }}>Chưa có đơn hàng</Text>
            <TouchableOpacity 
              className="flex-row items-center px-6 py-3.5 rounded-3xl" 
              style={{
                backgroundColor: '#EEEEEE',
                ...neumorphicOutset,
              }}
              onPress={handleCreateOrder}
            >
              <Plus size={18} color="#64748B" className="mr-2" />
              <Text className="font-semibold text-sm ml-2" style={{ color: '#64748B' }}>Tạo đơn hàng mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Order Info */}
            <View 
              className="rounded-3xl p-6 mb-6"
              style={{
                backgroundColor: '#EEEEEE',
                ...neumorphicOutset,
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="font-bold text-xl" style={{ color: '#64748B' }}>Đơn hàng #{String(order.id).slice(-6)}</Text>
                <View 
                  className="px-4 py-1.5 rounded-2xl"
                  style={{
                    backgroundColor: '#EEEEEE',
                    ...neumorphicInset,
                  }}
                >
                  <Text className="text-xs font-semibold" style={{ color: '#64748B' }}>{order.status}</Text>
                </View>
              </View>
              {!!order.notes && (
                <View 
                  className="rounded-2xl p-3 mb-4"
                  style={{
                    backgroundColor: '#EEEEEE',
                    ...neumorphicInset,
                  }}
                >
                  <Text className="text-sm" style={{ color: '#64748B' }}>
                    <Text className="font-semibold">Ghi chú:</Text> {order.notes}
                  </Text>
                </View>
              )}
              {order.items?.map((item: any) => {
                const itemStatus = (item.status as ItemStatus) || 'waiting';
                const itemPastelColors: Record<string, string> = {
                  waiting: '#F4D1AE',
                  preparing: '#F4D1AE',
                  ready: '#C4E4D4',
                  served: '#C4E4D4',
                  sent: '#B8D4E3',
                };
                return (
                  <View 
                    key={item.id} 
                    className="rounded-3xl p-4 mb-3"
                    style={{
                      backgroundColor: '#EEEEEE',
                      ...neumorphicInset,
                    }}
                  >
                    <View className="flex-row justify-between items-start gap-3 mb-3">
                      <View className="flex-1">
                        <Text className="font-bold text-lg" style={{ color: '#64748B' }}>{item.menu_snapshot.name}</Text>
                        <Text className="text-xs mt-1" style={{ color: '#94A3B8' }}>SL: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</Text>
                        {!!item.note && (
                          <Text className="text-xs mt-1" style={{ color: '#94A3B8' }}>Ghi chú: {item.note}</Text>
                        )}
                      </View>
                      <View 
                        className="px-3 py-1.5 rounded-2xl items-center min-w-[70px]"
                        style={{
                          backgroundColor: itemPastelColors[itemStatus] || '#D4C5E8',
                          ...neumorphicInset,
                        }}
                      >
                        <Text className="text-xs font-semibold" style={{ color: '#64748B' }}>{itemStatusConfig[itemStatus].label}</Text>
                      </View>
                    </View>
                    {item.status === "ready" && (
                      <TouchableOpacity 
                        className="flex-row w-full mt-3 py-3 rounded-3xl items-center justify-center" 
                        style={{
                          backgroundColor: '#C4E4D4',
                          ...neumorphicInset,
                        }}
                        onPress={() => handleMarkServed(item.id)}
                      >
                        <Check size={16} color="#64748B" className="mr-2" />
                        <Text className="font-semibold text-sm ml-2" style={{ color: '#64748B' }}>Đánh dấu đã phục vụ</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              {/* Order Summary */}
              <View className="mt-6 pt-5 border-t" style={{ borderTopColor: '#D1D1D1' }}>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base" style={{ color: '#94A3B8' }}>Tạm tính:</Text>
                  <Text className="text-base font-semibold" style={{ color: '#64748B' }}>${Number(order.subtotal).toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base" style={{ color: '#94A3B8' }}>Thuế:</Text>
                  <Text className="text-base font-semibold" style={{ color: '#64748B' }}>${Number(order.tax).toFixed(2)}</Text>
                </View>
                {!!order.discount && order.discount > 0 && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-base" style={{ color: '#64748B' }}>Giảm giá:</Text>
                    <Text className="text-base font-semibold" style={{ color: '#64748B' }}>-${Number(order.discount).toFixed(2)}</Text>
                  </View>
                )}
                <View className="flex-row justify-between mt-3 pt-3 border-t" style={{ borderTopColor: '#D1D1D1' }}>
                  <Text className="text-xl font-bold" style={{ color: '#64748B' }}>Tổng cộng:</Text>
                  <Text className="text-xl font-bold" style={{ color: '#64748B' }}>${Number(order.total).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {/* Actions fixed bottom */}
      <View 
        className="absolute left-0 right-0 bottom-0 p-6 flex-row gap-3 rounded-t-3xl" 
        style={{
          backgroundColor: '#EEEEEE',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          ...neumorphicOutset,
        }}
      >
        {!order ? null : (
          <>
            <TouchableOpacity 
              className="flex-1 flex-row items-center justify-center rounded-3xl py-3.5" 
              style={{
                backgroundColor: '#EEEEEE',
                ...neumorphicOutset,
              }}
              onPress={handleAddItems}
            >
              <Plus size={18} color="#64748B" className="mr-2" />
              <Text className="ml-2 font-semibold text-sm" style={{ color: '#64748B' }}>Thêm món</Text>
            </TouchableOpacity>
            {order.status === "draft" && (
              <TouchableOpacity 
                className="flex-1 flex-row items-center justify-center rounded-3xl py-3.5" 
                style={{
                  backgroundColor: '#B8D4E3',
                  ...neumorphicInset,
                }}
                onPress={handleSendToKitchen}
              >
                <Send size={18} color="#64748B" className="mr-2" />
                <Text className="ml-2 font-semibold text-sm" style={{ color: '#64748B' }}>Gửi bếp</Text>
              </TouchableOpacity>
            )}
            {order.status === "served" && (
              <TouchableOpacity 
                className="flex-1 flex-row items-center justify-center rounded-3xl py-3.5" 
                style={{
                  backgroundColor: '#C4E4D4',
                  ...neumorphicInset,
                }}
                onPress={handlePayment}
              >
                <Check size={18} color="#64748B" className="mr-2" />
                <Text className="ml-2 font-semibold text-sm" style={{ color: '#64748B' }}>Thanh toán</Text>
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
