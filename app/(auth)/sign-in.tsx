import usersData from "@/services/fake-data/users.json";
import { useRouter } from "expo-router";
import { ChefHat } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

const demoAccounts = [
  { username: "admin", password: "admin123" },
  { username: "waiter1", password: "waiter123" },
  { username: "kitchen1", password: "kitchen123" },
  { username: "cashier1", password: "cashier123" },
];

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Thiếu thông tin',
        text2: 'Vui lòng nhập đủ tài khoản và mật khẩu!',
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = usersData.find(
        (u) => u.username === username && u.password_hash === password
      );
      if (user && user.is_active) {
        Toast.show({
          type: 'success',
          text1: 'Đăng nhập thành công',
          text2: `Chào mừng ${user.full_name}!`,
        });
        router.push("/(tabs)");
      } else {
        Toast.show({
          type: 'error',
          text1: 'Đăng nhập thất bại',
          text2: 'Tên đăng nhập hoặc mật khẩu không đúng',
        });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <SafeAreaView className="flex-1 h-full w-full">
      <ScrollView className="flex-1 bg-gradient-to-br from-[#388E3C]/10 via-[#fff] to-[#E0E0E0]/10 p-4">
        <KeyboardAvoidingView
          className="flex-1 justify-center items-center"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
            <View className="items-center mb-6">
              <View className="bg-[#388E3C] w-16 h-16 rounded-full items-center justify-center mb-2">
                <ChefHat color="#fff" size={32} />
              </View>
              <Text className="text-3xl font-bold mb-1 text-center">
                Restaurant POS
              </Text>
              <Text className="text-base text-gray-600 text-center mb-2">
                Đăng nhập vào hệ thống quản lý nhà hàng
              </Text>
            </View>

            {/* Form */}
            <View className="mb-4">
              <Text className="font-medium mb-1">Tên đăng nhập</Text>
              <TextInput
                className="bg-[#F8F8F8] border border-[#E0E0E0] rounded-xl px-4 h-12 mb-2 text-base"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text className="font-medium mb-1">Mật khẩu</Text>
              <TextInput
                className="bg-[#F8F8F8] border border-[#E0E0E0] rounded-xl px-4 h-12 text-base"
                placeholder="Nhập mật khẩu"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
              />
            </View>
            <Pressable
              className={`w-full rounded-xl bg-[#388E3C] h-12 flex-row items-center justify-center mt-2 ${loading ? "opacity-60" : ""}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Đăng nhập
                </Text>
              )}
            </Pressable>

            {/* Demo Accounts */}
            <View className="mt-6 p-4 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0]">
              <Text className="font-semibold mb-1 text-[#222]">
                Tài khoản demo:
              </Text>
              <View className="flex-row flex-wrap justify-between mt-2 gap-y-1">
                {demoAccounts.map((acc, i) => (
                  <View
                    key={i}
                    className="w-[48%] flex-row justify-between pb-0.5"
                  >
                    <Text className="text-[#666] text-sm">{acc.username}</Text>
                    <Text className="text-[#888] text-sm">
                      / {acc.password}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
