// components/community/PostCard.js
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";

export default function PostCard({ post }) {
  const [userVote, setUserVote] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchVote(session.user.id);
    });
  }, []);

  async function fetchVote(userId) {
    const { data } = await supabase
      .from("votes")
      .select("value")
      .eq("post_id", post.id)
      .eq("user_id", userId)
      .single();

    if (data) setUserVote(data.value);
  }

  async function handleVote(value) {
    if (!session) return;

    const { error } = await supabase.from("votes").upsert({
      user_id: session.user.id,
      post_id: post.id,
      value,
    });

    if (!error) setUserVote(value);
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <Link href={`/community/post/${post.id}`}>
        <h3 className="text-xl font-semibold text-blue-700 hover:underline">
          {post.title}
        </h3>
      </Link>
      <p className="text-sm text-gray-600 mt-1">
        Posted by{" "}
        <span className="font-medium">
          {post.username ? `@${post.username}` : "Anonymous"}
        </span>{" "}
        in <span className="italic">{post.topic}</span>
      </p>
      <p className="mt-4 text-gray-800 line-clamp-3">{post.content}</p>

      {/* Footer row */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleVote(1)}
            className={`flex items-center gap-1 ${
              userVote === 1 ? "text-blue-600 font-semibold" : "text-gray-500"
            }`}
          >
            <ThumbsUp size={16} />
          </button>

          <span className="font-medium text-gray-800">
            {post.vote_count ?? 0}
          </span>

          <button
            onClick={() => handleVote(-1)}
            className={`flex items-center gap-1 ${
              userVote === -1 ? "text-red-600 font-semibold" : "text-gray-500"
            }`}
          >
            <ThumbsDown size={16} />
          </button>
        </div>

        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500">
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
