import { MenuSelectionDialog } from "@/components/MenuSelectDialog";
import { DishDetailDialog } from "@/components/DishDetailDialog";
import { Order, useOrderContext } from "@/context/OrderContext";
import { useTableContext } from "@/context/TableContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, Plus, Send, Users } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
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
  available: { label: "Trống", color: "#4CAF50" },
  occupied: { label: "Có khách", color: "#FF9800" },
  reserved: { label: "Đã đặt", color: "#2196F3" },
  dirty: { label: "Dọn dẹp", color: "#F44336" },
};
type TableStatus = keyof typeof statusConfig;

const orderStatusConfig = {
  draft: { label: "Nháp", color: "#FFB347" },
  sent: { label: "Đã gửi", color: "#2196F3" },
  in_kitchen: { label: "Đang nấu", color: "#FF9800" },
  served: { label: "Đã phục vụ", color: "#4CAF50" },
  completed: { label: "Hoàn thành", color: "#388E3C" },
};
type OrderStatus = keyof typeof orderStatusConfig;

const itemStatusConfig = {
  waiting: { label: "Chờ", color: "#FFB347" },
  preparing: { label: "Đang làm", color: "#FF9800" },
  ready: { label: "Sẵn sàng", color: "#2196F3" },
  served: { label: "Đã phục vụ", color: "#4CAF50" },
  sent: { label: "Đã gửi", color: "#4ECDC4" }
};
type ItemStatus = keyof typeof itemStatusConfig;

// Table color mapping based on location
const locationColors: Record<string, string> = {
  "main hall": "#FF6B9D",
  "patio": "#4ECDC4",
  "terrace": "#FFB347",
  "vip": "#9B59B6",
};

const defaultTableImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800";

