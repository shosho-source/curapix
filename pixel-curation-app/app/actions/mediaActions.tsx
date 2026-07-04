// app/actions/mediaActions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { fetchSpotifyTrack } from './spotifyActions';

export async function getOrFetchMedia(apiId: string, type: 'movie' | 'youtube' | 'song') {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  
  const { data: cachedMedia } = await supabase
    .from('media_cache')
    .select('*')
    .eq('api_id', apiId)
    .single();

  if (cachedMedia) {
    console.log('🛡️ Cache Hit! Zero API cost.');
    return cachedMedia;
  }

  console.log(`📡 Cache Miss. Fetching ${type} from external API...`);
  let fetchedData = null;

  if (type === 'movie') {
    // 🔴 ADDED TRY/CATCH HERE TO BYPASS ISP BLOCKS
    try {
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/movie/${apiId}?api_key=${process.env.TMDB_API_KEY}`
      );
      
      if (!tmdbRes.ok) throw new Error('TMDB Rejected');
      
      const tmdbJson = await tmdbRes.json();
      
      fetchedData = {
        api_id: apiId,
        title: tmdbJson.title || 'Unknown Title',
        thumbnail_url: tmdbJson.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbJson.poster_path}` : null,
        description: tmdbJson.overview || '',
      };
    } catch (error) {
      console.warn(`⚠️ ISP Blocked TMDB for ID ${apiId}. Saving fallback to satisfy database relations.`);
      // 🟢 FALLBACK DATA: Ensures the Swipe Deck save doesn't crash
      fetchedData = {
        api_id: apiId,
        title: "Unknown Movie (Network Error)",
        thumbnail_url: "https://via.placeholder.com/500x750/27272a/ffffff?text=Image+Blocked", 
        description: "Movie metadata could not be loaded due to an ISP network block.",
      };
    }
  } 
  else if (type === 'song') {
    try {
      fetchedData = await fetchSpotifyTrack(apiId);
      if (!fetchedData) throw new Error("Track not found");
    } catch (error) {
      console.warn(`⚠️ Failed to load Spotify Track ${apiId}. Saving fallback.`);
      fetchedData = {
        api_id: apiId,
        title: "Unknown Audio Track", 
        thumbnail_url: "https://via.placeholder.com/500x750/27272a/ffffff?text=Audio+Blocked", 
        description: "Track metadata could not be loaded.",
      };
    }
  }

  // 3. Save to Cache to protect future quota
  if (fetchedData) {
    const { error: insertError } = await supabase.from('media_cache').insert(fetchedData);
    if (insertError) console.error("Cache Insert Error:", insertError);
  }

  return fetchedData;
}

// ... (keep getTrendingMovies and getWatchProviders exactly as they are below this)

export async function getTrendingMovies() {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.TMDB_API_KEY}&language=en-US`,
      { next: { revalidate: 3600 } } 
    );
    
    // NEW: Log the exact reason TMDB is angry
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`🔴 TMDB API REJECTED: Status ${res.status}`, errorText);
      throw new Error('Failed to fetch trending');
    }
    
    const data = await res.json();
    
    return data.results.map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      image: `https://image.tmdb.org/t/p/w780${movie.poster_path}`, 
      type: 'Movie'
    }));
  } catch (error) {
    console.error("TMDB API blocked or failed. Loading Fallback Data...");
    return [
      { id: 'mock1', title: 'Dune: Part Two', image: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGjjc91p.jpg', type: 'Movie' },
      { id: 'mock2', title: 'BRAT - Charli XCX', image: 'https://i.scdn.co/image/ab67616d0000b273b5eb24a737562095cc6e1654', type: 'Album' },
      { id: 'mock3', title: 'Cyberpunk 2077', image: 'https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQQnditMmI1xbRp.jpg', type: 'Game' },
    ];
  }
}