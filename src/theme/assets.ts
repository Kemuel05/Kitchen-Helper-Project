export const appAssets = {
  fonts: {
    title: require(
      "../../assets/fonts/stardew-valley-regular.ttf"
    ),
  },

  branding: {
    titleLogo: require(
      "../../assets/images/branding/title-logo.png"
    ),
  },

  backgrounds: {
    welcome: require(
      "../../assets/images/backgrounds/welcome-background.png"
    ),

    app: require(
      "../../assets/images/backgrounds/app-background.jpg"
    ),
  },

  recipeIcons: {
    broccoli: require(
      "../../assets/images/recipe-icons/broccoli.png"
    ),

    burger: require(
      "../../assets/images/recipe-icons/burger.png"
    ),

    cake: require(
      "../../assets/images/recipe-icons/cake.png"
    ),

    pancake: require(
      "../../assets/images/recipe-icons/pancake.png"
    ),

    star: require(
      "../../assets/images/recipe-icons/star.png"
    ),
  },
} as const;

export type RecipeIconAssetKey =
  keyof typeof appAssets.recipeIcons;