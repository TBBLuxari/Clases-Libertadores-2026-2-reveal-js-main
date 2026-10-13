// Guía en PDF del carrito, versión de UN transistor. Cada mini paso de la protoboard es un paso aparte (sin 2a, 2b...).
// Uso: node docs/gen-guia-1t.js        (genera los SVG, el HTML y el PDF en version-1-un-transistor/)
// Solo lleva esquemas eléctricos y las fotos del profesor (carpeta Material); NO lleva las protoboards interactivas.
const G = require('./gen-esquemas-carrito.js');
const { fs, path, render, flag, gnd, ledDown, photod, outNet, npn, IMG, GREY, RED, BLUE, GRN } = G;
const { execFileSync } = require('child_process');

// Carpeta de OneDrive con los videos del profesor (CarritoV1); cada paso nombra su archivo
const VIDEOS = 'https://fundacionlibertadores-my.sharepoint.com/:f:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fjjardilag%5Flibertadores%5Fedu%5Fco%2FDocuments%2FMATERIAS%2F2026%2D2%2FSistemas%20F%C3%ADsicos%20Hipermedia%2FCarritoV1&share=cgr78LERSPqWSbE28DFdxWCAEgUCbuaQzAWRvy4YjbijJ%5F%2D50g';
// Enlaces directos por video (archivo de Material -> enlace de OneDrive); si no hay, se usa la carpeta
const VIDEO_LINKS = {
  'Paso9.mp4': 'https://fundacionlibertadores-my.sharepoint.com/:v:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/stream.aspx?id=%2Fpersonal%2Fjjardilag_libertadores_edu_co%2FDocuments%2FMATERIAS%2F2026-2%2FSistemas%20F%C3%ADsicos%20Hipermedia%2FCarritoV1%2FPaso9.mp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&share=cQpqJNpGvORnQLMcV---M-mWEgUCFqtzA8s1o3bpHgkQH5Rnvg',
  'Paso10.mp4': 'https://fundacionlibertadores-my.sharepoint.com/:v:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/stream.aspx?id=%2Fpersonal%2Fjjardilag_libertadores_edu_co%2FDocuments%2FMATERIAS%2F2026-2%2FSistemas%20F%C3%ADsicos%20Hipermedia%2FCarritoV1%2FPaso10.mp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&share=cQqtGIpcMWXgTpEoUVfLnef_EgUCYLsarZZHrPJfbm0rT-2E-A',
  'Paso7.mp4': 'https://fundacionlibertadores-my.sharepoint.com/:v:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/stream.aspx?id=%2Fpersonal%2Fjjardilag_libertadores_edu_co%2FDocuments%2FMATERIAS%2F2026-2%2FSistemas%20F%C3%ADsicos%20Hipermedia%2FCarritoV1%2FPaso7.mp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&share=cQqLHGs4DHTyRJrEY252en2mEgUCd98rMitY1eCe1398NpzZfg',
  'Paso8.mp4': 'https://fundacionlibertadores-my.sharepoint.com/:v:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/stream.aspx?id=%2Fpersonal%2Fjjardilag_libertadores_edu_co%2FDocuments%2FMATERIAS%2F2026-2%2FSistemas%20F%C3%ADsicos%20Hipermedia%2FCarritoV1%2FPaso8.mp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&share=cQrVlbtTsm7lS68PRyv_edlPEgUCINXjNy4yZqJBfd4wm8Y-hQ',
  'Paso6.mp4': 'https://fundacionlibertadores-my.sharepoint.com/:v:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/stream.aspx?id=%2Fpersonal%2Fjjardilag_libertadores_edu_co%2FDocuments%2FMATERIAS%2F2026-2%2FSistemas%20F%C3%ADsicos%20Hipermedia%2FCarritoV1%2FPaso6.mp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&share=cQrcyshVlyjsQ7WjuB2YeATXEgUCt_7yNVLWOcF8ddRDRY6hhQ',
  'Paso2E3.mp4': 'https://fundacionlibertadores-my.sharepoint.com/:v:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/stream.aspx?id=%2Fpersonal%2Fjjardilag_libertadores_edu_co%2FDocuments%2FMATERIAS%2F2026-2%2FSistemas%20F%C3%ADsicos%20Hipermedia%2FCarritoV1%2FPaso2E3.mp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&share=cQrErOsl0szkSYtC16pNrvZcEgUCMbfLwHEALW6-4Ge5hzFJtA',
  'Paso5_2.mp4': 'https://fundacionlibertadores-my.sharepoint.com/:v:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/stream.aspx?id=%2Fpersonal%2Fjjardilag_libertadores_edu_co%2FDocuments%2FMATERIAS%2F2026-2%2FSistemas%20F%C3%ADsicos%20Hipermedia%2FCarritoV1%2FPaso5_2.mp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&share=cQomEkrKTauUTJyB5V5fr93kEgUCXunWn7WwrNHodqzGUVbX4A',
  'Paso4a2.mp4': 'https://fundacionlibertadores-my.sharepoint.com/:v:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/stream.aspx?id=%2Fpersonal%2Fjjardilag_libertadores_edu_co%2FDocuments%2FMATERIAS%2F2026-2%2FSistemas%20F%C3%ADsicos%20Hipermedia%2FCarritoV1%2FPaso4a2.mp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&share=cQoIqkAP4Al4S6_MH4xgpGBiEgUCT_cS0y2R6YRkV5SjTy_YzA',
};
const PASO_VIDEO = { 'Paso2E3.mp4': 6, 'Paso4a2.mp4': 8, 'Paso5_2.mp4': 9, 'Paso6.mp4': 15, 'Paso7.mp4': 18, 'Paso8.mp4': 20, 'Paso9.mp4': 22, 'Paso10.mp4': 23 };
const video = (archivo, txt) => `<div class="box photo keep"><span class="t">Video de muestra: así debería quedar</span><p>${txt}</p><p class="small">${VIDEO_LINKS[archivo] ? `<a href="${VIDEO_LINKS[archivo]}">Ver el video del paso ${PASO_VIDEO[archivo]}</a> (en OneDrive).` : `Ver el video del paso ${PASO_VIDEO[archivo]}: <a href="${VIDEOS}">abrir la carpeta de videos en OneDrive</a>.`}</p></div>`;
const OUT = path.join(IMG, 'guia-carrito-1t');
fs.mkdirSync(OUT, { recursive: true });
const APOYO = path.join(__dirname, '..', 'materias', 'sistemas-hipermedia', 'apoyo');
const DIR = path.join(APOYO, 'version-1-un-transistor');
const HTML = path.join(DIR, 'carrito-guia.html');
const PDF = process.env.PDF_OUT ? path.resolve(process.env.PDF_OUT) : path.join(DIR, 'carrito-guia.pdf');

// ---- esquemas
const emisor = c => {
  const f = c.L;
  f.text(150, 104, 'EMISOR', { fs: 12, b: 1, c: GREY, a: 'middle' });
  flag(f, 150, 125, '+6V');
  f.line(150, 125, 150, 160);
  f.rect(138, 160, 24, 50);
  f.line(150, 210, 150, 250);
  ledDown(f, 150, 250, false);
  f.line(150, 278, 150, 330);
  gnd(f, 150, 330);
  f.text(134, 182, 'R1', { b: 1, a: 'end' });
  f.text(134, 199, '220 Ω', { a: 'end' });
  f.text(134, 258, 'LED IR', { b: 1, a: 'end' });
  f.text(134, 274, '(transparente)', { a: 'end' });
  f.text(134, 306, '+ pata larga ↑', { fs: 12, b: 1, c: RED, a: 'end' });
  f.text(134, 321, '− pata corta ↓', { fs: 12, b: 1, c: BLUE, a: 'end' });
  f.text(180, 268, '← medir aquí: ≈ 1,2 V', { fs: 13, b: 1, c: '#0f6fd6' });
  f.text(180, 286, 'entre las dos patas', { fs: 12, c: GREY });
};
const receptor = (c, medir = true) => {
  const f = c.L;
  f.text(330, 104, 'RECEPTOR', { fs: 12, b: 1, c: GREY, a: 'middle' });
  flag(f, 330, 125, '+6V');
  f.line(330, 125, 330, 170);
  photod(f, 330, 170);
  f.line(330, 212, 330, 270);
  f.dot(330, 270);
  f.text(352, 186, 'Receptor IR', { b: 1 });
  f.text(352, 203, '(oscuro)');
  f.text(352, 236, 'pata CORTA ↑ a +6V', { fs: 12, b: 1, c: RED });
  f.text(352, 251, 'pata LARGA ↓ a N', { fs: 12, b: 1, c: BLUE });
  f.line(330, 270, 330, 300);
  f.rect(318, 300, 24, 50);
  f.line(330, 350, 330, 385);
  gnd(f, 330, 385);
  f.text(352, 322, 'R3', { b: 1 });
  f.text(352, 339, '1 kΩ');
  f.text(310, 266, 'N', { fs: 16, b: 1, a: 'end' });
  if (medir) f.text(352, 270, '← medir aquí', { fs: 12, b: 1, c: '#0f6fd6' });
};
const salida = c => {
  const f = c.L;
  f.line(570, 225, 700, 225);
  outNet(f, '', 570, 690);
  f.text(706, 230, 'S', { fs: 16, b: 1 });
  f.text(706, 250, '← medir aquí', { fs: 12, b: 1, c: '#0f6fd6' });
  f.text(706, 266, '≈ 5,4 V con el LED apagado', { fs: 11.5, c: GREY });
};
const transistor = c => {
  const f = c.L;
  f.line(570, 225, 700, 225);
  outNet(f, '', 570, 690);
  f.text(706, 230, 'S', { fs: 16, b: 1 });
  f.line(604, 335, 566, 335);
  f.dot(566, 335);
  f.text(558, 340, 'B: libre por ahora', { fs: 12, b: 1, c: '#0f6fd6', a: 'end' });
  npn(f, 617, 335, 225, 400);
  f.dot(632, 225);
  gnd(f, 632, 400);
  f.text(652, 322, 'Q2', { fs: 13, b: 1 });
  f.text(652, 337, '2N2222A', { fs: 12 });
  f.text(652, 354, 'C a la salida S', { fs: 11, c: GREY });
  f.text(652, 368, 'E al negativo', { fs: 11, c: GREY });
};
fs.writeFileSync(path.join(OUT, 'paso-04-led-rojo.svg'), render({ view: [470, 75, 440, 215], mods: {}, extra: salida }), 'utf8');
fs.writeFileSync(path.join(OUT, 'paso-05-transistor.svg'), render({ view: [415, 75, 460, 375], mods: {}, extra: transistor }), 'utf8');
const sensorCompleto = c => {
  const f = c.L;
  receptor(c, false);
  f.poly([[330, 270], [560, 270], [560, 335], [604, 335]], { c: '#e67e22', w: 3.5 });
  f.dot(560, 270);
  f.text(440, 292, 'cable de N a la base', { fs: 12, b: 1, c: '#e67e22', a: 'middle' });
  f.line(570, 225, 700, 225);
  outNet(f, '', 570, 690);
  f.text(706, 230, 'S', { fs: 16, b: 1 });
  npn(f, 617, 335, 225, 400);
  f.dot(632, 225);
  gnd(f, 632, 400);
  f.text(652, 322, 'Q2', { fs: 13, b: 1 });
  f.text(652, 337, '2N2222A', { fs: 12 });
};
fs.writeFileSync(path.join(OUT, 'paso-06-sensor-completo.svg'), render({ view: [150, 75, 700, 375], mods: {}, extra: sensorCompleto }), 'utf8');
const save = (n, cfg) => fs.writeFileSync(path.join(OUT, n), render(cfg), 'utf8');
save('paso-07-l293d.svg', { view: [560, 440, 560, 420], mods: { L293: 'old', IN_L: 'old', IN_R: 'old' }, opts: { IN_L: { mode: 'gnd' }, IN_R: { mode: 'gnd' } } });
save('paso-08-motor1.svg', { view: [430, 440, 640, 420], mods: { L293: 'old', MOT1: 'old', IN_L: 'old', IN_R: 'old' }, opts: { IN_L: { mode: 'tag' }, IN_R: { mode: 'gnd' } } });
save('paso-09-motor2.svg', { view: [440, 440, 830, 420], mods: { L293: 'old', MOT1: 'old', MOT2: 'old', IN_L: 'old', IN_R: 'old' }, opts: { IN_L: { mode: 'tag' }, IN_R: { mode: 'tag', col: GRN, label: ['mismo cable del sensor', 'IZQUIERDO (provisional)'] } } });
save('paso-15-cruce.svg', { view: [440, 440, 830, 420], mods: { L293: 'old', MOT1: 'old', MOT2: 'old', IN_L: 'old', IN_R: 'old' }, opts: { IN_L: { mode: 'tag' }, IN_R: { mode: 'tag', col: BLUE } } });
save('paso-16-lm358.svg', { view: [720, 170, 270, 245], mods: { LM358: 'old' }, opts: { LM358: { partial: true } } });
save('paso-17-umbral.svg', { view: [300, 275, 540, 325], mods: { DECC_L: 'old' }, opts: {} });
save('paso-18-lm358-izq.svg', { view: [285, 70, 705, 545], mods: { SENS_L: 'old', LM358: 'old', DECC_L: 'old' }, opts: { LM358: { partial: true } } });
save('paso-19-umbral-der.svg', { view: [880, 330, 540, 310], mods: { DECC_R: 'old' }, opts: {} });
save('paso-20-lm358-der.svg', { view: [710, 115, 705, 545], mods: { SENS_R: 'old', LM358: 'old', DECC_L: 'old', DECC_R: 'old' }, opts: {} });
fs.writeFileSync(path.join(OUT, 'paso-02-emisor.svg'), render({ view: [20, 80, 420, 320], mods: {}, extra: emisor }), 'utf8');
fs.writeFileSync(path.join(OUT, 'paso-03-receptor.svg'), render({ view: [160, 80, 420, 330], mods: {}, extra: receptor }), 'utf8');

