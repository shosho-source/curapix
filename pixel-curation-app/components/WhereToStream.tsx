// components/WhereToStream.tsx
"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, ExternalLink } from 'lucide-react';
import { getWatchProviders } from '../app/actions/mediaActions';

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchData {
  link: string;
  flatrate: Provider[];
  rent: Provider[];
  buy: Provider[];
}

export default function WhereToStream({ tmdbId }: { tmdbId: string }) {
  const [data, setData] = useState<WatchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      // For a real production app, you might grab the user's country code via headers/GeoIP
      // We default to 'US' here for the blueprint
      const providers = await getWatchProviders(tmdbId, 'US');
      setData(providers);
      setLoading(false);
    };

    fetchProviders();
  }, [tmdbId]);

  if (loading) {
    return <div className="h-12 w-full animate-pulse bg-zinc-800 rounded-xl" />;
  }

  // If there's no data available for this region
  if (!data || (!data.flatrate.length && !data.rent.length && !data.buy.length)) {
    return (
      <div className="text-sm text-zinc-500 italic flex items-center gap-2">
        <PlayCircle size={16} /> Not currently streaming in your region.
      </div>
    );
  }

  // Prioritize free/subscription streams, fallback to rent/buy
  const displayProviders = data.flatrate.length > 0 ? data.flatrate 
                         : data.rent.length > 0 ? data.rent 
                         : data.buy;
                         
  const streamType = data.flatrate.length > 0 ? 'Stream' : 'Rent/Buy';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{streamType} on</span>
        <a 
          href={data.link} 
          target="_blank" 
          rel="noreferrer"
          className="text-xs flex items-center gap-1 text-[var(--theme-primary,white)] opacity-80 hover:opacity-100 transition-opacity"
        >
          JustWatch <ExternalLink size={12} />
        </a>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {displayProviders.slice(0, 4).map((provider, index) => (
          <motion.div
            key={provider.provider_id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 relative group cursor-pointer"
          >
            <img 
              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
              alt={provider.provider_name}
              className="w-12 h-12 rounded-xl shadow-md border border-zinc-700/50 group-hover:border-[var(--theme-primary)] transition-colors"
            />
            {/* Tooltip on hover */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {provider.provider_name}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}