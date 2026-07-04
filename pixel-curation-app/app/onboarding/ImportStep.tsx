// app/onboarding/ImportStep.tsx
"use client";

export default function ImportStep({ onNext, onSkip }: { onNext: () => void, onSkip: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black tracking-tighter">Import your taste.</h2>
      <p className="text-zinc-400">Sync your services to jumpstart your feed.</p>
      
      <div className="space-y-3">
        <button onClick={onNext} className="w-full py-4 bg-[#1DB954] text-black font-bold rounded-xl hover:opacity-90 transition">
          Connect Spotify
        </button>
        <button onClick={onSkip} className="w-full py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition">
          Skip for now
        </button>
      </div>
    </div>
  );
}