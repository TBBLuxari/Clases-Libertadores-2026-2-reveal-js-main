// Enrutador de una cara con "rip-up and reroute": si una conexión no pasa, deshace las redes que la bloquean,
// pasa primero la que falló y vuelve a pasar las deshechas. Sin puentes automáticos (los puentes son piezas del diseño).
'use strict';
const { CELL, TRACK, CLR } = require('./pcb-router.js');
const R_TT = TRACK + CLR;

class Heap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(key, val) { const k = this.k, v = this.v; let i = k.length; k.push(key); v.push(val); while (i > 0) { const p = (i - 1) >> 1; if (k[p] <= key) break; k[i] = k[p]; v[i] = v[p]; i = p; } k[i] = key; v[i] = val; }
  pop() { const k = this.k, v = this.v, top = v[0], lk = k.pop(), lv = v.pop(), n = k.length; if (n) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && k[c + 1] < k[c]) c++; if (k[c] >= lk) break; k[i] = k[c]; v[i] = v[c]; i = c; } k[i] = lk; v[i] = lv; } return top; }
}

class Router2 {
  constructor(W, H, pads, holes, nets) {
    this.W = W; this.H = H; this.pads = pads; this.nets = nets;       // nets: {nombre: [idPad,...]}
    this.padById = {}; pads.forEach(p => { this.padById[p.id] = p; });
    this.base = new Int16Array(W * H);
    const mark = (map, cx, cy, rmm, net, force) => {
      const rc = rmm / CELL, ri = Math.ceil(rc);
      for (let dy = -ri; dy <= ri; dy++) for (let dx = -ri; dx <= ri; dx++) {
        if (dx * dx + dy * dy >= rc * rc) continue;
        const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const i = y * W + x, v = map[i];
        if (force) map[i] = -1; else if (v === 0) map[i] = net; else if (v !== net && v !== -1) map[i] = -1;
      }
    };
    this.mark = mark;
    pads.forEach(p => mark(this.base, p.x, p.y, p.r + CLR + TRACK / 2, p.net));
    holes.forEach(h => mark(this.base, h.x, h.y, h.r, -1, true));
    this.dyn = new Int16Array(W * H); this.owner = new Int16Array(W * H);
    const N = W * H * 5; this.gs = new Float64Array(N); this.par = new Int32Array(N); this.stamp = new Int32Array(N); this.ver = 0;
    this.res = {}; this.forbid = {};
    this.netId = {}; Object.keys(nets).forEach(n => { this.netId[n] = this.padById[nets[n][0]].net; });
  }
  // zonas prohibidas por red: hints = {OI: [[x0,y0,x1,y1] en celdas, ...]}
  setHints(h) {
    this.forbid = {};
    for (const name in h) {
      const m = new Uint8Array(this.W * this.H);
      h[name].forEach(([x0, y0, x1, y1]) => { for (let y = Math.round(y0); y <= y1; y++) for (let x = Math.round(x0); x <= x1; x++) if (x >= 0 && y >= 0 && x < this.W && y < this.H) m[y * this.W + x] = 1; });
      this.forbid[this.netId[name]] = m;
    }
  }
  rebuild() {
    this.dyn.fill(0); this.owner.fill(0);
    for (const name in this.res) {
      const r = this.res[name]; if (!r) continue; const net = this.netId[name];
      r.paths.forEach(path => path.forEach(c => { this.owner[c.y * this.W + c.x] = net; this.mark(this.dyn, c.x, c.y, R_TT, net); }));
    }
  }
  commitPath(name, path) {
    const net = this.netId[name];
    path.forEach(c => { this.owner[c.y * this.W + c.x] = net; this.mark(this.dyn, c.x, c.y, R_TT, net); });
  }
  ok(c, net, soft) {
    const fm = this.forbid[net]; if (fm && fm[c]) return false;
    const b = this.base[c]; if (b !== 0 && b !== net) return false;
    const d = this.dyn[c]; if (d === 0 || d === net) return true;
    return soft ? 'soft' : false;
  }
  astar(net, sources, target, soft) {
    const W = this.W, H = this.H, M = 2;
    const tx = target % W, ty = (target / W) | 0;
    const ver = ++this.ver, gs = this.gs, par = this.par, st = this.stamp;
    const heap = new Heap(); const DX = [1, -1, 0, 0], DY = [0, 0, 1, -1];
    for (const c of sources) { const s = c * 5 + 4; gs[s] = 0; par[s] = -1; st[s] = ver; heap.push(10 * (Math.abs(c % W - tx) + Math.abs(((c / W) | 0) - ty)), s); }
    let goal = -1, guard = 0;
    while (heap.size) {
      const s = heap.pop(); const c = (s / 5) | 0, d = s - c * 5; const g = gs[s]; const x = c % W, y = (c / W) | 0;
      if (c === target) { goal = s; break; }
      if (++guard > 400000) break;
      for (let k = 0; k < 4; k++) {
        const nx = x + DX[k], ny = y + DY[k];
        if (nx < M || ny < M || nx >= W - M || ny >= H - M) continue;
        const nc = ny * W + nx; const o = this.ok(nc, net, soft); if (!o) continue;
        const ng = g + 10 + (d !== 4 && d !== k ? 6 : 0) + (o === 'soft' ? 70 : 0);
        const ns = nc * 5 + k;
        if (st[ns] === ver && gs[ns] <= ng) continue;
        st[ns] = ver; gs[ns] = ng; par[ns] = s;
        heap.push(ng + 10 * (Math.abs(nx - tx) + Math.abs(ny - ty)), ns);
      }
    }
    if (goal < 0) return null;
    const out = []; let s = goal;
    while (s !== -1) { const c = (s / 5) | 0; out.push({ x: c % W, y: (c / W) | 0 }); s = par[s]; }
    return out.reverse();
  }
  // Ruta una red completa (Prim). Devuelve {paths, fails}
  routeNet(name) {
    const W = this.W, ids = this.nets[name]; const net = this.netId[name];
    const out = { paths: [], fails: [] };
    this.res[name] = out;
    if (ids.length < 2) return out;
    const tree = []; const inTree = new Set();
    const add = c => { if (!inTree.has(c)) { inTree.add(c); tree.push(c); } };
    const first = this.padById[ids[0]]; add(first.y * W + first.x);
    const left = ids.slice(1).map(i => this.padById[i]);
    while (left.length) {
      let bi = 0, bd = Infinity;
      left.forEach((p, i) => { for (const c of tree) { const d = Math.abs(c % W - p.x) + Math.abs(((c / W) | 0) - p.y); if (d < bd) { bd = d; bi = i; } } });
      const tgt = left.splice(bi, 1)[0];
      const path = this.astar(net, tree, tgt.y * W + tgt.x, false);
      if (!path) { out.fails.push(tgt.id); continue; }
      out.paths.push(path); path.forEach(c => add(c.y * W + c.x)); this.commitPath(name, path);
    }
    return out;
  }
  totalFails() { let n = 0; for (const k in this.res) if (this.res[k]) n += this.res[k].fails.length; return n; }
  snapshot() { const s = {}; for (const k in this.res) s[k] = this.res[k]; return s; }
  restore(s) { this.res = Object.assign({}, s); this.rebuild(); }
  // quién bloquea el paso de una conexión fallida: ruta "blanda" que atraviesa pistas ajenas con castigo
  blockers(name, padId) {
    const W = this.W, net = this.netId[name], r = this.res[name];
    const src = [];
    const first = this.padById[this.nets[name][0]]; src.push(first.y * W + first.x);
    r.paths.forEach(p => p.forEach(c => src.push(c.y * W + c.x)));
    this.nets[name].forEach(id => { if (!r.fails.includes(id)) { const p = this.padById[id]; src.push(p.y * W + p.x); } });
    const tgt = this.padById[padId];
    const path = this.astar(net, src, tgt.y * W + tgt.x, true);
    if (!path) return null;
    const bl = new Set();
    path.forEach(c => { for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { if (dx * dx + dy * dy > 8) continue; const x = c.x + dx, y = c.y + dy; if (x < 0 || y < 0 || x >= W || y >= this.H) continue; const o = this.owner[y * W + x]; if (o && o !== net) bl.add(o); } });
    const names = Object.keys(this.nets).filter(n => bl.has(this.netId[n]));
    return names;
  }
  // Todo el proceso: pasada inicial en `order` y luego rip-up
  solve(order, rng, rounds) {
    this.res = {}; this.rebuild();
    order.forEach(n => this.routeNet(n));
    let fails = this.totalFails();
    for (let r = 0; r < rounds && fails > 0; r++) {
      const bad = Object.keys(this.res).filter(n => this.res[n] && this.res[n].fails.length);
      const n = bad[(rng() * bad.length) | 0]; const pad = this.res[n].fails[(rng() * this.res[n].fails.length) | 0];
      const bl = this.blockers(n, pad); if (!bl || !bl.length) continue;
      const snap = this.snapshot();
      const rip = [n].concat(bl.filter(x => x !== n));
      rip.forEach(x => { this.res[x] = null; }); this.rebuild();
      // la que falló va primero; las deshechas, en orden aleatorio
      const rest = rip.slice(1).sort(() => rng() - 0.5);
      [rip[0]].concat(rest).forEach(x => this.routeNet(x));
      const nf = this.totalFails();
      if (nf <= fails) fails = nf; else this.restore(snap);
    }
    return fails;
  }
  result() {
    const paths = [];
    for (const name in this.res) { const r = this.res[name]; if (!r) continue; r.paths.forEach(p => paths.push({ net: this.netId[name], name, cells: p.map(c => ({ x: c.x, y: c.y, jump: false })) })); }
    return { paths, jumps: [], fails: this.totalFails(), failList: Object.keys(this.res).flatMap(n => this.res[n].fails.map(i => n + ':' + i)) };
  }
}
module.exports = { Router2 };
