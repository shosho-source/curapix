// app/actions/commentActions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getItemComments(itemId: number) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // We fetch all comments for this specific catalog item, including user details
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      parent_id,
      content,
      created_at,
      users ( username, avatar_url, theme_palette )
    `)
    .eq('item_id', itemId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data;
}