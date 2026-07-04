// app/onboarding/ThemeSelectorStep.tsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ThemeSelectorStep({ onNext }: { onNext: (theme: any) => void }) {
  // Placeholder for the "extracted" colors
  const extractedThemes = [
    { primary: '#EAB308', surface: '#27272A', name: 'Amber Glow' },
    { primary: '#3B82F6', surface: '#1E293B', name: 'Ocean Deep' },
    { primary: '#EC4899', surface: '#4C1D95', name: 'Neon Vibe' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black tracking-tighter">Choose your aesthetic.</h2>
      <p className="text-zinc-400">We extracted these from your profile. Pick the one that fits your vibe.</p>

      <div className="grid grid-cols-1 gap-4">
        {extractedThemes.map((theme) => (
          <motion.button
            key={theme.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNext(theme)}
            className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-[var(--theme-primary)] transition-all"
          >
            <div 
              className="w-12 h-12 rounded-full" 
              style={{ backgroundColor: theme.primary }} 
            />
            <span className="font-bold">{theme.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}