// Genera las páginas de la protoboard: UNA página por paso de la guía (1 a 23), la placa completa y el índice.
// Los números de los pasos son los mismos de la guía que se les entregó a los estudiantes (carrito-guia.pdf).
// Uso: node docs/gen-protoboard-paginas.js          (transistores E-B-C, carpeta apoyo/carrito/protoboard-pasos/ebc/)
//      PINOUT=CBE node docs/gen-protoboard-paginas.js   (transistores C-B-E, carpeta apoyo/carrito/protoboard-pasos/cbe/)
const G = require('./gen-protoboard.js');
const { SOLO_LM, BLOQUES, CBE, colX, Y_F, Y_E, P, build, svgWrap, pageHtml, f1, W_SVG, H_SVG, PASOS, fs, path } = G;

const FULL = `0 0 ${f1(W_SVG)} ${f1(H_SVG)}`;

// n = número de paso de la guía; step = paso del modelo (ver el comentario en gen-protoboard.js)
const STEPS = [
  { n: 1, step: 1, title: 'Alimentación de 6 V' },
  { n: 2, step: 2.1, title: 'El emisor infrarrojo' },
  { n: 3, step: 2.2, title: 'El receptor y R3' },
  { n: 4, step: 2.3, title: 'El LED rojo' },
  { n: 5, step: 2.4, title: 'El transistor' },
  { n: 6, step: 2.5, title: 'Unir el receptor con el transistor' },
  { n: 7, step: 3, title: 'El L293D, alimentado' },
  { n: 8, step: 4, title: 'Motor 1 y el sensor izquierdo' },
  { n: 9, step: 5, title: 'Motor 2' },
  { n: 10, step: 6.1, title: 'Sensor derecho: el emisor infrarrojo' },
  { n: 11, step: 6.2, title: 'Sensor derecho: el receptor y R3' },
  { n: 12, step: 6.3, title: 'Sensor derecho: el LED rojo' },
  { n: 13, step: 6.4, title: 'Sensor derecho: el transistor' },
  { n: 14, step: 6.5, title: 'Sensor derecho: unir el receptor con el transistor' },
  { n: 15, step: 6.6, title: 'El cruce: la pata 15 al sensor derecho' },
  { n: 16, step: 7.1, title: 'El LM358, alimentado' },
  { n: 17, step: 7.2, title: 'El umbral: R5 y el potenciómetro' },
  { n: 18, step: 7.3, title: 'Pasar el sensor izquierdo al LM358' },
  { n: 19, step: 8.1, title: 'El umbral del sensor derecho' },
  { n: 20, step: 8.2, title: 'Pasar el sensor derecho al LM358' },
  { n: 21, step: 9.1, title: 'Los condensadores de la alimentación' },
  { n: 22, step: 9.2, title: 'Los condensadores de los motores' },
  { n: 23, step: 10, title: 'Motores con su propio pack de pilas (opcional)' },
];
// guía sin transistores (SOLO_LM=1): el sensor se arma directo con el LM358; cada paso lleva lo que hay que medir
const STEPS_LM = require('./pasos-lm358.js');   // los mismos datos que usa la presentación (qué conectar y qué debe dar)
const STEPS_USAR = SOLO_LM ? STEPS_LM : STEPS;
const TOTAL = STEPS_USAR.length;
const PAGES = [
  ...STEPS_USAR.map(s => ({ ...s, hint: s.medir ? `<div class="test"><b>Medir:</b> ${s.medir}${s.nota ? '<br><b>Si no responde:</b> ' + s.nota : ''}</div>` : '', file: 'paso-' + String(s.n).padStart(2, '0'), label: String(s.n), short: 'Paso ' + s.n, full: `Paso ${s.n} de ${TOTAL}: ${s.title}` })),
  { n: 0, step: 9.2, plain: true, file: 'placa-completa', label: '★', short: 'Placa completa', title: 'Placa completa', full: 'La placa completa (sin resaltar lo nuevo)' },
];

const nav = idx => {
  const links = PAGES.map((p, i) => (i === idx ? `<b class="cur">${p.label}</b>` : `<a href="${p.file}.html" title="${p.full}">${p.label}</a>`));
  const prev = idx > 0 ? `<a class="pn" href="${PAGES[idx - 1].file}.html">← ${PAGES[idx - 1].short}</a>` : '<span class="pn off">←</span>';
  const next = idx < PAGES.length - 1 ? `<a class="pn" href="${PAGES[idx + 1].file}.html">${PAGES[idx + 1].short} →</a>` : '<span class="pn off">→</span>';
  return `${prev}<span class="steps">${links.join('')}</span>${next}<a class="all" href="index.html">Índice</a>`;
};

