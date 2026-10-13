// Protoboard del carrito dibujada hueco por hueco: una página por paso + la placa completa.
// Uso: node docs/gen-protoboard.js
// En cada paso verifica que las conexiones dibujadas (tiras de la protoboard + cables) den EXACTAMENTE las redes esperadas.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const APOYO = path.join(ROOT, 'materias', 'sistemas-hipermedia', 'apoyo');
// PINOUT=CBE genera la variante para transistores con las patas C-B-E (mirando la cara plana, de izquierda a derecha)
const CBE = process.env.PINOUT === 'CBE';
// Por defecto el sensor lleva UN solo transistor (Q2); el cable del receptor va directo a su base.
// TWO=1 genera la versión con par Darlington (Q1+Q2), todavía no validada: no se usa hasta nuevo aviso.
const ONE = process.env.TWO !== '1';
const Q1CBE = CBE;
// version-1-un-transistor/ y version-2-dos-transistores/, cada una con protoboard-ebc/ y protoboard-cbe/
const PASOS = path.join(APOYO, ONE ? 'version-1-un-transistor' : 'version-2-dos-transistores', CBE ? 'protoboard-cbe' : 'protoboard-ebc');
fs.mkdirSync(PASOS, { recursive: true });

// ------------------------------------------------------------------ geometría
const P = 22, NCOL = 54, X0 = 84;
const colX = c => X0 + (c - 1) * P;
const Y_TN = 270, Y_TP = Y_TN + P;
const Y_J = Y_TP + 1.7 * P, Y_F = Y_J + 4 * P, Y_E = Y_F + 3 * P, Y_A = Y_E + 4 * P;
const Y_BP = Y_A + 1.7 * P, Y_BN = Y_BP + P;
const RAILY = { Tn: Y_TN, Tp: Y_TP, Bp: Y_BP, Bn: Y_BN };
const W_SVG = colX(NCOL) + 330, H_SVG = Y_BN + 270;
const H = (half, col, k) => ({ t: 'h', half, col, k });
const RL = (rail, col) => ({ t: 'r', rail, col });
const XP = (id, x, y) => ({ t: 'x', id, x, y });
function pos(h) {
  if (h.t === 'h') return { x: colX(h.col), y: h.half === 'B' ? Y_E + h.k * P : Y_F - h.k * P };
  if (h.t === 'r') return { x: colX(h.col) + 0.5 * P, y: RAILY[h.rail] };
  return { x: h.x, y: h.y };
}
const strip = h => (h.t === 'h' ? h.half + h.col : h.t === 'r' ? h.rail : h.id);
const chDir = half => (half === 'B' ? -1 : 1);       // hacia el canal
const C = { red: '#d62828', black: '#222222', blue: '#1d6fd6', orange: '#e67e22', violet: '#8e44ad', green: '#0f9d58', teal: '#118ab2', brown: '#8a5a2b', mustard: '#c9a227', pink: '#d6336c' };

const LM = 44, L2 = 34;
const TITLES = ['Alimentación de 6 V', 'Sensor izquierdo con transistores', 'El L293D, alimentado', 'Motor 1 y el sensor izquierdo', 'Motor 2',
  'Sensor derecho y el cruce', 'Cambiamos los transistores por el LM358 (izquierdo)', 'LM358, lado derecho', 'Condensadores', 'Motores con su propio pack (opcional)', 'Prueba final'];
const HINTS = [
  'Pila, interruptor y rieles. El multímetro debe marcar entre 5,6 y 6,4 V.',
  'Sensor izquierdo con los dos transistores. El LED rojo se prende con la mano.',
  'Pon el L293D y aliméntalo. Las patas 7 y 15 van al negativo por ahora.',
  'Motor 1 en las patas 3 y 6. La pata 7 pasa a la salida del sensor izquierdo.',
  'Motor 2 en las patas 14 y 11. La pata 15 usa, por ahora, la salida del sensor izquierdo.',
  'Sensor derecho igual al izquierdo. La pata 15 pasa a la salida del sensor derecho.',
  'Quita los transistores del sensor izquierdo. Pon el LM358, R5 y el trimmer.',
  'Quita los transistores del sensor derecho. Usa la otra mitad del LM358, con su trimmer.',
  'Condensadores: tres en los rieles y uno en cada motor.',
  'Solo si tus motores no son de 3 a 6 V: el pack de motores va a la pata 8 del L293D.',
  'Placa completa. Prueba con un cartón blanco a la izquierda, a la derecha y al frente.',
];

