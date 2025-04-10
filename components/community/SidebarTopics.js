export default function SidebarTopics({ topics }) {
  return (
    <div className="sticky top-6 bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Topics</h2>
      <ul className="space-y-2">
        {topics.map((topic) => (
          <li key={topic.id}>
            <a
              href={`/community/topic/${topic.name}`}
              className="text-blue-600 hover:underline"
            >
              {topic.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
