// Genera las páginas de la protoboard: un mini paso por página + la placa completa + el índice.
// Uso: node docs/gen-protoboard-paginas.js
const G = require('./gen-protoboard.js');
const { ONE, CBE, build, svgWrap, pageHtml, f1, W_SVG, H_SVG, TITLES, HINTS, APOYO, PASOS, ROOT, fs, path } = G;

const FULL = `0 0 ${f1(W_SVG)} ${f1(H_SVG)}`;
const inset = `<div class="tr"><svg viewBox="0 0 240 130" width="260" height="140" aria-label="Transistor visto de frente">
<path d="M70,72 L70,38 Q70,10 100,10 Q130,10 130,38 L130,72 Z" fill="#2f2f2f" stroke="#111" stroke-width="2"/>
<text x="100" y="46" font-size="12" font-weight="bold" fill="#ffd400" text-anchor="middle">cara plana</text>
<line x1="72" y1="72" x2="128" y2="72" stroke="#ffd400" stroke-width="4"/>
<g stroke="#888" stroke-width="3"><line x1="80" y1="72" x2="80" y2="104"/><line x1="100" y1="72" x2="100" y2="104"/><line x1="120" y1="72" x2="120" y2="104"/></g>
<g font-size="17" font-weight="bold" text-anchor="middle" fill="#111"><text x="80" y="124">E</text><text x="100" y="124">B</text><text x="120" y="124">C</text></g>
</svg><div class="trcap"><b>Así se ve de frente</b> tu 2N2222A: cara plana hacia ti, patas hacia abajo. De izquierda a derecha: <b>E · B · C</b>. En la protoboard del dibujo, la cara plana es la franja amarilla y mira <b>hacia abajo</b>: gira tu protoboard para que quede como en el dibujo.</div></div>`;
const test = t => `<div class="test"><b>Prueba:</b> ${t}</div>`;

