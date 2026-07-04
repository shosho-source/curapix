// components/SwipeDeck.tsx
"use client";

import { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Check, X, Eye } from 'lucide-react';
// 1. IMPORT YOUR NEW ACTION
import { saveMediaToCatalog } from '../app/actions/catalogActions'; 

interface CardData {
  id: string;
  title: string;
  image: string;
  type: string;
}


export default function SwipeDeck({ initialCards }: { initialCards: CardData[] }) {
  const [cards, setCards] = useState<CardData[]>(initialCards || []);
  const activeCard = cards[0];

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const rightOpacity = useTransform(x, [50, 150], [0, 1]); 
  const leftOpacity = useTransform(x, [-50, -150], [0, 1]); 
  const upOpacity = useTransform(y, [-50, -150], [0, 1]); 

  // 2. ASYNC DRAG HANDLER
  const handleDragEnd = async (event: any, info: any) => {
    const swipeThreshold = 100;
    const mediaType = activeCard.type.toLowerCase() as 'movie' | 'song' | 'youtube';
    
    if (info.offset.x > swipeThreshold) {
      console.log('Added to Watchlist:', activeCard.title);
      // 🔥 Save as "watchlist"
      saveMediaToCatalog(activeCard.id, mediaType, 'watchlist');
      removeCard();
    } 
    else if (info.offset.x < -swipeThreshold) {
      console.log('Skipped:', activeCard.title);
      // Just throw it away, no DB action needed
      removeCard();
    } 
    else if (info.offset.y < -swipeThreshold) {
      console.log('Marked as Watched:', activeCard.title);
      // 🔥 Save as "completed"
      saveMediaToCatalog(activeCard.id, mediaType, 'completed');
      removeCard();
    }
  };

  const removeCard = () => {
    setCards((prev) => prev.slice(1));
    x.set(0);
    y.set(0);
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <p className="font-sans mb-4">You've caught up on your vibes.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition"
        >
          Reload Feed
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[500px] flex items-center justify-center perspective-1000">
      <AnimatePresence>
        {cards.map((card, index) => {
          // We only render the top 3 cards to keep the DOM light and performant
          if (index > 2) return null; 

          const isTop = index === 0;

          return (
            <motion.div
              key={card.id}
              className="absolute w-full h-full rounded-[28px] shadow-2xl overflow-hidden bg-zinc-800 border-[1px] border-zinc-700/50"
              style={{
                x: isTop ? x : 0,
                y: isTop ? y : 0,
                rotate: isTop ? rotate : 0,
                zIndex: cards.length - index,
                scale: isTop ? 1 : 0.95 - index * 0.05,
                top: isTop ? 0 : index * 15,
              }}
              drag={isTop}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDragEnd={isTop ? handleDragEnd : undefined}
              whileTap={{ scale: 0.98, cursor: 'grabbing' }}
            >
              <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              <div className="absolute bottom-0 left-0 w-full p-6 text-white pointer-events-none">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[var(--theme-primary,white)] text-zinc-950 rounded-full mb-3 inline-block">
                  {card.type}
                </span>
                <h2 className="text-3xl font-black font-sans tracking-tight leading-tight">{card.title}</h2>
              </div>

              {isTop && (
                <>
                  <motion.div style={{ opacity: rightOpacity }} className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none">
                    <div className="bg-green-500 text-white rounded-full p-4 drop-shadow-2xl"><Check size={48} strokeWidth={3} /></div>
                  </motion.div>
                  <motion.div style={{ opacity: leftOpacity }} className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none">
                    <div className="bg-red-500 text-white rounded-full p-4 drop-shadow-2xl"><X size={48} strokeWidth={3} /></div>
                  </motion.div>
                  <motion.div style={{ opacity: upOpacity }} className="absolute inset-0 bg-blue-500/20 flex items-center justify-center pointer-events-none">
                    <div className="bg-blue-500 text-white rounded-full p-4 drop-shadow-2xl"><Eye size={48} strokeWidth={3} /></div>
                  </motion.div>
                </>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

