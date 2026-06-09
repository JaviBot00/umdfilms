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

/* =====================================================
   GENERAR PÁGINAS DE EQUIPO
   ===================================================== */
function generateTeamPages() {
  const team     = readJSON('data/team.json');
  const template = readTemplate('equipo/plantilla.html');

  console.log(`\n👤 Generando ${team.length} páginas de equipo...`);

  team.forEach(member => {
    // Solo necesitamos cambiar el <title> inicial para SEO básico
    // (equipo.js sobrescribe el título dinámicamente, pero esto ayuda
    //  a crawlers que no ejecutan JS)
    const html = template
      .replace(
        '<title>Perfil | UMD Films</title>',
        `<title>${member.name}${member.surname ? ' ' + member.surname : ''} — ${member.role} | UMD Films</title>`
      )
      .replace(
        '<meta name="description" content="Perfil de miembro del equipo UMD Films Málaga." />',
        `<meta name="description" content="${member.name}, ${member.role} en UMD Films Málaga." />`
      );

    writeFile(`equipo/${member.id}.html`, html);
  });
}

/* =====================================================
   GENERAR PÁGINAS DE PORTAFOLIO
   ===================================================== */
function generatePortfolioPages() {
  const portfolio = readJSON('data/portfolio.json');
  const template  = readTemplate('portafolio/plantilla.html');

  console.log(`\n🎬 Generando ${portfolio.length} páginas de portafolio...`);

  portfolio.forEach(project => {
    const html = template
      .replace(
        '<title>Proyecto | UMD Films</title>',
        `<title>${project.title} | UMD Films</title>`
      )
      .replace(
        '<meta name="description" content="Proyecto de UMD Films, productora audiovisual en Málaga." />',
        `<meta name="description" content="${project.title} — ${project.category} producido por UMD Films en ${project.year}." />`
      );

    writeFile(`portafolio/${project.id}.html`, html);
  });
}

/* ---- Main ---- */
console.log('🚀 UMD Films — Generador de páginas\n' + '='.repeat(40));

try {
  generateTeamPages();
  generatePortfolioPages();
  console.log('\n✅ Listo. Sube la carpeta completa a Hostinger.\n');
} catch (err) {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
}
