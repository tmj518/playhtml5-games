const fs = require('fs-extra');
const path = require('path');

// 支持的分类（与前端按钮一致，全部小写）
const CATEGORY_LIST = [
  "all", "new", "popular", "puzzle", "action", "arcade", "strategy",
  "adventure", "card", "sports", "educational", "casual"
];

const gamesDir = path.join(__dirname, '../public/games');
const imagesDir = path.join(__dirname, '../public/images/games');
const dataFile = path.join(__dirname, '../public/data/games.json');

function parseCategoriesFromFilename(filename) {
  // 取文件名（不含扩展名），按下划线分割
  const base = filename.split('.')[0];
  const parts = base.split('_');
  // 只取前面连续的合法分类（如 puzzle_action_2048 取 ["puzzle", "action"]）
  const categories = [];
  for (const part of parts) {
    if (CATEGORY_LIST.includes(part.toLowerCase())) {
      categories.push(part.toLowerCase());
    } else {
      break;
    }
  }
  // 没有合法分类则归为 other
  return categories.length ? categories : ["other"];
}

(async () => {
  const htmlFiles = (await fs.readdir(gamesDir)).filter(f => f.endsWith('.html'));
  const imageFiles = await fs.readdir(imagesDir);
  const games = [];
  let id = 1000;
  for (const html of htmlFiles) {
    const base = path.basename(html, '.html');
    // 匹配图片（支持 png/jpg/jpeg）
    const image = imageFiles.find(img =>
      img.startsWith(base + '.') ||
      img.startsWith(base.replace(/_/g, '-') + '.')
    ) || '';
    if (!image) continue;
    id++;
    const categories = parseCategoriesFromFilename(html);
    games.push({
      id,
      title: {
        en: `${base.toUpperCase()} Game`,
        zh: `${base.toUpperCase()} 小游戏`,
        ja: `${base.toUpperCase()} ゲーム`,
        ko: `${base.toUpperCase()} 게임`
      },
      description: {
        en: `A brand new HTML5 ${categories.join(', ')} game!`,
        zh: `全新HTML5${categories.join('、')}小游戏！`,
        ja: `新しいHTML5${categories.join('・')}ゲーム！`,
        ko: `새로운 HTML5 ${categories.join(', ')} 게임!`
      },
      image: `/images/games/${image}`,
      category: categories,
      rating: 4.8,
      developer: "AutoSync",
      published: new Date().toISOString().slice(0, 10),
      plays: "0+",
      regions: ["global"],
      url: `/games/${html}`
    });
  }
  await fs.ensureDir(path.dirname(dataFile));
  await fs.writeJson(dataFile, { games }, { spaces: 2 });
  console.log(`[自动生成] 已生成最新 games.json，包含 ${games.length} 个游戏。`);
})(); 