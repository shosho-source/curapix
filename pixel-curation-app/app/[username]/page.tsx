// app/[username]/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import VibeMatchBadge from '../../components/VibeMatchBadge';
import EditorialCard from '../../components/EditorialCard'; // We will build this next

export default async function ProfilePage({ params }: { params: { username: string } }) {
  // ... (Keep the exact same Supabase data fetching logic from the previous step) ...
  
  // Mock data for the layout demonstration
  const mockCatalog = [
    { id: 1, title: 'Dune: Part Two', year: '2024', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGjjc91p.jpg', featured: true },
    { id: 2, title: 'BRAT', year: '2024', poster: 'https://i.scdn.co/image/ab67616d0000b273b5eb24a737562095cc6e1654', featured: false },
    { id: 3, title: 'La Haine', year: '1995', poster: 'https://image.tmdb.org/t/p/w500/z10QjS0H91N3A2BIs7t8aP9zWGE.jpg', featured: false },
    { id: 4, title: 'Cyberpunk', year: '2020', poster: 'https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQQnditMmI1xbRp.jpg', featured: true },
  ];

  return (
    <div 
      className="min-h-screen bg-zinc-950 text-white transition-colors duration-500 font-sans"
      style={{
        '--theme-primary': '#EAB308', // Fallbacks if DB lacks theme
        '--theme-secondary': '#FEF08A',
        '--theme-surface': '#27272A',
        '--theme-outline': '#3F3F46',
      } as React.CSSProperties}
    >
      {/* 
        THE SWISS GRID 
        Mobile: 1 column, padded.
        Desktop: 12 columns, strict alignments, height of the screen.
      */}
      <div className="max-w-[1600px] mx-auto p-6 md:p-12 lg:grid lg:grid-cols-12 lg:gap-16 items-start">
        
        {/* LEFT COLUMN: The Typographic Sidebar (Desktop) / Header (Mobile) */}
        <header className="lg:col-span-3 lg:sticky lg:top-12 flex flex-col items-center lg:items-start mb-16 lg:mb-0">
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[28px] overflow-hidden mb-6 border-2 border-[var(--theme-primary)]">
            <img src="https://github.com/shadcn.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-none mb-2 lg:mb-4">
            @{params.username}
          </h1>
          
          <p className="text-zinc-400 mb-8 max-w-xs text-center lg:text-left text-sm leading-relaxed">
            Curating the chaos. Strictly sci-fi, hyperpop, and late-night visual essays.
          </p>
          
          <div className="w-full h-px bg-zinc-800 my-6 hidden lg:block" />

          {/* Vibe Match Badge fits perfectly into the editorial sidebar */}
          <VibeMatchBadge visitorApiIds={['1', '2']} ownerApiIds={['1', '2', '3']} />
        </header>

        {/* RIGHT COLUMN: The Editorial Vault */}
        <main className="lg:col-span-9">
          <div className="flex items-baseline justify-between mb-8 border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-medium tracking-tight">The Vault</h2>
            <span className="text-sm font-mono text-zinc-500">INDEX // 001</span>
          </div>

          {/* 
            THE SPREAD
            We use CSS Grid again here. Featured items span multiple columns 
            to create that asymmetrical "magazine layout" feel.
          */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]">
            {mockCatalog.map((item) => (
              <EditorialCard key={item.id} item={item} />
            ))}
          </div>
        </main>

      </div>
    </div>
  );
}