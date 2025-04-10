import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PostCard from "../../components/community/PostCard";
import SidebarTopics from "../../components/community/SidebarTopics";

export default function CommunityHome() {
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: postData } = await supabase
      .from("posts")
      .select("id, title, content, created_at, author:profiles(username), topic:topics(name)")
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
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </main>
    </div>
  );
}
