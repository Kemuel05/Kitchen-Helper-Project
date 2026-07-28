import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import type { ImageSourcePropType } from "react-native";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppBackground } from "../../components/AppBackground";
import { deleteRecipe, getRecipes } from "../../storage/recipes";
import { appAssets } from "../../theme/assets";
import { colors } from "../../theme/colors";
import {
  radius,
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

export default function RecipesScreen() {
  const router = useRouter();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);

    try {
      const savedRecipes = await getRecipes();
      setRecipes(savedRecipes);
    } catch (error) {
      console.error("Unable to load recipes:", error);

      Alert.alert(
        "Unable to load recipes",
        "Something went wrong while loading your cookbook."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadRecipes();
    }, [loadRecipes])
  );

  function openRecipe(recipeId: string): void {
    router.push({
      pathname: "/recipe/[id]",
      params: {
        id: recipeId,
      },
    });
  }

  function handleDeleteRecipe(recipe: Recipe): void {
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
              await loadRecipes();
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

  function renderRecipe({
    item,
  }: {
    item: Recipe;
  }) {
    const recipeIcon =
      RECIPE_ICONS[item.iconKey] ??
      DEFAULT_RECIPE_ICON;

    return (
      <View style={styles.recipeCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.name}`}
          onPress={() => openRecipe(item.id)}
          style={({ pressed }) => [
            styles.recipeMainContent,
            pressed && styles.pressedRecipe,
          ]}
        >
          <View style={styles.recipeIconContainer}>
            <Image
              source={recipeIcon}
              resizeMode="contain"
              style={styles.recipeIcon}
            />
          </View>

          <View style={styles.recipeInformation}>
            <Text
              numberOfLines={2}
              style={styles.recipeName}
            >
              {item.name}
            </Text>

            <Text style={styles.recipeDetails}>
              {item.ingredients.length} ingredients ·{" "}
              {item.steps.length} steps
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.name}`}
          onPress={() => handleDeleteRecipe(item)}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
        >
          <Text style={styles.deleteButtonText}>
            ×
          </Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <AppBackground variant="app">
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primaryDark}
          />

          <Text style={styles.loadingText}>
            Loading recipes...
          </Text>
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground variant="app">
      <FlatList
        data={recipes}
        keyExtractor={(recipe) => recipe.id}
        renderItem={renderRecipe}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          recipes.length === 0 &&
            styles.emptyContainer,
        ]}
        ListHeaderComponent={
          recipes.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.title}>
                My Recipes
              </Text>

              <View style={styles.subtitleBadge}>
                <Text style={styles.subtitle}>
                  {recipes.length === 1
                    ? "1 recipe saved"
                    : `${recipes.length} recipes saved`}
                </Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Image
              source={appAssets.recipeIcons.star}
              resizeMode="contain"
              style={styles.emptyIcon}
            />

            <Text style={styles.emptyTitle}>
              Your cookbook is empty
            </Text>

            <Text style={styles.emptyMessage}>
              Visit the Add Recipe tab to save your
              first recipe.
            </Text>
          </View>
        }
      />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.screenTop,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.screenBottom,
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

  subtitleBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.round,
    backgroundColor: colors.cardBackground,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.medium,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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

  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.cardBackground,
    overflow: "hidden",
  },

  recipeMainContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },

  pressedRecipe: {
    opacity: 0.65,
  },

  recipeIconContainer: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundSoft,
  },

  recipeIcon: {
    width: 46,
    height: 46,
  },

  recipeInformation: {
    flex: 1,
  },

  recipeName: {
    color: colors.textPrimary,
    fontSize: fontSizes.subtitle,
    fontWeight: fontWeights.bold,
  },

  recipeDetails: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: fontSizes.small,
  },

  arrow: {
    marginLeft: spacing.sm,
    color: colors.primaryDark,
    fontSize: 30,
  },

  deleteButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },

  deleteButtonPressed: {
    opacity: 0.65,
  },

  deleteButtonText: {
    color: colors.danger,
    fontSize: 25,
    fontWeight: fontWeights.bold,
    lineHeight: 27,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContent: {
    alignItems: "center",
    marginHorizontal: spacing.sm,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
  },

  emptyIcon: {
    width: 76,
    height: 76,
  },

  emptyTitle: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSizes.sectionTitle,
    fontWeight: fontWeights.bold,
    textAlign: "center",
  },

  emptyMessage: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    textAlign: "center",
  },
});