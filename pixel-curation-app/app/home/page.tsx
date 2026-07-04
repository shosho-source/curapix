// app/home/page.tsx
import { getSocialFeed } from '../actions/socialActions';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const feed = await getSocialFeed();

  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <h1 className="text-3xl font-black mb-8">Friends' Taste</h1>
      
      <div className="max-w-md mx-auto space-y-6">
        {feed.length === 0 ? (
          <p className="text-zinc-500 text-center py-20">Follow some friends to see their feed here.</p>
        ) : (
          feed.map((item: any) => (
            <div key={item.id} className="bg-zinc-900 p-4 rounded-[24px] border border-zinc-800 flex gap-4">
              <img 
                src={item.users.avatar_url} 
                className="w-10 h-10 rounded-full" 
                alt={item.users.username} 
              />
              <div>
                <p className="text-sm font-bold text-zinc-300">
                  <span className="text-white">@{item.users.username}</span> added to {item.status}
                </p>
                <h3 className="font-bold text-lg mt-1">{item.media_cache.title}</h3>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}