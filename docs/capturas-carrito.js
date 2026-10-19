// Pantallazos de la protoboard de cada paso (los de la presentación de clase).
// Toma las páginas de apoyo/carrito/protoboard-pasos/ebc/ ya generadas (node docs/gen-protoboard-paginas.js) y guarda un PNG por paso,
// recortado a lo que se arma en ese paso (con lo nuevo brillando en amarillo y lo que se quita tachado).
// Uso: node docs/capturas-carrito.js [archivo ...]      (sin argumentos hace los 23 pasos y la placa completa)
//   salida: assets/imagenes/sistemas-hipermedia/carrito-pasos/paso-NN.png, placa-completa.png y placa-completa-recortada.png
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const PASOS = path.join(ROOT, 'materias', 'sistemas-hipermedia', 'apoyo', 'carrito', 'protoboard-pasos', 'ebc');
const OUT = path.join(ROOT, 'assets', 'imagenes', 'sistemas-hipermedia', 'carrito-pasos');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
if (!EDGE) throw new Error('No se encontró Edge ni Chrome');
fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'capturas-carrito-'));
const enfoques = JSON.parse(fs.readFileSync(path.join(PASOS, 'enfoques.json'), 'utf8'));

function capturar(archivo, vb, salida, ancho = 1600, css = '') {
  const html = fs.readFileSync(path.join(PASOS, archivo + '.html'), 'utf8');
  const svg = /<svg id="board"[^]*?<\/svg>/.exec(html)[0].replace(/ viewBox="[^"]*"/, '');
  const [, , w, h] = vb.split(' ').map(Number);
  const alto = Math.round(ancho * h / w);
  const pagina = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#fbfaf6}svg{display:block}` +
    `g.new{filter:drop-shadow(0 0 3px #ffd400) drop-shadow(0 0 8px rgba(255,208,0,.9))}g.gone>*:not(.x){opacity:.42}[data-alt="puente"]{display:none}${css}</style>` +
    svg.replace('<svg id="board"', `<svg id="board" viewBox="${vb}" width="${ancho}" height="${alto}"`);
  const f = path.join(tmp, archivo + '.html');
  fs.writeFileSync(f, pagina, 'utf8');
  try {
    execFileSync(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${ancho},${alto}`,
      `--screenshot=${salida}`, 'file:///' + f.replace(/\\/g, '/')], { stdio: 'pipe' });
  } catch (e) { /* Edge escribe avisos por stderr aunque salga bien */ }
  if (!fs.existsSync(salida)) throw new Error('No se creó ' + salida);
}

const pedidos = process.argv.slice(2);
// una clave "salida@pagina" recorta otra página con otro nombre de archivo
Object.keys(enfoques).filter(k => !pedidos.length || pedidos.includes(k.split('@')[0])).forEach(k => {
  const [nombre, pagina = nombre] = k.split('@');
  const grande = /^(placa-completa-total|bloque-)/.test(nombre);
  // bloque-X: solo ese bloque encendido (teal), el resto casi invisible; se ven los dos lados
  const puente = nombre.endsWith('-puente') ? '[data-alt="orig"]{display:none}g[data-alt="puente"]{display:inline}' : '';
  const css = puente + (nombre.startsWith('bloque-') ? `[data-b]{opacity:.1;filter:none}[data-b~="${nombre.slice(7)}"]{opacity:1;filter:drop-shadow(0 0 3px #0d8f84) drop-shadow(0 0 9px rgba(13,143,132,.8))}` : '');
  capturar(pagina, enfoques[k], path.join(OUT, nombre + '.png'), grande ? 2000 : 1600, css);
  console.log('listo', nombre);
});
fs.rmSync(tmp, { recursive: true, force: true });
