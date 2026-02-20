import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AppProvider } from "@/lib/AppContext";
import { useFonts, NotoSansKR_400Regular, NotoSansKR_500Medium, NotoSansKR_700Bold } from "@expo-google-fonts/noto-sans-kr";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="word-learn" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="hangeul" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="review" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="custom-words" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="related-words-screen" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="theme-lessons" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="word-network" options={{ headerShown: false, presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <StatusBar style="light" />
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
