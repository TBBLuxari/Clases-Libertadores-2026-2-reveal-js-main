// Dibujos hechos a mano para la guía del carrito: paso 9 (condensadores), paso 10 (pack de motores)
// y la hoja "cómo identificar las patas". Uso: node docs/gen-esquemas-carrito-extra.js
const G = require('./gen-esquemas-carrito.js');
const { ctx, gnd, capCer, capEle, fs, path, STEPS, INK, RED, BLUE, ORG, GREY, BRN } = G;

const wrap = (w, h, body) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" font-family="Arial, Helvetica, sans-serif">\n<rect width="' + w + '" height="' + h + '" fill="#ffffff"/>\n' + body.join('\n') + '\n</svg>';

// ---------------------------------------------------------------- Paso 9: condensadores
(function () {
  const out = [], f = ctx(false, out);
  const panel = (x0, title) => {
    f.text(x0 + 130, 30, title, { fs: 14, b: 1, a: 'middle' });
    f.line(x0, 60, x0 + 260, 60, { c: RED, w: 4 });
    f.line(x0, 250, x0 + 260, 250, { c: BLUE, w: 4 });
    f.text(x0 + 4, 52, '+6V (riel rojo)', { fs: 11, b: 1, c: RED });
    f.text(x0 + 4, 268, 'GND (riel azul)', { fs: 11, b: 1, c: BLUE });
  };
  // C1
  panel(10, 'C1 · 470 µF (electrolítico)');
  f.dot(70, 60, RED); f.line(70, 60, 70, 125); capEle(f, 70, 125); f.line(70, 134, 70, 250); f.dot(70, 250, BLUE);
  f.text(92, 118, '+ pata LARGA', { fs: 12, b: 1, c: RED }); f.text(92, 133, '→ riel ROJO', { fs: 12, b: 1, c: RED });
  f.text(92, 175, '− FRANJA del cuerpo', { fs: 12, b: 1, c: BLUE }); f.text(92, 190, '→ riel AZUL', { fs: 12, b: 1, c: BLUE });
  f.text(92, 222, 'cerca de la batería', { fs: 11, c: GREY });
  // C2
  panel(290, 'C2 · 100 nF (cerámico)');
  f.dot(330, 60, RED); f.line(330, 60, 330, 125); capCer(f, 330, 125); f.line(330, 133, 330, 250); f.dot(330, 250, BLUE);
  f.rect(400, 110, 110, 80, { fill: '#eef3fb', rx: 6 });
  f.text(455, 156, 'LM358', { fs: 16, b: 1, a: 'middle' });
  f.text(346, 222, 'sin polaridad: da igual el lado', { fs: 11, c: GREY });
  f.text(455, 100, 'pegado a este chip', { fs: 11, b: 1, a: 'middle' });
  // C3
  panel(580, 'C3 · 100 nF (cerámico)');
  f.dot(620, 60, RED); f.line(620, 60, 620, 125); capCer(f, 620, 125); f.line(620, 133, 620, 250); f.dot(620, 250, BLUE);
  f.rect(690, 110, 110, 80, { fill: '#eef3fb', rx: 6 });
  f.text(745, 156, 'L293D', { fs: 16, b: 1, a: 'middle' });
  f.text(636, 222, 'sin polaridad: da igual el lado', { fs: 11, c: GREY });
  f.text(745, 100, 'pegado a este chip', { fs: 11, b: 1, a: 'middle' });
  // C4 y C5 en los motores
  f.text(430, 305, 'C4 y C5 · 100 nF (cerámicos): uno en cada motor', { fs: 14, b: 1, a: 'middle' });
  const mot = (cx, name, pa, pb) => {
    f.line(cx - 130, 360, cx, 360);
    f.line(cx - 130, 460, cx, 460);
    f.line(cx, 360, cx, 372); f.line(cx, 448, cx, 460);
    f.circle(cx, 410, 38);
    f.text(cx, 418, 'M', { fs: 22, b: 1, a: 'middle' });
    f.dot(cx - 70, 360); f.dot(cx - 70, 460);
    f.line(cx - 70, 360, cx - 70, 405); capCer(f, cx - 70, 405); f.line(cx - 70, 413, cx - 70, 460);
    f.text(cx - 136, 364, pa, { fs: 11, c: GREY, a: 'end' });
    f.text(cx - 136, 464, pb, { fs: 11, c: GREY, a: 'end' });
    f.text(cx - 70, 340, name + ' · 100 nF', { fs: 12, b: 1, a: 'middle' });
  };
  mot(300, 'C4', 'a la pata 3', 'a la pata 6');
  mot(740, 'C5', 'a la pata 14', 'a la pata 11');
  f.text(430, 500, 'Directo entre los dos cables de cada motor, lo más cerca del motor. Sin polaridad.', { fs: 12, c: GREY, a: 'middle' });
  fs.writeFileSync(path.join(STEPS, 'paso-09-condensadores.svg'), wrap(860, 515, out), 'utf8');
})();

