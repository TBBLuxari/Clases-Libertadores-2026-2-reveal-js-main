// Exporta la guía paso a paso del carrito a PDF con Microsoft Edge (sin servidor).
// Uso: node docs/exportar-guia-pdf.js [salida.pdf]
// Si el PDF está abierto en otro programa, ciérralo antes (Windows no deja sobrescribirlo).
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const apoyo = path.join(__dirname, '..', 'materias', 'sistemas-hipermedia', 'apoyo');
const html = path.join(apoyo, 'carrito-guia-paso-a-paso.html');
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(apoyo, 'carrito-guia-paso-a-paso.pdf');
const edges = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'];
const exe = edges.find(p => fs.existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome.'); process.exit(1); }
const url = 'file:///' + html.replace(/\\/g, '/').split('/').map((s, i) => (i === 0 ? s : encodeURIComponent(s))).join('/');
try {
  execFileSync(exe, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${out}`, url], { stdio: 'pipe' });
} catch (e) { /* Edge devuelve ruido por stderr aunque funcione */ }
const t = fs.existsSync(out) ? fs.statSync(out).mtime : null;
console.log(t && Date.now() - t.getTime() < 60000 ? `PDF listo: ${out}` : `No se pudo escribir ${out} (¿está abierto en otro programa?)`);
