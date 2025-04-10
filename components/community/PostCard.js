// components/PostCard.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2 } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function PostCard({ post }) {
  const [voteCount, setVoteCount] = useState(post.vote_count || 0);
  const [replyCount, setReplyCount] = useState(post.reply_count || 0);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Post Title */}
      <Link href={`/community/post/${post.id}`}>
        <h3 className="text-xl font-semibold text-blue-700 hover:underline">
          {post.title}
        </h3>
      </Link>

      {/* Meta Info */}
      <p className="text-sm text-gray-600 mt-1">
        Posted by{" "}
        <span className="font-medium">
          {post.username ? `@${post.username}` : "Anonymous"}
        </span>{" "}
        in <span className="italic">{post.topic}</span>
      </p>

      {/* Post Preview */}
      <p className="mt-4 text-gray-800 line-clamp-3">{post.content}</p>

      {/* Footer Icons */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1">
            <ThumbsUp size={16} />
            <span>{voteCount}</span>
          </div>

          <div className="flex items-center gap-1">
            <MessageCircle size={16} />
            <span>{replyCount}</span>
          </div>
        </div>

        <button className="flex items-center gap-1 hover:text-blue-600">
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
