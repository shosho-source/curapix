// app/dashboard/page.tsx
import ThemeSync from '../../components/ThemeSync';
import SwipeDeck from '../../components/SwipeDeck';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTrendingMovies } from '../actions/mediaActions'; // IMPORT THE NEW ACTION

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

  // FETCH REAL LIVE DATA
  const trendingData = await getTrendingMovies();

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 overflow-hidden">
      <ThemeSync /> 
      
      <header className="mb-8 mt-4 px-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
          <p className="text-zinc-400">Curate your exact vibe.</p>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--theme-primary,gray)]">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Profile" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-sm font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
          )}
        </div>
      </header>

      <main className="w-full h-full flex flex-col items-center justify-center mt-12">
        {/* PASS THE REAL DATA TO THE DECK */}
        <SwipeDeck initialCards={trendingData} />
      </main>
    </div>
  );
}