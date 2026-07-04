// app/onboarding/page.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// We will build these individual step components next!
import ThemeSelectorStep from './ThemeSelectorStep';
import GenreFormStep from './GenreFormStep';
import ImportStep from './ImportStep';
import InitialSwipeStep from './InitialSwipeStep';
import ProfileSetupStep from './ProfileSetupStep';

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    theme: null,
    genres: [],
    username: ''
  });

  const nextStep = () => setStep((prev) => prev + 1);

  // This renders the correct UI based on what step they are on
  const renderStep = () => {
    switch (step) {
      case 1:
        return <ThemeSelectorStep onNext={(theme) => { setOnboardingData({...onboardingData, theme}); nextStep(); }} />;
      case 2:
        return <GenreFormStep onNext={(genres) => { setOnboardingData({...onboardingData, genres}); nextStep(); }} />;
      case 3:
        return <ImportStep onNext={nextStep} onSkip={nextStep} />;
      case 4:
        return <InitialSwipeStep genres={onboardingData.genres} onNext={nextStep} />;
      case 5:
        return <ProfileSetupStep theme={onboardingData.theme} onComplete={() => window.location.href = '/home'} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-hidden font-sans">
      
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800 z-50">
        <motion.div 
          className="h-full bg-[var(--theme-primary,#EAB308)]"
          initial={{ width: 0 }}
          animate={{ width: `${(step / 5) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <main className="flex-1 w-full h-full flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}