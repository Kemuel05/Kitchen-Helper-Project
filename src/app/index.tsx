import { useRouter } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppBackground } from "../components/AppBackground";
import { appAssets } from "../theme/assets";
import { colors } from "../theme/colors";
import {
  radius,
  sizes,
  spacing,
} from "../theme/spacing";
import {
  fontSizes,
  fontWeights,
} from "../theme/typography";

export default function WelcomeScreen() {
  const router = useRouter();

  function handleEnterFoodValley(): void {
    Alert.alert(
      "Welcome to Food Valley, Alejandra! ♡",
      "A little cookbook made with love by Kemu.",
      [
        {
          text: "Let's Cook!",
          onPress: () => {
            router.replace("/(tabs)");
          },
        },
      ]
    );
  }

  return (
    <AppBackground variant="welcome">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Image
              accessibilityLabel="Food Valley"
              resizeMode="contain"
              source={appAssets.branding.titleLogo}
              style={styles.titleLogo}
            />

            <Text style={styles.creator}>
              {"by Kemu <3"}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              accessibilityRole="button"
              onPress={handleEnterFoodValley}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>
                Enter Food Valley
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.screenHorizontal,
  },

  titleContainer: {
    position: "absolute",
    top: "18%",
    right: spacing.screenHorizontal,
    left: spacing.screenHorizontal,
    alignItems: "center",
  },

  titleLogo: {
    width: "100%",
    height: 210,
    transform: [{ scale: 1.20 }],
  },

  creator: {
    marginTop: -20,
    color: colors.textPrimary,
    fontSize: fontSizes.subtitle,
    fontWeight: fontWeights.semibold,
    textAlign: "center",
  },

  buttonContainer: {
    position: "absolute",
    top: "52%",
    right: spacing.screenHorizontal,
    left: spacing.screenHorizontal,
  },

  button: {
    width: "100%",
    height: sizes.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.bold,
  },
});