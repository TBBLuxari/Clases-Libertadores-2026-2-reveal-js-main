// Presentación de clase "Armamos el carrito, paso a paso": una diapositiva por paso de la guía sin transistores (20 pasos),
// con el pantallazo de la protoboard, qué conectar, qué debe dar al medir y un botón que abre la página HTML de ese paso.
// Uso: node docs/gen-clase-carrito.js   → materias/sistemas-hipermedia/clase-11.html
// Antes: SOLO_LM=1 node docs/gen-protoboard-paginas.js && SOLO_LM=1 node docs/capturas-carrito.js
// Se genera una vez como punto de partida: después se puede editar clase-11.html a mano.
'use strict';
const fs = require('fs');
const path = require('path');
const PASOS = require('./pasos-lm358.js');
const OUT = path.join(__dirname, '..', 'materias', 'sistemas-hipermedia', 'clase-11.html');
const IMG = '../../assets/imagenes/sistemas-hipermedia/carrito-lm358/';
const PAGINAS = 'apoyo/carrito/protoboard-pasos/lm358/';
// minutos que se le dedican a cada paso (el paso 11 y los del sensor derecho son rápidos porque repiten lo del izquierdo)
const MIN = [4, 5, 6, 4, 5, 4, 5, 6, 5, 6, 3, 3, 4, 3, 3, 4, 6, 3, 3, 4];

let min = 0;
const out = [];
const seccion = (dur, attrs, inner) => { const m = min; min += dur; out.push(`      <section data-min="${m.toFixed(1)}"${attrs ? ' ' + attrs : ''}>\n${inner}\n      </section>\n`); };

// ---- apertura (3 diapositivas)
seccion(1, '', `        <span class="subtitulo">Sistemas Físicos Hipermedia</span>\n        <br>\n        <span class="pequeno">Clase 11 "Armamos el carrito, paso a paso"</span>`);
seccion(1.5, 'class="muchotexto"', `        <div class="pequeno">Cómo trabajamos</div>\n        <ul class="listasordenadas">\n          <li><span class="resaltar">Conectar</span> solo lo del paso, con el interruptor apagado</li>\n          <li><span class="resaltar">Medir</span> lo que dice la diapositiva</li>\n          <li>Si no da lo mismo, <span class="resaltar2">no seguimos</span>: levantan la mano</li>\n          <li>Todo a <span class="resaltar">6 V</span>: 4 pilas AA, nada de la pila de 9 V</li>\n        </ul>`);
seccion(1.5, 'class="muchotexto"', `        <div class="bloque">\n          <div class="cab">Lo que vamos a armar: <span class="resaltar2">20 pasos</span></div>\n          <img class="bl" data-preview-image src="${IMG}placa-completa-total-puente.png" alt="La protoboard completa del carrito con los dos sensores, el L293D, el LM358 y los condensadores">\n          <div class="cadena">El sensor izquierdo, los motores, el sensor derecho y los condensadores.</div>\n        </div>`);

// ---- un paso por diapositiva
PASOS.forEach((p, i) => {
  const lista = p.conectar.map(x => `<li>${x}</li>`).join('');
  const nota = p.nota ? `<div class="nota">Si no responde bien: ${p.nota.replace(/^si con 100 kΩ no responde bien, /, '')}</div>` : '';
  const archivo = 'paso-' + String(p.n).padStart(2, '0');
  const img = IMG + archivo + (p.n >= 10 ? '-puente' : '') + '.png';
  seccion(MIN[i], 'data-state="captura"', `        <div class="cab"><span class="resaltar2">Paso ${p.n}</span> · ${p.title}${p.opcional ? ' <span class="pequeno">(opcional)</span>' : ''} <a class="boton-html" href="${PAGINAS}${archivo}.html" target="_blank" rel="noopener">Ver HTML de este paso</a></div>
        <div class="cuerpo">
          <img class="cap" data-preview-image src="${img}" alt="La protoboard al terminar el paso ${p.n}: ${p.title}">
          <div class="lado">
            <div class="rotulo">Conectar</div>
            <ul class="pie">${lista}</ul>
            <div class="rotulo verde">Debe dar</div>
            <div class="dar">${p.medir}${nota}</div>
          </div>
        </div>`);
});

// ---- cierre fijo de todas las clases: contacto y video de despedida
out.push(`      <!-- Cierre fijo de todas las clases: contacto y video de despedida -->
      <section data-min="${min.toFixed(1)}">
      <div class="pequeno">Si me quieren agregar</div>
      <div class="">
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" height="50" style="vertical-align:middle;">
          Steam: <span class="resaltar">317510869</span> <br><br>
          <img src="https://upload.wikimedia.org/wikipedia/commons/d/d2/League_of_legends_logo.png" height="40" style="vertical-align:middle;">
          LoL: <span class="resaltar">Luxari#Lan</span> <br><br>
          Correo institucional:<br> <span class="resaltar2">jjardila@libertadores.edu.co</span>
      </div>
      </section>

      <section data-min="${(min + 1).toFixed(1)}">
      <!-- PLACEHOLDER: reemplazar src por el video de despedida de esta clase (o dejar esta diapositiva sin usar) -->
      <iframe width="1120" height="630" src="PONER_LINK_DEL_VIDEO_AQUI" title="Video de despedida" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </section>
`);

