"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from './components/Header';

export default function Home() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (searchQuery) {
      fetchResults(currentPage);
    } else {
      setResults([]);
    }
  }, [searchQuery, currentPage]);

  const fetchResults = async (page) => {
    try {
      const response = await fetch(`/api/searchAll?page=${page}&query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('搜索出错:', error);
      setResults([]);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <Header />
        
        {/* 搜索结果 */}
        {searchQuery && (
          <div className="max-w-2xl mx-auto">
            {results.length > 0 ? (
              <>
                {results.map((article) => (
                  <div key={article.id} className="bg-gray-800 p-4 rounded-lg mb-4">
                    <h2 className="text-2xl font-bold mb-2">
                      <a href={`/article/${article.id}`} className="hover:text-blue-400 transition-colors">
                        {article.title}
                      </a>
                    </h2>
                    <div className="text-sm text-gray-400 mb-2">
                      <span>作者: {article.author}</span>
                      <span className="mx-2">|</span>
                      <span>发表时间: {article.date}</span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-3">{article.content}</p>
                  </div>
                ))}
                
                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded ${
                          page === currentPage 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-gray-400">未找到相关文章</p>
            )}
          </div>
        )}

        {/* 欢迎信息 */}
        {!searchQuery && (
          <div className="max-w-2xl mx-auto text-center mt-20">
            <h2 className="text-2xl font-bold mb-4">欢迎来到 ChamCham</h2>
            <p className="text-gray-400">请在上方搜索框中输入关键词开始搜索</p>
          </div>
        )}
      </div>
    </main>
  );
}
