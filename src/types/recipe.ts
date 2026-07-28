export type Recipe = {
  id: string;
  name: string;
  ingredients: string[];
  steps: string[];
  iconKey: string;
  completionImageUri?: string;
  createdAt: string;
  completedAt?: string;
};

export type NewRecipe = {
  name: string;
  ingredients: string[];
  steps: string[];
  iconKey: string;
};