// app/actions/blendActions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getBlendData(slug: string) {
  // Slug format expected: "username1-username2"
  const usernames = slug.split('-');
  if (usernames.length !== 2) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 1. Fetch both users
  const { data: users } = await supabase
    .from('users')
    .select('id, username, avatar_url, theme_palette')
    .in('username', usernames);

  if (!users || users.length !== 2) return null;

  const userA = users[0];
  const userB = users[1];

  // 2. Fetch catalogs for both users
  const { data: catalogs } = await supabase
    .from('catalog_items')
    .select(`
      id,
      user_id,
      media_cache (api_id, title, thumbnail_url)
    `)
    .in('user_id', [userA.id, userB.id]);

  if (!catalogs) return null;

  // 3. Process the Blend (Find overlaps and mix)
  const itemsA = catalogs.filter(c => c.user_id === userA.id);
  const itemsB = catalogs.filter(c => c.user_id === userB.id);

  // Extract API IDs to find matches
  const idsA = new Set(itemsA.map(i => Array.isArray(i.media_cache) ? i.media_cache[0]?.api_id : i.media_cache?.api_id));
  const idsB = new Set(itemsB.map(i => Array.isArray(i.media_cache) ? i.media_cache[0]?.api_id : i.media_cache?.api_id));

  const intersection = new Set([...idsA].filter(x => idsB.has(x)));
  
  // Calculate Vibe Match Percentage
  const totalUnique = new Set([...idsA, ...idsB]).size;
  const matchScore = totalUnique === 0 ? 0 : Math.round((intersection.size / totalUnique) * 100);

  // Interleave the arrays for a mixed visual feed
  const mixedCatalog = [];
  const maxLength = Math.max(itemsA.length, itemsB.length);
  for (let i = 0; i < maxLength; i++) {
    if (itemsA[i]) mixedCatalog.push({ ...itemsA[i], source_user: userA.username });
    if (itemsB[i]) mixedCatalog.push({ ...itemsB[i], source_user: userB.username });
  }

  return {
    userA,
    userB,
    matchScore,
    sharedCount: intersection.size,
    mixedCatalog
  };
}