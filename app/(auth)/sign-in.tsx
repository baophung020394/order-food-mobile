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
import { BlurView } from "expo-blur";
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
      
      <SafeAreaView className="flex-1 h-full w-full">
        <ScrollView className="flex-1 p-6">
          <KeyboardAvoidingView
            className="flex-1 justify-center items-center"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <BlurView
              intensity={20}
              tint="light"
              className="w-full max-w-md mx-auto rounded-3xl p-8 overflow-hidden"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* Light source highlight */}
              <View
                className="absolute top-0 left-0 right-0 h-1/3"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                }}
              />
              <View className="items-center mb-8">
                <View 
                  className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <ChefHat color="#FFFFFF" size={36} />
                </View>
                <Text className="text-3xl font-bold mb-2 text-center" style={{ color: '#FFFFFF' }}>
                  Restaurant POS
                </Text>
                <Text className="text-sm text-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Đăng nhập vào hệ thống quản lý nhà hàng
                </Text>
              </View>

              {/* Form */}
              <View className="mb-6">
                <Text className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>Tên đăng nhập</Text>
                <BlurView
                  intensity={10}
                  tint="light"
                  className="rounded-3xl overflow-hidden mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <TextInput
                    className="px-4 h-12 text-base"
                    style={{
                      color: '#FFFFFF',
                    }}
                    placeholder="Nhập tên đăng nhập"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={username}
                    onChangeText={setUsername}
                    editable={!loading}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </BlurView>
                <Text className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>Mật khẩu</Text>
                <BlurView
                  intensity={10}
                  tint="light"
                  className="rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <TextInput
                    className="px-4 h-12 text-base"
                    style={{
                      color: '#FFFFFF',
                    }}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                    secureTextEntry
                  />
                </BlurView>
              </View>
              <BlurView
                intensity={15}
                tint="light"
                className={`w-full rounded-3xl h-12 overflow-hidden ${loading ? "opacity-60" : ""}`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                {/* Light reflection */}
                <View
                  className="absolute top-0 left-0 right-0 h-1/2"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                  }}
                />
                <Pressable
                  className="w-full h-full flex-row items-center justify-center"
                  onPress={handleLogin}
                  disabled={loading}
                >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-semibold text-base" style={{ color: '#FFFFFF' }}>
                    Đăng nhập
                  </Text>
                )}
                </Pressable>
              </BlurView>

              {/* Demo Accounts */}
              <BlurView
                intensity={10}
                tint="light"
                className="mt-8 p-5 rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Text className="font-semibold mb-4 text-sm" style={{ color: '#FFFFFF' }}>
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
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{acc.username}</Text>
                        <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {acc.password}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </BlurView>
            </BlurView>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SignIn;
