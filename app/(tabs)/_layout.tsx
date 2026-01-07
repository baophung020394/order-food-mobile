import { Tabs } from "expo-router";
import { ClipboardList, Table, User } from "lucide-react-native";
import { Text, View } from "react-native";

const TabIcon = ({ focused, iconName, title }: any) => {
  const iconColors: Record<string, string> = {
    Table: "#FF6B9D",
    List: "#4ECDC4",
    User: "#9B59B6",
  };
  const iconColor = iconColors[iconName] || "#667eea";
  
  const Icon =
    iconName === "Table"
      ? Table
      : iconName === "List"
      ? ClipboardList
      : iconName === "User"
      ? User
      : null;

  return (
    <View className="flex flex-col items-center justify-center" style={{ minWidth: 70 }}>
      {Icon && (
        <View
          className="rounded-2xl items-center justify-center"
          style={
            focused
              ? {
                  width: 56,
                  height: 56,
                  backgroundColor: iconColor,
                  shadowColor: iconColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                  transform: [{ scale: 1.1 }],
                }
              : {
                  width: 44,
                  height: 44,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }
          }
        >
          <Icon
            size={focused ? 26 : 20}
            color={focused ? "#fff" : "rgba(255,255,255,0.6)"}
          />
        </View>
      )}
      {focused && (
        <View className="mt-1.5 px-3 py-1 rounded-full"
          style={{ backgroundColor: `${iconColor}30` }}
        >
          <Text 
            className="text-xs font-bold"
            style={{ color: iconColor }}
          >
            {title}
          </Text>
        </View>
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
          backgroundColor: "#667eea",
          borderRadius: 32,
          marginHorizontal: 16,
          marginBottom: 20,
          height: 80,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 8,
          position: "absolute",
          shadowColor: "#667eea",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 20,
          borderTopWidth: 0,
          borderWidth: 3,
          borderColor: "rgba(255,255,255,0.3)",
        },
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 4,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
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
