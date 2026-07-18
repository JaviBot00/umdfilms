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

/* ---- GENERATE TEAM PAGES ---- */
function generateTeamPages() {
  const template = readTemplate('team/template.html');

  console.log(`\n👤 Generating ${team.length} team pages...`);

  team.forEach(member => {
    const fullName = member.name + (member.surname ? ' ' + member.surname : '');
    const html = template
      .replace(
        '<title>Equipo | UMD Films — Productora Audiovisual Málaga</title>',
        `<title>${fullName} — ${member.role} | ${config.seo.site_suffix}</title>`
      )
      .replace(
        `<meta name="description" content="Perfil de miembro del equipo ${config.seo.site_suffix}." />`,
        `<meta name="description" content="${fullName}, ${member.role} en ${config.seo.site_suffix}. Conoce a nuestro equipo." />`
      );

    writeFile(`team/${member.id}.html`, html);
  });
}

/* ---- GENERATE PORTFOLIO PAGES ---- */
function generatePortfolioPages() {
  const template = readTemplate('portfolio/template.html');

  console.log(`\n🎬 Generating ${portfolio.length} portfolio pages...`);

  portfolio.forEach(project => {
    const html = template
      .replace(
        '<title>Proyecto | UMD Films — Productora Audiovisual Málaga</title>',
        `<title>${project.title} | ${config.seo.site_suffix}</title>`
      )
      .replace(
        '<meta name="description" content="Proyecto de UMD Films, productora audiovisual en Málaga." />',
        `<meta name="description" content="${project.title} — ${project.category} producido por UMD Films en ${project.year}. Descubre este proyecto." />`
      );

    writeFile(`portfolio/${project.id}.html`, html);
  });
}

/* ---- GENERATE SITEMAP.XML ---- */
function generateSitemap() {
  const BASE_URL = config.brand.site_url;
  const today    = new Date().toISOString().split('T')[0];

  const teamUrls = team.map(m =>
    `  <url><loc>${BASE_URL}/team/${m.id}.html</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`
  ).join('\n');

  const portfolioUrls = portfolio.map(p =>
    `  <url><loc>${BASE_URL}/portfolio/${p.id}.html</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  ).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/equipment/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
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
