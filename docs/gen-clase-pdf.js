// Convierte las diapositivas de una clase en un PDF de imágenes (el texto y el código no se pueden copiar).
// Uso: node docs/gen-clase-pdf.js programacion-web 9      (necesita el servidor de desarrollo en el puerto 4173: bunx browser-sync start --config bs-config.cjs)
// Salta las diapositivas con espacios para memes, videos y el descanso. Las respuestas ocultas (fragmentos) salen visibles.
// Variables de entorno: PDF_OUT (otra ruta de salida), PUERTO (por defecto 4173).
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const materia = process.argv[2];
const num = String(process.argv[3] || '').padStart(2, '0');
if (!materia || !num.trim()) { console.error('Uso: node docs/gen-clase-pdf.js <materia> <numero de clase>'); process.exit(1); }
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'materias', materia, `clase-${num}.html`);
const SALIDA_DIR = path.join(RAIZ, 'materias', materia, 'apoyo');
const PDF = process.env.PDF_OUT ? path.resolve(process.env.PDF_OUT) : path.join(SALIDA_DIR, `clase-${num}.pdf`);
const TMP = path.join(process.env.TEMP || __dirname, `clase-${num}-pdf-tmp`);
const PUERTO = process.env.PUERTO || '4173';
const W = 1280, H = 720;
const edges = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'];
const EXE = edges.find(p => fs.existsSync(p));
if (!EXE) { console.error('No encontré Edge ni Chrome.'); process.exit(1); }

// índice de cada <section> de primer nivel (igual que la numeración #/N de reveal.js)
const html = fs.readFileSync(ARCHIVO, 'utf8');
const cuerpo = html.slice(html.indexOf('<div class="slides">'));
const secciones = cuerpo.split(/<section\b/).slice(1).map(s => s.slice(0, s.indexOf('</section>')));
const incluidas = [];
secciones.forEach((s, i) => {
  if (/img-placeholder|<iframe|BREAK/.test(s)) { return; }
  incluidas.push(i);
});
console.log(`${secciones.length} diapositivas, ${incluidas.length} entran al PDF`);

fs.mkdirSync(TMP, { recursive: true });
const rutaPng = i => path.join(TMP, `s${String(i).padStart(3, '0')}.png`);

function capturar(i) {
  return new Promise((resolve) => {
    const url = `http://localhost:${PUERTO}/materias/${materia}/clase-${num}.html?pdf#/${i}`;
    const args = ['--headless=new', `--user-data-dir=${path.join(TMP, 'perfil-' + i)}`, '--disable-gpu-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--hide-scrollbars',
      '--virtual-time-budget=12000', `--window-size=${W},${H}`, `--screenshot=${rutaPng(i)}`, url];
    execFile(EXE, args, { maxBuffer: 64 * 1024 * 1024 }, () => resolve(fs.existsSync(rutaPng(i))));
  });
}

(async () => {
  let siguiente = 0;
  const fallidas = [];
  async function trabajador() {
    while (siguiente < incluidas.length) {
      const i = incluidas[siguiente++];
      if (fs.existsSync(rutaPng(i)) && !process.env.REHACER) { continue; }
      const ok = await capturar(i);
      if (!ok) { fallidas.push(i); }
    }
  }
  await Promise.all([trabajador(), trabajador(), trabajador(), trabajador()]);
  if (fallidas.length) { console.error('Fallaron:', fallidas.join(', ')); }

  const paginas = incluidas.filter(i => fs.existsSync(rutaPng(i)))
    .map(i => `<img src="file:///${rutaPng(i).replace(/\\/g, '/')}">`).join('\n');
  const pHtml = path.join(TMP, 'paginas.html');
  fs.writeFileSync(pHtml, `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: ${W}px ${H}px; margin: 0; }
    html, body { margin: 0; padding: 0; background: #000; }
    img { display: block; width: ${W}px; height: ${H}px; break-after: page; }
    img:last-child { break-after: auto; }
  </style></head><body>${paginas}</body></html>`);
  fs.mkdirSync(path.dirname(PDF), { recursive: true });
  await new Promise(r => execFile(EXE, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${PDF}`, 'file:///' + pHtml.replace(/\\/g, '/')], () => r()));
  const t = fs.existsSync(PDF) ? fs.statSync(PDF).mtime : null;
  console.log(t && Date.now() - t.getTime() < 120000 ? `PDF listo: ${PDF} (${(fs.statSync(PDF).size / 1048576).toFixed(1)} MB)` : `No se pudo escribir ${PDF} (¿está abierto en otro programa?)`);
})();
