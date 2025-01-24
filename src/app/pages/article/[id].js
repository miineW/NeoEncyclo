import { useRouter } from 'next/router';
import data from '../../../data.sample.json';
import { useEffect } from 'react';

export default function Article() {
  const router = useRouter();
  const { id } = router.query;

  console.log('Article ID:', id);

  useEffect(() => {
    if (id) {
      const article = data.find(item => item.id === id);
      console.log('Article ID:', id);
      console.log('Article Data:', article);
    }
  }, [id]);

  if (!id) return <p>Loading...</p>;

  const article = data.find(item => item.id === id);

  if (!article) return <p>Loading...</p>;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-left">{article.title}</h1>
        <div className="text-sm text-gray-400 mb-4">
          <p>作者: {article.author}</p>
          <p>发表时间: {article.date}</p>
          <p>阅读次数: {article.views}</p>
          <p>点赞次数: {article.likes}</p>
        </div>
        <p className="text-sm mb-2 text-left indent-4">{article.content}</p>
        {article.image && <img src={article.image} alt={article.title} className="w-full h-auto rounded" />}
      </div>
    </main>
  );
} 