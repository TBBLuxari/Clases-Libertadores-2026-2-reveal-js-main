// Chasis de cartón desmontable del carrito: plantillas 1:1 en A4 y vistas para comprobar medidas.
// Uso: node docs/gen-chasis-carrito.js   (genera SVG; docs/exportar-carrito-pdf.js los pasa a PDF)
// Todo se arma por encaje de ranuras y pestañas (sin pegante) + velcro + tornillos M3 para la PCB.
'use strict';
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'materias', 'sistemas-hipermedia', 'apoyo', 'carrito', 'carrito-fisico');
fs.mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- medidas (mm) — EDITAR si lo medido es distinto
const P = {
  T: 3.5,                          // grosor del cartón
  MOT: { L: 70, W: 22.5, H: 18.5, eje: 19, ejeH: 9.25 },   // motor TT: largo, ancho, alto, eje desde el extremo SIN el motorcito, altura del eje
  RUEDA: { D: 65, ancho: 26 },
  BAT: { L: 62, W: 36, H: 36 },    // portapilas 4xAA (por confirmar con regla)
  PROTO: { L: 165, W: 55 },        // protoboard de 830 puntos
  PCB: { W: 94, H: 71 },           // sale de docs/pcb-diseno-carrito.js
  BOLA: { hueco: 25, tope: 22 },   // rueda loca: hueco para el cuerpo y hueco del último anillo
  PARED_H: 48,                     // altura de las paredes (separación entre base y cubierta)
};
const T = P.T;
const W = 114, L = 150;            // base
const NOTCH = 8;                   // muesca para la rueda
const AX_Y = 95;                   // eje de las ruedas (desde el frente de la base)
const WALL_X = [32.5, 114 - 32.5 - T];          // x de cada pared
const TAB = 16, TABS = [14, 62, 110];           // pestañas: largo y posiciones y (desde el frente)
const WALL_Y0 = 6, WALL_L = 132;

