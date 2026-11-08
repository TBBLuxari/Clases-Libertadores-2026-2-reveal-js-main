// Presentación de clase 11/2 "Armamos el carrito digital, paso a paso" (Arduino UNO + L298N + 2 sensores IR).
// Una diapositiva por paso de la guía carrito-digital-guia (16 pasos), con el esquema del paso, qué conectar y qué debe dar al medir.
// Uso: node docs/gen-clase-carrito-digital.js   → materias/sistemas-hipermedia/clase-11-2.html
// Antes: node docs/gen-guia-digital.js (de ahí salen los esquemas y los códigos). Los esquemas se guardan en
// assets/imagenes/sistemas-hipermedia/carrito-digital/. Se genera una vez como punto de partida: después se puede editar a mano.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const GUIA = path.join(RAIZ, 'materias', 'sistemas-hipermedia', 'apoyo', 'carrito', 'guia-estudiantes', 'carrito-digital-guia.html');
const PLANTILLA = path.join(RAIZ, 'materias', 'sistemas-hipermedia', 'clase-11-1.html');
const OUT = path.join(RAIZ, 'materias', 'sistemas-hipermedia', 'clase-11-2.html');
const IMG_DIR = path.join(RAIZ, 'assets', 'imagenes', 'sistemas-hipermedia', 'carrito-digital');
const IMG = '../../assets/imagenes/sistemas-hipermedia/carrito-digital/';
const PDF_GUIA = 'apoyo/carrito/guia-estudiantes/carrito-digital-guia.pdf';

const guia = fs.readFileSync(GUIA, 'utf8');
const tpl = fs.readFileSync(PLANTILLA, 'utf8');
fs.mkdirSync(IMG_DIR, { recursive: true });

// ---------------------------------------------------------------- esquemas y códigos tomados de la guía
const unesc = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function guardarSvg(nombre, html) {
  const m = html.match(/<svg class="d" viewBox="([^"]+)"([\s\S]*?)<\/svg>/);
  if (!m) throw new Error('No encontré el esquema de ' + nombre);
  const [x, y, w, h] = m[1].split(' ').map(Number);
  const svg = m[0].replace('<svg class="d" ', `<svg width="${w * 2}" height="${h * 2}" `).replace(/^(<svg[^>]*>)/, `$1<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fbfaf6"/>`);
  fs.writeFileSync(path.join(IMG_DIR, nombre + '.svg'), svg, 'utf8');
}
const partes = guia.split('<section class="paso">');
for (let n = 1; n <= 10; n++) guardarSvg('paso-' + String(n).padStart(2, '0'), partes[n]);
guardarSvg('final', guia.slice(guia.indexOf('<section class="keep">')));

const codigos = [...guia.matchAll(/<pre class="code">([\s\S]*?)<\/pre>/g)].map(m => unesc(m[1]));
// partir un código en trozos que empiezan en cada "void" o "const" de primer nivel
function trozos(c) {
  const out = [];
  c.split('\n').forEach(l => { if (/^(void|const) /.test(l) || !out.length) out.push([]); out[out.length - 1].push(l); });
  return out.map(t => t.join('\n').replace(/\s+$/, ''));
}
const [CODIGO_SENSORES, CODIGO_MOTORES, CODIGO_FINAL] = codigos;
const ts = trozos(CODIGO_SENSORES), tm = trozos(CODIGO_MOTORES), tf = trozos(CODIGO_FINAL);
// el loop de los motores son 4 bloques que empiezan con un comentario
const loopM = tm[tm.length - 1].split('\n');
const iniBloques = loopM.map((l, i) => (/^  \/\/ /.test(l) ? i : -1)).filter(i => i >= 0);
const bloque = k => loopM.slice(iniBloques[k], k + 1 < iniBloques.length ? iniBloques[k + 1] : loopM.length - 1).join('\n').replace(/\s+$/, '');

