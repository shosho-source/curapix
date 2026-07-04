// app/[username]/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  const cookieStore = await cookies();
  
  // 1. UPDATE THIS BLOCK
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Next.js throws an error if you try to set cookies in a Server Component.
            // We safely catch it here so Supabase stays quiet and happy!
          }
        },
      },
    }
  );

  // 2. Fetch the User and their Theme
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) return notFound();

  // 3. Fetch their curated vault, joining the metadata from our cache
  const { data: catalogItems } = await supabase
    .from('catalog_items')
    .select(`
      id,
      status,
      media_type,
      media_cache (
        title,
        thumbnail_url
      )
    `)
    .eq('user_id', profile.id);

  // Safely extract the theme we generated earlier
  const theme = profile.theme_palette || { primary: '#EAB308', surface: '#27272A' };

  return (
    <div 
      className="min-h-screen text-white font-sans selection:bg-[var(--theme-primary)] selection:text-black pb-20"
      style={{
        // We inject the database hex codes directly into the CSS variables!
        '--theme-primary': theme.primary,
        '--theme-surface': theme.surface,
        backgroundColor: theme.surface, // Dynamically set the background to their aesthetic
      } as React.CSSProperties}
    >
      {/* Aesthetic Header Area */}
      <header className="relative pt-20 pb-10 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Glow effect using their primary color */}
        <div className="absolute top-0 w-full h-64 bg-[var(--theme-primary)] opacity-10 blur-[100px] pointer-events-none" />
        
        <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-[var(--theme-primary)] shadow-2xl mb-6 relative z-10">
          <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tighter relative z-10 mb-2">
          @{profile.username}
        </h1>
        <p className="text-sm font-mono tracking-widest uppercase opacity-70 mb-4">
          Curated Vault
        </p>

        <div className="flex gap-4">
          <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm">
            <span className="text-[var(--theme-primary)] font-bold">{catalogItems?.length || 0}</span> Entries
          </div>
        </div>
      </header>

      {/* The Vault Grid */}
      <main className="max-w-4xl mx-auto px-6 mt-8">
        {(!catalogItems || catalogItems.length === 0) ? (
          <div className="text-center py-20 opacity-50 border-2 border-dashed border-white/10 rounded-[32px]">
            No vibes curated yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {catalogItems.map((item: any) => {
              // Supabase joins sometimes return arrays or single objects, handle safely:
              const media = Array.isArray(item.media_cache) ? item.media_cache[0] : item.media_cache;

              if (!media) return null;

              return (
                <div key={item.id} className="group relative aspect-[2/3] rounded-[24px] overflow-hidden bg-black/40 shadow-xl border border-white/5 transition-transform hover:scale-105">
                  <img 
                    src={media.thumbnail_url} 
                    alt={media.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Status Chip */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {item.status}
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="font-bold text-sm leading-tight truncate">{media.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}