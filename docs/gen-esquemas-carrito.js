// Generador de los esquemas del carrito esquiva-obstáculos (guía paso a paso + esquemas finales A y B).
// Uso: node docs/gen-esquemas-carrito.js
// Salida: assets/imagenes/sistemas-hipermedia/esquema-carrito-final-{a-6v,b-motores-aparte}.svg
//         assets/imagenes/sistemas-hipermedia/guia-carrito/*.svg
const fs = require('fs');
const path = require('path');
const IMG = path.join(__dirname, '..', 'assets', 'imagenes', 'sistemas-hipermedia');
const STEPS = path.join(IMG, 'guia-carrito');
fs.mkdirSync(STEPS, { recursive: true });

const W = 1700, H = 1120;
const INK = '#222', RED = '#d62828', BLUE = '#1d6fd6', GRN = '#0f9d58', ORG = '#e67e22', GREY = '#555', BRN = '#b8672f', YEL = '#fff4c2';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------------------------------------------------------------- contexto de dibujo
function ctx(mir, out, dy = 0, dx = 0) {
  const X = x => (mir ? W - x : x) + dx;
  const Y = y => y + dy;
  const flip = { start: 'end', end: 'start', middle: 'middle' };
  const f = {};
  f.line = (x1, y1, x2, y2, o = {}) => out.push(`<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${o.c || INK}" stroke-width="${o.w || 2.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.mk ? ` marker-end="url(#${o.mk})"` : ''}${o.cap ? ` stroke-linecap="${o.cap}"` : ''}/>`);
  f.poly = (pts, o = {}) => out.push(`<polyline points="${pts.map(p => X(p[0]) + ',' + Y(p[1])).join(' ')}" fill="none" stroke="${o.c || INK}" stroke-width="${o.w || 2.5}" stroke-linejoin="round"/>`);
  f.polygon = (pts, o = {}) => out.push(`<polygon points="${pts.map(p => X(p[0]) + ',' + Y(p[1])).join(' ')}" fill="${o.fill || '#fff'}" stroke="${o.stroke || INK}" stroke-width="${o.w || 2.5}"/>`);
  f.rect = (x, y, w, h, o = {}) => out.push(`<rect x="${(mir ? W - x - w : x) + dx}" y="${Y(y)}" width="${w}" height="${h}"${o.rx ? ` rx="${o.rx}"` : ''} fill="${o.fill || '#fff'}" stroke="${o.stroke === undefined ? INK : o.stroke}" stroke-width="${o.w || 2.5}"/>`);
  f.circle = (cx, cy, r, o = {}) => out.push(`<circle cx="${X(cx)}" cy="${Y(cy)}" r="${r}" fill="${o.fill || '#fff'}" stroke="${o.stroke || INK}" stroke-width="${o.w || 2.5}"/>`);
  f.dot = (x, y, c) => out.push(`<circle cx="${X(x)}" cy="${Y(y)}" r="4.5" fill="${c || INK}"/>`);
  f.path = (d, o = {}) => { // solo para uso sin espejo
    out.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${o.stroke || INK}" stroke-width="${o.w || 2.5}"/>`);
  };
  f.text = (x, y, s, o = {}) => {
    const a = o.a || 'start';
    out.push(`<text x="${X(x)}" y="${Y(y)}" font-size="${o.fs || 13}"${o.b ? ' font-weight="bold"' : ''} fill="${o.c || INK}" text-anchor="${mir ? flip[a] : a}">${esc(s)}</text>`);
  };
  f.raw = s => out.push(s);
  return f;
}

// ---------------------------------------------------------------- símbolos
function flag(f, x, y, label, color = RED, side = 'l') {
  f.line(x, y, x, y - 12, { c: color });
  f.line(x - 10, y - 12, x + 10, y - 12, { c: color, w: 3.5 });
  if (label) f.text(side === 'l' ? x - 14 : x + 14, y - 8, label, { fs: 12, b: 1, c: color, a: side === 'l' ? 'end' : 'start' });
}
function gnd(f, x, y) {
  f.line(x, y, x, y + 10);
  f.line(x - 10, y + 10, x + 10, y + 10, { w: 3, c: BLUE });
  f.line(x - 6, y + 15, x + 6, y + 15, { w: 3, c: BLUE });
  f.line(x - 2, y + 20, x + 2, y + 20, { w: 3, c: BLUE });
}
function ledDown(f, x, y, arrows) {
  f.polygon([[x - 13, y], [x + 13, y], [x, y + 26]], { fill: '#f2f2f2' });
  f.line(x - 13, y + 28, x + 13, y + 28, { w: 3 });
  if (arrows) { f.line(x + 17, y + 6, x + 31, y - 8, { w: 2 }); f.line(x + 21, y + 14, x + 35, y, { w: 2 }); }
}
function photod(f, x, y) {
  f.line(x - 15, y, x + 15, y, { w: 4 });
  f.polygon([[x - 15, y + 42], [x + 15, y + 42], [x, y + 4]], { fill: '#555' });
}
function tag(f, x, y, w, h, col, txt) {
  f.rect(x, y, w, h, { fill: col, stroke: col, rx: 5 });
  f.text(x + w / 2, y + h / 2 + 5, txt, { fs: 13, b: 1, c: '#fff', a: 'middle' });
}
function capCer(f, x, y) { f.line(x - 13, y, x + 13, y, { w: 3 }); f.line(x - 13, y + 8, x + 13, y + 8, { w: 3 }); }
function capEle(f, x, y) {
  f.line(x - 13, y, x + 13, y, { w: 3 });
  f.path(`M${x - 13},${y + 11} Q${x},${y + 4} ${x + 13},${y + 11}`, { w: 3 });
  f.text(x - 20, y - 2, '+', { fs: 15, b: 1, c: RED, a: 'end' });
}
function npn(f, cx, cy, yC, yE) {
  f.circle(cx, cy, 32);
  f.line(cx - 13, cy - 16, cx - 13, cy + 16, { w: 4 });
  f.poly([[cx - 13, cy - 8], [cx + 15, cy - 28], [cx + 15, yC]]);
  f.poly([[cx - 13, cy + 8], [cx + 15, cy + 28], [cx + 15, yE]]);
  f.text(cx - 20, cy - 7, 'B', { fs: 12, b: 1, c: GREY, a: 'end' });
  f.text(cx + 22, cy - 32, 'C', { fs: 12, b: 1, c: GREY });
  f.text(cx + 22, cy + 42, 'E', { fs: 12, b: 1, c: GREY });
}

