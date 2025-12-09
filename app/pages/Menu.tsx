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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}>
      <View className="flex-1">
        {/* Header */}
        <View 
          className="px-4 py-4 flex-row items-center justify-between"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.3)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="rounded-full mr-2 p-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }}
              onPress={() => router.back()}
            >
              <ArrowLeft size={22} color="#1e293b" />
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: '#1e293b' }}>
              Quản lý thực đơn
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center rounded-lg px-3 py-2"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.5)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.5)',
            }}
            onPress={handleAdd}
          >
            <Plus size={17} color="#fff" className="mr-2" />
            <Text className="text-white font-semibold ml-1">Thêm món</Text>
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Search & Filter */}
          <View className="px-4 py-4">
            <View className="relative mb-3">
              <View className="absolute top-0 bottom-0 left-3 justify-center flex-col h-full z-10">
                <Search size={20} color="rgba(30, 41, 59, 0.6)" />
              </View>
              <TextInput
                className="rounded-lg pl-10 pr-3 h-12 text-base"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
                placeholder="Tìm món ăn..."
                placeholderTextColor="rgba(30, 41, 59, 0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 pb-2">
              <TouchableOpacity
                className="px-4 py-1.5 rounded-full border mr-2"
                style={filterCategory === "all" ? {
                  backgroundColor: 'rgba(34, 197, 94, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  borderWidth: 1,
                } : {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  borderWidth: 1,
                }}
                onPress={() => setFilterCategory("all")}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: filterCategory === "all" ? "#fff" : "#1e293b" }}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className="px-4 py-1.5 rounded-full border mr-2"
                  style={filterCategory === category ? {
                    backgroundColor: 'rgba(34, 197, 94, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    borderWidth: 1,
                  } : {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1,
                  }}
                  onPress={() => setFilterCategory(category)}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: filterCategory === category ? "#fff" : "#1e293b" }}
                  >
                    {getCategoryLabel(category)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Menu Items Grid */}
          <View className="px-4 mt-1">
            {filteredItems.length === 0 ? (
              <View className="items-center justify-center py-16 opacity-80 w-full">
                <Text className="text-xl mt-3 text-center" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>
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
                      className="overflow-hidden rounded-2xl"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 5,
                      }}
                    >
                      <View className="aspect-[4/3] bg-gray-100 relative w-full items-center justify-center">
                        <Image
                          source={{ uri: item.image_url || defaultImg }}
                          className="w-full h-full rounded-t-xl"
                          resizeMode="cover"
                          onError={() => { item.image_url = defaultImg; }}
                        />
                        {!item.is_available && (
                          <View className="absolute inset-0 bg-black/50 items-center justify-center z-10">
                            <View
                              className="px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                              }}
                            >
                              <Text className="text-white font-bold">Hết hàng</Text>
                            </View>
                          </View>
                        )}
                      </View>
                      <View className="p-4 space-y-3">
                        <View className="flex-row items-start justify-between gap-2 mb-1">
                          <Text className="font-semibold text-lg flex-1" style={{ color: '#1e293b' }} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <View 
                            className={`px-3 py-1 rounded-full ml-2 ${categoryColors[item.category]}`}
                            style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }}
                          >
                            <Text className="text-xs text-white font-bold" numberOfLines={1}>
                              {getCategoryLabel(item.category)}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm" style={{ color: 'rgba(30, 41, 59, 0.7)' }} numberOfLines={2}>
                          {item.description}
                        </Text>
                        <View className="flex-row items-center justify-between mt-1">
                          <Text className="text-lg font-bold" style={{ color: 'rgba(34, 197, 94, 0.9)' }}>
                            {formatCurrency(item.price)}
                          </Text>
                          <Text className="text-sm" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>
                            {item.prep_time_minutes} phút
                          </Text>
                        </View>
                        <View className="flex-row gap-2 mt-3">
                          <TouchableOpacity
                            className="flex-1 rounded-lg flex-row items-center justify-center py-2 mr-2"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              borderWidth: 1,
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            }}
                            onPress={() => handleEdit(item)}
                          >
                            <Edit size={18} color="rgba(34, 197, 94, 0.9)" className="mr-1" />
                            <Text className="font-bold ml-1" style={{ color: 'rgba(34, 197, 94, 0.9)' }}>
                              Sửa
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-1 rounded-lg flex-row items-center justify-center py-2"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              borderWidth: 1,
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            }}
                            onPress={() => setDeleteId(item.id)}
                          >
                            <Trash2 size={18} color="rgba(239, 68, 68, 0.9)" className="mr-1" />
                            <Text className="font-bold ml-1" style={{ color: 'rgba(239, 68, 68, 0.9)' }}>Xóa</Text>
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
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <View 
            className="w-[87%] rounded-2xl px-6 py-6"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.4)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Text className="font-bold text-lg mb-2" style={{ color: '#1e293b' }}>Xác nhận xóa</Text>
            <Text className="text-sm mb-5" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>
              Bạn có chắc chắn muốn xóa món ăn này? Hành động này không thể hoàn tác.
            </Text>
            <View className="flex-row justify-end gap-3 mt-3">
              <TouchableOpacity
                className="px-6 py-2 rounded-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
                onPress={() => setDeleteId(null)}
              >
                <Text className="font-medium" style={{ color: '#1e293b' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-6 py-2 rounded-md"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.6)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
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
