// Califica el programa de un estudiante con las 5 pruebas de su ficha (1 punto por prueba que pasa).
//
// Uso:
//   node calificar.js <ficha> <ruta>       ruta = carpeta del proyecto (la que tiene el .csproj) o un archivo Program.cs suelto
//   node calificar.js --pruebas <ficha>    solo muestra las 5 pruebas (entradas y salida esperada) para probar a mano
//
// Ejemplo:  node calificar.js 7 "C:\Users\profe\Parcial\Juan\InventarioBodega"
//
// Compara las líneas de resultado (las que empiezan con los textos de la ficha). Ignora mayúsculas, espacios y tildes,
// y el orden de las líneas; no importa lo que el programa escriba en las preguntas. Solo el calendario (ficha 19)
// se compara línea por línea, con la alineación exacta.
// Necesita el SDK de .NET (dotnet) instalado.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const fichas = JSON.parse(fs.readFileSync(path.join(__dirname, 'pruebas.json'), 'utf8'));
const args = process.argv.slice(2);

function uso() {
  console.log('Uso:\n  node calificar.js <ficha> <ruta del proyecto o Program.cs>\n  node calificar.js --pruebas <ficha>');
  process.exit(1);
}

if (args[0] === '--pruebas') {
  const f = fichas.find(x => x.n === Number(args[1]));
  if (!f) { uso(); }
  console.log(`FICHA ${f.n}: ${f.titulo}\n`);
  f.pruebas.forEach((p, i) => {
    console.log(`Prueba ${i + 1}${i === 0 ? ' (es el ejemplo de la ficha)' : ''}`);
    console.log('  Entradas, una por línea:');
    p.entradas.forEach(e => console.log('    ' + e));
    console.log('  Debe salir:');
    p.esperado.forEach(l => console.log('    ' + l));
    console.log('');
  });
  process.exit(0);
}

const ficha = fichas.find(x => x.n === Number(args[0]));
if (!ficha || !args[1]) { uso(); }
let ruta = path.resolve(args[1]);
if (!fs.existsSync(ruta)) { console.error('No existe: ' + ruta); process.exit(1); }

let proyecto = ruta;
if (ruta.toLowerCase().endsWith('.cs')) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'calificar-'));
  fs.writeFileSync(path.join(tmp, 'Estudiante.csproj'),
    '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>disable</Nullable></PropertyGroup></Project>');
  fs.copyFileSync(ruta, path.join(tmp, 'Program.cs'));
  proyecto = tmp;
} else if (fs.statSync(ruta).isFile()) {
  proyecto = path.dirname(ruta);
}
let csproj = null;
if (proyecto.toLowerCase().endsWith('.csproj')) { csproj = proyecto; proyecto = path.dirname(proyecto); }
else {
  const encontrados = fs.readdirSync(proyecto).filter(f => f.toLowerCase().endsWith('.csproj'));
  if (!encontrados.length) { console.error('No encontré un .csproj en ' + proyecto + '. Pasa la carpeta del proyecto o el archivo Program.cs.'); process.exit(1); }
  csproj = path.join(proyecto, encontrados[0]);
}

const entorno = { ...process.env, DOTNET_NOLOGO: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_ROLL_FORWARD: 'Major' };
console.log(`Ficha ${ficha.n}: ${ficha.titulo}`);
console.log('Compilando ' + path.basename(csproj) + ' ...');
const build = spawnSync('dotnet', ['build', csproj, '-c', 'Debug', '-nologo', '-v', 'q'], { encoding: 'utf8', env: entorno, shell: false });
if (build.status !== 0) {
  console.log('NO COMPILA. Primeros errores:');
  const errores = (build.stdout + build.stderr).split('\n').filter(l => /error/i.test(l)).slice(0, 4);
  console.log(errores.map(l => '  ' + l.trim()).join('\n'));
  console.log('\nNota: 0 / 5');
  process.exit(0);
}
const objetivo = spawnSync('dotnet', ['msbuild', csproj, '-getProperty:TargetPath', '-p:Configuration=Debug'], { encoding: 'utf8', env: entorno });
let dll = null;
const textoObjetivo = (objetivo.stdout || '').trim();
try { dll = textoObjetivo.startsWith('{') ? JSON.parse(textoObjetivo).Properties.TargetPath : textoObjetivo.split('\n').pop().trim(); } catch (e) { dll = null; }
if (!dll || !fs.existsSync(dll)) { console.error('No encontré el programa compilado.'); process.exit(1); }

// --- comparación ---
function aA(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, '').replace(/\s+/g, '').toLowerCase(); } // sin tildes
function aB(s) { return s.replace(/[^\x20-\x7e]/g, '').replace(/\s+/g, '').toLowerCase(); }                                                   // borra lo no ASCII (consola sin UTF-8)
function igual(esperada, real) { return aA(esperada) === aA(real) || aB(esperada) === aB(real); }

function decodificar(buf) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) {
    const cp850 = { 0xA0: 'á', 0x82: 'é', 0xA1: 'í', 0xA2: 'ó', 0xA3: 'ú', 0xA4: 'ñ', 0xA5: 'Ñ', 0xB5: 'Á', 0x90: 'É', 0xD6: 'Í', 0xE0: 'Ó', 0xE9: 'Ú', 0xA8: '¿', 0xAD: '¡' }; // consola de Windows sin UTF-8
    return Array.from(buf).map(b => (b < 128 ? String.fromCharCode(b) : (cp850[b] || '?'))).join('');
  }
}

let puntos = 0;
ficha.pruebas.forEach((p, i) => {
  const r = spawnSync('dotnet', [dll], { input: p.entradas.join('\r\n') + '\r\n', timeout: 6000, env: entorno, maxBuffer: 16 * 1024 * 1024 });
  const etiqueta = `Prueba ${i + 1}${i === 0 ? ' (ejemplo)' : ''}`;
  const entradas = p.entradas.join(', ');
  if (r.error && r.error.code === 'ETIMEDOUT') { console.log(`${etiqueta}: FALLA, se quedó pegado (¿ciclo infinito?). Entradas: ${entradas}`); return; }
  const salida = decodificar(r.stdout || Buffer.alloc(0)).replace(/\r/g, '');
  const lineas = salida.split('\n').map(l => l.replace(/\s+$/, ''));
  let ok;
  if (ficha.exacto) {
    const inicio = lineas.findIndex(l => l.startsWith(p.esperado[0]));
    ok = inicio >= 0 && p.esperado.every((l, k) => lineas[inicio + k] === l);
  } else {
    ok = p.esperado.every(esp => lineas.some(l => igual(esp, l)));
  }
  if (ok) { puntos++; console.log(`${etiqueta}: OK`); return; }
  console.log(`${etiqueta}: FALLA. Entradas: ${entradas}`);
  console.log('   Debía salir:');
  p.esperado.forEach(l => console.log('     ' + l));
  console.log('   Salió:');
  const cola = lineas.filter(l => l !== '').slice(-Math.max(p.esperado.length + 2, 6));
  cola.forEach(l => console.log('     ' + l));
  if (r.status !== 0) {
    const err = decodificar(r.stderr || Buffer.alloc(0)).split('\n').find(l => l.trim()) || '';
    console.log('   El programa terminó con error' + (err.trim() ? ': ' + err.trim() : ' (probablemente se quedó esperando más datos de los que leyó)'));
  }
});
console.log(`\nNota: ${puntos} / 5`);
