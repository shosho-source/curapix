// components/OnboardingKickstart.tsx
"use client";

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import { UploadCloud, Music, ArrowRight } from 'lucide-react';
import { processMovieBatch } from '../app/actions/importActions'; // We'll build this next

export default function OnboardingKickstart() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle Letterboxd CSV Drop
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      parseAndUpload(file);
    }
  }, []);

  const parseAndUpload = (file: File) => {
    setIsProcessing(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        
        // 1. DEFINE the expected row type
        type LetterboxdRow = { Name: string; Year: string };
        
        // 2. CAST the raw results data to our strict type
        const parsedData = results.data as LetterboxdRow[];
        
        // Now TypeScript knows exactly what 'row' is
        const movies = parsedData.filter((row) => row.Name).slice(0, 50); 
        
        const batchSize = 10;
        for (let i = 0; i < movies.length; i += batchSize) {
          const batch = movies.slice(i, i + batchSize);
          await processMovieBatch(batch); // TypeScript is happy now!
          setProgress(Math.round(((i + batchSize) / movies.length) * 100));
        }
        
        setIsProcessing(false);
        window.location.href = '/dashboard'; 
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Import Your Vibe</h2>
        <p className="text-zinc-400">Skip the setup. Bring your taste with you.</p>
      </div>

      {/* Option A: Letterboxd CSV */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`relative p-8 rounded-[28px] border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center cursor-pointer ${
          isDragging ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10' : 'border-zinc-700 bg-zinc-900/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <UploadCloud size={48} className={`mb-4 ${isDragging ? 'text-[var(--theme-primary)]' : 'text-zinc-500'}`} />
        <h3 className="text-xl font-bold text-white mb-1">Drop Letterboxd CSV</h3>
        <p className="text-sm text-zinc-400">We'll instantly parse your watched list.</p>
        
        {isProcessing && (
          <div className="absolute inset-0 bg-zinc-900/90 rounded-[28px] flex flex-col items-center justify-center">
            <p className="text-[var(--theme-primary)] font-bold mb-2">Importing... {progress > 100 ? 100 : progress}%</p>
            <div className="w-1/2 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--theme-primary)] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </motion.div>

      {/* Option B: Spotify Connect */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.location.href = '/api/auth/spotify'}
        className="w-full p-6 rounded-[28px] bg-[#1DB954]/10 border border-[#1DB954]/30 flex items-center justify-between text-white group hover:bg-[#1DB954]/20 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-black">
            <Music size={24} fill="currentColor" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold">Connect Spotify</h3>
            <p className="text-sm text-zinc-400 group-hover:text-[#1DB954] transition-colors">Import top tracks & albums</p>
          </div>
        </div>
        <ArrowRight className="text-[#1DB954] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </motion.button>
    </div>
  );
}