// ---------------------------------------------------------------- piezas
let min = 0;
const out = [];
const seccion = (dur, attrs, inner) => { const m = min; min += dur; out.push(`      <section data-min="${m.toFixed(1)}"${attrs ? ' ' + attrs : ''}>\n${inner}\n      </section>\n`); };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lista = items => `<ul class="pie">${items.map(x => `<li>${x}</li>`).join('')}</ul>`;
const lado = (conectar, dar, nota, titulo) => `            <div class="rotulo">${titulo || 'Conectar'}</div>
            ${lista(conectar)}
            <div class="rotulo verde">Debe dar</div>
            <div class="dar">${dar}${nota ? `<div class="nota">${nota}</div>` : ''}</div>`;

// ---------------------------------------------------------------- apertura
seccion(1, '', `        <span class="subtitulo">Sistemas Físicos Hipermedia</span>
        <br>
        <span class="pequeno">Clase 11/2 "Armamos el carrito digital, paso a paso"</span>`);

seccion(1.5, 'class="muchotexto"', `        <div class="pequeno">Cómo trabajamos</div>
        <ul class="listasordenadas">
          <li><span class="resaltar">Conectar</span> solo lo del paso, con el interruptor apagado</li>
          <li><span class="resaltar">Medir</span> lo que dice la diapositiva</li>
          <li>Si no da lo mismo, <span class="resaltar2">no seguimos</span>: levantan la mano</li>
          <li>Motores a <span class="resaltar">6 V</span> (4 pilas AA). Arduino con su <span class="resaltar">pila de 9 V</span>. Nunca mezclarlas</li>
        </ul>`);

seccion(2, 'class="muchotexto"', `        <div class="bloque">
          <div class="cab">Lo que vamos a armar: <span class="resaltar2">16 pasos</span> <a class="boton-html" href="${PDF_GUIA}" target="_blank" rel="noopener">Guía en PDF</a></div>
          <img class="bl" data-preview-image src="${IMG}final.svg" alt="Esquema final del carrito digital: portapilas, L298N, Arduino UNO, pila de 9 V y dos sensores">
          <div class="cadena">Primero todo el cableado, con una prueba en cada paso. La programación va al final.</div>
        </div>`);

