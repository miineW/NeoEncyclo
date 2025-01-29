const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'chamcham';

async function queryArticles() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const articlesCol = db.collection('articles');
    const wordSegmentsCol = db.collection('word_segments');
    
    // 查询文章总数
    const articleCount = await articlesCol.countDocuments();
    console.log(`\n总文章数: ${articleCount}`);
    
    // 查看前3篇文章
    console.log('\n前3篇文章示例:');
    const articles = await articlesCol.find().limit(3).toArray();
    articles.forEach(article => {
      console.log('\n---文章信息---');
      console.log('文章ID:', article._id);
      console.log('序号:', article.articleNum);
      console.log('发布时间:', article.publishTime);
      console.log('内容:', article.content);
      console.log('创建时间:', article.createdAt);
    });
    
    // 查询分词总数
    const wordCount = await wordSegmentsCol.countDocuments();
    console.log(`\n总分词数: ${wordCount}`);
    
    // 查看一些分词示例
    console.log('\n分词示例:');
    const words = await wordSegmentsCol.find().limit(3).toArray();
    words.forEach(word => {
      console.log('\n---分词信息---');
      console.log('词语:', word.word);
      console.log('出现在文章:', word.articleIds.length, '次');
      console.log('第一篇文章ID:', word.articleIds[0]);
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// 执行查询
queryArticles().catch(console.error); 