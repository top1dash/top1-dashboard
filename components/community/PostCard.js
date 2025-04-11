// components/community/PostCard.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, Share } from "lucide-react";
import { supabase } from "../../supabaseClient";

export default function PostCard({ post }) {
  const [userVote, setUserVote] = useState(null);

  const upvotes = post.upvotes || 0;
  const downvotes = post.downvotes || 0;
  const replies = post.replies || 0;

  useEffect(() => {
    fetchUserVote();
  }, []);

  async function fetchUserVote() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("votes")
      .select("value")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .single();

    if (data) {
      setUserVote(data.value);
    }
  }

  async function handleVote(value) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
      
        const { error } = await supabase
          .from("votes")
          .upsert(
            { post_id: post.id, user_id: user.id, value },
            { onConflict: ["post_id", "user_id"] }
          );
      
        if (!error) {
          // Update local vote state
          setUserVote(value);
      
          // Optimistically update post's vote counts
          if (value === 1) {
            post.upvotes = (post.upvotes || 0) + (userVote === -1 ? 2 : userVote === 1 ? 0 : 1);
            if (userVote === -1) post.downvotes = Math.max((post.downvotes || 1) - 1, 0);
          } else if (value === -1) {
            post.downvotes = (post.downvotes || 0) + (userVote === 1 ? 2 : userVote === -1 ? 0 : 1);
            if (userVote === 1) post.upvotes = Math.max((post.upvotes || 1) - 1, 0);
          }
        } else {
          console.error("Vote error:", error.message);
        }
      }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-3">
      <Link href={`/community/${post.id}`}>
        <h3 className="text-xl font-semibold text-blue-700 hover:underline">
          {post.title}
        </h3>
      </Link>

      <p className="text-sm text-gray-600">
        Posted by{" "}
        <span className="font-medium">
          {post.username ? `@${post.username}` : "Anonymous"}
        </span>{" "}
        in <span className="italic">{post.topic || "Unknown Topic"}</span>
      </p>

      <p className="text-gray-800">{post.content}</p>

      <div className="flex items-center space-x-4 pt-2 text-sm text-gray-600">
        <button
          onClick={() => handleVote(1)}
          className={`flex items-center space-x-1 ${
            userVote === 1 ? "text-blue-600 font-semibold" : ""
          }`}
        >
          <ThumbsUp size={16} />
          <span>{upvotes}</span>
        </button>

        <button
          onClick={() => handleVote(-1)}
          className={`flex items-center space-x-1 ${
            userVote === -1 ? "text-red-600 font-semibold" : ""
          }`}
        >
          <ThumbsDown size={16} />
          <span>{downvotes}</span>
        </button>

        <div className="flex items-center space-x-1">
          <span>💬</span>
          <span>{replies}</span>
        </div>

        <button
          onClick={() =>
            navigator.clipboard.writeText(
              `${window.location.origin}/community/post/${post.id}`
            )
          }
          className="flex items-center space-x-1 hover:text-gray-800"
        >
          <Share size={16} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
