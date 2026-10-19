// Diseño de la PCB del carrito (esquema A: sensores IR + LM358 + L293D, todo a 6 V).
// Define piezas, redes y colocación. Lo usan docs/gen-pcb-carrito.js y la búsqueda de colocación.
'use strict';
const G = 5;                        // celdas por 2,54 mm
const W_G = +process.env.PCB_W || 40, H_G = +process.env.PCB_H || 30;   // tamaño de la placa en pasos de 2,54 mm

// ---- piezas: huella (pads relativos en celdas, rotación 0) y cuerpo (rect en celdas relativas)
const FP = {
  res:  { pads: { a: [0, 0], b: [20, 0] }, d: 1.8, drill: 0.8, body: [3, -3, 17, 3] },
  led:  { pads: { A: [0, 0], K: [5, 0] }, d: 1.8, drill: 0.8, body: [-2, -9, 7, 0] },
  led5: { pads: { A: [0, 0], K: [5, 0] }, d: 1.8, drill: 0.8, body: [-3, -5, 8, 5] },
  rx:   { pads: { S: [0, 0], L: [5, 0] }, d: 1.8, drill: 0.8, body: [-2, -9, 7, 0] },
  pot:  { pads: { A: [0, 0], W: [5, 0], B: [10, 0] }, d: 1.8, drill: 0.9, body: [-3, -4, 13, 4] },
  cap:  { pads: { a: [0, 0], b: [10, 0] }, d: 1.8, drill: 0.8, body: [1, -3, 9, 3] },
  ele:  { pads: { '+': [0, 0], '-': [7, 0] }, d: 2.0, drill: 0.9, body: [-6, -9, 13, 9] },
  lnk:  { pads: { a: [0, 0], b: [20, 0] }, d: 1.8, drill: 0.8, body: [2, -1, 18, 1] },
  tb2:  { pads: { a: [0, 0], b: [10, 0] }, d: 2.6, drill: 1.3, body: [-5, -8, 15, 8] },
};
const dip = n => { const pads = {}, h = n / 2; for (let i = 0; i < h; i++) { pads[String(i + 1)] = [0, i * 5]; pads[String(n - i)] = [15, i * 5]; } return { pads, d: 1.8, drill: 0.8, body: [1, -4, 14, (h - 1) * 5 + 4], dip: n }; };
FP.dip8 = dip(8); FP.dip16 = dip(16);

const rotP = ([x, y], r) => (r === 0 ? [x, y] : r === 90 ? [-y, x] : r === 180 ? [-x, -y] : [y, -x]);
const rotR = ([x0, y0, x1, y1], r) => { const a = rotP([x0, y0], r), b = rotP([x1, y1], r); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };

// ---- lista de piezas: ref, huella, valor, nota
const PARTS = [];
const part = (ref, fp, val, note) => PARTS.push({ ref, fp, val, note: note || '' });
['I', 'D'].forEach(s => {
  const lado = s === 'I' ? 'izquierdo' : 'derecho';
  part('R1' + s, 'res', '220 Ω', `resistencia del emisor IR ${lado}`);
  part('R2' + s, 'res', '1 kΩ', `resistencia del LED rojo ${lado}`);
  part('R3' + s, 'res', '1 kΩ', `resistencia del receptor IR ${lado}`);
  part('R4' + s, 'res', '10 kΩ', `pull-up de la salida ${lado}`);
  part('R5' + s, 'res', '47 kΩ', `umbral ${lado}`);
  part('P1' + s, 'pot', '10 kΩ', `potenciómetro o trimmer de umbral ${lado}`);
  part('D1' + s, 'led', 'LED IR emisor', `emisor IR ${lado}`);
  part('D2' + s, 'rx', 'Receptor IR', `receptor IR ${lado}`);
  part('D3' + s, 'led5', 'LED rojo', `aviso de obstáculo ${lado}`);
});
part('U1', 'dip16', 'L293D', 'driver de motores');
part('U2', 'dip8', 'LM358', 'comparador doble');
part('C1', 'ele', '470 µF', 'condensador electrolítico');
part('C2', 'cap', '100 nF', 'condensador cerámico');
part('C3', 'cap', '100 nF', 'condensador cerámico');
part('J1', 'tb2', 'Pila', 'entrada de la pila: + y −');
part('J2', 'tb2', 'Interruptor', 'los dos cables del interruptor');
part('J3', 'tb2', 'Motor rueda DER.', 'motor de la rueda DERECHA');
part('J4', 'tb2', 'Motor rueda IZQ.', 'motor de la rueda IZQUIERDA');

