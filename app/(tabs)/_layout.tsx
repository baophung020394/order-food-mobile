import { Tabs } from "expo-router";
import { List, Table, User } from "lucide-react-native";
import { Text, View } from "react-native";

const TabIcon = ({ focused, iconName, title }: any) => {
  const iconProps = {
    size: focused ? 24 : 20,
    color: focused ? "#64748B" : "#94A3B8",
  };
  const Icon =
    iconName === "Table"
      ? Table
      : iconName === "List"
      ? List
      : iconName === "User"
      ? User
      : null;

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
    <View 
      className="flex flex-row items-center justify-center px-4 py-2 rounded-3xl"
      style={{
        backgroundColor: '#EEEEEE',
        ...(focused ? neumorphicInset : neumorphicOutset),
      }}
    >
      {Icon ? <Icon {...iconProps} /> : null}
      {focused && (
        <Text className="text-sm font-semibold ml-2" style={{ color: '#64748B' }}>{title}</Text>
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
          backgroundColor: "#EEEEEE",
          borderRadius: 30,
          marginHorizontal: 14,
          marginBottom: 16,
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
          position: "absolute",
          shadowColor: "#D1D1D1",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.8,
          shadowRadius: 16,
          elevation: 8,
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
