import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  return (
    <SafeAreaView className="flex-1 h-full w-full" style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}>
      <View className="flex-1 justify-center items-center">
        <View
          className="rounded-2xl p-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.4)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Text className="text-2xl font-bold" style={{ color: '#1e293b' }}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
