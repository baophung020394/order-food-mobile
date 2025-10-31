import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import Toast from "react-native-toast-message";
import "./global.css";

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="table/[id]" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
}
