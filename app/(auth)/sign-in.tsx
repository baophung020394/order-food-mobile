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
    <SafeAreaView className="flex-1 h-full w-full" style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}>
      <ScrollView className="flex-1 p-4">
        <KeyboardAvoidingView
          className="flex-1 justify-center items-center"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View 
            className="w-full max-w-md mx-auto rounded-2xl p-6"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.4)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View className="items-center mb-6">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-2"
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.4)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <ChefHat color="#fff" size={32} />
              </View>
              <Text className="text-3xl font-bold mb-1 text-center" style={{ color: '#1e293b' }}>
                Restaurant POS
              </Text>
              <Text className="text-base text-center mb-2" style={{ color: 'rgba(30, 41, 59, 0.7)' }}>
                Đăng nhập vào hệ thống quản lý nhà hàng
              </Text>
            </View>

            {/* Form */}
            <View className="mb-4">
              <Text className="font-medium mb-1" style={{ color: '#1e293b' }}>Tên đăng nhập</Text>
              <TextInput
                className="rounded-xl px-4 h-12 mb-2 text-base"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor="rgba(30, 41, 59, 0.5)"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text className="font-medium mb-1" style={{ color: '#1e293b' }}>Mật khẩu</Text>
              <TextInput
                className="rounded-xl px-4 h-12 text-base"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="rgba(30, 41, 59, 0.5)"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
              />
            </View>
            <Pressable
              className={`w-full rounded-xl h-12 flex-row items-center justify-center mt-2 ${loading ? "opacity-60" : ""}`}
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }}
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
            <View 
              className="mt-6 p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <Text className="font-semibold mb-2" style={{ color: '#1e293b' }}>
                Tài khoản demo (nhấn để điền):
              </Text>
              <View className="gap-2">
                {demoAccounts.map((acc, i) => (
                  <Pressable
                    key={i}
                    onPress={() => fillDemoAccount(acc)}
                    disabled={loading}
                    className="rounded-lg p-2"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm font-medium" style={{ color: 'rgba(30, 41, 59, 0.8)' }}>{acc.username}</Text>
                      <Text className="text-xs" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>
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
