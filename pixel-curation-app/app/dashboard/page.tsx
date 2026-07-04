// app/dashboard/page.tsx
import ThemeSync from '../../components/ThemeSync';
import SwipeDeck from '../../components/SwipeDeck';
import SpotifyInput from '../../components/SpotifyInput';
import YouTubeInput from '../../components/YouTubeInput';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTrendingMovies } from '../actions/mediaActions';
import { saveMediaToCatalog } from '../actions/catalogActions'; // Import the save action

export default async function Dashboard() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/');
  }

  // FETCH REAL LIVE DATA FOR THE DECK
  const trendingData = await getTrendingMovies();

  // INLINE SERVER ACTION: Handles the callbacks from our input components
  async function handleQuickAdd(id: string, type: 'youtube' | 'song') {
    'use server';
    // Save it directly to the vault as 'watchlist' or 'heavy_rotation'
    await saveMediaToCatalog(id, type, 'watchlist');
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 overflow-x-hidden pb-24">
      <ThemeSync /> 
      
      <header className="mb-8 mt-4 px-4 flex justify-between items-center max-w-md mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
          <p className="text-zinc-400">Curate your exact vibe.</p>
        </div>
        <a href={`/${user.user_metadata?.full_name?.replace(/\s+/g, '').toLowerCase() || user.email?.split('@')[0]}`} className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--theme-primary,gray)] hover:scale-105 transition-transform">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-sm font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
          )}
        </a>
      </header>

      <main className="w-full max-w-md mx-auto flex flex-col items-center justify-center mt-8 space-y-12">
        
        {/* THE SWIPE DECK */}
        <section className="w-full">
          <SwipeDeck initialCards={trendingData} />
        </section>

        {/* QUICK ADD SECTION */}
        <section className="w-full px-4 space-y-6 bg-zinc-950/50 p-6 rounded-[32px] border border-zinc-800/50">
          <div className="text-center">
            <h2 className="text-lg font-bold font-sans">Quick Add</h2>
            <p className="text-xs text-zinc-500 mb-4">Paste links directly to your vault</p>
          </div>
          
          <div className="space-y-4">
            <SpotifyInput onTrackAdded={async (id) => {
              'use server';
              await handleQuickAdd(id, 'song');
            }} />
            
            <YouTubeInput onVideoAdded={async (id) => {
              'use server';
              await handleQuickAdd(id, 'youtube');
            }} />
          </div>
        </section>

      </main>
    </div>
  );
}