import { useEffect, useState } from "react";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import type { ImageSourcePropType } from "react-native";
import {
  ActivityIndicator,
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
import {
  getRecipeById,
  updateRecipe,
} from "../../storage/recipes";
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

export default function EditRecipeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [name, setName] = useState("");
  const [ingredientsText, setIngredientsText] =
    useState("");
  const [stepsText, setStepsText] =
    useState("");
  const [selectedIcon, setSelectedIcon] =
    useState("broccoli");

  const [isLoading, setIsLoading] =
    useState(true);
  const [isSaving, setIsSaving] =
    useState(false);
  const [recipeExists, setRecipeExists] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRecipe(): Promise<void> {
      try {
        setIsLoading(true);
        setRecipeExists(true);

        const recipe = await getRecipeById(id);

        if (!isMounted) {
          return;
        }

        if (!recipe) {
          setRecipeExists(false);
          return;
        }

        setName(recipe.name);
        setIngredientsText(
          recipe.ingredients.join("\n")
        );
        setStepsText(recipe.steps.join("\n"));
        setSelectedIcon(recipe.iconKey);
      } catch (error) {
        console.error(
          "Unable to load recipe for editing:",
          error
        );

        if (isMounted) {
          setRecipeExists(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRecipe();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSaveChanges(): Promise<void> {
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

      await updateRecipe(id, {
        name: recipeName,
        ingredients,
        steps,
        iconKey: selectedIcon,
      });

      Alert.alert(
        "Recipe updated!",
        "Your changes have been saved.",
        [
          {
            text: "View Recipe",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "Unable to update recipe:",
        error
      );

      Alert.alert(
        "Unable to update recipe",
        "Something went wrong while saving your changes."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AppBackground variant="app">
        <View style={styles.centeredContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primaryDark}
          />

          <Text style={styles.loadingText}>
            Loading recipe...
          </Text>
        </View>
      </AppBackground>
    );
  }

  if (!recipeExists) {
    return (
      <AppBackground variant="app">
        <View style={styles.centeredContainer}>
          <View style={styles.notFoundCard}>
            <Image
              source={appAssets.recipeIcons.star}
              resizeMode="contain"
              style={styles.notFoundIcon}
            />

            <Text style={styles.notFoundTitle}>
              Recipe Not Found
            </Text>

            <Text style={styles.notFoundMessage}>
              This recipe may have been deleted.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.replace("/(tabs)")
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                Return to Recipes
              </Text>
            </Pressable>
          </View>
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground variant="app">
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel editing"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.backButtonText}>
              ← Cancel
            </Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>
              Edit Recipe
            </Text>

            <View style={styles.subtitleCard}>
              <Text style={styles.subtitle}>
                Update the recipe information
                below.
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
              placeholder="Recipe name"
              placeholderTextColor={
                colors.textMuted
              }
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
              Choose the icon that best matches
              your recipe.
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
              placeholder="Enter one ingredient per line"
              placeholderTextColor={
                colors.textMuted
              }
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
              placeholder="Enter one cooking step per line"
              placeholderTextColor={
                colors.textMuted
              }
              value={stepsText}
              onChangeText={setStepsText}
              multiline
              textAlignVertical="top"
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save recipe changes"
              disabled={isSaving}
              onPress={() => {
                void handleSaveChanges();
              }}
              style={({ pressed }) => [
                styles.saveButton,
                isSaving &&
                  styles.disabledSaveButton,
                pressed &&
                  !isSaving &&
                  styles.pressedButton,
              ]}
            >
              <Text style={styles.saveButtonText}>
                {isSaving
                  ? "Saving Changes..."
                  : "Save Changes"}
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
    paddingTop: 58,
    paddingHorizontal:
      spacing.screenHorizontal,
    paddingBottom: 100,
  },

  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal:
      spacing.screenHorizontal,
  },

  loadingText: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: colors.cardBackground,
    color: colors.textSecondary,
    fontSize: fontSizes.small,
  },

  notFoundCard: {
    width: "100%",
    alignItems: "center",
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
  },

  notFoundIcon: {
    width: 72,
    height: 72,
  },

  notFoundTitle: {
    marginTop: spacing.lg,
    color: colors.border,
    fontFamily: fontFamilies.title,
    fontSize: fontSizes.sectionTitle,
    lineHeight: lineHeights.sectionTitle,
    textAlign: "center",
  },

  notFoundMessage: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    color: colors.textSecondary,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    textAlign: "center",
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    backgroundColor: colors.cardBackground,
  },

  backButtonText: {
    color: colors.primaryDark,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.semibold,
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
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },

  disabledSaveButton: {
    opacity: 0.6,
  },

  pressedButton: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  saveButtonText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.bold,
  },

  primaryButton: {
    width: "100%",
    height: sizes.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },

  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.bold,
  },
});