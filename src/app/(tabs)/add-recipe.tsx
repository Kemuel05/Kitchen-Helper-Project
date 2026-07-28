import { useState } from "react";
import { useRouter } from "expo-router";
import type { ImageSourcePropType } from "react-native";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppBackground } from "../../components/AppBackground";
import { addRecipe } from "../../storage/recipes";
import { appAssets } from "../../theme/assets";
import { colors } from "../../theme/colors";
import {
  radius,
  sizes,
  spacing,
} from "../../theme/spacing";
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
} from "../../theme/typography";

type RecipeIconOption = {
  key: string;
  image: ImageSourcePropType;
  label: string;
};

const RECIPE_ICONS: RecipeIconOption[] = [
  {
    key: "broccoli",
    image: appAssets.recipeIcons.broccoli,
    label: "Vegetable",
  },
  {
    key: "pasta",
    image: appAssets.recipeIcons.burger,
    label: "Main dish",
  },
  {
    key: "dessert",
    image: appAssets.recipeIcons.cake,
    label: "Dessert",
  },
  {
    key: "soup",
    image: appAssets.recipeIcons.star,
    label: "Special recipe",
  },
  {
    key: "breakfast",
    image: appAssets.recipeIcons.pancake,
    label: "Breakfast",
  },
];

export default function AddRecipeScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [ingredientsText, setIngredientsText] =
    useState("");
  const [stepsText, setStepsText] = useState("");
  const [selectedIcon, setSelectedIcon] =
    useState("broccoli");
  const [isSaving, setIsSaving] = useState(false);

  function resetForm(): void {
    setName("");
    setIngredientsText("");
    setStepsText("");
    setSelectedIcon("broccoli");
  }

  async function handleSaveRecipe(): Promise<void> {
    const recipeName = name.trim();

    const ingredients = ingredientsText
      .split("\n")
      .map((ingredient) => ingredient.trim())
      .filter(Boolean);

    const steps = stepsText
      .split("\n")
      .map((step) => step.trim())
      .filter(Boolean);

    if (!recipeName) {
      Alert.alert(
        "Missing name",
        "Please enter a name for the recipe."
      );
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert(
        "Missing ingredients",
        "Please enter at least one ingredient."
      );
      return;
    }

    if (steps.length === 0) {
      Alert.alert(
        "Missing instructions",
        "Please enter at least one cooking step."
      );
      return;
    }

    try {
      setIsSaving(true);

      await addRecipe({
        name: recipeName,
        ingredients,
        steps,
        iconKey: selectedIcon,
      });

      resetForm();

      Alert.alert(
        "Recipe saved!",
        `${recipeName} was added to Food Valley.`,
        [
          {
            text: "View Recipes",
            onPress: () => {
              router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Unable to save recipe:", error);

      Alert.alert(
        "Unable to save recipe",
        "Something went wrong while saving the recipe."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppBackground variant="app">
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              Add a Recipe
            </Text>

            <View style={styles.subtitleCard}>
              <Text style={styles.subtitle}>
                Save something delicious to your Food
                Valley cookbook.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>
              Recipe name
            </Text>

            <TextInput
              accessibilityLabel="Recipe name"
              style={styles.input}
              placeholder="Example: Chicken Alfredo"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={80}
            />

            <Text style={styles.label}>
              Choose an icon
            </Text>

            <View style={styles.iconGrid}>
              {RECIPE_ICONS.map((icon) => {
                const isSelected =
                  selectedIcon === icon.key;

                return (
                  <Pressable
                    key={icon.key}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${icon.label} icon`}
                    accessibilityState={{
                      selected: isSelected,
                    }}
                    onPress={() =>
                      setSelectedIcon(icon.key)
                    }
                    style={({ pressed }) => [
                      styles.iconOption,
                      isSelected &&
                        styles.selectedIconOption,
                      pressed &&
                        styles.pressedIconOption,
                    ]}
                  >
                    <Image
                      source={icon.image}
                      resizeMode="contain"
                      style={styles.iconImage}
                    />
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.helperText}>
              Choose the icon that best matches your
              recipe.
            </Text>

            <Text style={styles.label}>
              Ingredients
            </Text>

            <TextInput
              accessibilityLabel="Recipe ingredients"
              style={[
                styles.input,
                styles.multilineInput,
              ]}
              placeholder={
                "Enter one ingredient per line:\nPasta\nChicken\nHeavy cream"
              }
              placeholderTextColor={colors.textMuted}
              value={ingredientsText}
              onChangeText={setIngredientsText}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>
              Cooking steps
            </Text>

            <TextInput
              accessibilityLabel="Cooking steps"
              style={[
                styles.input,
                styles.stepsInput,
              ]}
              placeholder={
                "Enter one step per line:\nBoil the pasta\nCook the chicken\nPrepare the sauce"
              }
              placeholderTextColor={colors.textMuted}
              value={stepsText}
              onChangeText={setStepsText}
              multiline
              textAlignVertical="top"
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save recipe"
              disabled={isSaving}
              onPress={() => {
                void handleSaveRecipe();
              }}
              style={({ pressed }) => [
                styles.saveButton,
                isSaving &&
                  styles.disabledSaveButton,
                pressed &&
                  !isSaving &&
                  styles.pressedSaveButton,
              ]}
            >
              <Text style={styles.saveButtonText}>
                {isSaving
                  ? "Saving..."
                  : "Save Recipe"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: {
    paddingTop: spacing.screenTop,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 140,
  },

  header: {
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },

  title: {
    color: colors.border,
    fontFamily: fontFamilies.title,
    fontSize: fontSizes.screenTitle,
    lineHeight: lineHeights.screenTitle,
  },

  subtitleCard: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    backgroundColor: colors.cardBackground,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
  },

  formCard: {
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
  },

  label: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },

  input: {
    width: "100%",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    fontSize: fontSizes.body,
  },

  multilineInput: {
    minHeight: 150,
  },

  stepsInput: {
    minHeight: 190,
  },

  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  iconOption: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundSoft,
  },

  selectedIconOption: {
    borderWidth: 3,
    borderColor: colors.primaryDark,
    backgroundColor: colors.primaryLight,
  },

  pressedIconOption: {
    opacity: 0.65,
  },

  iconImage: {
    width: 46,
    height: 46,
  },

  helperText: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    color: colors.textSecondary,
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.small,
  },

  saveButton: {
    height: sizes.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },

  pressedSaveButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  disabledSaveButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.bold,
  },
});