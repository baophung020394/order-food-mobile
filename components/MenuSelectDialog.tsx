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
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
    >
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <View 
          className="rounded-3xl w-[95%] max-h-[92%] flex-1 flex-col"
          style={{
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
        >
          <View 
            className="flex-row flex-1 items-center px-6 py-4 z-10 min-h-16 max-h-16 rounded-t-3xl"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: '#D1D1D1',
            }}
          >
            <Text className="text-2xl font-bold flex-1" style={{ color: '#64748B' }}>
              Chọn món
            </Text>
            <TouchableOpacity
              onPress={handleCancel}
              className="p-2 rounded-2xl"
              style={{
                backgroundColor: '#EEEEEE',
                ...neumorphicInset,
              }}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="my-4 ml-4 min-h-10 max-h-10"
          >
            {categories.map((cat) => {
              const pastelColors: Record<string, string> = {
                all: '#B8D4E3',
                main: '#F4D1AE',
                starter: '#C4E4D4',
                drink: '#B8D4E3',
                dessert: '#F2C2D1',
              };
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  className="px-5 py-2.5 rounded-3xl mr-2"
                  style={{
                    backgroundColor: isActive ? pastelColors[cat] || '#EEEEEE' : '#EEEEEE',
                    ...(isActive ? neumorphicInset : neumorphicOutset),
                  }}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: '#64748B' }}
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
                const pastelColors: Record<string, string> = {
                  main: '#F4D1AE',
                  starter: '#C4E4D4',
                  drink: '#B8D4E3',
                  dessert: '#F2C2D1',
                };
                return (
                  <View
                    key={item.id}
                    className="rounded-3xl mb-2 min-w-[10px]"
                    style={{
                      backgroundColor: '#EEEEEE',
                      ...neumorphicOutset,
                    }}
                  >
                    <View className="p-4">
                      <View className="flex-row items-center justify-between gap-3 mb-3">
                        <View className="flex-1 min-w-0">
                          <Text
                            className="font-bold text-lg mb-1"
                            style={{ color: '#64748B' }}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text
                            className="text-sm mb-2 leading-relaxed"
                            style={{ color: '#94A3B8' }}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                          <View className="flex-row items-center mt-2">
                            <View
                              className="px-3 py-1 rounded-2xl mr-2 items-center"
                              style={{
                                backgroundColor: pastelColors[item.category] || '#D4C5E8',
                                ...neumorphicInset,
                              }}
                            >
                              <Text className="text-xs font-bold" style={{ color: '#64748B' }}>
                                {getCategoryLabel(item.category)}
                              </Text>
                            </View>
                            <Text className="text-xs" style={{ color: '#94A3B8' }}>
                              {item.prep_time_minutes} phút
                            </Text>
                          </View>
                        </View>
                        <Text className="font-bold text-lg ml-2" style={{ color: '#64748B' }}>
                          {item.price.toLocaleString("vi-VN")}₫
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2 mt-3 border-t pt-3" style={{ borderTopColor: '#D1D1D1' }}>
                        {selectedItem ? (
                          <>
                            <TouchableOpacity
                              className="rounded-2xl p-2 min-w-[36px] items-center justify-center"
                              style={{
                                backgroundColor: '#EEEEEE',
                                ...neumorphicOutset,
                              }}
                              onPress={() => handleRemoveItem(item.id)}
                            >
                              <Minus size={18} color="#64748B" />
                            </TouchableOpacity>
                            <Text className="font-bold text-lg min-w-[30px] text-center" style={{ color: '#64748B' }}>
                              {selectedItem.quantity}
                            </Text>
                            <TouchableOpacity
                              className="rounded-2xl p-2 min-w-[36px] items-center justify-center"
                              style={{
                                backgroundColor: '#C4E4D4',
                                ...neumorphicInset,
                              }}
                              onPress={() => handleAddItem(item)}
                            >
                              <Plus size={18} color="#64748B" />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <TouchableOpacity
                            className="rounded-3xl flex-row items-center justify-center py-2.5 mt-1 flex-1"
                            style={{
                              backgroundColor: '#EEEEEE',
                              ...neumorphicOutset,
                            }}
                            onPress={() => handleAddItem(item)}
                          >
                            <Plus
                              size={17}
                              color="#64748B"
                              style={{ marginRight: 4 }}
                            />
                            <Text className="font-bold ml-2 text-sm" style={{ color: '#64748B' }}>
                              Thêm
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Selected Items */}
            {selectedItems.size > 0 && (
              <View 
                className="mt-4 px-4 rounded-3xl mb-4 py-4"
                style={{
                  backgroundColor: '#EEEEEE',
                  borderTopWidth: 1,
                  borderTopColor: '#D1D1D1',
                  ...neumorphicInset,
                }}
              >
                <Text className="font-bold text-lg mb-3" style={{ color: '#64748B' }}>
                  Món đã chọn ({selectedItems.size})
                </Text>
                {Array.from(selectedItems.values()).map((item) => (
                  <View
                    key={item.menu_item.id}
                    className="rounded-3xl my-2 p-3"
                    style={{
                      backgroundColor: '#EEEEEE',
                      ...neumorphicOutset,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-semibold text-base flex-1" style={{ color: '#64748B' }}>
                        {item.menu_item.name}
                      </Text>
                      <Text className="text-sm" style={{ color: '#94A3B8' }}>
                        {item.quantity} ×{" "}
                        {item.menu_item.price.toLocaleString("vi-VN")}₫ ={" "}
                        {(item.quantity * item.menu_item.price).toLocaleString(
                          "vi-VN"
                        )}
                        ₫
                      </Text>
                    </View>
                    <TextInput
                      value={item.note}
                      placeholder="Ghi chú đặc biệt..."
                      onChangeText={(txt) =>
                        handleNoteChange(item.menu_item.id, txt)
                      }
                      className="rounded-2xl px-3 py-2 text-sm mt-2 min-h-[36px]"
                      style={{
                        backgroundColor: '#EEEEEE',
                        color: '#64748B',
                        ...neumorphicInset,
                      }}
                      multiline
                      numberOfLines={2}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View 
            className="px-6 pt-4 pb-6 rounded-b-3xl"
            style={{
              backgroundColor: '#EEEEEE',
              borderTopWidth: 1,
              borderTopColor: '#D1D1D1',
              ...neumorphicOutset,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-bold text-base" style={{ color: '#64748B' }}>
                Tổng tạm tính:
              </Text>
              <Text className="font-bold text-xl" style={{ color: '#64748B' }}>
                {totalAmount.toLocaleString("vi-VN")}₫
              </Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-3xl py-3.5 items-center justify-center"
                style={{
                  backgroundColor: '#EEEEEE',
                  ...neumorphicOutset,
                }}
                onPress={handleCancel}
              >
                <Text className="font-bold text-sm" style={{ color: '#64748B' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-3xl py-3.5 flex-row items-center justify-center"
                style={{
                  backgroundColor: selectedItems.size === 0 ? '#EEEEEE' : '#C4E4D4',
                  ...(selectedItems.size === 0 ? neumorphicOutset : neumorphicInset),
                }}
                onPress={handleConfirm}
                disabled={selectedItems.size === 0}
              >
                <ShoppingCart
                  size={17}
                  color="#64748B"
                  style={{ marginRight: 4 }}
                />
                <Text className="font-bold text-sm ml-1" style={{ color: '#64748B' }}>
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
