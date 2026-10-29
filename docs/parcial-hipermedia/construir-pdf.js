// Genera los materiales impresos del parcial de Programación Hipermedia a partir de ejercicios.js y pruebas.json:
//   fichas.pdf               20 fichas, 2 por hoja (recortar por la mitad). Es lo que recibe cada estudiante.
//   sorteo-papelitos.pdf     papelitos numerados para las dos bolsas (nivel 1 y nivel 2).
//   hoja-de-ayuda.pdf        sintaxis de C# de lo visto en clase (una por estudiante).
//   clave-del-profe.pdf      pruebas, soluciones y registro del sorteo (solo para el profe).
//   banco-parcial.txt        lo mismo en texto.
// Antes hay que correr probar-soluciones.js (genera pruebas.json). Uso: node docs/parcial-hipermedia/construir-pdf.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ejercicios = require('./ejercicios.js');

const RAIZ = path.join(__dirname, '..', '..');
const DIR = path.join(RAIZ, 'materias', 'programacion-hipermedia', 'actividades', 'parcial-1');
const pruebas = JSON.parse(fs.readFileSync(path.join(DIR, 'pruebas.json'), 'utf8'));
const TMP = path.join(process.env.TEMP || __dirname, 'parcial-hipermedia-html');
fs.mkdirSync(TMP, { recursive: true });

const EXE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
if (!EXE) { console.error('No encontré Edge ni Chrome.'); process.exit(1); }

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const estrellas = n => (n === 1 ? '★' : '★★');

const CSS = `
  :root { --a: #0e7490; --a-suave: #ecfeff; --b: #b45309; --b-suave: #fff7ed; --tinta: #1e293b; --gris: #64748b; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; color: var(--tinta); }
  @page { size: Letter; margin: 0.25in; }
  code, pre, .mono { font-family: Consolas, 'Courier New', monospace; }
  .pagina { display: flex; flex-direction: column; gap: 0.2in; height: 10.5in; page-break-after: always; }
  .pagina:last-child { page-break-after: auto; }
  body { width: 8in; }
`;

// ---------- fichas ----------
function htmlReglas(reglas) {
  let h = '';
  let lista = [];
  const cerrar = () => { if (lista.length) { h += '<ul>' + lista.join('') + '</ul>'; lista = []; } };
  for (const r of reglas) {
    if (typeof r === 'string') { lista.push('<li>' + esc(r) + '</li>'); continue; }
    cerrar();
    if (r.tabla) {
      h += '<table class="tb"><tr>' + r.tabla.cab.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr>' + r.tabla.filas.map(f => '<tr>' + f.map(c => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</table>';
    } else if (r.calculo) {
      h += '<div class="calc"><div class="calc-t">' + esc(r.calculo.titulo) + '</div><div>' + esc(r.calculo.formula) + '</div><div class="calc-e">Ejemplo: ' + esc(r.calculo.ejemplo) + '</div></div>';
    } else if (r.ejemplo) {
      h += '<div class="ejr">Ejemplo: ' + esc(r.ejemplo) + '</div>';
    }
    // las pistas (r.pista) no van en la ficha impresa: las da el profe con costo y están en la clave
  }
  cerrar();
  return h;
}
function pistasDe(e) { return e.reglas.filter(r => r.pista).map(r => r.pista); }
function reglasATexto(reglas) {
  const l = [];
  for (const r of reglas) {
    if (typeof r === 'string') { l.push('  - ' + r); }
    else if (r.tabla) { l.push('  Tabla: ' + r.tabla.cab.join(' | ')); r.tabla.filas.forEach(f => l.push('    ' + f.join(' | '))); }
    else if (r.calculo) { l.push('  ' + r.calculo.titulo + ': ' + r.calculo.formula + '. Ejemplo: ' + r.calculo.ejemplo); }
    else if (r.ejemplo) { l.push('  Ejemplo: ' + r.ejemplo); }
    else if (r.pista) { l.push('  [Pista con costo, la da el profe] ' + r.pista.titulo + ': ' + r.pista.formula + '. Ejemplo: ' + r.pista.ejemplo); }
  }
  return l.join('\n');
}

