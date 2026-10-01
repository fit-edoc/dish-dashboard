'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDishes } from '@/store/dishSlice';
import DishCard from './DishCard';
import {
  IconSalad,
  IconAlertTriangle,
  IconRefresh,
} from '@tabler/icons-react';

export default function DishGrid() {
  const dispatch = useAppDispatch();
  const {
    items,
    drafts,
    isLoading,
    isInitialLoaded,
    error,
    searchQuery,
    filterStatus,
  } = useAppSelector((state) => state.dishes);

  // Filter logic
  const filteredDishes = items.filter((dish) => {
    // 1. Search Query filter (matches dishName or dishId)
    const query = searchQuery.toLowerCase().trim();
    const draft = drafts[dish.dishId];
    const effectiveName = (draft ? draft.dishName : dish.dishName).toLowerCase();
    const matchesSearch =
      query === '' ||
      effectiveName.includes(query) ||
      dish.dishId.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // 2. Status filter
    if (filterStatus === 'published') {
      return dish.isPublished;
    }
    if (filterStatus === 'draft') {
      return !dish.isPublished;
    }
    if (filterStatus === 'unsaved') {
      return draft?.hasChanges;
    }

    return true;
  });

  // Initial Loading Skeleton State
  if (isLoading && !isInitialLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-zinc-50 border border-zinc-200 h-96 animate-pulse p-5 space-y-4"
          >
            <div className="h-44 bg-zinc-200 rounded-xl" />
            <div className="h-4 bg-zinc-200 rounded w-2/3" />
            <div className="h-9 bg-zinc-200 rounded-xl" />
            <div className="h-10 bg-zinc-200 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  // Error State (e.g. backend offline)
  if (error && !isInitialLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-red-300 shadow-sm max-w-lg mx-auto mt-12 text-black">
        <div className="p-3 bg-red-100 text-red-600 rounded-2xl mb-4">
          <IconAlertTriangle className="w-8 h-8 stroke-[2]" />
        </div>
        <h3 className="text-lg font-bold text-black mb-1">
          Failed to Load Dishes
        </h3>
        <p className="text-sm text-zinc-600 mb-6 max-w-sm">
          {error}. Ensure your backend server is running on port 3000.
        </p>
        <button
          onClick={() => dispatch(fetchDishes({ isBackground: false }))}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black hover:bg-zinc-800 rounded-xl shadow-xs transition-colors"
        >
          <IconRefresh className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  // Empty State (no items found)
  if (filteredDishes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-300 max-w-md mx-auto mt-12 text-black">
        <div className="p-3 bg-zinc-100 text-zinc-400 rounded-2xl mb-3">
          <IconSalad className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="text-base font-bold text-black mb-1">
          No Dishes Found
        </h3>
        <p className="text-sm text-zinc-600">
          {searchQuery
            ? `No dishes matching "${searchQuery}". Try a different keyword.`
            : `No dishes currently match the "${filterStatus}" filter.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredDishes.map((dish) => (
        <DishCard
          key={dish.dishId}
          dish={dish}
          draft={drafts[dish.dishId]}
        />
      ))}
    </div>
  );
}