// ------------------------------------------------------------------ modelo por paso
function buildModel(step) {
  const M = { step, pins: {}, used: {}, parts: [], wires: [], joins: [], ghostParts: [], ghostWires: [] };
  const INF = Infinity;
  // el paso 2 completo (2) incluye todos sus mini pasos (2.1 a 2.5)
  const eff = step === 2 ? 2.9 : step === 6 ? 6.9 : step;
  const st = L => (eff >= L[0] && eff < L[1] ? 'on' : eff === L[1] ? 'ghost' : 'off');
  const isNewFor = L => (Number.isInteger(step) ? Math.floor(L[0]) === step : L[0] === step);
  const occupy = (h, who) => {
    if (h.t === 'x') return;
    const key = h.t === 'h' ? `${h.half}${h.col}.${h.k}` : `${h.rail}${h.col}`;
    if (M.used[key]) throw new Error(`Paso ${step}: hueco ${key} ocupado por ${M.used[key]} y ${who}`);
    M.used[key] = who;
  };
  const pin = (name, h) => { M.pins[name] = h; occupy(h, name); };
  const part = (p, L, pinList) => {
    const s = st(L); if (s === 'off') return;
    p.isNew = isNewFor(L);
    if (s === 'ghost') return; // lo que se quita simplemente no se dibuja
    pinList.forEach(([n, h]) => pin(n, h));
    M.parts.push(p);
  };
  const wire = (id, a, b, color, o, L) => {
    const s = st(L); if (s === 'off') return;
    const w = { id, a, b, color, ...o, isNew: isNewFor(L) };
    if (s === 'ghost') return;
    occupy(a, id + ':a'); occupy(b, id + ':b'); M.wires.push(w);
  };
  const join = (a, b, L) => { if (st(L) === 'on') M.joins.push([a, b]); };
  const jumper = (id, half, col, plus, L) => wire(id, H(half, col, 4), RL((half === 'B' ? 'B' : 'T') + (plus ? 'p' : 'n'), col), plus ? C.red : C.black, { kind: 'jumper' }, L);

  // ---------------- alimentación (paso 1)
  const BT = { x: colX(NCOL) + 120, y: Y_TN - 170 };
  const btp = XP('BT.+', BT.x, BT.y + 18), btn = XP('BT.-', BT.x, BT.y + 52);
  const swin = XP('SW.in', colX(NCOL) + 52, Y_TN - 170), swout = XP('SW.out', colX(NCOL) + 16, Y_TN - 170);
  part({ kind: 'battery', id: 'BT', ...BT, plus: btp, minus: btn, pinNames: ['BT.+', 'BT.-'] }, [1, INF], [['BT.+', btp], ['BT.-', btn]]);
  part({ kind: 'switch', id: 'SW', a: swout, b: swin, pinNames: ['SW.in'] }, [1, INF], [['SW.in', swin], ['SW.out', swout]]);
  join('SW.in', 'SW.out', [1, INF]);
  wire('W-BTp', btp, swin, C.red, { kind: 'power', bend: -20 }, [1, INF]);
  wire('W-SWo', swout, RL('Tp', 52), C.red, { kind: 'power', bend: -14 }, [1, INF]);
  wire('W-BTn', btn, RL('Tn', 53), C.black, { kind: 'power', bend: 40 }, [1, INF]);
  wire('RL+', RL('Tp', 1), RL('Bp', 1), C.red, { kind: 'rails', x: colX(1) - 40 }, [1, INF]);
  wire('RL-', RL('Tn', 1), RL('Bn', 1), C.black, { kind: 'rails', x: colX(1) - 62 }, [1, INF]);
  // multímetro (solo paso 1)
  const mj1 = XP('MM.red', colX(27) + 6, Y_TN - 92), mj2 = XP('MM.black', colX(27) + 40, Y_TN - 92);
  part({ kind: 'meter', id: 'MM', x: colX(25), y: Y_TN - 185, jr: mj1, jb: mj2, pinNames: ['MM.red', 'MM.black'] }, [1, 1.5], [['MM.red', mj1], ['MM.black', mj2]]);
  wire('W-MMr', mj1, RL('Tp', 30), C.red, { kind: 'power', bend: 18 }, [1, 1.5]);
  wire('W-MMb', mj2, RL('Tn', 32), C.black, { kind: 'power', bend: 18 }, [1, 1.5]);

  // ---------------- sensores
  const lmCol = { 1: LM, 2: LM + 1, 3: LM + 2, 4: LM + 3, 8: LM, 7: LM + 1, 6: LM + 2, 5: LM + 3 };
  function sensor(half, S) {
    const L = S === 'L';
    const born = L ? 2 : 6, lm = L ? 7 : 8;
    const lv = x => (L ? [x, INF] : [{ 2.1: 6.1, 2.2: 6.2, 2.3: 6.3 }[x], INF]);
    const E1 = lv(2.1), RC = lv(2.2), OU = lv(2.3), TQ2 = [L ? 2.4 : 6.4, lm], TQ1 = [L ? 2.5 : 6.5, lm], CB = [lm, INF];
    const res = (id, a, b, val, bands, lab, life) => part({ kind: 'res', id, a, b, val, bands, lab, half, pinNames: [id + '.a', id + '.b'] }, life, [[id + '.a', a], [id + '.b', b]]);
    // emisor
    jumper(`J+e${S}`, half, 12, true, E1);
    res(`R1${S}`, H(half, 12, 2), H(half, 16, 2), '220 Ω', ['#d62828', '#d62828', '#8a4b1f'], 'ch', E1);
    part({ kind: 'led', id: `D1${S}`, a: H(half, 16, 0), k: H(half, 17, 0), half, look: 'ir', pinNames: [`D1${S}.A`, `D1${S}.K`] }, E1, [[`D1${S}.A`, H(half, 16, 0)], [`D1${S}.K`, H(half, 17, 0)]]);
    jumper(`J-e${S}`, half, 17, false, E1);
    part({ kind: 'barrier', id: `BAR${S}`, half, col: 18.5, pinNames: [] }, RC, []);
    // receptor
    jumper(`J+r${S}`, half, 20, true, RC);
    part({ kind: 'led', id: `D2${S}`, a: H(half, 20, 0), k: H(half, 21, 0), half, look: 'rx', pinNames: [`D2${S}.S`, `D2${S}.L`] }, RC, [[`D2${S}.S`, H(half, 20, 0)], [`D2${S}.L`, H(half, 21, 0)]]);
    res(`R3${S}`, H(half, 21, 2), H(half, 25, 2), '1 kΩ', ['#8a4b1f', '#111', '#d62828'], 'ch', RC);
    jumper(`J-r${S}`, half, 25, false, RC);
    // salida
    jumper(`J+o${S}`, half, 27, true, OU);
    res(`R4${S}`, H(half, 27, 2), H(half, 31, 2), '10 kΩ', ['#8a4b1f', '#111', '#e67e22'], 'ch', OU);
    res(`R2${S}`, H(half, 27, 3), H(half, 30, 3), '1 kΩ', ['#8a4b1f', '#111', '#d62828'], 'rail', OU);
    part({ kind: 'led', id: `D3${S}`, a: H(half, 30, 0), k: H(half, 31, 0), half, look: 'red', pinNames: [`D3${S}.A`, `D3${S}.K`] }, OU, [[`D3${S}.A`, H(half, 30, 0)], [`D3${S}.K`, H(half, 31, 0)]]);
    // --- transistores (par Darlington): pasos [born, lm)
    const cE = [Q1CBE ? 50 : 48, CBE ? 54 : 52], cC = [Q1CBE ? 48 : 50, CBE ? 52 : 54];
    const q1 = { e: H(half, cE[0], 0), b: H(half, 49, 0), c: H(half, cC[0], 0) }, q2 = { e: H(half, cE[1], 0), b: H(half, 53, 0), c: H(half, cC[1], 0) };
    if (!ONE) part({ kind: 'tr', id: `Q1${S}`, ...q1, half, pinNames: [`Q1${S}.E`, `Q1${S}.B`, `Q1${S}.C`] }, TQ1, [[`Q1${S}.E`, q1.e], [`Q1${S}.B`, q1.b], [`Q1${S}.C`, q1.c]]);
    part({ kind: 'tr', id: `Q2${S}`, ...q2, half, pinNames: [`Q2${S}.E`, `Q2${S}.B`, `Q2${S}.C`] }, TQ2, [[`Q2${S}.E`, q2.e], [`Q2${S}.B`, q2.b], [`Q2${S}.C`, q2.c]]);
    wire(`T-N${S}`, H(half, 21, 4), H(half, ONE ? 53 : 49, 4), C.orange, { kind: 'lane', depth: 110 }, TQ1);
    if (!ONE) wire(`T-E${S}`, H(half, cE[0], 3), H(half, 53, 3), C.pink, { kind: 'hop', bulge: 30 }, TQ1);
    if (!ONE) wire(`T-C${S}`, H(half, cC[0], 4), H(half, cC[1], 4), L ? C.green : C.teal, { kind: 'hop', bulge: 24 }, TQ1);
    wire(`T-O${S}`, H(half, cC[1], 3), H(half, 31, 4), L ? C.green : C.teal, { kind: 'lane', depth: 132 }, TQ2);
    jumper(`J-q${S}`, half, cE[1], false, TQ2);
    // --- umbral + LM358: pasos [lm, ∞)
    jumper(`J+t${S}`, half, 3, true, CB);
    res(`R5${S}`, H(half, 3, 3), H(half, 7, 3), '47 kΩ', ['#e8c800', '#7b3fa0', '#e67e22'], 'rail', CB);
    part({ kind: 'pot', id: `P1${S}`, a: H(half, 7, 0), w: H(half, 8, 0), b: H(half, 9, 0), half, pinNames: [`P1${S}.A`, `P1${S}.W`, `P1${S}.B`] }, CB, [[`P1${S}.A`, H(half, 7, 0)], [`P1${S}.W`, H(half, 8, 0)], [`P1${S}.B`, H(half, 9, 0)]]);
    jumper(`J-t${S}`, half, 9, false, CB);
    const pN = L ? 2 : 6, pW = L ? 3 : 5, pO = L ? 1 : 7;
    wire(`W-N${S}`, H(half, 21, 4), H(half, lmCol[pN], 4), C.orange, { kind: 'lane', depth: 66 }, CB);
    wire(`W-W${S}`, H(half, 8, 4), H(half, lmCol[pW], 4), C.violet, { kind: 'lane', depth: 88 }, CB);
    wire(`W-O${S}`, H(half, 31, 4), H(half, lmCol[pO], 4), L ? C.green : C.teal, { kind: 'lane', depth: 44, dx1: 6 }, CB);
    // --- salida hacia el L293D
    if (L) wire('W-UL', H('B', 31, 3), H('B', L2 + 6, 4), C.green, { kind: 'lane', depth: 22, dx1: -6 }, [4, INF]);
    else wire('W-UR', H('T', 31, 3), H('T', L2 + 1, 4), C.teal, { kind: 'lane', depth: 22, dx1: -6 }, [6.5, INF]);
  }
  sensor('B', 'L');
  sensor('T', 'R');
  // pata 15 usa la salida izquierda (solo paso 5)
  wire('W-X15', H('B', 31, 1), H('T', L2 + 1, 4), C.green, { kind: 'across' }, [5, 6.5]);

  // ---------------- LM358 (paso 7)
  const lmPins = [];
  for (let i = 0; i < 4; i++) { lmPins.push([`U2.${i + 1}`, H('B', LM + i, 0)], [`U2.${8 - i}`, H('T', LM + i, 0)]); }
  part({ kind: 'chip', id: 'U2', name: 'LM358', start: LM, n: 8, top: [8, 7, 6, 5], bottom: [1, 2, 3, 4], pinNames: lmPins.map(p => p[0]) }, [7, INF], lmPins);
  jumper('J+U2', 'T', LM, true, [7, INF]);
  jumper('J-U2', 'B', LM + 3, false, [7, INF]);

  // ---------------- L293D (paso 3)
  const u1Pins = [];
  for (let i = 0; i < 8; i++) { u1Pins.push([`U1.${i + 1}`, H('B', L2 + i, 0)], [`U1.${16 - i}`, H('T', L2 + i, 0)]); }
  part({ kind: 'chip', id: 'U1', name: 'L293D', start: L2, n: 16, top: [16, 15, 14, 13, 12, 11, 10, 9], bottom: [1, 2, 3, 4, 5, 6, 7, 8], pinNames: u1Pins.map(p => p[0]) }, [3, INF], u1Pins);
  jumper('J+1', 'B', L2, true, [3, INF]);
  jumper('J-2', 'B', L2 + 1, false, [3, INF]);
  jumper('J-4', 'B', L2 + 3, false, [3, INF]);
  jumper('J-5', 'B', L2 + 4, false, [3, INF]);
  jumper('J+8', 'B', L2 + 7, true, [3, 10]);
  jumper('J+16', 'T', L2, true, [3, INF]);
  jumper('J-13', 'T', L2 + 3, false, [3, INF]);
  jumper('J-12', 'T', L2 + 4, false, [3, INF]);
  jumper('J-10', 'T', L2 + 6, false, [3, INF]);
  jumper('J+9', 'T', L2 + 7, true, [3, INF]);
  jumper('J-7p', 'B', L2 + 6, false, [3, 4]);     // pata 7 a negativo (provisional)
  jumper('J-15p', 'T', L2 + 1, false, [3, 5]);    // pata 15 a negativo (provisional)

  // ---------------- motores (pasos 4 y 5)
  const mcx = colX(L2 + 3.5);
  const mk = (n, side, from) => {
    const M0 = { cx: mcx, cy: side === 'B' ? Y_BN + 190 : Y_TN - 190, side };
    const dy = side === 'B' ? -34 : 34;
    const a = XP(`M${n}.a`, M0.cx - 15, M0.cy + dy), b = XP(`M${n}.b`, M0.cx + 15, M0.cy + dy);
    part({ kind: 'motor', id: `M${n}`, ...M0, pts: { a, b }, pinNames: [`M${n}.a`, `M${n}.b`] }, [from, INF], [[`M${n}.a`, a], [`M${n}.b`, b]]);
    const col = n === 1 ? C.brown : C.mustard;
    wire(`W-M${n}a`, H(side, L2 + 2, 3), a, col, { kind: 'motor' }, [from, INF]);
    wire(`W-M${n}b`, H(side, L2 + 5, 3), b, col, { kind: 'motor' }, [from, INF]);
    // condensador soldado al motor (paso 9)
    const cap = { kind: 'mcap', id: `C${n + 3}`, M: M0, pts: { a, b }, pinNames: [`C${n + 3}.a`, `C${n + 3}.b`] };
    part(cap, [9, INF], [[`C${n + 3}.a`, XP(`C${n + 3}.a`, 0, 0)], [`C${n + 3}.b`, XP(`C${n + 3}.b`, 0, 0)]]);
    join(`M${n}.a`, `C${n + 3}.a`, [9, INF]); join(`M${n}.b`, `C${n + 3}.b`, [9, INF]);
  };
  mk(1, 'B', 4);
  mk(2, 'T', 5);

  // ---------------- condensadores de los rieles (paso 9)
  const rcap = (id, col, kind, val) => part({ kind: 'cap', id, col, capKind: kind, val, pinNames: [id + '.+', id + '.-'] }, [9, INF], [[id + '.+', RL('Tp', col)], [id + '.-', RL('Tn', col + 1)]]);
  rcap('C2', 48, 'cer', '100 nF'); rcap('C3', 28, 'cer', '100 nF'); rcap('C1', 51, 'ele', '470 µF');

  // ---------------- pack de motores aparte (paso 10)
  const B2 = { x: colX(NCOL) + 120, y: Y_BN + 120 };
  const b2p = XP('BT2.+', B2.x, B2.y + 18), b2n = XP('BT2.-', B2.x, B2.y + 52);
  part({ kind: 'battery', id: 'BT2', ...B2, plus: b2p, minus: b2n, pinNames: ['BT2.+', 'BT2.-'] }, [10, INF], [['BT2.+', b2p], ['BT2.-', b2n]]);
  wire('W-B2p', H('B', L2 + 7, 3), b2p, C.mustard, { kind: 'lane', depth: 112 }, [10, INF]);
  wire('W-B2n', b2n, RL('Bn', 50), C.black, { kind: 'power', bend: -30 }, [10, INF]);
  return M;
}

