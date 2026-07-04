// components/CanvasSheet.tsx
"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
// 1. ADD THIS IMPORT:
import WhereToStream from './WhereToStream';

type Sticker = { id: number; type: string; x: number; y: number };

// 2. UPDATE PROPS to accept tmdbId
export default function CanvasSheet({ posterUrl, tmdbId }: { posterUrl: string; tmdbId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);

  const availableStickers = ['/fire.png', '/popcorn.png', '/heart.png'];

  const addSticker = (type: string) => {
    setStickers([...stickers, { id: Date.now(), type, x: 50, y: 50 }]);
  };

  const handleDragEnd = (id: number, event: any, info: any) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newX = ((info.point.x - rect.left) / rect.width) * 100;
    const newY = ((info.point.y - rect.top) / rect.height) * 100;

    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x: newX, y: newY } : s))
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* The Canvas */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-sm aspect-[2/3] rounded-[28px] overflow-hidden shadow-2xl bg-zinc-800 mb-6"
      >
        <img src={posterUrl} alt="Canvas Background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
        
        {/* Render Active Stickers */}
        {stickers.map((sticker) => (
          <motion.img
            key={sticker.id}
            src={sticker.type}
            className="absolute w-16 h-16 cursor-grab active:cursor-grabbing"
            style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, x: '-50%', y: '-50%' }}
            drag
            dragConstraints={containerRef}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={(e, info) => handleDragEnd(sticker.id, e, info)}
            whileTap={{ scale: 1.1 }}
            whileDrag={{ scale: 1.2 }}
          />
        ))}
      </div>

      {/* 3. ADD WHERE TO STREAM COMPONENT HERE */}
      <div className="w-full max-w-sm mb-6 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
        <WhereToStream tmdbId={tmdbId} />
      </div>

      {/* Sticker Tray */}
      <div className="flex gap-4 p-4 bg-zinc-800/50 rounded-full backdrop-blur-md border border-zinc-700">
        {availableStickers.map((src) => (
          <button 
            key={src} 
            onClick={() => addSticker(src)}
            className="w-12 h-12 bg-white/10 rounded-full p-2 hover:bg-white/20 transition"
          >
            <img src={src} alt="Sticker" className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}