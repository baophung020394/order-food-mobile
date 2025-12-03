import { MenuSelectionDialog } from "@/components/MenuSelectDialog";
import { useOrderContext } from "@/context/OrderContext";
import { useTableContext } from "@/context/TableContext";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, Plus, Send } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
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
      <View className="flex-1" style={{ backgroundColor: '#3B82F6' }}>
        <SafeAreaView className="flex-1 justify-center items-center">
          <Text className="text-lg" style={{ color: '#FFFFFF' }}>Không tìm thấy bàn</Text>
        </SafeAreaView>
      </View>
    );
  }
  if (order && order.status === "completed") {
    setTimeout(() => router.back(), 300);
    return (
      <View className="flex-1" style={{ backgroundColor: '#3B82F6' }}>
        <SafeAreaView className="flex-1 justify-center items-center">
          <Text className="text-lg" style={{ color: '#FFFFFF' }}>Đơn hàng đã hoàn thành</Text>
        </SafeAreaView>
      </View>
    );
  }
  const tableStatus = (table.status as TableStatus) || "available";
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
      
      <SafeAreaView className="flex-1 pb-10">
        {/* Header */}
        <BlurView
          intensity={20}
          tint="light"
          className="flex-row items-center gap-4 pb-4 pt-5 px-6 rounded-b-3xl z-10 overflow-hidden"
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
          <Pressable 
            onPress={() => router.back()} 
            className="p-2 rounded-2xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Bàn {table.table_number}</Text>
            <Text className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{table.seats} chỗ ngồi - {table.location}</Text>
          </View>
          <View 
            className="rounded-2xl px-4 py-2 min-w-[70px] items-center"
            style={{
              backgroundColor: statusConfig[tableStatus].className === 'bg-green-500' ? 'rgba(16, 185, 129, 0.3)' :
                               statusConfig[tableStatus].className === 'bg-orange-500' ? 'rgba(245, 158, 11, 0.3)' :
                               statusConfig[tableStatus].className === 'bg-blue-500' ? 'rgba(59, 130, 246, 0.3)' :
                               'rgba(239, 68, 68, 0.3)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <Text className="text-xs font-semibold capitalize" style={{ color: '#FFFFFF' }}>{statusConfig[tableStatus].label}</Text>
          </View>
        </BlurView>
        {/* Main Content */}
        <ScrollView className="flex-1 px-4 pt-6 pb-24">
          {!order ? (
            <BlurView
              intensity={20}
              tint="light"
              className="rounded-3xl p-10 items-center mt-10 overflow-hidden"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* Light reflection */}
              <View
                className="absolute top-0 left-0 right-0 h-1/3"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                }}
              />
              <Text className="mb-6 text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Chưa có đơn hàng</Text>
              <TouchableOpacity 
                className="flex-row items-center px-6 py-3.5 rounded-3xl" 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                }}
                onPress={handleCreateOrder}
              >
                <Plus size={18} color="#FFFFFF" className="mr-2" />
                <Text className="font-semibold text-base ml-2" style={{ color: '#FFFFFF' }}>Tạo đơn hàng mới</Text>
              </TouchableOpacity>
            </BlurView>
          ) : (
            <View>
              {/* Order Info */}
              <BlurView
                intensity={20}
                tint="light"
                className="rounded-3xl p-5 mb-6 overflow-hidden"
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
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="font-bold text-lg" style={{ color: '#FFFFFF' }}>Đơn hàng #{String(order.id).slice(-6)}</Text>
                  <View 
                    className="rounded-2xl px-4 py-1.5"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.3)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>{order.status}</Text>
                  </View>
                </View>
                {!!order.notes && (
                  <View 
                    className="rounded-2xl p-3 mb-4"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Text className="text-sm" style={{ color: '#FFFFFF' }}>
                      <Text className="font-semibold">Ghi chú:</Text> {order.notes}
                    </Text>
                  </View>
                )}
                {order.items?.map((item: any) => {
                  const itemStatus = (item.status as ItemStatus) || 'waiting';
                  return (
                    <BlurView
                      key={item.id}
                      intensity={10}
                      tint="light"
                      className="rounded-3xl p-4 mb-3 overflow-hidden"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <View className="flex-row justify-between items-start gap-3 mb-3">
                        <View className="flex-1">
                          <Text className="font-bold text-base" style={{ color: '#FFFFFF' }}>{item.menu_snapshot.name}</Text>
                          <Text className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>SL: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</Text>
                          {!!item.note && <Text className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Ghi chú: {item.note}</Text>}
                        </View>
                        <View 
                          className="rounded-2xl px-3 py-1.5 items-center min-w-[60px]"
                          style={{
                            backgroundColor: itemStatusConfig[itemStatus].className === 'bg-yellow-400' ? 'rgba(234, 179, 8, 0.3)' :
                                           itemStatusConfig[itemStatus].className === 'bg-orange-500' ? 'rgba(245, 158, 11, 0.3)' :
                                           itemStatusConfig[itemStatus].className === 'bg-blue-500' ? 'rgba(59, 130, 246, 0.3)' :
                                           itemStatusConfig[itemStatus].className === 'bg-green-500' ? 'rgba(16, 185, 129, 0.3)' :
                                           'rgba(16, 185, 129, 0.3)',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          <Text className="text-xs" style={{ color: '#FFFFFF' }}>{itemStatusConfig[itemStatus].label}</Text>
                        </View>
                      </View>
                      {item.status === "ready" && (
                        <TouchableOpacity 
                          className="flex-row w-full mt-3 py-3 rounded-2xl items-center justify-center" 
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.3)',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          }}
                          onPress={() => handleMarkServed(item.id)}
                        >
                          <Check size={16} color="#FFFFFF" className="mr-2" />
                          <Text className="font-semibold ml-2" style={{ color: '#FFFFFF' }}>Đánh dấu đã phục vụ</Text>
                        </TouchableOpacity>
                      )}
                    </BlurView>
                  );
                })}
                {/* Order Summary */}
                <View className="mt-6 pt-5" style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Tạm tính:</Text>
                    <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>${Number(order.subtotal).toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Thuế:</Text>
                    <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>${Number(order.tax).toFixed(2)}</Text>
                  </View>
                  {!!order.discount && order.discount > 0 && (
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-base" style={{ color: 'rgba(16, 185, 129, 0.9)' }}>Giảm giá:</Text>
                      <Text className="text-base font-semibold" style={{ color: 'rgba(16, 185, 129, 0.9)' }}>-${Number(order.discount).toFixed(2)}</Text>
                    </View>
                  )}
                  <View className="flex-row justify-between items-center pt-4 mt-3" style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.3)' }}>
                    <Text className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Tổng cộng:</Text>
                    <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>${Number(order.total).toFixed(2)}</Text>
                  </View>
                </View>
              </BlurView>
            </View>
          )}
          </ScrollView>
          {/* Bottom Action Bar */}
          {order && (
            <BlurView
              intensity={20}
              tint="light"
              className="absolute bottom-0 left-0 right-0 px-6 py-4 flex-row gap-3 rounded-t-3xl overflow-hidden"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Light reflection */}
              <View
                className="absolute top-0 left-0 right-0 h-1/2"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                }}
              />
            <TouchableOpacity
              className="flex-1 rounded-3xl py-3.5 items-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={handleAddItems}
            >
              <Text className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Thêm món</Text>
            </TouchableOpacity>
            {order.status === "draft" && (
              <TouchableOpacity
                className="flex-1 rounded-3xl py-3.5 items-center flex-row justify-center"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                onPress={handleSendToKitchen}
              >
                <Send size={18} color="#FFFFFF" className="mr-2" />
                <Text className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Gửi bếp</Text>
              </TouchableOpacity>
            )}
            {order.status === "served" && (
              <TouchableOpacity
                className="flex-1 rounded-3xl py-3.5 items-center"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                onPress={handlePayment}
              >
                <Text className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Thanh toán</Text>
              </TouchableOpacity>
            )}
          </BlurView>
          )}
          <MenuSelectionDialog
            open={showMenuDialog}
            onClose={() => setShowMenuDialog(false)}
            onConfirm={handleMenuSelection}
          />
        </SafeAreaView>
      </View>
    );
  }
