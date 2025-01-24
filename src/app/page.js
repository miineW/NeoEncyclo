"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchResults(currentPage);
  }, [currentPage]);

  const fetchResults = (page) => {
    fetch(`/api/searchAll?page=${page}&query=${searchValue}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setResults(data.results || []);
        setTotalPages(data.totalPages);
      })
      .catch(error => console.error('Error:', error));
  };

  const onSearchAll = () => {
    setCurrentPage(1);
    fetchResults(1);
  };

  const onSearchOne = () => {
    fetch(`/api/searchOne?query=${searchValue}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setResults(data.results || []);
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-center w-full max-w-2xl ${results.length > 0 ? 'mt-4' : 'flex flex-col items-center justify-center'}">
        <h1 className="text-4xl font-bold mb-4 text-center">Welcome To Dao</h1>
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-1/2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
        <div className="mt-4 flex space-x-4 justify-center">
          <button onClick={onSearchAll} className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 active:bg-gray-500 transition-all">寻踪</button>
          <button onClick={onSearchOne} className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 active:bg-gray-500 transition-all">觅源</button>
        </div>
      </div>
      <div className="mt-8 w-full max-w-2xl">
        {results.map((result, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg mb-4 text-center">
            <h2 className="text-2xl font-bold mb-2 text-left">
              <a href={`/article/${result.id}`} target="_blank" className="hover:underline">{result.title}</a>
            </h2>
            <p className="text-xs mb-2 text-left indent-4">{result.content}</p>
            {result.image && <Image src={result.image} alt={result.title} width={500} height={300} className="w-full h-auto rounded" />}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex space-x-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
