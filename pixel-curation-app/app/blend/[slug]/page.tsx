// components/BlendHeader.tsx
"use client";

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface Member {
  user_id: string;
  users: {
    username: string;
    avatar_url: string;
    theme_palette: any;
  };
}

interface BlendHeaderProps {
  name: string;
  members: Member[];
}

export default function BlendHeader({ name, members }: BlendHeaderProps) {
  return (
    <div className="flex flex-col items-center lg:items-start mb-12">
      <div className="flex items-center gap-3 mb-4 text-[var(--theme-primary,white)]">
        <Users size={20} />
        <span className="font-mono text-sm tracking-widest uppercase">Collaborative Blend</span>
      </div>
      
      <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-8 text-white">
        {name}
      </h1>

      {/* The Overlapping Avatar Stack */}
      <div className="flex -space-x-4">
        {members.map((member, index) => (
          <motion.div
            key={member.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative w-12 h-12 rounded-full border-2 border-zinc-950 overflow-hidden shadow-xl"
            style={{ borderColor: member.users.theme_palette?.primary || '#27272a' }}
            title={`@${member.users.username}`}
          >
            <img 
              src={member.users.avatar_url} 
              alt={member.users.username} 
              className="w-full h-full object-cover" 
            />
          </motion.div>
        ))}
        
        {/* Add Member Button */}
        <button className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-600 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white transition-colors z-10">
          +
        </button>
      </div>
    </div>
  );
}