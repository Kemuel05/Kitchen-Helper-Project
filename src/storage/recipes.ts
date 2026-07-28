import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";

import type { NewRecipe, Recipe } from "../types/recipe";

const RECIPES_STORAGE_KEY = "food-valley-recipes";

const COMPLETION_IMAGES_DIRECTORY = new Directory(
  Paths.document,
  "recipe-completion-images"
);

// Saves the complete recipe array.
async function saveRecipes(recipes: Recipe[]): Promise<void> {
  await AsyncStorage.setItem(
    RECIPES_STORAGE_KEY,
    JSON.stringify(recipes)
  );
}

// Gets the image extension from its URI.
function getImageExtension(imageUri: string): string {
  const uriWithoutQuery = imageUri.split("?")[0];
  const extensionMatch = uriWithoutQuery.match(
    /\.([a-zA-Z0-9]+)$/
  );

  return extensionMatch?.[1]?.toLowerCase() ?? "jpg";
}

// Deletes a locally stored completion image.
function deleteStoredImage(imageUri?: string): void {
  if (!imageUri) {
    return;
  }

  try {
    const imageFile = new File(imageUri);

    if (imageFile.exists) {
      imageFile.delete();
    }
  } catch (error) {
    console.warn("Unable to delete stored image:", error);
  }
}

// Copies a temporary selected image into permanent app storage.
function copyImageToPermanentStorage(
  recipeId: string,
  temporaryImageUri: string
): string {
  COMPLETION_IMAGES_DIRECTORY.create({
    idempotent: true,
    intermediates: true,
  });

  const sourceFile = new File(temporaryImageUri);

  if (!sourceFile.exists) {
    throw new Error("The selected image could not be found.");
  }

  const extension = getImageExtension(temporaryImageUri);

  const destinationFile = new File(
    COMPLETION_IMAGES_DIRECTORY,
    `${recipeId}-${Date.now()}.${extension}`
  );

  sourceFile.copy(destinationFile);

  return destinationFile.uri;
}

// Loads every saved recipe.
export async function getRecipes(): Promise<Recipe[]> {
  try {
    const storedRecipes = await AsyncStorage.getItem(
      RECIPES_STORAGE_KEY
    );

    if (!storedRecipes) {
      return [];
    }

    return JSON.parse(storedRecipes) as Recipe[];
  } catch (error) {
    console.error("Unable to load recipes:", error);
    return [];
  }
}

// Creates and saves a new recipe.
export async function addRecipe(
  recipeData: NewRecipe
): Promise<Recipe> {
  try {
    const currentRecipes = await getRecipes();

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: recipeData.name,
      ingredients: recipeData.ingredients,
      steps: recipeData.steps,
      iconKey: recipeData.iconKey,
      createdAt: new Date().toISOString(),
    };

    const updatedRecipes = [
      newRecipe,
      ...currentRecipes,
    ];

    await saveRecipes(updatedRecipes);

    return newRecipe;
  } catch (error) {
    console.error("Unable to add recipe:", error);
    throw error;
  }
}

// Finds one recipe using its unique ID.
export async function getRecipeById(
  recipeId: string
): Promise<Recipe | undefined> {
  const recipes = await getRecipes();

  return recipes.find(
    (recipe) => recipe.id === recipeId
  );
}


// Updates an existing recipe while preserving its ID and completion data.
export async function updateRecipe(
  recipeId: string,
  recipeData: NewRecipe
): Promise<Recipe> {
  try {
    const currentRecipes = await getRecipes();

    const recipeIndex = currentRecipes.findIndex(
      (recipe) => recipe.id === recipeId
    );

    if (recipeIndex === -1) {
      throw new Error("Recipe not found.");
    }

    const originalRecipe = currentRecipes[recipeIndex];

    const updatedRecipe: Recipe = {
      ...originalRecipe,
      name: recipeData.name,
      ingredients: recipeData.ingredients,
      steps: recipeData.steps,
      iconKey: recipeData.iconKey,
    };

    const updatedRecipes = [...currentRecipes];
    updatedRecipes[recipeIndex] = updatedRecipe;

    await saveRecipes(updatedRecipes);

    return updatedRecipe;
  } catch (error) {
    console.error("Unable to update recipe:", error);
    throw error;
  }
}


// Saves a finished-food picture and marks the recipe as completed.
export async function completeRecipeWithImage(
  recipeId: string,
  temporaryImageUri: string
): Promise<Recipe> {
  const currentRecipes = await getRecipes();

  const recipeIndex = currentRecipes.findIndex(
    (recipe) => recipe.id === recipeId
  );

  if (recipeIndex === -1) {
    throw new Error("Recipe not found.");
  }

  const originalRecipe = currentRecipes[recipeIndex];

  const permanentImageUri =
    copyImageToPermanentStorage(
      recipeId,
      temporaryImageUri
    );

  const completedRecipe: Recipe = {
    ...originalRecipe,
    completionImageUri: permanentImageUri,
    completedAt: new Date().toISOString(),
  };

  const updatedRecipes = [...currentRecipes];
  updatedRecipes[recipeIndex] = completedRecipe;

  try {
    await saveRecipes(updatedRecipes);

    if (
      originalRecipe.completionImageUri &&
      originalRecipe.completionImageUri !== permanentImageUri
    ) {
      deleteStoredImage(
        originalRecipe.completionImageUri
      );
    }

    return completedRecipe;
  } catch (error) {
    // Remove the newly copied image if saving the recipe fails.
    deleteStoredImage(permanentImageUri);
    throw error;
  }
}

// Removes the finished-food picture from a recipe.
export async function removeCompletionPicture(
  recipeId: string
): Promise<Recipe> {
  try {
    const currentRecipes = await getRecipes();

    const recipeIndex = currentRecipes.findIndex(
      (recipe) => recipe.id === recipeId
    );

    if (recipeIndex === -1) {
      throw new Error("Recipe not found.");
    }

    const originalRecipe = currentRecipes[recipeIndex];

    const updatedRecipe: Recipe = {
      ...originalRecipe,
      completionImageUri: undefined,
      completedAt: undefined,
    };

    const updatedRecipes = [...currentRecipes];
    updatedRecipes[recipeIndex] = updatedRecipe;

    await saveRecipes(updatedRecipes);

    deleteStoredImage(
      originalRecipe.completionImageUri
    );

    return updatedRecipe;
  } catch (error) {
    console.error(
      "Unable to remove completion picture:",
      error
    );

    throw error;
  }
}

// Deletes one recipe using its unique ID.
export async function deleteRecipe(
  recipeId: string
): Promise<void> {
  try {
    const currentRecipes = await getRecipes();

    const recipeToDelete = currentRecipes.find(
      (recipe) => recipe.id === recipeId
    );

    const updatedRecipes = currentRecipes.filter(
      (recipe) => recipe.id !== recipeId
    );

    await saveRecipes(updatedRecipes);

    deleteStoredImage(
      recipeToDelete?.completionImageUri
    );
  } catch (error) {
    console.error("Unable to delete recipe:", error);
    throw error;
  }
}

// Deletes every saved recipe and its completion images.
export async function clearRecipes(): Promise<void> {
  try {
    const currentRecipes = await getRecipes();

    await AsyncStorage.removeItem(
      RECIPES_STORAGE_KEY
    );

    currentRecipes.forEach((recipe) => {
      deleteStoredImage(
        recipe.completionImageUri
      );
    });
  } catch (error) {
    console.error("Unable to clear recipes:", error);
    throw error;
  }
}