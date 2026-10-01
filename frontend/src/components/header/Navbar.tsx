'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSearchQuery,
  setFilterStatus,
  togglePolling,
  fetchDishes,
} from '@/store/dishSlice';
import {
  IconSearch,
  IconX,
  IconRefresh,
  IconWifiOff,
} from '@tabler/icons-react';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const {
    items,
    drafts,
    searchQuery,
    filterStatus,
    isPolling,
    isLoading,
  } = useAppSelector((state) => state.dishes);

  // Count active unsaved drafts
  const unsavedCount = Object.values(drafts).filter((d) => d.hasChanges).length;
  const publishedCount = items.filter((d) => d.isPublished).length;
  const unpublishedCount = items.length - publishedCount;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 px-6 py-3.5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search by dish name or ID..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-zinc-50 rounded-xl border border-zinc-300 focus:border-black focus:bg-white text-black placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => dispatch(setSearchQuery(''))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters & Actions Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Pills */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs">
            <button
              onClick={() => dispatch(setFilterStatus('all'))}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-200'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => dispatch(setFilterStatus('published'))}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === 'published'
                  ? 'bg-black text-emerald-300 shadow-xs'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-200'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              onClick={() => dispatch(setFilterStatus('draft'))}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === 'draft'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-200'
              }`}
            >
              Drafts ({unpublishedCount})
            </button>
            <button
              onClick={() => dispatch(setFilterStatus('unsaved'))}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                filterStatus === 'unsaved'
                  ? 'bg-black text-amber-300 shadow-xs'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-200'
              }`}
            >
              Unsaved
              {unsavedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                  {unsavedCount}
                </span>
              )}
            </button>
          </div>

          {/* Real-time Sync Status / Toggle */}
          <button
            type="button"
            onClick={() => dispatch(togglePolling())}
            title={isPolling ? 'Live Sync Active (Polling every 5s)' : 'Live Sync Paused'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isPolling
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-zinc-100 text-zinc-600 border-zinc-300'
            }`}
          >
            {isPolling ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Sync Active</span>
              </>
            ) : (
              <>
                <IconWifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sync Paused</span>
              </>
            )}
          </button>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={() => dispatch(fetchDishes({ isBackground: false }))}
            disabled={isLoading}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-black rounded-xl transition-colors border border-zinc-300 disabled:opacity-50"
            title="Refresh All Dishes"
          >
            <IconRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin text-black' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
