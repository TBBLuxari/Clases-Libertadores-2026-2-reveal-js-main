// Parcial impreso de Programación Web (corte 2), basado en la sala de billar. Cuatro versiones numeradas 1 a 4,
// clave del profe y hoja de referencia opcional.
// Uso: node docs/gen-parcial-web.js
//   1. Arma las preguntas de cada versión (los números cambian de una versión a otra; el orden de las opciones también).
//   2. Renderiza cada figura con Three.js real (Edge headless) y COMPRUEBA: la opción correcta produce la figura y cada
//      distractor produce una imagen distinta; los errores de consola se ejecutan de verdad para copiar el mensaje exacto.
//      Si algo no cuadra, el script se detiene y lo dice.
//   3. Escribe los PDF en materias/programacion-web/actividades/parcial-corte-2/ (para-imprimir/ y clave-del-profe.pdf).
// Variables de entorno: PARCIAL_OUT (otra carpeta de salida), SOLO_VERIFICAR=1 (renderiza y comprueba, sin PDF).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { renderJobs } = require('./parcial-web-render');

const RAIZ = path.join(__dirname, '..');
const SALIDA = process.env.PARCIAL_OUT ? path.resolve(process.env.PARCIAL_OUT) : path.join(RAIZ, 'materias', 'programacion-web', 'actividades', 'parcial-corte-2');
const TMP = path.join(process.env.TEMP || __dirname, 'parcial-web-tmp');
const edges = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'];
const EXE = edges.find(p => fs.existsSync(p));
if (!EXE) { console.error('No encontré Edge ni Chrome.'); process.exit(1); }

