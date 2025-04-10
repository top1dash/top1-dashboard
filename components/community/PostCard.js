import Link from "next/link";

export default function PostCard({ post }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <Link href={`/community/${post.id}`}>
        <h3 className="text-xl font-semibold text-blue-700 hover:underline">
          {post.title}
        </h3>
      </Link>
      <p className="text-sm text-gray-600 mt-1">
        Posted by <span className="font-medium">{post.author?.username}</span> in{" "}
        <span className="italic">{post.topic?.name}</span>
      </p>
      <p className="mt-4 text-gray-800 line-clamp-3">{post.content}</p>
    </div>
  );
}