// ---------------------------------------------------------------- módulos
// ----- alimentación (abajo)
function power(f, o) {
  const yP = 985, yG = 1075;
  const B = o.variant === 'B';
  f.text(30, 940, o.title || (B ? 'ALIMENTACIÓN: pack de lógica (≈ 6 V) y pack de motores aparte' : 'ALIMENTACIÓN: un solo pack de 4 pilas AA (≈ 6 V) para todo'), { fs: 14, b: 1 });
  const xr = o.railEnd || (B ? 760 : 560);
  // pack 1
  f.line(70, yP, 110, yP, { c: RED, w: 3 });
  f.line(70, yP, 70, yP + 36, { c: RED, w: 3 });
  f.line(54, yP + 36, 86, yP + 36, { w: 3 });
  f.line(61, yP + 46, 79, yP + 46, { w: 5 });
  f.line(70, yP + 46, 70, yG, { w: 3 });
  f.text(94, yP + 34, '+', { fs: 15, b: 1, c: RED });
  f.text(94, yP + 62, '−', { fs: 15, b: 1, c: BLUE });
  f.text(50, yP + 40, 'BT1', { b: 1, a: 'end' });
  f.text(50, yP + 56, 'portapilas', { fs: 12, a: 'end' });
  f.text(50, yP + 71, '4×AA ≈ 6 V', { fs: 12, a: 'end' });
  f.text(50, yP + 86, 'cable ROJO = +', { fs: 11, b: 1, c: RED, a: 'end' });
  f.text(50, yP + 100, 'cable NEGRO = −', { fs: 11, b: 1, c: INK, a: 'end' });
  // interruptor
  f.dot(110, yP); f.dot(150, yP);
  f.line(110, yP, 144, yP - 17);
  f.text(130, yP - 24, 'SW1', { fs: 12, b: 1, a: 'middle' });
  f.text(130, yP + 22, 'interruptor', { fs: 10.5, c: GREY, a: 'middle' });
  // rieles
  const xs = B ? 400 : xr;
  f.line(150, yP, B ? 400 : xr, yP, { c: RED, w: 4 });
  f.text(160, yP - 10, B ? '+6V (lógica) = riel ROJO' : '+6V = riel ROJO de la protoboard', { fs: 12, b: 1, c: RED });
  f.line(70, yG, xr, yG, { c: BLUE, w: 4 });
  f.text(xr, yG + 20, B ? 'GND COMÚN: une el − de los dos packs' : 'GND (−) = riel AZUL de la protoboard', { fs: 12, b: 1, c: B ? RED : BLUE, a: 'end' });
  if (o.caps) {
    // C1
    const cx1 = B ? 620 : 250;
    const railTop = B ? yP : yP;
    if (B) {
      // pack de motores
      f.line(490, yP, 530, yP, { c: BRN, w: 3 });
      f.line(490, yP, 490, yP + 36, { c: BRN, w: 3 });
      f.line(474, yP + 36, 506, yP + 36, { w: 3 });
      f.line(481, yP + 46, 499, yP + 46, { w: 5 });
      f.line(490, yP + 46, 490, yG, { w: 3 });
      f.text(514, yP + 34, '+', { fs: 15, b: 1, c: BRN });
      f.text(470, yP + 40, 'BT2', { b: 1, a: 'end' });
      f.text(470, yP + 56, 'pack de', { fs: 12, a: 'end' });
      f.text(470, yP + 71, 'motores', { fs: 12, a: 'end' });
      f.dot(530, yP); f.dot(570, yP);
      f.line(530, yP, 564, yP - 17);
      f.text(550, yP - 24, 'SW2', { fs: 12, b: 1, a: 'middle' });
      f.line(570, yP, 760, yP, { c: BRN, w: 4 });
      f.text(580, yP - 10, '+VM (motores)', { fs: 12, b: 1, c: BRN });
    }
    f.dot(cx1, yP, B ? BRN : RED); f.line(cx1, yP, cx1, 1030); capEle(f, cx1, 1030); f.line(cx1, 1039, cx1, yG); f.dot(cx1, yG, BLUE);
    f.text(cx1 + 20, 1034, 'C1', { b: 1 }); f.text(cx1 + 20, 1049, B ? '470 µF' : '470 µF', { fs: 12 }); f.text(cx1 + 20, 1063, '(franja − a GND)', { fs: 10.5, c: GREY });
    const cx3 = B ? 190 : 420;
    f.dot(cx3, yP, RED); f.line(cx3, yP, cx3, 1030); capCer(f, cx3, 1030); f.line(cx3, 1038, cx3, yG); f.dot(cx3, yG, BLUE);
    f.text(cx3 + 18, 1034, 'C3', { b: 1 }); f.text(cx3 + 18, 1049, '100 nF', { fs: 12 }); f.text(cx3 + 18, 1063, '(al L293D)', { fs: 10.5, c: GREY });
    if (B) {
      const cx6 = 290;
      f.dot(cx6, yP, RED); f.line(cx6, yP, cx6, 1030); capEle(f, cx6, 1030); f.line(cx6, 1039, cx6, yG); f.dot(cx6, yG, BLUE);
      f.text(cx6 + 20, 1034, 'C6', { b: 1 }); f.text(cx6 + 20, 1049, '100 µF', { fs: 12 }); f.text(cx6 + 20, 1063, '(franja − a GND)', { fs: 10.5, c: GREY });
    }
  }
  if (o.meter) {
    f.rect(650, 975, 112, 100, { fill: '#f3f3f3', rx: 8 });
    f.rect(662, 987, 88, 36, { fill: '#e6f3d6', rx: 4, w: 1.5 });
    f.text(706, 1013, '6,0 V', { fs: 20, b: 1, a: 'middle' });
    f.text(706, 1046, 'multímetro', { fs: 12, a: 'middle' });
    f.text(706, 1062, 'en voltios DC', { fs: 10.5, c: GREY, a: 'middle' });
    f.poly([[650, 1000], [620, 1000], [620, yP]], { c: RED, w: 2.5 });
    f.poly([[650, 1050], [620, 1050], [620, yG]], { c: INK, w: 2.5 });
    f.dot(620, yP, RED); f.dot(620, yG, INK);
    f.text(612, 997, 'punta roja', { fs: 11, c: RED, a: 'end' });
    f.text(612, 1047, 'punta negra', { fs: 11, a: 'end' });
  }
}

