'use client';

import React from 'react';
import { useAppDispatch } from '@/store/hooks';
import { acceptServerVersion } from '@/store/dishSlice';
import { Dish, DishDraft } from '@/types/dish';
import {
  IconAlertTriangle,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';

interface ConflictModalProps {
  dishId: string;
  savedDish?: Dish;
  draft: DishDraft;
  onClose: () => void;
}

export default function ConflictModal({
  dishId,
  savedDish,
  draft,
  onClose,
}: ConflictModalProps) {
  const dispatch = useAppDispatch();
  const conflict = draft.conflict;

  if (!conflict || !conflict.isConflict) return null;

  const serverDish = conflict.currentDish || savedDish;
  const serverVersion = conflict.currentVersion || serverDish?.version || draft.expectedVersion + 1;

  const handleReloadServer = () => {
    dispatch(acceptServerVersion({ dishId, newDish: serverDish }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-300 overflow-hidden text-black">
        {/* Header */}
        <div className="p-6 bg-amber-50 border-b border-amber-200 flex items-start gap-4">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
            <IconAlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-black flex items-center gap-2">
              Update Conflict Detected (409)
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                {dishId}
              </span>
            </h3>
            <p className="text-sm text-zinc-700 mt-1 leading-relaxed">
              Another user or browser session updated this dish while you were editing. Your draft has been preserved, but you cannot overwrite the newer version directly.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-black p-1 rounded-lg"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Body */}
        <div className="p-6 space-y-4 bg-white">
          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-zinc-600 uppercase tracking-wider">
            <div>Your Local Draft</div>
            <div>Current Database State (v{serverVersion})</div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-sm">
            {/* Local draft side */}
            <div className="space-y-3 pr-2 border-r border-zinc-200">
              <div>
                <span className="text-xs text-zinc-500 font-semibold block mb-0.5">Dish Name</span>
                <span className="font-bold text-black">
                  {draft.dishName}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-semibold block mb-0.5">Status</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    draft.isPublished
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-zinc-200 text-zinc-800'
                  }`}
                >
                  {draft.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-semibold block mb-0.5">Original Version</span>
                <span className="font-mono text-xs font-bold text-zinc-700">
                  v{draft.expectedVersion}
                </span>
              </div>
            </div>

            {/* Server state side */}
            <div className="space-y-3 pl-2">
              <div>
                <span className="text-xs text-zinc-500 font-semibold block mb-0.5">Dish Name</span>
                <span className="font-bold text-black">
                  {serverDish?.dishName || '(Unknown)'}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-semibold block mb-0.5">Status</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    serverDish?.isPublished
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-zinc-200 text-zinc-800'
                  }`}
                >
                  {serverDish?.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-semibold block mb-0.5">Current Version</span>
                <span className="font-mono text-xs font-bold text-amber-700">
                  v{serverVersion}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
            <IconAlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>
              <strong>Warning:</strong> Choosing &quot;Reload Latest (Discard Draft)&quot; will discard your unsaved local draft.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 rounded-xl transition-colors"
          >
            Keep Editing Draft
          </button>
          <button
            type="button"
            onClick={handleReloadServer}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <IconRefresh className="w-4 h-4" />
            Reload Latest (Discard Draft)
          </button>
        </div>
      </div>
    </div>
  );
}
