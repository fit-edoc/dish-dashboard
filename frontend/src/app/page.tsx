'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import Navbar from '@/components/header/Navbar';
import DishGrid from '@/components/dish/DishGrid';
import { useDishSync } from '@/hooks/useDishSync';
import { useAppSelector } from '@/store/hooks';
import {
  IconMenu2,
  IconX,
} from '@tabler/icons-react';

export default function DashboardPage() {
  // Initialize background polling & sync
  useDishSync();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { drafts } = useAppSelector((state) => state.dishes);

  const unsavedCount = Object.values(drafts).filter((d) => d.hasChanges).length;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/40 backdrop-blur-xs">
          <div className="relative w-64 bg-white h-full shadow-2xl border-r border-zinc-200">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-600 hover:text-black"
            >
              <IconX className="w-5 h-5" />
            </button>
            <Sidebar />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Mobile Header Bar */}
        <div className="flex md:hidden items-center justify-between p-4 bg-white border-b border-zinc-200">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-zinc-100 text-black border border-zinc-200"
          >
            <IconMenu2 className="w-5 h-5" />
          </button>
          <span className="font-bold text-base text-black">
            Nosh Dish Manager
          </span>
          <div className="w-8" />
        </div>

        {/* Global Navbar */}
        <Navbar />

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 bg-white">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-black">
                Menu Items & Drafts
              </h2>
              
            </div>

            {/* Unsaved Edits Notification Badge */}
            {unsavedCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-semibold text-amber-900 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {unsavedCount} Unsaved {unsavedCount === 1 ? 'Dish Draft' : 'Dish Drafts'} Pending
              </div>
            )}
          </div>

          {/* Dish Grid Component */}
          <DishGrid />
        </main>
      </div>
    </div>
  );
}