// ------------------------------------------------------------------ redes esperadas en cada paso
function expectedNets(M) {
  const step = M.step, has = n => !!M.pins[n];
  const nets = {};
  const add = (id, name, list) => { const l = list.filter(has); if (l.length >= 2) nets[id] = { name, pins: l }; };
  const S2 = ['L', 'R'];
  const sensorExists = S => (S === 'L' ? step >= 2 : step >= 6);
  const effStep = step === 2 ? 2.9 : step === 6 ? 6.9 : step;
  const lmOf = S => (S === 'L' ? step >= 7 : step >= 8);
  add('VCC', 'Positivo (+6 V)', [
    'BT.+', 'SW.in', 'MM.red', 'U2.8', 'U1.1', 'U1.9', 'U1.16', 'C1.+', 'C2.+', 'C3.+', ...(step < 10 ? ['U1.8'] : []),
    ...S2.flatMap(S => [`R5${S}.a`, `R1${S}.a`, `D2${S}.S`, `R4${S}.a`, `R2${S}.a`]),
  ]);
  add('GND', 'Negativo (GND)', [
    'BT.-', 'MM.black', 'U2.4', 'U1.2', 'U1.4', 'U1.5', 'U1.10', 'U1.12', 'U1.13', 'C1.-', 'C2.-', 'C3.-', 'BT2.-',
    ...(step === 3 ? ['U1.7', 'U1.15'] : []), ...(step === 4 ? ['U1.15'] : []),
    ...S2.flatMap(S => [`P1${S}.B`, `D1${S}.K`, `R3${S}.b`, `Q2${S}.E`]),
  ]);
  if (step >= 10) add('VM', 'Positivo del pack de motores', ['U1.8', 'BT2.+']);
  S2.forEach(S => {
    if (!sensorExists(S)) return;
    const side = S === 'L' ? 'izquierdo' : 'derecho';
    const lm = lmOf(S);
    const n = S === 'L' ? { N: 2, W: 3, O: 1 } : { N: 6, W: 5, O: 7 };
    add('E' + S, `Emisor ${side}: R1 y el LED IR`, [`R1${S}.b`, `D1${S}.A`]);
    add('N' + S, `Punto N del sensor ${side}: receptor y R3`, [`D2${S}.L`, `R3${S}.a`, lm ? `U2.${n.N}` : (ONE ? (S === 'L' ? effStep >= 2.5 : effStep >= 6.5) ? `Q2${S}.B` : null : `Q1${S}.B`)].filter(Boolean));
    add('A' + S, `LED rojo ${side}: ánodo y R2`, [`R2${S}.b`, `D3${S}.A`]);
    const u1 = S === 'L' ? (step >= 4 ? ['U1.7'] : []).concat(step >= 5 && step < 6.5 ? ['U1.15'] : []) : (step >= 6.5 ? ['U1.15'] : []);
    add('O' + S, `Salida del sensor ${side}`, [`R4${S}.b`, `D3${S}.K`, ...(lm ? [`U2.${n.O}`] : [`Q1${S}.C`, `Q2${S}.C`]), ...u1]);
    if (!lm && !ONE) add('D' + S, `Entre Q1 y Q2 (${side})`, [`Q1${S}.E`, `Q2${S}.B`]);
    if (lm) {
      add('T' + S, `Umbral ${side}: R5 y extremo del trimmer`, [`R5${S}.b`, `P1${S}.A`]);
      add('W' + S, `Cursor del trimmer ${side}`, [`P1${S}.W`, `U2.${n.W}`]);
    }
  });
  add('M1a', 'Motor 1, cable A (pata 3)', ['U1.3', 'M1.a', 'C4.a']);
  add('M1b', 'Motor 1, cable B (pata 6)', ['U1.6', 'M1.b', 'C4.b']);
  add('M2a', 'Motor 2, cable A (pata 14)', ['U1.14', 'M2.a', 'C5.a']);
  add('M2b', 'Motor 2, cable B (pata 11)', ['U1.11', 'M2.b', 'C5.b']);
  return nets;
}

