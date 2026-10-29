// Compila las 20 soluciones en un solo proyecto .NET, las ejecuta con el ejemplo y las 4 pruebas de cada ficha
// y escribe las salidas esperadas en materias/programacion-hipermedia/actividades/parcial-1/pruebas.json.
// Uso: node docs/parcial-hipermedia/probar-soluciones.js [carpeta-de-trabajo]
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ejercicios = require('./ejercicios.js');

const RAIZ = path.join(__dirname, '..', '..');
const SALIDA = path.join(RAIZ, 'materias', 'programacion-hipermedia', 'actividades', 'parcial-1', 'pruebas.json');
const TRABAJO = path.resolve(process.argv[2] || path.join(process.env.TEMP || __dirname, 'parcial-hipermedia-harness'));

fs.mkdirSync(TRABAJO, { recursive: true });
fs.writeFileSync(path.join(TRABAJO, 'Harness.csproj'),
`<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>disable</Nullable>
    <InvariantGlobalization>false</InvariantGlobalization>
  </PropertyGroup>
</Project>
`);

let casos = '';
let fuente = 'using System;\n';
for (const e of ejercicios) {
  const id = String(e.n).padStart(2, '0');
  fuente += `static class Ficha${id}\n{\n    public static void Run()\n    {\n${e.sol.split('\n').map(l => '        ' + l).join('\n')}\n    }\n}\n\n`;
  casos += `            case ${e.n}: Ficha${id}.Run(); break;\n`;
}
fuente += `class Programa\n{\n    static void Main(string[] args)\n    {\n        Console.OutputEncoding = System.Text.Encoding.UTF8;\n        switch (int.Parse(args[0]))\n        {\n${casos}        }\n    }\n}\n`;
fs.writeFileSync(path.join(TRABAJO, 'Program.cs'), fuente);

const build = spawnSync('dotnet', ['build', '-c', 'Release', '-nologo', '-v', 'q'], { cwd: TRABAJO, encoding: 'utf8', shell: true });
if (build.status !== 0) { console.error(build.stdout + build.stderr); process.exit(1); }
const dll = path.join(TRABAJO, 'bin', 'Release', 'net10.0', 'Harness.dll');

function ejecutar(n, entradas) {
  const r = spawnSync('dotnet', [dll, String(n)], { input: entradas.join('\n') + '\n', timeout: 8000, encoding: 'utf8', env: { ...process.env, DOTNET_NOLOGO: '1' } });
  if (r.error || r.status !== 0) { return { error: (r.error && r.error.message) || r.stderr || ('código ' + r.status) }; }
  return { salida: r.stdout.replace(/\r/g, '') };
}

function esperadas(e, salida) {
  const lineas = salida.split('\n');
  if (e.desde) {
    const i = lineas.findIndex(l => l.startsWith(e.desde));
    return lineas.slice(i).map(l => l.replace(/\s+$/, '')).filter(l => l !== '');
  }
  return lineas.map(l => l.replace(/\s+$/, '')).filter(l => e.etiquetas.some(p => l.startsWith(p)));
}

const resultado = [];
let fallos = 0;
for (const e of ejercicios) {
  const juegos = [e.ejemplo, ...e.pruebas];
  const pruebas = [];
  for (const entradas of juegos) {
    const r = ejecutar(e.n, entradas);
    if (r.error) { console.error(`Ficha ${e.n} falló con ${JSON.stringify(entradas)}: ${r.error}`); fallos++; continue; }
    const lineas = esperadas(e, r.salida);
    if (!lineas.length) { console.error(`Ficha ${e.n}: no salió ninguna línea esperada con ${JSON.stringify(entradas)}`); fallos++; }
    pruebas.push({ entradas, esperado: lineas });
  }
  resultado.push({ n: e.n, titulo: e.titulo, exacto: !!e.exacto, pruebas });
}
fs.writeFileSync(SALIDA, JSON.stringify(resultado, null, 1));
console.log(`Listo: ${resultado.length} fichas, ${fallos} fallos. Escrito ${SALIDA}`);
