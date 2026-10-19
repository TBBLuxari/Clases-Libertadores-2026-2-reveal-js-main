// Enrutador de una sola cara con puentes de alambre (jumpers), sobre una rejilla de 0,508 mm (= 2,54 / 5).
// Lo usa docs/gen-pcb-carrito.js. Todo en celdas enteras; 1 celda = 0,508 mm.
'use strict';

const CELL = 2.54 / 5;
const TRACK = 1.0;      // ancho de pista (mm)
const CLR = 0.5;        // separación mínima entre cobres distintos (mm)
const R_TT = TRACK + CLR;                 // pista-pista, centro a centro
const JMIN = 8, JMAX = 44;                // largo de un puente en celdas (4 a 22 mm)

class Heap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(key, val) {
    const k = this.k, v = this.v; let i = k.length; k.push(key); v.push(val);
    while (i > 0) { const p = (i - 1) >> 1; if (k[p] <= key) break; k[i] = k[p]; v[i] = v[p]; i = p; }
    k[i] = key; v[i] = val;
  }
  pop() {
    const k = this.k, v = this.v, topV = v[0], lk = k.pop(), lv = v.pop();
    const n = k.length;
    if (n) {
      let i = 0;
      for (;;) {
        let c = 2 * i + 1; if (c >= n) break;
        if (c + 1 < n && k[c + 1] < k[c]) c++;
        if (k[c] >= lk) break;
        k[i] = k[c]; v[i] = v[c]; i = c;
      }
      k[i] = lk; v[i] = lv;
    }
    return topV;
  }
}

function segDist(a, b, c, d) {   // distancia mínima entre dos segmentos (mm)
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const dot = (p, q) => p[0] * q[0] + p[1] * q[1];
  const ptSeg = (p, s, e) => {
    const se = sub(e, s), l2 = dot(se, se); if (l2 === 0) return Math.hypot(p[0] - s[0], p[1] - s[1]);
    let t = dot(sub(p, s), se) / l2; t = Math.max(0, Math.min(1, t));
    return Math.hypot(p[0] - (s[0] + t * se[0]), p[1] - (s[1] + t * se[1]));
  };
  const ccw = (p, q, r) => (r[1] - p[1]) * (q[0] - p[0]) > (q[1] - p[1]) * (r[0] - p[0]);
  if (ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d)) return 0;
  return Math.min(ptSeg(a, c, d), ptSeg(b, c, d), ptSeg(c, a, b), ptSeg(d, a, b));
}

