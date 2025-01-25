'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}&type=all`);
    }
  };

  return (
    <div className="text-center mb-8">
      <Link href="/">
        <h1 className="text-4xl font-bold mb-4 hover:text-blue-400 transition-colors">ChamCham</h1>
      </Link>
      <form onSubmit={handleSearch} className="flex justify-center mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索文章..."
          className="w-full max-w-md px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </form>
    </div>
  );
} 