// ---------------------------------------------------------------- Paso 10: motores con su propio pack
(function () {
  const out = [], g = ctx(false, out);
  const GY = 450;
  // L293D (solo patas 8 y 16, con las demás indicadas)
  g.rect(430, 60, 200, 330, { fill: '#eef3fb', rx: 6 });
  g.text(530, 215, 'U1', { fs: 14, c: GREY, a: 'middle' });
  g.text(530, 240, 'L293D', { fs: 20, b: 1, a: 'middle' });
  g.text(442, 384, '8 · VCC2', { fs: 13, b: 1, c: BRN });
  g.text(618, 84, '16 · VCC1', { fs: 13, b: 1, c: RED, a: 'end' });
  g.text(530, 130, '(las demás patas', { fs: 11, c: GREY, a: 'middle' });
  g.text(530, 145, 'quedan igual)', { fs: 11, c: GREY, a: 'middle' });
  // rail +6V lógica
  g.line(110, 40, 700, 40, { c: RED, w: 4 });
  g.text(700, 28, '+6V de la lógica (riel ROJO)', { fs: 12, b: 1, c: RED, a: 'end' });
  g.line(630, 80, 660, 80); g.line(660, 80, 660, 40, { c: RED });
  g.dot(660, 40, RED);
  g.text(668, 74, 'pata 16 → +6V', { fs: 11, b: 1, c: RED });
  // BT1
  g.line(70, 40, 110, 40, { c: RED, w: 3 }); g.line(70, 40, 70, 90, { c: RED, w: 3 });
  g.line(54, 90, 86, 90, { w: 3 }); g.line(61, 100, 79, 100, { w: 5 }); g.line(70, 100, 70, GY, { w: 3 });
  g.text(94, 88, '+', { fs: 15, b: 1, c: RED });
  g.text(98, 124, 'BT1', { b: 1 }); g.text(98, 140, '4×AA ≈ 6 V', { fs: 12 }); g.text(98, 155, '(lógica)', { fs: 12 });
  // GND común
  g.line(70, GY, 700, GY, { c: BLUE, w: 4 });
  g.text(700, GY + 20, 'GND COMÚN: une el − de los dos packs', { fs: 12, b: 1, c: RED, a: 'end' });
  // BT2 al pin 8
  g.line(250, 345, 250, 358, { c: BRN, w: 3 });
  g.poly([[250, 345], [330, 345], [330, 380], [430, 380]], { c: BRN, w: 3 });
  g.line(234, 358, 266, 358, { w: 3 }); g.line(241, 368, 259, 368, { w: 5 }); g.line(250, 368, 250, GY, { w: 3 });
  g.text(274, 356, '+', { fs: 15, b: 1, c: BRN });
  g.text(230, 358, 'BT2', { b: 1, a: 'end' }); g.text(230, 374, 'pack de', { fs: 12, a: 'end' }); g.text(230, 388, 'motores', { fs: 12, a: 'end' });
  g.text(340, 338, '+ del pack de motores', { fs: 12, b: 1, c: BRN }); g.text(340, 353, '→ pata 8', { fs: 12, b: 1, c: BRN });
  g.text(436, 420, 'La pata 8 ya NO va al riel de +6V.', { fs: 12, b: 1, c: RED });
  fs.writeFileSync(path.join(STEPS, 'paso-10-pack-motores.svg'), wrap(860, 490, out), 'utf8');
})();