class Router {
  // pads: [{id, net, x, y, r}] (celdas / mm); holes: [{x, y, r}] (celdas / mm) que bloquean todo
  constructor(W, H, pads, holes, opts = {}) {
    this.W = W; this.H = H; this.pads = pads; this.holes = holes;
    this.margin = opts.margin || 2; this.jmargin = opts.jmargin || 5;
    this.baseBlk = new Int16Array(W * H); this.basePblk = new Int16Array(W * H);
    pads.forEach(p => { this.mark(this.baseBlk, p.x, p.y, p.r + CLR + TRACK / 2, p.net); this.mark(this.basePblk, p.x, p.y, p.r + 0.9 + CLR, p.net); });
    holes.forEach(h => { this.mark(this.baseBlk, h.x, h.y, h.r, -1, true); this.mark(this.basePblk, h.x, h.y, h.r, -1, true); });
    this.isPad = new Uint8Array(W * H); pads.forEach(p => { this.isPad[p.y * W + p.x] = 1; });
    const N = W * H * 5;
    this.gs = new Float64Array(N); this.par = new Int32Array(N); this.stamp = new Int32Array(N); this.ver = 0;
  }
  mark(map, cx, cy, rmm, net, force) {
    const rc = rmm / CELL, ri = Math.ceil(rc), W = this.W, H = this.H;
    for (let dy = -ri; dy <= ri; dy++) for (let dx = -ri; dx <= ri; dx++) {
      if (dx * dx + dy * dy >= rc * rc) continue;
      const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const i = y * W + x, v = map[i];
      if (force) map[i] = -1; else if (v === 0) map[i] = net; else if (v !== net && v !== -1) map[i] = -1;
    }
  }
  // Una prueba: rutea todas las redes en el orden dado. nets: {name: [padId...]}; devuelve null si alguna falla.
  route(nets, order, rng, opts = {}) {
    const W = this.W, H = this.H, S = this;
    S.blk = Int16Array.from(S.baseBlk); S.pblk = Int16Array.from(S.basePblk);
    S.jumps = []; S.paths = []; S.failList = []; let fails = 0; const failedNets = new Set(); const deferred = []; const trees = {};
    const netId = {}; order.forEach((n, i) => { netId[n] = i + 1; });
    // los ids de red en las celdas son los de pads[i].net (índices 1..N según orden global) → los traduce quien llama
    const padById = {}; S.pads.forEach(p => { padById[p.id] = p; });
    for (const name of order) {
      const ids = nets[name]; if (ids.length < 2) continue;
      const net = padById[ids[0]].net;
      const tree = new Uint8Array(W * H);
      const treeCells = []; trees[name] = { net, treeCells, tree };
      const addCell = c => { if (!tree[c]) { tree[c] = 1; treeCells.push(c); } };
      const first = padById[ids[0]]; addCell(first.y * W + first.x);
      const left = ids.slice(1).map(id => padById[id]);
      while (left.length) {
        // pin pendiente más cercano al árbol (distancia Manhattan a una celda del árbol, aproximada con sus pads)
        let bi = 0, bd = Infinity;
        left.forEach((p, i) => {
          for (const c of treeCells) { const cx = c % W, cy = (c / W) | 0; const d = Math.abs(cx - p.x) + Math.abs(cy - p.y); if (d < bd) { bd = d; bi = i; } }
        });
        const tgt = left.splice(bi, 1)[0];
        let path = S.astar(net, treeCells, tgt.y * W + tgt.x, false, rng);
        if (!path && opts.twoPhase) { deferred.push({ name, tgt }); continue; }
        if (!path && opts.jumps !== false) path = S.astar(net, treeCells, tgt.y * W + tgt.x, true, rng);
        if (!path) { if (opts.tolerant) { fails++; failedNets.add(name); (S.failList = S.failList || []).push(name + ':' + tgt.id); continue; } return null; }
        S.commit(net, name, path, addCell);
      }
    }
    for (const d of deferred) {
      const T = trees[d.name]; const add = c => { if (!T.tree[c]) { T.tree[c] = 1; T.treeCells.push(c); } };
      const path = S.astar(T.net, T.treeCells, d.tgt.y * W + d.tgt.x, true, rng);
      if (!path) { if (opts.tolerant) { fails++; failedNets.add(d.name); continue; } return null; }
      S.commit(T.net, d.name, path, add);
    }
    return { paths: S.paths, jumps: S.jumps, fails, failList: S.failList, failedNets: [...failedNets], jumpNets: [...new Set(S.jumps.map(j => j.name))] };
  }
  commit(net, name, path, addCell) {
    const W = this.W, cells = [];
    for (let i = 0; i < path.length; i++) {
      const n = path[i]; const x = n.c % W, y = (n.c / W) | 0;
      addCell(n.c); cells.push({ x, y, jump: n.jump });
      this.mark(this.blk, x, y, R_TT, net); this.mark(this.pblk, x, y, 0.5 + 0.9 + CLR, net);
      if (n.jump) {
        const p = path[i - 1], px = p.c % W, py = (p.c / W) | 0;
        this.jumps.push({ net, name, a: [px, py], b: [x, y] });
        [[px, py], [x, y]].forEach(([qx, qy]) => { this.mark(this.blk, qx, qy, 0.9 + CLR + TRACK / 2, net); this.mark(this.pblk, qx, qy, 0.9 * 2 + CLR, net); });
      }
    }
    this.paths.push({ net, name, cells });
  }
  okTrack(c, net) { const v = this.blk[c]; return v === 0 || v === net; }
  okPad(c, net) { const v = this.pblk[c]; return v === 0 || v === net; }
  astar(net, sources, target, allowJump, rng) {
    const W = this.W, H = this.H, M = this.margin, JM = this.jmargin;
    const tx = target % W, ty = (target / W) | 0;
    const ver = ++this.ver, gs = this.gs, par = this.par, st = this.stamp;
    const heap = new Heap();
    const DX = [1, -1, 0, 0], DY = [0, 0, 1, -1];
    const jit = rng ? () => rng() * 0.3 : () => 0;
    for (const c of sources) { const s = c * 5 + 4; gs[s] = 0; par[s] = -1; st[s] = ver; heap.push(10 * (Math.abs(c % W - tx) + Math.abs(((c / W) | 0) - ty)), s); }
    let goal = -1; let guard = 0;
    while (heap.size) {
      const s = heap.pop(); const c = (s / 5) | 0, d = s - c * 5;
      const g = gs[s]; const x = c % W, y = (c / W) | 0;
      if (c === target) { goal = s; break; }
      if (++guard > 600000) break;
      // el estado puede estar desactualizado
      for (let k = 0; k < 4; k++) {
        const nx = x + DX[k], ny = y + DY[k];
        if (nx < M || ny < M || nx >= W - M || ny >= H - M) continue;
        const nc = ny * W + nx;
        if (!(nc === target) && !this.okTrack(nc, net)) continue;
        if (nc === target && !this.okTrack(nc, net)) continue;
        const ng = g + 10 + (d !== 4 && d !== k ? 6 : 0) + jit();
        const ns = nc * 5 + k;
        if (st[ns] === ver && gs[ns] <= ng) continue;
        st[ns] = ver; gs[ns] = ng; par[ns] = s;
        heap.push(ng + 10 * (Math.abs(nx - tx) + Math.abs(ny - ty)), ns);
      }
      if (allowJump && d !== 4 + 10) {
        const onPad = this.isPad[c] === 1;
        if ((!onPad && ((x & 1) || (y & 1))) || x < JM || y < JM || x >= W - JM || y >= H - JM || !this.okPad(c, net)) continue;
        for (let k = 0; k < 4; k++) {
          for (let L = JMIN; L <= JMAX; L += (onPad ? 1 : 2)) {
            const nx = x + DX[k] * L, ny = y + DY[k] * L;
            if (nx < JM || ny < JM || nx >= W - JM || ny >= H - JM) break;
            const nc = ny * W + nx;
            if (!this.okPad(nc, net)) continue;
            if (this.jumpClash(net, x, y, nx, ny)) continue;
            const ng = g + L * 6 + 2500;
            const ns = nc * 5 + 4;
            if (st[ns] === ver && gs[ns] <= ng) continue;
            st[ns] = ver; gs[ns] = ng; par[ns] = s | 0x40000000;     // marca de salto
            heap.push(ng + 10 * (Math.abs(nx - tx) + Math.abs(ny - ty)), ns);
          }
        }
      }
    }
    if (goal < 0) return null;
    const out = []; let s = goal;
    while (s !== -1) {
      const jump = s !== goal ? false : false;
      const p = par[s];
      const c = (s / 5) | 0;
      if (p === -1) { out.push({ c, jump: false }); break; }
      if (p & 0x40000000) { out.push({ c, jump: true }); s = p & 0x3fffffff; } else { out.push({ c, jump: false }); s = p; }
    }
    out.reverse();
    // normaliza: el marcador de salto va en el nodo de llegada
    return out;
  }
  jumpClash(net, x, y, nx, ny) {
    const a = [x * CELL, y * CELL], b = [nx * CELL, ny * CELL];
    for (const j of this.jumps) {
      if (j.net === net) { continue; }
      if (segDist(a, b, [j.a[0] * CELL, j.a[1] * CELL], [j.b[0] * CELL, j.b[1] * CELL]) < 2.2) return true;
    }
    return false;
  }
}

module.exports = { Router, CELL, TRACK, CLR, segDist };
