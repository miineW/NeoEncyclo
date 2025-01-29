const fs = require('fs');
const nodejieba = require('nodejieba');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

// 生成 GUID
function generateGUID() {
  return crypto.randomUUID();
}

// MongoDB连接配置
const url = 'mongodb://localhost:27017';
const dbName = 'chamcham';
const wordSegmentsCollection = 'word_segments';
const articlesCollection = 'articles';

// 读取文件内容
const content = fs.readFileSync('1849720980.txt', 'utf-8');

// 初始化词-文章ID映射
const wordArticleMap = new Map();

// 存储文章内容的数组
const articles = [];

// 处理文本内容
let currentArticleNum = 1;
let isContent = false;
let currentContent = [];
let foundFirstTool = false;
let currentPublishTime = '';

// 按行分割内容
const lines = content.split('\n');

// 遍历每一行
for (let line of lines) {
  line = line.trim();
  
  // 记录发布时间
  if (line.startsWith('发布时间：')) {
    currentPublishTime = line.substring('发布时间：'.length).trim();
    continue;
  }
  
  // 检查是否是需要跳过的行
  if (line.startsWith('微博位置：') ||
      line.startsWith('点赞数：') ||
      line.startsWith('转发数：') ||
      line.startsWith('评论数：')) {
    continue;
  }
  
  // 检查是否是文章分隔符
  if (line.startsWith('发布工具：')) {
    foundFirstTool = true;
    // 处理当前文章的所有内容
    if (currentContent.length > 0) {
      // 在 '答：' 前添加换行符
      const text = currentContent.join('\n').replace(/(答：)/g, '\n$1');
      
      // 创建文章对象，使用 GUID 作为 ID，并添加发布时间
      articles.push({
        _id: generateGUID(),
        articleNum: currentArticleNum,
        content: text + '\n\n发布时间：' + currentPublishTime,
        publishTime: currentPublishTime,
        createdAt: new Date()
      });
      
      // 重置并准备处理下一篇文章
      currentArticleNum++;
      currentContent = [];
      currentPublishTime = '';
    }
    isContent = false;
    continue;
  }
  
  // 如果找到空行，且已经遇到过发布工具，开始收集新文章
  if (foundFirstTool && line === '') {
    isContent = true;
    continue;
  }
  
  // 如果是文章内容，添加到当前内容数组
  if (isContent && line && !line.includes('原创微博内容：')) {
    currentContent.push(line);
  }
}

// 处理最后一篇文章（如果有）
if (currentContent.length > 0) {
  const text = currentContent.join('\n').replace(/(答：)/g, '\n$1');
  articles.push({
    _id: generateGUID(),
    articleNum: currentArticleNum,
    content: text + '\n\n发布时间：' + currentPublishTime,
    publishTime: currentPublishTime,
    createdAt: new Date()
  });
}

// 存储到MongoDB
async function saveToMongoDB() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const wordSegmentsCol = db.collection(wordSegmentsCollection);
    const articlesCol = db.collection(articlesCollection);
    
    // 清空已有数据
    await wordSegmentsCol.deleteMany({});
    await articlesCol.deleteMany({});
    console.log('Cleared existing data');
    
    // 存储文章内容
    const result = await articlesCol.insertMany(articles);
    console.log(`Inserted ${result.insertedCount} articles`);
    
    // 处理分词
    const wordSegments = [];
    for (const article of articles) {
      const words = nodejieba.cut(article.content);
      
      words.forEach(word => {
        if (word.trim() && !/^\s+$/.test(word)) {
          if (!wordArticleMap.has(word)) {
            wordArticleMap.set(word, new Set());
          }
          wordArticleMap.get(word).add(article._id);
        }
      });
    }
    
    // 转换为MongoDB文档格式
    for (const [word, articleIds] of wordArticleMap) {
      wordSegments.push({
        word: word,
        articleIds: Array.from(articleIds),
        createdAt: new Date()
      });
    }
    
    // 插入分词数据
    const segmentResult = await wordSegmentsCol.insertMany(wordSegments);
    console.log(`Inserted ${segmentResult.insertedCount} word segments`);
    
    // 创建索引
    await wordSegmentsCol.createIndex({ word: 1 });
    await articlesCol.createIndex({ articleNum: 1 });
    await articlesCol.createIndex({ _id: 1 });
    await articlesCol.createIndex({ publishTime: 1 });
    console.log('Created indexes');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// 执行存储操作
saveToMongoDB().catch(console.error); 