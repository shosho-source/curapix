// components/SpotifyInput.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Link as LinkIcon, CheckCircle, Loader2, Plus } from 'lucide-react';
import { processSpotifyLink } from '../app/actions/spotifyActions';

export default function SpotifyInput({ onTrackAdded }: { onTrackAdded: (id: string) => void }) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePasteOrSubmit = async (e: React.FormEvent | React.ClipboardEvent) => {
    e.preventDefault();
    
    const targetUrl = 'clipboardData' in e 
      ? e.clipboardData.getData('Text') 
      : url;

    if (!targetUrl) return;

    setStatus('loading');
    setErrorMessage('');
    
    const result = await processSpotifyLink(targetUrl);

    if (result.success && result.data) {
      setStatus('success');
      setUrl(''); 
      
      setTimeout(() => {
        // Pass the successfully parsed Spotify ID back up to the parent component (e.g., the Dashboard)
        onTrackAdded(result.data.api_id);
        setStatus('idle');
      }, 1000);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Something went wrong.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form 
        onSubmit={handlePasteOrSubmit}
        className={`relative flex items-center w-full rounded-[28px] border-2 bg-zinc-900 transition-colors overflow-hidden ${
          status === 'error' ? 'border-red-500/50' : 'border-zinc-700 focus-within:border-[#1DB954]'
        }`}
      >
        <div className="pl-4 pr-2 text-zinc-500 flex items-center gap-2">
          <Music size={18} className="text-[#1DB954]" />
          <LinkIcon size={16} />
        </div>
        
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={handlePasteOrSubmit}
          placeholder="Paste Spotify song link..."
          className="w-full bg-transparent border-none py-4 outline-none text-white placeholder:text-zinc-600 font-sans"
          disabled={status === 'loading' || status === 'success'}
        />

        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }}
              className="pr-4 text-[#1DB954]"
            >
              <Loader2 size={24} className="animate-spin" />
            </motion.div>
          )}
          
          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }}
              className="pr-4 text-[#1DB954]"
            >
              <CheckCircle size={24} />
            </motion.div>
          )}

          {status === 'idle' && url.length > 0 && (
            <motion.button 
              key="submit"
              type="submit"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className="mx-2 p-2 bg-[#1DB954] text-zinc-950 rounded-full hover:opacity-90 transition-opacity"
            >
              <Plus size={20} strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      <div className="mt-2 h-6 px-4">
        {status === 'error' && (
          <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}