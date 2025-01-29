const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'chamcham';

async function clearDatabase() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // 清空所有相关集合
    await db.collection('word_segments').deleteMany({});
    await db.collection('articles').deleteMany({});
    
    console.log('Successfully cleared all data from the database');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// 执行清理操作
clearDatabase().catch(console.error); 