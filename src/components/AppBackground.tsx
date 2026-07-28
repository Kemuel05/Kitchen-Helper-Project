import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import {
  ImageBackground,
  StyleSheet,
  View,
} from "react-native";

import { appAssets } from "../theme/assets";
import { colors } from "../theme/colors";

export type AppBackgroundVariant =
  | "welcome"
  | "app";

type AppBackgroundProps = PropsWithChildren<{
  variant?: AppBackgroundVariant;
  contentStyle?: StyleProp<ViewStyle>;
  dimBackground?: boolean;
}>;

export function AppBackground({
  variant = "app",
  contentStyle,
  dimBackground = false,
  children,
}: AppBackgroundProps) {
  const backgroundImage =
    variant === "welcome"
      ? appAssets.backgrounds.welcome
      : appAssets.backgrounds.app;

  const fallbackColor =
    variant === "welcome"
      ? colors.backgroundSoft
      : colors.background;

  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="cover"
      style={[
        styles.background,
        {
          backgroundColor: fallbackColor,
        },
      ]}
    >
      {dimBackground ? (
        <View
          pointerEvents="none"
          style={styles.overlay}
        />
      ) : null}

      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  content: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
});