const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '../public/images/games');
const outputAltFile = path.join(imagesDir, 'images-alt.json');

// 关键词和分类可根据文件名自动提取
function parseMeta(filename) {
  // 例：puzzle-2048-game.webp
  const base = filename.split('.')[0];
  const parts = base.split('-');
  // 分类在首位，游戏名中间，game结尾
  const category = parts[0] || 'game';
  const name = parts.slice(1, -1).join(' ');
  const keyword = parts.slice(1).join(' ');
  return {
    category,
    name: name || category,
    keyword: keyword || category
  };
}

function isOptimizedFile(file) {
  // 判断是否已是目标 webp/jpg 文件名
  return /^(.*)-[a-z0-9]+\.(webp|jpg)$/i.test(file);
}

(async () => {
  const files = (await fs.readdir(imagesDir)).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  const altMap = {};
  for (const file of files) {
    if (isOptimizedFile(file)) {
      // 已是目标 webp/jpg 文件名，跳过压缩和重命名
      continue;
    }
    const srcPath = path.join(imagesDir, file);
    const base = path.basename(file, path.extname(file));
    // 目标文件名：全部小写+短横线
    const safeName = base.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const meta = parseMeta(safeName);
    // 目标 webp 路径
    const webpPath = path.join(imagesDir, `${safeName}.webp`);
    // 目标 jpg 路径
    const jpgPath = path.join(imagesDir, `${safeName}.jpg`);
    let webpOk = false, jpgOk = false;
    try {
      // 压缩并输出 webp
      await sharp(srcPath)
        .resize({ width: 800, height: 600, fit: 'inside' })
        .webp({ quality: 80 })
        .toFile(webpPath);
      webpOk = true;
      // 压缩并输出 jpg
      await sharp(srcPath)
        .resize({ width: 800, height: 600, fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(jpgPath);
      jpgOk = true;
      // alt 文本自动生成
      altMap[`${safeName}.webp`] = `${meta.category} ${meta.name} html5 game, ${meta.keyword} online play, free ${meta.category} game`;
      altMap[`${safeName}.jpg`] = `${meta.category} ${meta.name} html5 game, ${meta.keyword} online play, free ${meta.category} game`;
      console.log(`[图片优化] ${file} → ${safeName}.webp / ${safeName}.jpg`);
    } catch (err) {
      console.error(`[图片优化失败] ${file}：`, err.message);
    }
    // 只有当 webp 和 jpg 都生成成功时才删除原图
    if (webpOk && jpgOk) {
      await fs.remove(srcPath);
      console.log(`[清理] 已删除原始图片 ${file}`);
    } else {
      console.warn(`[保留] 未成功优化的原始图片 ${file}`);
    }
  }
  // 生成 alt 文本（包括所有 webp/jpg 文件）
  const allFiles = await fs.readdir(imagesDir);
  for (const file of allFiles) {
    if (/\.(webp|jpg)$/i.test(file)) {
      const base = path.basename(file, path.extname(file));
      const meta = parseMeta(base);
      altMap[file] = `${meta.category} ${meta.name} html5 game, ${meta.keyword} online play, free ${meta.category} game`;
    }
  }
  await fs.writeJson(outputAltFile, altMap, { spaces: 2 });
  console.log(`[alt生成] 已输出 alt 文本到 images-alt.json`);
})(); 