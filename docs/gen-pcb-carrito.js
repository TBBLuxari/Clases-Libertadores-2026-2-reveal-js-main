// Genera la PCB del carrito: ruteo + verificación (DRC y conectividad) + dibujos 1:1 (toner y montaje).
// Uso: node docs/gen-pcb-carrito.js [pruebas] [archivo-colocacion.json]
// Salida en materias/sistemas-hipermedia/apoyo/carrito-fisico/
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('./pcb-diseno-carrito.js');
const { Router, CELL, TRACK, CLR, segDist } = require('./pcb-router.js');
const { solve } = require('./pcb-resolver.js');
const OUT = path.join(__dirname, '..', 'materias', 'sistemas-hipermedia', 'apoyo', 'carrito-fisico');
fs.mkdirSync(OUT, { recursive: true });

const trials = +process.argv[2] || 12;
const pf = process.argv[3] || path.join(__dirname, 'pcb-colocacion.json');
const place = fs.existsSync(pf) ? JSON.parse(fs.readFileSync(pf, 'utf8')) : D.PLACE;
const CACHE = path.join(__dirname, 'pcb-ruteo.json');

// ------------------------------------------------------------ ruteo (con caché)
const key = JSON.stringify(place) + `|${D.W_G}x${D.H_G}`;
let route;
if (fs.existsSync(CACHE) && JSON.parse(fs.readFileSync(CACHE, 'utf8')).key === key && !process.env.RERUN) {
  route = JSON.parse(fs.readFileSync(CACHE, 'utf8')).route;
  console.log('Ruteo tomado de la caché');
} else {
  const { Router2 } = require('./pcb-router2.js');
  const { mulberry } = require('./pcb-resolver.js');
  const Bx = D.build(place);
  const errs0 = D.checkPlacement(Bx); if (errs0.length) { console.error('Colocación inválida: ' + errs0.join(' | ')); process.exit(1); }
  const rt = new Router2(D.g(D.W_G), D.g(D.H_G), Bx.pads, Bx.holes, D.NETS); rt.setHints(D.hintsCells());
  const names = Object.keys(D.NETS);
  const FIRST = 'OI,OD,NI,ND,WI,WD,EI,ED,TI,TD,AI,AD,OI2,OD2,M1A,M1B,M2A,M2B,VBAT,GNDI,GNDD,VCCT,GND,VCC'.split(',').filter(n => names.includes(n));
  let done = false;
  for (let seed = 1; seed <= 12 && !done; seed++) { const f = rt.solve(FIRST, mulberry(seed), 150); console.log('semilla ' + seed + ': ' + f + ' conexiones sin ruta'); if (f === 0) done = true; }
  if (!done) { console.error('Sin solución de ruteo'); process.exit(1); }
  const rr = rt.result(); route = { paths: rr.paths, jumps: [] };
  fs.writeFileSync(CACHE, JSON.stringify({ key, route }));
}
const B = D.build(place);
const WC = D.g(D.W_G), HC = D.g(D.H_G), WMM = WC * CELL, HMM = HC * CELL;
const mm = c => Math.round(c * CELL * 1000) / 1000;

// ------------------------------------------------------------ geometría final
const segs = [];       // pistas: {net, a:[x,y] mm, b}
const joinsByNet = {}; // conectividad: net -> [[ptA, ptB]...] (en celdas, 'x,y')
route.paths.forEach(p => {
  const cs = p.cells; const nets = p.net;
  for (let q = 0; q < cs.length - 1; q++) (joinsByNet[nets] = joinsByNet[nets] || []).push([`${cs[q].x},${cs[q].y}`, `${cs[q + 1].x},${cs[q + 1].y}`]);
  // fusiona tramos rectos
  let i = 0;
  while (i < cs.length - 1) {
    if (cs[i + 1].jump) { (joinsByNet[nets] = joinsByNet[nets] || []).push([`${cs[i].x},${cs[i].y}`, `${cs[i + 1].x},${cs[i + 1].y}`]); i++; continue; }
    let j = i + 1;
    const dx = cs[j].x - cs[i].x, dy = cs[j].y - cs[i].y;
    while (j + 1 < cs.length && !cs[j + 1].jump && cs[j + 1].x - cs[j].x === dx && cs[j + 1].y - cs[j].y === dy) j++;
    segs.push({ net: nets, name: p.name, a: [cs[i].x, cs[i].y], b: [cs[j].x, cs[j].y] });
    (joinsByNet[nets] = joinsByNet[nets] || []).push([`${cs[i].x},${cs[i].y}`, `${cs[j].x},${cs[j].y}`]);
    i = j;
  }
});
const jumpPads = [];
route.jumps.forEach((j, n) => { jumpPads.push({ net: j.net, x: j.a[0], y: j.a[1], n: n + 1 }, { net: j.net, x: j.b[0], y: j.b[1], n: n + 1 }); });

