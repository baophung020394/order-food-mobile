import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { LogOut, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
      {/* Header */}
      <View 
        className="px-6 py-5 rounded-b-3xl"
        style={{ 
          backgroundColor: '#EEEEEE',
          ...neumorphicOutset,
        }}
      >
        <Text className="text-2xl font-bold" style={{ color: '#64748B' }}>Tài khoản</Text>
      </View>
      
      <ScrollView className="flex-1 px-4 py-6">
        {/* Profile Info */}
        <View 
          className="rounded-3xl p-6 mb-6"
          style={{
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
        >
          <View className="items-center mb-6">
            <View 
              className="w-28 h-28 rounded-3xl items-center justify-center mb-4"
              style={{
                backgroundColor: '#EEEEEE',
                ...neumorphicInset,
              }}
            >
              <User size={50} color="#94A3B8" />
            </View>
            <Text className="text-2xl font-bold mb-1" style={{ color: '#64748B' }}>{user?.full_name || "Người dùng"}</Text>
            <Text className="text-sm" style={{ color: '#94A3B8' }}>{user?.role || "Nhân viên"}</Text>
          </View>
          
          <View className="border-t pt-5 mt-5" style={{ borderTopColor: '#D1D1D1' }}>
            <View className="mb-4">
              <Text className="text-xs mb-1" style={{ color: '#94A3B8' }}>Tên đăng nhập</Text>
              <Text className="text-base font-semibold" style={{ color: '#64748B' }}>{user?.username || "N/A"}</Text>
            </View>
            <View className="mb-4">
              <Text className="text-xs mb-1" style={{ color: '#94A3B8' }}>Email</Text>
              <Text className="text-base font-semibold" style={{ color: '#64748B' }}>{user?.email || "N/A"}</Text>
            </View>
            <View>
              <Text className="text-xs mb-1" style={{ color: '#94A3B8' }}>ID</Text>
              <Text className="text-base font-semibold" style={{ color: '#64748B' }}>{user?.id || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="rounded-3xl px-6 py-4 flex-row items-center justify-center"
          style={{
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={20} color="#64748B" className="mr-3" />
          <Text className="text-base font-semibold" style={{ color: '#64748B' }}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