// ----- sensor (emisor + receptor + R3), a la izquierda; con espejo queda a la derecha
function sensor(f, n, col, hdr) {
  f.text(40, 80, hdr, { fs: 16, b: 1, c: col });
  // emisor
  f.text(150, 104, 'EMISOR', { fs: 11, b: 1, c: GREY, a: 'middle' });
  flag(f, 150, 125, '+6V');
  f.line(150, 125, 150, 160);
  f.rect(138, 160, 24, 50);
  f.line(150, 210, 150, 250);
  ledDown(f, 150, 250, false);
  f.line(150, 278, 150, 330);
  gnd(f, 150, 330);
  f.text(134, 182, 'R1' + n, { b: 1, a: 'end' });
  f.text(134, 199, '220 Ω', { a: 'end' });
  f.text(134, 258, 'D1' + n, { b: 1, a: 'end' });
  f.text(134, 274, 'LED IR', { a: 'end' });
  f.text(134, 290, 'transparente', { a: 'end' });
  f.text(134, 306, '+ pata larga ↑', { fs: 11, b: 1, c: RED, a: 'end' });
  f.text(134, 321, '− pata corta ↓', { fs: 11, b: 1, c: BLUE, a: 'end' });
  // obstáculo y rayos
  f.rect(195, 128, 90, 28, { fill: '#f3c9a0', stroke: '#a9794c', rx: 8, w: 1.5 });
  f.text(240, 147, 'obstáculo', { fs: 12, a: 'middle' });
  f.line(166, 246, 208, 163, { c: ORG, dash: '6 4', mk: 'ao' });
  f.line(272, 163, 316, 198, { c: ORG, dash: '6 4', mk: 'ao' });
  f.text(180, 200, 'IR', { fs: 12, b: 1, c: ORG, a: 'end' });
  f.text(290, 192, 'reflejo', { fs: 12, b: 1, c: ORG, a: 'end' });
  // barrera
  f.rect(236, 235, 8, 105, { fill: '#111', stroke: 'none' });
  f.text(240, 358, 'BARRERA', { fs: 11, b: 1, a: 'middle' });
  f.text(240, 371, 'OPACA', { fs: 11, b: 1, a: 'middle' });
  // receptor
  f.text(330, 104, 'RECEPTOR', { fs: 11, b: 1, c: GREY, a: 'middle' });
  flag(f, 330, 125, '+6V');
  f.line(330, 125, 330, 170);
  photod(f, 330, 170);
  f.line(330, 212, 330, 270);
  f.dot(330, 270);
  f.text(352, 186, 'D2' + n, { b: 1 });
  f.text(352, 203, 'Receptor IR');
  f.text(352, 219, '(oscuro)');
  f.text(352, 236, 'pata CORTA ↑ a +6V', { fs: 11, b: 1, c: RED });
  f.text(352, 251, 'pata LARGA ↓ a N', { fs: 11, b: 1, c: BLUE });
  // R3
  f.line(330, 270, 330, 300);
  f.rect(318, 300, 24, 50);
  f.line(330, 350, 330, 385);
  gnd(f, 330, 385);
  f.text(352, 322, 'R3' + n, { b: 1 });
  f.text(352, 339, '1 kΩ');
  f.text(345, 287, 'N', { fs: 15, b: 1 });
}

