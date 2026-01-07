import menuItemsData from "@/services/fake-data/menu-items.json";
import { useRouter } from "expo-router";
import { ArrowLeft, Clock, MapPin, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categoryColors: Record<string, string> = {
  main: "#FF6B9D",
  starter: "#4ECDC4",
  drink: "#FFB347",
  dessert: "#9B59B6",
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

const MenuScreen = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    setMenuItems(menuItemsData as any[]);
  }, []);

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

  return (
    <SafeAreaView className="flex-1">
      {/* Aurora Background */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          backgroundColor: "#667eea",
          opacity: 0.3,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: 200,
          backgroundColor: "#764ba2",
          opacity: 0.2,
        }}
      />

      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 flex-row items-center justify-between relative z-10">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="rounded-full p-2"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              onPress={() => router.back()}
            >
              <ArrowLeft size={22} color="#fff" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">
              Quản lý thực đơn
            </Text>
          </View>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {/* Search & Filter */}
          <View className="px-4 py-4 relative z-10">
            <View className="relative mb-3">
              <Search
                size={20}
                color="#999"
                style={{ position: "absolute", left: 14, top: 13, zIndex: 1 }}
              />
              <TextInput
                className="bg-white rounded-2xl pl-12 pr-4 h-14 text-base"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                placeholder="Tìm món ăn..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#888"
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 pb-2">
              <TouchableOpacity
                className={`px-5 py-2.5 rounded-full ${
                  filterCategory === "all"
                    ? "bg-white"
                    : "bg-white/80"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => setFilterCategory("all")}
              >
                <Text
                  className={`text-base font-semibold ${
                    filterCategory === "all" ? "text-[#667eea]" : "text-gray-600"
                  }`}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className={`px-5 py-2.5 rounded-full ${
                    filterCategory === category
                      ? "bg-white"
                      : "bg-white/80"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => setFilterCategory(category)}
                >
                  <Text
                    className={`text-base font-semibold ${
                      filterCategory === category ? "text-[#667eea]" : "text-gray-600"
                    }`}
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
                <MapPin size={48} color="#ccc" />
                <Text className="text-gray-400 text-xl mt-3 text-center">
                  Không tìm thấy món ăn nào
                </Text>
              </View>
            ) : (
              <View className="flex flex-wrap flex-row -mx-2">
                {filteredItems.map((item) => (
                  <Pressable
                    key={item.id}
                    className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4"
                    onPress={() => router.push(`/table/${item.id}`)}
                  >
                    <View className="overflow-hidden rounded-3xl bg-white"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 5,
                      }}
                    >
                      <View className="aspect-[4/3] relative w-full">
                        <Image
                          source={{ uri: item.image_url || defaultImg }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                        <View
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 60,
                            backgroundColor: "rgba(0,0,0,0.4)",
                          }}
                        />
                        <View className="absolute top-3 right-3 px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: categoryColors[item.category] }}
                        >
                          <Text className="text-xs text-white font-bold">
                            {getCategoryLabel(item.category)}
                          </Text>
                        </View>
                        <View className="absolute bottom-3 left-3 right-3">
                          <Text className="text-white text-lg font-bold mb-1" numberOfLines={1}>
                            {item.name}
                          </Text>
                          <View className="flex-row items-center">
                            <Clock size={14} color="#fff" style={{ marginRight: 4 }} />
                            <Text className="text-white text-sm font-semibold">{item.prep_time_minutes} phút</Text>
                          </View>
                        </View>
                      </View>
                      <View className="p-4">
                        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                          {item.description}
                        </Text>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-xs text-gray-500">Giá</Text>
                          <Text className="text-2xl font-bold" style={{ color: categoryColors[item.category] }}>
                            {formatCurrency(item.price)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MenuScreen;
