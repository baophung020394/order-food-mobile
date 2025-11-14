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
      <View className="flex-1 justify-center items-center bg-black/20">
        <View className="bg-white rounded-2xl w-[95%] max-h-[92%] flex-1 flex-col">
          <View className="flex-row flex-1 items-center border-b border-gray-200 px-4 py-3 z-10 min-h-16 max-h-16">
            <Text className="text-2xl font-bold flex-1 text-zinc-900">
              Chọn món
            </Text>
            <TouchableOpacity
              onPress={handleCancel}
              className="p-2 rounded-full bg-gray-100"
            >
              <X size={22} color="#222" />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="my-2 ml-2 min-h-10 max-h-10"
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                className={
                  `px-4 py-2 rounded-full border mr-2 ` +
                  (selectedCategory === cat
                    ? "bg-green-600 border-green-600"
                    : "bg-white border-gray-200")
                }
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  className={
                    `text-base font-semibold ` +
                    (selectedCategory === cat ? "text-white" : "text-zinc-900")
                  }
                >
                  {cat === "all" ? "Tất cả" : getCategoryLabel(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Menu grid */}
          <ScrollView className="flex-1">
            <View className="flex flex-col gap-2 mx-3 my-2">
              {filteredItems.map((item) => {
                const selectedItem = selectedItems.get(item.id);
                return (
                  <View
                    key={item.id}
                    className="bg-white rounded-xl mb-2 shadow border border-gray-100 min-w-[10px]"
                  >
                    <View className="p-3">
                      <View className="flex-row items-center justify-between gap-2 mb-2">
                        <View className="flex-1 min-w-0">
                          <Text
                            className="font-semibold text-lg mb-[1px] text-zinc-900"
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text
                            className="text-sm text-gray-500 mb-1"
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <View
                              className={`rounded-full px-3 py-1 ${
                                categoryColors[item.category] || "bg-gray-200"
                              } mr-2 items-center`}
                            >
                              <Text className="text-xs text-white font-bold">
                                {getCategoryLabel(item.category)}
                              </Text>
                            </View>
                            <Text className="text-sm text-gray-400">
                              {item.prep_time_minutes} phút
                            </Text>
                          </View>
                        </View>
                        <Text className="font-bold text-green-600 text-lg ml-2">
                          {item.price.toLocaleString("vi-VN")}₫
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2 mt-2">
                        {selectedItem ? (
                          <>
                            <TouchableOpacity
                              className="bg-gray-100 rounded-md p-2 min-w-[32px] items-center justify-center"
                              onPress={() => handleRemoveItem(item.id)}
                            >
                              <Minus size={18} color="#333" />
                            </TouchableOpacity>
                            <Text className="font-semibold text-base text-zinc-900 min-w-[30px] text-center">
                              {selectedItem.quantity}
                            </Text>
                            <TouchableOpacity
                              className="bg-gray-100 rounded-md p-2 min-w-[32px] items-center justify-center"
                              onPress={() => handleAddItem(item)}
                            >
                              <Plus size={18} color="#333" />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <TouchableOpacity
                            className="bg-green-600 rounded-lg flex-row items-center justify-center py-2 mt-1 flex-1"
                            onPress={() => handleAddItem(item)}
                          >
                            <Plus
                              size={17}
                              color="#fff"
                              style={{ marginRight: 4 }}
                            />
                            <Text className="text-white font-bold ml-2">
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
              <View className="mt-4 px-2 border-t border-gray-200 bg-zinc-50 rounded-xl mb-4 py-2">
                <Text className="font-bold text-lg mb-2 text-zinc-900">
                  Món đã chọn ({selectedItems.size})
                </Text>
                {Array.from(selectedItems.values()).map((item) => (
                  <View
                    key={item.menu_item.id}
                    className="bg-white rounded-lg my-2 p-2 border border-gray-200"
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="font-medium text-base text-zinc-900 flex-1">
                        {item.menu_item.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
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
                      className={`bg-gray-50 rounded-md border border-gray-200 px-3 py-2 text-sm text-zinc-900 mt-1 min-h-[32px]`}
                      multiline
                      numberOfLines={2}
                      placeholderTextColor="#888"
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="border-t border-gray-100 bg-zinc-50 px-4 pt-3 pb-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-bold text-base text-zinc-900">
                Tổng tạm tính:
              </Text>
              <Text className="font-bold text-lg text-green-600">
                {totalAmount.toLocaleString("vi-VN")}₫
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 rounded-lg py-3 bg-gray-200 items-center justify-center"
                onPress={handleCancel}
              >
                <Text className="font-bold text-base text-zinc-800">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-lg py-3 flex-row items-center justify-center ${
                  selectedItems.size === 0 ? "bg-gray-300" : "bg-green-600"
                }`}
                onPress={handleConfirm}
                disabled={selectedItems.size === 0}
              >
                <ShoppingCart
                  size={17}
                  color="#fff"
                  style={{ marginRight: 4 }}
                />
                <Text className="font-bold text-base text-white ml-1">
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