const SUB = [
  { file: '02a', label: '2a', sub: 2.1, title: 'Paso 2a de 5: el emisor infrarrojo',
    hint: 'Riel <b>+</b> → R1 (220 Ω) → pata <b>larga (+)</b> del LED infrarrojo (el transparente). Pata <b>corta (−)</b> al riel <b>−</b>.' + test('mide con el multímetro entre las dos patas del LED infrarrojo: debe marcar unos <b>1,2 V</b>. Con la cámara del celular lo ves como una luz morada. Si marca 0 V o el voltaje del riel, la pata larga y la corta están al revés.') },
  { file: '02b', label: '2b', sub: 2.2, title: 'Paso 2b de 5: el receptor y R3',
    hint: 'Receptor (el oscuro): pata <b>corta</b> al riel <b>+</b>. Pata <b>larga</b> a una columna libre (la llamamos <b>N</b>). De la columna N, R3 (1 kΩ) al riel <b>−</b>. Entre el emisor y el receptor, la barrera negra.' + test('sin nada enfrente, mide entre la columna N y el riel −: debe dar <b>menos de 1 V</b>. Si da más, tapa el receptor con cinta negra y mide otra vez.') },
  { file: '02c', label: '2c', sub: 2.3, title: 'Paso 2c de 5: el LED rojo (sin transistores)',
    hint: 'R2 (1 kΩ) del riel <b>+</b> a la pata <b>larga (+)</b> del LED rojo. La pata <b>corta (−)</b> del LED va a una columna libre: la <b>columna S</b> (salida). R4 (10 kΩ) del riel <b>+</b> a la columna S. <b>Nada más</b> en la columna S.' + test('<b>A)</b> el LED debe estar <b>apagado</b>, y la columna S debe medir casi el voltaje del riel (5,5 o 6 V). <b>B)</b> toca con un cable la columna S y el riel −: el LED debe <b>prender</b>. Quita el cable y se apaga. Si el LED prende solo, la columna S está tocando negativo: cámbiale la columna.') },
  { file: '02d', label: '2d', sub: 2.4, title: 'Paso 2d de 5: el transistor Q2 (el de la salida)',
    hint: 'Pon el transistor <b>con la cara plana hacia abajo</b> (franja amarilla). <b>E</b> (izquierda) al riel <b>−</b>. <b>C</b> (derecha) por el cable verde largo a la <b>columna S</b>. <b>B</b> (centro) queda <b>sin conectar</b> por ahora.' + inset + test('el LED sigue <b>apagado</b>. Luego toca la pata B con la punta de una resistencia de 1 kΩ cuyo otro extremo va al riel +: el LED debe <b>prender fuerte</b>. Si no prende, revisa que E esté en − y C en la columna S.') },
  { file: '02e', label: '2e', sub: 2.5, title: ONE ? 'Paso 2e de 5: el receptor a la base de Q2 (sensor completo)' : 'Paso 2e de 5: el transistor Q1 y el sensor completo',
    hint: 'Pon Q1 también con la <b>cara plana hacia abajo</b>. <b>B</b> de Q1 a la columna <b>N</b> (cable naranja). <b>E</b> de Q1 a la <b>B</b> de Q2 (cable rosa). <b>C</b> de Q1 a la <b>C</b> de Q2 (cable verde corto).' + inset + test('con nada enfrente, el LED rojo está <b>apagado</b>. Con un cartón blanco a 2 o 3 cm frente al emisor y el receptor, el LED <b>prende</b>. Si prende siempre: tapa el receptor con cinta negra; si se apaga, sobra luz (barrera, sol, lámpara) y puedes bajar R3 a 470 Ω. Si no prende nunca: cambia R3 por una de 4,7 kΩ.') },
];
const SUB6 = [
  { file: '06a', label: '6a', sub: 6.1, title: 'Paso 6a de 5: el emisor infrarrojo derecho' },
  { file: '06b', label: '6b', sub: 6.2, title: 'Paso 6b de 5: el receptor derecho y R3' },
  { file: '06c', label: '6c', sub: 6.3, title: 'Paso 6c de 5: el LED rojo derecho (sin transistores)' },
  { file: '06d', label: '6d', sub: 6.4, title: 'Paso 6d de 5: el transistor Q2 derecho' },
  { file: '06e', label: '6e', sub: 6.5, title: ONE ? 'Paso 6e de 5: el receptor a la base de Q2 y la pata 15' : 'Paso 6e de 5: el transistor Q1 derecho y la pata 15' },
];
const REST = [3, 4, 5, 7, 8, 9, 10];
const LEG_NEW = '';
const LEG_DEL = '';

const rest = n => ({ file: String(n).padStart(2, '0'), label: String(n), step: n, title: `Paso ${n} de 11: ${TITLES[n - 1]}`,
    hint: HINTS[n - 1], legend: [4, 5, 7, 8, 10].includes(n) ? LEG_NEW + LEG_DEL : LEG_NEW });
const PAGES = [
  { file: '01', label: '1', step: 1, title: `Paso 1 de 11: ${TITLES[0]}`, hint: HINTS[0], legend: LEG_NEW },
  ...SUB.map(p => ({ file: p.file, label: p.label, step: p.sub, title: p.title, hint: p.hint, legend: LEG_NEW })),
  ...REST.filter(n => n < 6).map(rest),
  ...SUB6.map(q => ({ file: q.file, label: q.label, step: q.sub, title: q.title, hint: '', legend: LEG_NEW + LEG_DEL })),
  ...REST.filter(n => n > 6).map(rest),
  ...[].map(n => ({ file: String(n).padStart(2, '0'), label: String(n), step: n, title: `Paso ${n} de 11: ${TITLES[n - 1]}`,
    hint: HINTS[n - 1] + (n === 6 ? inset : ''), legend: [4, 5, 6, 7, 8, 10].includes(n) ? LEG_NEW + LEG_DEL : LEG_NEW })),
  { file: '11', label: '11', step: 9, plain: true, title: `Paso 11 de 11: ${TITLES[10]}`, hint: HINTS[10], legend: '' },
];

