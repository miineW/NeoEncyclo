import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { page = 1 } = req.query; // 获取当前页码，默认为1
  const filePath = path.join(process.cwd(), 'data.sample.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContents);

  const totalItems = data.length;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const results = data.slice(startIndex, endIndex);

  res.status(200).json({
    totalItems,
    totalPages,
    results
  });
} 