import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import PostCard from "../../components/community/PostCard";
import SidebarTopics from "../../components/community/SidebarTopics";
import Link from "next/link";


export default function CommunityHome() {
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
  const { data: postData } = await supabase
    .from("post_with_metadata")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: topicData } = await supabase
    .from("topics")
    .select("id, name");

  setPosts(postData || []);
  setTopics(topicData || []);
}

  return (
    <div className="flex min-h-screen bg-gray-50 px-4 py-6 md:px-12">
      {/* Sidebar */}
      <aside className="w-64 mr-8 hidden lg:block">
        <SidebarTopics topics={topics} />
      </aside>

      {/* Main content */}
      <main className="flex-1 space-y-6">
      <div className="text-right">
        <Link
          href="/community/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Post
        </Link>
      </div>
    
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet. Be the first to post!</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </main>

    </div>
  );
}
