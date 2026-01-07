import { foodService } from "@/services/foodService";
import { useAuth } from "@/context/AuthContext";
import { Clock, Minus, Plus, ShoppingCart, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  prep_time_minutes: number;
  image_url?: string;
}

interface OrderItem {
  menu_item: MenuItem;
  quantity: number;
  note: string;
}

interface MenuSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: OrderItem[]) => void;
  currentOrderItems?: Array<{
    dishId: string;
    quantity: number;
    note?: string;
  }>;
}

const categoryColors: Record<string, string> = {
  starter: "#4ECDC4",
  main: "#FF6B9D",
  dessert: "#9B59B6",
  drink: "#FFB347",
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    main: "Món chính",
    starter: "Khai vị",
    drink: "Đồ uống",
    dessert: "Tráng miệng",
  };
  return labels[category] || category;
};

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString("vi-VN")}₫`;
};

const defaultImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

export function MenuSelectionDialog({
  open,
  onClose,
  onConfirm,
  currentOrderItems = [],
}: MenuSelectionDialogProps) {
  const { accessToken } = useAuth();
  const [selectedItems, setSelectedItems] = useState<Map<string, OrderItem>>(
    new Map()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>(["all"]);

  // Create a map of current order items by dishId for quick lookup
  const currentOrderMap = new Map<string, number>();
  currentOrderItems.forEach((item) => {
    currentOrderMap.set(item.dishId, item.quantity);
  });

  // Fetch food categories and dishes when dialog opens
  useEffect(() => {
    if (open) {
      const fetchFoodCategories = async () => {
        try {
          setLoading(true);
          const result = await foodService.getFoodCategories(
            {
              isActive: true,
              page: 1,
              limit: 100,
            },
            accessToken || undefined
          );
          
          // Transform API dishes to MenuItem format
          const transformedItems: MenuItem[] = result.dishes.map((dish: any) => ({
            id: dish.id,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            category: dish.category,
            is_available: dish.is_available,
            prep_time_minutes: dish.prep_time_minutes,
            image_url: dish.image_url,
          }));
          
          setMenuItems(transformedItems);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(transformedItems.map((item) => item.category))
          );
          setCategories(["all", ...uniqueCategories]);
        } catch (error: any) {
          console.error('Failed to fetch food categories:', error);
          // Fallback to empty array on error
          setMenuItems([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchFoodCategories();
    } else {
      // Reset when dialog closes
      setSelectedItems(new Map());
      setSelectedCategory("all");
    }
  }, [open, accessToken]);

  const filteredItems =
    selectedCategory === "all"
      ? menuItems.filter((item) => item.is_available)
      : menuItems.filter(
          (item) => item.is_available && item.category === selectedCategory
        );

  const handleAddItem = (menuItem: MenuItem) => {
    const newItems = new Map(selectedItems);
    const existing = newItems.get(menuItem.id);
    if (existing) {
      newItems.set(menuItem.id, {
        ...existing,
        quantity: existing.quantity + 1,
      });
    } else {
      newItems.set(menuItem.id, { menu_item: menuItem, quantity: 1, note: "" });
    }
    setSelectedItems(newItems);
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = new Map(selectedItems);
    const existing = newItems.get(itemId);
    const currentQty = currentOrderMap.get(itemId) || 0;
    
    if (existing) {
      // If there's a selected item, decrease its quantity
      if (existing.quantity > 1) {
        newItems.set(itemId, { ...existing, quantity: existing.quantity - 1 });
      } else {
        // If quantity is 1, remove it (but keep currentQuantity in order)
        newItems.delete(itemId);
      }
    } else if (currentQty > 0) {
      // If no selected item but has current quantity, create negative quantity to subtract
      const menuItem = menuItems.find((item) => item.id === itemId);
      if (menuItem) {
        newItems.set(itemId, { menu_item: menuItem, quantity: -1, note: "" });
      }
    }
    setSelectedItems(newItems);
  };

  const handleNoteChange = (itemId: string, note: string) => {
    const newItems = new Map(selectedItems);
    const existing = newItems.get(itemId);
    if (existing) {
      newItems.set(itemId, { ...existing, note });
    }
    setSelectedItems(newItems);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedItems.values()));
    setSelectedItems(new Map());
    onClose();
  };

  const handleCancel = () => {
    setSelectedItems(new Map());
    onClose();
  };

  const totalAmount = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.menu_item.price * item.quantity,
    0
  );

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
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
                Chọn món
              </Text>
              <Text className="text-sm text-gray-500 mt-1">Chọn món ăn cho đơn hàng</Text>
            </View>
            <TouchableOpacity
              onPress={handleCancel}
              className="p-2 rounded-full"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <X size={22} color="#222" />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="my-3 px-4 max-h-12"
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                className={`px-5 py-2.5 rounded-full mr-2 ${
                  selectedCategory === cat ? "" : "bg-gray-100"
                }`}
                style={
                  selectedCategory === cat
                    ? { backgroundColor: "#667eea" }
                    : {}
                }
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  className={`text-base font-semibold ${
                    selectedCategory === cat ? "text-white" : "text-gray-700"
                  }`}
                >
                  {cat === "all" ? "Tất cả" : getCategoryLabel(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Menu Items grid */}
          <ScrollView className="flex-1">
            {loading ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#667eea" />
                <Text className="text-gray-500 mt-4">Đang tải món ăn...</Text>
              </View>
            ) : (
              <View className="flex flex-col gap-3 px-4 py-2">
                {filteredItems.length === 0 ? (
                  <View className="items-center justify-center py-20">
                    <Text className="text-gray-500 text-lg">Không có món ăn nào</Text>
                  </View>
                ) : (
                  filteredItems.map((item) => {
                const selectedItem = selectedItems.get(item.id);
                const currentQuantity = currentOrderMap.get(item.id) || 0;
                const totalQuantity = (selectedItem?.quantity || 0) + currentQuantity;
                return (
                  <View
                    key={item.id}
                    className="bg-white rounded-2xl mb-2 overflow-hidden"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      borderLeftWidth: 4,
                      borderLeftColor: categoryColors[item.category] || "#ccc",
                    }}
                  >
                    <View className="flex-row">
                      <Image
                        source={{ uri: item.image_url || defaultImg }}
                        style={{ width: 100, height: 100 }}
                        resizeMode="cover"
                      />
                      <View className="flex-1 p-3">
                        <View className="flex-row items-start justify-between gap-2 mb-2">
                          <View className="flex-1 min-w-0">
                            <Text
                              className="font-bold text-lg mb-1 text-gray-900"
                              numberOfLines={1}
                            >
                              {item.name}
                            </Text>
                            <Text
                              className="text-sm text-gray-600 mb-2"
                              numberOfLines={2}
                            >
                              {item.description}
                            </Text>
                            <View className="flex-row items-center">
                              <View
                                className="px-3 py-1 rounded-full mr-2"
                                style={{ backgroundColor: `${categoryColors[item.category]}20` }}
                              >
                                <Text
                                  className="text-xs font-bold"
                                  style={{ color: categoryColors[item.category] }}
                                >
                                  {getCategoryLabel(item.category)}
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <Clock size={12} color="#666" style={{ marginRight: 4 }} />
                                <Text className="text-xs text-gray-500">
                                  {item.prep_time_minutes} phút
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Text className="font-bold text-lg ml-2" style={{ color: categoryColors[item.category] }}>
                            {formatCurrency(item.price)}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2 mt-2">
                          {currentQuantity > 0 || selectedItem ? (
                            <>
                              <TouchableOpacity
                                className="rounded-lg p-2 min-w-[36px] items-center justify-center"
                                style={{ backgroundColor: "#f8f9fa" }}
                                onPress={() => handleRemoveItem(item.id)}
                              >
                                <Minus size={18} color="#333" />
                              </TouchableOpacity>
                              <Text className="font-semibold text-base text-gray-900 min-w-[30px] text-center">
                                {totalQuantity}
                              </Text>
                              <TouchableOpacity
                                className="rounded-lg p-2 min-w-[36px] items-center justify-center"
                                style={{ backgroundColor: categoryColors[item.category] }}
                                onPress={() => handleAddItem(item)}
                              >
                                <Plus size={18} color="#fff" />
                              </TouchableOpacity>
                            </>
                          ) : (
                            <TouchableOpacity
                              className="rounded-xl flex-row items-center justify-center py-2.5 flex-1"
                              style={{ backgroundColor: categoryColors[item.category] }}
                              onPress={() => handleAddItem(item)}
                            >
                              <Plus
                                size={17}
                                color="#fff"
                                style={{ marginRight: 6 }}
                              />
                              <Text className="text-white font-bold">
                                Thêm
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                  );
                })
                )}
              </View>
            )}

            {/* Selected Items */}
            {selectedItems.size > 0 && (
              <View className="mt-4 px-4 border-t py-4 mb-4"
                style={{ borderTopColor: "#e9ecef", backgroundColor: "#f8f9fa" }}
              >
                <Text className="font-bold text-lg mb-3 text-gray-900">
                  Món đã chọn ({selectedItems.size})
                </Text>
                {Array.from(selectedItems.values()).map((item) => (
                  <View
                    key={item.menu_item.id}
                    className="bg-white rounded-xl my-2 p-3"
                    style={{
                      borderWidth: 1,
                      borderColor: "#e9ecef",
                      borderLeftWidth: 4,
                      borderLeftColor: categoryColors[item.menu_item.category],
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-semibold text-base text-gray-900 flex-1">
                        {item.menu_item.name}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {item.quantity} × {formatCurrency(item.menu_item.price)} = {formatCurrency(item.quantity * item.menu_item.price)}
                      </Text>
                    </View>
                    <TextInput
                      value={item.note}
                      placeholder="Ghi chú đặc biệt..."
                      onChangeText={(txt) =>
                        handleNoteChange(item.menu_item.id, txt)
                      }
                      className="bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 mt-2 min-h-[36px]"
                      style={{ borderColor: "#e9ecef" }}
                      multiline
                      numberOfLines={2}
                      placeholderTextColor="#999"
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="border-t px-4 pt-4 pb-6"
            style={{ borderTopColor: "#e9ecef", backgroundColor: "#f8f9fa" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-bold text-lg text-gray-900">
                Tổng tạm tính:
              </Text>
              <Text className="font-bold text-2xl" style={{ color: "#667eea" }}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-2xl py-4 items-center justify-center"
                style={{ backgroundColor: "#e9ecef" }}
                onPress={handleCancel}
              >
                <Text className="font-bold text-base text-gray-700">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-2xl py-4 flex-row items-center justify-center ${
                  selectedItems.size === 0 ? "bg-gray-300" : ""
                }`}
                style={selectedItems.size > 0 ? { backgroundColor: "#667eea" } : {}}
                onPress={handleConfirm}
                disabled={selectedItems.size === 0}
              >
                <ShoppingCart
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text className="font-bold text-base text-white">
                  Xác nhận ({selectedItems.size})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