export default function TableDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { updateOrderViaApi, refreshOrders, getOrderByTableId } = useOrderContext();
  const { tables, updateTable } = useTableContext();
  const [table, setTable] = useState<any>(null);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showDishDetail, setShowDishDetail] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [selectedOrderItem, setSelectedOrderItem] = useState<any>(null);

  useEffect(() => {
    const foundTable = tables.find((t) => t.id === id);
    setTable(foundTable);
  }, [id, tables]);

  // Fetch order for this specific table using the new API endpoint
  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        const fetchedOrder = await getOrderByTableId(id);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
          // Also update the orders list to keep it in sync
          refreshOrders({
            tableId: id,
            limit: 10,
          });
        } else {
          setOrder(null);
        }
      };
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const tableColor = table ? (locationColors[table.location] || "#667eea") : "#667eea";
  const tableStatus = (table?.status as TableStatus) || "available";

  const handleCreateOrder = () => {
    setShowMenuDialog(true);
  };
  const handleAddItems = () => {
    setShowMenuDialog(true);
  };
  const handleMenuSelection = async (items: any[]) => {
    if (!order) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Không tìm thấy đơn hàng" });
      return;
    }

    try {
      setUpdating(true);
      
      // Transform items to API format - combine existing items with new items
      const existingItems = (order.items || []).map((item: any) => ({
        dishId: item.menu_item_id || item.menu_snapshot?.id || item.id,
        dishName: item.menu_item_name || item.menu_snapshot?.name || 'Unknown',
        quantity: item.quantity,
        price: item.price || item.unit_price || 0,
      }));

      const newItems = items.map((item) => ({
        dishId: item.menu_item.id,
        dishName: item.menu_item.name,
        quantity: item.quantity,
        price: item.menu_item.price,
      }));

      // Combine existing and new items, then merge items with same dishId
      const allItems = [...existingItems, ...newItems];
      
      // Group by dishId and sum quantities
      const itemsMap = new Map<string, { dishId: string; dishName: string; quantity: number; price: number }>();
      
      allItems.forEach((item) => {
        const existing = itemsMap.get(item.dishId);
        if (existing) {
          // If dish already exists, add quantity
          existing.quantity += item.quantity;
        } else {
          // If dish doesn't exist, add it
          itemsMap.set(item.dishId, {
            dishId: item.dishId,
            dishName: item.dishName,
            quantity: item.quantity,
            price: item.price,
          });
        }
      });
      
      // Convert map back to array and filter out items with quantity <= 0
      const apiItems = Array.from(itemsMap.values()).filter((item) => item.quantity > 0);

      // Update order via API
      const updatedOrder = await updateOrderViaApi(order.id, {
        items: apiItems,
      });

      // Update local state
      setOrder(updatedOrder);
      
      // Refresh orders list
      await refreshOrders({
        tableId: id,
        limit: 10,
      });

      if (table && order.id) {
        updateTable(table.id, { status: "occupied", current_order_id: order.id });
      }

      Toast.show({ 
        type: "success", 
        text1: "Đã thêm món", 
        text2: `Đã thêm ${items.length} món vào đơn hàng` 
      });
      setShowMenuDialog(false);
    } catch (error: any) {
      console.error('Failed to update order:', error);
      Toast.show({ 
        type: "error", 
        text1: "Lỗi", 
        text2: error.message || "Không thể cập nhật đơn hàng" 
      });
    } finally {
      setUpdating(false);
    }
  };
  const handleSendToKitchen = async () => {
    if (!order) return;

    try {
      setUpdating(true);
      
      // Map status to API format
      const statusMap: Record<string, string> = {
        'draft': 'pending',
        'sent': 'confirmed',
        'in_kitchen': 'in_kitchen',
        'served': 'served',
        'completed': 'completed',
      };

      const updatedOrder = await updateOrderViaApi(order.id, {
        status: statusMap['sent'] || 'confirmed',
      });

      setOrder(updatedOrder);
      
      if (table && order.id) {
        updateTable(table.id, { status: "occupied", current_order_id: order.id });
      }

      Toast.show({ type: "success", text1: "Đã gửi đến bếp", text2: "Đơn hàng đã được gửi đến nhà bếp" });
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Failed to send order to kitchen:', error);
      Toast.show({ 
        type: "error", 
        text1: "Lỗi", 
        text2: error.message || "Không thể gửi đơn hàng đến bếp" 
      });
    } finally {
      setUpdating(false);
    }
  };
  const handleMarkServed = async (itemId: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      
      // Transform current items to API format
      const currentItems = order.items || [];
      const apiItems = currentItems.map((item: any) => ({
        dishId: item.menu_item_id || item.menu_snapshot?.id || item.id,
        dishName: item.menu_item_name || item.menu_snapshot?.name || 'Unknown',
        quantity: item.quantity,
        price: item.price || item.unit_price || 0,
      }));

      // Check if all items are served
      const updatedItems = currentItems.map((item: any) =>
        item.id === itemId ? { ...item, status: "served" } : item
      );
      const allServed = updatedItems.every((item: any) => item.status === "served");

      const statusMap: Record<string, string> = {
        'served': 'served',
      };

      const updatedOrder = await updateOrderViaApi(order.id, {
        status: allServed ? statusMap['served'] : undefined,
        items: apiItems,
      });

      setOrder(updatedOrder);
      
      Toast.show({
        type: "success",
        text1: "Đã phục vụ",
        text2: "Món ăn đã được đánh dấu là đã phục vụ"
      });
    } catch (error: any) {
      console.error('Failed to mark item as served:', error);
      Toast.show({ 
        type: "error", 
        text1: "Lỗi", 
        text2: error.message || "Không thể cập nhật trạng thái món ăn" 
      });
    } finally {
      setUpdating(false);
    }
  };
  const handleUpdateItemQuantity = async (dishId: string, newQuantity: number, dishName: string, price: number) => {
    if (!order) return;

    try {
      setUpdating(true);
      
      // Transform current items to API format
      const currentItems = (order.items || []).map((item: any) => ({
        dishId: item.menu_item_id || item.menu_snapshot?.id || item.dishId || item.id,
        dishName: item.menu_item_name || item.menu_snapshot?.name || 'Unknown',
        quantity: item.quantity,
        price: item.price || item.unit_price || 0,
      }));

      // Update the specific item's quantity
      const updatedItems = currentItems.map((item) =>
        item.dishId === dishId
          ? { ...item, quantity: newQuantity, dishName, price }
          : item
      );

      // Filter out items with quantity <= 0
      const apiItems = updatedItems.filter((item) => item.quantity > 0);

      const updatedOrder = await updateOrderViaApi(order.id, {
        items: apiItems,
      });

      setOrder(updatedOrder);
      
      Toast.show({ 
        type: "success", 
        text1: "Đã cập nhật", 
        text2: `Đã cập nhật số lượng ${dishName}` 
      });
    } catch (error: any) {
      console.error('Failed to update item quantity:', error);
      Toast.show({ 
        type: "error", 
        text1: "Lỗi", 
        text2: error.message || "Không thể cập nhật số lượng" 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (dishId: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      
      // Transform current items to API format and filter out the removed item
      const apiItems = (order.items || [])
        .filter((item: any) => {
          const itemDishId = item.menu_item_id || item.menu_snapshot?.id || item.dishId || item.id;
          return itemDishId !== dishId;
        })
        .map((item: any) => ({
          dishId: item.menu_item_id || item.menu_snapshot?.id || item.dishId || item.id,
          dishName: item.menu_item_name || item.menu_snapshot?.name || 'Unknown',
          quantity: item.quantity,
          price: item.price || item.unit_price || 0,
        }));

      const updatedOrder = await updateOrderViaApi(order.id, {
        items: apiItems,
      });

      setOrder(updatedOrder);
      
      Toast.show({ 
        type: "success", 
        text1: "Đã xóa món", 
        text2: "Đã xóa món khỏi đơn hàng" 
      });
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      Toast.show({ 
        type: "error", 
        text1: "Lỗi", 
        text2: error.message || "Không thể xóa món" 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePayment = async () => {
    if (!order || !table) return;

    try {
      setUpdating(true);
      
      const statusMap: Record<string, string> = {
        'completed': 'completed',
      };

      const updatedOrder = await updateOrderViaApi(order.id, {
        status: statusMap['completed'] || 'completed',
      });

      setOrder(updatedOrder);
      updateTable(table.id, { status: "available", current_order_id: null });
      
      Toast.show({ type: "success", text1: "Đã thanh toán", text2: "Đơn hàng đã được hoàn thành" });
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error: any) {
      console.error('Failed to complete order:', error);
      Toast.show({ 
        type: "error", 
        text1: "Lỗi", 
        text2: error.message || "Không thể hoàn thành đơn hàng" 
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!table) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-zinc-50">
        <Text className="text-lg">Không tìm thấy bàn</Text>
      </SafeAreaView>
    );
  }

  if (order && order.status === "completed") {
    setTimeout(() => router.back(), 300);
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg" style={{ color: tableColor }}>Đơn hàng đã hoàn thành</Text>
      </SafeAreaView>
    );
  }
  const orderStatus = (order?.status as OrderStatus) || "draft";
  return (
    <SafeAreaView className="flex-1 pb-10">
      {/* Aurora Background */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          backgroundColor: tableColor,
          opacity: 0.2,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: 300,
          backgroundColor: "#764ba2",
          opacity: 0.15,
        }}
      />

      {/* Header with Image */}
      <View className="relative" style={{ height: 250 }}>
        <Image
          source={{ uri: defaultTableImage }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        />
        <View className="absolute top-12 left-4 right-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="p-2 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <ArrowLeft size={22} color="#fff" />
          </Pressable>
          <View
            className="px-4 py-1.5 rounded-full"
            style={{ backgroundColor: statusConfig[tableStatus].color }}
          >
            <Text className="text-white text-sm font-semibold">{statusConfig[tableStatus].label}</Text>
          </View>
        </View>
        <View className="absolute bottom-6 left-4 right-4">
          <Text className="text-white text-3xl font-bold mb-2">Bàn {table.table_number}</Text>
          <View className="flex-row items-center">
            <Users size={16} color="#fff" />
            <Text className="text-white/90 text-base ml-2">{table.seats} chỗ ngồi - {table.location}</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 pt-6 pb-24">
        {!order ? (
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center mt-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Users size={48} color={tableColor} />
            <Text className="text-gray-600 mb-4 mt-4 text-lg">Chưa có đơn hàng</Text>
            <TouchableOpacity
              className="flex-row items-center px-6 py-4 rounded-2xl"
              style={{ backgroundColor: tableColor }}
              onPress={handleCreateOrder}
            >
              <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white font-semibold text-base">Tạo đơn hàng mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Order Info */}
            <View className="bg-white rounded-3xl p-5 mb-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="font-bold text-xl">Đơn hàng #{String(order.id).slice(-6)}</Text>
                <View className="px-4 py-1.5 rounded-full" style={{ backgroundColor: `${orderStatusConfig[orderStatus].color}20` }}>
                  <Text className="text-sm font-semibold" style={{ color: orderStatusConfig[orderStatus].color }}>{orderStatusConfig[orderStatus].label}</Text>
                </View>
              </View>
              {!!order.notes && (
                <View className="rounded-2xl p-3 mb-4" style={{ backgroundColor: `${tableColor}10` }}>
                  <Text className="text-sm"><Text className="font-semibold">Ghi chú:</Text> {order.notes}</Text>
                </View>
              )}
              {order.items?.map((item: any) => {
                const itemStatus = (item.status as ItemStatus) || 'waiting';
                const dishId = item.menu_item_id || item.menu_snapshot?.id || item.dishId || item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setSelectedDishId(dishId);
                      setSelectedOrderItem(item);
                      setShowDishDetail(true);
                    }}
                    className="border rounded-2xl p-4 mb-3"
                    style={{
                      borderColor: `${tableColor}30`,
                      backgroundColor: `${tableColor}05`,
                    }}
                  >
                    <View className="flex-row justify-between items-start gap-2 mb-2">
                      <View className="flex-1">
                        <Text className="font-semibold text-lg mb-1">{item.menu_snapshot?.name || item.menu_item_name || 'Unknown'}</Text>
                        <Text className="text-xs text-gray-600 mt-1">SL: {item.quantity} × {Number(item.unit_price || item.price).toLocaleString("vi-VN")}₫</Text>
                        {!!item.note && <Text className="text-xs mt-1" style={{ color: tableColor }}>Ghi chú: {item.note}</Text>}
                      </View>
                      <View className="px-3 py-1.5 rounded-full items-center" style={{ backgroundColor: itemStatusConfig[itemStatus].color }}>
                        <Text className="text-white text-xs font-semibold">{itemStatusConfig[itemStatus].label}</Text>
                      </View>
                    </View>
                    {item.status === "ready" && (
                      <TouchableOpacity
                        className="flex-row w-full mt-3 py-3 rounded-xl items-center justify-center"
                        style={{ backgroundColor: tableColor }}
                        onPress={() => handleMarkServed(item.id)}
                      >
                        <Check size={16} color="#fff" style={{ marginRight: 8 }} />
                        <Text className="text-white font-medium">Đánh dấu đã phục vụ</Text>
                      </TouchableOpacity>
                    )}
                  </Pressable>
                );
              })}
              {/* Order Summary */}
              <View className="border-t mt-5 pt-4" style={{ borderColor: `${tableColor}20` }}>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base text-gray-600">Tạm tính:</Text>
                  <Text className="text-base font-semibold">{Number(order.subtotal).toLocaleString("vi-VN")}₫</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base text-gray-600">Thuế:</Text>
                  <Text className="text-base font-semibold">{Number(order.tax).toLocaleString("vi-VN")}₫</Text>
                </View>
                {!!order.discount && order.discount > 0 && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-base font-semibold" style={{ color: tableColor }}>Giảm giá:</Text>
                    <Text className="text-base font-semibold" style={{ color: tableColor }}>-{Number(order.discount).toLocaleString("vi-VN")}₫</Text>
                  </View>
                )}
                <View className="flex-row justify-between mt-3 pt-3 border-t" style={{ borderColor: `${tableColor}20` }}>
                  <Text className="text-xl font-bold">Tổng cộng:</Text>
                  <Text className="text-2xl font-bold" style={{ color: tableColor }}>{Number(order.total).toLocaleString("vi-VN")}₫</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Actions fixed bottom */}
      {order && (
        <View
          className="absolute left-0 right-0 bottom-0 p-4 bg-white border-t flex-row gap-3"
          style={{
            shadowColor: '#aaa',
            shadowOpacity: 0.12,
            elevation: 6,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            borderTopColor: `${tableColor}20`,
          }}
        >
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-2xl py-4"
            style={{ backgroundColor: `${tableColor}20` }}
            onPress={handleAddItems}
          >
            <Plus size={18} color={tableColor} style={{ marginRight: 8 }} />
            <Text className="font-semibold text-base" style={{ color: tableColor }}>Thêm món</Text>
          </TouchableOpacity>
          {order.status === "draft" && (
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-2xl py-4"
              style={{ backgroundColor: tableColor }}
              onPress={handleSendToKitchen}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Send size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text className="font-semibold text-base text-white">Gửi bếp</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {order.status === "served" && (
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-2xl py-4"
              style={{ backgroundColor: tableColor }}
              onPress={handlePayment}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Check size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text className="font-semibold text-base text-white">Thanh toán</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
      <MenuSelectionDialog
        open={showMenuDialog}
        onClose={() => setShowMenuDialog(false)}
        onConfirm={handleMenuSelection}
        currentOrderItems={order?.items?.map((item: any) => ({
          dishId: item.menu_item_id || item.menu_snapshot?.id || item.dishId || item.id,
          quantity: item.quantity,
          note: item.note,
        })) || []}
      />
      <DishDetailDialog
        open={showDishDetail}
        onClose={() => {
          setShowDishDetail(false);
          setSelectedDishId(null);
          setSelectedOrderItem(null);
        }}
        dishId={selectedDishId}
        orderItem={selectedOrderItem}
        orderStatus={order?.status}
        onUpdateQuantity={async (newQuantity: number) => {
          if (!selectedOrderItem || !order) return;
          const dishId = selectedOrderItem.menu_item_id || selectedOrderItem.menu_snapshot?.id || selectedOrderItem.dishId || selectedOrderItem.id;
          if (newQuantity > 0) {
            await handleUpdateItemQuantity(dishId, newQuantity, selectedOrderItem.menu_snapshot?.name || selectedOrderItem.menu_item_name, selectedOrderItem.unit_price || selectedOrderItem.price);
          } else {
            await handleRemoveItem(dishId);
          }
        }}
      />
    </SafeAreaView>
  );
}
