import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet, View } from "react-native";

import { MusicControls } from "../audio/MusicControls";
import { MusicProvider } from "../audio/MusicProvider";
import { initializeDailyCuteNotifications } from "../notifications/notification-service";
import { appAssets } from "../theme/assets";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    StardewValley: appAssets.fonts.title,
  });

  useEffect(() => {
    void initializeDailyCuteNotifications();
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error("Unable to load the custom font:", fontError);
    }

    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <MusicProvider>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />

        <MusicControls />
      </View>
    </MusicProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});