// ---- pantallazo de la protoboard de un paso (la misma imagen del HTML de ese paso, sin botones)
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
const tmp = path.join(require('os').tmpdir(), 'guia-1t-pantallazo');
fs.mkdirSync(tmp, { recursive: true });
function pantallazo(pasoHtml, outPng, ancho = 1500) {
  const svg = /<svg id="board"[^]*?<\/svg>/.exec(fs.readFileSync(pasoHtml, 'utf8'))[0].replace(/ viewBox="[^"]*"/, '');
  const wrap = (vb, extra) => `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fbfaf6"><div id="w">${svg.replace('<svg id="board"', '<svg id="board" ' + vb)}</div>${extra}</body>`;
  const pa = path.join(tmp, 'a.html'), pb = path.join(tmp, 'b.html');
  fs.writeFileSync(pa, wrap('width="' + ancho + '"', '<script>const s=document.getElementById("board"),b=s.getBBox(),m=20;document.title=[b.x-m,b.y-m,b.width+2*m,b.height+2*m].join(" ");</script>'), 'utf8');
  let dom = '';
  try { dom = execFileSync(EDGE, ['--headless=new', '--disable-gpu', '--dump-dom', 'file:///' + pa.replace(/\\/g, '/')], { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); } catch (e) { dom = (e.stdout || '').toString(); }
  const vb = /<title>([^<]*)<\/title>/.exec(dom)[1].split(' ').map(Number);
  const alto = Math.round(ancho * vb[3] / vb[2]);
  fs.writeFileSync(pb, wrap('viewBox="' + vb.join(' ') + '" width="' + ancho + '" height="' + alto + '"', ''), 'utf8');
  try { execFileSync(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=' + ancho + ',' + alto, '--screenshot=' + outPng, 'file:///' + pb.replace(/\\/g, '/')], { stdio: 'pipe' }); } catch (e) { /* ruido */ }
}
pantallazo(path.join(DIR, 'protoboard-ebc', 'paso-02d.html'), path.join(OUT, 'paso-05-protoboard.png'));
pantallazo(path.join(DIR, 'protoboard-ebc', 'paso-06e.html'), path.join(OUT, 'paso-15-protoboard.png'));
// SVG heredados: se cambia "riel" por positivo / negativo
function copiarSvg(origen, destino) {
  let t = fs.readFileSync(path.join(IMG, 'guia-carrito', origen), 'utf8');
  [['(riel rojo)', '(positivo)'], ['(riel azul)', '(negativo)'], ['→ riel ROJO', '→ POSITIVO'], ['→ riel AZUL', '→ NEGATIVO'], ['(riel ROJO)', '(positivo)'], ['al riel de +6V', 'al positivo de +6V']].forEach(([a, b]) => { t = t.split(a).join(b); });
  fs.writeFileSync(path.join(OUT, destino), t, 'utf8');
}
pantallazo(path.join(DIR, 'protoboard-ebc', 'paso-08.html'), path.join(OUT, 'paso-20-protoboard.png'));
pantallazo(path.join(DIR, 'protoboard-ebc', 'paso-09.html'), path.join(OUT, 'paso-22-protoboard.png'));
pantallazo(path.join(DIR, 'protoboard-ebc', 'paso-10.html'), path.join(OUT, 'paso-23-protoboard.png'));
copiarSvg('paso-09-condensadores.svg', 'paso-21-condensadores.svg');
copiarSvg('paso-10-pack-motores.svg', 'paso-23-pack-motores.svg');
pantallazo(path.join(APOYO, 'version-2-dos-transistores', 'protoboard-ebc', 'paso-06e.html'), path.join(OUT, 'paso-15-protoboard-2t.png'));

// ---- fotos del profesor: se giran 90° para que el tablero quede en horizontal (columna 1 a la izquierda) y se recortan al tablero
// recorte [x, y, ancho, alto] sobre la foto ya girada (1280 x 720)
const FOTOS = { 'Paso2.jpeg': [150, 100, 1130, 520], 'Paso2b.jpeg': [130, 130, 1150, 520], 'Paso2c.jpeg': [100, 130, 1140, 470], 'Paso2d.jpeg': [20, 90, 1240, 480], 'Paso2E.jpeg': [150, 200, 1000, 430], 'Paso2E2.jpeg': [20, 150, 1180, 440, false],
  'Paso3.jpeg': [60, 180, 1200, 480], 'Paso4a.jpeg': [110, 170, 1140, 470], 'Paso5.jpeg': [60, 180, 1200, 480],
  'Paso6a.jpeg': [60, 120, 1220, 540], 'Paso6b.jpeg': [180, 140, 1100, 520],
  'Paso7.jpeg': [200, 100, 1080, 520, false], 'Paso7_2.jpeg': [20, 110, 1250, 540], 'Paso8.jpeg': [130, 160, 1060, 470], 'Paso8_2.jpeg': [160, 100, 1120, 520, false],
  'Paso9_2.jpeg': [0, 440, 560, 330, 'v'], 'Paso9_3.jpeg': [100, 420, 560, 330, 'v'], 'Paso10.jpeg': [0, 430, 720, 480, 'v'], 'Paso10_2.jpeg': [60, 560, 660, 400, 'v'] };
function girarFoto(nombre) {
  const [cx, cy, cw, ch, gira = true] = FOTOS[nombre];
  const src = require('url').pathToFileURL(path.join(APOYO, 'Material', nombre)).href;
  const html = path.join(tmp, 'foto.html');
  fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><body style="margin:0;overflow:hidden"><div style="width:${cw}px;height:${ch}px;overflow:hidden;position:relative"><div style="position:absolute;left:${-cx}px;top:${-cy}px;width:1280px;height:720px"><img src="${src}" style="${gira === true ? 'position:absolute;left:280px;top:-280px;width:720px;height:1280px;transform:rotate(-90deg);transform-origin:50% 50%' : gira === 'v' ? 'width:720px;height:1280px' : 'width:1280px;height:720px'}"></div></div></body>`, 'utf8');
  const out = path.join(OUT, 'foto-' + nombre.replace(/.jpe?g$/i, '.png').toLowerCase());
  try { execFileSync(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=' + cw + ',' + ch, '--screenshot=' + out, require('url').pathToFileURL(html).href], { stdio: 'pipe' }); } catch (e) { /* ruido */ }
  return 'foto-' + path.basename(out).slice(5);
}
Object.keys(FOTOS).forEach(girarFoto);

// ---- HTML
const css = fs.readFileSync(path.join(__dirname, 'guia.css'), 'utf8');
const A = '../../../../assets/imagenes/sistemas-hipermedia/guia-carrito-1t/';
const esquema = (f, alt) => `<img class="d" style="width:100%" src="${A}${f}" alt="${alt}">`;
const foto = (f, alt) => `<img class="d" src="${A}foto-${f.replace(/.jpe?g$/i, '.png').toLowerCase()}" alt="${alt}">`;
const falla = items => `<div class="box warn keep"><span class="t">Si algo falla</span><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
const prueba = html => `<div class="box ok keep"><span class="t">Prueba</span>${html}</div>`;
const par = (e, f) => `<div class="two" style="align-items:center;grid-template-columns:.8fr 1.2fr">\n  ${e}\n  ${f}\n  </div>`;

const page = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Carrito que esquiva obstáculos: guía paso a paso (un transistor)</title>
<style>${css}
  @page{margin:9mm 12mm;}
  body{font-size:9.6pt;line-height:1.32;}
  header{text-align:center;} header h1{font-size:22pt;margin-bottom:2px;} header .eyebrow{margin-bottom:2px;}
  h3{margin:6px 0 2px;} p{margin:0 0 4px;} ul,ol{margin:0 0 4px;} li{margin-bottom:1px;}
  .box{padding:5px 9px;margin:5px 0;}
  table{margin:3px 0 5px;font-size:9pt;} th,td{padding:1.5px 6px;}
  section.paso h1{font-size:15pt;margin-bottom:1px;} .goal{font-size:10.5pt;margin:1px 0 4px;} .eyebrow{margin:0 0 2px;}
  .two{gap:10px;} .two img.d{margin:2px 0;}
  section.paso{break-before:auto;margin-top:8px;} h1,h3,.eyebrow{break-after:avoid;} .two{break-inside:avoid;}
</style></head>
<body><div class="wrap">

<header>
  <p class="eyebrow">Sistemas Físicos Hipermedia</p>
  <h1>Carrito que esquiva obstáculos</h1>
</header>

<div class="box big keep">
  <h2>Todo está calculado para 6 voltios</h2>
  <p>Los valores de las resistencias están pensados para <b>4 pilas AA en serie (aprox. 6 V)</b>. <b>No pasar de 6 V</b>: no usar la pila de 9 V ni más pilas. El chip L293D se daña si su pata 16 recibe más de 7 V, y los LED reciben más corriente de la que aguantan.</p>
</div>

<h3>Cómo se trabaja</h3>
<ol>
  <li><b>Armar</b> solo lo que dice el paso, con el interruptor <b>apagado</b>.</li>
  <li><b>Revisar</b> la polaridad antes de prender. Las piezas con lado positivo y negativo se marcan con <span class="pos">+</span> y <span class="neg">−</span>.</li>
  <li><b>Probar</b> lo que dice el paso. Si no hace lo esperado, <b>no avanzar</b>: buscar el error en ese mismo paso. Cada paso trae recuadros de colores: <span style="background:var(--ok-soft);border:1px solid var(--ok);padding:0 5px;border-radius:4px"><b>verde</b></span> es la <b>Prueba</b> (lo que debe pasar); <span style="background:var(--warn-soft);border:1px solid #e2b93b;padding:0 5px;border-radius:4px"><b>amarillo</b></span> es <b>Si algo falla</b> u <b>Ojo</b> (qué revisar o tener en cuenta); <span style="background:var(--accent-soft);border:1px solid var(--accent);padding:0 5px;border-radius:4px"><b>naranja</b></span> es el <b>video de muestra</b> (así debería quedar); <span style="background:var(--bad-soft);border:1px solid var(--bad);padding:0 5px;border-radius:4px"><b>rojo</b></span> es una <b>advertencia importante</b>.</li>
  <li><b>Documentar</b> cada paso en un documento propio (PDF o Word), con una foto o un video de <b>máximo 20 segundos</b> del montaje haciendo lo que dice la prueba.</li>
</ol>

<section>
  <h1 style="font-size:15pt;margin:6px 0 2px">Materiales</h1>
    <table>
    <tr><th>Cant.</th><th>Pieza</th><th>Valor</th></tr>
    <tr class="grp"><td colspan="3">BASE</td></tr>
    <tr><td class="n">1</td><td>Protoboard</td><td></td></tr>
    <tr><td class="n">1</td><td>Portapilas de 4 pilas AA, con sus 4 pilas AA</td><td>aprox. 6 V</td></tr>
    <tr><td class="n">1</td><td>Interruptor deslizante (3 patas)</td><td></td></tr>
    <tr><td class="n">var.</td><td>Cables de varios colores (rojo y negro para el positivo y el negativo)</td><td></td></tr>
    <tr><td class="n">1</td><td>Multímetro (se pueden usar los del laboratorio Caldas)</td><td></td></tr>
    <tr class="grp"><td colspan="3">SENSORES (todo esto va dos veces: izquierdo y derecho)</td></tr>
    <tr><td class="n">2</td><td>LED infrarrojo emisor (transparente)</td><td></td></tr>
    <tr><td class="n">2</td><td>Receptor infrarrojo (oscuro)</td><td></td></tr>
    <tr><td class="n">2</td><td>LED rojo</td><td></td></tr>
    <tr><td class="n">2</td><td>R1, resistencia</td><td>220 Ω</td></tr>
    <tr><td class="n">4</td><td>R2 y R3, resistencias (2 de cada una)</td><td>1 kΩ</td></tr>
    <tr><td class="n">2</td><td>R4, resistencia</td><td>10 kΩ</td></tr>
    <tr><td class="n">2</td><td>Transistor 2N2222A (uno por sensor; se retira al pasar al LM358)</td><td></td></tr>
    <tr><td class="n">var.</td><td>Termoencogible negro grueso o cinta aislante negra (barreras entre emisor y receptor)<br><span class="small">Nota: si en cualquier momento quieren cambiar resistencias por más potenciómetros o más trimmers, lo pueden hacer. De hecho es mejor, para ir probando los valores que más les funcionen.</span></td><td></td></tr>
    <tr class="grp"><td colspan="3">MOTORES</td></tr>
    <tr><td class="n">1</td><td>L293D (chip de 16 patas)</td><td></td></tr>
    <tr><td class="n">2</td><td>Motores con rueda</td><td>3 a 6 V</td></tr>
    <tr class="grp"><td colspan="3">EL CAMBIO AL LM358</td></tr>
    <tr><td class="n">1</td><td>LM358 (chip de 8 patas)</td><td></td></tr>
    <tr><td class="n">2</td><td>Potenciómetro o trimmer</td><td>10 kΩ</td></tr>
    <tr><td class="n">2</td><td>R5, resistencia</td><td>47 kΩ (sirve 51 kΩ)</td></tr>
    <tr class="grp"><td colspan="3">CONDENSADORES</td></tr>
    <tr><td class="n">1</td><td>C1, electrolítico</td><td>470 µF, 16 V o más</td></tr>
    <tr><td class="n">4</td><td>C2, C3, C4, C5, cerámicos (marcados 104)</td><td>100 nF</td></tr>
  </table>
</section>

<section class="paso">
  <div class="box ok keep">
    <span class="t">Qué se puede cambiar</span>
    <ul>
      <li><b>Las resistencias se ajustan a prueba y error.</b> Si un valor no funciona, probar con otro cercano. Por ejemplo, R3 (la del receptor) regula la sensibilidad: con valores más grandes (2,2 kΩ, 4,7 kΩ, 10 kΩ) el sensor detecta desde más lejos, y con valores más chicos (470 Ω) detecta menos.</li>
      <li><b>Se puede cambiar una resistencia por un potenciómetro o un trimmer</b> de 3 patas, para ajustarla girando en vez de cambiar la pieza. Yo usé potenciómetros. Los trimmers hacen lo mismo, son mucho más pequeños y se giran con un destornillador pequeño.</li>
      <li>Si no hay una resistencia exacta, una cercana suele servir (por ejemplo, 51 kΩ en vez de 47 kΩ).</li>
    </ul>
  </div>
  <p class="eyebrow" style="margin-top:8px">Paso 1</p>
  <h1>Alimentación de 6 V</h1>
  <p class="goal"><b>Lo que se logra:</b> tener 6 V entre el positivo y el negativo de la protoboard, con un interruptor para apagar todo.</p>
  <h3>Conectar así</h3>
  <ol>
    <li>Conectar el <span class="pos">cable ROJO (+)</span> del portapilas a una pata de un lado del interruptor.</li>
    <li>Conectar la pata del <b>centro</b> del interruptor al <b class="r">positivo</b> (la fila roja) de la protoboard.</li>
    <li>Conectar el <span class="neg">cable NEGRO (−)</span> del portapilas al <b class="b">negativo</b> (la fila azul).</li>
  </ol>
  <div class="box warn keep"><span class="t">Revisar el positivo y el negativo antes de seguir</span>
    <p>Todo el trabajo posterior depende de que el positivo y el negativo estén bien. Revisar que:</p>
    <ul>
      <li>Todo lo que dice positivo (+) sea positivo y todo lo que dice negativo (−) sea negativo, de punta a punta de la protoboard.</li>
      <li>Muchas protoboards traen las filas del positivo y del negativo <b>cortadas por la mitad</b>. Si es el caso, unir las dos mitades con un cable, tanto en el positivo como en el negativo.</li>
      <li>El positivo y el negativo de arriba estén unidos con los de abajo (un cable rojo con rojo y un cable negro con negro), para tener positivo y negativo en cualquier lado.</li>
    </ul>
    <p>Si recuerdan, yo tenía unos cablecitos uniendo todo el positivo y todo el negativo de mi protoboard. Pero la tuneé: la desarmé por abajo y les soldé los cables directamente. Por eso no ven esos cables arriba, pero siguen existiendo por debajo.</p>
  </div>
  ${prueba('<p>Encender el interruptor. Con el multímetro en <b>voltios DC</b>, la punta roja en el positivo (la fila roja) y la punta negra en el negativo (la fila azul). Debe marcar <b>entre 5,6 y 6,4 V</b>. Probar en varios puntos de cada fila, de un extremo al otro.</p>')}
  ${falla(['Marca <b>menos de 4,5 V</b>: las pilas están gastadas.', 'Marca <b>0 V</b>: el interruptor está apagado o mal conectado, o el cable rojo del portapilas no hace contacto.', 'Marca bien en un extremo de la fila y <b>0 V en el otro</b>: la fila está partida por la mitad; unirla con un cable.', 'Marca un número <b>negativo</b>: las puntas del multímetro están al revés.', '<b>Nunca</b> más de 7 V.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 2</p>
  <h1>El emisor infrarrojo</h1>
  <p class="goal"><b>Lo que se logra:</b> que el LED infrarrojo emita luz que se pueda ver con la cámara de un celular.</p>
  ${par(esquema('paso-02-emisor.svg', 'Esquema: del positivo de 6 voltios, una resistencia R1 de 220 ohmios, el LED infrarrojo con la pata larga arriba y la pata corta abajo, y de ahí al negativo. Se mide el voltaje entre las dos patas del LED, cerca de 1,2 voltios.'), foto('Paso2.jpeg', 'Protoboard con R1 y el LED infrarrojo armados'))}
  <h3>Conectar así</h3>
  <ol>
    <li>Conectar un extremo de <b>R1</b> (220 Ω) al <b class="r">positivo</b>.</li>
    <li>Conectar el otro extremo de R1 a la <span class="pos">pata larga (+)</span> del LED infrarrojo (el transparente).</li>
    <li>Conectar la <span class="neg">pata corta (−)</span> del LED al <b class="b">negativo</b>.</li>
  </ol>
  ${prueba('<p>Con la pila conectada, medir con el multímetro (voltios DC) <b>entre las dos patas del LED infrarrojo</b>: debe marcar cerca de <b>1,2 V</b>. Además, apuntar la cámara del celular al LED: se ve una <b>luz morada</b>. El ojo no la ve, pero la cámara sí.</p>')}
  ${falla(['<b>No se ve la luz morada</b> y marca casi 6 V: el LED está <b>al revés</b>. Girarlo para que la pata larga quede hacia R1.', 'Marca <b>0 V</b>: el LED no recibe positivo. Revisar el cable al positivo y que R1 haga contacto.', 'Marca <b>1,2 V pero no se ve nada</b>: la cámara del celular puede tener filtro infrarrojo. Probar con otra cámara (por ejemplo, la frontal).', 'Si el valor salta o parpadea: hay un mal contacto. Mover el LED y la resistencia con el dedo mientras se mide, o cambiarlos de hueco.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 3</p>
  <h1>El receptor y R3</h1>
  <p class="goal"><b>Lo que se logra:</b> que el receptor infrarrojo detecte la luz del emisor reflejada en un obstáculo, y que ese cambio se pueda medir como un voltaje.</p>
  ${par(esquema('paso-03-receptor.svg', 'Esquema: del positivo de 6 voltios, el receptor infrarrojo con la pata corta arriba y la pata larga abajo. La pata larga va al punto N, y de N una resistencia R3 de 1 kiloohmio al negativo. El voltaje se mide en el punto N.'), foto('Paso2b.jpeg', 'Protoboard con el emisor, el receptor oscuro con R3 y la barrera entre ellos'))}
  <h3>Conectar así</h3>
  <ol>
    <li>Conectar la <span class="pos">pata corta</span> del receptor (el LED oscuro) al <b class="r">positivo</b>, con un cable.</li>
    <li>Dejar la <span class="neg">pata larga</span> en una fila libre. Ese punto se llama <b>N</b>.</li>
    <li>Poner <b>R3</b> (1 kΩ) con un extremo en la <b>misma fila</b> que la pata larga del receptor.</li>
    <li>Conectar el otro extremo de R3 al <b class="b">negativo</b>, con un cable.</li>
    <li>Poner una <b>barrera opaca</b> entre el emisor y el receptor. Ambos deben mirar hacia el mismo lado.</li>
  </ol>
  <div class="box warn keep"><span class="t">Barrera y obstáculo de prueba</span>
    <p><b>Barrera</b> (entre el emisor y el receptor, para que el receptor no vea el LED directo): termoencogible negro grueso, o dos vueltas de cinta aislante negra, o espuma o cartón negro grueso. No todo lo negro tapa el infrarrojo: las bolsas y plásticos negros delgados lo dejan pasar.</p>
    <p><b>Obstáculo de prueba:</b> cartón blanco o una hoja blanca doblada, opaca y mate. Lo claro y opaco refleja bien el infrarrojo; lo negro lo absorbe, y lo transparente o brillante (vidrio, acrílico, espejo) casi no funciona.</p></div>
  ${prueba(`<p><b>1. Con la pila desconectada</b>, multímetro en <b>ohmios</b>: la punta negra en el negativo y la punta roja en la pata larga del receptor. Debe marcar <b>cerca de 1 kΩ</b> (por ejemplo, 993 Ω).</p>
    <p><b>2. Con la pila conectada</b>, multímetro en <b>voltios DC</b> y la punta negra en el negativo:</p>
    <ul>
      <li>Punta roja en la <b>pata corta</b> del receptor: entre <b>5,4 y 6 V</b>.</li>
      <li>Punta roja en la <b>pata larga</b> (punto N), sin nada enfrente: <b>menos de 0,5 V</b>, normalmente casi 0 V.</li>
      <li>Con un cartón blanco a 2 o 3 cm frente al emisor y el receptor, el voltaje en el punto N <b>sube</b>, aunque sea unas décimas de voltio. Al retirar el cartón, vuelve a bajar.</li>
    </ul>`)}
  ${falla(['La pata corta marca <b>casi 0 V</b>: no le llega el positivo. Cambiar el cable o moverlo a otro hueco.', 'En ohmios marca <b>OL</b>: R3 no llega al negativo. Medir por tramos, con la pila desconectada: de la pata larga del receptor a R3, y de R3 al negativo. Cada tramo debe dar casi 0 Ω; el que marque OL es el roto. Cambiar ese cable o poner R3 en otra fila.', 'El voltaje en N <b>no sube</b> con el cartón: acercar más el cartón, revisar que la barrera esté entre emisor y receptor y que ambos miren al mismo lado, y que el receptor no esté al revés.', 'El voltaje en N <b>se queda alto</b> sin nada enfrente: R3 no hace contacto, o el receptor ve la luz del emisor directo. Revisar la barrera.', 'Sube <b>muy poco</b> aunque se acerque el cartón: cambiar R3 por 4,7 kΩ.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 4</p>
  <h1>El LED rojo</h1>
  <p class="goal"><b>Lo que se logra:</b> armar la parte de salida del sensor: un LED rojo que, por ahora, queda apagado, y un punto <b>S</b> donde el voltaje es alto.</p>
  ${par(esquema('paso-04-led-rojo.svg', 'Esquema: del positivo de 6 voltios, R4 de 10 kiloohmios hasta el punto S. También del positivo de 6 voltios, R2 de 1 kiloohmio y el LED rojo con la pata larga hacia R2 y la pata corta hacia el punto S. El voltaje se mide en S, cerca de 5,4 voltios.'), foto('Paso2c.jpeg', 'Protoboard con R2, el LED rojo y R4 armados'))}
  <h3>Conectar así</h3>
  <ol>
    <li>Conectar un extremo de <b>R2</b> (1 kΩ) al <b class="r">positivo</b>.</li>
    <li>Conectar el otro extremo de R2 a la <span class="pos">pata larga (+)</span> del LED rojo.</li>
    <li>Dejar la <span class="neg">pata corta (−)</span> del LED rojo en una fila libre. Ese punto se llama <b>S</b> (la salida).</li>
    <li>Conectar un extremo de <b>R4</b> (10 kΩ) al <b class="r">positivo</b> y el otro extremo a la <b>misma fila S</b>.</li>
    <li>No conectar nada más a la fila S por ahora.</li>
  </ol>
  ${prueba(`<p><b>1.</b> Con la pila conectada, la punta negra en el negativo y la punta roja en la fila <b>S</b> (la pata corta del LED): debe marcar cerca de <b>5,4 V</b>. El LED rojo debe estar <b>apagado</b>.</p>
    <p><b>2.</b> Con un cable, unir la fila S con el negativo. El LED rojo debe <b>prender</b>. Al quitar el cable, se apaga.</p>`)}
  ${falla(['El LED <b>no prende</b> al unir S con el negativo: está <b>al revés</b>. Girarlo para que la pata larga quede hacia R2. También revisar que R2 llegue al positivo.', 'S marca <b>casi 0 V</b> y el LED está prendido sin tocar nada: la fila S está tocando el negativo o algo más. Revisar que no haya cables o patas en esa fila.', 'S marca un valor bajo, por ejemplo 3 V: R4 no llega al positivo, o es de un valor mucho menor a 10 kΩ. Revisar el color de la resistencia (café, negro, naranja).', 'El valor salta o parpadea: hay un mal contacto. Mover las resistencias y el LED con el dedo mientras se mide, o cambiarlos de hueco.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 5</p>
  <h1>El transistor</h1>
  <p class="goal"><b>Lo que se logra:</b> poner el transistor que enciende el LED rojo cuando se le da una pequeña corriente en la base, y comprobar que responde.</p>
  ${par(esquema('paso-05-transistor.svg', 'Esquema: el transistor Q2. El colector va al punto S, donde están R4 y el LED rojo. El emisor va al negativo. La base queda libre por ahora.'), foto('Paso2d.jpeg', 'Protoboard con el transistor armado: emisor al negativo, colector a la salida S'))}
  <h3>Conectar así</h3>
  <ol>
    <li>Poner el transistor <b>2N2222A</b> con la <b>cara plana hacia uno</b> y las patas hacia abajo. De izquierda a derecha son <b>E, B, C</b> (emisor, base, colector).</li>
    <li>Conectar <b>E</b> (izquierda) al <b class="b">negativo</b>, con un cable.</li>
    <li>Conectar <b>C</b> (derecha) a la fila <b>S</b>, con un cable.</li>
    <li>Dejar <b>B</b> (centro) <b>sin conectar</b> por ahora.</li>
  </ol>
  <div class="box warn keep"><span class="t">Ojo con las patas del transistor</span>
    <p>Muchos 2N2222A traen las patas en el orden <b>E, B, C</b> mirando la cara plana. Algunos vienen al revés (<b>C, B, E</b>). Si la prueba de abajo no funciona, <b>girar el transistor 180°</b>, cambiar los dos cables de lugar (el que iba a E ahora va a la pata de ese lado) y repetir la prueba.</p></div>
  ${prueba(`<p><b>1.</b> Con la pila conectada, el LED rojo debe seguir <b>apagado</b> y S debe seguir cerca de 5,4 V.</p>
    <p><b>2.</b> Tocar la pata del <b>centro (B)</b> con una resistencia de <b>1 kΩ</b> cuyo otro extremo va al <b>positivo</b>. El LED rojo debe <b>prender</b>. Al quitar la resistencia, se apaga.</p>`)}
  ${falla(['El LED <b>no prende</b> al tocar B con la resistencia: el transistor está al revés (ver el aviso de arriba), o el cable de E al negativo o el de C a S no hace contacto.', 'El LED está <b>prendido sin tocar nada</b>: el transistor tiene las patas en otro orden y está conectado al revés, o una pata toca otra fila. Girarlo 180° y probar otra vez.', 'S baja de 5,4 V apenas se pone el transistor, con la base libre: algún cable toca la base. Revisar que la fila de B esté vacía.', 'Si la resistencia de 1 kΩ no está a mano, sirve una de 2,2 kΩ o 4,7 kΩ.'])}
  <h3>Así queda la protoboard en este paso</h3>
  <img class="d" style="width:82%;margin:2px auto" src="${A}paso-05-protoboard.png" alt="Protoboard completa con todos los componentes de los pasos 1 a 5: alimentación, emisor, receptor con R3, LED rojo con R2 y R4, y el transistor.">
</section>

<section class="paso">
  <p class="eyebrow">Paso 6</p>
  <h1>Unir el receptor con el transistor</h1>
  <p class="goal"><b>Lo que se logra:</b> completar el sensor: que el LED rojo prenda cuando se acerca una mano o un cartón, y se apague al alejarlos.</p>
  ${par(esquema('paso-06-sensor-completo.svg', 'Esquema del sensor completo: el receptor con R3 y el punto N; un cable lleva N a la base del transistor Q2; el colector va a la salida S con R4 y el LED rojo; el emisor va al negativo.'), foto('Paso2E2.jpeg', 'Protoboard con el sensor completo armado'))}
  <div class="box big keep"><span class="t">Ojo con mis fotos</span>
    <p>En mis fotos y en mi video van a ver <b>dos transistores</b> por sensor: yo lo venía armando con dos. Pero por estar midiendo mal y conectando mal cosas, la cagué y maté un transistor. Y como no tenía otro, me tocó seguir con uno solo, que es el que muestra esta guía. Guíense por el esquema: <b>un transistor</b> (Q2), con el cable de N llegando a su base.</p></div>
  <h3>Conectar así</h3>
  <ol>
    <li>Con un cable, unir el punto <b>N</b> (la fila de la pata larga del receptor y de R3) con la <b>base</b> del transistor, es decir, su <b>pata del centro</b>.</li>
    <li>No conectar nada más.</li>
  </ol>
  ${prueba(`<p><b>1.</b> Con la pila conectada y <b>sin nada enfrente</b>, el LED rojo debe estar <b>apagado</b>.</p>
    <p><b>2.</b> Acercar la mano o un cartón blanco frente al emisor y al receptor: el LED rojo debe <b>prender</b>. Al alejarlos, se <b>apaga</b>. Medir a qué distancia empieza a prender (con este montaje suele ser de unos 5 a 10 cm).</p>`)}
  ${falla(['El LED está <b>prendido siempre</b>: el punto N está recibiendo demasiado. Revisar que R3 llegue al negativo (en ohmios, entre el negativo y la pata larga del receptor debe dar cerca de 1 kΩ); revisar la barrera entre emisor y receptor; probar en un lugar con menos luz.', 'El LED <b>nunca prende</b>: revisar que el cable de N llegue a la pata del <b>centro</b> del transistor; repetir la prueba del paso 5 (tocar la base con 1 kΩ al positivo); repetir la prueba del paso 3 (el voltaje en N debe subir con el cartón).', 'El LED <b>prende solo con la mano casi pegada</b> (poco rango): cambiar R3 por 4,7 kΩ.', 'El LED prende <b>más tenue</b> de lo normal o parpadea: hay un mal contacto. Mover los cables y las patas con el dedo, o cambiarlos de hueco.'])}
  <div class="two" style="align-items:center;grid-template-columns:1fr 1fr;margin-top:4px">
    ${foto('Paso2E.jpeg', 'Otra vista del sensor armado')}
    ${video('Paso2E3.mp4', 'El sensor funcionando: el LED rojo prende al acercar la mano y se apaga al alejarla.')}
  </div>
</section>

<section class="paso">
  <p class="eyebrow">Paso 7</p>
  <h1>El L293D, alimentado</h1>
  <p class="goal"><b>Lo que se logra:</b> dejar puesto y alimentado el chip que mueve los motores, todavía sin motores.</p>
  ${par(esquema('paso-07-l293d.svg', 'El chip L293D visto desde arriba. Las patas 1, 8, 9 y 16 van a 6 voltios; las patas 2, 4, 5, 7, 10, 12, 13 y 15 van a tierra; las patas 3, 6, 11 y 14 quedan libres.'), foto('Paso3.jpeg', 'Protoboard con el L293D puesto y alimentado'))}
  <p>Poner el chip <b>a caballo del canal central</b> de la protoboard. La <b>muesca</b> marca el lado de la pata 1. Las patas se cuentan en forma de U: bajando por un lado (1 a 8) y subiendo por el otro (9 a 16).</p>
  <h3>Conectar así</h3>
  <table>
    <tr><th>Pata</th><th>Nombre</th><th>Va a</th><th>Pata</th><th>Nombre</th><th>Va a</th></tr>
    <tr><td class="n">1</td><td>EN 1,2</td><td><b class="r">+6V</b></td><td class="n">16</td><td>VCC1</td><td><b class="r">+6V</b></td></tr>
    <tr><td class="n">2</td><td>1A</td><td><b class="b">GND</b></td><td class="n">15</td><td>4A</td><td><b class="b">GND</b> (por ahora)</td></tr>
    <tr><td class="n">3</td><td>1Y</td><td>libre</td><td class="n">14</td><td>4Y</td><td>libre</td></tr>
    <tr><td class="n">4</td><td>GND</td><td><b class="b">GND</b></td><td class="n">13</td><td>GND</td><td><b class="b">GND</b></td></tr>
    <tr><td class="n">5</td><td>GND</td><td><b class="b">GND</b></td><td class="n">12</td><td>GND</td><td><b class="b">GND</b></td></tr>
    <tr><td class="n">6</td><td>2Y</td><td>libre</td><td class="n">11</td><td>3Y</td><td>libre</td></tr>
    <tr><td class="n">7</td><td>2A</td><td><b class="b">GND</b> (por ahora)</td><td class="n">10</td><td>3A</td><td><b class="b">GND</b></td></tr>
    <tr><td class="n">8</td><td>VCC2</td><td><b class="r">+6V</b></td><td class="n">9</td><td>EN 3,4</td><td><b class="r">+6V</b></td></tr>
  </table>
  ${prueba('<p>Con la pila conectada, medir en la <b>pata 16</b> contra el negativo: unos <b>5,4 a 6 V</b>. Medir también la pata 8, la pata 1 y la pata 9: el mismo valor. El chip <b>no debe calentarse</b>: tocarlo con cuidado unos segundos.</p>')}
  ${falla(['El chip <b>se calienta</b>: apagar de inmediato. Revisar que esté puesto a caballo del canal, que la pata 16 no toque tierra y que ninguna pata esté mal conectada.', 'La pata 16 marca <b>casi 0 V</b>: el cable de esa pata no llega al positivo o no hace contacto. Cambiarlo o moverlo a otro hueco.', 'Alguna pata de las que van a + marca un valor bajo: revisar su cable y que no esté en una fila distinta a la de la pata.', '<b>Nunca</b> pasar de 7 V en la pata 16.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 8</p>
  <h1>Motor 1 y el sensor izquierdo</h1>
  <p class="goal"><b>Lo que se logra:</b> que el motor 1 gire mientras el camino está libre y se frene cuando se pone la mano frente al sensor.</p>
  <div class="box ok keep"><span class="t">Colores de los cables</span><p>En mi protoboard usé tres colores de cable: <b>azul</b> para el positivo, <b>café</b> para el negativo y <b>anaranjado</b> para las conexiones entre componentes. También pueden guiarse un poco por eso en mis fotos. (En los dibujos, el positivo va en rojo y el negativo en negro.)</p></div>
  ${par(esquema('paso-08-motor1.svg', 'El motor 1 conectado entre las patas 3 y 6 del L293D. La pata 7 recibe el cable de la salida S del sensor izquierdo.'), foto('Paso4a.jpeg', 'Protoboard con el motor 1 conectado y la pata 7 del L293D unida a la salida del sensor'))}
  <h3>Conectar así</h3>
  <table>
    <tr><th>Qué</th><th>Va a</th></tr>
    <tr><td>Un cable del <b>motor 1</b></td><td>pata <b>3</b> (1Y) del L293D</td></tr>
    <tr><td>El otro cable del motor 1</td><td>pata <b>6</b> (2Y) del L293D</td></tr>
    <tr><td><b>Pata 7</b> (2A) del L293D</td><td>quitarla de GND y llevarla a la <b>salida S del sensor izquierdo</b> (el punto donde se unen el colector del transistor, R4 y el LED rojo)</td></tr>
  </table>
  <p class="small">La pata 2 (1A) sigue a GND. El motor no tiene polaridad: si gira al revés de lo que se quiere, invertir sus dos cables. Este motor 1 será la <b>rueda derecha</b> del carrito.</p>
  ${prueba('<p>Sin nada frente al sensor, el motor <b>gira</b>. Al poner la mano frente al sensor, el motor se <b>frena</b> (a la vez que el LED rojo prende). Al retirar la mano, vuelve a girar.</p><p class="small">Por qué: el chip hace girar el motor cuando las patas 1A y 2A tienen voltaje distinto. Con el camino libre, 2A está en alto y 1A en tierra. Con la mano, el sensor baja 2A a tierra, las dos quedan iguales y el motor se frena.</p>')}
  ${falla(['El motor <b>no gira nunca</b>: revisar que las patas 1, 8, 9 y 16 lleguen a +6 V (paso 7) y que los cables del motor estén en las patas 3 y 6. Probar el motor conectándolo directo a la pila: si no gira, el motor está dañado.', 'El motor <b>gira siempre</b>, aunque el LED rojo prenda con la mano: la pata 7 no está llegando a la salida S del sensor. Revisar ese cable.', 'El motor <b>gira siempre</b> y el LED rojo no prende: el sensor no está funcionando; repetir el paso 6.', 'El motor gira <b>muy lento</b> o se detiene al arrancar: pilas gastadas. Medir el positivo contra el negativo (debe marcar más de 5 V).', 'El motor gira al revés: invertir sus dos cables.'])}
  ${video('Paso4a2.mp4', 'El motor 1 girando y deteniéndose al poner y quitar la mano frente al sensor.')}
</section>

<section class="paso">
  <p class="eyebrow">Paso 9</p>
  <h1>Motor 2</h1>
  <p class="goal"><b>Lo que se logra:</b> que los dos motores giren y se frenen juntos con el mismo sensor. Es un paso intermedio.</p>
  ${par(esquema('paso-09-motor2.svg', 'El motor 2 conectado entre las patas 14 y 11 del L293D. La pata 15 recibe provisionalmente el mismo cable del sensor izquierdo.'), foto('Paso5.jpeg', 'Protoboard con los dos motores conectados al L293D'))}
  <h3>Conectar así</h3>
  <table>
    <tr><th>Qué</th><th>Va a</th></tr>
    <tr><td>Un cable del <b>motor 2</b></td><td>pata <b>14</b> (4Y) del L293D</td></tr>
    <tr><td>El otro cable del motor 2</td><td>pata <b>11</b> (3Y) del L293D</td></tr>
    <tr><td><b>Pata 15</b> (4A) del L293D</td><td>quitarla de GND y llevarla al <b>mismo cable de la salida S del sensor izquierdo</b> (provisional: más adelante irá al sensor derecho)</td></tr>
  </table>
  <p class="small">La pata 10 (3A) sigue a GND. Este motor 2 será la <b>rueda izquierda</b> del carrito.</p>
  ${prueba('<p>Sin obstáculo, <b>los dos motores giran</b>. Con la mano frente al sensor, <b>los dos se frenan</b>.</p>')}
  ${falla(['El motor 2 <b>no gira</b> pero el 1 sí: revisar que sus cables estén en las patas 14 y 11, y que la pata 15 esté en el cable de la salida S. Probar el motor 2 conectado directo a la pila.', 'El motor 2 <b>gira siempre</b>: la pata 15 sigue conectada a GND. Llevarla a la salida S.', 'Los dos motores giran lento: pilas gastadas.'])}
  ${video('Paso5_2.mp4', 'Los dos motores girando y frenándose juntos al poner y quitar la mano.')}
</section>

<section class="paso">
  <p class="eyebrow">Paso 10</p>
  <h1>Sensor derecho: el emisor infrarrojo</h1>
  <p class="goal"><b>Lo que se logra:</b> empezar el segundo sensor, que es <b>igual al izquierdo</b>, armado en el otro lado del canal central de la protoboard (como un espejo), con su propio positivo y negativo.</p>
  <img class="d" style="width:46%;margin:2px auto" src="${A}paso-02-emisor.svg" alt="Esquema del paso, igual al del lado izquierdo">
  <p class="small">El positivo y el negativo de este lado deben estar unidos con los del otro lado (un cable rojo con rojo y uno negro con negro), como se revisó en el paso 1.</p>
  <h3>Conectar así</h3>
  <ol>
    <li>Conectar un extremo de <b>R1</b> (220 Ω) al <b class="r">positivo</b>.</li>
    <li>Conectar el otro extremo de R1 a la <span class="pos">pata larga (+)</span> del LED infrarrojo (el transparente).</li>
    <li>Conectar la <span class="neg">pata corta (−)</span> del LED al <b class="b">negativo</b>.</li>
  </ol>
  ${prueba('<p>Entre las dos patas del LED infrarrojo debe haber cerca de <b>1,2 V</b>, y la cámara del celular debe mostrar una <b>luz morada</b>, como en el paso 2.</p>')}
  ${falla(['Los mismos errores del paso 2: LED al revés, 0 V por un cable sin contacto, o mal contacto de la resistencia. Si el positivo o el negativo de este lado marcan 0 V, revisar que estén unidos con los del otro lado.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 11</p>
  <h1>Sensor derecho: el receptor y R3</h1>
  <p class="goal"><b>Lo que se logra:</b> que el receptor del sensor derecho detecte la luz reflejada, igual que el izquierdo.</p>
  <img class="d" style="width:46%;margin:2px auto" src="${A}paso-03-receptor.svg" alt="Esquema del paso, igual al del lado izquierdo">
  <h3>Conectar así</h3>
  <ol>
    <li>Conectar la <span class="pos">pata corta</span> del receptor al <b class="r">positivo</b>.</li>
    <li>Dejar la <span class="neg">pata larga</span> en una fila libre (punto <b>N</b>), y poner <b>R3</b> (1 kΩ) en esa misma fila.</li>
    <li>Conectar el otro extremo de R3 al <b class="b">negativo</b>.</li>
    <li>Poner una <b>barrera opaca</b> entre el emisor y el receptor. Ambos miran hacia el mismo lado. Poner otra barrera entre el sensor izquierdo y el derecho.</li>
  </ol>
  ${prueba('<p>Con la pila desconectada, en ohmios, entre el negativo y la pata larga del receptor: cerca de <b>1 kΩ</b>. Con la pila conectada, la pata larga marca <b>menos de 0,5 V</b> sin nada enfrente y <b>sube</b> con un cartón blanco a 2 o 3 cm.</p>')}
  ${falla(['Los mismos errores del paso 3: pata corta sin positivo, OL por R3 sin contacto al negativo (medir por tramos), o voltaje que no sube con el cartón. Si en este lado el voltaje sube poco, cambiar R3 por 4,7 kΩ.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 12</p>
  <h1>Sensor derecho: el LED rojo</h1>
  <p class="goal"><b>Lo que se logra:</b> la parte de salida del sensor derecho, con su punto <b>S</b>.</p>
  <img class="d" style="width:46%;margin:2px auto" src="${A}paso-04-led-rojo.svg" alt="Esquema del paso, igual al del lado izquierdo">
  <h3>Conectar así</h3>
  <ol>
    <li>Conectar <b>R2</b> (1 kΩ) del <b class="r">positivo</b> a la <span class="pos">pata larga (+)</span> del LED rojo.</li>
    <li>Dejar la <span class="neg">pata corta (−)</span> del LED en una fila libre (punto <b>S</b>).</li>
    <li>Conectar <b>R4</b> (10 kΩ) del <b class="r">positivo</b> a la misma fila S. No conectar nada más a esa fila.</li>
  </ol>
  ${prueba('<p>Con la pila conectada, S marca cerca de <b>5,4 V</b> y el LED está <b>apagado</b>. Al unir S con el negativo con un cable, el LED <b>prende</b>.</p>')}
  ${falla(['Los mismos errores del paso 4: LED al revés, S en un valor bajo (R4 mal), o mal contacto.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 13</p>
  <h1>Sensor derecho: el transistor</h1>
  <p class="goal"><b>Lo que se logra:</b> poner el transistor del sensor derecho y comprobar que responde.</p>
  <img class="d" style="width:46%;margin:2px auto" src="${A}paso-05-transistor.svg" alt="Esquema del paso, igual al del lado izquierdo">
  <h3>Conectar así</h3>
  <ol>
    <li>Poner el transistor con la <b>cara plana hacia uno</b>: de izquierda a derecha, <b>E, B, C</b>.</li>
    <li>Conectar <b>E</b> al <b class="b">negativo</b> y <b>C</b> a la fila <b>S</b>. Dejar <b>B</b> sin conectar por ahora.</li>
  </ol>
  ${prueba('<p>El LED sigue apagado. Al tocar la pata del centro (B) con una resistencia de <b>1 kΩ</b> cuyo otro extremo va al positivo, el LED <b>prende</b>. Al quitarla, se apaga.</p>')}
  ${falla(['Los mismos errores del paso 5: transistor al revés (girarlo 180° y cambiar los dos cables), cables sin contacto, o la base tocando algo.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 14</p>
  <h1>Sensor derecho: unir el receptor con el transistor</h1>
  <p class="goal"><b>Lo que se logra:</b> completar el sensor derecho: su LED rojo prende al acercar la mano y se apaga al alejarla.</p>
  ${par(esquema('paso-06-sensor-completo.svg', 'Esquema del sensor completo: el cable de N a la base del transistor.'), foto('Paso6a.jpeg', 'Protoboard con los dos sensores armados y el L293D'))}
  <h3>Conectar así</h3>
  <ol>
    <li>Con un cable, unir el punto <b>N</b> (la fila de la pata larga del receptor y de R3) con la <b>base</b> (pata del centro) del transistor.</li>
  </ol>
  ${prueba('<p>Sin nada enfrente, el LED rojo derecho está <b>apagado</b>. Al acercar la mano o un cartón, <b>prende</b>; al alejarlos, se apaga. Probarlo solo, sin tapar el sensor izquierdo.</p>')}
  ${falla(['Los mismos errores del paso 6: LED siempre prendido (R3 sin contacto al negativo, barrera, luz fuerte), LED que nunca prende (cable a la pata del centro, repetir pasos 13 y 11), o poco rango (R3 a 4,7 kΩ).'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 15</p>
  <h1>El cruce: la pata 15 al sensor derecho</h1>
  <p class="goal"><b>Lo que se logra:</b> un carrito que esquiva: cada sensor frena la rueda del <b>lado contrario</b>.</p>
  ${par(esquema('paso-15-cruce.svg', 'La pata 7 recibe el cable del sensor izquierdo y la pata 15 recibe el cable del sensor derecho.'), foto('Paso6b.jpeg', 'Protoboard con los dos sensores y los dos motores conectados al L293D'))}
  <h3>Conectar así</h3>
  <p>Quitar de la <b>pata 15</b> el cable que venía de la salida S del sensor izquierdo, y llevarlo a la <b>salida S del sensor derecho</b>.</p>
  <table>
    <tr><th>Pata del L293D</th><th>Recibe</th><th>Mueve</th></tr>
    <tr><td class="n">7 (2A)</td><td>salida del sensor <b>izquierdo</b></td><td>motor 1 = rueda <b>derecha</b></td></tr>
    <tr><td class="n">15 (4A)</td><td>salida del sensor <b>derecho</b></td><td>motor 2 = rueda <b>izquierda</b></td></tr>
  </table>
  ${prueba('<table style="margin:2px 0 0"><tr><th>Qué se pone enfrente</th><th>Qué debe pasar</th></tr><tr><td>Nada</td><td>los dos motores giran</td></tr><tr><td>La mano frente al sensor <b>izquierdo</b></td><td>se frena el motor 1 (rueda derecha): el carrito gira a la derecha</td></tr><tr><td>La mano frente al sensor <b>derecho</b></td><td>se frena el motor 2 (rueda izquierda): el carrito gira a la izquierda</td></tr><tr class="stop"><td>La mano frente a los dos</td><td>los dos motores se frenan</td></tr></table>')}
  ${falla(['Un motor <b>no se frena</b> con su sensor: la pata correspondiente (7 o 15) no está llegando a la salida S de ese sensor. Revisar el cable.', 'Se frena el motor del <b>mismo lado</b> en vez del contrario: los cables de los motores están cruzados. Intercambiar el motor 1 y el motor 2 (o las dos patas de salida).', 'Los dos motores se frenan con un solo sensor: las patas 7 y 15 están en la misma salida. Separarlas.'])}
  <p class="small">Es buen momento para montar los motores en el chasis: motor 1 a la derecha y motor 2 a la izquierda (mirando hacia donde avanza). Sensores adelante, apuntando un poco hacia afuera, y con una barrera opaca entre el izquierdo y el derecho.</p>
  ${video('Paso6.mp4', 'Los cuatro casos de la tabla: nada, mano a la izquierda, mano a la derecha y mano a los dos.')}
  <h3>Así queda la protoboard en este paso</h3>
  <img class="d" style="width:90%;margin:2px auto" src="${A}paso-15-protoboard.png" alt="Protoboard completa con los dos sensores, el L293D, los motores y todos los cables de los pasos 1 a 15.">
  <div class="box warn keep"><span class="t">Les cuento</span>
    <p>Como ya les dije, en mis fotos ven dos transistores porque yo lo venía armando con dos: funciona mejor, tiene un poquito más de rango. Pero se me murió uno, y no tenía más, así que me tocó pasarlo a uno solo. Si ustedes quieren seguir con dos, abajo les muestro cómo queda la conexión.</p></div>
  <h3>Si se prefiere trabajar con dos transistores</h3>
  <img class="d" style="width:90%;margin:2px auto" src="${A}paso-15-protoboard-2t.png" alt="Protoboard completa con los dos sensores armados con dos transistores cada uno (par Darlington), el L293D, los motores y todos los cables.">
  <p class="small">Con dos transistores, el cable del receptor (punto N) llega a la base del primero, el emisor del primero se une a la base del segundo y los colectores de los dos se unen en la salida S.</p>
</section>

<section class="paso">
  <p class="eyebrow">Paso 16</p>
  <h1>El LM358, alimentado</h1>
  <p class="goal"><b>Lo que se logra:</b> poner el chip que va a decidir cuándo hay un obstáculo (el LM358) y alimentarlo. A partir de aquí el sensor ya no necesita transistores: <b>se retiran</b> en el paso 18.</p>
  ${par(esquema('paso-16-lm358.svg', 'El chip LM358 de 8 patas. La pata 8 va a 6 voltios y la pata 4 va a tierra.'), foto('Paso7_2.jpeg', 'Protoboard con el LM358 puesto junto al L293D'))}
  <h3>Conectar así</h3>
  <ol>
    <li>Poner el <b>LM358</b> (el chip de 8 patas) <b>a caballo del canal central</b>, junto al L293D pero sin tocarlo. La <b>muesca</b> marca el lado de la pata 1. Las patas se cuentan en U: 1 a 4 por un lado y 5 a 8 por el otro.</li>
    <li>Conectar la <b>pata 8</b> al <b class="r">positivo</b>, con un cable.</li>
    <li>Conectar la <b>pata 4</b> al <b class="b">negativo</b>, con un cable.</li>
  </ol>
  ${prueba('<p>Con la pila conectada y la punta negra en el negativo: la <b>pata 8</b> marca <b>5,4 a 6 V</b> y la <b>pata 4</b> marca <b>0 V</b>.</p>')}
  ${falla(['La pata 8 marca <b>muy poco</b> (por ejemplo 1 V): no le llega el positivo. Es el error más común: el cable está en una fila distinta a la de la pata, o no hace contacto. Moverlo a otro hueco de la misma fila. Con el chip sin alimentar, la salida queda baja y el LED rojo se queda prendido por mucho que se gire el potenciómetro.', 'El chip <b>se calienta</b>: está al revés o hay una pata en tierra que no corresponde. Apagar y revisar.', 'La pata 4 no marca 0 V: el cable al negativo no hace contacto.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 17</p>
  <h1>El umbral: R5 y el potenciómetro</h1>
  <p class="goal"><b>Lo que se logra:</b> fabricar un voltaje <b>ajustable</b> (el umbral) que decide qué tan cerca tiene que estar un obstáculo para que el sensor reaccione.</p>
  ${par(esquema('paso-17-umbral.svg', 'R5 de 47 kiloohmios del positivo de 6 voltios a un extremo del potenciómetro; el otro extremo del potenciómetro va a tierra; el cursor, la pata del centro, va a la pata 3 del LM358.'), foto('Paso7.jpeg', 'Protoboard con R5 y el potenciómetro armados junto al LM358'))}
  <h3>Conectar así</h3>
  <ol>
    <li>Conectar <b>R5</b> (47 kΩ; sirve una de 51 kΩ) del <b class="r">positivo</b> a una pata de un <b>extremo</b> del potenciómetro.</li>
    <li>Conectar la otra pata del extremo del potenciómetro al <b class="b">negativo</b>.</li>
    <li>Con un cable, unir la <b>pata del centro</b> (el cursor) con la <b>pata 3</b> del LM358.</li>
  </ol>
  ${prueba('<p>Con la pila conectada y la punta negra en el negativo, medir en la <b>pata 3</b> del LM358 mientras se gira el potenciómetro de un extremo al otro: el voltaje cambia de casi <b>0 V</b> a unos <b>0,8 V</b>.</p>')}
  ${falla(['La pata 3 marca <b>siempre 0 V</b>: no le llega el positivo a R5 o el cursor no está unido a la pata 3. Medir en el extremo del potenciómetro que va a R5: debe haber algo de voltaje (unos 0,8 V con uno de 10 kΩ).', 'El voltaje máximo es <b>muy bajo</b> (por ejemplo 0,1 V): el potenciómetro (o trimmer) es muy pequeño, de 1 kΩ. Con R5 de 47 kΩ hace falta uno de <b>10 kΩ</b>.', 'El voltaje salta al girar: mal contacto del cursor. Mover o cambiar el potenciómetro de hueco.'])}
  <div class="box warn keep"><span class="t">Les cuento</span>
    <p>También me tiré con los trimmers: compré unos muy pequeños, de 1 kΩ, y no servían, así que usé potenciómetros de 10 kΩ. Con un trimmer de 10 kΩ queda mucho más bonito (y más chiquito), y funciona igual.</p></div>
</section>

<section class="paso">
  <p class="eyebrow">Paso 18</p>
  <h1>Pasar el sensor izquierdo al LM358</h1>
  <p class="goal"><b>Lo que se logra:</b> que el LM358 reemplace al transistor en el sensor izquierdo: el LED rojo prende solo cuando el obstáculo pasa del umbral que se fijó con el potenciómetro.</p>
  ${esquema('paso-18-lm358-izq.svg', 'Esquema del sensor izquierdo con el LM358: el punto N va a la pata 2, el cursor del potenciómetro va a la pata 3 y la pata 1, la salida, va al punto S. Ya no hay transistor.')}
  <h3>Conectar así</h3>
  <ol>
    <li><b>Quitar</b> el transistor del sensor izquierdo y los <b>tres cables</b> que iban a él: el de N a la base, el del emisor al negativo y el del colector a la salida S.</li>
    <li>Con un cable, unir el punto <b>N</b> (la fila de la pata larga del receptor y de R3) con la <b>pata 2</b> del LM358.</li>
    <li>Con un cable, unir la <b>pata 1</b> del LM358 (la salida) con la fila <b>S</b> (la pata corta del LED rojo, R4 y el cable a la pata 7 del L293D).</li>
  </ol>
  <p class="small">La pata 3 ya está unida al cursor del potenciómetro (paso 17). R3 debe seguir en 1 kΩ.</p>
  ${prueba('<p><b>1.</b> Sin nada enfrente, la <b>pata 2</b> marca menos de 0,4 V.</p><p><b>2.</b> Girar el potenciómetro hasta que el LED rojo quede <b>apagado</b> sin nada enfrente y <b>prenda</b> al acercar la mano. El motor 1 gira sin obstáculo y se frena con la mano.</p><p class="small">El LED prende cuando la pata 2 supera a la pata 3. Subir el umbral (pata 3 más alta) exige más luz reflejada: menos rango pero más estable. Bajarlo da más rango, hasta que el LED se prende solo. El punto justo es el que queda un poco antes de que se prenda solo.</p>')}
  ${falla(['El LED está <b>prendido siempre</b> aunque se gire el potenciómetro: la pata 2 está más alta que la pata 3 en todo el recorrido. Medir la pata 2: si marca 1 V o más, R3 no llega al negativo (medir en ohmios entre el negativo y la pata larga del receptor: debe dar unos 1 kΩ) o R3 es de 4,7 kΩ; volver a 1 kΩ. Si la pata 2 está baja, revisar la pata 8 (paso 16).', 'El LED <b>nunca prende</b> con la mano: el umbral está muy alto; girar el potenciómetro para bajarlo. O la pata 1 no está unida a S.', 'El potenciómetro <b>no cambia nada</b>: revisar el paso 17 (la pata 3 debe variar de 0 a 0,8 V).'])}
  ${video('Paso7.mp4', 'El sensor izquierdo con el LM358: se gira el potenciómetro para ajustar el rango y el LED rojo prende al acercar la mano.')}
</section>

<section class="paso">
  <p class="eyebrow">Paso 19</p>
  <h1>El umbral del sensor derecho</h1>
  <p class="goal"><b>Lo que se logra:</b> el mismo voltaje ajustable del paso 17, ahora para el sensor derecho, usando la otra mitad del LM358.</p>
  ${par(esquema('paso-19-umbral-der.svg', 'R5 de 47 kiloohmios del positivo de 6 voltios a un extremo de un segundo potenciómetro; el otro extremo a tierra; el cursor va a la pata 5 del LM358.'), foto('Paso8_2.jpeg', 'Protoboard con el potenciómetro del lado derecho'))}
  <h3>Conectar así</h3>
  <ol>
    <li>Armar otro divisor igual: <b>R5</b> (47 o 51 kΩ) del <b class="r">positivo</b> a un extremo de un segundo potenciómetro, y el otro extremo al <b class="b">negativo</b>.</li>
    <li>Con un cable, unir la <b>pata del centro</b> (el cursor) con la <b>pata 5</b> del LM358.</li>
  </ol>
  <p class="small">El LM358 tiene dos comparadores: el lado izquierdo usa las patas 1, 2 y 3; el derecho usa las patas 5, 6 y 7.</p>
  ${prueba('<p>Medir en la <b>pata 5</b> mientras se gira el potenciómetro: el voltaje cambia de casi <b>0 V</b> a unos <b>0,8 V</b>.</p>')}
  ${falla(['Los mismos errores del paso 17: R5 sin positivo, cursor que no llega a la pata 5, o potenciómetro de un valor muy chico.'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 20</p>
  <h1>Pasar el sensor derecho al LM358</h1>
  <p class="goal"><b>Lo que se logra:</b> que los dos sensores usen el LM358 y el carrito ya sea ajustable de los dos lados.</p>
  ${par(esquema('paso-20-lm358-der.svg', 'Esquema del sensor derecho con el LM358: el punto N va a la pata 6, el cursor va a la pata 5 y la pata 7, la salida, va al punto S. Ya no hay transistor.'), foto('Paso8.jpeg', 'Protoboard con los dos potenciómetros y el LM358, sin transistores'))}
  <h3>Conectar así</h3>
  <ol>
    <li><b>Quitar</b> el transistor del sensor derecho y los <b>tres cables</b> que iban a él.</li>
    <li>Con un cable, unir el punto <b>N</b> del sensor derecho con la <b>pata 6</b> del LM358.</li>
    <li>Con un cable, unir la <b>pata 7</b> (la salida) con la fila <b>S</b> del sensor derecho. La pata 15 del L293D sigue unida a esa fila.</li>
  </ol>
  ${prueba('<p>Girar el segundo potenciómetro hasta que el LED rojo derecho quede <b>apagado</b> sin nada enfrente y <b>prenda</b> con la mano. Repetir los cuatro casos del paso 15: nada, mano a la izquierda, mano a la derecha y mano a los dos.</p>')}
  ${falla(['Los mismos errores del paso 18, con las patas del lado derecho (6, 5 y 7).', 'Un sensor reacciona y el otro no: revisar la salida de ese sensor (pata 1 o pata 7) y que su pata de entrada (7 o 15) del L293D siga en esa salida.'])}
  ${video('Paso8.mp4', 'Los dos sensores con el LM358: se ajustan los dos potenciómetros y se repiten los cuatro casos.')}
  <h3>Así queda la protoboard en este paso</h3>
  <img class="d" style="width:90%;margin:2px auto" src="${A}paso-20-protoboard.png" alt="Protoboard completa con los dos sensores usando el LM358, los dos potenciómetros, el L293D, los motores y todos los cables.">
  <p class="small">Este esquema es igual si se armó con uno o con dos transistores, porque en este paso se retiran.</p>
</section>

<section class="paso">
  <p class="eyebrow">Paso 21</p>
  <h1>Los condensadores de la alimentación</h1>
  <p class="goal"><b>Lo que se logra:</b> que la alimentación no tiemble ni se reinicie cuando los motores arrancan. Al arrancar, un motor tira la alimentación hacia abajo y mete ruido; los condensadores guardan un poco de energía y la entregan en picos rápidos.</p>
  ${par(esquema('paso-21-condensadores.svg', 'C1 de 470 microfaradios entre el positivo y el negativo, cerca de la batería; C2 de 100 nanofaradios junto al LM358; C3 de 100 nanofaradios junto al L293D; C4 y C5 de 100 nanofaradios entre los cables de cada motor.'), foto('Paso9_2.jpeg', 'Protoboard con el condensador electrolítico y uno cerámico entre el positivo y el negativo'))}
  <h3>Conectar así</h3>
  <table>
    <tr><th>Condensador</th><th>Valor</th><th>Entre qué y qué</th><th>Polaridad</th></tr>
    <tr><td class="n">C1</td><td>470 µF electrolítico</td><td><b class="r">positivo</b> y <b class="b">negativo</b>, cerca de la batería</td><td><span class="pos">pata larga al +</span>, <span class="neg">franja al −</span></td></tr>
    <tr><td class="n">C2</td><td>100 nF cerámico</td><td>positivo y negativo, pegado al LM358 (cerca de las patas 8 y 4)</td><td>no tiene</td></tr>
    <tr><td class="n">C3</td><td>100 nF cerámico</td><td>positivo y negativo, pegado al L293D (cerca de la pata 16)</td><td>no tiene</td></tr>
  </table>
  <div class="box warn keep"><span class="t">Cuidado con C1</span><p>El electrolítico <b>sí tiene polaridad</b>. La <b>franja</b> del cuerpo marca la pata negativa y va al negativo. Al revés se calienta y puede explotar. Si se calienta o huele raro, apagar de inmediato.</p></div>
  ${prueba('<p>Con la pila conectada, el voltaje entre el positivo y el negativo sigue en <b>5,4 a 6 V</b>. Poner y quitar la mano varias veces, de lejos a cerca y rápido: los motores arrancan y paran <b>sin que los LED parpadeen</b> y sin que nada se reinicie.</p>')}
  ${falla(['Los LED <b>parpadean</b> al arrancar los motores: revisar que C2 y C3 estén pegados a los chips, entre el positivo y el negativo, y que C1 esté bien puesto.', 'C1 <b>se calienta</b>: está al revés. Apagar y darle la vuelta.', 'Todo se <b>reinicia</b> al arrancar un motor: pilas gastadas. Medir el positivo contra el negativo (más de 5 V).'])}
</section>

<section class="paso">
  <p class="eyebrow">Paso 22</p>
  <h1>Los condensadores de los motores</h1>
  <p class="goal"><b>Lo que se logra:</b> quitarle el ruido a cada motor desde su origen, para que el chip y los sensores no se confundan.</p>
  ${par(esquema('paso-21-condensadores.svg', 'C4 y C5 de 100 nanofaradios, uno directo entre los dos cables de cada motor.'), foto('Paso9_3.jpeg', 'Motor con un condensador cerámico unido a sus dos terminales'))}
  <h3>Conectar así</h3>
  <table>
    <tr><th>Condensador</th><th>Valor</th><th>Entre qué y qué</th></tr>
    <tr><td class="n">C4</td><td>100 nF cerámico</td><td>directo entre los <b>dos terminales del motor 1</b> (los que van a las patas 3 y 6)</td></tr>
    <tr><td class="n">C5</td><td>100 nF cerámico</td><td>directo entre los <b>dos terminales del motor 2</b> (los que van a las patas 14 y 11)</td></tr>
  </table>
  <p class="small">No tienen polaridad. Lo mejor es soldarlos directo a los dos terminales del motor; si no hay soldadura, enrollar bien las patas del condensador a las del motor.</p>
  ${prueba('<p>Poner y quitar la mano rápido frente a cada sensor. Los motores arrancan y paran sin que los LED parpadeen y sin que se reinicie nada.</p><p class="small"><b>Extra, solo si todavía "tiembla" justo en el límite de la distancia:</b> agregar R6, una resistencia de 470 kΩ, entre la salida del comparador y su entrada +: pata 1 con pata 3 (lado izquierdo) y pata 7 con pata 5 (lado derecho).</p>')}
  ${falla(['El motor <b>no gira</b> después de poner el condensador: los terminales del condensador están en cortocircuito entre sí, o tocan la carcasa. Separarlos.', 'Sigue el ruido: revisar que C4 y C5 estén directamente en los terminales del motor y no en los cables largos.'])}
  ${video('Paso9.mp4', 'Los motores arrancan y paran sin que los LED parpadeen, con los condensadores puestos.')}
  <h3>Así queda la protoboard en este paso</h3>
  <img class="d" style="width:90%;margin:2px auto" src="${A}paso-22-protoboard.png" alt="Protoboard completa con los condensadores de la alimentación y los de los motores.">
</section>

<section class="paso">
  <p class="eyebrow">Paso 23 (opcional)</p>
  <h1>Motores con su propio pack de pilas</h1>
  <p class="goal"><b>Cuándo hacerlo:</b> solo si los motores no son de 3 a 6 V, o si con 6 V giran muy despacio.</p>
  ${par(esquema('paso-23-pack-motores.svg', 'El positivo del pack de motores va a la pata 8 del L293D. La pata 16 sigue en 6 voltios. Los negativos de los dos packs se unen en el negativo.'), foto('Paso10.jpeg', 'Protoboard con el pack de pilas aparte para los motores'))}
  <p>Hasta ahora el pack de 6 V alimenta todo. Aquí los motores pasan a su propio pack, conectado a la <b>pata 8 (VCC2)</b> del L293D. La lógica (pata 16), los sensores y el LM358 siguen en los 6 V.</p>
  <h3>Conectar así</h3>
  <table>
    <tr><th>Qué</th><th>Va a</th></tr>
    <tr><td><b>Pata 8</b> del L293D</td><td>quitarla del positivo y llevarla al <span class="pos">positivo (+)</span> del pack de motores</td></tr>
    <tr><td><span class="neg">Negativo (−)</span> del pack de motores</td><td><b class="b">negativo (GND)</b>, el mismo de todo el circuito</td></tr>
    <tr><td><b>Pata 16</b> del L293D</td><td>sigue en el positivo <b class="r">+6V</b> de la lógica</td></tr>
  </table>
  <h3>Qué pack poner</h3>
  <p>El L293D se come unos 2,5 V. Al voltaje del motor se le suman 2,5 V para saber el pack:</p>
  <table>
    <tr><th>Voltaje del motor</th><th>Pack sugerido</th></tr>
    <tr><td class="n">5 V</td><td>aprox. 7,5 V (5 pilas AA, o 2 celdas 18650 en serie)</td></tr>
    <tr><td class="n">6 V</td><td>aprox. 8 a 9 V (6 pilas AA)</td></tr>
    <tr><td class="n">10 a 12 V</td><td>aprox. 12 V (8 pilas AA). El motor recibe unos 9 a 10 V, es normal.</td></tr>
  </table>
  <div class="box warn keep"><span class="t">Cuidado</span>
    <ul>
      <li><b>Los dos negativos se unen siempre.</b> Si no, no funciona.</li>
      <li>La pata <b>16</b> nunca debe pasar de 7 V: va al pack de la lógica, no al de motores.</li>
      <li>El L293D aguanta 600 mA continuos por motor. Un motor más grande necesita otro driver.</li>
      <li>No usar la pila rectangular de 9 V para motores: no entrega la corriente que piden.</li>
    </ul></div>
  ${prueba('<p>Medir la <b>pata 16</b> contra el negativo: <b>5,4 a 6 V</b>. Medir la <b>pata 8</b>: el voltaje del pack de motores. Los motores giran más fuerte que antes y los sensores siguen funcionando igual.</p>')}
  ${falla(['Los motores <b>no giran</b>: los dos negativos no están unidos. Unir el negativo del pack de motores con el negativo.', 'Los sensores se vuelven <b>locos</b> o el chip se calienta: la pata 16 está recibiendo el voltaje del pack grande. Devolverla al positivo6V.'])}
  <div class="two" style="align-items:center;grid-template-columns:1fr 1fr;margin-top:4px">
    ${foto('Paso10_2.jpeg', 'Cerca de la pata 8 del L293D con el cable rojo que llega del pack de motores')}
    ${video('Paso10.mp4', 'Los dos packs conectados y el carrito andando.')}
  </div>
  <h3>Así queda la protoboard en este paso</h3>
  <img class="d" style="width:90%;margin:2px auto" src="${A}paso-23-protoboard.png" alt="Protoboard completa con el pack de motores aparte conectado a la pata 8 del L293D.">
</section>

</div></body></html>`;
fs.writeFileSync(HTML, page, 'utf8');

// ---- PDF con Edge
const edges = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'];
const exe = edges.find(p => fs.existsSync(p));
const url = 'file:///' + HTML.replace(/\\/g, '/').split('/').map((s, i) => (i === 0 ? s : encodeURIComponent(s))).join('/');
try { execFileSync(exe, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${PDF}`, url], { stdio: 'pipe' }); } catch (e) { /* ruido de stderr */ }
const t = fs.existsSync(PDF) ? fs.statSync(PDF).mtime : null;
console.log(t && Date.now() - t.getTime() < 60000 ? `PDF listo: ${PDF}` : 'No se pudo escribir el PDF (¿está abierto en otro programa?)');
