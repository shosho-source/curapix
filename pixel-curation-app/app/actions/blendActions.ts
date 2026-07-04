// app/actions/blendActions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getOrFetchMedia } from './mediaActions';

export async function addMediaToBlend(blendId: number, apiId: string, mediaType: 'movie' | 'song' | 'youtube') {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');

  // 1. Verify the user is a member of this Blend
  const { data: membership } = await supabase
    .from('blend_members')
    .select('*')
    .eq('blend_id', blendId)
    .eq('user_id', session.user.id)
    .single();

  if (!membership) throw new Error('You do not have permission to add to this blend.');

  // 2. Shield the API: Ensure the item is cached
  await getOrFetchMedia(apiId, mediaType);

  // 3. Add to the Blend
  const { error } = await supabase.from('blend_items').insert({
    blend_id: blendId,
    added_by: session.user.id,
    media_type: mediaType,
    api_id: apiId
  });

  if (error) {
    console.error('Error adding to blend:', error);
    return { success: false };
  }

  return { success: true };
}