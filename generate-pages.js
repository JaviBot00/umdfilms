#!/usr/bin/env node
/**
 * =====================================================
 * generate-pages.js
 * =====================================================
 * Genera automáticamente los archivos HTML individuales
 * para cada miembro del equipo y cada proyecto del portafolio.
 *
 * CUÁNDO EJECUTARLO:
 *   - Cuando añades un nuevo miembro en data/team.json
 *   - Cuando añades un nuevo proyecto en data/portfolio.json
 *   - Antes de subir a Hostinger
 *
 * USO:
 *   node generate-pages.js
 *
 * REQUISITOS:
 *   - Node.js instalado (cualquier versión moderna)
 *   - Ejecutar desde la raíz del proyecto umdfilms/
 *
 * QUÉ HACE:
 *   - Lee data/team.json → genera equipo/[id].html para cada miembro
 *   - Lee data/portfolio.json → genera portafolio/[id].html para cada proyecto
 *   - Genera sitemap.xml con todas las URLs
 *   - Cada HTML generado es una copia de la plantilla correspondiente
 *   - El JS de la página (equipo.js / portafolio.js) se encarga
 *     de leer el id desde la URL y rellenar el contenido.
 *
 * NO necesitas tocar este script salvo que cambies la estructura HTML.
 * =====================================================
 */

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;

/* ---- Leer JSON ---- */
function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

/* ---- Leer plantilla ---- */
function readTemplate(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

/* ---- Escribir archivo ---- */
function writeFile(relPath, content) {
  const fullPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ✓ ${relPath}`);
}

/* ---- Leer datos una sola vez (reutilizados por page gen y sitemap) ---- */
const team      = readJSON('data/team.json');
const portfolio = readJSON('data/portfolio.json');
const config    = readJSON('data/config.json');

/* =====================================================
   GENERAR PÁGINAS DE EQUIPO
   ===================================================== */
function generateTeamPages() {
  const template = readTemplate('equipo/plantilla.html');

  console.log(`\n👤 Generando ${team.length} páginas de equipo...`);

  team.forEach(member => {
    const fullName = member.name + (member.surname ? ' ' + member.surname : '');
    const html = template
      .replace(
        '<title>Equipo | UMD Films — Productora Audiovisual Málaga</title>',
        `<title>${fullName} — ${member.role} | UMD Films Málaga</title>`
      )
      .replace(
        '<meta name="description" content="Perfil de miembro del equipo UMD Films Málaga." />',
        `<meta name="description" content="${fullName}, ${member.role} en UMD Films Málaga. Conoce a nuestro equipo." />`
      );

    writeFile(`equipo/${member.id}.html`, html);
  });
}

/* =====================================================
   GENERAR PÁGINAS DE PORTAFOLIO
   ===================================================== */
function generatePortfolioPages() {
  const template = readTemplate('portafolio/plantilla.html');

  console.log(`\n🎬 Generando ${portfolio.length} páginas de portafolio...`);

  portfolio.forEach(project => {
    const html = template
      .replace(
        '<title>Proyecto | UMD Films — Productora Audiovisual Málaga</title>',
        `<title>${project.title} | UMD Films Málaga</title>`
      )
      .replace(
        '<meta name="description" content="Proyecto de UMD Films, productora audiovisual en Málaga." />',
        `<meta name="description" content="${project.title} — ${project.category} producido por UMD Films en ${project.year}. Descubre este proyecto." />`
      );

    writeFile(`portafolio/${project.id}.html`, html);
  });
}

/* =====================================================
   GENERAR SITEMAP.XML
   ===================================================== */
function generateSitemap() {
  const BASE_URL = config.brand.site_url;
  const today    = new Date().toISOString().split('T')[0];

  const teamUrls = team.map(m =>
    `  <url><loc>${BASE_URL}/equipo/${m.id}.html</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`
  ).join('\n');

  const portfolioUrls = portfolio.map(p =>
    `  <url><loc>${BASE_URL}/portafolio/${p.id}.html</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  ).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/material/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
${teamUrls}
${portfolioUrls}
</urlset>`;

  writeFile('sitemap.xml', sitemap);
}

/* ---- Main ---- */
console.log('🚀 UMD Films — Generador de páginas\n' + '='.repeat(40));

try {
  generateTeamPages();
  generatePortfolioPages();
  generateSitemap();
  console.log('\n✅ Listo. Sube la carpeta completa a Hostinger.\n');
} catch (err) {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
}