// ----- red de salida (R4 pull-up, R2 + LED rojo) sobre el cable y=225; xR4 / xLed
function outNet(f, n, xR4, xLed) {
  f.dot(xR4, 225); f.dot(xLed, 225);
  // R4
  f.line(xR4, 225, xR4, 172);
  f.rect(xR4 - 12, 122, 24, 50);
  f.line(xR4, 122, xR4, 104);
  flag(f, xR4, 104, '+6V');
  f.text(xR4 - 20, 142, 'R4' + n, { b: 1, a: 'end' });
  f.text(xR4 - 20, 159, '10 kΩ', { a: 'end' });
  // R2 + LED
  f.line(xLed, 225, xLed, 213);
  ledDown(f, xLed, 185, true);
  f.line(xLed, 185, xLed, 172);
  f.rect(xLed - 12, 122, 24, 50);
  f.line(xLed, 122, xLed, 104);
  flag(f, xLed, 104, '+6V', RED, 'r');
  f.text(xLed + 24, 142, 'R2' + n, { b: 1 });
  f.text(xLed + 24, 159, '1 kΩ');
  f.text(xLed - 18, 182, 'D3' + n, { b: 1, a: 'end' });
  f.text(xLed - 18, 197, 'LED rojo', { a: 'end' });
  f.text(xLed - 18, 211, '(+ larga, − corta)', { fs: 10, c: GREY, a: 'end' });
}

// ----- decisor con transistores (par Darlington)
function decT(f, n, col, inset, toPin) {
  f.line(330, 270, 484, 270);               // nodo N -> base de Q1
  npn(f, 497, 270, 225, 335);                // Q1
  f.line(512, 335, 604, 335);                // E de Q1 -> B de Q2
  npn(f, 617, 335, 225, 400);                // Q2
  gnd(f, 632, 400);
  f.text(545, 258, 'Q1', { fs: 13, b: 1 });
  f.text(545, 273, '2N2222A', { fs: 12 });
  f.text(652, 322, 'Q2', { fs: 13, b: 1 });
  f.text(652, 337, '2N2222A', { fs: 12 });
  f.text(652, 354, 'E de Q1 → B de Q2', { fs: 10, c: GREY });
  f.text(652, 366, '(par Darlington)', { fs: 10, c: GREY });
  // cable de salida
  f.line(512, 225, 740, 225);
  f.dot(512, 225); f.dot(632, 225);
  outNet(f, n, 570, 690);
  tag(f, 740, 213, 62, 24, col, n === 'I' ? 'IZQ' : 'DER');
  f.text(740, 253, 'a L293D pata ' + toPin, { fs: 11, c: GREY });
  if (inset) {
    // patas del 2N2222A visto de frente
    f.text(520, 405, '2N2222A visto de frente', { fs: 11, b: 1, a: 'middle' });
    f.text(520, 419, '(cara plana hacia ti)', { fs: 10.5, c: GREY, a: 'middle' });
    f.path('M496,468 L496,446 A24,24 0 0 1 544,446 L544,468 Z', { fill: '#f2f2f2' });
    [502, 520, 538].forEach((x, i) => {
      f.line(x, 468, x, 492, { w: 2 });
      f.text(x, 508, 'EBC'[i], { fs: 14, b: 1, a: 'middle', c: i === 0 ? INK : (i === 1 ? ORG : INK) });
    });
    f.text(520, 524, 'E=emisor · B=base · C=colector', { fs: 10.5, c: GREY, a: 'middle' });
  }
}

