import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Dish, DishDraft } from '@/types/dish';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface DishState {
  items: Dish[];
  drafts: Record<string, DishDraft>;
  isLoading: boolean;
  isInitialLoaded: boolean;
  error: string | null;
  isPolling: boolean;
  lastSyncedAt: string | null;
  searchQuery: string;
  filterStatus: 'all' | 'published' | 'draft' | 'unsaved';
}

const initialState: DishState = {
  items: [],
  drafts: {},
  isLoading: false,
  isInitialLoaded: false,
  error: null,
  isPolling: true,
  lastSyncedAt: null,
  searchQuery: '',
  filterStatus: 'all',
};

// Async thunk to fetch all dishes
export const fetchDishes = createAsyncThunk(
  'dishes/fetchDishes',
  async ({ isBackground = false }: { isBackground?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dishes`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.error || `Failed to fetch dishes: ${response.status}`);
      }
      const data = await response.json();
      return { dishes: data.dishes || [], isBackground };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error: Backend server unavailable');
    }
  }
);

// Async thunk to save a single dish draft with Optimistic Concurrency Control
export const saveDish = createAsyncThunk(
  'dishes/saveDish',
  async (dishId: string, { getState, rejectWithValue }) => {
    const state = (getState() as { dishes: DishState }).dishes;
    const draft = state.drafts[dishId];

    if (!draft) {
      return rejectWithValue({ dishId, error: 'Draft not found' });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/dishes/${dishId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dishName: draft.dishName,
          isPublished: draft.isPublished,
          expectedVersion: draft.expectedVersion,
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.status === 200) {
        return {
          dishId,
          dish: responseData.dish || responseData,
        };
      }

      if (response.status === 409) {
        return rejectWithValue({
          dishId,
          isConflict: true,
          error: responseData.error || 'Conflict: Dish has been modified by another update',
          currentDish: responseData.currentDish,
          currentVersion: responseData.currentVersion,
        });
      }

      // 400 Bad Request or other errors
      return rejectWithValue({
        dishId,
        isConflict: false,
        error: responseData.error || (responseData.details ? responseData.details.join(', ') : 'Failed to update dish'),
      });
    } catch (err: any) {
      return rejectWithValue({
        dishId,
        isConflict: false,
        error: err.message || 'Network error: Could not reach backend server',
      });
    }
  }
);

export const dishSlice = createSlice({
  name: 'dishes',
  initialState,
  reducers: {
    updateDraftField: (
      state,
      action: PayloadAction<{ dishId: string; field: 'dishName' | 'isPublished'; value: any }>
    ) => {
      const { dishId, field, value } = action.payload;
      const draft = state.drafts[dishId];
      const savedDish = state.items.find((d) => d.dishId === dishId);

      if (!draft || !savedDish) return;

      if (field === 'dishName') {
        draft.dishName = value;
      } else if (field === 'isPublished') {
        draft.isPublished = value;
      }

      // Clear previous validation error when user modifies field
      draft.error = null;

      // Calculate if draft currently has changes compared to saved version
      const nameChanged = draft.dishName.trim() !== savedDish.dishName.trim();
      const statusChanged = draft.isPublished !== savedDish.isPublished;
      draft.hasChanges = nameChanged || statusChanged;
    },

    discardDraft: (state, action: PayloadAction<string>) => {
      const dishId = action.payload;
      const savedDish = state.items.find((d) => d.dishId === dishId);

      if (savedDish) {
        state.drafts[dishId] = {
          dishName: savedDish.dishName,
          isPublished: savedDish.isPublished,
          expectedVersion: savedDish.version,
          hasChanges: false,
          isSaving: false,
          error: null,
          conflict: null,
          hasExternalUpdate: false,
        };
      }
    },

    acceptServerVersion: (state, action: PayloadAction<{ dishId: string; newDish?: Dish }>) => {
      const { dishId, newDish } = action.payload;
      const targetDish = newDish || state.items.find((d) => d.dishId === dishId);

      if (targetDish) {
        // Update stored item if newer
        const index = state.items.findIndex((d) => d.dishId === dishId);
        if (index !== -1) {
          state.items[index] = targetDish;
        }

        // Reset draft to match latest server state
        state.drafts[dishId] = {
          dishName: targetDish.dishName,
          isPublished: targetDish.isPublished,
          expectedVersion: targetDish.version,
          hasChanges: false,
          isSaving: false,
          error: null,
          conflict: null,
          hasExternalUpdate: false,
        };
      }
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setFilterStatus: (state, action: PayloadAction<'all' | 'published' | 'draft' | 'unsaved'>) => {
      state.filterStatus = action.payload;
    },

    togglePolling: (state) => {
      state.isPolling = !state.isPolling;
    },
  },
  extraReducers: (builder) => {
    // fetchDishes
    builder.addCase(fetchDishes.pending, (state, action) => {
      if (!action.meta.arg?.isBackground) {
        state.isLoading = true;
      }
      state.error = null;
    });

    builder.addCase(fetchDishes.fulfilled, (state, action) => {
      const { dishes, isBackground } = action.payload;
      state.isLoading = false;
      state.isInitialLoaded = true;
      state.lastSyncedAt = new Date().toLocaleTimeString();

      // Synchronize dishes list
      state.items = dishes;

      // Handle drafts for each dish
      dishes.forEach((dish: Dish) => {
        const existingDraft = state.drafts[dish.dishId];

        if (!existingDraft) {
          // Initialize fresh draft
          state.drafts[dish.dishId] = {
            dishName: dish.dishName,
            isPublished: dish.isPublished,
            expectedVersion: dish.version,
            hasChanges: false,
            isSaving: false,
            error: null,
            conflict: null,
            hasExternalUpdate: false,
          };
        } else if (existingDraft.hasChanges) {
          // PRESERVE DRAFT: if user has unsaved changes, do NOT overwrite their draft!
          // Indicate if newer saved data exists on server
          if (dish.version > existingDraft.expectedVersion) {
            existingDraft.hasExternalUpdate = true;
          }
        } else {
          // No unsaved changes: safely update draft to match newer server state
          state.drafts[dish.dishId] = {
            dishName: dish.dishName,
            isPublished: dish.isPublished,
            expectedVersion: dish.version,
            hasChanges: false,
            isSaving: false,
            error: null,
            conflict: null,
            hasExternalUpdate: false,
          };
        }
      });
    });

    builder.addCase(fetchDishes.rejected, (state, action) => {
      state.isLoading = false;
      if (!action.meta.arg?.isBackground) {
        state.error = (action.payload as string) || 'Could not load dishes';
      }
    });

    // saveDish
    builder.addCase(saveDish.pending, (state, action) => {
      const dishId = action.meta.arg;
      if (state.drafts[dishId]) {
        state.drafts[dishId].isSaving = true;
        state.drafts[dishId].error = null;
      }
    });

    builder.addCase(saveDish.fulfilled, (state, action) => {
      const { dishId, dish } = action.payload;

      // Update in items array
      const index = state.items.findIndex((d) => d.dishId === dishId);
      if (index !== -1) {
        state.items[index] = dish;
      } else {
        state.items.push(dish);
      }

      // Reset draft with newly saved values
      state.drafts[dishId] = {
        dishName: dish.dishName,
        isPublished: dish.isPublished,
        expectedVersion: dish.version,
        hasChanges: false,
        isSaving: false,
        error: null,
        conflict: null,
        hasExternalUpdate: false,
      };
    });

    builder.addCase(saveDish.rejected, (state, action) => {
      const payload: any = action.payload;
      const dishId = action.meta.arg;

      if (state.drafts[dishId]) {
        state.drafts[dishId].isSaving = false;

        if (payload?.isConflict) {
          // 409 Conflict: preserve user's draft, explain conflict, offer reload action
          state.drafts[dishId].conflict = {
            isConflict: true,
            currentDish: payload.currentDish,
            currentVersion: payload.currentVersion,
            message: payload.error,
          };
          // Update item in background so user can inspect it
          if (payload.currentDish) {
            const index = state.items.findIndex((d) => d.dishId === dishId);
            if (index !== -1) {
              state.items[index] = payload.currentDish;
            }
          }
        } else {
          // Normal validation or network error: preserve draft, show error
          state.drafts[dishId].error = payload?.error || 'Failed to save changes. Please try again.';
        }
      }
    });
  },
});

export const {
  updateDraftField,
  discardDraft,
  acceptServerVersion,
  setSearchQuery,
  setFilterStatus,
  togglePolling,
} = dishSlice.actions;

export default dishSlice.reducer;