// ------------------------------------------------------------------ verificación
function verify(M, exp) {
  const par = {};
  const find = a => { if (par[a] === undefined) par[a] = a; return par[a] === a ? a : (par[a] = find(par[a])); };
  const uni = (a, b) => { par[find(a)] = find(b); };
  const strips = n => strip(M.pins[n]);
  M.wires.forEach(w => uni(strip(w.a), strip(w.b)));
  M.joins.forEach(([a, b]) => uni(strips(a), strips(b)));
  const errors = [];
  const rootsSeen = {};
  Object.entries(exp).forEach(([id, net]) => {
    const roots = new Set(net.pins.map(p => find(strips(p))));
    if (roots.size !== 1) errors.push(`La red ${id} (${net.name}) está partida en ${roots.size} redes: ${net.pins.join(', ')}`);
    const r = [...roots][0];
    if (rootsSeen[r]) errors.push(`Las redes ${id} y ${rootsSeen[r]} quedaron unidas por error`);
    rootsSeen[r] = id; net.root = r;
  });
  const inNet = new Set(Object.values(exp).flatMap(n => n.pins));
  Object.keys(M.pins).forEach(p => {
    if (inNet.has(p) || p === 'SW.out') return;
    if (/^(U[12]|Q[12][LR])\./.test(p)) { const r = rootsSeen[find(strips(p))]; if (r) errors.push(`La pata ${p} (sin uso) quedó unida a ${r}`); return; }
    errors.push(`La pata ${p} no pertenece a ninguna red esperada`);
  });
  if (errors.length) throw new Error(`Paso ${M.step}:\n - ` + errors.join('\n - '));
  const idx = {};
  Object.keys(exp).forEach((id, i) => { idx[exp[id].root] = 'n' + i; exp[id].idx = 'n' + i; });
  return { find, netOfStrip: s => idx[find(s)] || null };
}

