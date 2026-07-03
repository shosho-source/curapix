// components/ThemeSync.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { generateThemeFromAvatar } from '../utils/themeGenerator';

export default function ThemeSync() {
  const [isSyncing, setIsSyncing] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const syncUser = async () => {
      // 1. Get the current logged-in Google session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // 2. Check if they already exist in your custom `users` table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        // 3. New User! Extract data from the Google payload
        const avatarUrl = user.user_metadata.avatar_url;
        const rawUsername = user.user_metadata.full_name?.replace(/\s+/g, '').toLowerCase() || user.email?.split('@')[0];
        
        let themePalette = null;

        // 4. Run the Client-Side Dynamic Theming Algorithm
        if (avatarUrl) {
          try {
            themePalette = await generateThemeFromAvatar(avatarUrl);
          } catch (error) {
            console.error("Failed to generate theme:", error);
          }
        }

        // 5. Save everything to the database
        await supabase.from('users').insert([{
          id: user.id,
          username: `${rawUsername}${Math.floor(Math.random() * 1000)}`, // Ensure uniqueness
          avatar_url: avatarUrl,
          theme_palette: themePalette
        }]);
      }
      
      setIsSyncing(false);
    };

    syncUser();
  }, []);

  if (isSyncing) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm text-white">Extracting your aesthetic...</div>;

  return null; // Renders nothing once synced
}