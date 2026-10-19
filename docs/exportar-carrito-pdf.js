// Exporta a PDF (1:1, A4) las plantillas del chasis y las hojas de la PCB del carrito, con Edge sin servidor.
// Uso: node docs/exportar-carrito-pdf.js        (si un PDF está abierto en un visor, ciérralo antes)
'use strict';
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const path = require('path');
const fs = require('fs');
const dir = path.join(__dirname, '..', 'materias', 'sistemas-hipermedia', 'apoyo', 'carrito-fisico');
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome.'); process.exit(1); }
(process.env.PCB_FINAL ? ['chasis-plantillas', 'pcb-cobre-toner', 'pcb-montaje'] : ['chasis-plantillas']).forEach(n => {
  const out = path.join(dir, n + '.pdf');
  try { execFileSync(exe, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${out}`, pathToFileURL(path.join(dir, n + '.html')).href], { stdio: 'pipe' }); } catch (e) { /* Edge escribe ruido en stderr */ }
  const ok = fs.existsSync(out) && Date.now() - fs.statSync(out).mtime.getTime() < 60000;
  console.log(ok ? `PDF listo: ${n}.pdf` : `No se pudo escribir ${n}.pdf (¿abierto en otro programa?)`);
});