const estilos = `
  <style>
    /* diapositivas del paso a paso del carrito */
    section[data-state="captura"] { text-align: left; }
    .cab { font-size: 3vw; color: #efe9ff; margin-bottom: 1.2vh; text-align: center; }
    .boton-html { display: inline-block; margin-left: 1.5vw; padding: 0.2vh 1.1vw; border: 2px solid #5ff0d0; border-radius: 8px; color: #5ff0d0; font-size: 1.7vw; text-decoration: none; vertical-align: middle; }
    .boton-html:hover { background: #5ff0d0; color: #171226; }
    .cuerpo { display: flex; align-items: center; justify-content: center; gap: 2vw; width: 96vw; margin: 0 auto; }
    .cuerpo img.cap { flex: 0 1 60vw; max-width: 60vw; max-height: 74vh; object-fit: contain; background: #fbfaf6; border-radius: 10px; border: 3px solid #5ff0d0; }
    .cuerpo .lado { flex: 1 1 33vw; text-align: left; }
    .rotulo { display: inline-block; border: 2px solid #ffd166; color: #ffd166; border-radius: 8px; padding: 0 1vw; font-size: 1.9vw; margin-bottom: 0.8vh; }
    .rotulo.verde { border-color: #5ff0d0; color: #5ff0d0; margin-top: 2vh; }
    .cuerpo ul.pie { font-size: 2vw; line-height: 1.12; margin: 0; padding-left: 1.6vw; list-style: square; }
    .cuerpo ul.pie li { margin-bottom: 0.9vh; }
    .cuerpo ul.pie b, .dar b { color: #ffd166; font-weight: normal; }
    .dar { font-size: 2.1vw; line-height: 1.12; }
    .dar .nota { font-size: 1.6vw; margin-top: 1vh; color: #cfc9e8; }
    .bloque { display: flex; flex-direction: column; align-items: center; gap: 1.2vh; width: 96vw; margin: 0 auto; }
    .bloque .cab { font-size: 3vw; }
    .bloque img.bl { max-width: 92vw; max-height: 62vh; background: #fbfaf6; border-radius: 10px; border: 3px solid #5ff0d0; }
    .bloque .cadena { font-size: 2.5vw; line-height: 1.15; max-width: 90vw; }
  </style>`;

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Sistemas Hipermedia — Clase 11</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="../../node_modules/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="../../node_modules/reveal.js/plugin/highlight/monokai.css">

  <link rel="stylesheet" href="../../styles/styles.css">
  <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">${estilos}
</head>

  <body>

    <div id="dev-timer">--</div>

    <div class="reveal">
      <div class="slides">

      <!-- ==========================================================================
           CLASE 11: "Armamos el carrito, paso a paso"
           Una diapositiva por paso (20 pasos, guía SIN transistores: el sensor se arma directo con el LM358).
           Cada una: pantallazo de la protoboard, qué conectar, qué debe dar al medir y el botón "Ver HTML de este paso"
           (apoyo/carrito/protoboard-pasos/lm358/paso-NN.html). Los pantallazos viven en
           assets/imagenes/sistemas-hipermedia/carrito-lm358/ y desde el paso 10 muestran el puente corto de S.
           Clic en una imagen para ampliarla.
           ========================================================================== -->

${out.join('\n')}
      </div>
    </div>


    <!-- //////////////////////////////////////////////////////////// -->
    <script src="../../node_modules/reveal.js/dist/reveal.js"></script>
    <script src="../../node_modules/reveal.js/plugin/markdown/markdown.js"></script>
    <script src="../../node_modules/reveal.js/plugin/highlight/highlight.js"></script>
    <script src="../../node_modules/reveal.js/plugin/notes/notes.js"></script>
    <script src="../../assets/js/progreso.js"></script>

    <script>
            Reveal.initialize({
              hash: true,
              width: "100%",
              height: "100%",
              margin: 0,
              plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ]
            });

            // ---- Cronómetro de ensayo (solo con ?dev en la URL) ----
            if (new URLSearchParams(location.search).has('dev')) {
              document.body.classList.add('dev-mode');
            }
            function actualizarCronometro(slide) {
              const el = document.getElementById('dev-timer');
              if (!el || !slide) return;
              if (slide.dataset.plan) { el.textContent = '📝 PLAN (sin tiempo aún)'; return; }
              const minAttr = slide.dataset.min;
              if (minAttr === undefined) { el.textContent = '⏱ sin marca'; return; }
              const totalMin = parseFloat(minAttr);
              const totalSeconds = Math.round(totalMin * 60);
              const horaBase = new Date(2000, 0, 1, 18, 0, 0);
              horaBase.setSeconds(horaBase.getSeconds() + totalSeconds);
              const hh = horaBase.getHours().toString().padStart(2, '0');
              const mm = horaBase.getMinutes().toString().padStart(2, '0');
              const minDisplay = Math.floor(totalMin);
              const secDisplay = Math.round((totalMin - minDisplay) * 60).toString().padStart(2, '0');
              el.textContent = \`⏱ \${minDisplay}:\${secDisplay} (~\${hh}:\${mm})\`;
            }
            Reveal.on('ready', event => actualizarCronometro(event.currentSlide));

            function ytCommand(iframe, func)
            {
              if (iframe && iframe.src.includes('youtube.com/embed'))
              {
                iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
              }
            }

            Reveal.on('slidechanged', event =>
            {
              const prevVideo = event.previousSlide?.querySelector('video');
              if (prevVideo)
              {
                prevVideo.pause();
                prevVideo.currentTime = 0;
              }
              ytCommand(event.previousSlide?.querySelector('iframe'), 'pauseVideo');

              const video = event.currentSlide.querySelector('video');
              if (video)
              {
                video.currentTime = 0;
                video.play();
              }
              ytCommand(event.currentSlide.querySelector('iframe'), 'playVideo');

              actualizarCronometro(event.currentSlide);
          });
    </script>


  </body>

</html>
`;
fs.writeFileSync(OUT, html, 'utf8');
console.log(`clase-11.html: ${(html.match(/<section/g) || []).length} diapositivas, ${Math.round(min + 2)} min`);
