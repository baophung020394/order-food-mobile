import { AuthProvider } from "@/context/AuthContext";
import { OrderProvider } from "@/context/OrderContext";
import { TableProvider } from "@/context/TableContext";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import Toast from "react-native-toast-message";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <TableProvider>
        <OrderProvider>
          <>
            <StatusBar hidden={true} />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
              <Stack.Screen name="table/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="pages/kitchen" options={{ headerShown: false }} />
              <Stack.Screen name="pages/Menu" options={{ headerShown: false }} />
              <Stack.Screen name="pages/create-table" options={{ headerShown: false }} />
            </Stack>
            <Toast />
          </>
        </OrderProvider>
      </TableProvider>
    </AuthProvider>
  );
}