// ----- decisor con LM358: red de salida, umbral y cables a las patas
function decC(f, n, col, pins, notes = true) {
  // pins = {out, minus, plus} números de pata
  f.line(330, 270, 760, 270);                // N -> pata IN−
  f.line(760, 225, 526, 225);                // salida -> etiqueta
  outNet(f, n, 590, 690);
  tag(f, 470, 213, 56, 24, col, n === 'I' ? 'IZQ' : 'DER');
  f.text(526, 253, 'a L293D ' + (n === 'I' ? '7' : '15'), { fs: 11, c: GREY, a: 'end' });
  // umbral
  flag(f, 420, 385, '+6V');
  f.line(420, 385, 420, 405);
  f.rect(408, 405, 24, 50);
  f.line(420, 455, 420, 478);
  f.rect(408, 478, 24, 70);
  f.line(420, 548, 420, 570);
  gnd(f, 420, 570);
  f.line(460, 513, 434, 513, { mk: 'ak' });
  f.poly([[460, 513], [460, 315], [760, 315]]);
  f.text(400, 427, 'R5' + n, { b: 1, a: 'end' });
  f.text(400, 444, '47 kΩ', { a: 'end' });
  f.text(400, 502, 'P1' + n, { b: 1, a: 'end' });
  f.text(400, 519, 'trimmer o', { a: 'end' });
  f.text(400, 535, 'potenciómetro', { a: 'end' });
  f.text(400, 551, '10 kΩ', { a: 'end' });
  if (notes) {
    f.text(470, 532, 'cursor = pata del', { fs: 11, c: GREY });
    f.text(470, 546, 'CENTRO del trimmer', { fs: 11, c: GREY });
    f.text(470, 560, 'extremos: R5 y GND', { fs: 11, c: GREY });
  }
  // etiquetas de pata sobre los cables
  const ar = n === 'I' ? '→' : '←', ar2 = n === 'I' ? '←' : '→';
  f.text(752, 265, 'N (receptor) ' + ar + ' pata ' + pins.minus, { fs: 11, b: 1, c: BLUE, a: 'end' });
  f.text(752, 310, 'cursor del trimmer ' + ar + ' pata ' + pins.plus, { fs: 11, b: 1, c: BLUE, a: 'end' });
  f.text(752, 243, ar2 + ' pata ' + pins.out + ' (salida)', { fs: 11, b: 1, c: col, a: 'end' });
  f.text(470, 305, 'N = voltaje del receptor', { fs: 11, c: GREY });
}

// ----- LM358: caja con patas en su orden real (muesca arriba)
function lm358(f, o) {
  f.rect(760, 190, 180, 205, { fill: '#eef3fb', rx: 6 });
  f.path('M830,190 A20,20 0 0 0 870,190', { fill: '#fff' });
  f.text(850, 204, 'muesca', { fs: 9, c: '#777', a: 'middle' });
  f.text(850, 285, 'U2', { fs: 14, c: GREY, a: 'middle' });
  f.text(850, 308, 'LM358', { fs: 20, b: 1, a: 'middle' });
  const rows = [225, 270, 315, 360];
  const L = ['1 · OUT A', '2 · IN− A', '3 · IN+ A', '4 · GND'];
  const R = ['8 · V+', '7 · OUT B', '6 · IN− B', '5 · IN+ B'];
  const cl = [GRN, GRN, GRN, INK], cr = [INK, BLUE, BLUE, BLUE];
  rows.forEach((y, i) => {
    f.text(766, y + 4, L[i], { fs: 12, b: i < 3, c: cl[i] });
    f.text(934, y + 4, R[i], { fs: 12, b: i > 0, c: cr[i], a: 'end' });
  });
  // alimentación del chip
  f.line(760, 360, 740, 360); gnd(f, 740, 360);
  f.line(940, 225, 955, 225); flag(f, 955, 225, '', RED);
  f.text(850, 340, o && o.partial ? '(solo el lado izq. por ahora)' : '', { fs: 10, c: GREY, a: 'middle' });
}

