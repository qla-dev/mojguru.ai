
export interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  calories: number;
  fat: string;
  carbs: string;
  protein: string;
  rating: number;
  reviews: number;
  ingredients: string[];
  directions: string[];
  category: string;
  isSaved?: boolean;
}

export interface UserProfile {
  name: string;
  level: number;
  points: number;
  avatar: string;
  posts: UserPost[];
}

export interface UserPost {
  id: string;
  image: string;
  title: string;
  likes: number;
  comments: number;
}

export interface MealPreferences {
  mealType: string;
  diet: string;
  difficulty: string;
  calorieRange: string;
}

export type ViewType = 'HOME' | 'SCAN' | 'FAVORITES' | 'PROFILE' | 'RECIPE_DETAIL';
