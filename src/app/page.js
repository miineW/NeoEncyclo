"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from './components/Header';

// 高亮文本的辅助函数
function highlightText(text, keywords) {
  if (!keywords || !keywords.length) return text;
  
  // 转义正则表达式特殊字符
  const escapedKeywords = keywords.map(word => 
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  
  // 创建正则表达式，匹配任意关键词
  const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
  
  // 将文本分割成段落
  const paragraphs = text.split('\n').filter(p => p.trim());
  
  // 处理每个段落
  return paragraphs.map((paragraph, index) => {
    // 检查是否是特殊字段（发布时间等）
    if (paragraph.startsWith('发布时间：') ||
        paragraph.startsWith('微博位置：') ||
        paragraph.startsWith('点赞数：') ||
        paragraph.startsWith('转发数：') ||
        paragraph.startsWith('评论数：')) {
      return null; // 这些信息已经在其他地方显示了
    }

    // 处理普通段落
    return (
      <p key={index} className="text-sm text-gray-300 mb-3 leading-relaxed">
        {paragraph.split(regex).map((part, i) => {
          const isKeyword = escapedKeywords.some(
            word => part.toLowerCase() === word.toLowerCase()
          );
          return isKeyword ? (
            <span key={i} className="bg-yellow-500/30 text-yellow-200 px-1 rounded">
              {part}
            </span>
          ) : (
            part
          );
        })}
        <br />
      </p>
    );
  }).filter(Boolean); // 移除 null 值
}

export default function Home() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [keywords, setKeywords] = useState([]);

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
        setKeywords(data.words || []); // 保存分词结果
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
                  <div key={article.id} className="bg-gray-800 p-6 rounded-lg mb-6">
                    <div className="text-base font-bold text-gray-300 mb-4 pb-2 border-b border-gray-700">
                      <span>发布时间: {article.publishTime}</span>
                      {article.matchScore && (
                        <span className="ml-4">
                          匹配度: <span className="text-yellow-400">{article.matchScore}</span>
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {highlightText(article.content, keywords)}
                    </div>
                  </div>
                ))}
                
                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-6">
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
            <p className="text-gray-400">请在上方搜索框中输入关键词开始搜索</p>
          </div>
        )}
      </div>
    </main>
  );
}