// ------------------------------------------------------------ verificación
function verify() {
  const errs = [];
  const prims = [];
  segs.forEach(s => prims.push({ net: s.net, k: 'seg', a: [s.a[0] * CELL, s.a[1] * CELL], b: [s.b[0] * CELL, s.b[1] * CELL], r: TRACK / 2, tag: s.name }));
  B.pads.forEach(p => prims.push({ net: p.net, k: 'pad', a: [p.x * CELL, p.y * CELL], b: [p.x * CELL, p.y * CELL], r: p.r, tag: p.id }));
  jumpPads.forEach(p => prims.push({ net: p.net, k: 'pad', a: [p.x * CELL, p.y * CELL], b: [p.x * CELL, p.y * CELL], r: 0.9, tag: 'puente' + p.n }));
  for (let i = 0; i < prims.length; i++) for (let j = i + 1; j < prims.length; j++) {
    const a = prims[i], b = prims[j]; if (a.net === b.net) continue;
    const d = segDist(a.a, a.b, b.a, b.b) - a.r - b.r;
    if (d < CLR - 0.02) errs.push(`Cobres muy juntos (${d.toFixed(2)} mm): ${a.tag} y ${b.tag}`);
  }
  B.holes.forEach(h => prims.forEach(p => { const d = segDist([h.x * CELL, h.y * CELL], [h.x * CELL, h.y * CELL], p.a, p.b) - p.r - 1.6; if (d < 0.9) errs.push(`Cobre cerca de un agujero de montaje: ${p.tag}`); }));
  // conectividad: cada red debe unir todos sus pads
  const names = Object.keys(D.NETS);
  names.forEach((n, ix) => {
    const net = ix + 1; const par = {};
    const f = a => { if (par[a] === undefined) par[a] = a; return par[a] === a ? a : (par[a] = f(par[a])); };
    (joinsByNet[net] || []).forEach(([a, b]) => { par[f(a)] = f(b); });
    const pins = D.NETS[n].map(id => B.pads.find(p => p.id === id));
    const roots = new Set(pins.map(p => f(`${p.x},${p.y}`)));
    if (roots.size > 1) errs.push(`Red ${n} NO queda conectada (${roots.size} islas)`);
  });
  return errs;
}
const errs = verify();
if (errs.length) { console.error('VERIFICACIÓN FALLÓ:\n' + errs.slice(0, 20).join('\n')); if (!process.env.FORCE) process.exit(2); }
console.log(`Verificación OK: ${segs.length} tramos, ${D.PARTS.filter(p => p.fp === 'lnk').length} puentes, placa ${mm(WC).toFixed(1)} × ${mm(HC).toFixed(1)} mm`);

