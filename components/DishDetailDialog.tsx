import { foodService } from "@/services/foodService";
import { useAuth } from "@/context/AuthContext";
import { Check, Clock, Minus, Plus, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DishDetailDialogProps {
  open: boolean;
  onClose: () => void;
  dishId: string | null;
  orderItem?: any;
  orderStatus?: string;
  onUpdateQuantity?: (quantity: number) => Promise<void>;
}

const defaultImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

const getSpiceLevelLabel = (level: number) => {
  const labels = ["Không cay", "Cay nhẹ", "Cay vừa", "Cay", "Rất cay"];
  return labels[level] || "Không xác định";
};

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${num.toLocaleString("vi-VN")}₫`;
};

export function DishDetailDialog({
  open,
  onClose,
  dishId,
  orderItem,
  orderStatus,
  onUpdateQuantity,
}: DishDetailDialogProps) {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dish, setDish] = useState<any>(null);
  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [pendingQuantity, setPendingQuantity] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (open && dishId) {
      const fetchDishDetail = async () => {
        try {
          setLoading(true);
          const dishData = await foodService.getDishDetail(dishId, accessToken || undefined);
          setDish(dishData);
          
          // Set current quantity from order item if available
          if (orderItem) {
            const qty = orderItem.quantity || 0;
            setCurrentQuantity(qty);
            setPendingQuantity(qty);
          } else {
            setCurrentQuantity(0);
            setPendingQuantity(0);
          }
        } catch (error: any) {
          console.error('Failed to fetch dish detail:', error);
          setDish(null);
        } finally {
          setLoading(false);
        }
      };
      
      fetchDishDetail();
    } else {
      setDish(null);
      setCurrentQuantity(0);
      setPendingQuantity(0);
    }
  }, [open, dishId, accessToken, orderItem]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = pendingQuantity + delta;
    if (newQuantity < 0) return;
    setPendingQuantity(newQuantity);
  };

  const handleConfirm = async () => {
    if (!onUpdateQuantity) return;
    
    if (pendingQuantity === currentQuantity) {
      // No change, just close
      onClose();
      return;
    }
    
    try {
      setUpdating(true);
      await onUpdateQuantity(pendingQuantity);
      setCurrentQuantity(pendingQuantity);
      onClose();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Revert on error
      setPendingQuantity(currentQuantity);
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    // Reset pending quantity to current quantity when closing without saving
    setPendingQuantity(currentQuantity);
    onClose();
  };

  const hasChanges = pendingQuantity !== currentQuantity;

  if (!open) return null;

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl w-full max-h-[92%] flex-1 flex-col"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <View className="flex-row items-center border-b border-gray-200 px-4 py-4 z-10"
            style={{ borderBottomColor: "#e9ecef" }}
          >
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                Chi tiết món ăn
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="p-2 rounded-full"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <X size={22} color="#222" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            {loading ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#667eea" />
                <Text className="text-gray-500 mt-4">Đang tải thông tin...</Text>
              </View>
            ) : dish ? (
              <View className="p-4">
                {/* Dish Image */}
                <Image
                  source={{ uri: dish.imageUrl || defaultImg }}
                  style={{ width: "100%", height: 200, borderRadius: 16 }}
                  resizeMode="cover"
                />

                {/* Dish Name */}
                <Text className="text-3xl font-bold text-gray-900 mt-4 mb-2">
                  {dish.name}
                </Text>

                {/* Description */}
                {dish.description && (
                  <Text className="text-base text-gray-600 mb-4">
                    {dish.description}
                  </Text>
                )}

                {/* Price */}
                <View className="bg-purple-50 rounded-2xl p-4 mb-4"
                  style={{ backgroundColor: "#667eea15" }}
                >
                  <Text className="text-sm text-gray-600 mb-1">Giá</Text>
                  <Text className="text-3xl font-bold" style={{ color: "#667eea" }}>
                    {formatCurrency(dish.price)}
                  </Text>
                </View>

                {/* Category */}
                {dish.category && (
                  <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-2">Danh mục</Text>
                    <View className="bg-blue-50 rounded-xl px-4 py-2"
                      style={{ backgroundColor: "#667eea15" }}
                    >
                      <Text className="text-base font-semibold" style={{ color: "#667eea" }}>
                        {dish.category.name}
                      </Text>
                      {dish.category.description && (
                        <Text className="text-sm text-gray-600 mt-1">
                          {dish.category.description}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Details Grid */}
                <View className="flex-row flex-wrap gap-3 mb-4">
                  {/* Preparation Time */}
                  <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl p-3"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <View className="flex-row items-center mb-1">
                      <Clock size={16} color="#666" style={{ marginRight: 6 }} />
                      <Text className="text-sm text-gray-600">Thời gian chuẩn bị</Text>
                    </View>
                    <Text className="text-lg font-bold text-gray-900">
                      {dish.preparationTime} phút
                    </Text>
                  </View>

                  {/* Spice Level */}
                  <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl p-3"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <Text className="text-sm text-gray-600 mb-1">Độ cay</Text>
                    <Text className="text-lg font-bold text-gray-900">
                      {getSpiceLevelLabel(dish.spiceLevel)}
                    </Text>
                  </View>
                </View>

                {/* Dietary Information */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">Thông tin dinh dưỡng</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {dish.isVegetarian && (
                      <View className="bg-green-100 rounded-full px-4 py-2">
                        <Text className="text-sm font-semibold text-green-800">Chay</Text>
                      </View>
                    )}
                    {dish.isVegan && (
                      <View className="bg-green-100 rounded-full px-4 py-2">
                        <Text className="text-sm font-semibold text-green-800">Thuần chay</Text>
                      </View>
                    )}
                    {dish.isGlutenFree && (
                      <View className="bg-blue-100 rounded-full px-4 py-2">
                        <Text className="text-sm font-semibold text-blue-800">Không gluten</Text>
                      </View>
                    )}
                    {dish.calories && (
                      <View className="bg-orange-100 rounded-full px-4 py-2">
                        <Text className="text-sm font-semibold text-orange-800">
                          {dish.calories} cal
                        </Text>
                      </View>
                    )}
                    {!dish.isVegetarian && !dish.isVegan && !dish.isGlutenFree && !dish.calories && (
                      <Text className="text-sm text-gray-500">Không có thông tin đặc biệt</Text>
                    )}
                  </View>
                </View>

                {/* Status */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">Trạng thái</Text>
                  <View className={`rounded-xl px-4 py-2 ${
                    dish.status === 'available' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Text className={`text-base font-semibold ${
                      dish.status === 'available' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {dish.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
                    </Text>
                  </View>
                </View>

                {/* Quantity Adjustment - Only show if order is draft and orderItem exists */}
                {orderStatus === "draft" && orderItem && (
                  <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-3">Số lượng</Text>
                    <View className="flex-row items-center gap-4 bg-gray-50 rounded-2xl p-4"
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      <TouchableOpacity
                        className="rounded-lg p-3 min-w-[48px] items-center justify-center"
                        style={{ backgroundColor: "#fff" }}
                        onPress={() => handleQuantityChange(-1)}
                        disabled={pendingQuantity <= 0}
                      >
                        <Minus size={20} color={pendingQuantity <= 0 ? "#ccc" : "#333"} />
                      </TouchableOpacity>
                      <View className="flex-1 items-center">
                        <Text className="text-3xl font-bold text-gray-900">
                          {pendingQuantity}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">
                          {pendingQuantity > 0 
                            ? `Tổng: ${formatCurrency(Number(dish.price) * pendingQuantity)}`
                            : "Chưa có trong đơn hàng"
                          }
                        </Text>
                        {hasChanges && (
                          <Text className="text-xs text-orange-600 mt-1 font-semibold">
                            (Đã thay đổi)
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        className="rounded-lg p-3 min-w-[48px] items-center justify-center"
                        style={{ backgroundColor: "#667eea" }}
                        onPress={() => handleQuantityChange(1)}
                      >
                        <Plus size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    {/* Confirm Button */}
                    {hasChanges && (
                      <TouchableOpacity
                        className="flex-row items-center justify-center rounded-2xl py-4 mt-4"
                        style={{ backgroundColor: "#667eea" }}
                        onPress={handleConfirm}
                        disabled={updating}
                      >
                        {updating ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Check size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text className="text-white font-bold text-base">
                              Xác nhận thay đổi
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* TODO: Add customization options here (e.g., extra spoon, vegetables, etc.) */}
                <View className="mt-4 p-4 bg-yellow-50 rounded-xl"
                  style={{ backgroundColor: "#fff9e6" }}
                >
                  <Text className="text-sm text-gray-600 italic">
                    💡 Tính năng tùy chọn (muỗng, rau trụng, v.v.) sẽ được thêm vào sau.
                  </Text>
                </View>
              </View>
            ) : (
              <View className="items-center justify-center py-20">
                <Text className="text-gray-500 text-lg">Không tìm thấy thông tin món ăn</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