function ficha(e) {
  const p = pruebas.find(x => x.n === e.n).pruebas[0];
  const clase = e.nivel === 1 ? 'n1' : 'n2';
  const chips = p.entradas.map(v => `<span class="chip">${esc(v)}</span>`).join('');
  return `
  <div class="ficha ${clase}">
    <div class="cab">
      <div class="num">${e.n}</div>
      <div class="tit"><div class="t">${esc(e.titulo)}</div><div class="emp">${esc(e.empresa)}</div></div>
      <div class="niv">${estrellas(e.nivel)}</div>
    </div>
    <div class="cuerpo">
      <div class="izq">
        <p class="historia">${esc(e.historia)}</p>
        <div class="sub">Reglas</div>
        ${htmlReglas(e.reglas)}
      </div>
      <div class="der">
        <div class="sub">Tu programa recibe, en este orden</div>
        <ol>${e.entradas.map(r => `<li>${esc(r)}</li>`).join('')}</ol>
        <div class="sub">Tu programa muestra</div>
        <div class="salidas mono">${e.salidas.map(r => esc(r)).join('<br>')}</div>
        <div class="sub">Ejemplo</div>
        <div class="ej">
          <div class="ej-t">Escribes (cada dato con Enter):</div>
          <div class="chips">${chips}</div>
          <div class="ej-t">Y debe salir:</div>
          <pre class="ej-s">${esc(p.esperado.join('\n'))}</pre>
        </div>
      </div>
    </div>
    <div class="pie">Las líneas de resultado deben llevar los mismos textos del ejemplo; puedes mostrar otras líneas, como las preguntas. Sin internet.</div>
  </div>`;
}

const CSS_FICHAS = CSS + `
  .ficha { height: 5.15in; width: 100%; border: 2px solid var(--c); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; font-size: 10pt; background: #fff; }
  .n1 { --c: var(--a); --suave: var(--a-suave); }
  .n2 { --c: var(--b); --suave: var(--b-suave); }
  .cab { display: flex; align-items: center; gap: 12px; padding: 7px 14px; background: var(--c); color: #fff; }
  .num { font-size: 22pt; font-weight: 800; background: #fff; color: var(--c); width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none; }
  .tit { flex: 1; } .t { font-size: 15pt; font-weight: 700; line-height: 1.1; } .emp { font-size: 9pt; opacity: .9; }
  .niv { font-size: 15pt; letter-spacing: 2px; }
  .cuerpo { display: flex; gap: 14px; padding: 8px 14px 4px; flex: 1; min-height: 0; }
  .izq { flex: 1.05; } .der { flex: 1; }
  .historia { margin: 0 0 4px; font-weight: 600; line-height: 1.3; }
  .sub { font-size: 8pt; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--c); margin: 6px 0 2px; }
  ul, ol { margin: 0; padding-left: 18px; } li { margin-bottom: 2px; line-height: 1.25; }
  .salidas { background: var(--suave); border-left: 3px solid var(--c); padding: 4px 8px; font-size: 9pt; line-height: 1.35; }
  .ej { border: 1px dashed var(--c); border-radius: 8px; padding: 4px 8px; background: #fff; }
  .ej-t { font-size: 8pt; color: var(--gris); margin-top: 2px; }
  .chips { display: flex; flex-wrap: wrap; gap: 3px; margin: 2px 0 3px; }
  .chip { font-family: Consolas, monospace; font-size: 9pt; background: var(--suave); border: 1px solid var(--c); border-radius: 5px; padding: 0 5px; }
  .ej-s { margin: 1px 0 0; font-size: 8.6pt; line-height: 1.25; white-space: pre; }
  .tb { width: 100%; border-collapse: collapse; margin: 3px 0 4px; font-size: 0.86em; }
  .tb th { background: var(--c); color: #fff; text-align: left; padding: 1px 5px; font-size: 0.85em; }
  .tb td { padding: 1px 5px; border-bottom: 1px solid #e2e8f0; line-height: 1.2; }
  .tb td:first-child { font-weight: 600; color: var(--c); }
  .calc { border-left: 3px solid #d97706; background: #fffbeb; padding: 2px 7px; margin: 3px 0 4px; font-size: 0.9em; line-height: 1.25; }
  .calc-t { font-size: 0.78em; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: #b45309; }
  .calc-e { color: var(--gris); }
  .ejr { margin: 3px 0 4px; padding: 1px 7px; border: 1px dashed #94a3b8; border-radius: 6px; color: #475569; font-size: 0.9em; line-height: 1.25; }
  .pie { font-size: 7.5pt; color: var(--gris); padding: 3px 14px 5px; border-top: 1px solid #e2e8f0; line-height: 1.2; }
`;
const SCRIPT_AJUSTE = `
  if (/^#p[0-9]+$/.test(location.hash)) { const k = Number(location.hash.slice(2)); document.querySelectorAll('.pagina').forEach((p, i) => { if (i + 1 !== k) { p.style.display = 'none'; } }); }
  window.addEventListener('load', () => {
    document.querySelectorAll('.ficha').forEach(c => {
      let tam = 11.5; c.style.fontSize = tam + 'pt';
      while ((c.scrollHeight > c.clientHeight + 1 || c.querySelector('.cuerpo').scrollHeight > c.querySelector('.cuerpo').clientHeight + 1) && tam > 6.5) { tam -= 0.25; c.style.fontSize = tam + 'pt'; }
      if (c.scrollHeight > c.clientHeight + 1) { c.setAttribute('data-desborde', '1'); }
      c.setAttribute('data-tam', tam);
    });
  });`;