// ---------------------------------------------------------------- pasos de cableado (1 a 10)
const PASOS = [
  [1, 'Alimentación de los motores', 4,
    ['<span class="pos">Rojo (+)</span> del portapilas al interruptor y de ahí al borne <b>12V</b> del L298N', '<span class="neg">Negro (−)</span> al borne <b>GND</b> (el del medio)', 'El borne <b>5V</b> se deja vacío'],
    'Entre 12V y GND: <b>5,6 a 6,4 V</b>.'],
  [2, 'El motor izquierdo', 3,
    ['Un cable del motor al borne <b>OUT1</b>', 'El otro cable al borne <b>OUT2</b>'],
    'Al tirar suave de cada cable, <b>no se sale</b>. Todavía no gira.'],
  [3, 'El motor derecho', 2,
    ['Un cable del motor al borne <b>OUT3</b>', 'El otro cable al borne <b>OUT4</b>'],
    'Los dos motores firmes en sus bornes y ningún cable pelado toca a otro.'],
  [4, 'El Arduino y el negativo en común', 5,
    ['Pila de <b>9 V</b> al <b>jack</b> del Arduino (solo para el Arduino)', 'Cable del pin <b>GND junto al pin 13</b> al borne <b>GND</b> del L298N'],
    'LED <b>ON</b> encendido. Pin 5V contra GND: <b>4,8 a 5,2 V</b>. En continuidad, GND del Arduino con GND del L298N: <b>pita</b>.'],
  [5, 'Probar el motor izquierdo, sin programar', 4,
    ['Con el interruptor <b>encendido</b>: cable del pin <b>5V</b> del Arduino a <b>IN1</b>', 'Cable de un <b>GND</b> del Arduino a <b>IN2</b>'],
    'El motor izquierdo gira <b>hacia adelante</b>. Si se cambian los dos cables de lugar, gira al revés.',
    'Si gira hacia atrás, intercambiar sus dos cables en OUT1 y OUT2. Al terminar, quitar los dos cables.'],
  [6, 'Probar el motor derecho, sin programar', 3,
    ['Cable del pin <b>5V</b> a <b>IN3</b>', 'Cable de un <b>GND</b> a <b>IN4</b>'],
    'El motor derecho gira <b>hacia adelante</b>. Cambiando los cables, al revés.',
    'Si gira hacia atrás, intercambiar sus cables en OUT3 y OUT4. Al terminar, quitar los dos cables.'],
  [7, 'Control del motor izquierdo', 3,
    ['<b>IN1</b> al pin <b>7</b> del Arduino', '<b>IN2</b> al pin <b>8</b> del Arduino'],
    'El motor <b>no se mueve</b> (todavía no hay código). Cada cable en su pin, sin los provisionales.'],
  [8, 'Control del motor derecho', 3,
    ['<b>IN3</b> al pin <b>9</b> del Arduino', '<b>IN4</b> al pin <b>10</b> del Arduino'],
    '<b>ENA</b> y <b>ENB</b> no llevan cable: sus jumpers siguen puestos.'],
  [9, 'El sensor izquierdo', 5,
    ['<b>VCC</b> al pin <b>5V</b>', '<b>GND</b> al pin <b>GND</b> pegado al 5V', '<b>OUT</b> al pin <b>2</b>'],
    'LED de energía encendido. Con la mano a 3 a 10 cm se enciende el segundo LED. En <b>OUT</b>: <b>5 V</b> libre, <b>0 V</b> con obstáculo.',
    'Muy sensible o nada sensible: el tornillo azul del sensor.'],
  [10, 'El sensor derecho', 3,
    ['<b>Antes:</b> medir <b>IOREF</b> contra GND, debe dar cerca de 5 V', '<b>VCC</b> al pin <b>IOREF</b> (da los mismos 5 V del pin 5V)', '<b>GND</b> al <b>otro</b> GND de energía (junto a VIN)', '<b>OUT</b> al pin <b>3</b>'],
    'Lo mismo que el izquierdo: LED de energía, segundo LED con la mano, <b>5 V</b> libre y <b>0 V</b> con obstáculo.',
    'Si IOREF marca 0 V: llevar los dos VCC a una protoboard que reciba el pin 5V.'],
];
PASOS.forEach(([n, titulo, dur, conectar, dar, nota]) => {
  const arch = 'paso-' + String(n).padStart(2, '0');
  seccion(dur, 'data-state="captura"', `        <div class="cab"><span class="resaltar2">Paso ${n}</span> · ${titulo}</div>
        <div class="cuerpo">
          <img class="cap" data-preview-image src="${IMG}${arch}.svg" alt="Esquema al terminar el paso ${n}: ${titulo}">
          <div class="lado">
${lado(conectar, dar, nota)}
          </div>
        </div>`);
});

// ---------------------------------------------------------------- programación (11 a 16)
seccion(6, 'class="muchotexto"', `        <div class="cab"><span class="resaltar2">Paso 11</span> · Instalar el IDE de Arduino</div>
        <ul class="listasordenadas">
          <li>Entrar a <span class="resaltar">arduino.cc/en/software</span></li>
          <li>Descargar el <span class="resaltar">Arduino IDE 2</span> e instalar con todo por defecto</li>
          <li>Abrirlo. Si pregunta por controladores, aceptar</li>
        </ul>
        <div class="cadena">Debe dar: un archivo nuevo con <span class="resaltar2">void setup()</span> y <span class="resaltar2">void loop()</span>.</div>`);

seccion(6, 'class="muchotexto"', `        <div class="cab"><span class="resaltar2">Paso 12</span> · Conectar el Arduino al computador</div>
        <ul class="listasordenadas">
          <li><span class="resaltar">Desconectar</span> el clip de la pila de 9 V y conectar el cable USB</li>
          <li>Herramientas → Placa → <span class="resaltar">Arduino Uno</span></li>
          <li>Herramientas → Puerto → el que dice <span class="resaltar">COM</span> con un número</li>
          <li>Archivo → Ejemplos → 01.Basics → <span class="resaltar">Blink</span> y botón Subir</li>
        </ul>
        <div class="cadena">Debe dar: el LED <span class="resaltar2">L</span> de la placa parpadea cada segundo. Si no sale ningún puerto: otro cable (muchos son solo de carga) o el controlador CH340.</div>`);

