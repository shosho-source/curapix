// app/onboarding/GenreFormStep.tsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

const GENRES = ['Sci-Fi', 'Horror', 'Indie', 'Jazz', 'Documentary', 'Electronic'];

export default function GenreFormStep({ onNext }: { onNext: (genres: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (genre: string) => {
    setSelected(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black tracking-tighter">What are you into?</h2>
      <div className="grid grid-cols-2 gap-3">
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => toggle(g)}
            className={`p-4 rounded-xl border ${selected.includes(g) ? 'bg-[var(--theme-primary)] text-black' : 'bg-zinc-900 border-zinc-800'}`}
          >
            {g}
          </button>
        ))}
      </div>
      <button onClick={() => onNext(selected)} className="w-full py-4 bg-white text-black font-bold rounded-xl">Next</button>
    </div>
  );
}