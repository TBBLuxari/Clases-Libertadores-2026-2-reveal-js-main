// Búsqueda de colocación (recocido simulado): minimiza las conexiones que NO se pueden hacer sin puentes.
// Uso: node docs/pcb-colocar.js [segundos] [semilla]   → escribe docs/pcb-colocacion.json con la mejor
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('./pcb-diseno-carrito.js');
const { Router } = require('./pcb-router.js');
const { mulberry, promote } = require('./pcb-resolver.js');

const FILE = process.env.PCB_OUT || path.join(__dirname, 'pcb-colocacion.json');
const secs = +process.argv[2] || 60, seed = +process.argv[3] || 7;
const rng = mulberry(seed);
const clone = o => JSON.parse(JSON.stringify(o));
let cur = fs.existsSync(FILE) && process.argv[4] !== 'new' ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : clone(D.PLACE);

const W = D.g(D.W_G), H = D.g(D.H_G);
const PW = n => (n === 'VCC' || n === 'GND' ? 1 : 0);
const names = Object.keys(D.NETS);
const ORD = [
  names.slice().sort((a, b) => PW(a) - PW(b) || D.NETS[a].length - D.NETS[b].length),
  names.slice().sort((a, b) => PW(b) - PW(a) || D.NETS[a].length - D.NETS[b].length),
];
function evalP(place) {
  const B = D.build(place);
  const errs = D.checkPlacement(B);
  if (errs.length) return { cost: 1e9, errs };
  const router = new Router(W, H, B.pads, B.holes);
  let best = null;
  for (const order of ORD) {
    const r = promote(router, D.NETS, order, null, +process.env.PROMO || 1, false);
    if (!r) continue;
    const c = r.res.fails * 3000 + r.len;
    if (!best || c < best.cost) best = { cost: c, fails: r.res.fails, len: r.len };
  }
  return best || { cost: 1e9 };
}
const FREE_ROT = ['R1I', 'R2I', 'R3I', 'R4I', 'R5I', 'R1D', 'R2D', 'R3D', 'R4D', 'R5D', 'C2', 'C3', 'C1', 'P1I', 'P1D', 'D3I', 'D3D'];
const LOCK = /^(D1.|D2.|J.)$/;
const refs = Object.keys(cur).filter(r => !LOCK.test(r));
function neighbor(p) {
  const q = clone(p);
  const ref = refs[(rng() * refs.length) | 0];
  const v = q[ref];
  const isIC = ref === 'U1' || ref === 'U2', isSens = /^D[12]/.test(ref), isJ = /^J/.test(ref);
  const m = isIC ? 2 : 3;
  const dx = Math.round((rng() * 2 - 1) * m), dy = isSens || isJ ? 0 : Math.round((rng() * 2 - 1) * m);
  v[0] += dx; v[1] += dy;
  if (FREE_ROT.includes(ref) && rng() < 0.3) v[2] = (v[2] + (rng() < 0.5 ? 90 : 270)) % 360;
  if (/^J[34]$/.test(ref)) v[2] = 0;
  return q;
}
let curE = evalP(cur), best = { p: clone(cur), e: curE };
console.log('inicio', curE.cost, curE.fails, curE.errs ? curE.errs.slice(0, 2) : '');
const t0 = Date.now(); let it = 0, T = 1500;
while ((Date.now() - t0) / 1000 < secs) {
  it++;
  const frac = (Date.now() - t0) / (secs * 1000);
  T = 1500 * (1 - frac) + 20;
  const cand = neighbor(cur);
  const e = evalP(cand);
  if (e.cost >= 1e9) continue;
  if (e.cost < curE.cost || rng() < Math.exp((curE.cost - e.cost) / T)) {
    cur = cand; curE = e;
    if (e.cost < best.e.cost) { best = { p: clone(cand), e }; console.log(`it ${it} mejor: fallos ${e.fails}, largo ${e.len}`); fs.writeFileSync(FILE, JSON.stringify(best.p)); }
  }
}
console.log('fin', it, 'iteraciones; mejor', best.e);