['GI', 'GD'].forEach(k => part('W' + k, 'lnk', 'puente', 'puente de alambre del negativo (' + (k[1] === 'I' ? 'lado izquierdo' : 'lado derecho') + ')'));
part('WVT', 'lnk', 'puente', 'puente de alambre del positivo (arriba del L293D con abajo)');
part('WOD', 'lnk', 'puente', 'puente de alambre de la salida del comparador derecho al L293D');
part('WOI', 'lnk', 'puente', 'puente de alambre de la salida del comparador izquierdo al L293D');

// ---- redes (pata = REF.PIN)
const NETS = {
  VBAT: ['J1.a', 'J2.a'],
  VCC: ['J2.b', 'U1.8', 'U1.9', 'C1.+', 'C2.a', 'C3.a', 'WVT.b'],
  VCCT: ['WVT.a', 'U1.1', 'U1.16', 'U2.8', 'R1I.a', 'R2I.a', 'R4I.a', 'R5I.a', 'D2I.S', 'R1D.a', 'R2D.a', 'R4D.a', 'R5D.a', 'D2D.S'],
  GND: ['J1.b', 'U1.4', 'U1.5', 'U1.7', 'U1.10', 'U1.12', 'U1.13', 'C1.-', 'C2.b', 'C3.b', 'WGI.b', 'WGD.b'],
  GNDI: ['WGI.a', 'D1I.K', 'R3I.b', 'P1I.B', 'U2.4'],
  GNDD: ['WGD.a', 'D1D.K', 'R3D.b', 'P1D.B'],
  EI: ['R1I.b', 'D1I.A'], NI: ['D2I.L', 'R3I.a', 'U2.2'], TI: ['R5I.b', 'P1I.A'], WI: ['P1I.W', 'U2.3'],
  AI: ['R2I.b', 'D3I.A'], OI: ['U2.1', 'R4I.b', 'D3I.K', 'WOI.a'],
  OI2: ['WOI.b', 'U1.2'],
  ED: ['R1D.b', 'D1D.A'], ND: ['D2D.L', 'R3D.a', 'U2.6'], TD: ['R5D.b', 'P1D.A'], WD: ['P1D.W', 'U2.5'],
  AD: ['R2D.b', 'D3D.A'], OD: ['U2.7', 'R4D.b', 'D3D.K', 'WOD.a'],
  OD2: ['WOD.b', 'U1.15'],
  M1A: ['U1.3', 'J3.a'], M1B: ['U1.6', 'J3.b'], M2A: ['U1.14', 'J4.a'], M2B: ['U1.11', 'J4.b'],
};
const SIGNAL_ORDER = Object.keys(NETS);

// ---- colocación (en pasos de 2,54 mm; x,y de la pata 1 / primera pata; rot en grados)
const g = v => Math.round(v * G);
const PLACE = {
  D1I: [2, 3, 0], D2I: [7, 3, 0], D1D: [38, 3, 180], D2D: [33, 3, 180],
  D3I: [12, 3, 0], D3D: [28, 3, 180],
  P1I: [11, 9, 0], P1D: [29, 9, 180],
  R1I: [2, 6, 90], R3I: [8, 6, 90], R5I: [11, 13, 90],
  R1D: [38, 6, 90], R3D: [32, 6, 90], R5D: [29, 13, 90],
  R4I: [2, 14, 0], R2I: [2, 17, 0], R4D: [34, 14, 0], R2D: [34, 17, 0],
  U2: [18, 5, 0], U1: [18, 11, 0],
  C1: [10, 22, 0], C2: [13, 20, 0], C3: [26, 20, 0],
  J1: [8, 27, 0], J2: [16, 27, 0], J3: [3, 27, 0], J4: [35, 27, 0],
  WVI: [4, 21, 0], WVD: [32, 21, 0], WGI: [4, 23, 0], WGD: [32, 23, 0], WVT: [24, 9, 0], WOI: [10, 13, 0],
};
// agujeros de montaje M3
const HOLES = [[1.5, 19], [38.5, 19], [9, 28.3], [31, 28.3]];