const aUrl = p => 'file:///' + p.replace(/\\/g, '/').split('/').map((s, i) => (i === 0 ? s : encodeURIComponent(s))).join('/');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function edge(args) { try { return execFileSync(EXE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', ...args], { stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString(); } catch (e) { return (e.stdout || '').toString(); } }
const num = x => String(+(+x).toFixed(2));

// =================================================================== versiones
const VERSIONES = [
  { id: '1', n: 1, idx: 0 },
  { id: '2', n: 2, idx: 1 },
  { id: '3', n: 3, idx: 2 },
  { id: '4', n: 4, idx: 3 },
];
const W = 900, H = 520;
const LETRAS = ['A', 'B', 'C', 'D'];
const LUCES_OCULTAS = `scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const _sol = new THREE.DirectionalLight(0xffffff, 2.2);
_sol.position.set(4, 8, 5);
scene.add(_sol);
`;

// Pone la opción correcta en la posición pos (0-3) y completa con los distractores en orden.
function ordenar(correcta, distractores, pos) {
  const res = distractores.slice();
  res.splice(pos, 0, correcta);
  return res;
}

// Código con huecos: {{respuesta}} se muestra como línea en blanco (alumno) o resaltado (clave).
function conHuecos(code, modo) {
  return code.split(/\{\{(.+?)\}\}/).map((t, i) => {
    if (i % 2 === 0) return esc(t);
    return modo === 'clave' ? `<span class="resp">${esc(t)}</span>` : '<span class="hueco"></span>';
  }).join('');
}
const pre = (code, modo) => `<pre class="codigo">${conHuecos(code, modo)}</pre>`;
const lineaResp = (etq, ancho) => `<span class="campo">${etq}<span class="hueco" style="min-width:${ancho || 60}px"></span></span>`;

// =================================================================== PARTE 1: figura -> código
function item11(v) {
  const P = [{ h: 4, w: 2 }, { h: 5, w: 2 }, { h: 4, w: 3 }, { h: 3, w: 2 }][v.idx];
  const compartido = `const piso = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: 0xd8d0c0 })
);
const caja = new THREE.Mesh(
  new THREE.BoxGeometry(${P.w}, ${P.h}, ${P.w}),
  new THREE.MeshStandardMaterial({ color: 0xb5482f })
);
scene.add(piso);
scene.add(caja);`;
  const T = {
    ok: { code: `piso.rotation.x = -Math.PI / 2;\ncaja.position.y = ${P.h / 2};`, porque: 'El piso se acuesta con rotation.x = -Math.PI / 2 y la caja se apoya con y = alto / 2.' },
    mas: { code: `piso.rotation.x = Math.PI / 2;\ncaja.position.y = ${P.h / 2};`, porque: 'Con rotation.x positivo el piso queda mirando hacia abajo: desde arriba no se ve y la caja parece flotar en el vacío.' },
    hundida: { code: `piso.rotation.x = -Math.PI / 2;\ncaja.position.y = 0;`, porque: 'Con y = 0 el centro de la caja queda sobre el piso: la mitad de la caja queda enterrada (se ve un cubo más bajo).' },
    flota: { code: `piso.rotation.x = -Math.PI / 2;\ncaja.position.y = ${P.h};`, porque: `Con y = ${P.h} (el alto completo) la caja queda flotando ${P.h / 2} por encima del piso.` },
    eje: { code: `piso.rotation.y = -Math.PI / 2;\ncaja.position.y = ${P.h / 2};`, porque: 'rotation.y gira el plano alrededor del eje vertical: sigue parado como una pared, no se acuesta.' },
  };
  const dist = [['mas', 'hundida', 'eje'], ['flota', 'mas', 'hundida'], ['eje', 'flota', 'hundida'], ['mas', 'flota', 'eje']][v.idx];
  const pos = [1, 3, 0, 2][v.idx];
  const orden = ordenar('ok', dist, pos);
  const cam = { pos: [7, 2.6, 9], look: [0, P.h * 0.35, 0], fov: 42 };
  const jobs = [], checks = [];
  const idf = `${v.id}|1.1|fig`;
  jobs.push({ id: idf, w: W, h: H, cam, code: LUCES_OCULTAS + compartido + '\n' + T.ok.code, guardar: true });
  orden.forEach((k, i) => {
    const id = `${v.id}|1.1|${LETRAS[i]}`;
    jobs.push({ id, w: W, h: H, cam, code: LUCES_OCULTAS + compartido + '\n' + T[k].code, ref: idf });
    checks.push({ id, tipo: k === 'ok' ? 'igual' : 'distinto', nota: `1.1 opción ${LETRAS[i]} (${k})` });
  });
  return {
    num: '1.1', pts: 3, jobs, checks, fig: idf,
    alumno(res) {
      return `<p>Esta es la imagen de una escena. ¿Cuál bloque de código, escrito después de estas líneas, produce esa imagen? <b>Encierren la letra.</b></p>
      <div class="fila"><div class="col-codigo">${pre(compartido)}</div><div class="col-fig"><img class="fig" src="${res.uri(idf)}"></div></div>
      <div class="opciones">${orden.map((k, i) => `<div class="opcion"><span class="letra">${LETRAS[i]}</span>${pre(T[k].code)}</div>`).join('')}</div>`;
    },
    clave(res) {
      return `<p><b>Correcta: ${LETRAS[pos]}.</b> ${esc(T.ok.porque)}</p><ul class="chico">${orden.map((k, i) => (k === 'ok' ? '' : `<li><b>${LETRAS[i]}</b>: ${esc(T[k].porque)}</li>`)).join('')}</ul>`;
    },
    claveRespuesta: LETRAS[pos],
  };
}

function item12(v) {
  const P = [{ w: 8, h: 4, a: 4, b: 2 }, { w: 9, h: 3, a: 3, b: 1 }, { w: 8, h: 6, a: 4, b: 3 }, { w: 6, h: 4, a: 3, b: 2 }][v.idx];
  const compartido = `const textura = cargador.load("mosaico.jpg");
const pared = new THREE.Mesh(
  new THREE.PlaneGeometry(${P.w}, ${P.h}),
  new THREE.MeshBasicMaterial({ map: textura })
);
scene.add(pared);`;
  const wr = 'textura.wrapS = THREE.RepeatWrapping;\ntextura.wrapT = THREE.RepeatWrapping;\n';
  const T = {
    ok: { code: `${wr}textura.repeat.set(${P.a}, ${P.b});`, porque: `Con RepeatWrapping y repeat.set(${P.a}, ${P.b}) la imagen se repite ${P.a} veces a lo ancho y ${P.b} a lo alto.` },
    swap: { code: `${wr}textura.repeat.set(${P.b}, ${P.a});`, porque: `Los valores están invertidos: repeat.set(x, y) es primero el ancho. Saldrían ${P.b} columnas y ${P.a} filas.` },
    nowrap: { code: `textura.repeat.set(${P.a}, ${P.b});`, porque: 'Sin wrapS y wrapT = RepeatWrapping la textura no se repite: aparece un solo mosaico en una esquina y el resto se rellena con el color del borde.' },
    raw: { code: `${wr}textura.repeat.set(${P.w}, ${P.h});`, porque: `Se usó la medida de la pared como repeat (${P.w} × ${P.h}): salen muchísimos mosaicos pequeños.` },
    doble: { code: `${wr}textura.repeat.set(${P.a * 2}, ${P.b * 2});`, porque: `El doble de repeticiones: saldrían ${P.a * 2} columnas y ${P.b * 2} filas.` },
  };
  const dist = [['swap', 'nowrap', 'raw'], ['swap', 'raw', 'doble'], ['nowrap', 'swap', 'doble'], ['raw', 'nowrap', 'swap']][v.idx];
  const pos = [3, 0, 1, 2][v.idx];
  const orden = ordenar('ok', dist, pos);
  const d = Math.max((P.h / 2) / Math.tan(21 * Math.PI / 180), (P.w / 2) / ((W / H) * Math.tan(21 * Math.PI / 180))) * 1.12;
  const cam = { pos: [0, 0, d], look: [0, 0, 0], fov: 42 };
  const ejec = c => c.replace('cargador.load("mosaico.jpg")', 'mosaico()');
  const jobs = [], checks = [];
  const idf = `${v.id}|1.2|fig`;
  jobs.push({ id: idf, w: W, h: H, cam, code: ejec(compartido) + '\n' + T.ok.code, guardar: true });
  orden.forEach((k, i) => {
    const id = `${v.id}|1.2|${LETRAS[i]}`;
    jobs.push({ id, w: W, h: H, cam, code: ejec(compartido) + '\n' + T[k].code, ref: idf });
    checks.push({ id, tipo: k === 'ok' ? 'igual' : 'distinto', nota: `1.2 opción ${LETRAS[i]} (${k})` });
  });
  return {
    num: '1.2', pts: 3, jobs, checks, fig: idf,
    alumno(res) {
      return `<p>Esta es una pared con una textura. ¿Qué código, escrito después de estas líneas, la produce? <b>Encierren la letra.</b></p>
      <div class="fila"><div class="col-codigo">${pre(compartido)}</div><div class="col-fig"><img class="fig" src="${res.uri(idf)}"></div></div>
      <div class="opciones">${orden.map((k, i) => `<div class="opcion"><span class="letra">${LETRAS[i]}</span>${pre(T[k].code)}</div>`).join('')}</div>`;
    },
    clave() {
      return `<p><b>Correcta: ${LETRAS[pos]}.</b> ${esc(T.ok.porque)}</p><ul class="chico">${orden.map((k, i) => (k === 'ok' ? '' : `<li><b>${LETRAS[i]}</b>: ${esc(T[k].porque)}</li>`)).join('')}</ul>`;
    },
    claveRespuesta: LETRAS[pos],
  };
}

function item13(v) {
  const L = [{ p: [-5, 7, 3] }, { p: [5, 7, 3] }, { p: [-4, 6, -3] }, { p: [4, 6, -3] }][v.idx];
  const [px, py, pz] = L.p;
  const compartido = `const piso = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  new THREE.MeshStandardMaterial({ color: 0xd8d0c0 })
);
piso.rotation.x = -Math.PI / 2;
scene.add(piso);

const esfera = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xb5482f })
);
esfera.position.y = 1;
scene.add(esfera);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sol = new THREE.DirectionalLight(0xffffff, 2.5);`;
  const lineas = (pos, quitar) => [`sol.position.set(${pos.join(', ')});`, 'sol.castShadow = true;', 'esfera.castShadow = true;', 'piso.receiveShadow = true;', 'renderer.shadowMap.enabled = true;', 'scene.add(sol);']
    .filter(l => l !== quitar).join('\n');
  const T = {
    ok: { code: lineas(L.p), porque: `La luz está a ${px < 0 ? 'la izquierda' : 'la derecha'} y ${pz > 0 ? 'delante' : 'detrás'} de la esfera, así que la sombra cae al lado contrario. Los cuatro interruptores de sombra están puestos.` },
    x: { code: lineas([-px, py, pz]), porque: `La luz está del otro lado en x (${-px}): la sombra caería hacia el lado contrario al de la imagen.` },
    z: { code: lineas([px, py, -pz]), porque: `La luz está del otro lado en z (${-pz}): la sombra caería hacia otra dirección (adelante o atrás) distinta a la de la imagen.` },
    baja: { code: lineas([px, py / 2, pz]), porque: `La luz está más baja (y = ${py / 2}): la sombra sería mucho más larga.` },
    sinEsfera: { code: lineas(L.p, 'esfera.castShadow = true;'), porque: 'Falta esfera.castShadow = true: la esfera no tapa la luz y no hay sombra.' },
    sinRenderer: { code: lineas(L.p, 'renderer.shadowMap.enabled = true;'), porque: 'Falta renderer.shadowMap.enabled = true: el renderer no calcula sombras.' },
    sinPiso: { code: lineas(L.p, 'piso.receiveShadow = true;'), porque: 'Falta piso.receiveShadow = true: la sombra no se ve sobre el piso.' },
    sinLuz: { code: lineas(L.p, 'sol.castShadow = true;'), porque: 'Falta sol.castShadow = true: la luz no proyecta sombras.' },
  };
  const dist = [['x', 'baja', 'sinEsfera'], ['z', 'x', 'sinRenderer'], ['baja', 'z', 'sinPiso'], ['x', 'z', 'sinLuz']][v.idx];
  const pos = [2, 1, 3, 0][v.idx];
  const orden = ordenar('ok', dist, pos);
  const cam = { pos: [0, 4.2, 10], look: [0, 0.6, 0], fov: 42 };
  const jobs = [], checks = [];
  const idf = `${v.id}|1.3|fig`;
  jobs.push({ id: idf, w: W, h: H, cam, code: compartido + '\n' + T.ok.code, guardar: true });
  orden.forEach((k, i) => {
    const id = `${v.id}|1.3|${LETRAS[i]}`;
    jobs.push({ id, w: W, h: H, cam, code: compartido + '\n' + T[k].code, ref: idf });
    checks.push({ id, tipo: k === 'ok' ? 'igual' : 'distinto', nota: `1.3 opción ${LETRAS[i]} (${k})` });
  });
  return {
    num: '1.3', pts: 3, jobs, checks, fig: idf,
    alumno(res) {
      return `<p>Una esfera sobre un piso, con una luz direccional. ¿Cuál bloque, escrito después de estas líneas, produce esta imagen (con su sombra)? <b>Encierren la letra.</b></p>
      <div class="fila"><div class="col-codigo">${pre(compartido)}</div><div class="col-fig"><img class="fig" src="${res.uri(idf)}"></div></div>
      <div class="opciones">${orden.map((k, i) => `<div class="opcion"><span class="letra">${LETRAS[i]}</span>${pre(T[k].code)}</div>`).join('')}</div>`;
    },
    clave() {
      return `<p><b>Correcta: ${LETRAS[pos]}.</b> ${esc(T.ok.porque)}</p><ul class="chico">${orden.map((k, i) => (k === 'ok' ? '' : `<li><b>${LETRAS[i]}</b>: ${esc(T[k].porque)}</li>`)).join('')}</ul>`;
    },
    claveRespuesta: LETRAS[pos],
  };
}

// =================================================================== PARTE 2: código -> números
function item21(v) {
  const P = [
    { n: 4, cond: '<', x0: -3, d: 2 },
    { n: 4, cond: '<=', x0: -2, d: 1.5 },
    { n: 5, cond: '<', x0: 1, d: -0.5 },
    { n: 5, cond: '<=', x0: -4, d: 2 },
  ][v.idx];
  const limite = P.cond === '<' ? P.n : P.n - 1;
  const formula = P.d >= 0 ? `${P.x0} + i * ${P.d}` : `${P.x0} - i * ${-P.d}`;
  const codigo = `for (let i = 0; i ${P.cond} ${limite}; i++)
{
  new Bola(0xffffff, ${formula}, 0);
}`;
  const xs = [];
  for (let i = 0; i < P.n; i++) { xs.push(num(P.x0 + i * P.d)); }
  const dist = num(Math.abs(P.d) * (P.n - 1));
  return {
    num: '2.1', pts: 3, jobs: [], checks: [],
    alumno() {
      const filas = [0, 1, 2, 3, 4, 5].map(i => `<tr><td>${i}</td><td></td></tr>`).join('');
      return `<p>La clase <code>Bola(color, x, z)</code> ya existe. Se ejecuta este código:</p>${pre(codigo)}
      <div class="fila"><div><table class="tabla"><tr><th>valor de i</th><th>x de esa bola</th></tr>${filas}</table><p class="nota">Usen solo las filas que necesiten.</p></div>
      <div class="col-preg"><p>a) ¿Cuántas bolas se crean? ${lineaResp('', 70)}</p><p>b) ¿Qué distancia hay entre la primera y la última bola? ${lineaResp('', 70)}</p></div></div>`;
    },
    clave() {
      return `<p>Tabla: ${xs.map((x, i) => `i = ${i} → x = <b>${x}</b>`).join('; ')}.</p><p>a) <b>${P.n}</b> bolas. b) <b>${dist}</b>.</p>
      <p class="rub">Puntaje: tabla completa y correcta 2 (proporcional por fila), a) 0,5, b) 0,5. Ojo con ${P.cond === '<=' ? '<code>&lt;=</code>: la última vuelta incluye el límite' : '<code>&lt;</code>: la última vuelta no incluye el límite'}.</p>`;
    },
  };
}

function item22(v) {
  const P = [
    { aP: 2, g: 0.5, r: 0.25, r2: 0.4 },
    { aP: 1.5, g: 0.3, r: 0.2, r2: 0.5 },
    { aP: 2.5, g: 0.4, r: 0.3, r2: 0.1 },
    { aP: 3, g: 0.2, r: 0.5, r2: 0.25 },
  ][v.idx];
  const pano = num(P.aP + P.g), bola = num(P.aP + P.g + P.r), bola2 = num(P.aP + P.g + P.r2);
  const codigo = `const alturaPata = ${P.aP};
const grosorTablero = ${P.g};
const alturaPano = alturaPata + grosorTablero;
const radioBola = ${P.r};`;
  const svgTexto = `<svg viewBox="0 0 440 230" width="440" height="230" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial" font-size="12">
    <line x1="20" y1="205" x2="380" y2="205" stroke="#222" stroke-width="2"/><text x="24" y="222">piso (y = 0)</text>
    <rect x="60" y="105" width="250" height="20" fill="#d9d2c3" stroke="#222" stroke-width="1.5"/>
    <rect x="72" y="125" width="18" height="80" fill="#eee" stroke="#222" stroke-width="1.5"/>
    <rect x="280" y="125" width="18" height="80" fill="#eee" stroke="#222" stroke-width="1.5"/>
    <line x1="60" y1="105" x2="310" y2="105" stroke="#0a7" stroke-width="1.5" stroke-dasharray="5 4"/><text x="64" y="98" fill="#0a7">paño (alturaPano)</text>
    <circle cx="190" cy="85" r="20" fill="#fff" stroke="#222" stroke-width="1.5"/><circle cx="190" cy="85" r="2.5" fill="#222"/>
    <line x1="190" y1="85" x2="210" y2="85" stroke="#222"/><text x="214" y="82">radioBola</text>
    <path d="M326 125 q8 0 8 8 v64 q0 8 -8 8" fill="none" stroke="#222"/><text x="338" y="170">alturaPata</text>
    <path d="M326 105 q8 0 8 8 v4 q0 8 -8 8" fill="none" stroke="#222"/><text x="338" y="119">grosorTablero</text>
    <text x="120" y="62" font-weight="bold">y de la bola = ?</text><path d="M178 66 l6 12" stroke="#222" fill="none"/>
  </svg>`;
  const svg = `<img class="esquema" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgTexto)}">`;
  return {
    num: '2.2', pts: 3, jobs: [], checks: [],
    alumno() {
      return `<p>La bola debe quedar <b>apoyada sobre el paño</b>, tocándolo (no hundida ni flotando). Estas son las medidas de la mesa:</p>
      <div class="fila"><div class="col-codigo">${pre(codigo)}</div><div>${svg}</div></div>
      <p>a) ¿Cuánto vale <code>alturaPano</code>? ${lineaResp('', 70)}</p>
      <p>b) ¿Qué valor va en <code>bola.position.y</code> para que quede apoyada? ${lineaResp('', 70)}</p>
      <p>c) Si cambian la bola por otra de radio ${P.r2}, ¿qué valor tendría ahora <code>position.y</code>? ${lineaResp('', 70)}</p>`;
    },
    clave() {
      return `<p>a) ${P.aP} + ${P.g} = <b>${pano}</b>. b) alturaPano + radioBola = ${pano} + ${P.r} = <b>${bola}</b>. c) ${pano} + ${P.r2} = <b>${bola2}</b>.</p><p class="rub">Puntaje: 1 cada uno. Si en b) olvidan sumar el radio (dejan ${pano}) pero en c) usan bien alturaPano + radio, c) vale igual.</p>`;
    },
  };
}

function item23(v) {
  const P = [
    { pw: 16, ph: 16, t: 2, b: 'piso', grados: 'Math.PI / 2', gr: 90 },
    { pw: 12, ph: 6, t: 3, b: 'pared', grados: 'Math.PI', gr: 180 },
    { pw: 18, ph: 9, t: 3, b: 'techo', grados: 'Math.PI / 4', gr: 45 },
    { pw: 16, ph: 8, t: 4, b: 'piso', grados: 'Math.PI / 3', gr: 60 },
  ][v.idx];
  const rx = P.pw / P.t, ry = P.ph / P.t;
  const enunciadoB = {
    piso: ['Un plano nace parado. Para acostarlo como <b>piso</b> (mirando hacia arriba): <code>plano.rotation.x = ', ' ;</code>', '-Math.PI / 2'],
    pared: ['Un plano nace mirando de frente. Para girarlo <b>un cuarto de vuelta</b> alrededor del eje vertical (como una pared lateral): <code>plano.rotation.y = ', ' ;</code>', 'Math.PI / 2 (o -Math.PI / 2)'],
    techo: ['Un plano nace parado. Para acostarlo como <b>techo</b> (mirando hacia abajo): <code>plano.rotation.x = ', ' ;</code>', 'Math.PI / 2'],
  }[P.b];
  return {
    num: '2.3', pts: 3, jobs: [], checks: [],
    alumno() {
      return `<p>a) Un plano de <b>${P.pw} × ${P.ph}</b> unidades debe mostrar mosaicos de <b>${P.t} × ${P.t}</b> unidades:<br><code>textura.repeat.set(</code>${lineaResp('', 45)}<code>,</code>${lineaResp('', 45)}<code>);</code></p>
      <p>b) ${enunciadoB[0]}</code>${lineaResp('', 110)}</p>
      <p>c) <code>${P.grados}</code> equivale a ${lineaResp('', 55)} grados.</p>`;
    },
    clave() {
      return `<p>a) repeat.set(<b>${rx}, ${ry}</b>) (medida ÷ mosaico). b) <b>${enunciadoB[2]}</b>. c) <b>${P.gr}°</b>.</p><p class="rub">Puntaje: a) 1 (0,5 por número), b) 1, c) 1. En b) si dan el signo contrario en piso/techo, 0,5.</p>`;
    },
  };
}

// =================================================================== PARTE 3: completar el código
function item31(v) {
  const P = [
    { color: '0xfff0d0', inten: 140, y: 5.5, ang: '3.2', pen: 0.5, omite: [7, 12] },
    { color: '0xffe9c4', inten: 120, y: 6, ang: '3', pen: 0.4, omite: [1, 5] },
    { color: '0xfff4dc', inten: 160, y: 5, ang: '4', pen: 0.6, omite: [4, 10] },
    { color: '0xffefc8', inten: 130, y: 6.5, ang: '3.5', pen: 0.3, omite: [9, 11] },
  ][v.idx];
  // [código con hueco, texto del hueco, comentario]
  const L = [
    ['renderer.{{shadowMap}}.enabled = true;', 'activa las sombras en el renderer'],
    [`const lampara = new THREE.{{SpotLight}}(${P.color}, ${P.inten});`, 'un foco, como una lámpara de techo'],
    [`lampara.position.set(0, ${P.y}, 0);`, ''],
    ['lampara.target.position.set(0, alturaPano, 0);', ''],
    [`lampara.{{angle}} = Math.PI / ${P.ang};`, 'qué tan abierto es el cono'],
    [`lampara.{{penumbra}} = ${P.pen};`, 'qué tan suave es el borde del cono'],
    ['lampara.{{castShadow}} = true;', 'la lámpara proyecta sombras'],
    ['lampara.shadow.{{mapSize}}.set(2048, 2048);', 'resolución de la sombra'],
    ['scene.add(lampara);', ''],
    ['scene.add({{lampara.target}});', 'el objetivo también va a la escena'],
    ['bola.{{castShadow}} = true;', 'la bola tapa la luz'],
    ['pano.{{receiveShadow}} = true;', 'sobre el paño se ve la sombra'],
    ['lampara.shadow.{{bias}} = -0.0005;', 'quita las rayitas raras'],
  ];
  const armar = (modo) => L.map((l, i) => {
    let code = l[0];
    if (P.omite.includes(i)) { code = code.replace(/\{\{(.+?)\}\}/, '$1'); }
    const hueco = /\{\{/.test(code);
    const comentario = l[1] && hueco ? '   // ' + l[1] : '';
    return conHuecos(code, modo) + (comentario ? `<span class="com">${esc(comentario)}</span>` : '');
  }).join('\n');
  const huecos = L.map((l, i) => ({ l, i })).filter(o => !P.omite.includes(o.i) && /\{\{/.test(o.l[0]));
  return {
    num: '3.1', pts: 4, jobs: [], checks: [],
    alumno() {
      return `<p>La lámpara cuelga sobre la mesa y debe proyectar la sombra de la bola sobre el paño. Completen las líneas que faltan (el comentario dice qué hace cada una).</p><pre class="codigo">${armar('alumno')}</pre>`;
    },
    clave() {
      return `<pre class="codigo">${armar('clave')}</pre><p class="rub">Puntaje: 0,5 por hueco (${huecos.length} huecos; si hay 8 sumar 4). Se acepta una letra de más o de menos, y mayúscula/minúscula equivocada solo si el nombre se reconoce.</p>`;
    },
    nHuecos: huecos.length,
  };
}

function item32(v) {
  const esBola = v.idx % 2 === 0;
  const P = [{ r: 0.2, aP: 2.3 }, { alto: 2 }, { r: 0.25, aP: 2.5 }, { alto: 3 }][v.idx];
  const codigoBola = `const alturaPano = ${P.aP};
const radioBola = ${P.r};

class Bola
{
  constructor(color, x, z)
  {
    {{this}}.malla = new THREE.Mesh(
      new THREE.SphereGeometry(radioBola, 48, 48),
      new THREE.MeshPhysicalMaterial({ color: color, roughness: 0.15, clearcoat: 1 })
    );
    this.malla.position.set(x, {{alturaPano + radioBola}}, z);   // apoyada sobre el paño
    this.malla.castShadow = true;
    scene.add({{this.malla}});
  }
}

const blanca = {{new}} Bola(0xffffff, -2, 0);`;
  const codigoPata = `class Pata
{
  constructor(x, z, {{alto}})
  {
    this.malla = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.16, alto, 24),
      material
    );
    this.malla.position.set(x, {{alto / 2}}, z);   // parada sobre el piso
    this.malla.castShadow = true;
    scene.add({{this.malla}});
  }
}

const pata1 = {{new}} Pata(-3.8, -1.9, ${P.alto});`;
  const codigo = esBola ? codigoBola : codigoPata;
  return {
    num: '3.2', pts: 6, jobs: [], checks: [],
    alumno() {
      return `<p>Esta clase tiene huecos. Complétenla para que funcione (hay <b>4 huecos</b>).</p>${pre(codigo)}`;
    },
    clave() {
      return `${pre(codigo, 'clave')}<p class="rub">Puntaje: 1,5 por hueco. En ${esBola ? '<code>this</code>' : 'el parámetro'} basta con que el nombre sea el mismo que se usa más abajo; en la posición, ${esBola ? 'alturaPano + radioBola (la bola apoyada)' : 'alto / 2 (la pata parada)'}.</p>`;
    },
  };
}

// =================================================================== PARTE 4: encontrar el error
function item41(v) {
  const caja2 = `const caja = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ color: 0xb5482f })
);
caja.position.y = 1;
scene.add(caja);`;
  const pisoBase = (rot) => `const piso = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: 0xd8d0c0 })
);
${rot ? rot + '\n' : ''}scene.add(piso);`;
  const VAR = [
    { id: 'parado', ve: 'En vez de un piso aparece una pared parada que atraviesa la caja.', code: pisoBase('') + '\n\n' + caja2, pre: LUCES_OCULTAS, cam: { pos: [7, 3, 9], look: [0, 1, 0], fov: 45 },
      falla: 'Falta acostar el piso: <code>piso.rotation.x = -Math.PI / 2;</code> (un plano nace parado).', luces: true },
    { id: 'invisible', ve: 'El piso no aparece: la caja se ve flotando en el vacío.', code: pisoBase('piso.rotation.x = Math.PI / 2;') + '\n\n' + caja2, pre: LUCES_OCULTAS, cam: { pos: [7, 3, 9], look: [0, 1, 0], fov: 45 },
      falla: 'El signo está al revés: <code>piso.rotation.x = Math.PI / 2</code> deja el piso mirando hacia abajo. Debe ser <code>-Math.PI / 2</code>.', luces: true },
    { id: 'sinluz', ve: 'Todo se ve negro: solo se distinguen siluetas.', code: pisoBase('piso.rotation.x = -Math.PI / 2;') + '\n\n' + caja2, pre: '', cam: { pos: [7, 3, 9], look: [0, 1, 0], fov: 45 },
      falla: 'No hay ninguna luz en la escena y MeshStandardMaterial necesita luz. Hay que agregar una luz (por ejemplo una <code>AmbientLight</code> y una <code>DirectionalLight</code>).', luces: false },
    { id: 'sinwrap', ve: 'Solo aparece un mosaico en una esquina del piso y el resto es de un solo color oscuro: la imagen no se repite.',
      code: `const textura = cargador.load("mosaico.jpg");
textura.repeat.set(5, 5);

const piso = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({ map: textura })
);
piso.rotation.x = -Math.PI / 2;
scene.add(piso);`, pre: '', cam: { pos: [0, 7, 9], look: [0, 0, 0], fov: 45 },
      falla: 'Faltan <code>textura.wrapS = THREE.RepeatWrapping;</code> y <code>textura.wrapT = THREE.RepeatWrapping;</code>: sin ellas el repeat no repite la imagen.', luces: null },
  ][v.idx];
  const idf = `${v.id}|4.1|fig`;
  const codeExec = VAR.pre + VAR.code.replace('cargador.load("mosaico.jpg")', 'mosaico()');
  return {
    num: '4.1', pts: 3, fig: idf,
    jobs: [{ id: idf, w: W, h: H, cam: VAR.cam, code: codeExec, guardar: true }], checks: [],
    alumno(res) {
      return `<p>Se quiere un piso y objetos sobre él, pero la escena se ve así. <b>Lo que se ve:</b> ${esc(VAR.ve)} La cámara está bien${VAR.luces === true ? ' y la escena ya tiene luces' : ''}.</p>
      <div class="fila"><div class="col-codigo">${pre(VAR.code)}</div><div class="col-fig"><img class="fig" src="${res.uri(idf)}"></div></div>
      <p>a) ¿Qué línea falla o qué falta? ${lineaResp('', 330)}</p><p>b) ¿Cómo se arregla? ${lineaResp('', 360)}</p>`;
    },
    clave() { return `<p>${VAR.falla}</p><p class="rub">Puntaje: a) 1,5 (señala la línea o lo que falta), b) 1,5 (la corrección concreta).</p>`; },
  };
}

function item42(v) {
  const idx = (v.idx + 1) % 4;
  const base = [
    'renderer.shadowMap.enabled = true;',
    '',
    'const piso = new THREE.Mesh(',
    '  new THREE.PlaneGeometry(12, 12),',
    '  new THREE.MeshStandardMaterial({ color: 0xd8d0c0 })',
    ');',
    'piso.rotation.x = -Math.PI / 2;',
    'piso.receiveShadow = true;',
    'scene.add(piso);',
    '',
    'const esfera = new THREE.Mesh(',
    '  new THREE.SphereGeometry(1, 32, 32),',
    '  new THREE.MeshStandardMaterial({ color: 0xb5482f })',
    ');',
    'esfera.position.y = 1;',
    'esfera.castShadow = true;',
    'scene.add(esfera);',
    '',
    'scene.add(new THREE.AmbientLight(0xffffff, 0.4));',
    'const sol = new THREE.DirectionalLight(0xffffff, 2.5);',
    'sol.position.set(-5, 7, 3);',
    'sol.castShadow = true;',
    'scene.add(sol);',
  ];
  const quitar = ['renderer.shadowMap.enabled = true;', 'piso.receiveShadow = true;', 'esfera.castShadow = true;', 'sol.castShadow = true;'][idx];
  const porque = [
    'Falta <code>renderer.shadowMap.enabled = true;</code>: el renderer no calcula sombras.',
    'Falta <code>piso.receiveShadow = true;</code>: sobre el piso no se puede ver la sombra.',
    'Falta <code>esfera.castShadow = true;</code>: la esfera no tapa la luz.',
    'Falta <code>sol.castShadow = true;</code>: la luz no proyecta sombras.',
  ][idx];
  let lineas = base.filter(l => l !== quitar);
  const codigo = lineas.join('\n').replace(/^\n+/, '');
  const idf = `${v.id}|4.2|fig`;
  return {
    num: '4.2', pts: 3, fig: idf,
    jobs: [{ id: idf, w: W, h: H, cam: { pos: [0, 4.2, 10], look: [0, 0.6, 0], fov: 42 }, code: codigo, guardar: true }], checks: [],
    alumno(res) {
      return `<p>Se quiere que la esfera proyecte su sombra sobre el piso, pero <b>no aparece ninguna sombra</b>. No hay errores en la consola.</p>
      <div class="fila"><div class="col-codigo">${pre(codigo)}</div><div class="col-fig"><img class="fig" src="${res.uri(idf)}"></div></div>
      <p>a) ¿Qué línea falta? ${lineaResp('', 360)}</p><p>b) ¿Por qué sin esa línea no hay sombra? ${lineaResp('', 330)}</p>`;
    },
    clave() { return `<p>${porque}</p><p class="rub">Puntaje: a) 1,5 (la línea exacta o su equivalente), b) 1,5 (la razón: quién proyecta, quién recibe o quién calcula).</p>`; },
  };
}

function item43(v) {
  const idx = (v.idx + 2) % 4;
  const pata = (extra) => `class Pata
{
  constructor(x, z, alto)
  {
    this.malla = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, alto, 24),
      material
    );
    ${extra.cons}
    scene.add(this.malla);
  }
}

const pata1 = new Pata(-3, -1, 2);
${extra.uso}`;
  const bola = `class Bola
{
  constructor(color, x, z)
  {
    this.malla = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 48, 48),
      new THREE.MeshStandardMaterial({ color: color })
    );
    this.malla.position.set(x, 2.5, z);
    scene.add(this.malla);
  }
}

const blanca = new Bola(0xffffff, -2, 0);
blanca.x = 1;`;
  const VAR = [
    { id: 'sinnew', code: pata({ cons: 'this.malla.position.set(x, alto / 2, z);', uso: 'const pata2 = Pata(3, -1, 2);' }),
      sale: "Uncaught TypeError: Class constructor Pata cannot be invoked without 'new'", esperado: "Class constructor Pata cannot be invoked without 'new'",
      falla: 'La línea <code>const pata2 = Pata(3, -1, 2);</code>: falta <code>new</code>. Una clase no se puede llamar como una función.' },
    { id: 'sinthis', code: pata({ cons: 'malla.position.set(x, alto / 2, z);', uso: 'const pata2 = new Pata(3, -1, 2);' }),
      sale: 'Uncaught ReferenceError: malla is not defined', esperado: 'malla is not defined',
      falla: 'En el constructor, <code>malla.position.set(...)</code> debe ser <code>this.malla.position.set(...)</code>: la malla se guardó en <code>this</code>.' },
    { id: 'typo', code: pata({ cons: 'this.malla.position.set(x, alto / 2, z);', uso: 'pata1.mala.position.y = 4;' }),
      sale: "Uncaught TypeError: Cannot read properties of undefined (reading 'position')", esperado: "Cannot read properties of undefined (reading 'position')",
      falla: 'La línea <code>pata1.mala.position.y = 4;</code>: <code>mala</code> está mal escrito, la propiedad se llama <code>malla</code>.' },
    { id: 'silencio', code: bola, sale: null, esperado: null,
      falla: 'La línea <code>blanca.x = 1;</code>: <code>blanca</code> es un objeto <code>Bola</code>, no una malla; la posición está en <code>blanca.malla.position.x</code>. JavaScript no da error porque simplemente crea una propiedad <code>x</code> nueva en el objeto.' },
  ][idx];
  const prefijo = 'const material = new THREE.MeshStandardMaterial({ color: 0x888888 });\n';
  const idj = `${v.id}|4.3|err`;
  return {
    num: '4.3', pts: 3,
    jobs: [{ id: idj, tipo: 'error', w: 10, h: 10, cam: { pos: [0, 0, 5], look: [0, 0, 0] }, code: prefijo + VAR.code }],
    checks: [{ id: idj, tipo: 'mensaje', esperado: VAR.esperado, nota: '4.3 mensaje de consola' }],
    alumno() {
      const consola = VAR.sale
        ? `<div class="consola"><span class="x">&#10006;</span> ${esc(VAR.sale)}</div>`
        : `<div class="consola ok">La consola está vacía (no hay errores), pero la bola blanca <b>no se mueve a x = 1</b>.</div>`;
      return `<p>Este código no hace lo que se espera. En la consola del navegador aparece:</p>${consola}${pre(VAR.code)}
      <p>a) ¿Cuál es la línea con el problema? ${lineaResp('', 330)}</p><p>b) ¿Cómo se corrige? ${lineaResp('', 360)}</p>`;
    },
    clave() { return `<p>${VAR.falla}</p><p class="rub">Puntaje: a) 1,5, b) 1,5.</p>`; },
  };
}

// =================================================================== PARTE 5: leer clases
function item51(v) {
  const P = [
    { r: 0.2, patas: [[-3, -1, 2], [3, -1, 3], [3, 1, 2]], mod: 1, val: 5 },
    { r: 0.25, patas: [[-4, -2, 2], [4, -2, 2], [-4, 2, 3]], mod: 2, val: 6 },
    { r: 0.3, patas: [[-2, -1, 4], [2, -1, 2], [2, 1, 3]], mod: 0, val: 1 },
    { r: 0.15, patas: [[-3, -2, 2], [0, -2, 5], [3, -2, 2]], mod: 1, val: 0 },
  ][v.idx];
  const codigo = `class Pata
{
  constructor(x, z, alto)
  {
    this.malla = new THREE.Mesh(
      new THREE.CylinderGeometry(${P.r}, ${P.r}, alto, 24),
      material
    );
    this.malla.position.set(x, alto / 2, z);
    scene.add(this.malla);
  }
}

${P.patas.map((p, i) => `const pata${i + 1} = new Pata(${p.join(', ')});`).join('\n')}
pata${P.mod + 1}.malla.position.y = ${P.val};`;
  const otra = (P.mod + 1) % 3;
  const ys = P.patas.map(p => num(p[2] / 2));
  return {
    num: '5.1', pts: 7, jobs: [], checks: [],
    alumno() {
      return `${pre(codigo)}
      <p>a) ¿Cuántos cilindros (patas) hay en la escena al terminar? ${lineaResp('', 60)}</p>
      <p>b) Valor de <code>position.y</code> de cada pata <b>justo cuando se crea</b>:
        pata1 ${lineaResp('', 50)} pata2 ${lineaResp('', 50)} pata3 ${lineaResp('', 50)}</p>
      <p>c) Después de la última línea: <code>pata${P.mod + 1}.malla.position.y</code> = ${lineaResp('', 50)} y <code>pata${otra + 1}.malla.position.y</code> = ${lineaResp('', 50)}</p>
      <p>d) Si dentro de la clase cambian el radio ${P.r} por 0.5, ¿cuántas patas cambian de grosor? ¿Por qué? ${lineaResp('', 300)}</p>`;
    },
    clave() {
      return `<p>a) <b>3</b>. b) <b>${ys.join(', ')}</b> (alto / 2). c) pata${P.mod + 1} = <b>${P.val}</b>; pata${otra + 1} = <b>${ys[otra]}</b> (no cambió: cada pata es su propio objeto). d) <b>Las 3</b>: todas se fabrican con el mismo código de la clase.</p>
      <p class="rub">Puntaje: a) 1; b) 3 (1 cada una); c) 2 (1 cada una); d) 1 (la cantidad 0,5 + la razón 0,5).</p>`;
    },
  };
}

function item52(v) {
  const P = [
    { aP: 2.3, r: 0.2, b: [-2, 0], ro: [1, 0.5],
      pasos: [['blanca.ponerEn(0, 1);', S => { S.b = [0, 1]; }], ['roja.correr(3);', S => { S.ro[0] += 3; }], ['roja.ponerEn(blanca.malla.position.x, 2);', S => { S.ro = [S.b[0], 2]; }]], inter: 1 },
    { aP: 2.5, r: 0.25, b: [-3, 0], ro: [2, -1],
      pasos: [['blanca.ponerEn(1, 0);', S => { S.b = [1, 0]; }], ['roja.correr(-4);', S => { S.ro[0] -= 4; }], ['roja.ponerEn(blanca.malla.position.x, 1);', S => { S.ro = [S.b[0], 1]; }]], inter: 1 },
    { aP: 2.8, r: 0.3, b: [0, 0], ro: [3, 1],
      pasos: [['roja.correr(-2);', S => { S.ro[0] -= 2; }], ['blanca.ponerEn(roja.malla.position.x, 2);', S => { S.b = [S.ro[0], 2]; }], ['roja.correr(blanca.malla.position.z);', S => { S.ro[0] += S.b[1]; }]], inter: 0 },
    { aP: 3, r: 0.4, b: [-1, 1], ro: [2, 2],
      pasos: [['blanca.correr(4);', S => { S.b[0] += 4; }], ['roja.ponerEn(blanca.malla.position.x, 0);', S => { S.ro = [S.b[0], 0]; }], ['blanca.ponerEn(-1, roja.malla.position.z);', S => { S.b = [-1, S.ro[1]]; }]], inter: 0 },
  ][v.idx];
  const S = { b: P.b.slice(), ro: P.ro.slice() };
  let interX = null;
  P.pasos.forEach((p, i) => { p[1](S); if (i === P.inter) { interX = P.pasos[i][0].startsWith('roja') ? S.ro[0] : S.b[0]; } });
  const quien = P.pasos[P.inter][0].startsWith('roja') ? 'roja' : 'blanca';
  const y = num(P.aP + P.r);
  const codigo = `const alturaPano = ${P.aP};
const radioBola = ${P.r};

class Bola
{
  constructor(color, x, z)
  {
    this.malla = new THREE.Mesh(
      new THREE.SphereGeometry(radioBola, 48, 48),
      new THREE.MeshPhysicalMaterial({ color: color })
    );
    this.malla.position.set(x, alturaPano + radioBola, z);
    scene.add(this.malla);
  }

  ponerEn(x, z)
  {
    this.malla.position.x = x;
    this.malla.position.z = z;
  }

  correr(dx)
  {
    this.malla.position.x = this.malla.position.x + dx;
  }
}

const blanca = new Bola(0xffffff, ${P.b.join(', ')});
const roja = new Bola(0xd62828, ${P.ro.join(', ')});

${P.pasos.map(p => p[0]).join('\n')}`;
  return {
    num: '5.2', pts: 6, jobs: [], checks: [],
    alumno() {
      return `<div class="fila"><div class="col-codigo-ancho">${pre(codigo)}</div><div class="col-preg">
      <p>Al ejecutarse el código:</p>
      <p>a) <code>${quien}.malla.position.x</code> justo después de <code>${P.pasos[P.inter][0].replace(';', '')}</code>:<br>${lineaResp('', 70)}</p>
      <p>b) Al terminar, la bola <b>blanca</b> está en<br>x = ${lineaResp('', 45)} z = ${lineaResp('', 45)}</p>
      <p>c) Al terminar, la bola <b>roja</b> está en<br>x = ${lineaResp('', 45)} z = ${lineaResp('', 45)}</p>
      <p>d) <code>blanca.malla.position.y</code> al terminar: ${lineaResp('', 55)}</p></div></div>`;
    },
    clave() {
      return `<p>a) <b>${num(interX)}</b>. b) blanca: x = <b>${num(S.b[0])}</b>, z = <b>${num(S.b[1])}</b>. c) roja: x = <b>${num(S.ro[0])}</b>, z = <b>${num(S.ro[1])}</b>. d) <b>${y}</b> (alturaPano + radioBola; ponerEn y correr no tocan la y).</p>
      <p class="rub">Puntaje: a) 1; b) 2 (1 cada valor); c) 2 (1 cada valor); d) 1.</p>`;
    },
  };
}

// =================================================================== armado de cada versión
const PARTES = [
  { n: 1, titulo: 'De la figura al código', pts: 9, tiempo: 9, texto: '', items: [item11, item12, item13] },
  { n: 2, titulo: 'Del código a los números', pts: 9, tiempo: 10, texto: 'Calculen a mano. Pueden usar el reverso para operar.', items: [item21, item22, item23] },
  { n: 3, titulo: 'Completar el código', pts: 10, tiempo: 8, texto: 'Se califica que se entienda qué va en cada hueco; una letra de más o de menos no quita puntos.', items: [item31, item32] },
  { n: 4, titulo: 'Encontrar el error', pts: 9, tiempo: 9, texto: 'En cada caso hay un solo problema.', items: [item41, item42, item43] },
  { n: 5, titulo: 'Leer clases', pts: 13, tiempo: 9, texto: 'Sigan el código línea por línea.', items: [item51, item52] },
];

function construirVersion(v) {
  const partes = PARTES.map(p => ({ ...p, items: p.items.map(f => f(v)) }));
  partes.forEach(p => {
    const suma = p.items.reduce((b, i) => b + i.pts, 0);
    if (suma !== p.pts) { throw new Error(`La parte ${p.n} de ${v.id} dice ${p.pts} puntos pero sus preguntas suman ${suma}.`); }
  });
  const total = partes.reduce((a, p) => a + p.items.reduce((b, i) => b + i.pts, 0), 0);
  if (total !== 50) { throw new Error(`La versión ${v.id} suma ${total} puntos y deben ser 50.`); }
  return { v, partes, total };
}

// =================================================================== HTML
const CSS = `
@page { size: letter; margin: 10mm 13mm 14mm 13mm; @bottom-center { content: "PIE · página " counter(page) " de " counter(pages); font: 8pt "Segoe UI", Arial, sans-serif; color: #666; } }
* { box-sizing: border-box; }
body { font: 10pt/1.38 "Segoe UI", Arial, sans-serif; color: #111; margin: 0; }
h1 { font-size: 17pt; margin: 0; } h2 { font-size: 11.5pt; margin: 10px 0 3px; background: #111; color: #fff; padding: 3px 8px; border-radius: 3px; break-after: avoid; }
h2 .pt { float: right; font-weight: 400; font-size: 9.5pt; }
.encabezado { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 2px solid #111; padding-bottom: 4px; margin-bottom: 5px; }
.version { font-size: 22pt; font-weight: 800; border: 2.5px solid #111; border-radius: 6px; padding: 1px 12px 0; line-height: 1.1; text-align: center; } .version small { display: block; font-size: 8pt; font-weight: 600; letter-spacing: .5px; }
.datos { display: flex; gap: 18px; margin: 8px 0 6px; } .datos div { flex: 1; border-bottom: 1.5px solid #111; padding-bottom: 1px; font-size: 9.5pt; }
.reglas { background: #f2f2f2; border-left: 4px solid #111; padding: 5px 10px; font-size: 9.2pt; margin: 6px 0; } .reglas ul { margin: 2px 0 0 14px; padding: 0; }
.fila2 { display: flex; gap: 10px; align-items: flex-start; } .fila2 .reglas { flex: 1; margin: 0; }
table.cal { border-collapse: collapse; font-size: 8.5pt; } table.cal td, table.cal th { border: 1px solid #111; padding: 2px 5px; text-align: center; min-width: 26px; } table.cal th { background: #eee; }
.item { break-inside: avoid; margin: 5px 0 9px; } .item > .num { font-weight: 800; }
.item .titulo { display: flex; gap: 6px; align-items: baseline; margin-bottom: 2px; } .pts { font-weight: 400; color: #444; font-size: 9pt; }
p { margin: 3px 0; } code { font: 9pt Consolas, "Courier New", monospace; background: #eee; padding: 0 3px; border-radius: 2px; }
pre.codigo { font: 8.3pt/1.28 Consolas, "Courier New", monospace; background: #f6f6f6; border: 1px solid #bbb; border-radius: 4px; padding: 4px 7px; margin: 3px 0; white-space: pre-wrap; }
pre .com { color: #666; } .hueco { display: inline-block; min-width: 95px; border-bottom: 1.5px solid #111; height: 1em; vertical-align: baseline; }
.campo { white-space: nowrap; } .campo .hueco { margin-left: 3px; }
.resp { background: #fff3a8; font-weight: 700; padding: 0 2px; border-radius: 2px; }
.fila { display: flex; gap: 10px; align-items: flex-start; } .col-codigo { flex: 0 0 58%; } .col-fig { flex: 1; } .col-codigo-ancho { flex: 0 0 56%; } .col-preg { flex: 1; } .fila > div { min-width: 0; }
img.fig { width: 100%; border: 1px solid #999; border-radius: 3px; display: block; }
.opciones { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 10px; margin-top: 4px; } .opcion { position: relative; padding-left: 24px; } .opcion .letra { position: absolute; left: 0; top: 4px; width: 19px; height: 19px; border: 2px solid #111; border-radius: 50%; text-align: center; font-weight: 800; font-size: 9pt; line-height: 15px; }
table.tabla { border-collapse: collapse; } table.tabla th, table.tabla td { border: 1px solid #111; padding: 2px 10px; min-width: 88px; height: 19px; text-align: center; font-size: 9pt; } table.tabla th { background: #eee; }
.nota { font-size: 8.5pt; color: #555; } .nota-parte { break-after: avoid; }
.consola { background: #fff1f0; border: 1px solid #d99; border-radius: 4px; padding: 4px 8px; font: 9pt Consolas, monospace; color: #7a0000; margin: 3px 0; } .consola.ok { background: #f0f7ff; border-color: #9bc; color: #123; font-family: "Segoe UI", Arial; } .consola .x { color: #c00; }
.esquema { width: 100%; height: auto; display: block; }
ul.chico { margin: 2px 0 0 16px; padding: 0; font-size: 9pt; } .rub { font-size: 8.8pt; color: #333; background: #f1f1f1; padding: 2px 6px; border-radius: 3px; }
.clave-bloque { border: 1px solid #aaa; border-radius: 4px; padding: 3px 9px; margin: 3px 0 7px; background: #fafafa; break-inside: avoid; display: flow-root; } .clave-bloque img { width: 34%; float: right; margin: 0 0 4px 8px; border: 1px solid #999; }
.clave-v { break-before: page; } .clave-v:first-of-type { break-before: auto; }
`;

function alumnoHtml(ver, res) {
  const { v, partes } = ver;
  const etiqueta = `versión ${v.n}`;
  const cuerpo = partes.map(p => `<h2>Parte ${p.n}. ${esc(p.titulo)} <span class="pt">${p.pts} puntos</span></h2>${p.texto ? `<p class="nota nota-parte">${esc(p.texto)}</p>` : ''}` + p.items.map(it => `<div class="item"><div class="titulo"><span class="num">${it.num}</span><span class="pts">(${num(it.pts)} puntos)</span></div>${it.alumno(res)}</div>`).join('')).join('');
  // la hoja del alumno va sin pie de página
  const css = CSS.replace(/@bottom-center \{[^}]*\}/, '').replace('margin: 10mm 13mm 14mm 13mm', 'margin: 10mm 13mm 11mm 13mm');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Parcial ${etiqueta}</title><style>${css}</style></head><body>
  <div class="encabezado"><div><h1>Parcial · Programación Web</h1></div><div class="version"><small>PARCIAL</small>${v.n}</div></div>
  <div class="datos"><div>Nombre:</div><div style="flex:.5">Grupo:</div><div style="flex:.5">Fecha:</div></div>
  <div class="fila2"><div class="reglas"><b>Reglas.</b> Sin computador, sin celular y sin apuntes. Todo el parcial sale de lo que hicimos en la sala de billar. Se califica la lógica: una letra de más en un nombre no quita puntos.</div>
  <table class="cal"><tr><th>Parte</th>${partes.map(p => `<th>${p.n}</th>`).join('')}<th>Total</th></tr><tr><th>Puntos</th>${partes.map(p => `<td>/${p.pts}</td>`).join('')}<td>/50</td></tr><tr><th>Obtenidos</th>${partes.map(() => '<td>&nbsp;</td>').join('')}<td>&nbsp;</td></tr></table></div>
  ${cuerpo}</body></html>`;
}

function claveVersionHtml(ver, res) {
  const { v, partes } = ver;
  const bloques = partes.map(p => `<h2>Parte ${p.n}. ${esc(p.titulo)} <span class="pt">${p.pts} puntos</span></h2>` + p.items.map(it => `<div class="clave-bloque"><b>${it.num}</b> <span class="pts">(${num(it.pts)} puntos)</span>${it.fig ? `<img src="${res.uri(it.fig)}">` : ''}${it.clave(res)}</div>`).join('')).join('');
  return `<section class="clave-v"><div class="encabezado"><div><h1>Clave · parcial ${v.n}</h1><div>Nota = puntos ÷ 10 (50 puntos = 5,0)</div></div><div class="version"><small>PARCIAL</small>${v.n}</div></div>${bloques}</section>`;
}

function portadaClaveHtml() {
  const filas = PARTES.map(p => `<tr><td>${p.n}</td><td style="text-align:left">${esc(p.titulo)}</td><td>${p.pts}</td><td>${p.tiempo} min</td></tr>`).join('');
  const total = PARTES.reduce((a, p) => a + p.tiempo, 0);
  return `<section><div class="encabezado"><div><h1>Parcial de Programación Web · Clave del profe</h1><div>Corte 2 · Sala de billar en Three.js · 4 versiones</div></div></div>
  <div class="reglas"><b>No repartir este archivo.</b> Imprimir solo la carpeta <code>para-imprimir</code>. Cada versión tiene las mismas 5 partes y 50 puntos, con otros números, otras opciones y otros errores.</div>
  <h2>Cómo se reparte</h2><ul>
    <li>Hay 4 versiones numeradas 1 a 4, con otros números, otras opciones y otros errores. Repartirlas al azar: así el vecino casi nunca tiene la misma. Si se usan las 4 el martes y otra vez el miércoles, el grupo del miércoles podría enterarse de los tipos de pregunta; para evitarlo, el martes se pueden usar la 1 y la 2 y el miércoles la 3 y la 4.</li>
    <li>Sin computador ni celular (el parcial se hace a mano, así no hay IA). La <code>hoja-de-referencia.pdf</code> es opcional: solo trae nombres de clases y propiedades, sin explicar para qué sirven.</li>
    <li>Nota = puntos ÷ 10. En la hoja de cada estudiante hay una tablita arriba para ir anotando los puntos por parte.</li>
  </ul>
  <h2>Partes y tiempo estimado</h2><table class="cal" style="width:70%"><tr><th>Parte</th><th>Tema</th><th>Puntos</th><th>Tiempo</th></tr>${filas}<tr><th></th><th>Total</th><th>50</th><th>${total} min</th></tr></table>
  <p class="nota">El tiempo es para un estudiante que sí estudió; conviene dar unos 60 minutos.</p>
  <h2>Criterios de calificación</h2><ul>
    <li>Se califica la lógica, no la ortografía del código: <code>shadowmap</code> en vez de <code>shadowMap</code> vale si se entiende.</li>
    <li>Preguntas de elegir letra: correcta o incorrecta. En las demás, el puntaje de cada respuesta está en el cuadro gris de cada pregunta.</li>
    <li>Cada figura de las partes 1 y 4 se generó con Three.js real y se comprobó por píxeles: la opción correcta produce exactamente esa imagen y cada distractor produce una distinta. Los mensajes de consola de la 4.3 son los reales del navegador.</li>
    <li>Qué prueba cada parte: 1 y 4 (entender qué hace cada propiedad), 2 (matemática del billar: alturas, repeat, ángulos), 3 y 5 (clases: <code>this</code>, <code>new</code>, constructor, métodos).</li>
  </ul></section>`;
}

function hojaReferenciaHtml() {
  const bloque = (t, items) => `<div class="blq"><h3>${t}</h3><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
  const css = CSS.replace('PIE', 'Programación Web · Hoja de referencia') + `
  h3 { margin: 0 0 3px; font-size: 10.5pt; border-bottom: 1.5px solid #111; } .blq { break-inside: avoid; margin-bottom: 9px; } .blq ul { margin: 0; padding-left: 15px; font: 9pt/1.5 Consolas, "Courier New", monospace; } .dos { column-count: 2; column-gap: 22px; }`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Hoja de referencia</title><style>${css}</style></head><body>
  <div class="encabezado"><div><h1>Hoja de referencia · Three.js</h1><div>Solo nombres: no dice para qué sirve cada cosa.</div></div></div>
  <div class="dos">
  ${bloque('Escena y objetos', ['new THREE.Scene()', 'scene.add(objeto)', 'scene.background', 'new THREE.Mesh(geometria, material)', 'objeto.position.set(x, y, z)', 'objeto.position.x / .y / .z', 'objeto.rotation.x / .y / .z', 'objeto.scale.set(x, y, z)'])}
  ${bloque('Geometrías', ['BoxGeometry(ancho, alto, fondo)', 'PlaneGeometry(ancho, alto)', 'SphereGeometry(radio, segmentosAncho, segmentosAlto)', 'CylinderGeometry(radioArriba, radioAbajo, alto, segmentos)', 'ConeGeometry(radio, alto, segmentos)', 'TorusGeometry(radio, tubo, ...)'])}
  ${bloque('Materiales', ['MeshBasicMaterial', 'MeshStandardMaterial', 'MeshPhysicalMaterial', 'color  roughness  metalness', 'clearcoat  clearcoatRoughness', 'transparent  opacity  wireframe  side', 'map', 'roughnessMap  metalnessMap', 'normalMap  bumpMap  bumpScale', 'aoMap', 'displacementMap  displacementScale'])}
  ${bloque('Texturas', ['new THREE.TextureLoader()', 'cargador.load("ruta.jpg")', 'textura.wrapS  textura.wrapT', 'THREE.RepeatWrapping', 'textura.repeat.set(x, y)', 'textura.center.set(x, y)', 'textura.rotation', 'textura.anisotropy', 'textura.colorSpace', 'THREE.SRGBColorSpace'])}
  ${bloque('Luces', ['AmbientLight(color, intensidad)', 'DirectionalLight(color, intensidad)', 'PointLight(color, intensidad)', 'SpotLight(color, intensidad)', '  luz.angle  luz.penumbra  luz.target', 'HemisphereLight(colorCielo, colorSuelo, intensidad)', 'luz.position.set(x, y, z)'])}
  ${bloque('Sombras', ['renderer.shadowMap.enabled', 'luz.castShadow', 'objeto.castShadow', 'objeto.receiveShadow', 'luz.shadow.mapSize.set(a, b)', 'luz.shadow.bias'])}
  ${bloque('Números', ['Math.PI', 'Math.PI / 2', '-Math.PI / 2', 'Math.PI * 2'])}
  </div></body></html>`;
}

// =================================================================== principal
(async () => {
  const versiones = VERSIONES.map(construirVersion);
  const jobs = [], checks = [];
  versiones.forEach(ver => ver.partes.forEach(p => p.items.forEach(it => { jobs.push(...it.jobs); checks.push(...it.checks); })));
  console.log(`Renderizando ${jobs.length} escenas...`);
  const resultados = await renderJobs(jobs, path.join(TMP, 'render'));

  // comprobaciones
  const fallos = [];
  for (const j of jobs) { if (resultados[j.id].fallo) { fallos.push(`${j.id}: falló el render (${resultados[j.id].fallo})`); } }
  for (const c of checks) {
    const r = resultados[c.id];
    if (c.tipo === 'igual' && !(r.distintos < 0.0005)) { fallos.push(`${c.id} ${c.nota}: la opción correcta NO produce la figura (distintos ${(r.distintos * 100).toFixed(2)}%)`); }
    if (c.tipo === 'distinto' && !(r.distintos > 0.004)) { fallos.push(`${c.id} ${c.nota}: este distractor se ve igual que la figura (distintos ${(r.distintos * 100).toFixed(2)}%)`); }
    if (c.tipo === 'mensaje' && r.mensaje !== c.esperado) { fallos.push(`${c.id} ${c.nota}: mensaje real "${r.mensaje}" distinto del esperado "${c.esperado}"`); }
  }
  if (fallos.length) { console.error('PROBLEMAS EN LAS COMPROBACIONES:\n' + fallos.join('\n')); process.exit(1); }
  console.log(`Comprobaciones correctas: ${checks.length}.`);

  const figs = path.join(TMP, 'figs');
  fs.mkdirSync(figs, { recursive: true });
  const uris = {};
  for (const j of jobs) {
    const r = resultados[j.id];
    if (r.png) { fs.writeFileSync(path.join(figs, j.id.replace(/\|/g, '_') + '.png'), Buffer.from(r.png, 'base64')); uris[j.id] = 'data:image/png;base64,' + r.png; }
  }
  const res = { uri: id => uris[id] };
  if (process.env.SOLO_VERIFICAR) { console.log('Figuras en', figs); return; }

  const aluDir = path.join(SALIDA, 'para-imprimir');
  fs.mkdirSync(aluDir, { recursive: true });
  const htmlDir = path.join(TMP, 'html');
  fs.mkdirSync(htmlDir, { recursive: true });
  const imprimir = (html, nombre, destino) => {
    const f = path.join(htmlDir, nombre + '.html');
    fs.writeFileSync(f, html);
    // Edge a veces no escribe el PDF y no avisa: se comprueba que el archivo quedó recién escrito y se reintenta una vez
    for (let intento = 1; intento <= 2; intento++) {
      const t0 = Date.now() - 1000;
      edge(['--no-pdf-header-footer', `--print-to-pdf=${destino}`, aUrl(f)]);
      if (fs.existsSync(destino) && fs.statSync(destino).mtimeMs >= t0) { break; }
      if (intento === 2) { throw new Error(`Edge no escribió ${destino}`); }
    }
    console.log('PDF:', destino);
  };
  versiones.forEach(ver => imprimir(alumnoHtml(ver, res), 'parcial-' + ver.v.id, path.join(aluDir, `parcial-${ver.v.id}.pdf`)));
  const cssClave = CSS.replace('PIE', 'Clave del profe · NO repartir');
  const claveHtml = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Clave del profe</title><style>${cssClave}</style></head><body>${portadaClaveHtml()}${versiones.map(ver => claveVersionHtml(ver, res)).join('')}</body></html>`;
  imprimir(claveHtml, 'clave-del-profe', path.join(SALIDA, 'clave-del-profe.pdf'));
  imprimir(hojaReferenciaHtml(), 'hoja-de-referencia', path.join(aluDir, 'hoja-de-referencia.pdf'));
})().catch(e => { console.error(e); process.exit(1); });