// ------------------------------------------------------------ dibujo
const f2 = n => Math.round(n * 100) / 100;
const px = c => f2(c * CELL), py = c => f2(c * CELL);
const NETCOL = ['#c0392b', '#2c3e50'];
function netColor(net) { const name = Object.keys(D.NETS)[net - 1]; if (name === 'VCC' || name === 'VBAT') return '#d62828'; if (name === 'GND') return '#1d3557'; if (/^O/.test(name)) return '#0f9d58'; if (/^[NW]/.test(name)) return '#8e44ad'; if (/^M/.test(name)) return '#e67e22'; return '#118ab2'; }
const frame = (inner, w = 210, h = 297, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" font-family="Arial, sans-serif"><rect width="${w}" height="${h}" fill="#fff"/>${inner}${extra}</svg>`;

// --- cobre (toner): negro sobre blanco, vista desde ARRIBA (el papel se voltea sobre el cobre)
function cobre(ox, oy, o = {}) {
  const g = [];
  const col = o.color ? netColor : () => '#000';
  segs.forEach(s => g.push(`<line x1="${px(s.a[0])}" y1="${py(s.a[1])}" x2="${px(s.b[0])}" y2="${py(s.b[1])}" stroke="${col(s.net)}" stroke-width="${TRACK}" stroke-linecap="round"/>`));
  B.pads.forEach(p => g.push(`<circle cx="${px(p.x)}" cy="${py(p.y)}" r="${p.r}" fill="${col(p.net)}"/>`));
  jumpPads.forEach(p => g.push(`<circle cx="${px(p.x)}" cy="${py(p.y)}" r="0.9" fill="${col(p.net)}"/>`));
  if (!o.color) { // marca de taladro: puntito blanco en el centro de cada pad
    B.pads.forEach(p => g.push(`<circle cx="${px(p.x)}" cy="${py(p.y)}" r="0.22" fill="#fff"/>`));
    jumpPads.forEach(p => g.push(`<circle cx="${px(p.x)}" cy="${py(p.y)}" r="0.22" fill="#fff"/>`));
    B.holes.forEach(h => g.push(`<circle cx="${px(h.x)}" cy="${py(h.y)}" r="0.35" fill="none" stroke="#000" stroke-width="0.2"/><circle cx="${px(h.x)}" cy="${py(h.y)}" r="1.6" fill="none" stroke="#000" stroke-width="0.15" stroke-dasharray="0.6 0.6"/>`));
  }
  return `<g transform="translate(${ox},${oy})">${g.join('')}</g>`;
}
const marks = (ox, oy) => { // marcas de esquina para recortar
  const L = 4, m = 1.5, W = WMM, H = HMM, o = [];
  [[0, 0, -1, -1], [W, 0, 1, -1], [0, H, -1, 1], [W, H, 1, 1]].forEach(([x, y, sx, sy]) => { o.push(`<line x1="${x + sx * m}" y1="${y}" x2="${x + sx * (m + L)}" y2="${y}" stroke="#000" stroke-width="0.2"/><line x1="${x}" y1="${y + sy * m}" x2="${x}" y2="${y + sy * (m + L)}" stroke="#000" stroke-width="0.2"/>`); });
  return `<g transform="translate(${ox},${oy})">${o.join('')}</g>`;
};
const OX = 15, OY = 40;
const tonerSvg = frame(
  `<text x="10" y="10" font-size="5" font-weight="bold" fill="#000">PCB del carrito · cara de COBRE (toner)</text>
<text x="10" y="15.5" font-size="2.6" fill="#555">Imprimir al 100 % con láser, en papel de revista o papel de transferencia. Pegar el lado impreso contra el cobre. La hoja ya viene lista (no hay que voltearla en la impresora).</text>
${marks(OX, OY)}${cobre(OX, OY)}
<g transform="translate(${OX + WMM - 2},${OY + HMM + 8}) scale(-1,1)"><text x="0" y="0" font-size="3.4" fill="#000" font-weight="bold">CARRITO V1 · ${f2(WMM)}×${f2(HMM)} mm</text></g>
<text x="${OX}" y="${OY + HMM + 15}" font-size="2.4" fill="#555">(el texto de arriba sale al revés a propósito: sobre el cobre se lee bien. No lo recortes de la placa.)</text>
<g transform="translate(10,288)"><line x1="0" y1="0" x2="100" y2="0" stroke="#000" stroke-width="0.4"/><line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="#000" stroke-width="0.4"/><line x1="100" y1="-1.5" x2="100" y2="1.5" stroke="#000" stroke-width="0.4"/><text x="104" y="1" font-size="2.6" fill="#333">Esta línea debe medir 100 mm exactos.</text></g>`);
fs.writeFileSync(path.join(OUT, 'pcb-cobre-toner.svg'), tonerSvg);

// --- montaje (lado de los componentes)
function piezas() {
  const g = [];
  const t = (x, y, s, o = {}) => g.push(`<text x="${f2(x)}" y="${f2(y)}" font-size="${o.size || 1.9}" fill="${o.fill || '#111'}" ${o.anchor ? `text-anchor="${o.anchor}"` : ''}${o.bold ? ' font-weight="bold"' : ''}>${o.s || s}</text>`);
  D.PARTS.forEach(p => {
    const pads = Object.values(p.pads).map(q => [px(q.x), py(q.y)]);
    if (p.fp === 'lnk') { const n = D.PARTS.filter(q => q.fp === 'lnk').indexOf(p) + 1; g.push(`<line x1="${pads[0][0]}" y1="${pads[0][1]}" x2="${pads[1][0]}" y2="${pads[1][1]}" stroke="#1d6fd6" stroke-width="0.9" stroke-linecap="round" stroke-dasharray="2.2 1.2"/><text x="${f2((pads[0][0] + pads[1][0]) / 2)}" y="${f2((pads[0][1] + pads[1][1]) / 2 - 1.3)}" font-size="2.4" fill="#1d6fd6" font-weight="bold" text-anchor="middle">P${n}</text>`); return; }
    const cx = pads.reduce((s, q) => s + q[0], 0) / pads.length, cy = pads.reduce((s, q) => s + q[1], 0) / pads.length;
    const ln = (a, b, c = '#444', w = 0.3) => g.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}"/>`);
    if (p.fp === 'res') {
      const a = pads[0], b = pads[1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      g.push(`<g transform="translate(${f2(cx)},${f2(cy)}) rotate(${f2(ang)})"><line x1="${-L / 2}" y1="0" x2="${L / 2}" y2="0" stroke="#444" stroke-width="0.3"/><rect x="-3.2" y="-1.2" width="6.4" height="2.4" rx="0.8" fill="#e7cf9b" stroke="#a88a4a" stroke-width="0.25"/></g>`);
      const vert = Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]);
      if (vert) { t(cx + 2, cy - 0.3, p.ref, { bold: true }); t(cx + 2, cy + 1.9, p.val); } else { t(cx, cy - 2.2, p.ref + ' ' + p.val, { anchor: 'middle', bold: true }); }
    } else if (p.fp === 'led' || p.fp === 'led5' || p.fp === 'rx') {
      const front = /^D[12]/.test(p.ref);
      const a = pads[0], b = pads[1];
      if (front) {
        // LED acostado, mirando al frente: lente fuera del borde
        const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]);
        const fwd = p.rot === 180 ? [0, -1] : [0, -1];
        g.push(`<rect x="${f2(mx - 2.5)}" y="${f2(my - 9.5)}" width="5" height="9" rx="2.5" fill="${p.fp === 'led' ? '#bfe3f2' : '#222'}" stroke="#333" stroke-width="0.3" opacity="0.9"/>`);
        ln([a[0], a[1]], [a[0], my - 1], '#444', 0.35); ln([b[0], b[1]], [b[0], my - 1], '#444', 0.35);
        t(mx, my - 11, p.ref, { anchor: 'middle', bold: true, size: 1.9 });
        if (p.fp === 'led') { t(a[0], a[1] + 3.2, 'A', { anchor: 'middle', size: 1.7 }); t(b[0], b[1] + 3.2, 'K', { anchor: 'middle', size: 1.7 }); t(mx, my - 14, 'emisor IR', { anchor: 'middle', size: 1.6, fill: '#555' }); }
        else { t(a[0], a[1] + 3.2, 'S', { anchor: 'middle', size: 1.7 }); t(b[0], b[1] + 3.2, 'L', { anchor: 'middle', size: 1.7 }); t(mx, my - 14, 'receptor IR', { anchor: 'middle', size: 1.6, fill: '#555' }); }
      } else {
        g.push(`<circle cx="${f2(cx)}" cy="${f2(cy)}" r="2.7" fill="#f6b3b3" stroke="#a33" stroke-width="0.3"/>`);
        t(a[0], a[1] + 4.2, '+', { anchor: 'middle', size: 2, bold: true }); t(b[0], b[1] + 4.2, '−', { anchor: 'middle', size: 2, bold: true });
        t(cx, cy - 3.6, p.ref, { anchor: 'middle', bold: true });
      }
    } else if (p.fp === 'pot') {
      g.push(`<rect x="${f2(cx - 6)}" y="${f2(cy - 3)}" width="12" height="6" rx="0.8" fill="#9ec5e8" stroke="#336" stroke-width="0.3"/>`);
      pads.forEach((q, i) => t(q[0], q[1] + 4.4, ['A', 'W', 'B'][i], { anchor: 'middle', size: 1.6 }));
      t(cx, cy - 3.8, p.ref + ' ' + p.val, { anchor: 'middle', bold: true });
    } else if (p.fp === 'cap') {
      g.push(`<rect x="${f2(cx - 3)}" y="${f2(cy - 1.9)}" width="6" height="3.8" rx="0.6" fill="#f0b45a" stroke="#a15d00" stroke-width="0.3"/>`);
      t(cx, cy - 2.6, p.ref + ' ' + p.val, { anchor: 'middle', bold: true });
    } else if (p.fp === 'ele') {
      g.push(`<circle cx="${f2(cx)}" cy="${f2(cy)}" r="4.2" fill="#d9dde4" stroke="#334" stroke-width="0.3"/><path d="M${f2(cx + 0.6)},${f2(cy - 3.8)} A4.2,4.2 0 0 1 ${f2(cx + 0.6)},${f2(cy + 3.8)} Z" fill="#8f98a6"/>`);
      t(pads[0][0], pads[0][1] + 6.2, '+', { anchor: 'middle', size: 2.4, bold: true }); t(pads[1][0], pads[1][1] + 6.2, '−', { anchor: 'middle', size: 2.4, bold: true });
      t(cx, cy - 5.4, p.ref + ' ' + p.val, { anchor: 'middle', bold: true });
    } else if (p.fp === 'tb2') {
      g.push(`<rect x="${f2(pads[0][0] - 2.6)}" y="${f2(pads[0][1] - 4)}" width="${f2(pads[1][0] - pads[0][0] + 5.2)}" height="8" rx="0.8" fill="#4aa564" stroke="#1d5d33" stroke-width="0.3"/>`);
      t(cx, cy - 5.2, p.ref + ' ' + p.val, { anchor: 'middle', bold: true });
      const lab = { J1: ['+', '−'], J2: ['', ''], J3: ['a', 'b'], J4: ['a', 'b'] }[p.ref];
      pads.forEach((q, i) => t(q[0], q[1] + 6.6, lab[i], { anchor: 'middle', size: 2, bold: true }));
    } else if (p.fp === 'dip8' || p.fp === 'dip16') {
      const a = pads[0], n = Object.keys(p.pads).length;
      const last = p.pads[String(n / 2)];
      const x0 = px(p.pads['1'].x) + (p.rot === 0 ? 1.5 : -1.5), y0 = py(p.pads['1'].y) - 2.6;
      const xs = [px(Math.min(...Object.values(p.pads).map(q => q.x))), px(Math.max(...Object.values(p.pads).map(q => q.x)))], ys = [py(Math.min(...Object.values(p.pads).map(q => q.y))), py(Math.max(...Object.values(p.pads).map(q => q.y)))];
      g.push(`<rect x="${f2(xs[0] + 1.3)}" y="${f2(ys[0] - 2.4)}" width="${f2(xs[1] - xs[0] - 2.6)}" height="${f2(ys[1] - ys[0] + 4.8)}" rx="0.8" fill="#2d2d33" stroke="#000" stroke-width="0.3"/>`);
      g.push(`<path d="M${f2((xs[0] + xs[1]) / 2 - 1.2)},${f2(ys[0] - 2.4)} a1.2,1.2 0 0 0 2.4,0" fill="#fff"/>`);
      g.push(`<text x="${f2((xs[0] + xs[1]) / 2 + 0.8)}" y="${f2((ys[0] + ys[1]) / 2)}" font-size="2.4" fill="#fff" font-weight="bold" text-anchor="middle" transform="rotate(-90 ${f2((xs[0] + xs[1]) / 2 + 0.8)} ${f2((ys[0] + ys[1]) / 2)})">${p.val}</text>`);
      const pin1 = p.pads['1']; t(px(pin1.x), py(pin1.y) - 3.2, '1', { anchor: 'middle', size: 1.8, bold: true, fill: '#b00' });
      t(px(pin1.x) + (xs[1] - xs[0]) / 2, ys[0] - 4.7, p.ref + (p.fp === 'dip16' ? ' · zócalo de 16' : ' · zócalo de 8'), { anchor: 'middle', bold: true });
    }
  });
  // puentes de alambre
  route.jumps.forEach((j, i) => {
    g.push(`<line x1="${px(j.a[0])}" y1="${py(j.a[1])}" x2="${px(j.b[0])}" y2="${py(j.b[1])}" stroke="#1d6fd6" stroke-width="0.8" stroke-linecap="round" stroke-dasharray="2.2 1.2"/>`);
    g.push(`<text x="${f2((px(j.a[0]) + px(j.b[0])) / 2 + 1)}" y="${f2((py(j.a[1]) + py(j.b[1])) / 2 - 1)}" font-size="2.3" fill="#1d6fd6" font-weight="bold">P${i + 1}</text>`);
  });
  return g.join('');
}
function montaje() {
  const cu = cobre(0, 0, { color: true });
  return `<g transform="translate(${OX},${OY})"><rect x="0" y="0" width="${f2(WMM)}" height="${f2(HMM)}" fill="#f7f3e6" stroke="#444" stroke-width="0.3"/><g opacity="0.28">${cu.replace(/^<g[^>]*>/, '').replace(/<\/g>$/, '')}</g>${B.holes.map(h => `<circle cx="${px(h.x)}" cy="${py(h.y)}" r="1.6" fill="#fff" stroke="#444" stroke-width="0.3"/>`).join('')}${piezas()}</g>`;
}
const montajeSvg = frame(`<text x="10" y="10" font-size="5" font-weight="bold">PCB del carrito · lado de los COMPONENTES</text>
<text x="10" y="15.5" font-size="2.6" fill="#555">Esta hoja es solo para guiarse (no se imprime en la placa). Las líneas azules discontinuas (P1, P2…) son los puentes de alambre.</text>
${montaje()}
<text x="${OX + WMM / 2}" y="${OY - 18}" font-size="3" text-anchor="middle" fill="#888">▲ FRENTE del carrito (los sensores IR miran hacia acá)</text>
<g transform="translate(10,288)"><line x1="0" y1="0" x2="100" y2="0" stroke="#000" stroke-width="0.4"/><text x="104" y="1" font-size="2.6" fill="#333">100 mm</text></g>`);
fs.writeFileSync(path.join(OUT, 'pcb-montaje.svg'), montajeSvg);
fs.writeFileSync(path.join(OUT, 'pcb-montaje-solo.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${OX - 6} ${OY - 20} ${f2(WMM + 12)} ${f2(HMM + 28)}" font-family="Arial, sans-serif"><rect x="${OX - 6}" y="${OY - 20}" width="${f2(WMM + 12)}" height="${f2(HMM + 28)}" fill="#fff"/>${montaje()}</svg>`);
// HTML de impresión de las dos hojas
const wrap = (svg, t) => `<!doctype html><html lang="es"><meta charset="utf-8"><title>${t}</title><style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}svg{display:block}</style><body>${svg}</body></html>`;
fs.writeFileSync(path.join(OUT, 'pcb-cobre-toner.html'), wrap(tonerSvg, 'PCB cobre (toner)'));
fs.writeFileSync(path.join(OUT, 'pcb-montaje.html'), wrap(montajeSvg, 'PCB montaje'));
// datos para la guía
fs.writeFileSync(path.join(OUT, 'pcb-datos.json'), JSON.stringify({
  ancho_mm: f2(WMM), alto_mm: f2(HMM), puentes: route.jumps.length,
  agujeros_montaje_mm: B.holes.map(h => [f2(h.x * CELL), f2(h.y * CELL)]),
  puentes_detalle: D.PARTS.filter(p => p.fp === 'lnk').map((p, i) => ({ n: 'P' + (i + 1), ref: p.ref, desc: p.note, largo_mm: f2(20 * CELL) })),
  piezas: D.PARTS.map(p => ({ ref: p.ref, valor: p.val, nota: p.note })),
}, null, 1));
console.log('Listo: pcb-cobre-toner / pcb-montaje en', OUT);
