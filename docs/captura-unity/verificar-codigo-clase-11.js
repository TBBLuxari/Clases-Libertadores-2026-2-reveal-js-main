const fs = require('fs');
const path = require('path');

const raiz = 'C:/Users/JuanT/OneDrive/Escritorio/Clases libertadores';
const html = fs.readFileSync(path.join(raiz, 'materias/programacion-videojuegos/clase-11.html'), 'utf8');
const carpeta = path.join(raiz, 'ejemplos/programacion-videojuegos/unity/clase-11-pasos');

const versiones = fs.readdirSync(carpeta).filter(f => f.endsWith('.cs')).sort();
const lineasValidas = new Set();
const textos = {};
for (const v of versiones) {
  const t = fs.readFileSync(path.join(carpeta, v), 'utf8').replace(/\r\n/g, '\n');
  textos[v] = t;
  t.split('\n').forEach(l => lineasValidas.add(l.trim()));
}

function desescapar(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

const bloques = [...html.matchAll(/<code class="csharp"[^>]*>([\s\S]*?)<\/code>/g)].map(m => desescapar(m[1]));
console.log('Bloques de código en la clase: ' + bloques.length);

let malas = 0;
bloques.forEach((b, i) => {
  b.split('\n').forEach(l => {
    const t = l.trim();
    if (t === '' || t.startsWith('//')) return;
    if (!lineasValidas.has(t)) {
      malas++;
      console.log('  Bloque ' + (i + 1) + ': línea que NO está en ninguna versión: ' + JSON.stringify(t));
    }
  });
});

// Los scripts completos deben ser idénticos a las versiones 1 y 2
const completos = [
  ['Torreta_01_giro.cs', bloques[0]],
  ['Torreta_02_rayo.cs', bloques[1]]
];
completos.forEach(([nombre, bloque]) => {
  const esperado = textos[nombre].trim();
  console.log(nombre + ' ' + (bloque.trim() === esperado ? 'IDENTICO' : 'DISTINTO'));
});

console.log(malas === 0 ? 'TODAS las líneas existen en los scripts compilados' : 'HAY ' + malas + ' líneas sin respaldo');
