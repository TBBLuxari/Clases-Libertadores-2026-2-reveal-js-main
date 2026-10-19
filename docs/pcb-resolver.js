// Prueba varios órdenes de ruteo y se queda con la mejor solución (menos puentes, menos pista).
'use strict';
const D = require('./pcb-diseno-carrito.js');
const { Router, CELL } = require('./pcb-router.js');

function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Reordena promoviendo al frente las redes que fallaron (o que necesitaron puentes)
function promote(router, nets, order0, rng, iters, jumps) {
  let order = order0.slice(), best = null;
  for (let i = 0; i < iters; i++) {
    const res = router.route(nets, order, rng, jumps ? { twoPhase: true } : { jumps: false, tolerant: true });
    if (!res) { break; }
    const len = res.paths.reduce((s, p) => s + p.cells.length, 0);
    const score = (jumps ? res.jumps.length * 100000 : res.fails * 3000) + len;
    if (!best || score < best.score) best = { score, res, order: order.slice(), len };
    const bad = jumps ? res.jumpNets : res.failedNets;
    if (!bad.length) break;
    order = bad.concat(order.filter(n => !bad.includes(n)));
  }
  return best;
}

function solve(place, trials, seed, log) {
  const B = D.build(place);
  const errs = D.checkPlacement(B);
  if (errs.length) return { errs, B };
  const W = D.g(D.W_G), H = D.g(D.H_G);
  const router = new Router(W, H, B.pads, B.holes);
  const nets = {}; D.NETS && Object.keys(D.NETS).forEach(n => { nets[n] = D.NETS[n]; });
  const names = Object.keys(nets);
  const rng = mulberry(seed || 1);
  let best = null;
  for (let t = 0; t < trials; t++) {
    const order = names.slice();
    const PW = n => (n === 'VCC' || n === 'GND' ? 1 : 0);
    if (t === 0) order.sort((a, b) => PW(a) - PW(b) || nets[a].length - nets[b].length);
    else if (t === 1) order.sort((a, b) => PW(b) - PW(a) || nets[a].length - nets[b].length);
    else if (t === 2) order.sort((a, b) => PW(a) - PW(b) || nets[b].length - nets[a].length);
    else {
      const key = {}; names.forEach(n => { key[n] = rng() * (t % 2 ? 1 : 1 + nets[n].length / 4); });
      order.sort((a, b) => key[a] - key[b]);
    }
    const pr = promote(router, nets, order, rng, 4, false);
    if (!pr) { if (log) log(`prueba ${t}: falló`); continue; }
    if (pr.res.fails > 0) { if (log) log(`prueba ${t}: ${pr.res.fails} conexiones sin ruta`); continue; }
    const res = pr.res, len = pr.len, score = pr.score;
    if (log) log(`prueba ${t}: ${res.jumps.length} puentes, ${len} celdas`);
    if (!best || score < best.score) best = { score, res, order: pr.order };
  }
  return { B, best, router, errs: [] };
}

module.exports = { solve, mulberry, promote };
if (require.main === module) {
  const fs = require('fs'), pth = require('path');
  const jf = pth.join(__dirname, 'pcb-colocacion.json');
  const place = fs.existsSync(jf) ? JSON.parse(fs.readFileSync(jf, 'utf8')) : D.PLACE;
  const r = solve(place, +process.argv[2] || 20, 1, console.log);
  if (r.errs.length) { console.log(r.errs.join('\n')); process.exit(1); }
  console.log(r.best ? `Mejor: ${r.best.res.jumps.length} puentes` : 'Sin solución');
  if (r.best) r.best.res.jumps.forEach(j => console.log(' puente', j.name, j.a, j.b));
}
