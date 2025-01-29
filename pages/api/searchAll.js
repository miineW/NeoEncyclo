import { MongoClient } from 'mongodb';
import nodejieba from 'nodejieba';

const url = 'mongodb://localhost:27017';
const dbName = 'chamcham';

export default async function handler(req, res) {
  const { query, page = 1 } = req.query;
  const pageSize = 10;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const client = new MongoClient(url);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // 1. 对搜索关键词进行分词
    const words = nodejieba.cut(query);
    
    // 2. 从分词集合中查找包含任意关键词的文章ID
    // 使用正则表达式进行部分匹配
    const wordSegments = await db.collection('word_segments')
      .find({
        $or: [
          // 精确匹配完整查询词
          { word: query },
          // 分词匹配
          { word: { $in: words } },
          // 部分匹配（包含查询词的任何部分）
          { word: { $regex: words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') } }
        ]
      })
      .toArray();
    
    if (!wordSegments.length) {
      return res.json({
        results: [],
        totalPages: 0,
        currentPage: page,
        totalResults: 0
      });
    }
    
    // 3. 合并所有文章ID，并计算每个文章的匹配分数
    const articleScores = new Map();
    wordSegments.forEach(segment => {
      // 根据匹配类型给予不同的分数
      let score = 1;
      if (segment.word === query) {
        score = 3;  // 完整匹配给予更高分数
      } else if (words.includes(segment.word)) {
        score = 2;  // 分词匹配给予中等分数
      }
      
      segment.articleIds.forEach(articleId => {
        articleScores.set(articleId, (articleScores.get(articleId) || 0) + score);
      });
    });
    
    // 4. 将文章ID转换为数组并按匹配分数排序
    const articleIds = Array.from(articleScores.entries())
      .sort((a, b) => b[1] - a[1])  // 按分数降序排序
      .map(entry => entry[0]);       // 只保留文章ID
    
    const totalResults = articleIds.length;
    const totalPages = Math.ceil(totalResults / pageSize);
    const skip = (page - 1) * pageSize;
    const pageArticleIds = articleIds.slice(skip, skip + pageSize);
    
    // 5. 获取当前页的文章内容
    const articles = await db.collection('articles')
      .find({ _id: { $in: pageArticleIds } })
      .toArray();
    
    // 6. 按照分数排序的顺序重新排列文章
    const sortedArticles = pageArticleIds
      .map(id => articles.find(article => article._id === id))
      .filter(Boolean);
    
    // 7. 格式化结果
    const results = sortedArticles.map(article => ({
      id: article._id,
      title: article.content.split('\n')[0], // 使用第一行作为标题
      content: article.content,
      publishTime: article.publishTime,
      matchScore: articleScores.get(article._id) // 添加匹配分数
    }));
    
    res.json({
      results,
      totalPages,
      currentPage: parseInt(page),
      totalResults,
      words, // 返回分词结果，方便调试
      query  // 返回原始查询词，方便调试
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
} 