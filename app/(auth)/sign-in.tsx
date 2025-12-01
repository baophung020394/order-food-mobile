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
    <SafeAreaView className="flex-1 h-full w-full" style={{ backgroundColor: '#E8E8E8' }}>
      <ScrollView className="flex-1 p-6">
        <KeyboardAvoidingView
          className="flex-1 justify-center items-center"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View 
            className="w-full max-w-md mx-auto rounded-3xl p-8"
            style={{
              backgroundColor: '#EEEEEE',
              ...neumorphicOutset,
            }}
          >
            <View className="items-center mb-8">
              <View 
                className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
                style={{
                  backgroundColor: '#EEEEEE',
                  ...neumorphicInset,
                }}
              >
                <ChefHat color="#94A3B8" size={36} />
              </View>
              <Text className="text-3xl font-bold mb-2 text-center" style={{ color: '#64748B' }}>
                Restaurant POS
              </Text>
              <Text className="text-sm text-center" style={{ color: '#94A3B8' }}>
                Đăng nhập vào hệ thống quản lý nhà hàng
              </Text>
            </View>

            {/* Form */}
            <View className="mb-6">
              <Text className="font-semibold mb-2 text-sm" style={{ color: '#64748B' }}>Tên đăng nhập</Text>
              <TextInput
                className="rounded-3xl px-4 h-12 mb-4 text-base"
                style={{
                  backgroundColor: '#EEEEEE',
                  color: '#64748B',
                  ...neumorphicInset,
                }}
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text className="font-semibold mb-2 text-sm" style={{ color: '#64748B' }}>Mật khẩu</Text>
              <TextInput
                className="rounded-3xl px-4 h-12 text-base"
                style={{
                  backgroundColor: '#EEEEEE',
                  color: '#64748B',
                  ...neumorphicInset,
                }}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
              />
            </View>
            <Pressable
              className={`w-full rounded-3xl h-12 flex-row items-center justify-center ${loading ? "opacity-60" : ""}`}
              style={{
                backgroundColor: '#EEEEEE',
                ...neumorphicOutset,
              }}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#64748B" />
              ) : (
                <Text className="font-semibold text-base" style={{ color: '#64748B' }}>
                  Đăng nhập
                </Text>
              )}
            </Pressable>

            {/* Demo Accounts */}
            <View 
              className="mt-8 p-5 rounded-3xl"
              style={{
                backgroundColor: '#EEEEEE',
                ...neumorphicInset,
              }}
            >
              <Text className="font-semibold mb-4 text-sm" style={{ color: '#64748B' }}>
                Tài khoản demo (nhấn để điền):
              </Text>
              <View className="gap-3">
                {demoAccounts.map((acc, i) => (
                  <Pressable
                    key={i}
                    onPress={() => fillDemoAccount(acc)}
                    disabled={loading}
                    className="rounded-2xl p-3"
                    style={{
                      backgroundColor: '#EEEEEE',
                      ...neumorphicOutset,
                    }}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm font-semibold" style={{ color: '#64748B' }}>{acc.username}</Text>
                      <Text className="text-xs" style={{ color: '#94A3B8' }}>
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
