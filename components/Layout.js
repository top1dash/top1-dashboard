// components/Layout.js
import Navbar from './Navbar'

export default function Layout({ children, noBackground }) {
  return (
    <div className={`min-h-screen ${
      noBackground
        ? 'bg-gray-100 dark:bg-gray-950'
        : 'bg-gray-100 dark:bg-gray-950 bg-[url("/top1percent2.png")] dark:bg-none bg-top bg-no-repeat bg-cover'
    } text-gray-900 dark:text-white`}>
      <Navbar />
      <main className="w-full px-4 py-8">
        {children}
      </main>
    </div>
  )
}