const codigo = (n, titulo, dur, cod, conectar, dar, nota, tituloLado) => seccion(dur, 'data-state="captura" class="codigo"', `        <div class="cab"><span class="resaltar2">Paso ${n}</span> · ${titulo}</div>
        <div class="cuerpo">
          <pre><code class="cpp" data-trim data-noescape>${esc(cod)}</code></pre>
          <div class="lado">
${lado(conectar, dar, nota, tituloLado || 'Hacer')}
          </div>
        </div>`);

codigo(13, 'Código de prueba: los sensores (1 de 2)', 4, ts.slice(0, 3).join('\n\n'),
  ['Archivo → Nuevo sketch, borrar lo que trae y pegar', 'Subir', 'Herramientas → <b>Monitor Serie</b> a <b>9600</b> baudios'],
  'Se empiezan a escribir líneas en el Monitor Serie. Sigue en la otra diapositiva.');
codigo(13, 'Código de prueba: los sensores (2 de 2)', 3, ts[ts.length - 1],
  ['Cartón blanco frente al sensor izquierdo, y luego frente al derecho'],
  '<b>Izquierdo: OBSTACULO</b> o <b>Derecho: OBSTACULO</b>, según el sensor.',
  'Si salen al revés, intercambiar 2 y 3 en el código.');
codigo(14, 'Código de prueba: los motores (1 de 3)', 4, tm.slice(0, tm.length - 1).join('\n\n'),
  ['<b>Levantar el carro</b>: ruedas en el aire', 'Interruptor de los motores encendido', 'Pegar y Subir. Sigue en las otras diapositivas'],
  'Todavía no se mueve nada: falta el <b>loop</b>.');
codigo(14, 'Código de prueba: los motores (2 de 3)', 3, 'void loop() {\n' + bloque(0) + '\n\n' + bloque(1) + '\n\n  // sigue en la otra diapositiva',
  ['Esta parte manda al motor <b>izquierdo</b>'],
  'Izquierda adelante (2 s), pausa, izquierda atrás (2 s), pausa.',
  null, 'Mirar');
codigo(14, 'Código de prueba: los motores (3 de 3)', 3, '  // viene de la otra diapositiva\n\n' + bloque(2) + '\n\n' + bloque(3) + '\n}',
  ['Esta parte manda al motor <b>derecho</b>'],
  'Derecha adelante, pausa, derecha atrás, y se repite. En "adelante" la rueda gira hacia donde apuntan los sensores.',
  'Una rueda al revés: intercambiar sus dos cables en los bornes del L298N.', 'Mirar');

seccion(2, 'class="muchotexto"', `        <div class="pequeno">Cómo decide el carro</div>
        <ul class="listasordenadas">
          <li>Ninguno ve algo: <span class="resaltar">avanza</span></li>
          <li>Solo el izquierdo ve algo: <span class="resaltar">gira a la derecha</span></li>
          <li>Solo el derecho ve algo: <span class="resaltar">gira a la izquierda</span></li>
          <li>Los dos ven algo: <span class="resaltar2">retrocede un momento y gira</span></li>
        </ul>`);
codigo(15, 'El código completo (1 de 4)', 4, tf.slice(0, tf.findIndex(t => /^void adelante/.test(t))).join('\n\n'),
  ['Archivo → Nuevo sketch y pegar. Esta parte declara los pines y los pone como salida o entrada'],
  'Es solo la preparación. Faltan las funciones de movimiento.', null, 'Hacer');
codigo(15, 'El código completo (2 de 4)', 3, tf.filter(t => /^void (adelante|atras)/.test(t)).join('\n\n'),
  ['<b>adelante()</b> y <b>atras()</b>: cada una pone IN1 a IN4 en HIGH o LOW'],
  'Los mismos HIGH y LOW que se probaron con cables en los pasos 5 y 6.', null, 'Mirar');
