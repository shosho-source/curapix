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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingUser) {
          const avatarUrl = user.user_metadata.avatar_url;
          const rawUsername = user.user_metadata.full_name?.replace(/\s+/g, '').toLowerCase() || user.email?.split('@')[0];
          
          let themePalette = {
            primary: '#EAB308',   
            secondary: '#FEF08A', 
            tertiary: '#A16207',  
            surface: '#27272A',   
            outline: '#3F3F46'    
          };

          if (avatarUrl) {
            try {
              themePalette = await generateThemeFromAvatar(avatarUrl);
            } catch (error) {
              console.warn("CORS/Image blocked local color extraction. Applying fallback theme palette.");
            }
          }

          // Wrap the database operation to ensure it doesn't leave the UI permanently locked
          const { error: insertError } = await supabase.from('users').insert([{
            id: user.id,
            username: `${rawUsername}${Math.floor(Math.random() * 1000)}`,
            avatar_url: avatarUrl,
            theme_palette: themePalette 
          }]);

          if (insertError) {
            console.error("Database registration failed. Make sure Row Level Security (RLS) policies allow inserts on the users table:", insertError);
          }
        }
      } catch (globalError) {
        console.error("ThemeSync unexpected routine failure:", globalError);
      } finally {
        // GUARANTEE: The UI backdrop overlay will clear out even if database/CORS configurations are blocking
        setIsSyncing(false);
      }
    };

    syncUser();
  }, []);

  if (isSyncing) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm text-white font-sans">Extracting your aesthetic...</div>;

  return null;
}