// zonas prohibidas por red (en pasos de 2,54 mm: [x0, y0, x1, y1]): fuerzan a la salida de cada comparador a bajar por el canal central
const HINTS_G = {
  OI: [[12, 5.7, 17.9, 19]],
  OD: [[21.1, 6.7, 27, 19]],
};
const hintsCells = () => { const o = {}; Object.keys(HINTS_G).forEach(k => { o[k] = HINTS_G[k].map(r => r.map(v => Math.round(v * G))); }); return o; };

function build(place = PLACE) {
  const pads = [], bodies = [], netNames = Object.keys(NETS);
  const netOf = {}; netNames.forEach((n, i) => NETS[n].forEach(p => { netOf[p] = i + 1; }));
  PARTS.forEach(p => {
    const fp = FP[p.fp], pl = place[p.ref]; if (!pl) throw new Error('Sin colocación: ' + p.ref);
    const ox = g(pl[0]), oy = g(pl[1]), rot = pl[2];
    p.x = ox; p.y = oy; p.rot = rot; p.pads = {};
    Object.entries(fp.pads).forEach(([n, rel]) => {
      const [dx, dy] = rotP(rel, rot);
      const pad = { id: p.ref + '.' + n, ref: p.ref, pin: n, x: ox + dx, y: oy + dy, r: fp.d / 2, drill: fp.drill, net: netOf[p.ref + '.' + n] || -2 };
      pads.push(pad); p.pads[n] = pad;
    });
    const b = rotR(fp.body, rot); p.body = [ox + b[0], oy + b[1], ox + b[2], oy + b[3]];
    bodies.push({ ref: p.ref, r: p.body, front: /^(D[12]|W)/.test(p.ref) });
  });
  const holes = HOLES.map(([x, y]) => ({ x: g(x), y: g(y), r: 3.4 }));
  return { pads, bodies, holes, netOf, netNames };
}

// comprueba choques de colocación (pads muy juntas de piezas distintas, cuerpos encimados, fuera de la placa)
function checkPlacement(B) {
  const errs = [], CELL = 2.54 / 5;
  const W = g(W_G), H = g(H_G);
  B.pads.forEach(p => { if (p.x < 5 || p.y < 5 || p.x > W - 5 || p.y > H - 5) errs.push(`${p.id} muy cerca del borde`); });
  for (let i = 0; i < B.pads.length; i++) for (let j = i + 1; j < B.pads.length; j++) {
    const a = B.pads[i], b = B.pads[j]; if (a.ref === b.ref) continue;
    const d = Math.hypot(a.x - b.x, a.y - b.y) * CELL;
    if (d < a.r + b.r + 0.6) errs.push(`${a.id} y ${b.id} muy juntas (${d.toFixed(1)} mm)`);
  }
  const solid = B.bodies.filter(b => !b.front);
  for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++) {
    const a = solid[i].r, b = solid[j].r;
    if (a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]) errs.push(`cuerpos ${solid[i].ref} y ${solid[j].ref} se pisan`);
  }
  solid.forEach(b => { const r = b.r; if (r[0] < 2 || r[1] < 2 || r[2] > W - 2 || r[3] > H - 2) errs.push(`cuerpo ${b.ref} fuera de la placa`); });
  B.holes.forEach(h => {
    B.pads.forEach(p => { if (Math.hypot(p.x - h.x, p.y - h.y) * CELL < h.r + p.r + 0.3) errs.push(`${p.id} choca con un agujero de montaje`); });
    solid.forEach(b => { const r = b.r; const cx = Math.max(r[0], Math.min(h.x, r[2])), cy = Math.max(r[1], Math.min(h.y, r[3])); if (Math.hypot(h.x - cx, h.y - cy) * CELL < 3.0) errs.push(`cuerpo ${b.ref} choca con un agujero de montaje`); });
  });
  return errs;
}

module.exports = { hintsCells, G, W_G, H_G, FP, PARTS, NETS, PLACE, HOLES, build, checkPlacement, g, rotP };
