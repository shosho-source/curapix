// components/LoginButton.tsx
"use client";

import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { LogIn } from 'lucide-react';

export default function LoginButton() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        // Request access to their profile and email to get the avatar URL
        scopes: 'profile email' 
      },
    });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 10 } }}
      onClick={handleGoogleLogin}
      className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-[16px] text-white font-medium shadow-lg hover:bg-white/20 transition-colors"
    >
      <span className="font-bold text-lg mr-1">G</span>
      <span>Continue with Google</span>
      <LogIn className="w-4 h-4 opacity-70 ml-2" />
    </motion.button>
  );
}