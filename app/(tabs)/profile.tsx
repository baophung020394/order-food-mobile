import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  return (
    <SafeAreaView className="flex-1 bg-white h-full w-full">
      <View className="flex-1 justify-center items-center">
        <Text className="text-black text-2xl font-bold">Profile</Text>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
