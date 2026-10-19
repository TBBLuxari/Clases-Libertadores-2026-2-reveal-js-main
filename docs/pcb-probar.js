// Prueba una colocación: rutea con varios órdenes, lista las conexiones que fallan y dibuja un SVG de depuración.
// Uso: node docs/pcb-probar.js colocacion.json salida.svg [intentos]
'use strict';
const fs = require('fs');
const D = require('./pcb-diseno-carrito.js');
const { Router, CELL } = require('./pcb-router.js');
const { promote, mulberry } = require('./pcb-resolver.js');
const place = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const B = D.build(place);
const errs = D.checkPlacement(B); if (errs.length) { console.log(errs.join('\n')); }
const router = new Router(D.g(D.W_G), D.g(D.H_G), B.pads, B.holes);
const names = Object.keys(D.NETS);
const FIRST = (process.env.FIRST || 'OI,OD,NI,ND,WI,WD,EI,ED,TI,TD,AI,AD,M1A,M1B,M2A,M2B,VBAT,GNDI,GNDD,VCCI,VCCD,GND,VCC').split(',');
const rng = mulberry(5);
let best = null;
for (let t = 0; t < (+process.argv[4] || 40); t++) {
  let order = FIRST.filter(n => names.includes(n)).concat(names.filter(n => !FIRST.includes(n)));
  if (t > 0) { // perturba: intercambia algunas redes de lugar
    for (let k = 0; k < 1 + (t % 5); k++) { const i = (rng() * order.length) | 0, j = (rng() * order.length) | 0; [order[i], order[j]] = [order[j], order[i]]; }
  }
  const r = promote(router, D.NETS, order, null, +process.env.PROMO || 1, false);
  if (r && (!best || r.res.fails < best.res.fails || (r.res.fails === best.res.fails && r.len < best.len))) best = r;
}
console.log('fallos:', best.res.fails, best.res.failList.join(' '));
const cols = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#16a085', '#7f8c8d', '#2c3e50', '#f39c12', '#e84393', '#00b894', '#6c5ce7'];
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${D.W_G * 2.54 + 4} ${D.H_G * 2.54 + 4}" width="1500" height="1150"><rect x="-2" y="-2" width="200" height="200" fill="#fff"/><rect x="0" y="0" width="${D.W_G * 2.54}" height="${D.H_G * 2.54}" fill="#f3f3e8" stroke="#000" stroke-width="0.3"/>`;
best.res.paths.forEach(p => { const c = cols[(p.net - 1) % cols.length]; for (let i = 0; i < p.cells.length - 1; i++) { const a = p.cells[i], b = p.cells[i + 1]; svg += `<line x1="${a.x * CELL}" y1="${a.y * CELL}" x2="${b.x * CELL}" y2="${b.y * CELL}" stroke="${c}" stroke-width="1" stroke-linecap="round" opacity=".8"/>`; } });
const bad = new Set(best.res.failList.map(s => s.split(':')[1]));
B.pads.forEach(p => { svg += `<circle cx="${p.x * CELL}" cy="${p.y * CELL}" r="${p.r}" fill="${bad.has(p.id) ? '#f00' : '#fff'}" stroke="#000" stroke-width="0.25"/><text x="${p.x * CELL + 1.2}" y="${p.y * CELL - 1}" font-size="1.5" fill="#000">${p.id}</text>`; });
svg += '</svg>'; fs.writeFileSync(process.argv[3] || 'debug.svg', svg);
