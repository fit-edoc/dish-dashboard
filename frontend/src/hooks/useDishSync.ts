'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDishes } from '@/store/dishSlice';

/**
 * Custom hook to manage background polling synchronization (every 5 seconds)
 * Satisfies the external update requirement with safe draft preservation and timer cleanup.
 */
export function useDishSync() {
  const dispatch = useAppDispatch();
  const { isPolling } = useAppSelector((state) => state.dishes);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial fetch on mount
  useEffect(() => {
    dispatch(fetchDishes({ isBackground: false }));
  }, [dispatch]);

  // Polling loop
  useEffect(() => {
    if (!isPolling) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 5-second polling interval
    timerRef.current = setInterval(() => {
      dispatch(fetchDishes({ isBackground: true }));
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [dispatch, isPolling]);
}
