// app/page.tsx
import LoginButton from '@/components/LoginButton';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">Pixel Curation</h1>
        <p className="text-zinc-400 text-center max-w-md mb-8">
          Curate your aesthetic. Share your vibe.
        </p>
        
        {/* The Magic Button */}
        <LoginButton />
        
      </div>
    </main>
  );
}