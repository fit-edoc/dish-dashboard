'use client';

import React, { useState } from 'react';
import { IconSalad, IconAlertCircle } from '@tabler/icons-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageWithFallback({ src, alt, className = '' }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 p-4 border border-dashed border-zinc-300 dark:border-zinc-700 ${className}`}
      >
        <IconSalad className="w-10 h-10 mb-1 opacity-50 stroke-[1.5]" />
        <span className="text-xs font-medium text-zinc-500">Image unavailable</span>
        <span className="text-[10px] text-zinc-400 truncate max-w-[180px]">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 animate-pulse">
          <IconSalad className="w-8 h-8 text-zinc-300 dark:text-zinc-600 animate-bounce" />
        </div>
      )}
      {/* Standard HTML img to avoid external Next.js domain whitelist restriction */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
