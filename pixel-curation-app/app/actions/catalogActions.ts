// app/actions/catalogActions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getOrFetchMedia } from './mediaActions'; // Our quota shield

export async function saveMediaToCatalog(apiId: string, type: 'movie' | 'youtube' | 'song', status: 'watchlist' | 'completed' | 'heavy_rotation') {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 1. Verify User
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { success: false, error: 'Unauthorized' };

  try {
    // 2. Pass it through the Quota Shield (ensures the media exists in our cache table)
    await getOrFetchMedia(apiId, type);

    // 3. Save to the user's vault
    const { error: insertError } = await supabase.from('catalog_items').upsert({
      user_id: user.id,
      media_type: type,
      api_id: apiId,
      status: status,
    }, { onConflict: 'user_id, api_id' }); // If they already swiped it, update it instead of duplicating

    if (insertError) throw insertError;

    return { success: true };
  } catch (err) {
    console.error("Failed to save to catalog:", err);
    return { success: false, error: 'Failed to save item.' };
  }
}