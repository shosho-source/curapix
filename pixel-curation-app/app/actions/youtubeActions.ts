// app/actions/youtubeActions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// The ultimate YouTube Regex: Handles youtu.be, youtube.com/watch, youtube.com/embed, etc.
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

export async function processYouTubeLink(rawUrl: string) {
  const match = rawUrl.match(YOUTUBE_REGEX);
  
  if (!match || match.length < 2) {
    return { success: false, error: 'Invalid YouTube URL. Please paste a direct link.' };
  }

  const videoId = match[1];

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin bypass for caching
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 1. Check the Quota Shield (Cache)
  const { data: cachedVideo } = await supabase
    .from('media_cache')
    .select('*')
    .eq('api_id', videoId)
    .single();

  if (cachedVideo) {
    console.log('🛡️ YouTube Cache Hit! Cost: 0 units.');
    return { success: true, data: cachedVideo };
  }

  console.log('📡 YouTube Cache Miss. Fetching from Google (Cost: 1 unit)...');

  try {
    // 2. Fetch from Google API (Only 1 unit per call)
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'Video not found or is private.' };
    }

    const snippet = data.items[0].snippet;

    const newCacheItem = {
      api_id: videoId,
      title: snippet.title,
      // Grab the max resolution thumbnail available
      thumbnail_url: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url,
      description: snippet.description,
    };

    // 3. Save to Quota Shield
    await supabase.from('media_cache').insert(newCacheItem);

    return { success: true, data: newCacheItem };

  } catch (error) {
    console.error('YouTube API Error:', error);
    return { success: false, error: 'Failed to communicate with YouTube.' };
  }
}