// ------------------------------------------------------------------ dibujo
const f1 = n => Math.round(n * 10) / 10;
function render(M, exp, V, opts) {
  const out = [];
  const add = s => out.push(s);
  const nets = V.netOfStrip;
  const netsOf = names => { const s = new Set(names.map(p => (M.pins[p] ? nets(strip(M.pins[p])) : null)).filter(Boolean)); return s.size ? ` data-nets="${[...s].join(' ')}"` : ''; };
  const cls = (base, e) => `${base}${e.isNew && !opts.plain ? ' new' : ''}${e.ghost ? ' gone' : ''}`;
  const focus = [];
  const track = (e, pts) => { if ((e.isNew || e.ghost) && !opts.plain) pts.forEach(p => focus.push(p)); };
  const legLine = (x1, y1, x2, y2) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="#9aa0a6" stroke-width="2.4" stroke-linecap="round"/>`;
  const cross = (cx, cy) => `<g class="x"><circle cx="${f1(cx)}" cy="${f1(cy)}" r="14" fill="#fff" stroke="#d62828" stroke-width="3"/><path d="M${f1(cx - 6)},${f1(cy - 6)} L${f1(cx + 6)},${f1(cy + 6)} M${f1(cx + 6)},${f1(cy - 6)} L${f1(cx - 6)},${f1(cy + 6)}" stroke="#d62828" stroke-width="3.4" stroke-linecap="round"/></g>`;

  // ---- tablero
  const bx1 = colX(1) - 34, bx2 = colX(NCOL) + 34;
  add(`<rect x="${bx1}" y="${Y_TN - 30}" width="${bx2 - bx1}" height="${Y_BN - Y_TN + 60}" rx="14" fill="#f4f1e8" stroke="#c9c3b0" stroke-width="2"/>`);
  add(`<rect x="${bx1 + 8}" y="${Y_F + 0.9 * P}" width="${bx2 - bx1 - 16}" height="${Y_E - Y_F - 1.8 * P}" rx="6" fill="#e5e0cf"/>`);
  [['Tn', C.blue, '−'], ['Tp', C.red, '+'], ['Bp', C.red, '+'], ['Bn', C.blue, '−']].forEach(([r, col, sg]) => {
    const y = RAILY[r], net = nets(r);
    add(`<rect class="strip" fill="none" x="${colX(1) - 6}" y="${y - 10}" width="${colX(NCOL) - colX(1) + P + 12}" height="20" rx="8"${net ? ` data-net="${net}"` : ''}/>`);
    add(`<line x1="${colX(1) - 14}" y1="${y - 13}" x2="${colX(NCOL) + P + 8}" y2="${y - 13}" stroke="${col}" stroke-width="1.6" opacity=".55"/>`);
    add(`<text x="${colX(1) - 24}" y="${y + 5}" font-size="17" font-weight="bold" fill="${col}" text-anchor="middle">${sg}</text>`);
    for (let c = 1; c <= NCOL; c++) add(`<circle class="hole" fill="#5a5648"${net ? ` data-net="${net}"` : ''} cx="${f1(colX(c) + P / 2)}" cy="${y}" r="2.6"/>`);
  });
  for (let c = 1; c <= NCOL; c++) {
    ['T', 'B'].forEach(half => {
      const net = nets(half + c);
      const yA = half === 'B' ? Y_E : Y_F - 4 * P, yB = half === 'B' ? Y_E + 4 * P : Y_F;
      add(`<rect class="strip" fill="none" x="${colX(c) - 9}" y="${yA - 9}" width="18" height="${yB - yA + 18}" rx="7"${net ? ` data-net="${net}"` : ''}/>`);
      for (let k = 0; k < 5; k++) add(`<circle class="hole" fill="#5a5648"${net ? ` data-net="${net}"` : ''} cx="${colX(c)}" cy="${half === 'B' ? Y_E + k * P : Y_F - k * P}" r="2.8"/>`);
    });
    if (c === 1 || c % 5 === 0) {
      add(`<text x="${colX(c)}" y="${Y_TN - 18}" font-size="9" fill="#8b8573" text-anchor="middle">${c}</text>`);
      add(`<text x="${colX(c)}" y="${Y_BN + 24}" font-size="9" fill="#8b8573" text-anchor="middle">${c}</text>`);
    }
  }

  // ---- piezas
  const wrapPart = (e, inner) => `<g class="${cls('part', e)}"${e.ghost ? '' : netsOf(e.pinNames || [])}>${inner}</g>`;
  [...M.parts, ...M.ghostParts].forEach(e => {
    const g = e.ghost;
    if (e.kind === 'res') {
      const A = pos(e.a), B = pos(e.b), y = A.y, cx = (A.x + B.x) / 2, L = Math.abs(B.x - A.x), bl = L - 1.15 * P, dir = chDir(e.half);
      const ly = y + (e.lab === 'ch' ? dir * 0.95 * P : -dir * 0.95 * P);
      let s = legLine(A.x, y, cx - bl / 2 + 2, y) + legLine(cx + bl / 2 - 2, y, B.x, y);
      s += `<rect x="${f1(cx - bl / 2)}" y="${f1(y - 0.4 * P)}" width="${f1(bl)}" height="${f1(0.8 * P)}" rx="7" fill="#e7cf9b" stroke="#b39657" stroke-width="1.3"/>`;
      [0.22, 0.38, 0.54].forEach((fr, i) => { s += `<rect x="${f1(cx - bl / 2 + bl * fr)}" y="${f1(y - 0.4 * P + 1)}" width="5" height="${f1(0.8 * P - 2)}" fill="${e.bands[i]}"/>`; });
      s += `<rect x="${f1(cx - bl / 2 + bl * 0.8)}" y="${f1(y - 0.4 * P + 1)}" width="4.5" height="${f1(0.8 * P - 2)}" fill="#c9a227"/>`;
      s += `<text x="${f1(cx)}" y="${f1(ly + 3)}" font-size="9.5" fill="#3a3a3a" stroke="#f4f1e8" stroke-width="3" paint-order="stroke" text-anchor="middle">${e.val}</text>`;
      if (g) s += cross(cx, y);
      add(wrapPart(e, s)); track(e, [[A.x - 10, y - 28], [B.x + 10, y + 28]]);
    } else if (e.kind === 'led') {
      const A = pos(e.a), K = pos(e.k), y = A.y, dir = chDir(e.half), cx = (A.x + K.x) / 2, cy = y + dir * 0.85 * P, r = 0.55 * P;
      const look = { ir: ['#eef3f6', '#8c99a3', '#34454f'], rx: ['#2b2b2b', '#111', '#ffffff'], red: ['#ee4a3f', '#a02820', '#ffffff'] }[e.look];
      let s = legLine(A.x, y, A.x, cy) + legLine(K.x, y, K.x, cy);
      s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${look[0]}" stroke="${look[1]}" stroke-width="2"/>`;
      s += `<circle cx="${f1(cx - 4)}" cy="${f1(cy - dir * 4)}" r="3.2" fill="#fff" opacity=".35"/>`;
      s += `<text x="${f1(A.x + 3)}" y="${f1(cy + 4)}" font-size="11" font-weight="bold" fill="${look[2]}" text-anchor="middle">+</text>`;
      s += `<text x="${f1(K.x - 3)}" y="${f1(cy + 4)}" font-size="12" font-weight="bold" fill="${look[2]}" text-anchor="middle">−</text>`;
      add(wrapPart(e, s)); track(e, [[A.x - 18, cy - 24], [K.x + 18, y + 10]]);
    } else if (e.kind === 'pot') {
      const A = pos(e.a), W = pos(e.w), B = pos(e.b), y = A.y, dir = chDir(e.half), cy = y - dir * 1.45 * P, bw = 3.7 * P, bh = 1.9 * P;
      let s = '';
      [A, W, B].forEach(p => { s += legLine(p.x, y, p.x, cy - dir * 0.2); });
      s += `<rect x="${f1(W.x - bw / 2)}" y="${f1(cy - bh / 2)}" width="${f1(bw)}" height="${f1(bh)}" rx="5" fill="#2f6fd0" stroke="#1c4a96" stroke-width="2"/>`;
      s += `<circle cx="${f1(W.x)}" cy="${f1(cy)}" r="${f1(0.55 * P)}" fill="#dfe8f6" stroke="#1c4a96" stroke-width="1.5"/>`;
      s += `<line x1="${f1(W.x - 5)}" y1="${f1(cy + 5)}" x2="${f1(W.x + 5)}" y2="${f1(cy - 5)}" stroke="#1c4a96" stroke-width="2.6"/>`;
      add(wrapPart(e, s)); track(e, [[W.x - 50, cy - 30], [W.x + 50, y + 12]]);
    } else if (e.kind === 'tr') {
      // Vista desde arriba: cuerpo en forma de D, con la cara PLANA siempre hacia abajo (hacia ti).
      // Mirando la cara plana, de izquierda a derecha: E (emisor), B (base), C (colector).
      const E = pos(e.e), Cc = pos(e.c), Bp = pos(e.b), y = E.y;
      const lr = [['E', E], ['B', Bp], ['C', Cc]].sort((a, b) => a[1].x - b[1].x);
      const xL = lr[0][1].x - 0.5 * P, xR = lr[2][1].x + 0.5 * P, flat = y + 0.55 * P, r = (xR - xL) / 2;
      let s = `<path d="M${f1(xL)},${f1(flat)} A${f1(r)},${f1(r)} 0 0 1 ${f1(xR)},${f1(flat)} Z" fill="#2f2f2f" stroke="#111" stroke-width="1.5"/>`;
      s += `<line x1="${f1(xL)}" y1="${f1(flat)}" x2="${f1(xR)}" y2="${f1(flat)}" stroke="#ffd400" stroke-width="4" stroke-linecap="round"/>`;
      s += `<text x="${f1((xL + xR) / 2)}" y="${f1(flat - 5)}" font-size="8.5" font-weight="bold" fill="#ffd400" text-anchor="middle">plana</text>`;
      lr.map(a => a[1]).forEach(p => { s += `<circle cx="${f1(p.x)}" cy="${f1(y)}" r="3.4" fill="#d9d9d9" stroke="#777" stroke-width="1"/>`; });
      lr.forEach(([t, p]) => { s += `<text x="${f1(p.x)}" y="${f1(flat + 14)}" font-size="13" font-weight="bold" fill="#111" stroke="#f4f1e8" stroke-width="3" paint-order="stroke" text-anchor="middle">${t}</text>`; });
      if (g) s += cross((xL + xR) / 2, y - 0.2 * P);
      add(wrapPart(e, s)); track(e, [[xL - 12, y - r - 8], [xR + 12, flat + 24]]);
    } else if (e.kind === 'barrier') {
      const x = colX(e.col), dir = chDir(e.half), yc = (e.half === 'B' ? Y_E : Y_F) + dir * P;
      add(`<g class="${cls('part', e)}"><rect x="${f1(x - 5)}" y="${f1(yc - 21)}" width="10" height="42" rx="3" fill="#111"/></g>`); track(e, [[x - 10, yc - 25], [x + 10, yc + 25]]);
    } else if (e.kind === 'chip') {
      const half = e.n / 2, cx1 = colX(e.start) - 0.6 * P, cx2 = colX(e.start + half - 1) + 0.6 * P, yT = Y_F + 0.45 * P, yB = Y_E - 0.45 * P, my = (yT + yB) / 2;
      let s = '';
      for (let i = 0; i < half; i++) { const x = colX(e.start + i); s += `<line x1="${x}" y1="${Y_F}" x2="${x}" y2="${yT}" stroke="#9aa0a6" stroke-width="3"/><line x1="${x}" y1="${yB}" x2="${x}" y2="${Y_E}" stroke="#9aa0a6" stroke-width="3"/>`; }
      s += `<rect x="${f1(cx1)}" y="${f1(yT)}" width="${f1(cx2 - cx1)}" height="${f1(yB - yT)}" rx="4" fill="#2a2a2a" stroke="#111" stroke-width="1.5"/>`;
      s += `<path d="M${f1(cx1)},${f1(my - 9)} A9,9 0 0 1 ${f1(cx1)},${f1(my + 9)}" fill="#f4f1e8" stroke="#111" stroke-width="1.5"/>`;
      s += `<text x="${f1((cx1 + cx2) / 2 + 6)}" y="${f1(my + 6)}" font-size="${e.n === 16 ? 19 : 17}" font-weight="bold" fill="#e9e9e9" text-anchor="middle">${e.name}</text>`;
      for (let i = 0; i < half; i++) { const x = colX(e.start + i); s += `<text x="${x}" y="${f1(yT + 12)}" font-size="9.5" fill="#cfcfcf" text-anchor="middle">${e.top[i]}</text><text x="${x}" y="${f1(yB - 5)}" font-size="9.5" fill="#cfcfcf" text-anchor="middle">${e.bottom[i]}</text>`; }
      add(wrapPart(e, s)); track(e, [[cx1 - 10, Y_F - 20], [cx2 + 10, Y_E + 20]]);
    } else if (e.kind === 'cap') {
      const xp = colX(e.col) + 0.5 * P, xm = colX(e.col + 1) + 0.5 * P, ele = e.capKind === 'ele', by = Y_TN - 1.9 * P, cx = (xp + xm) / 2;
      let s = `<polyline points="${f1(xp)},${Y_TP} ${f1(xp)},${f1(by + 0.6 * P)}" fill="none" stroke="#9aa0a6" stroke-width="2.4" stroke-linecap="round"/><polyline points="${f1(xm)},${Y_TN} ${f1(xm)},${f1(by + 0.6 * P)}" fill="none" stroke="#9aa0a6" stroke-width="2.4" stroke-linecap="round"/>`;
      if (ele) {
        const w = 1.5 * P;
        s += `<rect x="${f1(cx - w / 2)}" y="${f1(by - 1.1 * P)}" width="${f1(w)}" height="${f1(1.9 * P)}" rx="6" fill="#26457a" stroke="#142a4d" stroke-width="1.5"/>`;
        s += `<rect x="${f1(xm - 0.45 * P)}" y="${f1(by - 1.1 * P)}" width="${f1(0.55 * P)}" height="${f1(1.9 * P)}" rx="3" fill="#c9d4e8"/>`;
        s += `<text x="${f1(xm - 0.18 * P)}" y="${f1(by - 0.1 * P)}" font-size="14" font-weight="bold" fill="#1a1a1a" text-anchor="middle">−</text>`;
        s += `<text x="${f1(cx - 0.42 * P)}" y="${f1(by - 0.1 * P)}" font-size="15" font-weight="bold" fill="#fff" text-anchor="middle">+</text>`;
        s += `<text x="${f1(cx)}" y="${f1(by - 1.4 * P)}" font-size="9.5" fill="#4a4a4a" text-anchor="middle">${e.val}</text>`;
      } else {
        s += `<circle cx="${f1(cx)}" cy="${f1(by)}" r="${f1(0.62 * P)}" fill="#e8b25a" stroke="#a77a2a" stroke-width="1.5"/><text x="${f1(cx)}" y="${f1(by + 3.5)}" font-size="9" font-weight="bold" fill="#5b3b05" text-anchor="middle">104</text>`;
      }
      add(wrapPart(e, s)); track(e, [[xp - 30, by - 40], [xm + 30, Y_TN + 12]]);
    } else if (e.kind === 'motor') {
      let s = `<rect x="${f1(e.cx - 38)}" y="${f1(e.cy - 30)}" width="76" height="60" rx="14" fill="#c9ced3" stroke="#6b7278" stroke-width="2.5"/><circle cx="${f1(e.cx)}" cy="${f1(e.cy)}" r="19" fill="#eceff1" stroke="#6b7278" stroke-width="2"/><text x="${f1(e.cx)}" y="${f1(e.cy + 8)}" font-size="22" font-weight="bold" fill="#333" text-anchor="middle">M</text>`;
      [e.pts.a, e.pts.b].forEach(p => { s += `<rect x="${p.x - 4}" y="${f1(p.y - 4)}" width="8" height="8" fill="#d9a441" stroke="#8a6a1f"/>`; });
      add(wrapPart(e, s)); track(e, [[e.cx - 48, e.cy - 40], [e.cx + 48, e.cy + 40]]);
    } else if (e.kind === 'mcap') {
      const m = e.M, dir = m.side === 'B' ? 1 : -1, cy = m.cy + dir * -52, cx = m.cx;
      let s = `<polyline points="${e.pts.a.x},${e.pts.a.y} ${e.pts.a.x},${f1(cy)} ${f1(cx - 4)},${f1(cy)}" fill="none" stroke="#9aa0a6" stroke-width="2"/><polyline points="${e.pts.b.x},${e.pts.b.y} ${e.pts.b.x},${f1(cy)} ${f1(cx + 4)},${f1(cy)}" fill="none" stroke="#9aa0a6" stroke-width="2"/>`;
      s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="9" fill="#e8b25a" stroke="#a77a2a" stroke-width="1.3"/><text x="${f1(cx)}" y="${f1(cy + 3)}" font-size="7.5" font-weight="bold" fill="#5b3b05" text-anchor="middle">104</text>`;
      add(wrapPart(e, s)); track(e, [[cx - 30, cy - 20], [cx + 30, cy + 20]]);
    } else if (e.kind === 'battery') {
      let s = `<rect x="${e.x}" y="${e.y}" width="150" height="70" rx="9" fill="#4a4f55" stroke="#2c2f33" stroke-width="2"/>`;
      [0, 1, 2, 3].forEach(i => { s += `<circle cx="${e.x + 28 + i * 31}" cy="${e.y + 35}" r="11" fill="#8fa0ad" stroke="#2c2f33" stroke-width="1.5"/>`; });
      s += `<text x="${e.x + 12}" y="${e.y + 22}" font-size="17" font-weight="bold" fill="#ff8e8e" text-anchor="middle">+</text><text x="${e.x + 12}" y="${e.y + 62}" font-size="19" font-weight="bold" fill="#9ec5ff" text-anchor="middle">−</text>`;
      add(wrapPart(e, s)); track(e, [[e.x - 10, e.y - 10], [e.x + 160, e.y + 80]]);
    } else if (e.kind === 'switch') {
      const x1s = e.a.x, x2s = e.b.x, y = e.a.y;
      add(`<g class="${cls('part', e)}"${netsOf(['SW.in'])}><rect x="${x1s - 10}" y="${y - 12}" width="${x2s - x1s + 20}" height="24" rx="5" fill="#2b2b2b"/><rect x="${x1s + 4}" y="${y - 8}" width="${(x2s - x1s) / 2}" height="16" rx="3" fill="#d9d9d9"/></g>`); track(e, [[x1s - 14, y - 16], [x2s + 14, y + 16]]);
    } else if (e.kind === 'meter') {
      let s = `<rect x="${e.x}" y="${e.y}" width="130" height="96" rx="10" fill="#f3d03e" stroke="#9a8110" stroke-width="2"/><rect x="${e.x + 14}" y="${e.y + 12}" width="102" height="38" rx="4" fill="#e6f3d6" stroke="#6b7a50" stroke-width="1.5"/>`;
      s += `<text x="${e.x + 65}" y="${e.y + 40}" font-size="24" font-weight="bold" fill="#222" text-anchor="middle">6,0 V</text>`;
      s += `<circle cx="${e.jr.x}" cy="${e.jr.y}" r="6" fill="#d62828" stroke="#7a1010"/><circle cx="${e.jb.x}" cy="${e.jb.y}" r="6" fill="#222" stroke="#000"/>`;
      add(wrapPart(e, s)); track(e, [[e.x - 10, e.y - 10], [e.x + 140, e.y + 110]]);
    }
  });

  // ---- etiquetas N y S de las columnas (solo en el paso 2)
  if (Math.floor(M.step) === 2) {
    const bub = (col, letter) => add(`<g class="bub"><circle cx="${colX(col)}" cy="${f1(Y_E + P)}" r="10" fill="#fff" stroke="#0f6fd6" stroke-width="2.5"/><text x="${colX(col)}" y="${f1(Y_E + P + 5)}" font-size="13" font-weight="bold" fill="#0f6fd6" text-anchor="middle">${letter}</text></g>`);
    if (M.pins['D2L.L']) bub(21, 'N');
    if (M.pins['D3L.K']) bub(31, 'S');
  }

  // ---- cables
  const roundedPath = (pts, r) => {
    let d = `M${f1(pts[0].x)},${f1(pts[0].y)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
      const l1 = Math.hypot(p1.x - p0.x, p1.y - p0.y), l2 = Math.hypot(p2.x - p1.x, p2.y - p1.y), r1 = Math.min(r, l1 / 2), r2 = Math.min(r, l2 / 2);
      const a = { x: p1.x - (p1.x - p0.x) / l1 * r1, y: p1.y - (p1.y - p0.y) / l1 * r1 }, b = { x: p1.x + (p2.x - p1.x) / l2 * r2, y: p1.y + (p2.y - p1.y) / l2 * r2 };
      d += ` L${f1(a.x)},${f1(a.y)} Q${f1(p1.x)},${f1(p1.y)} ${f1(b.x)},${f1(b.y)}`;
    }
    return d + ` L${f1(pts[pts.length - 1].x)},${f1(pts[pts.length - 1].y)}`;
  };
  function wirePath(w) {
    const A = pos(w.a), B = pos(w.b);
    let mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    if (w.kind === 'rails') return { d: `M${f1(A.x)},${f1(A.y)} L${w.x},${f1(A.y)} L${w.x},${f1(B.y)} L${f1(B.x)},${f1(B.y)}`, pts: [A, B, { x: w.x, y: A.y }], mid: { x: w.x, y: mid.y } };
    if (w.kind === 'jumper') { const mx = mid.x + 7; return { d: `M${f1(A.x)},${f1(A.y)} Q${f1(mx)},${f1(mid.y)} ${f1(B.x)},${f1(B.y)}`, pts: [A, B], mid }; }
    if (w.kind === 'lane') {
      const laneY = w.a.half === 'B' ? Y_BN + w.depth : Y_TN - w.depth;
      const pts = [A, { x: A.x + (w.dx1 || 0), y: laneY }, { x: B.x + (w.dx2 || 0), y: laneY }, B];
      return { d: roundedPath(pts, 14), pts, mid: { x: (pts[1].x + pts[2].x) / 2, y: laneY } };
    }
    if (w.kind === 'hop') {
      const a = w.a.half === 'B' ? 1 : -1, cy = (a === 1 ? Math.max(A.y, B.y) : Math.min(A.y, B.y)) + a * w.bulge * 2;
      return { d: `M${f1(A.x)},${f1(A.y)} Q${f1(mid.x)},${f1(cy)} ${f1(B.x)},${f1(B.y)}`, pts: [A, B, { x: mid.x, y: cy }], mid: { x: mid.x, y: (A.y + cy) / 2 + (cy - A.y) * 0.0 + (a === 1 ? w.bulge * 0.5 : -w.bulge * 0.5) } };
    }
    if (w.kind === 'across') { const c1 = { x: A.x - 52, y: A.y - 70 }, c2 = { x: B.x - 52, y: B.y + 70 }; return { d: `M${f1(A.x)},${f1(A.y)} C${f1(c1.x)},${f1(c1.y)} ${f1(c2.x)},${f1(c2.y)} ${f1(B.x)},${f1(B.y)}`, pts: [A, B, c1, c2], mid: { x: mid.x - 40, y: mid.y } }; }
    if (w.kind === 'motor') return { d: `M${f1(A.x)},${f1(A.y)} C${f1(A.x)},${f1(mid.y)} ${f1(B.x)},${f1(mid.y)} ${f1(B.x)},${f1(B.y)}`, pts: [A, B], mid };
    const my = mid.y + (w.bend || 0) / 2;
    return { d: `M${f1(A.x)},${f1(A.y)} Q${f1(mid.x)},${f1(mid.y + (w.bend || 0))} ${f1(B.x)},${f1(B.y)}`, pts: [A, B, { x: mid.x, y: mid.y + (w.bend || 0) }], mid: { x: mid.x, y: my } };
  }
  const drawWire = w => {
    const { d, pts, mid } = wirePath(w), A = pos(w.a), B = pos(w.b);
    const net = w.ghost ? null : nets(strip(w.a));
    let g = `<g class="${cls('wire', w)}"${net ? ` data-net="${net}"` : ''}>`;
    g += `<path d="${d}" fill="none" stroke="#f4f1e8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
    g += `<path d="${d}" fill="none" stroke="${w.color}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    [A, B].forEach(p => { g += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="3.6" fill="${w.color}" stroke="#f4f1e8" stroke-width="1.2"/>`; });
    if (w.ghost) g += cross(mid.x, mid.y);
    g += '</g>';
    add(g); track(w, pts.map(p => [p.x - 14, p.y - 14]).concat(pts.map(p => [p.x + 14, p.y + 14])));
  };
  const near = w => w.kind === 'rails' || w.kind === 'jumper';
  [...M.wires.filter(near), ...M.ghostWires.filter(near)].forEach(drawWire);
  [...M.wires.filter(w => !near(w)), ...M.ghostWires.filter(w => !near(w))].forEach(drawWire);
  return { svg: out.join('\n'), focus };
}