// ----- L293D base: caja + alimentación (patas 1, 8, 9, 16, 2, 10 y GND)
const R293 = [490, 536, 582, 628, 674, 720, 766, 812];
function l293Box(f, o) {
  f.rect(760, 456, 180, 390, { fill: '#eef3fb', rx: 6 });
  f.path('M830,456 A20,20 0 0 0 870,456', { fill: '#fff' });
  f.text(850, 470, 'muesca', { fs: 9, c: '#777', a: 'middle' });
  f.text(850, 650, 'U1', { fs: 14, c: GREY, a: 'middle' });
  f.text(850, 673, 'L293D', { fs: 20, b: 1, a: 'middle' });
  const L = ['1 · EN 1,2', '2 · 1A', '3 · 1Y', '4 · GND', '5 · GND', '6 · 2Y', '7 · 2A', '8 · VCC2'];
  const R = ['16 · VCC1', '15 · 4A', '14 · 4Y', '13 · GND', '12 · GND', '11 · 3Y', '10 · 3A', '9 · EN 3,4'];
  for (let i = 0; i < 8; i++) {
    f.text(766, R293[i] + 4, L[i], { fs: 12, c: '#333' });
    f.text(934, R293[i] + 4, R[i], { fs: 12, c: '#333', a: 'end' });
  }
}
function l293Left(f, o) {
  const r = R293;
  f.line(760, r[0], 740, r[0]); flag(f, 740, r[0], '+6V');
  f.line(760, r[1], 740, r[1]); gnd(f, 740, r[1]);
  f.line(760, r[3], 740, r[3]); f.line(760, r[4], 740, r[4]); f.line(740, r[3], 740, r[4]); gnd(f, 740, r[4]);
  f.line(760, r[7], 740, r[7]);
  if (o && o.vm) flag(f, 740, r[7], '+VM', BRN); else flag(f, 740, r[7], '+6V');
}
function l293Right(f, o) {
  const r = R293;
  f.line(760, r[0], 740, r[0]); flag(f, 740, r[0], '+6V');
  f.line(760, r[3], 740, r[3]); f.line(760, r[4], 740, r[4]); f.line(740, r[3], 740, r[4]); gnd(f, 740, r[4]);
  f.line(760, r[6], 740, r[6]); gnd(f, 740, r[6]);
  f.line(760, r[7], 740, r[7]); flag(f, 740, r[7], '+6V');
}
// entrada de señal: modo 'gnd' (provisional) o 'tag'
function inLeft(f, mode, col) {
  const y = R293[6];
  if (mode === 'gnd') { f.line(760, y, 740, y); gnd(f, 740, y); f.text(728, y + 4, 'provisional: a GND', { fs: 10.5, c: GREY, a: 'end' }); }
  else {
    f.line(760, y, 722, y);
    tag(f, 666, y - 12, 56, 24, col, 'IZQ');
    f.text(658, y - 2, 'cable de la SALIDA', { fs: 11, c: GREY, a: 'end' });
    f.text(658, y + 12, 'del sensor izquierdo', { fs: 11, c: GREY, a: 'end' });
  }
}
function inRight(f, mode, col, label) {
  const y = R293[1];
  if (mode === 'gnd') { f.line(760, y, 740, y); gnd(f, 740, y); f.text(728, y + 4, 'provisional: a GND', { fs: 10.5, c: GREY, a: 'end' }); }
  else {
    f.line(760, y, 722, y);
    tag(f, 666, y - 12, 56, 24, col, col === GRN ? 'IZQ' : 'DER');
    f.text(722, y - 18, label[0], { fs: 11, c: GREY, a: 'end' });
    f.text(722, y + 34, label[1], { fs: 11, c: GREY, a: 'end' });
  }
}
// motor entre las patas 3 y 6 (izq.) / 14 y 11 (der.), con espejo de columnas
function motor(f, m, wheel, note, plusTop) {
  const r = R293;
  f.poly([[760, r[2]], [560, r[2]], [560, 621]]);
  f.poly([[760, r[5]], [560, r[5]], [560, 681]]);
  f.circle(560, 651, 30);
  f.text(560, 659, 'M', { fs: 20, b: 1, a: 'middle' });
  f.text(602, 640, m, { fs: 14, b: 1 });
  f.text(602, 657, 'rueda ' + wheel, { fs: 12 });
  f.text(602, 673, note, { fs: 11, c: GREY });
  f.text(574, plusTop ? 612 : 696, '+', { fs: 14, b: 1 });
}
function motorCap(f, name) {
  const r = R293;
  f.dot(560, r[2]); f.dot(560, r[5]);
  f.poly([[560, r[2]], [500, r[2]], [500, 647]]);
  f.poly([[560, r[5]], [500, r[5]], [500, 655]]);
  capCer(f, 500, 647);
  f.text(480, 648, name, { fs: 12, b: 1, a: 'end' });
  f.text(480, 663, '100 nF', { fs: 11, a: 'end' });
}

// ----- panel de comportamiento (solo esquema final)
function behavior(f, B) {
  const x0 = 1110;
  f.text(x0, 940, 'Qué hace el carrito', { fs: 14, b: 1 });
  const cols = [[x0, 160, 'Obstáculo'], [x0 + 160, 95, 'Rueda izq.'], [x0 + 255, 95, 'Rueda der.'], [x0 + 350, 210, 'Resultado']];
  const rows = [
    ['ninguno', 'gira', 'gira', 'avanza recto'],
    ['a la izquierda', 'gira', 'frenada', 'gira a la derecha'],
    ['a la derecha', 'frenada', 'gira', 'gira a la izquierda'],
    ['adelante (los dos)', 'frenada', 'frenada', 'FRENA'],
  ];
  const y0 = 952, rh = 26;
  cols.forEach(c => { f.rect(c[0], y0, c[1], rh, { fill: '#dfe6f3', w: 1.2, stroke: '#888' }); f.text(c[0] + 8, y0 + 18, c[2], { fs: 12, b: 1 }); });
  rows.forEach((r, i) => cols.forEach((c, j) => {
    const stop = r[j] === 'frenada' || r[j] === 'FRENA';
    f.rect(c[0], y0 + rh * (i + 1), c[1], rh, { fill: stop ? '#fde8e8' : '#fff', w: 1.2, stroke: '#888' });
    f.text(c[0] + 8, y0 + rh * (i + 1) + 18, r[j], { fs: 12, b: j === 3 });
  }));
  const yy = y0 + rh * 5 + 20;
  f.text(x0, yy, 'Cada sensor frena la rueda del lado contrario: el carrito gira alejándose del obstáculo.', { fs: 11.5, c: GREY });
  f.text(x0, yy + 17, 'Banderita roja = riel + (6 V) · Símbolo de tierra azul = riel − (GND)' + (B ? ' · Café = +VM (motores)' : ''), { fs: 11.5, c: GREY });
}