// ---------------------------------------------------------------- Hoja: cómo identificar las patas
(function () {
  const out = [], f = ctx(false, out);
  const box = (x, y, t) => { f.rect(x, y, 320, 232, { fill: '#fafafa', rx: 10, w: 1.5, stroke: '#bbb' }); f.text(x + 160, y + 24, t, { fs: 15, b: 1, a: 'middle' }); };
  const X1 = 10, X2 = 350, Y = [10, 252, 494, 736];
  // 1 LED
  box(X1, Y[0], 'LED (rojo o infrarrojo transparente)');
  f.path('M120,120 L120,100 A28,28 0 0 1 176,100 L176,120 Z', { fill: '#ffd7d7' });
  f.line(110, 120, 186, 120, { w: 3 });
  f.line(130, 120, 130, 190, { w: 3 }); f.line(166, 120, 166, 220, { w: 3 });
  f.text(122, 208, '− corta', { fs: 12, b: 1, c: BLUE, a: 'end' }); f.text(176, 232, '+ larga', { fs: 12, b: 1, c: RED });
  f.text(26, 150, 'lado PLANO', { fs: 11, c: GREY }); f.text(26, 163, 'del borde = −', { fs: 11, c: GREY });
  f.text(196, 100, '+ pata larga → hacia +6V', { fs: 11, b: 1, c: RED }); f.text(196, 114, '(con su resistencia)', { fs: 11, c: GREY });
  f.text(196, 150, '− pata corta → hacia GND', { fs: 11, b: 1, c: BLUE });
  // 2 receptor
  box(X2, Y[0], 'Receptor IR (el oscuro)');
  f.path('M564,120 L564,100 A28,28 0 0 1 620,100 L620,120 Z', { fill: '#444' });
  f.line(554, 120, 630, 120, { w: 3 });
  f.line(574, 120, 574, 190, { w: 3 }); f.line(610, 120, 610, 220, { w: 3 });
  f.text(566, 208, 'corta', { fs: 12, b: 1, c: RED, a: 'end' }); f.text(620, 232, 'larga', { fs: 12, b: 1, c: BLUE });
  f.text(366, 60, '¡VA AL REVÉS que un LED!', { fs: 12, b: 1, c: RED });
  f.text(366, 80, 'pata CORTA → +6V', { fs: 11, b: 1, c: RED });
  f.text(366, 95, 'pata LARGA → R3 y N', { fs: 11, b: 1, c: BLUE });
  // 3 transistor
  box(X1, Y[1], 'Transistor 2N2222A');
  f.text(170, 296, '(de izquierda a derecha)', { fs: 11, c: GREY, a: 'middle' });
  f.path('M126,350 L126,328 A34,34 0 0 1 194,328 L194,350 Z', { fill: '#f2f2f2' });
  [138, 160, 182].forEach((x, i) => { f.line(x, 350, x, 392, { w: 3 }); f.text(x, 414, 'EBC'[i], { fs: 16, b: 1, a: 'middle' }); });
  f.text(170, 436, 'cara PLANA hacia ti, patas abajo', { fs: 11, c: GREY, a: 'middle' });
  f.text(170, 451, 'E = emisor · B = base · C = colector', { fs: 11, b: 1, a: 'middle' });
  // 4 trimmer / pot
  box(X2, Y[1], 'Trimmer o potenciómetro (10 kΩ)');
  f.rect(430, 306, 80, 64, { fill: '#cfe3ff', rx: 6 });
  f.circle(470, 338, 20, { fill: '#e8eef8' }); f.line(458, 338, 482, 338, { w: 3 });
  [440, 470, 500].forEach(x => f.line(x, 370, x, 402, { w: 3 }));
  f.text(440, 424, 'extremo', { fs: 12, a: 'middle' }); f.text(470, 442, 'CURSOR', { fs: 12, b: 1, c: ORG, a: 'middle' }); f.text(500, 424, 'extremo', { fs: 12, a: 'middle' });
  f.text(366, 290, 'La pata del CENTRO es el cursor', { fs: 11, c: GREY });
  f.text(366, 466, 'extremos: uno a R5 y el otro a GND', { fs: 11, c: GREY });
  // 5 electrolítico
  box(X1, Y[2], 'Condensador electrolítico');
  f.rect(122, 548, 70, 100, { fill: '#2d4a7a', rx: 8 });
  f.rect(122, 548, 18, 100, { fill: '#cfd8e8', rx: 4, stroke: 'none' });
  f.text(131, 604, '−', { fs: 20, b: 1, a: 'middle' });
  f.line(137, 648, 137, 684, { w: 3 }); f.line(177, 648, 177, 704, { w: 3 });
  f.text(125, 676, '− corta', { fs: 12, b: 1, c: BLUE, a: 'end' }); f.text(187, 700, '+ larga', { fs: 12, b: 1, c: RED });
  f.text(205, 585, 'FRANJA = pata −', { fs: 12, b: 1, c: BLUE }); f.text(205, 600, '→ riel AZUL', { fs: 11, c: BLUE });
  f.text(205, 625, 'pata larga = +', { fs: 12, b: 1, c: RED }); f.text(205, 640, '→ riel ROJO', { fs: 11, c: RED });
  f.text(26, 535, '¡Al revés se calienta!', { fs: 11, b: 1, c: RED });
  // 6 cerámico / resistencia
  box(X2, Y[2], 'Sin polaridad: cerámico y resistencia');
  f.circle(430, 590, 24, { fill: '#e8b25a' }); f.text(430, 596, '104', { fs: 14, b: 1, a: 'middle' });
  f.line(420, 612, 420, 650, { w: 3 }); f.line(440, 612, 440, 650, { w: 3 });
  f.text(470, 584, 'cerámico 100 nF', { fs: 12, b: 1 }); f.text(470, 600, '"104" = 100 nF', { fs: 11, c: GREY });
  f.rect(400, 678, 80, 26, { fill: '#e7d3a8', rx: 10 });
  f.line(370, 691, 400, 691, { w: 3 }); f.line(480, 691, 510, 691, { w: 3 });
  f.text(500, 668, 'resistencia', { fs: 12, b: 1 });
  f.text(366, 716, 'Las dos patas valen igual: no hay + ni −.', { fs: 11, c: GREY });
  // 7 portapilas
  box(X1, Y[3], 'Portapilas 4×AA (≈ 6 V)');
  f.rect(36, 790, 140, 60, { fill: '#555', rx: 8 });
  f.text(106, 826, '4 × AA', { fs: 16, b: 1, a: 'middle', c: '#fff' });
  f.poly([[56, 850], [56, 890], [36, 920]], { c: RED, w: 4 });
  f.poly([[146, 850], [146, 890], [166, 920]], { c: INK, w: 4 });
  f.text(24, 940, 'cable ROJO = +', { fs: 12, b: 1, c: RED }); f.text(150, 940, 'cable NEGRO = −', { fs: 12, b: 1 });
  f.text(192, 806, 'rojo → riel ROJO', { fs: 11, b: 1, c: RED }); f.text(192, 822, 'negro → riel AZUL', { fs: 11, b: 1, c: BLUE });
  f.text(192, 846, 'El interruptor va en', { fs: 11, c: GREY }); f.text(192, 860, 'el cable rojo.', { fs: 11, c: GREY });
  // 8 chip
  box(X2, Y[3], 'Chips (L293D y LM358)');
  f.rect(430, 800, 80, 100, { fill: '#2a2a2a', rx: 4 });
  f.path('M455,800 A15,15 0 0 0 485,800', { fill: '#fafafa' });
  f.text(470, 855, 'LM358', { fs: 12, b: 1, c: '#fff', a: 'middle' });
  [0, 1, 2, 3].forEach(i => {
    f.line(420, 815 + i * 25, 430, 815 + i * 25, { w: 3 }); f.line(510, 815 + i * 25, 520, 815 + i * 25, { w: 3 });
    f.text(414, 819 + i * 25, String(i + 1), { fs: 11, b: 1, a: 'end' }); f.text(526, 819 + i * 25, String(8 - i), { fs: 11, b: 1 });
  });
  f.text(470, 790, 'MUESCA ↑ arriba', { fs: 11, b: 1, c: ORG, a: 'middle' });
  f.text(366, 920, 'Se cuenta desde la muesca: la pata 1 está arriba', { fs: 11, c: GREY });
  f.text(366, 934, 'a la izquierda; se baja y luego se sube por el otro', { fs: 11, c: GREY });
  f.text(366, 948, 'lado. El chip va a caballo del canal central.', { fs: 11, c: GREY });
  fs.writeFileSync(path.join(STEPS, 'hoja-identificar-patas.svg'), wrap(680, 985, out), 'utf8');
})();