// ------------------------------------------------------------------ páginas
function build(step, { plain = false } = {}) {
  const M = buildModel(step);
  const exp = expectedNets(M);
  const V = verify(M, exp);
  const { svg, focus } = render(M, exp, V, { plain });
  const names = {}; Object.values(exp).forEach(n => { names[n.idx] = n.name; });
  let vb = `0 0 ${f1(W_SVG)} ${f1(H_SVG)}`;
  // contexto: que se vea el chip al que se conecta lo nuevo
  if (focus.length && !plain) {
    const box = (c0, c1) => { focus.push([colX(c0) - 30, Y_F - 60], [colX(c1) + 30, Y_E + 60]); };
    if ([4, 5, 6, 10].includes(Math.floor(step))) box(L2, L2 + 7);
    if (step === 8) box(LM, LM + 3);
  }
  if (focus.length) {
    let [mnx, mny, mxx, mxy] = [1e9, 1e9, -1e9, -1e9];
    focus.forEach(([x, y]) => { mnx = Math.min(mnx, x); mny = Math.min(mny, y); mxx = Math.max(mxx, x); mxy = Math.max(mxy, y); });
    const pad = 40; mnx -= pad; mny -= pad; mxx += pad; mxy += pad;
    let w = mxx - mnx, h = mxy - mny;
    const ratio = 1.75;
    if (w / h < ratio) { const nw = h * ratio; mnx -= (nw - w) / 2; w = nw; } else { const nh = w / ratio; mny -= (nh - h) / 2; h = nh; }
    if (w < 620) { const nh = 620 / ratio; mnx -= (620 - w) / 2; mny -= (nh - h) / 2; w = 620; h = nh; }
    mnx = Math.max(0, mnx); mny = Math.max(0, mny);
    w = Math.min(w, W_SVG - mnx); h = Math.min(h, H_SVG - mny);
    vb = `${f1(mnx)} ${f1(mny)} ${f1(w)} ${f1(h)}`;
  }
  return { M, exp, svg, names, vb, nets: Object.keys(exp).length, wires: M.wires.length, pins: Object.keys(M.pins).length };
}

