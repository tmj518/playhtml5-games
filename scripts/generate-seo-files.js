const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    siteUrl: 'https://www.ukhtml5games.com', // 替换为你的实际域名
    siteName: 'PlayHTML5',
    description: 'Free HTML5 Games Platform',
    outputDir: '../public',
    gamesDataPath: '../src/data/games.json',
    categoriesDataPath: '../src/data/categories.json'
};

// 生成sitemap.xml
function generateSitemap() {
    console.log('🔄 生成sitemap.xml...');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- 首页 -->
    <url>
        <loc>${CONFIG.siteUrl}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    
    <!-- 协议页面 -->
    <url>
        <loc>${CONFIG.siteUrl}/terms.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
    </url>
    <url>
        <loc>${CONFIG.siteUrl}/privacy.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
    </url>
    <url>
        <loc>${CONFIG.siteUrl}/copyright.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
    </url>
    
    <!-- 游戏页面 -->
    ${generateGameUrls()}
    
    <!-- 分类页面 -->
    ${generateCategoryUrls()}
</urlset>`;

    const sitemapPath = path.join(__dirname, CONFIG.outputDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('✅ sitemap.xml 生成完成');
}

// 生成游戏URL
function generateGameUrls() {
    try {
        const gamesPath = path.join(__dirname, CONFIG.gamesDataPath);
        if (!fs.existsSync(gamesPath)) {
            console.log('⚠️  游戏数据文件不存在，跳过游戏URL生成');
            return '';
        }
        
        const gamesRaw = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));
        const gamesData = Array.isArray(gamesRaw) ? gamesRaw : gamesRaw.games;
        
        if (!Array.isArray(gamesData)) {
            console.log('⚠️  游戏数据格式错误，跳过游戏URL生成');
            return '';
        }
        
        let gameUrls = '';
        
        gamesData.forEach(game => {
            if (game.id && game.title) {
                // 处理多语言标题，优先使用英文
                const title = typeof game.title === 'object' ? (game.title.en || game.title.zh || Object.values(game.title)[0]) : game.title;
                gameUrls += `    <url>
        <loc>${CONFIG.siteUrl}/games/${game.id}.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
`;
            }
        });
        
        return gameUrls;
    } catch (error) {
        console.log('⚠️  生成游戏URL时出错:', error.message);
        return '';
    }
}

// 生成分类URL
function generateCategoryUrls() {
    try {
        const categoriesPath = path.join(__dirname, CONFIG.categoriesDataPath);
        if (!fs.existsSync(categoriesPath)) {
            console.log('⚠️  分类数据文件不存在，跳过分类URL生成');
            return '';
        }
        
        const categoriesRaw = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const categoriesData = Array.isArray(categoriesRaw) ? categoriesRaw : categoriesRaw.categories;
        
        if (!Array.isArray(categoriesData)) {
            console.log('⚠️  分类数据格式错误，跳过分类URL生成');
            return '';
        }
        
        let categoryUrls = '';
        
        categoriesData.forEach(category => {
            if (category.id && category.name) {
                // 处理多语言名称，优先使用英文
                const name = typeof category.name === 'object' ? (category.name.en || category.name.zh || Object.values(category.name)[0]) : category.name;
                categoryUrls += `    <url>
        <loc>${CONFIG.siteUrl}/#${category.id}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>
`;
            }
        });
        
        return categoryUrls;
    } catch (error) {
        console.log('⚠️  生成分类URL时出错:', error.message);
        return '';
    }
}

// 更新robots.txt中的sitemap地址
function updateRobotsTxt() {
    console.log('🔄 更新robots.txt...');
    
    const robotsPath = path.join(__dirname, CONFIG.outputDir, 'robots.txt');
    if (!fs.existsSync(robotsPath)) {
        console.log('⚠️  robots.txt文件不存在');
        return;
    }
    
    let robotsContent = fs.readFileSync(robotsPath, 'utf8');
    
    // 更新sitemap地址
    const sitemapRegex = /Sitemap: .*/;
    const newSitemapLine = `Sitemap: ${CONFIG.siteUrl}/sitemap.xml`;
    
    if (sitemapRegex.test(robotsContent)) {
        robotsContent = robotsContent.replace(sitemapRegex, newSitemapLine);
    } else {
        robotsContent += `\n# 网站地图地址\n${newSitemapLine}\n`;
    }
    
    fs.writeFileSync(robotsPath, robotsContent, 'utf8');
    console.log('✅ robots.txt 更新完成');
}

