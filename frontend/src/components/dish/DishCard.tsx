'use client';

import React, { useState } from 'react';
import { Dish, DishDraft } from '@/types/dish';
import { useAppDispatch } from '@/store/hooks';
import { updateDraftField, discardDraft, saveDish, acceptServerVersion } from '@/store/dishSlice';
import ImageWithFallback from './ImageWithFallback';
import ConflictModal from './ConflictModal';
import {
  IconDeviceFloppy,
  IconArrowBackUp,
  IconAlertCircle,
  IconAlertTriangle,
  IconLoader2,
  IconRefresh,
  IconTag,
  IconVersions,
} from '@tabler/icons-react';

interface DishCardProps {
  dish: Dish;
  draft?: DishDraft;
}

export default function DishCard({ dish, draft }: DishCardProps) {
  const dispatch = useAppDispatch();
  const [showConflictModal, setShowConflictModal] = useState(false);

  // If draft is missing (uninitialized), use dish values as fallback
  const currentDraft: DishDraft = draft || {
    dishName: dish.dishName,
    isPublished: dish.isPublished,
    expectedVersion: dish.version,
    hasChanges: false,
    isSaving: false,
    error: null,
    conflict: null,
    hasExternalUpdate: false,
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      updateDraftField({
        dishId: dish.dishId,
        field: 'dishName',
        value: e.target.value,
      })
    );
  };

  const handlePublishedToggle = () => {
    dispatch(
      updateDraftField({
        dishId: dish.dishId,
        field: 'isPublished',
        value: !currentDraft.isPublished,
      })
    );
  };

  const handleSave = () => {
    if (!currentDraft.hasChanges || currentDraft.isSaving) return;
    dispatch(saveDish(dish.dishId));
  };

  const handleDiscard = () => {
    dispatch(discardDraft(dish.dishId));
  };

  return (
    <>
      <div
        className={`group relative flex flex-col rounded-2xl bg-white border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md text-black ${
          currentDraft.conflict?.isConflict
            ? 'border-amber-500 ring-2 ring-amber-500/30'
            : currentDraft.hasChanges
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-zinc-200'
        }`}
      >
        {/* Top Image & Status Overlays */}
        <div className="relative h-48 w-full bg-zinc-100 border-b border-zinc-200">
          <ImageWithFallback
            src={dish.imageUrl}
            alt={currentDraft.dishName}
            className="w-full h-full"
          />

          {/* Top Chips Row */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
            {/* Dish ID Chip */}
            <span className="pointer-events-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-black text-white shadow-sm border border-zinc-800">
              <IconTag className="w-3 h-3 text-zinc-300" />
              {dish.dishId}
            </span>

            {/* Version Badge */}
            <span
              className={`pointer-events-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold shadow-sm border ${
                currentDraft.hasChanges
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-zinc-900 text-white border-zinc-800'
              }`}
              title={`Original Loaded Version: v${currentDraft.expectedVersion}`}
            >
              <IconVersions className="w-3 h-3 text-zinc-300" />
              v{dish.version}
              {currentDraft.expectedVersion !== dish.version && (
                <span className="text-[10px] opacity-80">(draft on v{currentDraft.expectedVersion})</span>
              )}
            </span>
          </div>

          {/* Bottom Overlay Badges */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
            {/* Live Published Status Pill */}
            <span
              className={`pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border ${
                dish.isPublished
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-zinc-800 text-white border-zinc-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  dish.isPublished ? 'bg-emerald-300 animate-pulse' : 'bg-zinc-400'
                }`}
              />
              {dish.isPublished ? 'Live Published' : 'Unpublished'}
            </span>

            {/* Unsaved Changes Indicator */}
            {currentDraft.hasChanges && (
              <span className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md animate-in fade-in zoom-in-95 duration-150">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Unsaved Draft
              </span>
            )}
          </div>
        </div>

        {/* Card Content & Form Controls */}
        <div className="flex-1 p-5 flex flex-col justify-between space-y-4 bg-white">
          <div className="space-y-4">
            {/* External Update Notice if detected by background sync */}
            {currentDraft.hasExternalUpdate && !currentDraft.conflict?.isConflict && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-2 shadow-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <IconAlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  Newer version v{dish.version} available in DB!
                </span>
                <button
                  type="button"
                  onClick={() => dispatch(acceptServerVersion({ dishId: dish.dishId }))}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  Reload
                </button>
              </div>
            )}

            {/* Error Banner */}
            {currentDraft.error && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 flex items-start gap-2 animate-in fade-in duration-150 shadow-xs">
                <IconAlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="font-bold block mb-0.5">Save Failed</strong>
                  <span>{currentDraft.error}</span>
                </div>
              </div>
            )}

            {/* 409 Conflict Banner */}
            {currentDraft.conflict?.isConflict && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2.5 shadow-xs">
                <div className="flex items-start gap-2">
                  <IconAlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">
                    <strong>Version Conflict (409):</strong> Modified by another user.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConflictModal(true)}
                  className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <IconRefresh className="w-3.5 h-3.5" />
                  Resolve Conflict & View Diff
                </button>
              </div>
            )}

            {/* Editable Dish Name Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`dish-name-${dish.dishId}`}
                  className="text-xs font-bold text-black uppercase tracking-wider"
                >
                  Dish Name
                </label>
                {currentDraft.dishName !== dish.dishName && (
                  <span className="text-xs text-amber-600 font-bold">
                    (Edited)
                  </span>
                )}
              </div>
              <input
                id={`dish-name-${dish.dishId}`}
                type="text"
                value={currentDraft.dishName}
                onChange={handleNameChange}
                disabled={currentDraft.isSaving}
                className={`w-full px-3.5 py-2.5 text-base font-medium bg-white rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  currentDraft.dishName !== dish.dishName
                    ? 'border-indigo-500 ring-1 ring-indigo-500 text-black'
                    : 'border-zinc-300 text-black focus:border-black focus:ring-black'
                } disabled:opacity-50`}
                placeholder="Enter dish name"
              />
            </div>

            {/* Published Toggle Switch */}
            <div className="flex items-center justify-between bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
              <div>
                <span className="text-sm font-bold text-black block">
                  Publish to Menu
                </span>
                <span className="text-xs text-zinc-600">
                  {currentDraft.isPublished ? 'Visible to customers' : 'Hidden from customers'}
                  {currentDraft.isPublished !== dish.isPublished && (
                    <span className="text-amber-600 ml-1 font-bold">
                      (Pending Save)
                    </span>
                  )}
                </span>
              </div>

              {/* Explicit Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={currentDraft.isPublished}
                disabled={currentDraft.isSaving}
                onClick={handlePublishedToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                  currentDraft.isPublished ? 'bg-emerald-600' : 'bg-zinc-300'
                } disabled:opacity-50`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    currentDraft.isPublished ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons: Save & Discard */}
          <div className="pt-3 border-t border-zinc-200 flex items-center gap-2.5">
            <button
              type="button"
              disabled={!currentDraft.hasChanges || currentDraft.isSaving}
              onClick={handleSave}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                currentDraft.hasChanges
                  ? 'bg-black hover:bg-zinc-800 text-white focus:ring-black'
                  : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
              } disabled:opacity-50`}
            >
              {currentDraft.isSaving ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="w-4 h-4" />
                  Save Draft
                </>
              )}
            </button>

            {currentDraft.hasChanges && (
              <button
                type="button"
                disabled={currentDraft.isSaving}
                onClick={handleDiscard}
                title="Discard changes and restore last saved state"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 text-sm font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-xl transition-colors disabled:opacity-50"
              >
                <IconArrowBackUp className="w-4 h-4" />
                Discard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conflict Modal */}
      {showConflictModal && (
        <ConflictModal
          dishId={dish.dishId}
          savedDish={dish}
          draft={currentDraft}
          onClose={() => setShowConflictModal(false)}
        />
      )}
    </>
  );
}
