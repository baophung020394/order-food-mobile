import MenuItemDialog from "@/components/MenuItemDialog";
import menuItemsData from "@/services/fake-data/menu-items.json";
import { useRouter } from "expo-router";
import { ArrowLeft, Edit, Plus, Search, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const categoryColors: Record<string, string> = {
  main: "bg-orange-500",
  starter: "bg-green-500",
  drink: "bg-blue-500",
  dessert: "bg-pink-500",
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

const defaultImg =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

const MenuScreen = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMenuItems(menuItemsData as any[]);
  }, []);

  // Tạo category từ DS hiện tại
  const categories = Array.from(
    new Set(menuItems.map((item) => item.category))
  );

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // CRUD methods (local state)
  const handleAdd = () => {
    setEditItem(null);
    setShowDialog(true);
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setShowDialog(true);
  };

  const handleSave = (item: any) => {
    if (item.id) {
      setMenuItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, ...item } : m))
      );
      Toast.show({
        type: "success",
        text1: "Đã cập nhật",
        text2: "Món ăn đã được cập nhật thành công",
      });
    } else {
      const newItem = {
        ...item,
        id: `menu-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      setMenuItems((prev) => [newItem, ...prev]);
      Toast.show({
        type: "success",
        text1: "Đã thêm",
        text2: "Món ăn mới đã được thêm thành công",
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      setMenuItems((prev) => prev.filter((m) => m.id !== deleteId));
      Toast.show({
        type: "success",
        text1: "Đã xóa",
        text2: "Món ăn đã được xóa",
      });
      setDeleteId(null);
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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#E8E8E8' }}>
      <View className="flex-1">
        {/* Header */}
        <View 
          className="px-6 py-5 flex-row items-center justify-between rounded-b-3xl"
          style={{
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
        >
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              className="rounded-2xl p-2"
              style={{
                backgroundColor: '#EEEEEE',
                ...neumorphicInset,
              }}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color="#64748B" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: '#64748B' }}>
              Thực đơn
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center rounded-2xl px-4 py-2.5"
            style={{
              backgroundColor: '#EEEEEE',
              ...neumorphicOutset,
            }}
            onPress={handleAdd}
          >
            <Plus size={18} color="#64748B" className="mr-2" />
            <Text className="font-semibold text-sm" style={{ color: '#64748B' }}>Thêm</Text>
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Search & Filter */}
          <View className="px-4 py-5">
            <View className="relative mb-4">
              <View className="absolute top-0 bottom-0 left-4 justify-center flex-col h-full z-10">
                <Search size={18} color="#94A3B8" />
              </View>
              <TextInput
                className="pl-12 pr-4 rounded-3xl h-12 text-base"
                style={{
                  backgroundColor: '#EEEEEE',
                  color: '#64748B',
                  ...neumorphicInset,
                }}
                placeholder="Tìm món ăn..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94A3B8"
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 pb-2">
              <TouchableOpacity
                className="px-5 py-2.5 rounded-3xl"
                style={{
                  backgroundColor: filterCategory === "all" ? '#B8D4E3' : '#EEEEEE',
                  ...(filterCategory === "all" ? neumorphicInset : neumorphicOutset),
                }}
                onPress={() => setFilterCategory("all")}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: filterCategory === "all" ? '#64748B' : '#94A3B8' }}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>
              {categories.map((category) => {
                const pastelColors: Record<string, string> = {
                  main: '#F4D1AE',
                  starter: '#C4E4D4',
                  drink: '#B8D4E3',
                  dessert: '#F2C2D1',
                };
                const isActive = filterCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    className="px-5 py-2.5 rounded-3xl"
                    style={{
                      backgroundColor: isActive ? pastelColors[category] || '#EEEEEE' : '#EEEEEE',
                      ...(isActive ? neumorphicInset : neumorphicOutset),
                    }}
                    onPress={() => setFilterCategory(category)}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: isActive ? '#64748B' : '#94A3B8' }}
                    >
                      {getCategoryLabel(category)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          {/* Menu Items Grid */}
          <View className="px-4 mt-1">
            {filteredItems.length === 0 ? (
              <View className="items-center justify-center py-16 opacity-80 w-full">
                <Text className="text-gray-400 text-xl mt-3 text-center">
                  Không tìm thấy món ăn nào
                </Text>
              </View>
            ) : (
              <View className="flex flex-wrap flex-row -mx-2">
                {filteredItems.map((item) => (
                  <View
                    key={item.id}
                    className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4"
                  >
                    <View 
                      className="rounded-3xl overflow-hidden"
                      style={{
                        backgroundColor: '#EEEEEE',
                        ...neumorphicOutset,
                      }}
                    >
                      <View className="aspect-[4/3] relative w-full items-center justify-center" style={{ backgroundColor: '#EEEEEE' }}>
                        <Image
                          source={{ uri: item.image_url || defaultImg }}
                          className="w-full h-full"
                          resizeMode="cover"
                          onError={() => { item.image_url = defaultImg; }}
                        />
                        {!item.is_available && (
                          <View className="absolute inset-0 bg-black/40 items-center justify-center z-10">
                            <View 
                              className="px-3 py-1.5 rounded-2xl"
                              style={{
                                backgroundColor: '#F2C2D1',
                                ...neumorphicInset,
                              }}
                            >
                              <Text className="font-bold text-xs" style={{ color: '#64748B' }}>
                                Hết hàng
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                      <View className="p-5 space-y-3">
                        <View className="flex-row items-start justify-between gap-2 mb-2">
                          <Text className="font-bold text-lg flex-1" style={{ color: '#64748B' }} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <View 
                            className="px-3 py-1 rounded-2xl ml-2"
                            style={{
                              backgroundColor: categoryColors[item.category] === 'bg-orange-500' ? '#F4D1AE' :
                                             categoryColors[item.category] === 'bg-green-500' ? '#C4E4D4' :
                                             categoryColors[item.category] === 'bg-blue-500' ? '#B8D4E3' :
                                             categoryColors[item.category] === 'bg-pink-500' ? '#F2C2D1' : '#D4C5E8',
                              ...neumorphicInset,
                            }}
                          >
                            <Text className="text-xs font-bold" style={{ color: '#64748B' }} numberOfLines={1}>
                              {getCategoryLabel(item.category)}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm leading-relaxed" style={{ color: '#94A3B8' }} numberOfLines={2}>
                          {item.description}
                        </Text>
                        <View className="flex-row items-center justify-between mt-2 border-t pt-3" style={{ borderTopColor: '#D1D1D1' }}>
                          <Text className="text-xl font-bold" style={{ color: '#64748B' }}>
                            {formatCurrency(item.price)}
                          </Text>
                          <Text className="text-xs" style={{ color: '#94A3B8' }}>
                            {item.prep_time_minutes} phút
                          </Text>
                        </View>
                        <View className="flex-row gap-2 mt-4">
                          <TouchableOpacity
                            className="flex-1 rounded-2xl flex-row items-center justify-center py-2.5"
                            style={{
                              backgroundColor: '#EEEEEE',
                              ...neumorphicOutset,
                            }}
                            onPress={() => handleEdit(item)}
                          >
                            <Edit size={16} color="#64748B" className="mr-2" />
                            <Text className="font-semibold text-xs" style={{ color: '#64748B' }}>
                              Sửa
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-1 rounded-2xl flex-row items-center justify-center py-2.5"
                            style={{
                              backgroundColor: '#EEEEEE',
                              ...neumorphicOutset,
                            }}
                            onPress={() => setDeleteId(item.id)}
                          >
                            <Trash2 size={16} color="#64748B" className="mr-2" />
                            <Text className="font-semibold text-xs" style={{ color: '#64748B' }}>Xóa</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      {/* MenuItemDialog quản lý thêm/sửa */}
      <MenuItemDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={handleSave}
        editItem={editItem}
      />
      {/* Modal Xác nhận xóa */}
      <Modal
        animationType="fade"
        transparent
        visible={!!deleteId}
        onRequestClose={() => setDeleteId(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/30">
          <View className="bg-white w-[87%] rounded-2xl px-6 py-6">
            <Text className="font-bold text-lg mb-2">Xác nhận xóa</Text>
            <Text className="text-sm text-gray-500 mb-5">
              Bạn có chắc chắn muốn xóa món ăn này? Hành động này không thể hoàn tác.
            </Text>
            <View className="flex-row justify-end gap-3 mt-3">
              <TouchableOpacity
                className="px-6 py-2 rounded-md border border-gray-400 bg-white"
                onPress={() => setDeleteId(null)}
              >
                <Text className="font-medium">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-6 py-2 rounded-md bg-red-600"
                onPress={handleDeleteConfirm}
              >
                <Text className="font-medium text-white">Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MenuScreen;
