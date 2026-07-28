import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import type { ImageSourcePropType } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppBackground } from "../../components/AppBackground";
import {
  completeRecipeWithImage,
  deleteRecipe,
  getRecipeById,
  removeCompletionPicture,
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
import type { Recipe } from "../../types/recipe";

const RECIPE_ICONS: Record<string, ImageSourcePropType> = {
  broccoli: appAssets.recipeIcons.broccoli,
  pasta: appAssets.recipeIcons.burger,
  dessert: appAssets.recipeIcons.cake,
  soup: appAssets.recipeIcons.star,
  breakfast: appAssets.recipeIcons.pancake,
};

const DEFAULT_RECIPE_ICON =
  appAssets.recipeIcons.star;

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [recipe, setRecipe] =
    useState<Recipe | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSavingPicture, setIsSavingPicture] =
    useState(false);
  const [
    isRemovingPicture,
    setIsRemovingPicture,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadRecipe(): Promise<void> {
        try {
          setIsLoading(true);

          const savedRecipe =
            await getRecipeById(id);

          if (isActive) {
            setRecipe(savedRecipe ?? null);
          }
        } catch (error) {
          console.error(
            "Unable to load recipe:",
            error
          );

          if (isActive) {
            setRecipe(null);
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadRecipe();

      return () => {
        isActive = false;
      };
    }, [id])
  );

  function handleEditRecipe(): void {
    if (!recipe) {
      return;
    }

    router.push({
      pathname: "/edit-recipe/[id]",
      params: {
        id: recipe.id,
      },
    });
  }

  async function saveCompletionPicture(
    imageUri: string
  ): Promise<void> {
    if (!recipe) {
      return;
    }

    try {
      setIsSavingPicture(true);

      const updatedRecipe =
        await completeRecipeWithImage(
          recipe.id,
          imageUri
        );

      setRecipe(updatedRecipe);

      Alert.alert(
        "Picture saved!",
        `${recipe.name} has been added to your completed recipes.`
      );
    } catch (error) {
      console.error(
        "Unable to save completion picture:",
        error
      );

      Alert.alert(
        "Unable to save picture",
        "Something went wrong while saving the picture."
      );
    } finally {
      setIsSavingPicture(false);
    }
  }

  async function takePhoto(): Promise<void> {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Camera permission needed",
        "Please allow camera access to take a picture of your completed recipe."
      );
      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

    if (
      !result.canceled &&
      result.assets.length > 0
    ) {
      await saveCompletionPicture(
        result.assets[0].uri
      );
    }
  }

  async function chooseFromLibrary(): Promise<void> {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo permission needed",
        "Please allow photo-library access to choose a picture."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

    if (
      !result.canceled &&
      result.assets.length > 0
    ) {
      await saveCompletionPicture(
        result.assets[0].uri
      );
    }
  }

  function handleSharePicture(): void {
    Alert.alert(
      recipe?.completionImageUri
        ? "Replace completed picture?"
        : "Share a Picture",
      "Choose where the picture should come from.",
      [
        {
          text: "Take a Photo",
          onPress: () => {
            void takePhoto();
          },
        },
        {
          text: "Choose from Library",
          onPress: () => {
            void chooseFromLibrary();
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  }

  function handleRemovePicture(): void {
    if (!recipe?.completionImageUri) {
      return;
    }

    Alert.alert(
      "Remove picture?",
      "The completed picture will be deleted, but the recipe will remain saved.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setIsRemovingPicture(true);

              const updatedRecipe =
                await removeCompletionPicture(
                  recipe.id
                );

              setRecipe(updatedRecipe);

              Alert.alert(
                "Picture removed",
                "The completion picture has been removed."
              );
            } catch (error) {
              console.error(
                "Unable to remove completion picture:",
                error
              );

              Alert.alert(
                "Unable to remove picture",
                "Something went wrong while removing the picture."
              );
            } finally {
              setIsRemovingPicture(false);
            }
          },
        },
      ]
    );
  }

  function handleDeleteRecipe(): void {
    if (!recipe) {
      return;
    }

    Alert.alert(
      "Delete recipe?",
      `Are you sure you want to delete ${recipe.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecipe(recipe.id);
              router.replace("/(tabs)");
            } catch (error) {
              console.error(
                "Unable to delete recipe:",
                error
              );

              Alert.alert(
                "Unable to delete recipe",
                "Something went wrong while deleting the recipe."
              );
            }
          },
        },
      ]
    );
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

  if (!recipe) {
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
              Recipe not found
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
                pressed &&
                  styles.pressedButton,
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

  const recipeIcon =
    RECIPE_ICONS[recipe.iconKey] ??
    DEFAULT_RECIPE_ICON;

  const pictureActionDisabled =
    isSavingPicture || isRemovingPicture;

  return (
    <AppBackground variant="app">
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.backButtonText}>
            ← Back
          </Text>
        </Pressable>

        <View style={styles.headerCard}>
          <View style={styles.iconContainer}>
            <Image
              source={recipeIcon}
              resizeMode="contain"
              style={styles.recipeIcon}
            />
          </View>

          <Text style={styles.title}>
            {recipe.name}
          </Text>

          <View style={styles.summaryBadge}>
            <Text style={styles.recipeSummary}>
              {recipe.ingredients.length} ingredients
              {" · "}
              {recipe.steps.length} steps
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit recipe"
          onPress={handleEditRecipe}
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.editButtonText}>
            Edit Recipe
          </Text>
        </Pressable>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Ingredients
          </Text>

          {recipe.ingredients.map(
            (ingredient, index) => (
              <View
                key={`${ingredient}-${index}`}
                style={styles.ingredientRow}
              >
                <View
                  style={styles.ingredientBullet}
                />

                <Text
                  style={styles.ingredientText}
                >
                  {ingredient}
                </Text>
              </View>
            )
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Cooking Steps
          </Text>

          {recipe.steps.map((step, index) => (
            <View
              key={`${step}-${index}`}
              style={styles.stepRow}
            >
              <View style={styles.stepNumber}>
                <Text
                  style={styles.stepNumberText}
                >
                  {index + 1}
                </Text>
              </View>

              <Text style={styles.stepText}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.finishedSection}>
          <Text style={styles.finishedTitle}>
            {recipe.completionImageUri
              ? "Recipe Completed!"
              : "Finished the Recipe?"}
          </Text>

          <Text style={styles.finishedMessage}>
            {recipe.completionImageUri
              ? "Here is the picture you shared."
              : "Share a picture of your completed dish!"}
          </Text>

          {recipe.completionImageUri ? (
            <>
              <Image
                source={{
                  uri: recipe.completionImageUri,
                }}
                resizeMode="cover"
                style={styles.completionImage}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove completion picture"
                disabled={pictureActionDisabled}
                onPress={handleRemovePicture}
                style={({ pressed }) => [
                  styles.removePictureButton,
                  pictureActionDisabled &&
                    styles.disabledButton,
                  pressed &&
                    !pictureActionDisabled &&
                    styles.pressedButton,
                ]}
              >
                <Text
                  style={
                    styles.removePictureButtonText
                  }
                >
                  {isRemovingPicture
                    ? "Removing Picture..."
                    : "Remove Picture"}
                </Text>
              </Pressable>
            </>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              recipe.completionImageUri
                ? "Replace completion picture"
                : "Share a completion picture"
            }
            disabled={pictureActionDisabled}
            onPress={handleSharePicture}
            style={({ pressed }) => [
              styles.primaryButton,
              pictureActionDisabled &&
                styles.disabledButton,
              pressed &&
                !pictureActionDisabled &&
                styles.pressedButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isSavingPicture
                ? "Saving Picture..."
                : recipe.completionImageUri
                  ? "Replace Picture"
                  : "Share a Picture"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete recipe"
          onPress={handleDeleteRecipe}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.deleteButtonText}>
            Delete Recipe
          </Text>
        </Pressable>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 58,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 90,
  },

  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.screenHorizontal,
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

  headerCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
  },

  iconContainer: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.xl,
    backgroundColor: colors.backgroundSoft,
  },

  recipeIcon: {
    width: 72,
    height: 72,
  },

  title: {
    color: colors.border,
    fontFamily: fontFamilies.title,
    fontSize: fontSizes.screenTitle,
    lineHeight: lineHeights.screenTitle,
    textAlign: "center",
  },

  summaryBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.round,
    backgroundColor: colors.backgroundSoft,
  },

  recipeSummary: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.medium,
    textAlign: "center",
  },

  editButton: {
    height: sizes.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderRadius: radius.lg,
    backgroundColor: colors.cardBackground,
  },

  editButtonText: {
    color: colors.primaryDark,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.bold,
  },

  sectionCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
  },

  sectionTitle: {
    marginBottom: spacing.lg,
    color: colors.border,
    fontFamily: fontFamilies.title,
    fontSize: fontSizes.sectionTitle,
    lineHeight: lineHeights.sectionTitle,
  },

  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },

  ingredientBullet: {
    width: 9,
    height: 9,
    marginTop: 7,
    marginRight: spacing.md,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
  },

  ingredientText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },

  stepNumber: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
  },

  stepNumberText: {
    color: colors.primaryDark,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.bold,
  },

  stepText: {
    flex: 1,
    paddingTop: 5,
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
  },

  finishedSection: {
    alignItems: "center",
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
  },

  finishedTitle: {
    color: colors.border,
    fontFamily: fontFamilies.title,
    fontSize: fontSizes.sectionTitle,
    lineHeight: lineHeights.sectionTitle,
    textAlign: "center",
  },

  finishedMessage: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
    textAlign: "center",
  },

  completionImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },

  primaryButton: {
    width: "100%",
    minHeight: sizes.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
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

  removePictureButton: {
    width: "100%",
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerSoft,
  },

  removePictureButtonText: {
    color: colors.danger,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.semibold,
  },

  disabledButton: {
    opacity: 0.55,
  },

  pressedButton: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: sizes.buttonHeight,
    marginTop: spacing.xl,
    borderWidth: 2,
    borderColor: colors.danger,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerSoft,
  },

  deleteButtonText: {
    color: colors.danger,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.semibold,
  },
});