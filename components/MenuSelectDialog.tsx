import menuItemsData from "@/services/fake-data/menu-items.json";
import { Minus, Plus, ShoppingCart, X } from "lucide-react-native";
import { useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { BlurView } from "expo-blur";

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
}

const categoryColors: Record<string, string> = {
  starter: "bg-green-500",
  main: "bg-orange-500",
  dessert: "bg-pink-500",
  drink: "bg-blue-500",
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

export function MenuSelectionDialog({
  open,
  onClose,
  onConfirm,
}: MenuSelectionDialogProps) {
  const [selectedItems, setSelectedItems] = useState<Map<string, OrderItem>>(
    new Map()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const menuItems = menuItemsData as MenuItem[];
  const categories = [
    "all",
    ...Array.from(new Set(menuItems.map((item) => item.category))),
  ];
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
    if (existing && existing.quantity > 1) {
      newItems.set(itemId, { ...existing, quantity: existing.quantity - 1 });
    } else {
      newItems.delete(itemId);
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
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        {/* Gradient Background Layers */}
        <View 
          className="absolute inset-0"
          style={{
            backgroundColor: '#3B82F6',
            opacity: 0.3,
          }}
        />
        <View 
          className="absolute inset-0"
          style={{
            backgroundColor: '#9333EA',
            opacity: 0.2,
          }}
        />
        
        <BlurView
          intensity={25}
          tint="light"
          className="rounded-3xl w-[95%] max-h-[92%] flex-1 flex-col overflow-hidden"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Light source highlight */}
          <View
            className="absolute top-0 left-0 right-0 h-1/4 z-0"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          />
          <View 
            className="flex-row flex-1 items-center px-6 py-4 z-10 min-h-16 max-h-16 rounded-t-3xl"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Text className="text-2xl font-bold flex-1" style={{ color: '#FFFFFF' }}>
              Chọn món
            </Text>
            <TouchableOpacity
              onPress={handleCancel}
              className="p-2 rounded-2xl"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="my-4 ml-4 min-h-10 max-h-10"
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  className="px-5 py-2.5 rounded-3xl mr-2"
                  style={{
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: '#FFFFFF' }}
                  >
                    {cat === "all" ? "Tất cả" : getCategoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Menu grid */}
          <ScrollView className="flex-1">
            <View className="flex flex-col gap-3 mx-4 my-3">
              {filteredItems.map((item) => {
                const selectedItem = selectedItems.get(item.id);
                return (
                  <BlurView
                    key={item.id}
                    intensity={15}
                    tint="light"
                    className="rounded-3xl mb-2 min-w-[10px] overflow-hidden"
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
                    <View className="p-4">
                      <View className="flex-row items-center justify-between gap-3 mb-3">
                        <View className="flex-1 min-w-0">
                          <Text
                            className="font-bold text-lg mb-1"
                            style={{ color: '#FFFFFF' }}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text
                            className="text-sm mb-2 leading-relaxed"
                            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                          <View className="flex-row items-center mt-2">
                            <View
                              className="px-3 py-1 rounded-2xl mr-2 items-center"
                              style={{
                                backgroundColor: categoryColors[item.category] === 'bg-green-500' ? 'rgba(16, 185, 129, 0.3)' :
                                               categoryColors[item.category] === 'bg-orange-500' ? 'rgba(245, 158, 11, 0.3)' :
                                               categoryColors[item.category] === 'bg-blue-500' ? 'rgba(59, 130, 246, 0.3)' :
                                               categoryColors[item.category] === 'bg-pink-500' ? 'rgba(236, 72, 153, 0.3)' :
                                               'rgba(255, 255, 255, 0.2)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              }}
                            >
                              <Text className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
                                {getCategoryLabel(item.category)}
                              </Text>
                            </View>
                            <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {item.prep_time_minutes} phút
                            </Text>
                          </View>
                        </View>
                        <Text className="font-bold text-lg ml-2" style={{ color: '#FFFFFF' }}>
                          {item.price.toLocaleString("vi-VN")}₫
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2 mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)' }}>
                        {selectedItem ? (
                          <>
                            <TouchableOpacity
                              className="rounded-2xl p-2 min-w-[36px] items-center justify-center"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              }}
                              onPress={() => handleRemoveItem(item.id)}
                            >
                              <Minus size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                            <Text className="font-bold text-lg min-w-[30px] text-center" style={{ color: '#FFFFFF' }}>
                              {selectedItem.quantity}
                            </Text>
                            <TouchableOpacity
                              className="rounded-2xl p-2 min-w-[36px] items-center justify-center"
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              }}
                              onPress={() => handleAddItem(item)}
                            >
                              <Plus size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <TouchableOpacity
                            className="rounded-3xl flex-row items-center justify-center py-2.5 mt-1 flex-1"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.15)',
                              borderWidth: 1,
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            }}
                            onPress={() => handleAddItem(item)}
                          >
                            <Plus
                              size={17}
                              color="#FFFFFF"
                              style={{ marginRight: 4 }}
                            />
                            <Text className="font-bold ml-2 text-sm" style={{ color: '#FFFFFF' }}>
                              Thêm
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </BlurView>
                );
              })}
            </View>

            {/* Selected Items */}
            {selectedItems.size > 0 && (
              <BlurView
                intensity={15}
                tint="light"
                className="mt-4 px-4 rounded-3xl mb-4 py-4 overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Text className="font-bold text-lg mb-3" style={{ color: '#FFFFFF' }}>
                  Món đã chọn ({selectedItems.size})
                </Text>
                {Array.from(selectedItems.values()).map((item) => (
                  <BlurView
                    key={item.menu_item.id}
                    intensity={10}
                    tint="light"
                    className="rounded-3xl my-2 p-3 overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-semibold text-base flex-1" style={{ color: '#FFFFFF' }}>
                        {item.menu_item.name}
                      </Text>
                      <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {item.quantity} ×{" "}
                        {item.menu_item.price.toLocaleString("vi-VN")}₫ ={" "}
                        {(item.quantity * item.menu_item.price).toLocaleString(
                          "vi-VN"
                        )}
                        ₫
                      </Text>
                    </View>
                    <BlurView
                      intensity={5}
                      tint="light"
                      className="rounded-2xl px-3 py-2 mt-2 min-h-[36px] overflow-hidden"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <TextInput
                        value={item.note}
                        placeholder="Ghi chú đặc biệt..."
                        onChangeText={(txt) =>
                          handleNoteChange(item.menu_item.id, txt)
                        }
                        className="text-sm"
                        style={{
                          color: '#FFFFFF',
                        }}
                        multiline
                        numberOfLines={2}
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      />
                    </BlurView>
                  </BlurView>
                ))}
              </BlurView>
            )}
          </ScrollView>

          {/* Footer */}
          <BlurView
            intensity={20}
            tint="light"
            className="px-6 pt-4 pb-6 rounded-b-3xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-bold text-base" style={{ color: '#FFFFFF' }}>
                Tổng tạm tính:
              </Text>
              <Text className="font-bold text-xl" style={{ color: '#FFFFFF' }}>
                {totalAmount.toLocaleString("vi-VN")}₫
              </Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-3xl py-3.5 items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                onPress={handleCancel}
              >
                <Text className="font-bold text-sm" style={{ color: '#FFFFFF' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-3xl py-3.5 flex-row items-center justify-center"
                style={{
                  backgroundColor: selectedItems.size === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                onPress={handleConfirm}
                disabled={selectedItems.size === 0}
              >
                <ShoppingCart
                  size={17}
                  color="#FFFFFF"
                  style={{ marginRight: 4 }}
                />
                <Text className="font-bold text-sm ml-1" style={{ color: '#FFFFFF' }}>
                  Xác nhận ({selectedItems.size})
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </BlurView>
      </View>
    </Modal>
  );
}
