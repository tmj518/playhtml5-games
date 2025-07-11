const fs = require('fs');
const path = require('path');

// 配置默认SEO信息
const defaultSEO = {
  siteName: 'PlayHTML5',
  siteUrl: 'https://www.ukhtml5games.com',
  description: 'Free HTML5 Games Platform',
  keywords: 'HTML5 games, free games, online games, PlayHTML5',
  ogImage: 'https://www.ukhtml5games.com/images/og-image.jpg',
};

// 递归获取所有html文件
function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// 检查并补全SEO标签
function fixSEO(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // 备份原文件
  const backupPath = filePath + '.bak';
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, html);
  }

  // 1. <title>
  if (!/<title>.*<\/title>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <title>${defaultSEO.siteName} - Free HTML5 Games</title>`);
    changed = true;
  }

  // 2. <meta name="description">
  if (!/<meta[^>]+name=["']description["']/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <meta name="description" content="${defaultSEO.description}">`);
    changed = true;
  }

  // 3. <meta name="keywords">
  if (!/<meta[^>]+name=["']keywords["']/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <meta name="keywords" content="${defaultSEO.keywords}">`);
    changed = true;
  }

  // 4. <link rel="canonical">
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) {
    // 尝试自动推断URL
    const relPath = filePath.replace(/^public[\\\/]/, '').replace(/\\/g, '/');
    const url = relPath === 'index.html' ? defaultSEO.siteUrl + '/' : defaultSEO.siteUrl + '/' + relPath;
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <link rel="canonical" href="${url}">`);
    changed = true;
  }

  // 5. OG标签
  if (!/<meta[^>]+property=["']og:title["']/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <meta property="og:title" content="${defaultSEO.siteName} - Free HTML5 Games">`);
    changed = true;
  }
  if (!/<meta[^>]+property=["']og:description["']/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <meta property="og:description" content="${defaultSEO.description}">`);
    changed = true;
  }
  if (!/<meta[^>]+property=["']og:type["']/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <meta property="og:type" content="website">`);
    changed = true;
  }
  if (!/<meta[^>]+property=["']og:url["']/i.test(html)) {
    const relPath = filePath.replace(/^public[\\\/]/, '').replace(/\\/g, '/');
    const url = relPath === 'index.html' ? defaultSEO.siteUrl + '/' : defaultSEO.siteUrl + '/' + relPath;
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <meta property="og:url" content="${url}">`);
    changed = true;
  }
  if (!/<meta[^>]+property=["']og:image["']/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <meta property="og:image" content="${defaultSEO.ogImage}">`);
    changed = true;
  }

  // 6. 结构化数据（JSON-LD）
  if (!/<script[^>]+type=["']application\/ld\+json["']/i.test(html)) {
    // 默认插入WebSite类型
    const jsonld = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": defaultSEO.siteName,
      "url": defaultSEO.siteUrl,
      "description": defaultSEO.description
    };
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <script type="application/ld+json">\n    ${JSON.stringify(jsonld, null, 2)}\n    </script>`);
    changed = true;
  }

  // 保存修改
  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`✔ 补全SEO标签: ${filePath}`);
  } else {
    console.log(`- 已齐全: ${filePath}`);
  }
}

// 主程序
function main() {
  const publicDir = path.join(__dirname, '../public');
  const htmlFiles = getAllHtmlFiles(publicDir);
  htmlFiles.forEach(fixSEO);
  console.log('全部处理完成！');
}

main(); 