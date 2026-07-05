// app/[username]/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import VibeMatchBadge from '../../components/VibeMatchBadge';
import EditorialCard from '../../components/EditorialCard'; // We will build this next

type MediaCacheRow = { title: string; thumbnail_url: string | null };
type CatalogRow = {
  id: number;
  api_id: string;
  media_cache: MediaCacheRow | MediaCacheRow[] | null;
};

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // 1. Load the profile owner
  const { data: owner } = await supabase
    .from('users')
    .select('id, username, avatar_url, theme_palette')
    .eq('username', username)
    .single();

  if (!owner) return notFound();

  const theme = (owner.theme_palette || {}) as Record<string, string>;

  // 2. Load the owner's catalog for the editorial grid
  const { data: ownerCatalog } = await supabase
    .from('catalog_items')
    .select('id, api_id, media_cache (title, thumbnail_url)')
    .eq('user_id', owner.id)
    .order('created_at', { ascending: false })
    .returns<CatalogRow[]>();

  const catalog = (ownerCatalog || []).map((row, index) => {
    const media = Array.isArray(row.media_cache) ? row.media_cache[0] : row.media_cache;
    return {
      id: row.id,
      title: media?.title || 'Unknown Title',
      year: '',
      poster: media?.thumbnail_url || '/placeholder-poster.png',
      // Every 5th card gets the bigger "featured" magazine-spread treatment
      featured: index % 5 === 0,
    };
  });

  // 3. Vibe Match — compare the visitor's own vault against the owner's
  const { data: { user: visitor } } = await supabase.auth.getUser();
  let visitorApiIds: string[] = [];

  if (visitor && visitor.id !== owner.id) {
    const { data: visitorCatalog } = await supabase
      .from('catalog_items')
      .select('api_id')
      .eq('user_id', visitor.id);
    visitorApiIds = (visitorCatalog || []).map((c) => c.api_id);
  }

  const ownerApiIds = (ownerCatalog || []).map((c) => c.api_id);

  return (
    <div 
      className="min-h-screen bg-zinc-950 text-white transition-colors duration-500 font-sans"
      style={{
        '--theme-primary': theme.primary || '#EAB308',
        '--theme-secondary': theme.secondary || '#FEF08A',
        '--theme-surface': theme.surface || '#27272A',
        '--theme-outline': theme.outline || '#3F3F46',
      } as React.CSSProperties}
    >
      {/* THE SWISS GRID 
        Mobile: 1 column, padded.
        Desktop: 12 columns, strict alignments, height of the screen.
      */}
      <div className="max-w-[1600px] mx-auto p-6 md:p-12 lg:grid lg:grid-cols-12 lg:gap-16 items-start">
        
        {/* LEFT COLUMN: The Typographic Sidebar (Desktop) / Header (Mobile) */}
        <header className="lg:col-span-3 lg:sticky lg:top-12 flex flex-col items-center lg:items-start mb-16 lg:mb-0">
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[28px] overflow-hidden mb-6 border-2 border-[var(--theme-primary)]">
            <img src={owner.avatar_url || 'https://github.com/shadcn.png'} alt="Profile" className="w-full h-full object-cover" />
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-none mb-2 lg:mb-4">
            @{owner.username}
          </h1>
          
          <p className="text-zinc-400 mb-8 max-w-xs text-center lg:text-left text-sm leading-relaxed">
            Curating the chaos. Strictly sci-fi, hyperpop, and late-night visual essays.
          </p>
          
          <div className="w-full h-px bg-zinc-800 my-6 hidden lg:block" />

          {/* Vibe Match Badge fits perfectly into the editorial sidebar */}
          <VibeMatchBadge visitorApiIds={visitorApiIds} ownerApiIds={ownerApiIds} />
        </header>

        {/* RIGHT COLUMN: The Editorial Vault */}
        <main className="lg:col-span-9">
          <div className="flex items-baseline justify-between mb-8 border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-medium tracking-tight">The Vault</h2>
            <span className="text-sm font-mono text-zinc-500">INDEX // {String(catalog.length).padStart(3, '0')}</span>
          </div>

          {catalog.length === 0 ? (
            <p className="text-zinc-500 text-center py-20">Nothing curated here yet.</p>
          ) : (
            /* THE SPREAD
              We use CSS Grid again here. Featured items span multiple columns 
              to create that asymmetrical "magazine layout" feel.
            */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]">
              {catalog.map((item) => (
                <EditorialCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}