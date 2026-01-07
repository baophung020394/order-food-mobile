import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { LogOut, Star, User } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const testimonials = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    restaurant: "Nhà hàng ABC",
    rating: 5,
    comment:
      "Món ăn tuyệt vời! Dịch vụ chuyên nghiệp và không gian đẹp. Sẽ quay lại!",
    avatar: "https://i.pravatar.cc/150?img=1",
    color: "#FF6B9D",
  },
  {
    id: "2",
    name: "Trần Thị B",
    restaurant: "Quán ăn XYZ",
    rating: 5,
    comment:
      "Hệ thống POS giúp đặt món nhanh chóng, món ăn ngon và phục vụ tốt. Rất hài lòng!",
    avatar: "https://i.pravatar.cc/150?img=12",
    color: "#4ECDC4",
  },
  {
    id: "3",
    name: "Lê Văn C",
    restaurant: "Nhà hàng DEF",
    rating: 5,
    comment:
      "Trải nghiệm tuyệt vời! Món ăn được chuẩn bị kỹ lưỡng, giá cả hợp lý. Đáng để thử!",
    avatar: "https://i.pravatar.cc/150?img=5",
    color: "#FFB347",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    restaurant: "Quán ăn GHI",
    rating: 5,
    comment:
      "Không gian đẹp, món ăn ngon miệng. Hệ thống đặt món hiện đại giúp tiết kiệm thời gian!",
    avatar: "https://i.pravatar.cc/150?img=8",
    color: "#9B59B6",
  },
];

const Profile = () => {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({
        type: "success",
        text1: "Đăng xuất thành công",
      });
      router.replace("/(auth)/sign-in");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Đăng xuất thất bại",
        text2: error?.message || "Vui lòng thử lại",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Aurora Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 250,
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
          height: 250,
          backgroundColor: "#764ba2",
          opacity: 0.2,
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="px-4 pt-6 pb-8 relative z-10">
          <View className="items-center mb-6">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderWidth: 4,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <User size={48} color="#fff" />
            </View>
            <Text className="text-3xl font-bold text-white mb-2">
              {user?.fullName || "Nhân viên"}
            </Text>
            <Text className="text-white/80 text-base">Nhà hàng</Text>
          </View>
        </View>

        {/* Customer Testimonials */}
        <View className="px-4 pb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Đánh giá khách hàng
          </Text>
          <Text className="text-gray-600 mb-6 text-base">
            Xem những gì khách hàng nói về nhà hàng của chúng ta
          </Text>

          {testimonials.map((testimonial, index) => (
            <View
              key={testimonial.id}
              className="bg-white rounded-3xl p-5 mb-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
                borderLeftWidth: 4,
                borderLeftColor: testimonial.color,
              }}
            >
              <View className="flex-row items-start mb-3">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${testimonial.color}20` }}
                >
                  <Text
                    className="text-lg font-bold"
                    style={{ color: testimonial.color }}
                  >
                    {testimonial.name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {testimonial.name}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color="#FFD700"
                        fill="#FFD700"
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>
                  <Text
                    className="text-sm text-gray-500 mb-2"
                    style={{ color: testimonial.color }}
                  >
                    {testimonial.restaurant}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-700 text-base leading-6">
                &quot;{testimonial.comment}&quot;
              </Text>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <View className="px-4 pb-8">
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 flex-row items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#F44336" style={{ marginRight: 8 }} />
            <Text
              className="text-lg font-semibold"
              style={{ color: "#F44336" }}
            >
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
