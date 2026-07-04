// components/EditorialCard.tsx
"use client";

import { motion } from 'framer-motion';

interface CatalogItem {
  id: number;
  title: string;
  year: string;
  poster: string;
  featured: boolean;
}

export default function EditorialCard({ item }: { item: CatalogItem }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      // THE MAGIC: If an item is "featured", it spans 2 columns and 2 rows on desktop!
      className={`relative group cursor-pointer overflow-hidden rounded-[28px] bg-zinc-900 border border-zinc-800 
        ${item.featured ? 'md:col-span-2 md:row-span-2 aspect-[4/5]' : 'col-span-1 row-span-1 aspect-[2/3]'}
      `}
    >
      <img 
        src={item.poster} 
        alt={item.title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* The "Messy Human" Element overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
        <h3 className={`font-bold leading-tight text-white ${item.featured ? 'text-3xl' : 'text-xl'}`}>
          {item.title}
        </h3>
        <p className="font-mono text-xs text-[var(--theme-primary,gray)] mt-2">
          {item.year} // WATC_HED
        </p>

        {/* Mocking the interactive sticker placement */}
        {item.featured && (
          <img 
            src="/fire.png" 
            alt="Sticker" 
            className="absolute top-4 right-4 w-12 h-12 rotate-12 drop-shadow-lg"
          />
        )}
      </div>
    </motion.div>
  );
}