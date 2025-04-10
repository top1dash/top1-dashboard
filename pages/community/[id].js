import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../supabaseClient";

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (id) fetchData();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, [id]);

  async function fetchData() {
    const { data: postData } = await supabase
      .from("post_with_metadata")
      .select("*")
      .eq("id", id)
      .single();

    const { data: replyData } = await supabase
      .from("replies")
      .select("*, profiles(username)")
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    setPost(postData);
    setReplies(replyData || []);
  }

  async function handleReplySubmit(e) {
    e.preventDefault();
    if (!newReply.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("replies").insert([
      {
        post_id: id,
        author_id: user.id,
        content: newReply.trim(),
      },
    ]);

    if (!error) {
      setNewReply("");
      fetchData(); // refresh replies
    }
  }

  if (!post) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Posted by {post.username || "Anonymous"} in{" "}
        <span className="italic">{post.topic}</span>
      </p>

      <div className="bg-white rounded shadow p-4 mb-8 whitespace-pre-wrap">
        {post.content}
      </div>

      <h2 className="text-lg font-semibold mb-2">Replies</h2>
      <div className="space-y-4 mb-6">
        {replies.length === 0 && (
          <p className="text-gray-500">No replies yet. Start the conversation!</p>
        )}
        {replies.map((r) => (
          <div key={r.id} className="bg-gray-50 border rounded p-3">
            <div className="text-sm text-gray-600 mb-1">
              {r.profiles?.username || "User"} ·{" "}
              {new Date(r.created_at).toLocaleString()}
            </div>
            <div className="text-gray-800 whitespace-pre-wrap">{r.content}</div>
          </div>
        ))}
      </div>

      {session ? (
        <form onSubmit={handleReplySubmit} className="space-y-2">
          <textarea
            rows={3}
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Write a reply..."
            className="w-full border rounded p-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post Reply
          </button>
        </form>
      ) : (
        <p className="text-gray-600">
          <a href="/login" className="text-blue-600 underline">
            Log in
          </a>{" "}
          to reply.
        </p>
      )}
    </div>
  );
}