const f = n => Math.round(n * 100) / 100;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
class Sheet {
  constructor(title) { this.t = title; this.o = []; }
  add(s) { this.o.push(s); return this; }
  cut(d) { return this.add(`<path d="${d}" fill="none" stroke="#000" stroke-width="0.5"/>`); }
  rect(x, y, w, h, o = {}) { return this.add(`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${o.rx ? ` rx="${o.rx}"` : ''} fill="${o.fill || 'none'}" stroke="${o.stroke || '#000'}" stroke-width="${o.sw || 0.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.tr ? ` transform="${o.tr}"` : ''}/>`); }
  circ(x, y, r, o = {}) { return this.add(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${o.fill || 'none'}" stroke="${o.stroke || '#000'}" stroke-width="${o.sw || 0.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); }
  line(x1, y1, x2, y2, o = {}) { return this.add(`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${o.stroke || '#000'}" stroke-width="${o.sw || 0.4}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); }
  text(x, y, s, o = {}) { return this.add(`<text x="${f(x)}" y="${f(y)}" font-size="${o.size || 3.2}" fill="${o.fill || '#222'}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.bold ? ' font-weight="bold"' : ''}${o.tr ? ` transform="${o.tr}"` : ''}>${esc(s)}</text>`); }
  group(tr, inner) { return this.add(`<g transform="${tr}">${inner}</g>`); }
}
const sub = (fn) => { const s = new Sheet(''); fn(s); return s.o.join(''); };

// contorno con pestañas/ranuras: ranura rectangular (x,y,largo en y, ancho T) ----
const slotY = (s, x, y) => s.rect(x, y, T, TAB, { sw: 0.5 });
const slotX = (s, x, y) => s.rect(x, y, TAB, T, { sw: 0.5 });

const pages = [];
function page(titulo, nota, fn, extra = {}) {
  const s = new Sheet(titulo); fn(s);
  const body = s.o.join('');
  // marco de la página A4 con título, regla de comprobación de escala (100 mm) y nota
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297" font-family="Arial, sans-serif">
<rect width="210" height="297" fill="#fff"/>
<text x="10" y="10" font-size="5" font-weight="bold" fill="#111">${esc(titulo)}</text>
<text x="10" y="15.5" font-size="2.8" fill="#555">${esc(nota)}</text>
<g transform="translate(${extra.ox || 10},${extra.oy || 22})">${body}</g>
<g transform="translate(10,288)"><line x1="0" y1="0" x2="100" y2="0" stroke="#000" stroke-width="0.4"/><line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="#000" stroke-width="0.4"/><line x1="100" y1="-1.5" x2="100" y2="1.5" stroke="#000" stroke-width="0.4"/><text x="104" y="1" font-size="2.6" fill="#333">Esta línea debe medir 100 mm exactos. Imprimir al 100 % (sin "ajustar a la página").</text></g>
</svg>`;
  pages.push({ titulo, svg });
}

// ================================================================ BASE
function piezaBase(s, conPods) {
  // contorno con muescas de rueda
  const n = NOTCH, y1 = AX_Y - 39, y2 = AX_Y + 39;
  s.cut(`M0,0 H${W} V${y1} H${W - n} V${y2} H${W} V${L} H0 V${y2} H${n} V${y1} H0 Z`);
  s.text(W / 2, -2, 'FRENTE', { anchor: 'middle', size: 3, fill: '#888' });
  // ranuras de las paredes
  WALL_X.forEach(x => TABS.forEach(y => slotY(s, x, y)));
  // hueco de la rueda loca
  s.circ(W / 2, 16, P.BOLA.hueco / 2); s.text(W / 2, 16 + P.BOLA.hueco / 2 + 4.5, 'Rueda loca (hueco)', { anchor: 'middle', size: 2.8 });
  // portapilas
  const bx = (W - P.BAT.W) / 2;
  s.rect(bx, 34, P.BAT.W, P.BAT.L, { stroke: '#2b7bb9', dash: '2 1.2' });
  s.text(W / 2, 34 + P.BAT.L / 2, 'PORTAPILAS 4×AA', { anchor: 'middle', size: 3, fill: '#2b7bb9' });
  s.text(W / 2, 34 + P.BAT.L / 2 + 4, '(velcro)', { anchor: 'middle', size: 2.6, fill: '#2b7bb9' });
  // motores
  const my = AX_Y - P.MOT.eje, mxL = NOTCH, mxR = W - NOTCH - P.MOT.W;
  [mxL, mxR].forEach((x, i) => {
    s.rect(x, my, P.MOT.W, P.MOT.L, { stroke: '#d4781b', dash: '2 1.2' });
    s.line(x - 3, AX_Y, x + P.MOT.W + 3, AX_Y, { stroke: '#d4781b', dash: '1 1' });
    s.text(x + P.MOT.W / 2, my + 14, `MOTOR ${i ? 'DER.' : 'IZQ.'}`, { anchor: 'middle', size: 2.7, fill: '#d4781b' });
    s.text(x + P.MOT.W / 2, my + 18, '(velcro)', { anchor: 'middle', size: 2.4, fill: '#d4781b' });
    s.text(x + P.MOT.W / 2, my + P.MOT.L - 4, 'motorcito hacia atrás', { anchor: 'middle', size: 2.2, fill: '#d4781b' });
  });
  s.text(W / 2, AX_Y + 3, 'eje de las ruedas', { anchor: 'middle', size: 2.4, fill: '#d4781b' });
  // rueda dibujada (referencia)
  [0, W].forEach(x => { s.line(x - 3, AX_Y - P.RUEDA.D / 2, x + 3, AX_Y - P.RUEDA.D / 2, { stroke: '#aaa' }); s.line(x - 3, AX_Y + P.RUEDA.D / 2, x + 3, AX_Y + P.RUEDA.D / 2, { stroke: '#aaa' }); });
  s.text(W / 2, AX_Y + 8, 'las ruedas quedan afuera, en las muescas', { anchor: 'middle', size: 2.3, fill: '#888' });
  if (conPods) {
    // ranuras inclinadas de los sensores (versión protoboard): 2 por sensor
    [[17, 9, -20], [W - 17, 9, 20]].forEach(([cx, cy, a]) => {
      s.add(`<g transform="translate(${cx},${cy}) rotate(${a})">${sub(q => { q.rect(-12, -T / 2, 8, T); q.rect(4, -T / 2, 8, T); })}</g>`);
      s.text(cx, cy + 9, `base del sensor`, { anchor: 'middle', size: 2.4 });
    });
  }
  // tira de velcro de la cubierta (nada) — leyenda
  s.text(0, L + 8, 'Línea negra continua = cortar. Línea de color discontinua = dónde va cada pieza (no se corta).', { size: 2.6, fill: '#555' });
}
page('1. BASE', 'Cortar el contorno negro y las ranuras (4 + 6). Las muescas de los lados son para las ruedas. Cartón de ' + T + ' mm.', s => piezaBase(s, true));

// ================================================================ CUBIERTAS
function slotsCubierta(s, y0) { WALL_X.forEach(x => TABS.forEach(y => slotY(s, x, y - y0))); }
// A: protoboard (más larga que la base, sale hacia el frente)
const DA = { L: 178, y0: -28 };           // y0: dónde empieza respecto al frente de la base
page('2A. CUBIERTA para la PROTOBOARD (prototipo)', 'Doble capa recomendada (pegar 2 cartones) para que no se doble. Cortar contorno y ranuras. La protoboard va con velcro.', s => {
  s.rect(0, 0, W, DA.L, { rx: 2 });
  s.cut(`M0,0 H${W} V${DA.L} H0 Z`);
  slotsCubierta(s, DA.y0);
  const px = (W - P.PROTO.W) / 2, py = 6;
  s.rect(px, py, P.PROTO.W, P.PROTO.L, { stroke: '#2b7bb9', dash: '2 1.2' });
  s.text(W / 2, py + P.PROTO.L / 2, 'PROTOBOARD', { anchor: 'middle', size: 3.4, fill: '#2b7bb9' });
  s.text(W / 2, py + P.PROTO.L / 2 + 4, `${P.PROTO.L} × ${P.PROTO.W} mm (velcro)`, { anchor: 'middle', size: 2.6, fill: '#2b7bb9' });
  // ventanas de cables (a los lados de la protoboard)
  [[8, 12], [8, 100], [W - 16, 12], [W - 16, 100]].forEach(([x, y]) => s.rect(x, y, 8, 40, { rx: 3 }));
  s.text(5, 56, 'ventana de cables', { anchor: 'middle', size: 2.2, tr: `rotate(-90 5 56)` });
  // ventana del interruptor
  s.rect(W - 25, 150, 15, 10, { rx: 1 }); s.text(W - 17.5, 165, 'interruptor', { anchor: 'middle', size: 2.4 });
  s.text(W / 2, 3.2, 'FRENTE', { anchor: 'middle', size: 3, fill: '#888' });
  s.text(0, DA.L + 7, 'Esta cubierta sobresale ' + (-DA.y0) + ' mm por delante de la base y 0 mm por detrás. Las pestañas de las paredes entran en las 6 ranuras.', { size: 2.5, fill: '#555' });
});
// B: PCB
const DB = { L: 136, y0: 0 };
const PCB_HOLES = [[1.5, 12], [35.5, 12], [13.3, 26.3], [24.5, 26.3]];   // se reemplaza por los de la PCB real al generar todo
function cubiertaB(s, holes) {
  s.cut(`M0,0 H${W} V${DB.L} H0 Z`);
  slotsCubierta(s, DB.y0);
  const px = (W - P.PCB.W) / 2, py = 2;
  s.rect(px, py, P.PCB.W, P.PCB.H, { stroke: '#2b7bb9', dash: '2 1.2' });
  s.text(W / 2, py + P.PCB.H / 2, 'PCB', { anchor: 'middle', size: 4, fill: '#2b7bb9' });
  s.text(W / 2, py + P.PCB.H / 2 + 4.5, `${P.PCB.W} × ${P.PCB.H} mm`, { anchor: 'middle', size: 2.6, fill: '#2b7bb9' });
  holes.forEach(([hx, hy]) => { s.circ(px + hx * 2.54, py + hy * 2.54, 1.7); s.circ(px + hx * 2.54, py + hy * 2.54, 3.4, { stroke: '#2b7bb9', dash: '1 1' }); });
  // ventana para pasar cables por detrás de la PCB
  s.rect(22, py + P.PCB.H + 8, 70, 8, { rx: 3 }); s.text(57, py + P.PCB.H + 20, 'ventana de cables (motores y pila)', { anchor: 'middle', size: 2.4 });
  // ventana del interruptor
  s.rect(W - 34, 110, 15, 10, { rx: 1 }); s.text(W - 26.5, 124, 'interruptor', { anchor: 'middle', size: 2.4 });
  s.text(W / 2, 1.2, 'FRENTE', { anchor: 'middle', size: 2.4, fill: '#888' });
}
const holesFromPCB = (() => { try { return require('./pcb-diseno-carrito.js').HOLES; } catch (e) { return PCB_HOLES; } })();
page('2B. CUBIERTA para la PCB (versión final)', 'Los 4 agujeros de 3,4 mm son para tornillos M3 con tuerca. Los sensores IR de la PCB quedan justo en el borde del frente.', s => cubiertaB(s, holesFromPCB));

// ================================================================ PAREDES (2) + ANILLOS
page('3. PAREDES (cortar 2) y SOPORTES', 'Las pestañas de arriba y abajo entran en las ranuras de la base y de la cubierta. No se pega nada.', s => {
  const wall = (y) => {
    const h = P.PARED_H;
    // contorno: pestañas abajo (y=h+T) y arriba (y=0)
    let d = `M0,${T} `;
    TABS.forEach(t => { const x = t - WALL_Y0; d += `H${x} V0 H${x + TAB} V${T} `; });
    d += `H${WALL_L} V${T + h} `;
    for (let i = TABS.length - 1; i >= 0; i--) { const x = TABS[i] - WALL_Y0; d += `H${x + TAB} V${T + h + T} H${x} V${T + h} `; }
    d += `H0 Z`;
    s.group(`translate(0,${y})`, sub(q => { q.cut(d); q.rect(20, T + 10, 38, h - 20, { rx: 4 }); q.rect(74, T + 10, 38, h - 20, { rx: 4 }); q.text(WALL_L / 2, T + h / 2 + 1, 'PARED', { anchor: 'middle', size: 3, fill: '#999' }); q.text(2, T + h + T + 4, 'frente ←', { size: 2.4, fill: '#888' }); }));
  };
  wall(0); wall(T + P.PARED_H + T + 8);
  // anillos de la rueda loca
  const ry = 2 * (T + P.PARED_H + T + 8) + 8;
  s.text(0, ry, 'ANILLOS de la rueda loca: cortar 4 normales + 1 con hueco chico (el de abajo)', { size: 2.8, fill: '#555' });
  for (let i = 0; i < 5; i++) {
    const cx = 20 + i * 38, cy = ry + 28;
    s.circ(cx, cy, 17); s.circ(cx, cy, i === 4 ? P.BOLA.tope / 2 : P.BOLA.hueco / 2);
    s.text(cx, cy + 22, i === 4 ? 'último (hueco ' + P.BOLA.tope + ')' : 'anillo (hueco ' + P.BOLA.hueco + ')', { anchor: 'middle', size: 2.3 });
  }
  s.text(0, ry + 58, 'Se apilan DEBAJO de la base, alineados con el hueco de la rueda loca. El anillo de hueco chico va de último. Añadir o quitar anillos hasta que el carro quede nivelado.', { size: 2.4, fill: '#555' });
  // tacos para la PCB
  const ty = ry + 70;
  s.text(0, ty, 'TACOS para la PCB: cortar 8 (se apilan de a 2 en cada tornillo, entre la PCB y la cubierta)', { size: 2.8, fill: '#555' });
  for (let i = 0; i < 8; i++) { const x = (i % 4) * 22, y = ty + 5 + Math.floor(i / 4) * 16; s.rect(x, y, 14, 12, { rx: 1 }); s.circ(x + 7, y + 6, 1.7); }
});

// ================================================================ SENSORES (versión protoboard)
page('4. SENSORES para la protoboard', 'Cada sensor lleva un emisor IR y un receptor IR separados por una tarjeta negra (la barrera). Cortar 2 soportes + 2 tarjetas.', s => {
  const pod = (x, y) => s.group(`translate(${x},${y})`, sub(q => {
    const w = 32, h = 26;
    q.cut(`M0,0 H${w} V${h} H${w - 4} V${h + T} H${w - 12} V${h} H12 V${h + T} H4 V${h} H0 Z`);
    q.circ(9.5, 12, 2.7); q.circ(22.5, 12, 2.7);
    q.rect(15.2, 4, 1.6, 17);
    q.text(9.5, 20.5, 'emisor', { anchor: 'middle', size: 2.2 }); q.text(22.5, 20.5, 'receptor', { anchor: 'middle', size: 2.2 });
  }));
  pod(0, 0); pod(50, 0);
  s.text(0, 40, 'Soportes: la lengüeta de abajo entra en la ranura inclinada de la base. El LED emisor (transparente/azul) a la izquierda y el receptor (negro) a la derecha, en AMBOS soportes.', { size: 2.4, fill: '#555' });
  s.text(0, 46, 'Tarjetas barrera (cartulina NEGRA gruesa o cartón forrado en cinta negra): cortar 2 de 14 × 22 mm y meterlas en la ranura del centro.', { size: 2.4, fill: '#555' });
  s.rect(0, 52, 14, 22); s.rect(24, 52, 14, 22);
});

// ================================================================ VISTAS DE COMPROBACIÓN
function vistas(modo) {
  // arriba (planta) y lado, escala 1:1 en mm, luego se reduce con viewBox
  const proto = modo === 'proto';
  const dk = proto ? DA : DB;
  const sc = 2;
  const parts = [];
  const R = (x, y, w, h, fill, st = '#444', o = '') => parts.push(`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" stroke="${st}" stroke-width="0.4"${o}/>`);
  const Tx = (x, y, s, o = '') => parts.push(`<text x="${f(x)}" y="${f(y)}" font-size="3.4" fill="#222" ${o}>${esc(s)}</text>`);
  // ----- planta
  const ox = 30, oy = 50;
  const xw = x => ox + x, yw = y => oy + y;
  parts.push(`<text x="${ox}" y="12" font-size="5" font-weight="bold">Vista desde arriba</text>`);
  R(xw(-P.RUEDA.ancho + NOTCH - 2), yw(AX_Y - P.RUEDA.D / 2), P.RUEDA.ancho, P.RUEDA.D, '#333', '#000');
  R(xw(W - NOTCH + 2), yw(AX_Y - P.RUEDA.D / 2), P.RUEDA.ancho, P.RUEDA.D, '#333', '#000');
  R(xw(0), yw(0), W, L, '#d9c9a8', '#8a6d3b');
  // muescas
  R(xw(0), yw(AX_Y - 39), NOTCH, 78, '#fff', '#fff'); R(xw(W - NOTCH), yw(AX_Y - 39), NOTCH, 78, '#fff', '#fff');
  R(xw(-P.RUEDA.ancho + NOTCH - 2), yw(AX_Y - P.RUEDA.D / 2), P.RUEDA.ancho, P.RUEDA.D, '#333', '#000');
  R(xw(W - NOTCH + 2), yw(AX_Y - P.RUEDA.D / 2), P.RUEDA.ancho, P.RUEDA.D, '#333', '#000');
  const my = AX_Y - P.MOT.eje;
  R(xw(NOTCH), yw(my), P.MOT.W, P.MOT.L, '#f2b45a', '#a15d00'); R(xw(W - NOTCH - P.MOT.W), yw(my), P.MOT.W, P.MOT.L, '#f2b45a', '#a15d00');
  R(xw((W - P.BAT.W) / 2), yw(34), P.BAT.W, P.BAT.L, '#7fd37f', '#2a7a2a');
  WALL_X.forEach(x => R(xw(x), yw(WALL_Y0), T, WALL_L, '#b88a4b', '#6d4c1a'));
  parts.push(`<circle cx="${xw(W / 2)}" cy="${yw(16)}" r="12.5" fill="#bbb" stroke="#555" stroke-width="0.4"/>`);
  // cubierta (transparente) y placa
  R(xw(0), yw(dk.y0), W, dk.L, 'rgba(120,170,230,0.25)', '#2b7bb9', ' stroke-dasharray="3 1.5"');
  if (proto) R(xw((W - P.PROTO.W) / 2), yw(dk.y0 + 6), P.PROTO.W, P.PROTO.L, 'rgba(255,255,255,0.8)', '#2b7bb9');
  else R(xw((W - P.PCB.W) / 2), yw(2), P.PCB.W, P.PCB.H, 'rgba(60,160,60,0.55)', '#1c6b1c');
  Tx(xw(W / 2) - 10, yw(Math.min(0, dk.y0)) - 12, 'FRENTE ↑', 'font-weight="bold"');
  parts.push(`<text x="${xw(W / 2)}" y="${yw(Math.min(0, dk.y0)) - 4}" font-size="3.4" text-anchor="middle" fill="#2b7bb9">${proto ? 'cubierta protoboard' : 'cubierta PCB'}</text>`);
  // medidas generales
  const ancho = W + 2 * (P.RUEDA.ancho - NOTCH + 2), largo = Math.max(L, dk.y0 + dk.L) - Math.min(0, dk.y0);
  Tx(xw(-24), yw(L) + 10, `Ancho total con ruedas: ${f(ancho)} mm   ·   Largo total: ${f(largo)} mm`);
  // ----- lado
  const sx = 30, sy = 345, gz = sy; // suelo en y=sy, z hacia arriba
  const zy = z => gz - z;
  parts.push(`<text x="${sx}" y="${sy - 112}" font-size="5" font-weight="bold">Vista de lado (a la izquierda el FRENTE)</text>`);
  const baseTop = P.RUEDA.D / 2 - P.MOT.ejeH;              // altura de la cara de arriba de la base
  parts.push(`<line x1="${sx - 10}" y1="${zy(0)}" x2="${sx + 230}" y2="${zy(0)}" stroke="#666" stroke-width="0.5"/>`);
  parts.push(`<circle cx="${sx + AX_Y}" cy="${zy(P.RUEDA.D / 2)}" r="${P.RUEDA.D / 2}" fill="#333" stroke="#000"/>`);
  parts.push(`<circle cx="${sx + AX_Y}" cy="${zy(P.RUEDA.D / 2)}" r="${P.RUEDA.D / 2 - 7}" fill="#f4d800"/>`);
  R(sx, zy(baseTop), L, T, '#d9c9a8', '#8a6d3b');
  R(sx + my, zy(baseTop + P.MOT.H), P.MOT.L, P.MOT.H, '#f2b45a', '#a15d00');
  R(sx + 34, zy(baseTop + P.BAT.H), P.BAT.L, P.BAT.H, '#7fd37f', '#2a7a2a');
  R(sx + WALL_Y0, zy(baseTop + T + P.PARED_H), WALL_L, P.PARED_H, 'rgba(184,138,75,0.55)', '#6d4c1a');
  const deckZ = baseTop + T + P.PARED_H;
  R(sx + dk.y0, zy(deckZ + T), dk.L, T, '#d9c9a8', '#8a6d3b');
  if (proto) R(sx + dk.y0 + 6, zy(deckZ + T + 8.5), P.PROTO.L, 8.5, '#fff', '#2b7bb9'); else R(sx + 2, zy(deckZ + T + 14), P.PCB.H, 14, '#6fbf6f', '#1c6b1c');
  parts.push(`<circle cx="${sx + 16}" cy="${zy(P.BOLA.hueco / 2)}" r="6.35" fill="#bbb" stroke="#555"/>`);
  parts.push(`<rect x="${sx + 16 - 12.5}" y="${zy(baseTop - T)}" width="25" height="${baseTop - T}" fill="rgba(200,200,200,0.5)" stroke="#888" stroke-dasharray="1.5 1"/>`);
  Tx(sx + 4, zy(0) + 8, `Altura de la base al piso: ${f(baseTop - T)} mm   ·   Altura total: ${f(deckZ + T + (proto ? 8.5 : 14))} mm`);
  Tx(sx + 4, zy(0) + 13, 'La rueda loca baja con los anillos hasta tocar el piso (rojo = su hueco).');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${proto ? 300 : 300} 360" width="900" height="1080" font-family="Arial, sans-serif"><rect width="300" height="360" fill="#fff"/>${parts.join('')}</svg>`;
}

fs.writeFileSync(path.join(OUT, 'chasis-vista-prototipo.svg'), vistas('proto'));
fs.writeFileSync(path.join(OUT, 'chasis-vista-final.svg'), vistas('pcb'));
pages.forEach((p, i) => fs.writeFileSync(path.join(OUT, `chasis-pagina-${i + 1}.svg`), p.svg));
// HTML de impresión: una página A4 por plantilla
const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Plantillas del chasis (1:1, A4)</title>
<style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}.p{width:210mm;height:297mm;page-break-after:always;overflow:hidden}svg{display:block}</style>
<body>${pages.map(p => `<div class="p">${p.svg}</div>`).join('')}</body></html>`;
fs.writeFileSync(path.join(OUT, 'chasis-plantillas.html'), html);
console.log('Chasis listo:', pages.length, 'páginas en', OUT);
