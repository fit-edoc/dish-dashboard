export interface Dish {
  dishId: string;
  dishName: string;
  imageUrl: string;
  isPublished: boolean;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DishDraft {
  dishName: string;
  isPublished: boolean;
  expectedVersion: number;
  hasChanges: boolean;
  isSaving: boolean;
  error: string | null;
  conflict: {
    isConflict: boolean;
    currentDish?: Dish;
    currentVersion?: number;
    message?: string;
  } | null;
  hasExternalUpdate?: boolean;
}