// ---------------------------------------------------------------- registro de módulos
const mb = (b, dy = 0) => [W - b[0] - b[2], b[1] + dy, b[2], b[3]];
const SENS_BOX = [30, 72, 410, 360];
const DECT_BOX = [440, 90, 380, 330];
const DECT_INSET = [430, 392, 180, 145];
const DECC_NET = [440, 85, 340, 185];
const DECC_THR = [330, 300, 450, 290];
const LM_BOX = [735, 185, 235, 215];
const MODS = {
  PWR: { boxes: () => [[20, 920, 880, 190]], draw: (c, o) => power(c.P, o.PWR || {}) },
  SENS_L: { boxes: () => [SENS_BOX], draw: c => sensor(c.L, 'I', GRN, 'SENSOR IZQUIERDO') },
  SENS_R: { boxes: () => [mb(SENS_BOX, 45)], draw: c => sensor(c.R, 'D', BLUE, 'SENSOR DERECHO') },
  DECT_L: { boxes: () => [DECT_BOX, DECT_INSET], draw: c => decT(c.L, 'I', GRN, true, 7) },
  DECT_R: { boxes: () => [mb(DECT_BOX, 45)], draw: c => decT(c.R, 'D', BLUE, false, 15) },
  DECC_L: { boxes: () => [DECC_NET, DECC_THR], draw: (c, o) => decC(c.L, 'I', GRN, { out: 1, minus: 2, plus: 3 }, !o.final) },
  DECC_R: { boxes: () => [mb(DECC_NET, 45), mb(DECC_THR, 45)], draw: (c, o) => decC(c.R, 'D', BLUE, { out: 7, minus: 6, plus: 5 }, !o.final) },
  LM358: { boxes: () => [LM_BOX], draw: (c, o) => lm358(c.A, o.LM358) },
  L293: { boxes: () => [[705, 440, 300, 420]], draw: (c, o) => { l293Box(c.A, o.L293); l293Left(c.A, o.L293); l293Right(c.RM, o.L293); } },
  IN_L: { boxes: () => [[585, 735, 160, 80]], draw: (c, o) => inLeft(c.A, (o.IN_L || {}).mode || 'tag', GRN) },
  IN_R: { boxes: () => [[955, 500, 200, 90]], draw: (c, o) => inRight(c.A, (o.IN_R || {}).mode || 'tag', (o.IN_R || {}).col || BLUE, (o.IN_R || {}).label || ['cable de la SALIDA', 'del sensor derecho']) },
  MOT1: { boxes: () => [[440, 560, 320, 190]], draw: c => motor(c.L, 'M1', 'DERECHA', '(la frena el sensor izq.)', false) },
  MOT2: { boxes: () => [mb([440, 560, 320, 190])], draw: c => motor(c.RM, 'M2', 'IZQUIERDA', '(la frena el sensor der.)', true) },
  CAP_M: { boxes: () => [], draw: c => { motorCap(c.L, 'C4'); motorCap(c.RM, 'C5'); } },
  BEHAV: { boxes: () => [], draw: (c, o) => behavior(c.A, o.B) },
};
// IN_R con espejo: usa c.A (absoluto) porque la etiqueta del chip está en el lado derecho
// (se dibuja con coordenadas espejadas más abajo)

function render(cfg) {
  const out = [];
  const A = ctx(false, out), L = ctx(false, out), R = ctx(true, out, 45), RM = ctx(true, out, 0), P = ctx(false, out, 0, 60);
  const c = { A, L, R, RM, P };
  const view = cfg.view || [0, 0, W, H];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view.join(' ')}" font-family="Arial, Helvetica, sans-serif">`);
  out.push(`<defs>
  <marker id="ao" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${ORG}"/></marker>
  <marker id="ak" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker>
</defs>`);
  out.push(`<rect x="${view[0]}" y="${view[1]}" width="${view[2]}" height="${view[3]}" fill="#ffffff"/>`);
  if (cfg.title) A.text(W / 2, 34, cfg.title, { fs: 22, b: 1, a: 'middle' });
  if (cfg.subtitle) A.text(W / 2, 58, cfg.subtitle, { fs: 14, c: GREY, a: 'middle' });
  const opts = cfg.opts || {};
  // fondo amarillo de lo nuevo
  Object.entries(cfg.mods).forEach(([name, st]) => {
    if (st === 'new') MODS[name].boxes().forEach(b => out.push(`<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" rx="12" fill="${YEL}"/>`));
  });
  Object.keys(cfg.mods).forEach(name => {
    if (name === 'IN_R') { drawInR(out, opts.IN_R || {}); return; }
    if (name === 'MOT2' || name === 'DECT_R' || name === 'DECC_R' || name === 'SENS_R') { MODS[name].draw(c, opts); return; }
    MODS[name].draw(c, opts);
  });
  if (cfg.extra) cfg.extra(c, out);
  out.push('</svg>');
  return out.join('\n');
}
// IN_R: pata 15 a la derecha del chip, dibujada con espejo para que quede en el lado derecho
function drawInR(out, o) {
  const f = ctx(true, out, 0);
  const y = R293[1];
  const mode = o.mode || 'tag';
  if (mode === 'gnd') { f.line(760, y, 740, y); gnd(f, 740, y); f.text(728, y + 4, 'provisional: a GND', { fs: 10.5, c: GREY, a: 'end' }); }
  else {
    f.line(760, y, 722, y);
    const col = o.col || BLUE;
    tag(f, 666, y - 12, 56, 24, col, col === GRN ? 'IZQ' : 'DER');
    const lab = o.label || ['cable de la SALIDA', 'del sensor derecho'];
    f.text(658, y - 2, lab[0], { fs: 11, c: GREY, a: 'end' });
    f.text(658, y + 12, lab[1], { fs: 11, c: GREY, a: 'end' });
  }
}

