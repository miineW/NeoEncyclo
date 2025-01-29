const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'chamcham';
const collectionName = 'word_segments';

async function searchWord(word) {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const cursor = collection.find({ word: word });
    const results = await cursor.toArray();
    
    if (results.length > 0) {
      console.log(`找到词语: "${word}"`);
      results.forEach(result => {
        console.log(`出现在以下文章中: ${result.articleIds.join(', ')}`);
        console.log(`创建时间: ${result.createdAt}`);
        console.log('---');
      });
    } else {
      console.log(`未找到词语: "${word}"`);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// 搜索特定词语
searchWord('大吉大利').catch(console.error); 