// ---------------------------------------------------------------- Leyenda de símbolos
(function () {
  const out = [], f = ctx(false, out);
  const { flag, gnd, tag, ledDown, photod } = G;
  f.rect(5, 5, 670, 232, { fill: '#fafafa', rx: 10, w: 1.5, stroke: '#bbb' });
  f.text(340, 30, 'Cómo leer los dibujos', { fs: 15, b: 1, a: 'middle' });
  flag(f, 40, 80, '', RED);
  f.text(80, 70, 'Banderita ROJA = va al riel ROJO', { fs: 13, b: 1, c: RED }); f.text(80, 86, 'de la protoboard (+6 V)', { fs: 12, c: GREY });
  gnd(f, 360, 62);
  f.text(386, 70, 'Tierra AZUL = va al riel AZUL', { fs: 13, b: 1, c: BLUE }); f.text(386, 86, 'de la protoboard (−, GND)', { fs: 12, c: GREY });
  tag(f, 22, 112, 56, 24, '#0f9d58', 'IZQ');
  f.text(92, 122, 'Etiqueta de color = UN MISMO cable', { fs: 13, b: 1 }); f.text(92, 138, 'que une dos lugares del dibujo', { fs: 12, c: GREY });
  f.rect(346, 108, 40, 30, { fill: '#fff4c2', rx: 6, w: 1, stroke: '#ddd' });
  f.text(396, 122, 'Zona amarilla = lo que conectas', { fs: 13, b: 1 }); f.text(396, 138, 'en este paso', { fs: 12, c: GREY });
  f.rect(26, 168, 24, 40, {});
  f.text(62, 186, 'Resistencia: sin polaridad', { fs: 12 }); f.text(62, 201, '(el valor va escrito al lado)', { fs: 11, c: GREY });
  ledDown(f, 270, 168, false);
  f.text(292, 180, 'LED: el triángulo apunta al −', { fs: 12 }); f.text(292, 195, '+ = pata larga, − = pata corta', { fs: 11, c: GREY });
  f.text(500, 186, 'Las letras pequeñas junto a', { fs: 12 }); f.text(500, 201, 'cada pata dicen a dónde va.', { fs: 12 });
  fs.writeFileSync(path.join(STEPS, 'leyenda-simbolos.svg'), wrap(680, 242, out), 'utf8');
})();

console.log('extra ok');
