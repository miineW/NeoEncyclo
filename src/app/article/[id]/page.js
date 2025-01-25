import data from '../../../../data.sample.json';
import Header from '../../components/Header';

export default function Page({ params }) {
  const { id } = params;
  const article = data.find(item => item.id === id);

  if (!article) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-4">
        <div className="container mx-auto">
          <Header />
          <p className="text-center">文章未找到</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <Header />
        
        {/* 文章内容 */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-left">{article.title}</h2>
          <div className="text-sm text-gray-400 mb-4">
            <p>作者: {article.author}</p>
            <p>发表时间: {article.date}</p>
            <p>阅读次数: {article.views}</p>
            <p>点赞次数: {article.likes}</p>
          </div>
          <p className="text-sm mb-2 text-left indent-4">{article.content}</p>
          {article.image && <img src={article.image} alt={article.title} className="w-full h-auto rounded" />}
        </div>
      </div>
    </main>
  );
} 