// components/NestedThreads.tsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CornerDownRight } from 'lucide-react';

// Types based on our Supabase schema
type Comment = {
  id: number;
  parent_id: number | null;
  content: string;
  users: { username: string; avatar_url: string; theme_palette: any };
};

export default function NestedThreads({ comments }: { comments: Comment[] }) {
  // 1. Organize flat DB rows into a nested tree structure
  const rootComments = comments.filter(c => c.parent_id === null);
  
  const getReplies = (parentId: number) => {
    return comments.filter(c => c.parent_id === parentId);
  };

  return (
    <div className="w-full mt-8 p-6 bg-zinc-900/50 rounded-[28px] border border-zinc-800">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <MessageSquare size={18} />
        <h3 className="font-sans font-medium text-sm tracking-widest uppercase">Field Notes</h3>
      </div>

      <div className="space-y-6">
        {rootComments.length === 0 && (
          <p className="text-zinc-500 font-messy text-2xl opacity-50">No notes yet. Leave a mark.</p>
        )}
        {rootComments.map(comment => (
          <CommentNode key={comment.id} comment={comment} replies={getReplies(comment.id)} getReplies={getReplies} />
        ))}
      </div>
    </div>
  );
}

// 2. The Recursive Component
function CommentNode({ 
  comment, 
  replies, 
  getReplies 
}: { 
  comment: Comment, 
  replies: Comment[], 
  getReplies: (id: number) => Comment[] 
}) {
  const [isReplying, setIsReplying] = useState(false);
  
  // Extract user's specific theme color for their username text
  const userColor = comment.users.theme_palette?.primary || '#EAB308';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-3 items-start">
        <img 
          src={comment.users.avatar_url} 
          alt={comment.users.username} 
          className="w-8 h-8 rounded-full mt-1 border border-zinc-700"
        />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm font-sans" style={{ color: userColor }}>
              @{comment.users.username}
            </span>
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-zinc-600 hover:text-zinc-400 font-sans uppercase tracking-wider transition-colors"
            >
              Reply
            </button>
          </div>
          
          {/* THE MESSY HUMAN ELEMENT */}
          <p className="font-messy text-2xl text-zinc-200 leading-tight mt-1">
            {comment.content}
          </p>
        </div>
      </div>

      {/* Render Nested Replies via Recursion */}
      {replies.length > 0 && (
        <div className="pl-4 ml-4 border-l-2 border-zinc-800 space-y-4 mt-2">
          {replies.map(reply => (
            <div key={reply.id} className="relative">
               <CornerDownRight size={14} className="absolute -left-[22px] top-2 text-zinc-700" />
               <CommentNode comment={reply} replies={getReplies(reply.id)} getReplies={getReplies} />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}