module.exports = { outNet, render, W, H, STEPS, IMG, fs, path, MODS, ctx, flag, gnd, ledDown, photod, tag, capCer, capEle, npn, R293, INK, RED, BLUE, GRN, ORG, GREY, BRN, YEL };

// ---------------------------------------------------------------- pasos de la guía (recortes)
if (require.main === module) {
  const save = (dir, name, cfg) => fs.writeFileSync(path.join(dir, name), render(cfg), 'utf8');

  const all = { SENS_L: 'old', SENS_R: 'old' };
  // Paso 1: alimentación
  save(STEPS, 'paso-01-alimentacion.svg', { view: [20, 915, 850, 200], mods: { PWR: 'new' }, opts: { PWR: { meter: true, railEnd: 620 } } });
  // Paso 2: sensor izquierdo con transistores
  save(STEPS, 'paso-02-sensor-transistores.svg', { view: [20, 62, 830, 490], mods: { SENS_L: 'new', DECT_L: 'new' } });
  // Paso 3: L293D alimentado
  save(STEPS, 'paso-03-l293d.svg', { view: [560, 440, 560, 420], mods: { L293: 'new', IN_L: 'new', IN_R: 'new' }, opts: { IN_L: { mode: 'gnd' }, IN_R: { mode: 'gnd' } } });
  // Paso 4: motor 1 y señal del sensor izquierdo
  save(STEPS, 'paso-04-motor1.svg', { view: [430, 440, 640, 420], mods: { L293: 'old', MOT1: 'new', IN_L: 'new', IN_R: 'old' }, opts: { IN_L: { mode: 'tag' }, IN_R: { mode: 'gnd' } } });
  // Paso 5: motor 2 con la misma señal
  save(STEPS, 'paso-05-motor2.svg', { view: [440, 440, 830, 420], mods: { L293: 'old', MOT1: 'old', MOT2: 'new', IN_L: 'old', IN_R: 'new' }, opts: { IN_L: { mode: 'tag' }, IN_R: { mode: 'tag', col: GRN, label: ['mismo cable del sensor', 'IZQUIERDO (provisional)'] } } });
  // Paso 6: sensor derecho y cruce
  save(STEPS, 'paso-06a-sensor-derecho.svg', { view: [850, 70, 830, 505], mods: { SENS_R: 'new', DECT_R: 'new' } });
  save(STEPS, 'paso-06b-cruce.svg', { view: [440, 440, 830, 420], mods: { L293: 'old', MOT1: 'old', MOT2: 'old', IN_L: 'old', IN_R: 'new' }, opts: { IN_L: { mode: 'tag' }, IN_R: { mode: 'tag', col: BLUE } } });
  // Paso 7: LM358 con el sensor izquierdo
  save(STEPS, 'paso-07-lm358-izq.svg', { view: [285, 70, 705, 545], mods: { SENS_L: 'old', LM358: 'new', DECC_L: 'new' }, opts: { LM358: { partial: true } } });
  // Paso 8: LM358 con el sensor derecho
  save(STEPS, 'paso-08-lm358-der.svg', { view: [710, 115, 705, 545], mods: { SENS_R: 'old', LM358: 'old', DECC_L: 'old', DECC_R: 'new' } });

  // Esquemas finales
  ['A', 'B'].forEach(v => {
    const mods = { SENS_L: 'old', SENS_R: 'old', DECC_L: 'old', DECC_R: 'old', LM358: 'old', L293: 'old', IN_L: 'old', IN_R: 'old', MOT1: 'old', MOT2: 'old', CAP_M: 'old', PWR: 'old', BEHAV: 'old' };
    const title = v === 'A'
      ? 'Carrito que esquiva obstáculos: esquema completo, versión A (todo con un solo pack de 6 V)'
      : 'Carrito que esquiva obstáculos: esquema completo, versión B (motores con su propio pack)';
    const svg = render({
      title, subtitle: 'Sensor IR → LM358 (decide) → L293D (mueve) → motores. Resistencias de 1/4 W. Todo calculado para 6 V: no pasarse de ahí.',
      mods, opts: { final: true, PWR: { variant: v, caps: true }, L293: { vm: v === 'B' }, B: v === 'B', IN_R: { mode: 'tag', col: BLUE } },
    });
    fs.writeFileSync(path.join(IMG, v === 'A' ? 'esquema-carrito-final-a-6v.svg' : 'esquema-carrito-final-b-motores-aparte.svg'), svg, 'utf8');
  });
  console.log('ok');
}
