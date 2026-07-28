import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
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
import { getRecipes } from "../../storage/recipes";
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

export default function CompletedRecipesScreen() {
  const router = useRouter();

  const [completedRecipes, setCompletedRecipes] =
    useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCompletedRecipes = useCallback(async () => {
    setIsLoading(true);

    try {
      const savedRecipes = await getRecipes();

      const finishedRecipes = savedRecipes
        .filter((recipe) =>
          Boolean(recipe.completionImageUri)
        )
        .sort((firstRecipe, secondRecipe) => {
          const firstDate =
            firstRecipe.completedAt ?? "";
          const secondDate =
            secondRecipe.completedAt ?? "";

          return secondDate.localeCompare(firstDate);
        });

      setCompletedRecipes(finishedRecipes);
    } catch (error) {
      console.error(
        "Unable to load completed recipes:",
        error
      );

      Alert.alert(
        "Unable to load completed recipes",
        "Something went wrong while loading your finished dishes."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCompletedRecipes();
    }, [loadCompletedRecipes])
  );

  function openRecipe(recipeId: string): void {
    router.push({
      pathname: "/recipe/[id]",
      params: {
        id: recipeId,
      },
    });
  }

  function formatCompletedDate(
    date?: string
  ): string {
    if (!date) {
      return "Completed recipe";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  function renderCompletedRecipe({
    item,
  }: {
    item: Recipe;
  }) {
    if (!item.completionImageUri) {
      return null;
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open completed recipe ${item.name}`}
        onPress={() => openRecipe(item.id)}
        style={({ pressed }) => [
          styles.recipeCard,
          pressed && styles.pressedCard,
        ]}
      >
        <Image
          source={{
            uri: item.completionImageUri,
          }}
          resizeMode="cover"
          style={styles.recipeImage}
        />

        <View style={styles.recipeInformation}>
          <Text
            numberOfLines={2}
            style={styles.recipeName}
          >
            {item.name}
          </Text>

          <View style={styles.dateBadge}>
            <Text style={styles.completedDate}>
              {formatCompletedDate(
                item.completedAt
              )}
            </Text>
          </View>

          <View style={styles.openRow}>
            <Text style={styles.openMessage}>
              Tap to view the recipe
            </Text>

            <Text style={styles.arrow}>›</Text>
          </View>
        </View>
      </Pressable>
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
            Loading completed recipes...
          </Text>
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground variant="app">
      <FlatList
        data={completedRecipes}
        keyExtractor={(recipe) => recipe.id}
        renderItem={renderCompletedRecipe}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          completedRecipes.length === 0 &&
            styles.emptyContainer,
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>
              Completed Recipes
            </Text>

            {completedRecipes.length > 0 ? (
              <View style={styles.subtitleBadge}>
                <Text style={styles.subtitle}>
                  {completedRecipes.length === 1
                    ? "1 delicious creation"
                    : `${completedRecipes.length} delicious creations`}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Image
              source={appAssets.recipeIcons.star}
              resizeMode="contain"
              style={styles.emptyIcon}
            />

            <Text style={styles.emptyTitle}>
              No completed recipes yet
            </Text>

            <Text style={styles.emptyMessage}>
              Open a recipe and share a picture
              of the finished dish to see it
              here.
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
    paddingHorizontal:
      spacing.screenHorizontal,
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
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
    overflow: "hidden",
  },

  pressedCard: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },

  recipeImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: colors.surfaceMuted,
  },

  recipeInformation: {
    padding: spacing.lg,
  },

  recipeName: {
    color: colors.textPrimary,
    fontSize: fontSizes.sectionTitle,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sectionTitle,
  },

  dateBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.round,
    backgroundColor: colors.backgroundSoft,
  },

  completedDate: {
    color: colors.textSecondary,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.medium,
  },

  openRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },

  openMessage: {
    color: colors.primaryDark,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.semibold,
  },

  arrow: {
    color: colors.primaryDark,
    fontSize: 28,
    lineHeight: 28,
  },

  emptyContainer: {
    flexGrow: 1,
  },

  emptyContent: {
    alignItems: "center",
    marginTop: spacing.xxxl,
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