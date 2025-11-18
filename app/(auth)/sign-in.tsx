import { useAuth } from "@/context/AuthContext";
import { useFocusEffect, useRouter } from "expo-router";
import { ChefHat } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
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
  { username: "admin1", password: "admin123" },
  { username: "staff1", password: "password123" },
  { username: "kitchen1", password: "password123" },
];

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Prevent back navigation nếu đã đăng nhập
  useFocusEffect(
    useCallback(() => {
      // Nếu đã đăng nhập, redirect về dashboard
      if (isAuthenticated) {
        router.replace("/(tabs)");
        return;
      }

      // Prevent hardware back button trên Android
      const onBackPress = () => {
        if (isAuthenticated) {
          // Nếu đã đăng nhập, không cho back về login
          return true; // Return true để prevent default back behavior
        }
        return false; // Cho phép back nếu chưa đăng nhập
      };

      // Android: Handle hardware back button
      if (Platform.OS === 'android') {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => backHandler.remove();
      }
    }, [isAuthenticated, router])
  );

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
    try {
      const response = await login({ username, password });
      Toast.show({
        type: 'success',
        text1: 'Đăng nhập thành công',
        text2: `Chào mừng ${response.user?.fullName || username}!`,
      });
      router.push("/(tabs)");
    } catch (error: any) {
      const errorMessage = error?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
      Toast.show({
        type: 'error',
        text1: 'Đăng nhập thất bại',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (account: { username: string; password: string }) => {
    setUsername(account.username);
    setPassword(account.password);
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
              <Text className="font-semibold mb-2 text-[#222]">
                Tài khoản demo (nhấn để điền):
              </Text>
              <View className="gap-2">
                {demoAccounts.map((acc, i) => (
                  <Pressable
                    key={i}
                    onPress={() => fillDemoAccount(acc)}
                    disabled={loading}
                    className="bg-white rounded-lg p-2 border border-[#E0E0E0]"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-[#666] text-sm font-medium">{acc.username}</Text>
                      <Text className="text-[#888] text-xs">
                        {acc.password}
                      </Text>
                    </View>
                  </Pressable>
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