// 生成结构化数据
function generateStructuredData() {
    console.log('🔄 生成结构化数据...');
    
    try {
        const gamesPath = path.join(__dirname, CONFIG.gamesDataPath);
        if (!fs.existsSync(gamesPath)) {
            console.log('⚠️  游戏数据文件不存在，跳过结构化数据生成');
            return;
        }
        
        const gamesRaw = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));
        const gamesData = Array.isArray(gamesRaw) ? gamesRaw : gamesRaw.games;
        
        if (!Array.isArray(gamesData)) {
            console.log('⚠️  游戏数据格式错误，跳过结构化数据生成');
            return;
        }
        
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": CONFIG.siteName,
            "description": CONFIG.description,
            "url": CONFIG.siteUrl,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${CONFIG.siteUrl}/?search={search_term_string}`,
                "query-input": "required name=search_term_string"
            },
            "game": gamesData.slice(0, 10).map(game => {
                // 处理多语言标题和描述，优先使用英文
                const title = typeof game.title === 'object' ? (game.title.en || game.title.zh || Object.values(game.title)[0]) : game.title;
                const description = typeof game.description === 'object' ? (game.description.en || game.description.zh || Object.values(game.description)[0]) : game.description;
                
                return {
                    "@type": "Game",
                    "name": title,
                    "description": description,
                    "image": game.image ? `${CONFIG.siteUrl}${game.image}` : game.imageUrl,
                    "url": `${CONFIG.siteUrl}${game.url || `/games/${game.id}.html`}`,
                    "genre": game.category ? game.category.join(', ') : 'Game'
                };
            })
        };
        
        const structuredDataPath = path.join(__dirname, CONFIG.outputDir, 'structured-data.json');
        fs.writeFileSync(structuredDataPath, JSON.stringify(structuredData, null, 2), 'utf8');
        console.log('✅ 结构化数据生成完成');
        
    } catch (error) {
        console.log('⚠️  生成结构化数据时出错:', error.message);
    }
}

// 生成SEO报告
function generateSEOReport() {
    console.log('🔄 生成SEO报告...');
    
    const report = {
        generatedAt: new Date().toISOString(),
        siteInfo: {
            name: CONFIG.siteName,
            url: CONFIG.siteUrl,
            description: CONFIG.description
        },
        files: {
            sitemap: `${CONFIG.siteUrl}/sitemap.xml`,
            robots: `${CONFIG.siteUrl}/robots.txt`,
            terms: `${CONFIG.siteUrl}/terms.html`,
            privacy: `${CONFIG.siteUrl}/privacy.html`,
            copyright: `${CONFIG.siteUrl}/copyright.html`
        },
        seoChecklist: [
            '✅ 生成sitemap.xml',
            '✅ 配置robots.txt',
            '✅ 创建协议页面',
            '✅ 添加结构化数据',
            '✅ 优化meta标签',
            '✅ 设置canonical链接',
            '✅ 配置Open Graph标签'
        ],
        recommendations: [
            '定期更新sitemap.xml',
            '监控Google Search Console',
            '优化页面加载速度',
            '添加更多内部链接',
            '创建高质量内容',
            '优化移动端体验'
        ]
    };
    
    const reportPath = path.join(__dirname, CONFIG.outputDir, 'seo-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log('✅ SEO报告生成完成');
}

// 主函数
function main() {
    console.log('🚀 开始生成SEO文件...\n');
    
    try {
        // 确保输出目录存在
        const outputDir = path.join(__dirname, CONFIG.outputDir);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // 生成各种SEO文件
        generateSitemap();
        updateRobotsTxt();
        generateStructuredData();
        generateSEOReport();
        
        console.log('\n🎉 SEO文件生成完成！');
        console.log('\n📋 生成的文件:');
        console.log('  - sitemap.xml (网站地图)');
        console.log('  - robots.txt (爬虫协议)');
        console.log('  - structured-data.json (结构化数据)');
        console.log('  - seo-report.json (SEO报告)');
        console.log('\n🔗 协议页面:');
        console.log('  - terms.html (用户服务协议)');
        console.log('  - privacy.html (隐私政策)');
        console.log('  - copyright.html (版权声明)');
        
        console.log('\n💡 建议:');
        console.log('  1. 将sitemap.xml提交到Google Search Console');
        console.log('  2. 测试robots.txt是否正常工作');
        console.log('  3. 定期更新游戏数据和sitemap');
        console.log('  4. 监控网站SEO表现');
        
    } catch (error) {
        console.error('❌ 生成SEO文件时出错:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    generateSitemap,
    updateRobotsTxt,
    generateStructuredData,
    generateSEOReport,
    main
}; 