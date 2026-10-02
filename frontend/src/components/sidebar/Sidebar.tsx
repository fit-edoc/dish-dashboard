'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFilterStatus } from '@/store/dishSlice';
import {
  IconToolsKitchen2,
  IconLayoutGrid,
  IconChecklist,
  IconFilePencil,
  IconAlertCircle,
  IconLockCheck,
  IconServer,
} from '@tabler/icons-react';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const { items, drafts, filterStatus } = useAppSelector((state) => state.dishes);

  const totalCount = items.length;
  const publishedCount = items.filter((d) => d.isPublished).length;
  const draftCount = totalCount - publishedCount;
  const unsavedCount = Object.values(drafts).filter((d) => d.hasChanges).length;

  const navItems = [
    {
      id: 'all',
      label: 'All Dishes',
      icon: IconLayoutGrid,
      count: totalCount,
    },
    {
      id: 'published',
      label: 'Published Menu',
      icon: IconChecklist,
      count: publishedCount,
      color: 'text-emerald-600',
    },
    {
      id: 'draft',
      label: 'Draft Dishes',
      icon: IconFilePencil,
      count: draftCount,
    },
    {
      id: 'unsaved',
      label: 'Unsaved Edits',
      icon: IconAlertCircle,
      count: unsavedCount,
      badgeColor: 'bg-amber-500 text-white',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-zinc-200 flex flex-col justify-between p-5 min-h-screen text-black">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
            <IconToolsKitchen2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-black">
              Nosh Dishes
            </h1>
            <p className="text-xs font-medium text-zinc-500">
              Dashboard & OCC Safe
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1.5">
          <div className="px-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = filterStatus === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => dispatch(setFilterStatus(item.id as any))}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.color || ''}`} />
                    {item.label}
                  </span>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System & Architecture Info Card */}
        
      </div>

      {/* Footer Info */}
      {/* <div className="pt-4 border-t border-zinc-200 text-xs text-zinc-500 flex items-center justify-between">
        <span>Nosh Assignment</span>
        <span className="font-mono text-xs bg-zinc-100 text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded-md">
          v1.0.0
        </span>
      </div> */}
    </aside>
  );
}
