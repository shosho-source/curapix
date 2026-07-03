// app/dashboard/page.tsx
import ThemeSync from '../../components/ThemeSync';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // RESOLVE THE COOKIE PROMISE HERE:
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Protect the route: if not logged in, boot them back to home
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <ThemeSync /> 
      
      <h1 className="text-3xl font-bold mb-4">Your Curated Hub</h1>
      <p className="text-zinc-400">If you are seeing this, your Google Auth worked perfectly!</p>
    </div>
  );
}