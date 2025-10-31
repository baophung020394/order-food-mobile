import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Orders = () => {
  return (
    <SafeAreaView>
      <View className="flex-1 justify-center items-center">
        <Text className="text-white text-2xl font-bold">Orders</Text>
      </View>
    </SafeAreaView>
  );
};

export default Orders;
