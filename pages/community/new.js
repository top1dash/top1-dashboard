import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../supabaseClient";

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.from("topics").select("*").then(({ data }) => {
      setTopics(data || []);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("You must be logged in to post.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("posts").insert([
      {
        title,
        content,
        topic_id: topic,
        author_id: user.id,
      },
    ]);

    if (error) {
      alert("Error creating post: " + error.message);
    } else {
      router.push("/community");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-6">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border px-4 py-2 rounded"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full border px-4 py-2 rounded"
          placeholder="Write your post here..."
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <select
          className="w-full border px-4 py-2 rounded"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        >
          <option value="">Select a Topic</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}
