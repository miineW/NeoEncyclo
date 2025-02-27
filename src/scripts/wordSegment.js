const fs = require('fs');
const nodejieba = require('nodejieba');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const path = require('path');
const csv = require('csv-parser');

// 生成 GUID
function generateGUID() {
  return crypto.randomUUID();
}

// MongoDB连接配置
const url = 'mongodb://localhost:27017';
const dbName = 'chamcham';
const wordSegmentsCollection = 'word_segments';
const articlesCollection = 'articles';

const dataDir = 'data';

// 读取CSV文件
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// 读取TXT文件
function readTXT(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// 存储文章内容的数组
const savedArticles = [];

// 读取data文件夹中的所有txt文件
const txtFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.txt'));

// 遍历每个txt文件并分析内容
txtFiles.forEach(async (txtFile) => {
  const txtFilePath = path.join(dataDir, txtFile);
  const csvFilePath = path.join(dataDir, txtFile.replace('.txt', '.csv'));

  // 读取CSV文件
  const csvData = await readCSV(csvFilePath);
  const txtContent = readTXT(txtFilePath);

  // 找到"原创微博内容："的位置
  const startIndex = txtContent.indexOf('原创微博内容：');
  if (startIndex === -1) return; // 如果没有找到，跳过该文件

  // 提取文章内容
  const contentAfterOriginal = txtContent.substring(startIndex + '原创微博内容：'.length);
  const articles = contentAfterOriginal.split(/发布工具：.*\n/).map(article => article.trim());

  articles.forEach(article => {
    // 去除末尾的几行信息
    const lines = article.split('\n');
    const filteredLines = lines.filter(line => 
      !line.startsWith('微博位置：') &&
      !line.startsWith('发布时间：') &&
      !line.startsWith('点赞数：') &&
      !line.startsWith('转发数：') &&
      !line.startsWith('评论数：') &&
      !line.startsWith('发布工具：')
    );
    const cleanedArticle = filteredLines.join('\n');

    const first10Chars = cleanedArticle.slice(0, 10);

    csvData.forEach(row => {
      if (row["微博正文"].startsWith(first10Chars)) {
        const articleID = row['微博id']; // 通过索引访问"微博ID"
        const currentPublishTime = row['发布时间'];

        // 存储匹配结果
        console.log(`匹配成功：文章ID ${articleID} 对应的文章内容已存储。`);
        
        // 创建文章对象，使用微博ID作为文章ID
        savedArticles.push({
          _id: articleID,
          content: cleanedArticle,
          publishTime: currentPublishTime,
          createdAt: new Date()
        });
      }
    });
  });
});

// 存储文章和分词到MongoDB
async function storeArticlesAndSegments() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const articlesCol = db.collection(articlesCollection);
    const wordSegmentsCol = db.collection(wordSegmentsCollection);
    
    // 清空已有数据
    await articlesCol.deleteMany({});
    await wordSegmentsCol.deleteMany({});
    console.log('Cleared existing data');
    
    // 存储文章内容
    for (const article of savedArticles) {
      // 检查是否已经存在相同的文章ID
      const existingArticle = await articlesCol.findOne({ _id: article._id });
      if (existingArticle) {
        console.log(`跳过存储：文章ID ${article._id} 已存在。`);
        continue; // 跳过存储
      }
      
      // 插入文章
      await articlesCol.insertOne(article);
      console.log(`存储成功：文章ID ${article._id}`);
    }
    
    // 遍历每篇文章进行分词
    for (const article of savedArticles) {
      const words = nodejieba.cut(article.content);
      const uniqueWords = new Set(words);

      for (const word of uniqueWords) {
        await wordSegmentsCol.updateOne(
          { word: word },
          { $addToSet: { articleIds: article._id } },
          { upsert: true }
        );
      }
    }
    
    console.log('Word segments stored successfully');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// 执行存储操作
storeArticlesAndSegments().catch(console.error);