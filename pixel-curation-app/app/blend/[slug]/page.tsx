// app/blend/[slug]/page.tsx
import { getBlendData } from '../../actions/blendActions';
import { notFound } from 'next/navigation';

export default async function BlendPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const blendData = await getBlendData(resolvedParams.slug);

  if (!blendData) return notFound();

  const { userA, userB, matchScore, sharedCount, mixedCatalog } = blendData;

  // Extract themes safely
  const themeA = userA.theme_palette?.primary || '#EAB308';
  const themeB = userB.theme_palette?.primary || '#3B82F6';

  return (
    <div 
      className="min-h-screen text-white pb-20 relative font-sans"
      style={{
        // Create a massive dynamic gradient blending both users' colors!
        background: `linear-gradient(135deg, ${themeA}20 0%, #18181b 50%, ${themeB}20 100%)`,
        backgroundColor: '#18181b'
      }}
    >
      <header className="pt-20 pb-10 px-6 flex flex-col items-center justify-center text-center">
        {/* User Avatars Merging */}
        <div className="flex items-center justify-center mb-6 relative">
          <img src={userA.avatar_url} alt={userA.username} className="w-20 h-20 rounded-full border-4 shadow-xl z-10" style={{ borderColor: themeA }} />
          <div className="w-8 h-8 rounded-full bg-zinc-900 absolute flex items-center justify-center z-20 text-xs font-bold border border-zinc-700">
            +
          </div>
          <img src={userB.avatar_url} alt={userB.username} className="w-20 h-20 rounded-full border-4 shadow-xl z-10 -ml-4" style={{ borderColor: themeB }} />
        </div>

        <h1 className="text-4xl font-black tracking-tighter mb-2">
          {userA.username} & {userB.username}
        </h1>
        
        {/* Vibe Match Badge */}
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 mt-4 inline-flex items-center gap-3">
          <span className="text-sm tracking-widest uppercase opacity-70">Vibe Match</span>
          <span className="text-2xl font-black">{matchScore}%</span>
        </div>
        
        {sharedCount > 0 && (
          <p className="text-sm mt-4 text-zinc-400">You share {sharedCount} exact items in your vaults.</p>
        )}
      </header>

      {/* The Blended Canvas */}
      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {mixedCatalog.map((item: any, i: number) => {
            const media = Array.isArray(item.media_cache) ? item.media_cache[0] : item.media_cache;
            if (!media) return null;

            const isUserA = item.source_user === userA.username;
            const itemColor = isUserA ? themeA : themeB;

            return (
              <div key={`${item.id}-${i}`} className="relative break-inside-avoid rounded-[24px] overflow-hidden bg-black/40 border border-white/5 shadow-xl group">
                <img 
                  src={media.thumbnail_url} 
                  alt={media.title} 
                  className="w-full object-cover rounded-[24px]"
                />
                
                {/* Source Indicator Tag */}
                <div 
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/50 text-white border"
                  style={{ borderColor: itemColor }}
                >
                  {item.source_user}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}