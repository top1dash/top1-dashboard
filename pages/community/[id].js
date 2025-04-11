// pages/community/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchReplies();
      fetchUser();
    }
  }, [id]);

  async function fetchPost() {
    const { data, error } = await supabase
      .from("post_with_metadata")
      .select("*")
      .eq("id", id)
      .single();
    if (!error) setPost(data);
  }

  async function fetchReplies() {
    const { data, error } = await supabase
      .from("replies")
      .select("id, content, created_at, author:auth_users(username)")
      .eq("post_id", id)
      .order("created_at", { ascending: true });
    if (!error) setReplies(data || []);
  }

  async function fetchUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  async function handleSubmit(e) {
  e.preventDefault();
  if (!newReply.trim()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("replies").insert({
    post_id: id,
    content: newReply,
    author_id: user?.id, // ✅ Fix: include author_id
  });

  if (error) {
    console.error("Error posting reply:", error.message);
  } else {
    setNewReply("");
    fetchReplies(); // ✅ Refresh the list
  }
}


  if (!post) return <p className="p-6">Loading post...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Posted by {post.username ? `@${post.username}` : "Anonymous"} in{" "}
        <span className="italic">{post.topic}</span>
      </p>
      <p className="mb-6">{post.content}</p>

      <hr className="my-6" />

      <h2 className="text-lg font-semibold mb-3">Replies</h2>
      {replies.length === 0 && <p className="text-sm text-gray-500 mb-4">No replies yet.</p>}
      {replies.map((r) => (
        <div key={r.id} className="mb-4 border border-gray-200 rounded p-3">
          <p className="text-sm text-gray-700">{r.content}</p>
          <p className="text-xs text-gray-400 mt-1">
            – {r.author?.username || "Anonymous"}, {new Date(r.created_at).toLocaleString()}
          </p>
        </div>
      ))}

      {user && (
        <form onSubmit={handleSubmit} className="mt-6">
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2"
            rows="3"
            placeholder="Write your reply..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post Reply
          </button>
        </form>
      )}
    </div>
  );
}
