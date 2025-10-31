import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Orders = () => {
  return (
    <SafeAreaView className="flex-1 bg-white h-full w-full">
      <View className="flex-1 justify-center items-center">
        <Text className="text-black text-2xl font-bold">Orders</Text>
      </View>
    </SafeAreaView>
  );
};

export default Orders;