// se borran las páginas viejas (paso-02a.html, paso-06e.html...) que ya no existen
fs.readdirSync(PASOS).filter(f => /^paso-\d+[a-e]?\.html$/.test(f) || f === 'index.html' || f === 'placa-completa.html').forEach(f => fs.unlinkSync(path.join(PASOS, f)));

const log = [];
const focos = {};
PAGES.forEach((p, i) => {
  const b = build(p.step, { plain: !!p.plain });
  const hasTr = b.M.parts.concat(b.M.ghostParts).some(e => e.kind === 'tr');
  const dE = '../ebc/', dC = '../cbe/';
  const pin = hasTr ? `<span class="pin">Transistor:<a class="${CBE ? '' : 'on'}" href="${CBE ? dE : ''}${p.file}.html" title="Mirando la cara plana, de izquierda a derecha: emisor, base, colector">E-B-C</a><a class="${CBE ? 'on' : ''}" href="${CBE ? '' : dC}${p.file}.html" title="Mirando la cara plana, de izquierda a derecha: colector, base, emisor">C-B-E</a></span>` : '';
  fs.writeFileSync(path.join(PASOS, p.file + '.html'), pageHtml({
    pin, names: b.names, svg: svgWrap(b.svg), title: p.full, short: p.short, hint: p.hint || '', nav: nav(i), focus: p.plain ? FULL : b.vb, legend: '',
  }), 'utf8');
  focos[p.file] = p.plain ? FULL : b.vb;
  log.push(`${p.short}: ${b.nets} redes, ${b.wires} cables, ${b.pins} patas`);
});
// recorte extra de la placa completa: el frente (las luces del carrito), para la presentación
focos['frente-luces@placa-completa'] = `${f1(colX(1) - 190)} ${f1(Y_F - 120)} ${f1(colX(14) - colX(1) + 190 + 40)} ${f1(Y_E - Y_F + 240)}`;
// la placa completa sin espacios vacíos y, con la misma toma, cada bloque del circuito aislado (para la presentación)
{
  const x0 = colX(1) - 200, x1 = W_SVG - 50, y0 = 270 - 245, y1 = H_SVG - 270 + 245;
  const caja = `${f1(x0)} ${f1(y0)} ${f1(x1 - x0)} ${f1(y1 - y0)}`;
  focos['placa-completa-total@placa-completa'] = caja;
  if (!SOLO_LM) Object.keys(BLOQUES).forEach(b => { focos['bloque-' + b + '@placa-completa'] = caja; });
}
// la misma toma con el puente corto (opción de cableado de S) en los pasos donde el LM358 ya recibe la salida
if (!SOLO_LM) ['paso-18', 'paso-20', 'paso-22'].forEach(k => { focos[k + '-puente@' + k] = focos[k]; });
if (SOLO_LM) {   // la guía lm358 se arma con el puente corto desde el paso 10
  STEPS_USAR.filter(s => s.n >= 10).forEach(s => { const k = 'paso-' + String(s.n).padStart(2, '0'); focos[k + '-puente@' + k] = focos[k]; });
  focos['placa-completa-total-puente@placa-completa'] = focos['placa-completa-total@placa-completa'];
}
fs.writeFileSync(path.join(PASOS, 'enfoques.json'), JSON.stringify(focos, null, 1), 'utf8');
console.log('Conectividad verificada en cada página:\n  ' + log.join('\n  '));

// índice
const idx = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Protoboard paso a paso</title>
<style>body{font-family:"Segoe UI",system-ui,Arial,sans-serif;background:#f6f4ee;color:#1b232c;margin:0;padding:28px 20px}main{max-width:760px;margin:0 auto}h1{font-size:22px;margin:0 0 4px}p{color:#5b6672;margin:0 0 18px}ol{padding:0;list-style:none;display:grid;gap:10px}li a{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid #d8d3c3;border-radius:10px;padding:12px 16px;text-decoration:none;color:inherit}li a:hover{background:#efece1}.n{font-weight:700;font-size:18px;min-width:38px;height:38px;border-radius:19px;background:#b8672f;color:#fff;display:grid;place-items:center;flex:none;padding:0 6px}.t b{display:block}</style></head><body><main>
<h1>Carrito que esquiva obstáculos: la protoboard paso a paso</h1><p>Cada página muestra la protoboard tal como queda al terminar ese paso. Los números son los de la guía. Lo nuevo brilla en amarillo y lo que se quita simplemente desaparece.</p>
<ol>${PAGES.map(p => `<li><a href="${p.file}.html"><span class="n">${p.label}</span><span class="t"><b>${p.title}</b></span></a></li>`).join('')}</ol>
</main></body></html>`;
fs.writeFileSync(path.join(PASOS, 'index.html'), idx, 'utf8');
console.log('listo.');