codigo(15, 'El código completo (3 de 4)', 3, tf.filter(t => /^void girar/.test(t)).join('\n\n'),
  ['<b>girarDerecha()</b> y <b>girarIzquierda()</b>: un motor adelante y el otro atrás'],
  'Cada giro es una combinación distinta de los cuatro pines.', null, 'Mirar');
codigo(15, 'El código completo (4 de 4)', 8, tf[tf.length - 1],
  ['Subir. Desconectar el USB y conectar la <b>pila de 9 V</b>', 'Carro en el piso, espacio despejado, interruptor encendido'],
  'El carro avanza. Con la mano o un cartón blanco al frente, <b>gira para esquivar</b>.',
  'Gira hacia el obstáculo: intercambiar 2 y 3 en SENSOR_IZQ y SENSOR_DER. Gira poco: subir <b>400</b> a 700.', 'Hacer');

seccion(3, 'class="muchotexto"', `        <div class="cab"><span class="resaltar2">Paso 16</span> · Ajustes opcionales</div>
        <ul class="listasordenadas">
          <li><span class="resaltar">Girar más o menos:</span> los números de los <span class="resaltar2">delay()</span></li>
          <li><span class="resaltar">Detectar más lejos o más cerca:</span> el tornillo azul de cada sensor</li>
          <li><span class="resaltar">Velocidad:</span> ENA al pin 5, ENB al pin 6 y <span class="resaltar2">analogWrite</span></li>
          <li><span class="resaltar">Un tercer sensor</span> al centro, con OUT al pin 4</li>
        </ul>
        <div class="cadena">Un solo cambio por vez. Si se daña, volver al código completo.</div>`);

// ---------------------------------------------------------------- cierre fijo (contacto y video de despedida), igual que en las demás clases
const iCierre = tpl.indexOf('      <!-- Cierre fijo');
const finSlides = tpl.lastIndexOf('</section>') + '</section>'.length;
const cierre = tpl.slice(iCierre, finSlides).replace(/data-min="[\d.]+"/g, () => { const m = min.toFixed(1); min += 1; return `data-min="${m}"`; });

// ---------------------------------------------------------------- página final
const iSlides = tpl.indexOf('<div class="slides">') + '<div class="slides">'.length;
const estilosExtra = `
    /* diapositivas con código (clase 11/2) */
    section.codigo .cuerpo { align-items: flex-start; }
    section.codigo .cuerpo pre { flex: 0 0 56vw; width: 56vw; margin: 0; font-size: 1.55vw; line-height: 1.2; box-shadow: none; }
    section.codigo .cuerpo pre code { max-height: none; padding: 1.2vh 1.2vw; font-size: 1em; }
    section.codigo .cuerpo .lado { flex: 1 1 36vw; }
    section.codigo .cuerpo ul.pie { font-size: 1.8vw; }
    section.codigo .dar { font-size: 1.8vw; }
    section.codigo .dar .nota { font-size: 1.4vw; }
`;
let html = tpl.slice(0, iSlides) + '\n\n' +
  `      <!-- ==========================================================================
           CLASE 11/2 (versión digital): "Armamos el carrito digital, paso a paso"
           Arduino UNO + L298N + 2 sensores IR FC-51. 16 pasos de la guía carrito-digital-guia: primero todo el cableado con
           una prueba por paso (esquema en assets/imagenes/sistemas-hipermedia/carrito-digital/), la programación al final.
           Generada con docs/gen-clase-carrito-digital.js; después se puede editar a mano.
           ========================================================================== -->

` + out.join('\n') + '\n' + cierre + tpl.slice(finSlides);
html = html.replace(/<title>[^<]*<\/title>/, '<title>Sistemas Hipermedia — Clase 11/2 (digital)</title>').replace('  </style>', estilosExtra + '  </style>');
fs.writeFileSync(OUT, html, 'utf8');
console.log(`clase-11-2.html: ${(out.length)} diapositivas de contenido, ${Math.round(min)} min`);