const tpl = fs.readFileSync(path.join(__dirname, 'protoboard-template.html'), 'utf8');
const svgWrap = inner => `<svg id="board" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f1(W_SVG)} ${f1(H_SVG)}" font-family="Segoe UI, Arial, sans-serif">\n${inner}\n</svg>`;
const pageHtml = o => tpl
  .replace('/*NETNAMES*/{}', JSON.stringify(o.names)).replace('<!--SVG-->', o.svg).replace(/__W__/g, String(Math.round(W_SVG)))
  .replace(/__TITLE__/g, o.title).replace('__HINT__', o.hint ? '<div class="help">' + o.hint + '</div>' : '').replace('__SHORT__', o.short || o.title).replace('__NAV__', o.nav).replace('__PIN__', o.pin || '').replace('__LEGEND__', o.legend)
  .replace('__FOCUS__', o.focus).replace('__FULL__', `0 0 ${f1(W_SVG)} ${f1(H_SVG)}`).replace('__HASFOCUS__', o.focus === `0 0 ${f1(W_SVG)} ${f1(H_SVG)}` ? '0' : '1');
module.exports = { Q1CBE, ONE, CBE, build, svgWrap, pageHtml, f1, W_SVG, H_SVG, TITLES, HINTS, APOYO, PASOS, ROOT, fs, path };
