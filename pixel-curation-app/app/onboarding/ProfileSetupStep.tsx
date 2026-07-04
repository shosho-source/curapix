// app/onboarding/ProfileSetupStep.tsx
"use client";

export default function ProfileSetupStep({ theme, onComplete }: { theme: any, onComplete: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-black tracking-tighter">You're ready.</h2>
      <p className="text-zinc-400">Your profile is curated and synced to your theme.</p>
      
      <div className="p-8 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full" style={{ backgroundColor: theme?.primary || '#EAB308' }} />
        <p className="font-bold">Setup Complete</p>
      </div>

      <button onClick={onComplete} className="w-full py-4 bg-[var(--theme-primary,#EAB308)] text-black font-bold rounded-xl hover:opacity-90 transition">
        Go to Feed
      </button>
    </div>
  );
}