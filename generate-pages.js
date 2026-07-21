#!/usr/bin/env node
// generate-pages.js — Genera HTML individuales para team/ y portfolio/,
// más sitemap.xml. Ejecutar: node generate-pages.js

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;

/* ---- Read JSON ---- */
function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

/* ---- Read template ---- */
function readTemplate(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

/* ---- Safe replace ---- */
    function safeReplace(html, oldStr, newStr, label) {
      if (!html.includes(oldStr)) {
        console.error(`\n❌ Replace fallido: "${label}" no encontrado en el template. Abortando.`);
        process.exit(1);
      }
      return html.replace(oldStr, newStr);
    }

/* ---- Write file ---- */
function writeFile(relPath, content) {
  const fullPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ✓ ${relPath}`);
}

/* ---- Read data once (reused by page gen and sitemap) ---- */
const team      = readJSON('data/team.json');
const portfolio = readJSON('data/portfolio.json');
const config    = readJSON('data/config.json');

const SITE_URL = config.brand.site_url;
const OG_IMAGE_FALLBACK = `${SITE_URL}/assets/logo/og-cover.png`;

/* ---- GENERATE TEAM PAGES ---- */
function generateTeamPages() {
  const template = readTemplate('team/template.html');

  console.log(`\n👤 Generating ${team.length} team pages...`);

  team.forEach(member => {
    const fullName = member.name + (member.surname ? ' ' + member.surname : '');
    const pageUrl  = `${SITE_URL}/team/${member.id}.html`;
    const ogImage  = member.photo_cover
      ? `${SITE_URL}/${member.photo_cover}`
      : OG_IMAGE_FALLBACK;

    let html = template
      // <title>
      html = safeReplace(html,
        '<title>Equipo | UMD Films — Productora Audiovisual Málaga</title>',
        `<title>${fullName} — ${member.role} | ${config.seo.site_suffix}</title>`,
        'title');
      // <meta description>
      html = safeReplace(html,
        `<meta name="description" content="Perfil de miembro del equipo ${config.seo.site_suffix}." />`,
        `<meta name="description" content="${fullName}, ${member.role} en ${config.seo.site_suffix}. Conoce a nuestro equipo." />`,
        'meta description');
      // canonical
      html = safeReplace(html,
        '<link rel="canonical" href="https://umdfilms.com/team/" />',
        `<link rel="canonical" href="${pageUrl}" />`,
        'canonical');
      // OG title
      html = safeReplace(html,
        '<meta property="og:title"       content="Equipo | UMD Films Málaga" />',
        `<meta property="og:title"       content="${fullName} — ${member.role} | ${config.seo.site_suffix}" />`,
        'OG title');
      // OG description
      html = safeReplace(html,
        '<meta property="og:description" content="Conoce al equipo de UMD Films, productora audiovisual en Málaga." />',
        `<meta property="og:description" content="${fullName}, ${member.role} en ${config.seo.site_suffix}." />`,
        'OG description');
      // OG image
      html = safeReplace(html,
        '<meta property="og:image"       content="https://umdfilms.com/assets/logo/og-cover.png" />',
        `<meta property="og:image"       content="${ogImage}" />`,
        'OG image');
      // OG url
      html = safeReplace(html,
        '<meta property="og:url"         content="https://umdfilms.com/team/" />',
        `<meta property="og:url"         content="${pageUrl}" />`,
        'OG url');
      // Twitter title
      html = safeReplace(html,
        '<meta name="twitter:title"       content="Equipo | UMD Films Málaga" />',
        `<meta name="twitter:title"       content="${fullName} — ${member.role} | ${config.seo.site_suffix}" />`,
        'Twitter title');
      // Twitter description
      html = safeReplace(html,
        '<meta name="twitter:description" content="Conoce al equipo de UMD Films, productora audiovisual en Málaga." />',
        `<meta name="twitter:description" content="${fullName}, ${member.role} en ${config.seo.site_suffix}." />`,
        'Twitter description');
      // Twitter image
      html = safeReplace(html,
        '<meta name="twitter:image"       content="https://umdfilms.com/assets/logo/og-cover.png" />',
        `<meta name="twitter:image"       content="${ogImage}" />`,
        'Twitter image');

    writeFile(`team/${member.id}.html`, html);
  });
}

/* ---- GENERATE PORTFOLIO PAGES ---- */
function generatePortfolioPages() {
  const template = readTemplate('portfolio/template.html');

  console.log(`\n🎬 Generating ${portfolio.length} portfolio pages...`);

  portfolio.forEach(project => {
    if (!project || !project.id) return;
    const pageUrl = `${SITE_URL}/portfolio/${project.id}.html`;
    const ogImage = project.thumb
      ? `${SITE_URL}/${project.thumb}`
      : OG_IMAGE_FALLBACK;

    let html = template
      // <title>
      html = safeReplace(html,
        '<title>Proyecto | UMD Films — Productora Audiovisual Málaga</title>',
        `<title>${project.title} | ${config.seo.site_suffix}</title>`,
        'title');
      // <meta description>
      html = safeReplace(html,
        '<meta name="description" content="Proyecto de UMD Films, productora audiovisual en Málaga." />',
        `<meta name="description" content="${project.title} — ${project.category} producido por UMD Films en ${project.year}. Descubre este proyecto." />`,
        'meta description');
      // canonical
      html = safeReplace(html,
        '<link rel="canonical" href="https://umdfilms.com/portfolio/" />',
        `<link rel="canonical" href="${pageUrl}" />`,
        'canonical');
      // OG title
      html = safeReplace(html,
        '<meta property="og:title"       content="Proyecto | UMD Films Málaga" />',
        `<meta property="og:title"       content="${project.title} | ${config.seo.site_suffix}" />`,
        'OG title');
      // OG description
      html = safeReplace(html,
        '<meta property="og:description" content="Descubre nuestros proyectos de producción audiovisual en Málaga." />',
        `<meta property="og:description" content="${project.title} — ${project.category} producido por UMD Films en ${project.year}." />`,
        'OG description');
      // OG image
      html = safeReplace(html,
        '<meta property="og:image"       content="https://umdfilms.com/assets/logo/og-cover.png" />',
        `<meta property="og:image"       content="${ogImage}" />`,
        'OG image');
      // OG url
      html = safeReplace(html,
        '<meta property="og:url"         content="https://umdfilms.com/portfolio/" />',
        `<meta property="og:url"         content="${pageUrl}" />`,
        'OG url');
      // Twitter title
      html = safeReplace(html,
        '<meta name="twitter:title"       content="Proyecto | UMD Films Málaga" />',
        `<meta name="twitter:title"       content="${project.title} | ${config.seo.site_suffix}" />`,
        'Twitter title');
      // Twitter description
      html = safeReplace(html,
        '<meta name="twitter:description" content="Descubre nuestros proyectos de producción audiovisual en Málaga." />',
        `<meta name="twitter:description" content="${project.title} — ${project.category} producido por UMD Films en ${project.year}." />`,
        'Twitter description');
      // Twitter image
      html = safeReplace(html,
        '<meta name="twitter:image"       content="https://umdfilms.com/assets/logo/og-cover.png" />',
        `<meta name="twitter:image"       content="${ogImage}" />`,
        'Twitter image');

    writeFile(`portfolio/${project.id}.html`, html);
  });
}

/* ---- GENERATE SITEMAP.XML ---- */
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  function getFileModDate(relPath) {
    try {
      const stat = fs.statSync(path.join(ROOT, relPath));
      return stat.mtime.toISOString().split('T')[0];
    } catch { return today; }
  }

  const homeUrl = `  <url><loc>${SITE_URL}/</loc><lastmod>${getFileModDate('index.html')}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`;

  const listingUrls = [
    `  <url><loc>${SITE_URL}/team/</loc><lastmod>${getFileModDate('team/index.html')}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    `  <url><loc>${SITE_URL}/portfolio/</loc><lastmod>${getFileModDate('portfolio/index.html')}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    `  <url><loc>${SITE_URL}/equipment/</loc><lastmod>${getFileModDate('equipment/index.html')}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    `  <url><loc>${SITE_URL}/artists/</loc><lastmod>${getFileModDate('artists/index.html')}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
  ].join('\n');

  const teamUrls = team.map(m => {
    const modDate = getFileModDate(`team/${m.id}.html`);
    return `  <url><loc>${SITE_URL}/team/${m.id}.html</loc><lastmod>${modDate}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`;
  }).join('\n');

  const portfolioUrls = portfolio
    .filter(p => p && p.id)
    .map(p => {
      const modDate = getFileModDate(`portfolio/${p.id}.html`);
      return `  <url><loc>${SITE_URL}/portfolio/${p.id}.html</loc><lastmod>${modDate}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${homeUrl}
${listingUrls}
${teamUrls}
${portfolioUrls}
</urlset>`;

  writeFile('sitemap.xml', sitemap);
}

/* ---- Main ---- */
console.log('🚀 UMD Films — Page Generator\n' + '='.repeat(40));

try {
  generateTeamPages();
  generatePortfolioPages();
  generateSitemap();
  console.log('\n✅ Done. Upload the entire folder to Hostinger.\n');
} catch (err) {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
}
