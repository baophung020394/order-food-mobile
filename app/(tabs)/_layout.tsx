import { Tabs } from "expo-router";
import { List, Table, User } from "lucide-react-native";
import { Text, View } from "react-native";

const TabIcon = ({ focused, iconName, title }: any) => {
  const iconProps = {
    size: focused ? 27 : 21,
    color: focused ? "#fff" : "#bbb",
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
        <Text className="text-white text-base font-semibold ml-2">{title}</Text>
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
          backgroundColor: "#181828",
          borderRadius: 30,
          marginHorizontal: 14,
          marginBottom: 16, // Giảm để lên cao giữa sát vùng safe
          height: 66, // cao hơn mặc định
          paddingTop: 8, // ĐỦ rộng, icon + label ở giữa hoàn hảo
          paddingBottom: 10,
          position: "absolute",
          shadowColor: "#0e152b",
          shadowOpacity: 0.16,
          shadowRadius: 10,
          elevation: 10,
          borderTopWidth: 0,
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
