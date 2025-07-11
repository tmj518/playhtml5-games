const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

// 监听规则
const watchRules = [
  { src: 'src/data', dest: 'public/data' },
  { src: 'src/assets/js', dest: 'public/js' },
  { src: 'public/games', dest: null }, // 只监听变动
  { src: 'public/images/games', dest: null }
];

function runImageOptimizeAndAutoGenerateGames() {
  exec('node scripts/image-optimize.js', (err, stdout, stderr) => {
    if (err) {
      console.error('[图片优化] 失败:', err);
    } else {
      process.stdout.write(stdout);
      runAutoGenerateGames();
    }
  });
}

function runAutoGenerateGames() {
  exec('node scripts/auto-generate-games.js', (err, stdout, stderr) => {
    if (err) {
      console.error('[自动生成] games.json 失败:', err);
    } else {
      process.stdout.write(stdout);
    }
  });
}

watchRules.forEach(({ src, dest }) => {
  chokidar.watch(src, { ignoreInitial: true }).on('all', (event, filePath) => {
    if (dest) {
      const relPath = path.relative(src, filePath);
      const destPath = path.join(dest, relPath);
      if (event === 'add' || event === 'change') {
        fs.copy(filePath, destPath).then(() => {
          console.log(`[同步] ${filePath} → ${destPath}`);
        });
      }
      if (event === 'unlink') {
        fs.remove(destPath).then(() => {
          console.log(`[删除] ${destPath}`);
        });
      }
    }
    // public/images/games 有变动时，先图片优化再生成 games.json
    if (src === 'public/images/games') {
      runImageOptimizeAndAutoGenerateGames();
    } else if (src === 'public/games') {
      runAutoGenerateGames();
    }
  });
});

console.log('正在监听 src/data、src/assets/js、public/games、public/images/games 目录变动，自动同步、图片优化、alt生成并生成最新 games.json...'); 