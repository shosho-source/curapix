// components/FollowButton.tsx
"use client";

import { useState } from 'react';
import { toggleFollow } from '../app/actions/socialActions';

export default function FollowButton({ targetUserId, initialIsFollowing }: { targetUserId: string, initialIsFollowing: boolean }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleFollow(targetUserId);
    if (result.success) setIsFollowing(result.isFollowing);
    setLoading(false);
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`px-6 py-2 rounded-full font-bold transition-all ${
        isFollowing ? 'bg-zinc-800 text-white' : 'bg-white text-black hover:bg-zinc-200'
      }`}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}