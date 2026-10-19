// Prueba un cambio de cableado en un paso de la guía: dice si el circuito sigue igual o qué se rompe.
// Uso: node docs/probar-cableado.js <paso 1-23> [--quitar W-OL,W-UL] [--agregar U1.7-U2.1,U1.15-U2.7] [--listar]
//   --listar    muestra los cables que hay en ese paso, con sus ids y sus extremos
//   --quitar    ids de cables que se retiran
//   --agregar   cables nuevos, "extremo-extremo"; un extremo es una pata (U1.7 = pata 7 del L293D, U2.1 = pata 1 del LM358),
//               un hueco (B40.2) o una fila de riel (Tp12, Bn7)
// Ejemplo: el puente corto entre la pata 7 del L293D y la pata 1 del LM358, sin el cable largo de S a la pata 1:
//   node docs/probar-cableado.js 18 --quitar W-OL --agregar U1.7-U2.1
'use strict';
const G = require('./gen-protoboard.js');
// paso de la guía (1 a 23) -> paso del modelo de gen-protoboard.js
const MODELO = [1, 2.1, 2.2, 2.3, 2.4, 2.5, 3, 4, 5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 8.1, 8.2, 9.1, 9.2, 10];
const args = process.argv.slice(2);
const n = parseInt(args[0], 10);
if (!(n >= 1 && n <= 23)) { console.error('Uso: node docs/probar-cableado.js <paso 1-23> [--quitar id,id] [--agregar pata-pata,...] [--listar]'); process.exit(2); }
const opt = nombre => { const i = args.indexOf(nombre); return i < 0 ? [] : (args[i + 1] || '').split(',').filter(Boolean); };
const nombreHueco = h => (h.t === 'h' ? `${h.half}${h.col}.${h.k}` : h.t === 'r' ? `${h.rail}${h.col}` : 'fuera de la placa');
if (args.includes('--listar')) {
  const M = G.build(MODELO[n - 1]).M;
  M.wires.filter(w => w.alt !== 'puente').forEach(w => console.log(`${w.id.padEnd(8)} ${nombreHueco(w.a)} -> ${nombreHueco(w.b)}`));
  process.exit(0);
}
const agregar = opt('--agregar').map(par => par.split('-')).map(p => { if (p.length !== 2) { console.error('Cada cable nuevo se escribe "extremo-extremo": ' + p.join('-')); process.exit(2); } return p; });
const r = G.probar(MODELO[n - 1], { quitar: opt('--quitar'), agregar });
if (r.ok) console.log(`SÍ FUNCIONA (paso ${n}): las ${r.redes} conexiones del circuito siguen completas y sin cortos.`);
else { console.log(`NO FUNCIONA (paso ${n}):\n${r.error}`); process.exitCode = 1; }
