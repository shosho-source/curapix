// app/actions/importActions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getOrFetchMedia } from './mediaActions'; // The Quota Shield we built earlier

export async function processMovieBatch(movies: { Name: string; Year: string }[]) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');

  for (const movie of movies) {
    try {
      // 1. Search TMDB for the exact movie (Lightweight search)
      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movie.Name)}&year=${movie.Year}&api_key=${process.env.TMDB_API_KEY}`
      );
      const searchData = await searchRes.json();
      
      if (!searchData.results || searchData.results.length === 0) continue;
      
      const tmdbId = searchData.results[0].id.toString();

      // 2. Pass it through our Quota Shield cache
      await getOrFetchMedia(tmdbId, 'movie');

      // 3. Save to the user's personal catalog_items table
      await supabase.from('catalog_items').upsert({
        user_id: session.user.id,
        media_type: 'movie',
        api_id: tmdbId,
        status: 'completed', // Imported from Letterboxd = already watched
      }, { onConflict: 'user_id, api_id' }); // Prevent duplicates

    } catch (error) {
      console.error(`Failed to import ${movie.Name}:`, error);
      // We swallow the error and continue the loop so one bad title doesn't break the batch
    }
  }
}