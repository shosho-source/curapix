// app/actions/socialActions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 1. MAKE SURE 'export' IS HERE
export async function getSocialFeed() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get list of IDs I follow
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);

  const followingIds = following?.map(f => f.following_id) || [];
  if (followingIds.length === 0) return [];

  // Fetch items from those IDs
  const { data: feed } = await supabase
    .from('catalog_items')
    .select(`
      id,
      status,
      created_at,
      user_id,
      users!catalog_items_user_id_fkey (username, avatar_url),
      media_cache (title, thumbnail_url)
    `)
    .in('user_id', followingIds)
    .order('created_at', { ascending: false });

  return feed || [];
}

// 2. MAKE SURE 'export' IS HERE TOO
export async function toggleFollow(targetUserId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id);
    return { success: true, isFollowing: false };
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
    return { success: true, isFollowing: true };
  }
}