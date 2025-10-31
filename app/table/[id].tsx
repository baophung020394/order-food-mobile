import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    View,
} from "react-native";

const TABLES = [
  { id: 1, code: "T-01", seats: 4, status: "available" },
  { id: 2, code: "T-02", seats: 2, status: "reserved" },
  { id: 3, code: "T-03", seats: 6, status: "running" },
  // ... tiếp tục như ở trang list bàn
];
const statusColor = {
  available: "#4CAF50",
  reserved: "#FFB300",
  running: "#2196F3",
};
const DISHES = [
  {
    id: 1,
    name: "Mì xào bò",
    price: 45000,
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg",
  },
  {
    id: 2,
    name: "Cơm chiên dương châu",
    price: 40000,
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg",
  },
  {
    id: 3,
    name: "Lẩu hải sản",
    price: 250000,
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg",
  },
  {
    id: 4,
    name: "Gà chiên nước mắm",
    price: 55000,
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg",
  },
  {
    id: 5,
    name: "Canh chua cá",
    price: 50000,
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg",
  },
];

export default function TableDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const table = useMemo(
    () => TABLES.find((t) => String(t.id) === String(id)),
    [id]
  );
  const [order, setOrder] = useState<Record<number, number>>({});

  function addDish(dishId: number) {
    setOrder((prev) => ({ ...prev, [dishId]: (prev[dishId] || 0) + 1 }));
  }
  function removeDish(dishId: number) {
    setOrder((prev) => {
      const newOrder = { ...prev };
      if (newOrder[dishId] > 1) newOrder[dishId]--;
      else delete newOrder[dishId];
      return newOrder;
    });
  }

  const pickedDishes = DISHES.filter((d) => order[d.id]);
  const total = pickedDishes.reduce(
    (sum, d) => sum + d.price * (order[d.id] || 0),
    0
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8F8F8]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-5 bg-white border-b border-b-[#eee]">
        <Pressable onPress={() => router.back()} className="mr-2 p-1">
          <Text className="text-2xl">←</Text>
        </Pressable>
        <View>
          <Text className="text-[22px] font-bold text-[#333]">
            {table?.code || "Table"}
          </Text>
          <Text className="text-[#888] text-sm">
            {table?.seats || "?"} seats
          </Text>
        </View>
        <View
          className="ml-auto px-3 py-1 rounded-lg"
          style={{
            backgroundColor:
              statusColor[
                (table?.status as keyof typeof statusColor) || "available"
              ],
          }}
        >
          <Text className="text-white font-bold text-xs capitalize">
            {table?.status || ""}
          </Text>
        </View>
      </View>

      {/* Danh sách món ăn */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 18 }}
      >
        <Text className="font-bold text-lg mb-2">Chọn món:</Text>
        <FlatList
          data={DISHES}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const quantity = order[item.id] || 0;
            return (
              <View
                className="flex-row items-center bg-white mb-4 rounded-xl"
                style={{
                  padding: 11,
                  shadowColor: "#ccc",
                  shadowOpacity: 0.07,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  className="w-12 h-12 rounded-xl bg-[#eee] mr-4"
                />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-[#212121]">
                    {item.name}
                  </Text>
                  <Text className="text-[#F57C00] font-bold text-sm">
                    {item.price.toLocaleString()}đ
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => removeDish(item.id)}
                    disabled={quantity === 0}
                    className={`rounded-md w-7 h-7 items-center justify-center ${
                      quantity ? "bg-[#F44336]" : "bg-[#eee]"
                    } mr-1`}
                  >
                    <Text
                      className={`text-[20px] ${
                        quantity ? "text-white" : "text-[#bbb]"
                      }`}
                    >
                      -
                    </Text>
                  </Pressable>
                  <Text className="text-base text-center w-7">{quantity}</Text>
                  <Pressable
                    onPress={() => addDish(item.id)}
                    className="bg-[#4CAF50] rounded-md w-7 h-7 items-center justify-center ml-1"
                  >
                    <Text className="text-white text-[20px]">+</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Order summary + Gửi bếp */}
      <View className="border-t border-[#E0E0E0] py-3 pb-6 bg-white px-6">
        {pickedDishes.length > 0 ? (
          <>
            <Text className="font-bold text-[15px] mb-1">Món đã chọn:</Text>
            {pickedDishes.map((dish) => (
              <View
                className="flex-row justify-between items-center mb-1"
                key={dish.id}
              >
                <Text className="text-[#333] text-[15px]">
                  {dish.name} x{order[dish.id]}
                </Text>
                <Text className="text-[#F57C00] font-bold text-sm">
                  {(dish.price * order[dish.id]).toLocaleString()}đ
                </Text>
              </View>
            ))}
            <View className="flex-row justify-between my-2">
              <Text className="font-bold text-[16px]">Tạm tính:</Text>
              <Text className="font-bold text-[16px] text-[#4CAF50]">
                {total.toLocaleString()}đ
              </Text>
            </View>
            <Pressable
              onPress={() => alert("Đã gửi order tới bếp!")}
              className="mt-2 bg-[#2196F3] rounded-xl py-3"
            >
              <Text className="text-white text-center font-bold text-[18px]">
                Gửi Order tới Bếp
              </Text>
            </Pressable>
          </>
        ) : (
          <Text className="text-[#888] text-center mt-2">
            Chưa chọn món nào.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
