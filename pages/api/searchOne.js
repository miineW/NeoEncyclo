export default function handler(req, res) {
  const { query } = req.query;
  // 在这里处理查询逻辑
  res.status(200).json({ message: `Search one for: ${query}` });
} 