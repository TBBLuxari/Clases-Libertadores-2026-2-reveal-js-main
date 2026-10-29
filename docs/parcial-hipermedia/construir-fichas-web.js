// Genera ejemplos/programacion-hipermedia/fichasparcial.html (el sorteo de fichas del parcial, con las pruebas del profe)
// a partir de ejercicios.js, pruebas.json y fichasparcial.plantilla.html.
// Uso: node docs/parcial-hipermedia/construir-fichas-web.js   (antes: probar-soluciones.js si cambió algo de ejercicios.js)
const fs = require('fs');
const path = require('path');
const ejercicios = require('./ejercicios.js');

const RAIZ = path.join(__dirname, '..', '..');
const pruebas = JSON.parse(fs.readFileSync(path.join(RAIZ, 'materias', 'programacion-hipermedia', 'actividades', 'parcial-1', 'pruebas.json'), 'utf8'));
const plantilla = fs.readFileSync(path.join(__dirname, 'fichasparcial.plantilla.html'), 'utf8');

const datos = ejercicios.map(e => ({
  n: e.n, nivel: e.nivel, titulo: e.titulo, empresa: e.empresa, historia: e.historia,
  reglas: e.reglas, entradas: e.entradas, salidas: e.salidas,
  pruebas: pruebas.find(p => p.n === e.n).pruebas.map(p => ({ entradas: p.entradas.map(String), esperado: p.esperado }))
}));

const json = JSON.stringify(datos, null, 1).replace(/<\//g, '<\\/');
if (!plantilla.includes('__DATOS__')) { throw new Error('La plantilla no tiene __DATOS__'); }
const salida = path.join(RAIZ, 'ejemplos', 'programacion-hipermedia', 'fichasparcial.html');
fs.writeFileSync(salida, plantilla.replace('__DATOS__', () => json));
console.log('Escrito ' + salida + ' (' + Math.round(fs.statSync(salida).size / 1024) + ' KB)');
