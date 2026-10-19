// Editor interactivo de la protoboard del carrito: se arrastran piezas y cables y se comprueban las conexiones.
// Uso: node docs/gen-protoboard-editor.js   → materias/sistemas-hipermedia/apoyo/carrito-protoboard-editor.html
// Parte del modelo ya verificado de la placa completa (esquema A, paso 9 de gen-protoboard.js).
'use strict';
const fs = require('fs');
const path = require('path');
const PB = require('./gen-protoboard.js');

const NC = 63;                      // columnas de una protoboard de 830 puntos
const SHIFT = (NC - 54) * 22;       // las baterías/interruptor se corren a la derecha del tablero más ancho
const r = PB.build(9, { plain: true });
const M = r.M;

// ---- piezas
const pn = (id, name) => id + '.' + name;
const parts = [], devices = [];
const lado = id => (id.endsWith('L') ? 'izq.' : id.endsWith('R') ? 'der.' : '');
M.parts.forEach(p => {
  const pins = {}; (p.pinNames || []).forEach(n => { if (M.pins[n]) pins[n] = M.pins[n]; });
  if (p.kind === 'res') parts.push({ id: p.id, kind: 'res', val: p.val, bands: p.bands, pins, label: `${p.id.slice(0, 2)} ${lado(p.id)} (${p.val})` });
  else if (p.kind === 'led') parts.push({ id: p.id, kind: 'led', look: p.look, pins, label: { ir: 'LED emisor IR', rx: 'Receptor IR', red: 'LED rojo' }[p.look] + ' ' + lado(p.id) });
  else if (p.kind === 'pot') parts.push({ id: p.id, kind: 'pot', pins, label: 'Potenciómetro ' + lado(p.id) });
  else if (p.kind === 'chip') parts.push({ id: p.id, kind: 'chip', name: p.name, n: p.n, top: p.top, bottom: p.bottom, pins, label: p.name });
  else if (p.kind === 'cap') parts.push({ id: p.id, kind: 'cap', capKind: p.capKind, val: p.val, pins, label: `${p.id} ${p.val}` });
  else if (p.kind === 'battery') devices.push({ id: 'BT', kind: 'battery', x: p.x + SHIFT, y: p.y, terms: { 'BT.+': [0, 18], 'BT.-': [0, 52] }, label: 'Pila 4×AA' });
  else if (p.kind === 'switch') devices.push({ id: 'SW', kind: 'switch', x: p.a.x + SHIFT, y: p.a.y, terms: { 'SW.out': [0, 0], 'SW.in': [36, 0] }, label: 'Interruptor' });
  else if (p.kind === 'motor') devices.push({ id: p.id, kind: 'motor', x: p.cx, y: p.cy, side: p.side, terms: { [p.id + '.a']: [p.pts.a.x - p.cx, p.pts.a.y - p.cy], [p.id + '.b']: [p.pts.b.x - p.cx, p.pts.b.y - p.cy] }, label: 'Motor ' + p.id.slice(1) + (p.id === 'M1' ? ' (rueda derecha)' : ' (rueda izquierda)') });
});
// los condensadores de los motores ya vienen soldados en los motores: no se editan
const keepPin = n => !/^C[45]\./.test(n);
const wires = M.wires.map(w => ({ id: w.id, color: w.color, a: w.a, b: w.b }));
const nets = {}; Object.entries(r.exp).forEach(([id, n]) => { nets[id] = { name: n.name, pins: n.pins.filter(keepPin).concat(id === 'VCC' ? ['SW.out'] : []) }; });

// ---- nombres legibles de patas
const pinLabels = {};
parts.forEach(p => Object.keys(p.pins).forEach(k => {
  const loc = k.split('.')[1];
  let t = loc;
  if (p.kind === 'res') t = 'pata ' + loc;
  if (p.kind === 'led') t = p.look === 'rx' ? (loc === 'S' ? 'pata corta (va a +)' : 'pata larga') : (loc === 'A' ? 'pata larga (+)' : 'pata corta (−)');
  if (p.kind === 'pot') t = { A: 'extremo A', W: 'centro (cursor)', B: 'extremo B' }[loc];
  if (p.kind === 'chip') t = 'pata ' + loc;
  if (p.kind === 'cap') t = loc === '+' ? 'pata +' : loc === '-' ? 'pata − (franja)' : 'pata ' + loc;
  pinLabels[k] = p.label + ', ' + t;
}));
devices.forEach(d => Object.keys(d.terms).forEach(k => { pinLabels[k] = d.label + ', ' + ({ 'BT.+': 'rojo (+)', 'BT.-': 'negro (−)', 'SW.in': 'terminal 2', 'SW.out': 'terminal 1' }[k] || 'cable ' + k.split('.')[1]); }));

const DATA = { parts, devices, wires, nets, pinLabels, joins: [['SW.in', 'SW.out']], NC };
const data = JSON.stringify(DATA).replace(/</g, '\\u003c');

const html = fs.readFileSync(path.join(__dirname, 'protoboard-editor-template.html'), 'utf8').replace('/*DATA*/null', data);
const out = path.join(PB.APOYO, 'carrito-protoboard-editor.html');
fs.writeFileSync(out, html);
console.log('Editor listo:', out, `(${parts.length} piezas, ${wires.length} cables, ${Object.keys(nets).length} redes)`);
