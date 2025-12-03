import { Tabs } from "expo-router";
import { List, Table, User } from "lucide-react-native";
import { Text, View } from "react-native";

const TabIcon = ({ focused, iconName, title }: any) => {
  const iconProps = {
    size: focused ? 27 : 21,
    color: focused ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)",
  };
  const Icon =
    iconName === "Table"
      ? Table
      : iconName === "List"
      ? List
      : iconName === "User"
      ? User
      : null;

  return (
    <View className="flex flex-row items-center justify-center w-56">
      {Icon ? <Icon {...iconProps} /> : null}
      {focused && (
        <Text className="text-base font-semibold ml-2" style={{ color: '#FFFFFF' }}>{title}</Text>
      )}
    </View>
  );
};

const _Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: 30,
          marginHorizontal: 14,
          marginBottom: 16,
          height: 66,
          paddingTop: 8,
          paddingBottom: 10,
          position: "absolute",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.3)",
          borderTopWidth: 1,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 4,
          paddingBottom: 7,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tables",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="Table" focused={focused} title="Bàn ăn" />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="List" focused={focused} title="Order" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="User" focused={focused} title="Cá nhân" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;
