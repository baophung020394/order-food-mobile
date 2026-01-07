import { useAuth } from "@/context/AuthContext";
import { useFocusEffect, useRouter } from "expo-router";
import { UtensilsCrossed } from "lucide-react-native";
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
  { username: "admin", password: "123456" },
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
      {/* Aurora Background */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#667eea",
          opacity: 0.2,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          backgroundColor: "#764ba2",
          opacity: 0.15,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "40%",
          height: "50%",
          backgroundColor: "#f093fb",
          opacity: 0.1,
        }}
      />

      <ScrollView className="flex-1 p-4">
        <KeyboardAvoidingView
          className="flex-1 justify-center items-center"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 relative z-10"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{
                  backgroundColor: "#667eea",
                  shadowColor: "#667eea",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <UtensilsCrossed color="#fff" size={40} />
              </View>
              <Text className="text-3xl font-bold mb-2 text-center" style={{ color: "#667eea" }}>
                Restaurant POS
              </Text>
              <Text className="text-base text-gray-600 text-center">
                Đăng nhập vào hệ thống quản lý nhà hàng
              </Text>
            </View>

            {/* Form */}
            <View className="mb-6">
              <Text className="font-semibold mb-2 text-gray-700">Tên đăng nhập</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 mb-4 text-base"
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text className="font-semibold mb-2 text-gray-700">Mật khẩu</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 text-base"
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
              />
            </View>
            <Pressable
              className={`w-full rounded-2xl h-14 flex-row items-center justify-center ${loading ? "opacity-60" : ""}`}
              style={{ backgroundColor: "#667eea" }}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <UtensilsCrossed size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text className="text-white font-semibold text-base">
                    Đăng nhập
                  </Text>
                </>
              )}
            </Pressable>

            {/* Demo Accounts */}
            <View className="mt-6 p-4 rounded-2xl"
              style={{ backgroundColor: "#f8f9fa", borderWidth: 1, borderColor: "#e9ecef" }}
            >
              <Text className="font-semibold mb-3 text-gray-800">
                Tài khoản demo (nhấn để điền):
              </Text>
              <View className="gap-2">
                {demoAccounts.map((acc, i) => (
                  <Pressable
                    key={i}
                    onPress={() => fillDemoAccount(acc)}
                    disabled={loading}
                    className="bg-white rounded-xl p-3 border"
                    style={{ borderColor: "#e9ecef" }}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-700 text-sm font-medium">{acc.username}</Text>
                      <Text className="text-gray-500 text-xs">
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
