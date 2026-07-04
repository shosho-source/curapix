// app/onboarding/InitialSwipeStep.tsx
"use client";

export default function InitialSwipeStep({ genres, onNext }: { genres: string[], onNext: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black tracking-tighter">Quick calibration.</h2>
      <p className="text-zinc-400">Swipe a few items to teach the algorithm your vibe.</p>
      
      {/* Placeholder - you can replace this with your actual SwipeDeck component later */}
      <div className="h-64 w-full bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600">
        Swipe Deck Placeholder
      </div>
      
      <button onClick={onNext} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition">
        Looks good, continue
      </button>
    </div>
  );
}