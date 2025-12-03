import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { LogOut, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import usersData from "@/services/fake-data/users.json";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const { logout: logoutAuth, user: authUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    } else {
      const demoUser = usersData[0];
      setUser(demoUser);
    }
  }, [authUser]);

  const handleLogout = async () => {
    try {
      await logoutAuth();
      Toast.show({
        type: "success",
        text1: "Đăng xuất thành công",
      });
      router.replace("/(auth)/sign-in");
    } catch (error: any) {
      console.error('Logout error:', error);
      Toast.show({
        type: "error",
        text1: "Đăng xuất thất bại",
        text2: error?.message || "Vui lòng thử lại",
      });
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
        {/* Header */}
        <BlurView
          intensity={20}
          tint="light"
          className="px-6 py-5 rounded-b-3xl overflow-hidden"
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
          <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Tài khoản</Text>
        </BlurView>
        
        <ScrollView className="flex-1 px-4 py-6">
          {/* Profile Info */}
          <BlurView
            intensity={20}
            tint="light"
            className="rounded-3xl p-6 mb-6 overflow-hidden"
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
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
            <View className="items-center mb-6">
              <View 
                className="w-28 h-28 rounded-3xl items-center justify-center mb-4"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
              >
                <User size={50} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>{user?.full_name || "Người dùng"}</Text>
              <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{user?.role || "Nhân viên"}</Text>
            </View>
            
            <View className="pt-5 mt-5" style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)' }}>
              <View className="mb-4">
                <Text className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Tên đăng nhập</Text>
                <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>{user?.username || "N/A"}</Text>
              </View>
              <View className="mb-4">
                <Text className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Email</Text>
                <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>{user?.email || "N/A"}</Text>
              </View>
              <View>
                <Text className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ID</Text>
                <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>{user?.id || "N/A"}</Text>
              </View>
            </View>
          </BlurView>

          {/* Logout Button */}
          <BlurView
            intensity={15}
            tint="light"
            className="rounded-3xl px-6 py-4 overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Light reflection */}
            <View
              className="absolute top-0 left-0 right-0 h-1/2"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
            <TouchableOpacity
              className="w-full h-full flex-row items-center justify-center"
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LogOut size={20} color="#FFFFFF" className="mr-3" />
              <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Đăng xuất</Text>
            </TouchableOpacity>
          </BlurView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Profile;
