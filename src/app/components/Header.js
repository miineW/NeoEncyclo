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
    <div className="mb-8">
      {/* 标题和搜索框 */}
      <div className="text-center">
        <Link href="/">
          <h1 className="text-4xl font-bold mb-4 hover:text-blue-400 transition-colors">新奇百科</h1>
        </Link>
        <form onSubmit={handleSearch} className="flex justify-center mb-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文章..."
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  router.push('/');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-500 focus:outline-none"
              >
                &times;
              </button>
            )}
          </div>
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          >
            搜索
          </button>
        </form>
      </div>
    </div>
  );
} 