let paginas = '';
for (let i = 0; i < ejercicios.length; i += 2) {
  paginas += `<div class="pagina">${ficha(ejercicios[i])}${ejercicios[i + 1] ? ficha(ejercicios[i + 1]) : ''}</div>`;
}
const htmlFichas = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Fichas del parcial</title><style>${CSS_FICHAS}</style></head><body>${paginas}<script>${SCRIPT_AJUSTE}</script></body></html>`;

// ---------- papelitos ----------
function papelitos(desde, hasta, clase, etiqueta) {
  let s = '';
  for (let n = desde; n <= hasta; n++) { s += `<div class="pap ${clase}"><div class="pn">${n}</div></div>`; }
  return `<div class="bolsa ${clase}"><div class="bt">${etiqueta}</div><div class="rejilla">${s}</div></div>`;
}
const htmlPapelitos = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Papelitos del sorteo</title><style>${CSS}
  .p1 { page-break-after: auto; }
  h1 { font-size: 16pt; margin: 0 0 4px; } .ins { font-size: 10pt; color: var(--gris); margin: 0 0 12px; }
  .bolsa { margin-bottom: 20px; } .bt { font-weight: 800; font-size: 12pt; margin-bottom: 6px; }
  .rejilla { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; }
  .pap { height: 1.55in; border: 1.5px dashed #94a3b8; display: flex; align-items: center; justify-content: center; }
  .pn { font-size: 54pt; font-weight: 800; }
  .n1 .pn, .bolsa.n1 .bt { color: var(--a); } .n2 .pn, .bolsa.n2 .bt { color: var(--b); }
  .pap.n1 { background: var(--a-suave); } .pap.n2 { background: var(--b-suave); }
</style></head><body><div class="p1">
  <h1>Papelitos del sorteo</h1>
  <p class="ins">Recorta por las líneas punteadas, dobla cada papelito y mételos en dos bolsas: la bolsa ★ (1 a 10) y la bolsa ★★ (11 a 20). Cada estudiante saca un papelito de cada bolsa y recibe las fichas con esos números, boca abajo.</p>
  ${papelitos(1, 10, 'n1', 'Bolsa ★  (intermedio)')}
  ${papelitos(11, 20, 'n2', 'Bolsa ★★  (reto)')}
</div></body></html>`;

