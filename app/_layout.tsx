import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

// Update the import path if the file exists locally
import { useColorScheme } from "../hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const colorScheme = useColorScheme();

  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    const prepare = async () => {
      // wait for app setup (Realm, fonts, etc.)
      await new Promise((resolve) => setTimeout(resolve, 300));
      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