const nav = idx => {
  const links = PAGES.map((p, i) => (i === idx ? `<b class="cur">${p.label}</b>` : `<a href="paso-${p.file}.html" title="${p.title}">${p.label}</a>`));
  const prev = idx > 0 ? `<a class="pn" href="paso-${PAGES[idx - 1].file}.html">← Paso ${PAGES[idx - 1].label}</a>` : '<span class="pn off">←</span>';
  const next = idx < PAGES.length - 1 ? `<a class="pn" href="paso-${PAGES[idx + 1].file}.html">Paso ${PAGES[idx + 1].label} →</a>` : '<span class="pn off">→</span>';
  return `${prev}<span class="steps">${links.join('')}</span>${next}<a class="all" href="index.html">Índice</a>`;
};

const log = [];
PAGES.forEach((p, i) => {
  const b = build(p.step, { plain: !!p.plain });
  const hasTr = b.M.parts.concat(b.M.ghostParts).some(e => e.kind === 'tr');
    const dE = '../protoboard-ebc/', dC = '../protoboard-cbe/';
  const pin = hasTr ? `<span class="pin">Transistor:<a class="${CBE ? '' : 'on'}" href="${CBE ? dE : ''}paso-${p.file}.html" title="Mirando la cara plana, de izquierda a derecha: emisor, base, colector">E-B-C</a><a class="${CBE ? 'on' : ''}" href="${CBE ? '' : dC}paso-${p.file}.html" title="Mirando la cara plana, de izquierda a derecha: colector, base, emisor">C-B-E</a></span>` : '';
  fs.writeFileSync(path.join(PASOS, `paso-${p.file}.html`), pageHtml({ pin,
    names: b.names, svg: svgWrap(b.svg), title: p.title, short: 'Paso ' + p.label, hint: '', nav: nav(i), focus: p.plain ? FULL : b.vb, legend: p.legend,
  }), 'utf8');
  log.push(`paso ${p.label}: ${b.nets} redes, ${b.wires} cables, ${b.pins} patas`);
});
// el paso 2 completo redirige a su primer mini paso
fs.writeFileSync(path.join(PASOS, 'paso-06.html'), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=paso-06a.html"><a href="paso-06a.html">Paso 6a</a>', 'utf8');
fs.writeFileSync(path.join(PASOS, 'paso-02.html'), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=paso-02a.html"><a href="paso-02a.html">Paso 2a</a>', 'utf8');
console.log('Conectividad verificada en cada página:\n  ' + log.join('\n  '));

// índice
const idx = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Protoboard paso a paso</title>
<style>body{font-family:"Segoe UI",system-ui,Arial,sans-serif;background:#f6f4ee;color:#1b232c;margin:0;padding:28px 20px}main{max-width:760px;margin:0 auto}h1{font-size:22px;margin:0 0 4px}p{color:#5b6672;margin:0 0 18px}ol{padding:0;list-style:none;display:grid;gap:10px}li a{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid #d8d3c3;border-radius:10px;padding:12px 16px;text-decoration:none;color:inherit}li a:hover{background:#efece1}.n{font-weight:700;font-size:18px;min-width:38px;height:38px;border-radius:19px;background:#b8672f;color:#fff;display:grid;place-items:center;flex:none;padding:0 6px}.t b{display:block}.t span{color:#5b6672;font-size:14px}</style></head><body><main>
<h1>Carrito que esquiva obstáculos: la protoboard paso a paso</h1><p>Cada página muestra la protoboard tal como queda al terminar ese paso. El paso 2 está dividido en 5 mini pasos, cada uno con su prueba.</p>
<ol>${PAGES.filter(p => !p.plain).map(p => `<li><a href="paso-${p.file}.html"><span class="n">${p.label}</span><span class="t"><b>${p.title.replace(/^Paso [^:]*: /, '')}</b></span></a></li>`).join('')}<li><a href="paso-11.html"><span class="n">11</span><span class="t"><b>${TITLES[10]}</b></span></a></li></ol>
</main></body></html>`;
fs.writeFileSync(path.join(PASOS, 'index.html'), idx, 'utf8');
console.log('listo.');
