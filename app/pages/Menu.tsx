import MenuItemDialog from "@/components/MenuItemDialog";
import menuItemsData from "@/services/fake-data/menu-items.json";
import { BlurView } from "expo-blur";
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
      
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* Header */}
          <BlurView
            intensity={20}
            tint="light"
            className="px-6 py-5 flex-row items-center justify-between rounded-b-3xl overflow-hidden"
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
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                className="rounded-2xl p-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                onPress={() => router.back()}
              >
                <ArrowLeft size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                Thực đơn
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center rounded-2xl px-4 py-2.5"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={handleAdd}
            >
              <Plus size={18} color="#FFFFFF" className="mr-2" />
              <Text className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Thêm</Text>
            </TouchableOpacity>
          </BlurView>
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
            {/* Search & Filter */}
            <View className="px-4 py-5">
              <View className="relative mb-4">
                <View className="absolute top-0 bottom-0 left-4 justify-center flex-col h-full z-10">
                  <Search size={18} color="rgba(255, 255, 255, 0.8)" />
                </View>
                <BlurView
                  intensity={15}
                  tint="light"
                  className="pl-12 pr-4 rounded-3xl h-12 overflow-hidden"
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
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                    }}
                  />
                  <TextInput
                    className="h-full text-base"
                    style={{
                      color: '#FFFFFF',
                    }}
                    placeholder="Tìm món ăn..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  />
                </BlurView>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 pb-2">
                <TouchableOpacity
                  className="px-5 py-2.5 rounded-3xl"
                  style={{
                    backgroundColor: filterCategory === "all" ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                  onPress={() => setFilterCategory("all")}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: '#FFFFFF' }}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    className="px-5 py-2.5 rounded-3xl"
                    style={{
                      backgroundColor: filterCategory === category ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                    onPress={() => setFilterCategory(category)}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: '#FFFFFF' }}
                    >
                      {getCategoryLabel(category)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {/* Menu Items Grid */}
            <View className="px-4 mt-2">
              {filteredItems.length === 0 ? (
                <View className="items-center justify-center py-20 w-full">
                  <Text className="text-base mt-3 text-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Không tìm thấy món ăn
                  </Text>
                </View>
              ) : (
                <View className="flex flex-wrap flex-row -mx-2">
                  {filteredItems.map((item) => (
                    <View
                      key={item.id}
                      className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4"
                    >
                      <BlurView
                        intensity={15}
                        tint="light"
                        className="rounded-3xl overflow-hidden"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        {/* Light reflection */}
                        <View
                          className="absolute top-0 left-0 right-0 h-1/4 z-10"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                          }}
                        />
                        <View className="aspect-[4/3] relative w-full items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
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
                                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                                  borderWidth: 1,
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                }}
                              >
                                <Text className="font-bold text-xs" style={{ color: '#FFFFFF' }}>
                                  Hết hàng
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                        <View className="p-5 space-y-3">
                          <View className="flex-row items-start justify-between gap-2 mb-2">
                            <Text className="font-bold text-lg flex-1" style={{ color: '#FFFFFF' }} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <View 
                              className="px-3 py-1 rounded-2xl ml-2"
                              style={{
                                backgroundColor: categoryColors[item.category] === 'bg-orange-500' ? 'rgba(245, 158, 11, 0.3)' :
                                               categoryColors[item.category] === 'bg-green-500' ? 'rgba(16, 185, 129, 0.3)' :
                                               categoryColors[item.category] === 'bg-blue-500' ? 'rgba(59, 130, 246, 0.3)' :
                                               categoryColors[item.category] === 'bg-pink-500' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              }}
                            >
                              <Text className="text-xs font-bold" style={{ color: '#FFFFFF' }} numberOfLines={1}>
                                {getCategoryLabel(item.category)}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-sm leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.8)' }} numberOfLines={2}>
                            {item.description}
                          </Text>
                          <View className="flex-row items-center justify-between mt-2 pt-3" style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)' }}>
                            <Text className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                              {formatCurrency(item.price)}
                            </Text>
                            <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {item.prep_time_minutes} phút
                            </Text>
                          </View>
                          <View className="flex-row gap-2 mt-4">
                            <TouchableOpacity
                              className="flex-1 rounded-2xl flex-row items-center justify-center py-2.5"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              }}
                              onPress={() => handleEdit(item)}
                            >
                              <Edit size={16} color="#FFFFFF" className="mr-2" />
                              <Text className="font-semibold text-xs" style={{ color: '#FFFFFF' }}>
                                Sửa
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              className="flex-1 rounded-2xl flex-row items-center justify-center py-2.5"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              }}
                              onPress={() => setDeleteId(item.id)}
                            >
                              <Trash2 size={16} color="#FFFFFF" className="mr-2" />
                              <Text className="font-semibold text-xs" style={{ color: '#FFFFFF' }}>Xóa</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </BlurView>
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
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <BlurView
              intensity={25}
              tint="light"
              className="w-[87%] rounded-3xl px-8 py-8 overflow-hidden"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* Light source highlight */}
              <View
                className="absolute top-0 left-0 right-0 h-1/3"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                }}
              />
              <Text className="font-bold text-xl mb-3" style={{ color: '#FFFFFF' }}>Xác nhận xóa</Text>
              <Text className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Bạn có chắc chắn muốn xóa món ăn này? Hành động này không thể hoàn tác.
              </Text>
              <View className="flex-row justify-end gap-3 mt-3">
                <TouchableOpacity
                  className="px-6 py-2.5 rounded-3xl"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                  onPress={() => setDeleteId(null)}
                >
                  <Text className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-6 py-2.5 rounded-3xl"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                  onPress={handleDeleteConfirm}
                >
                  <Text className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default MenuScreen;