// ---------- hoja de ayuda ----------
const ayuda = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Hoja de ayuda</title><style>${CSS}
  @page { size: Letter; margin: 0.35in; }
  body { font-size: 9.2pt; }
  h1 { font-size: 15pt; margin: 0 0 2px; color: var(--a); } .sub { color: var(--gris); font-size: 8.5pt; margin-bottom: 8px; }
  .col { columns: 2; column-gap: 0.25in; }
  .bloque { break-inside: avoid; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 5px 8px 6px; margin-bottom: 7px; }
  h2 { font-size: 9.5pt; margin: 0 0 3px; color: var(--a); text-transform: uppercase; letter-spacing: .04em; }
  pre { margin: 2px 0; padding: 4px 6px; background: #f1f5f9; border-radius: 5px; font-size: 8.4pt; line-height: 1.28; white-space: pre; }
  p { margin: 2px 0; line-height: 1.3; }
  table { border-collapse: collapse; width: 100%; font-size: 8.6pt; } td { padding: 1px 4px; border-bottom: 1px solid #e2e8f0; vertical-align: top; } td:first-child { font-family: Consolas, monospace; white-space: nowrap; }
</style></head><body>
<h1>Hoja de ayuda: C# de consola</h1>
<div class="sub">Todo lo que hemos visto en clase. No necesitas internet.</div>
<div class="col">
<div class="bloque"><h2>Mostrar y leer</h2>
<pre>Console.WriteLine("Hola");
Console.WriteLine("Total: " + total);

string nombre = Console.ReadLine();
int edad = int.Parse(Console.ReadLine());</pre>
<p>Con <code>+</code> unes texto con variables. Si sumas dentro del texto, usa paréntesis: <code>"Suma: " + (a + b)</code>.</p></div>

<div class="bloque"><h2>Variables</h2>
<pre>int cantidad = 5;      // número entero
string texto = "hola"; // texto
bool listo = false;    // true o false

cantidad = cantidad + 1;
cantidad++;            // suma 1
cantidad += 10;        // suma 10</pre></div>

<div class="bloque"><h2>Operadores</h2>
<table>
<tr><td>+  -  *  /</td><td>suma, resta, multiplica, divide</td></tr>
<tr><td>%</td><td>residuo de la división (7 % 2 es 1)</td></tr>
<tr><td>7 / 2</td><td>con enteros da 3 (sin decimales)</td></tr>
<tr><td>valor * 8 / 100</td><td>el 8% de valor: primero multiplica, luego divide</td></tr>
<tr><td>==  !=</td><td>igual, distinto</td></tr>
<tr><td>&lt;  &gt;  &lt;=  &gt;=</td><td>comparaciones</td></tr>
<tr><td>&amp;&amp;  ||  !</td><td>y, o, no</td></tr>
</table>
<p><code>=</code> guarda un valor; <code>==</code> compara.</p></div>

<div class="bloque"><h2>if / else if / else</h2>
<pre>if (nota >= 90)
{
    Console.WriteLine("Excelente");
}
else if (nota >= 60)
{
    Console.WriteLine("Aprobado");
}
else
{
    Console.WriteLine("Reprobado");
}</pre>
<p>Solo se ejecuta la primera rama cuya condición se cumple. Con <code>if</code> separados se evalúan todos.</p></div>

<div class="bloque"><h2>Condiciones compuestas</h2>
<pre>if (edad >= 18 &amp;&amp; edad &lt;= 65) { ... }
if (dia == 6 || dia == 7) { ... }
if (!(listo)) { ... }
if ((a > 0 &amp;&amp; b > 0) || c == 1) { ... }</pre></div>

<div class="bloque"><h2>for (sabes cuántas vueltas)</h2>
<pre>for (int i = 1; i &lt;= 10; i++)
{
    Console.WriteLine(i);
}</pre></div>

<div class="bloque"><h2>while (repite mientras se cumpla)</h2>
<pre>while (saldo > 0)
{
    saldo = saldo - cuota;
}</pre>
<p>La condición se revisa antes de cada vuelta. Si ya es falsa al empezar, no entra nunca.</p></div>

<div class="bloque"><h2>do while (entra al menos una vez)</h2>
<pre>int numero;

do
{
    Console.WriteLine("Un número de 1 a 5:");
    numero = int.Parse(Console.ReadLine());
}
while (numero &lt; 1 || numero > 5);</pre>
<p>La condición se revisa al final. Sirve para volver a pedir un dato inválido.</p></div>

<div class="bloque"><h2>Un ciclo dentro de otro</h2>
<pre>for (int fila = 1; fila &lt;= 3; fila++)
{
    string linea = "";

    for (int col = 1; col &lt;= 4; col++)
    {
        linea = linea + "X ";
    }

    Console.WriteLine(linea);
}</pre>
<p>Lo que declaras dentro de un ciclo empieza de nuevo en cada vuelta. Lo que declaras antes, se conserva.</p></div>

<div class="bloque"><h2>Bandera (bool)</h2>
<pre>bool encontrado = false;

if (numero == 7)
{
    encontrado = true;
}

if (encontrado)
{
    Console.WriteLine("Lo encontré");
}</pre></div>

<div class="bloque"><h2>Cuidado con</h2>
<p>Cada <code>{</code> lleva su <code>}</code>. Cada instrucción termina con <code>;</code>. Si escribes letras donde el programa espera un número con <code>int.Parse</code>, se cae. Prueba tu programa con el ejemplo de la ficha antes de entregarlo.</p>
<p>Sin arreglos, sin métodos propios, sin <code>Math</code> y sin <code>break</code>.</p></div>
</div>
</body></html>`;

// ---------- clave del profe ----------
function bloqueClave(e) {
  const p = pruebas.find(x => x.n === e.n).pruebas;
  const filas = p.map((t, i) => `<tr><td class="c1">${i + 1}${i === 0 ? '<br><small>ejemplo</small>' : ''}</td><td class="mono">${esc(t.entradas.join('\n'))}</td><td class="mono">${esc(t.esperado.join('\n'))}</td></tr>`).join('');
  return `<section class="clave ${e.nivel === 1 ? 'n1' : 'n2'}">
    <h2><span class="nn">${e.n}</span> ${esc(e.titulo)} <span class="est">${estrellas(e.nivel)}</span></h2>
    <p class="cmd">Para calificar: <code>node calificar.js ${e.n} "ruta del proyecto"</code></p>
    <table class="pr"><tr><th>Prueba</th><th>Entradas (una por línea)</th><th>Debe salir</th></tr>${filas}</table>
    ${pistasDe(e).length ? `<div class="solt">Pistas que puedes dar (en la página del sorteo se revelan con costo)</div>${pistasDe(e).map(p => `<p class="pista"><b>${esc(p.titulo)}:</b> ${esc(p.formula)}. <i>Ejemplo: ${esc(p.ejemplo)}</i></p>`).join('')}` : ''}
    <div class="solt">Solución de referencia (probada)</div>
    <pre class="sol">${esc(e.sol)}</pre>
  </section>`;
}
const registro = Array.from({ length: 5 }, () => '<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>').join('');
const clave = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Clave del profe</title><style>${CSS}
  @page { size: Letter; margin: 0.4in; }
  body { font-size: 9.5pt; }
  h1 { font-size: 17pt; margin: 0 0 6px; color: var(--a); } h3 { font-size: 11pt; margin: 12px 0 4px; color: var(--a); }
  p, li { line-height: 1.35; } ol, ul { margin: 2px 0; padding-left: 20px; }
  table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #cbd5e1; padding: 4px 6px; vertical-align: top; text-align: left; }
  th { background: #f1f5f9; font-size: 9pt; }
  .reg td { height: 30px; }
  .clave { page-break-before: always; --c: var(--a); } .clave.n2 { --c: var(--b); }
  .clave h2 { font-size: 14pt; margin: 0 0 4px; color: var(--c); } .nn { background: var(--c); color: #fff; border-radius: 50%; display: inline-block; min-width: 28px; text-align: center; padding: 1px 4px; } .est { float: right; }
  .cmd { font-size: 9pt; color: var(--gris); margin: 2px 0 6px; }
  .pr td.c1 { width: 62px; font-weight: 700; } .pr td { font-size: 9pt; white-space: pre-wrap; }
  .solt { font-size: 8.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: var(--c); margin: 8px 0 2px; }
  pre.sol { margin: 0; padding: 6px 8px; background: #f1f5f9; border-radius: 6px; font-size: 7.8pt; line-height: 1.22; white-space: pre; columns: 2; column-gap: 20px; }
  code { background: #f1f5f9; padding: 0 3px; border-radius: 3px; }
  p.pista { margin: 2px 0; font-size: 9pt; background: #fffbeb; border-left: 3px solid #d97706; padding: 2px 8px; }
</style></head><body>
<h1>Clave del profe: parcial de Programación Hipermedia</h1>
<h3>Forma principal: la página del sorteo (botón 🗂️ del índice)</h3>
<ul>
  <li>Escribes los nombres, sorteas y abres la ficha de cada uno. Cada ficha ★ vale <b>2 puntos</b> y cada ficha ★★ vale <b>3</b>, así que con las dos que les tocan el máximo es 5. Si alguien necesita otra oportunidad, el botón "Ficha extra" le da una más al azar; el total nunca pasa de 5.</li>
  <li>Para calificar, desde la ficha del estudiante: <b>✅ Lo logró</b> (las 5 pruebas bien, puntos completos), <b>❌ No pudo</b> (lo intentó y no lo logró, 0) o <b>⏭ No lo intentó</b> (0). Para dar crédito parcial, abre 🧪 Pruebas y marca cada una como Bien o Mal: la nota es el valor de la ficha por las pruebas bien dividido entre 5.</li>
  <li>La fórmula de "cómo se calcula" un porcentaje aparece como <b>pista bloqueada</b>. Si el estudiante la pide, la revelas desde su ficha y se le descuenta el costo de la pista (0,25 puntos por defecto, editable en la página). Las pistas de cada ficha también están en las páginas de abajo.</li>
</ul>
<h3>Si prefieres imprimir: cómo sortear</h3>
<ol>
  <li>Imprime <b>fichas.pdf</b> en color y recorta cada hoja por la mitad: queda una ficha por media hoja.</li>
  <li>Imprime <b>sorteo-papelitos.pdf</b>, recorta los papelitos y ponlos en dos bolsas: la ★ (1 a 10, intermedio) y la ★★ (11 a 20, reto).</li>
  <li>Cada estudiante saca un papelito de cada bolsa. Tú le entregas, boca abajo, las fichas con esos números y una <b>hoja-de-ayuda.pdf</b>. Nadie ve la ficha del compañero.</li>
  <li>Anota en el registro quién sacó qué. Los papelitos que sobran quedan de repuesto por si una ficha se daña o alguien necesita repetir.</li>
</ol>
<h3>Cómo calificar (1 punto por prueba, 5 pruebas por ficha)</h3>
<ul>
  <li>La <b>prueba 1</b> es el ejemplo que el estudiante ve en su ficha. Las pruebas 2 a 5 son ocultas y traen los casos límite.</li>
  <li><b>Rápido:</b> en una terminal, dentro de esta carpeta: <code>node calificar.js 7 "C:\\ruta\\del\\proyecto"</code>. Compila, ejecuta las 5 pruebas y muestra la nota sobre 5 (también acepta un <code>Program.cs</code> suelto). Si falla, muestra qué debía salir y qué salió.</li>
  <li><b>A mano:</b> <code>node calificar.js --pruebas 7</code> imprime las entradas de las 5 pruebas y lo que debe salir. También están en las páginas de cada ficha de este documento.</li>
  <li>Se comparan solo las líneas de resultado, sin importar mayúsculas, espacios ni tildes. Lo que el programa escriba en las preguntas no cuenta. El calendario (ficha 19) se compara línea por línea y la alineación debe ser exacta.</li>
  <li>El corrector es un apoyo: si un programa falla una prueba por un detalle de texto y tú ves que la lógica está bien, puedes darle el punto.</li>
</ul>
<h3>Registro del sorteo</h3>
<table class="reg"><tr><th>Estudiante</th><th>Ficha ★</th><th>Ficha ★★</th><th>Pts ★</th><th>Pts ★★</th><th>Nota</th></tr>${registro}</table>
${ejercicios.map(bloqueClave).join('')}
</body></html>`;

// ---------- imprimir ----------
function aPdf(nombre, html, extra) {
  const h = path.join(TMP, nombre + '.html');
  const pdf = path.join(DIR, nombre + '.pdf');
  fs.writeFileSync(h, html);
  try { execFileSync(EXE, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=6000', `--print-to-pdf=${pdf}`, 'file:///' + h.replace(/\\/g, '/')], { stdio: 'pipe' }); } catch (e) { /* Edge escribe ruido en stderr */ }
  console.log((fs.existsSync(pdf) ? 'OK  ' : 'FALLÓ ') + pdf + (extra || ''));
}
aPdf('fichas', htmlFichas);
aPdf('sorteo-papelitos', htmlPapelitos);
aPdf('hoja-de-ayuda', ayuda);
aPdf('clave-del-profe', clave);

// revisión de desbordes de las fichas
try {
  const dom = execFileSync(EXE, ['--headless=new', '--disable-gpu', '--virtual-time-budget=6000', '--dump-dom', 'file:///' + path.join(TMP, 'fichas.html').replace(/\\/g, '/')], { stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).toString();
  const tam = [...dom.matchAll(/class="ficha n(\d)"[^>]*data-tam="([\d.]+)"/g)].map(m => Number(m[2]));
  const desb = (dom.match(/data-desborde="1"/g) || []).length;
  console.log(`Tamaño de letra por ficha (pt): ${tam.join(', ')}. Con desborde: ${desb}`);
} catch (e) { console.log('No pude revisar el desborde: ' + e.message); }

// ---------- texto ----------
let txt = `BANCO DEL PARCIAL DE PROGRAMACIÓN HIPERMEDIA (20 fichas)\n`;
txt += `Cada ficha tiene 5 pruebas de 1 punto: la 1 es el ejemplo que ve el estudiante y la 2 a la 5 son ocultas. Fichas 1 a 10 = ★ (intermedio), 11 a 20 = ★★ (reto).\n`;
txt += `Sorteo: dos bolsas de papelitos (1 a 10 y 11 a 20), cada estudiante saca uno de cada bolsa. Corrector: node calificar.js <ficha> <ruta del proyecto>.\n`;
txt += `Alcance: variables, int.Parse, ReadLine, operadores, if / else if / else, && || !, %, for, while, do while y ciclos anidados. Todo en enteros. Sin arreglos, métodos, Math ni break.\n`;
txt += `Las 20 soluciones se ejecutaron en un proyecto .NET con las 100 pruebas (20 fichas x 5).\n`;
for (const e of ejercicios) {
  const pr = pruebas.find(x => x.n === e.n).pruebas;
  txt += `\n${'='.repeat(60)}\nFICHA ${e.n}  |  ${e.titulo}  |  ${estrellas(e.nivel)}  |  ${e.empresa}\n\n${e.historia}\n\nReglas:\n${reglasATexto(e.reglas)}\n\nEntradas, en este orden:\n${e.entradas.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}\n\nSalida:\n${e.salidas.map(r => '  ' + r).join('\n')}\n\nPruebas (entradas separadas por coma):\n`;
  pr.forEach((t, i) => { txt += `  ${i + 1}${i === 0 ? ' (ejemplo)' : ''}. ${t.entradas.join(', ')}\n${t.esperado.map(l => '       ' + l).join('\n')}\n`; });
  txt += `\nSolución de referencia:\n${e.sol}\n`;
}
fs.writeFileSync(path.join(DIR, 'banco-parcial.txt'), txt);
console.log('OK  banco-parcial.txt');
