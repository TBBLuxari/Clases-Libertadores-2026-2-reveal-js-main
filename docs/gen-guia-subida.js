// Genera las guías de "Subida Chocona" (profesor y estudiantes) en HTML y PDF.
// Uso: node docs/gen-guia-subida.js
// Si un PDF está abierto en otro programa, ciérralo antes (Windows no deja sobrescribirlo).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = path.join(__dirname, '..');
const salida = path.join(raiz, 'materias', 'programacion-videojuegos', 'actividades', 'subida-chocona');
const sol = path.join(raiz, 'ejemplos', 'programacion-videojuegos', 'unity', 'subida-chocona');
fs.mkdirSync(salida, { recursive: true });

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const code = s => '<pre><code>' + esc(s.replace(/^\n+|\s+$/g, '')) + '</code></pre>';
const ul = a => '<ul>' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>';
const ol = a => '<ol>' + a.map(x => '<li>' + x + '</li>').join('') + '</ol>';
const det = (titulo, cuerpo) => '<details><summary>' + titulo + '</summary><div class="det">' + cuerpo + '</div></details>';
const leer = f => fs.readFileSync(path.join(sol, f), 'utf8');

// ---------- Dibujos ----------
const colores = { J1: '#2e70ed', J2: '#d93b3b', J3: '#40bf5e', J4: '#f2c230' };

function tanqueSvg(x, y, color, giro) {
  return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (giro || 0) + ')">' +
    '<rect x="-10" y="-14" width="20" height="28" rx="2" fill="' + color + '" stroke="#222" stroke-width="1"/>' +
    '<circle cx="0" cy="-1" r="6" fill="#26262b"/>' +
    '<rect x="-1.5" y="-18" width="3" height="14" fill="#26262b"/></g>';
}

function dibujoVista() {
  let s = '<svg viewBox="0 0 360 500" role="img" aria-label="Vista desde arriba de la carretera, el Foco y los tanques">';
  s += '<rect width="360" height="500" fill="#e9eef3"/>';
  s += '<rect x="130" y="8" width="100" height="484" fill="#7a8085"/>';
  s += '<line x1="130" y1="8" x2="130" y2="492" stroke="#fff" stroke-width="2"/><line x1="230" y1="8" x2="230" y2="492" stroke="#fff" stroke-width="2"/>';
  for (let y = 20; y < 480; y += 40) { s += '<rect x="178" y="' + y + '" width="4" height="22" fill="#fff"/>'; }
  s += '<text x="12" y="250" font-size="12" fill="#6b7480">vacío:</text><text x="12" y="265" font-size="12" fill="#6b7480">si caes,</text><text x="12" y="280" font-size="12" fill="#6b7480">quedas fuera</text>';
  s += '<text x="252" y="335" font-size="12" fill="#6b7480">vacío</text>';
  // pared invisible
  s += '<line x1="118" y1="178" x2="242" y2="178" stroke="#d93b3b" stroke-width="3" stroke-dasharray="7 5"/>';
  s += '<text x="248" y="172" font-size="12" fill="#d93b3b">pared invisible</text><text x="248" y="186" font-size="12" fill="#d93b3b">(13 m delante)</text>';
  // linea de eliminacion
  s += '<line x1="118" y1="468" x2="242" y2="468" stroke="#e8790c" stroke-width="3" stroke-dasharray="7 5"/>';
  s += '<text x="12" y="462" font-size="12" fill="#e8790c">9 m detrás del Foco:</text><text x="12" y="476" font-size="12" fill="#e8790c">quedas fuera</text>';
  // foco
  s += '<polygon points="180,342 190,352 180,362 170,352" fill="#222"/><text x="196" y="356" font-size="12" fill="#222" font-weight="bold">Foco</text>';
  // objetos
  s += '<g><circle cx="150" cy="247" r="7" fill="#f2c230" stroke="#8a6d00"/><circle cx="205" cy="295" r="9" fill="#26262b"/><rect x="203" y="283" width="4" height="6" fill="#d93b3b"/>';
  s += '<circle cx="149" cy="215" r="9" fill="#ff8020"/><rect x="176" y="205" width="40" height="9" fill="#9a4dcc"/></g>';
  s += '<text x="250" y="300" font-size="11" fill="#444">bomba</text><text x="250" y="250" font-size="11" fill="#444">moneda</text>';
  s += '<text x="92" y="219" font-size="11" fill="#444">barril</text><text x="222" y="226" font-size="11" fill="#444">barrera</text>';
  // tanques
  s += tanqueSvg(161, 392, colores.J1) + tanqueSvg(199, 392, colores.J2) + tanqueSvg(161, 428, colores.J3) + tanqueSvg(199, 428, colores.J4);
  // flecha
  s += '<line x1="320" y1="400" x2="320" y2="300" stroke="#1b232c" stroke-width="3"/><polygon points="320,288 313,303 327,303" fill="#1b232c"/>';
  s += '<text x="292" y="425" font-size="12" fill="#1b232c">el Foco</text><text x="292" y="439" font-size="12" fill="#1b232c">avanza solo</text>';
  s += '</svg>';
  return s;
}

function dibujoTanque() {
  let s = '<svg viewBox="0 0 360 230" role="img" aria-label="Un tanque visto desde arriba con su flecha de avance y su giro">';
  s += '<rect width="360" height="230" fill="#e9eef3"/>';
  s += tanqueSvg(180, 125, colores.J1, 25).replace('<g ', '<g transform-origin="center" ');
  s += '<g transform="translate(180 125) rotate(25)"><line x1="0" y1="-20" x2="0" y2="-95" stroke="#17806f" stroke-width="4"/><polygon points="0,-108 -8,-92 8,-92" fill="#17806f"/></g>';
  s += '<path d="M 236 120 A 58 58 0 0 0 214 68" fill="none" stroke="#b8672f" stroke-width="3"/><polygon points="206,60 223,64 212,77" fill="#b8672f"/>';
  s += '<text x="10" y="30" font-size="13" fill="#17806f" font-weight="bold">W / S: empuje</text><text x="10" y="47" font-size="12" fill="#17806f">AddForce hacia transform.forward</text>';
  s += '<text x="10" y="205" font-size="13" fill="#b8672f" font-weight="bold">A / D: giro</text><text x="10" y="221" font-size="12" fill="#b8672f">MoveRotation sobre el eje Y</text>';
  s += '</svg>';
  return s;
}

function dibujoSolidoTrigger() {
  let s = '<svg viewBox="0 0 360 200" role="img" aria-label="Diferencia entre un objeto sólido y un trigger">';
  s += '<rect width="360" height="200" fill="#e9eef3"/><line x1="180" y1="10" x2="180" y2="190" stroke="#c9d2dc" stroke-width="2"/>';
  s += tanqueSvg(40, 100, colores.J1, 90) + '<circle cx="125" cy="100" r="20" fill="#ff8020" stroke="#222"/>';
  s += '<path d="M 60 100 L 98 100" stroke="#222" stroke-width="3"/><polygon points="106,100 92,93 92,107" fill="#222"/>';
  s += '<path d="M 100 70 L 90 60 L 100 52" fill="none" stroke="#d93b3b" stroke-width="3"/><path d="M 100 130 L 90 140 L 100 148" fill="none" stroke="#d93b3b" stroke-width="3"/>';
  s += '<text x="12" y="28" font-size="13" font-weight="bold" fill="#1b232c">Sólido</text><text x="12" y="172" font-size="12" fill="#1b232c">frena y empuja</text><text x="12" y="187" font-size="12" fill="#1b232c">(el barril no se atraviesa)</text>';
  s += tanqueSvg(215, 100, colores.J1, 90) + '<circle cx="320" cy="100" r="13" fill="#f2c230" stroke="#8a6d00"/>';
  s += '<path d="M 235 100 L 300 100" stroke="#222" stroke-width="3" stroke-dasharray="6 5"/><polygon points="338,100 326,94 326,106" fill="none"/>';
  s += '<text x="192" y="28" font-size="13" font-weight="bold" fill="#1b232c">Trigger</text><text x="192" y="172" font-size="12" fill="#1b232c">no frena, solo avisa</text><text x="192" y="187" font-size="12" fill="#1b232c">(OnTriggerEnter)</text>';
  s += '</svg>';
  return s;
}

function dibujoBomba() {
  let s = '<svg viewBox="0 0 360 240" role="img" aria-label="Una bomba empuja a los tanques que estan dentro de su radio">';
  s += '<rect width="360" height="240" fill="#e9eef3"/>';
  s += '<circle cx="180" cy="120" r="95" fill="#fbe4e1" stroke="#d93b3b" stroke-width="2" stroke-dasharray="6 5"/>';
  s += '<circle cx="180" cy="120" r="12" fill="#26262b"/><rect x="178" y="104" width="4" height="7" fill="#d93b3b"/>';
  s += '<line x1="180" y1="120" x2="275" y2="120" stroke="#d93b3b" stroke-width="2"/><text x="222" y="113" font-size="12" fill="#d93b3b">radioExplosion</text>';
  s += tanqueSvg(120, 70, colores.J1, -40) + tanqueSvg(240, 175, colores.J2, 120) + tanqueSvg(115, 175, colores.J3, 200);
  s += '<g stroke="#d93b3b" stroke-width="3" fill="#d93b3b"><line x1="160" y1="108" x2="138" y2="84"/><polygon points="130,76 146,82 136,92" stroke="none"/>';
  s += '<line x1="200" y1="132" x2="228" y2="155"/><polygon points="236,163 219,157 230,147" stroke="none"/>';
  s += '<line x1="162" y1="132" x2="132" y2="158"/><polygon points="124,165 135,150 142,161" stroke="none"/></g>';
  s += '<text x="10" y="226" font-size="12" fill="#1b232c">Todos los que tengan Rigidbody dentro del círculo salen empujados.</text>';
  s += '</svg>';
  return s;
}

function dibujoFuera() {
  let s = '<svg viewBox="0 0 360 260" role="img" aria-label="Dos formas de quedar fuera">';
  s += '<rect width="360" height="260" fill="#e9eef3"/><rect x="130" y="10" width="100" height="240" fill="#7a8085"/>';
  s += tanqueSvg(215, 140, colores.J2, 20);
  s += '<line x1="236" y1="140" x2="300" y2="165" stroke="#d93b3b" stroke-width="3"/><polygon points="310,169 293,168 299,155" fill="#d93b3b"/>';
  s += '<text x="262" y="118" font-size="12" fill="#d93b3b" font-weight="bold">se cae</text><text x="250" y="132" font-size="12" fill="#d93b3b">y &lt; -3 (altura)</text>';
  s += '<polygon points="180,60 190,70 180,80 170,70" fill="#222"/><text x="196" y="74" font-size="12" font-weight="bold" fill="#222">Foco</text>';
  s += '<line x1="118" y1="215" x2="242" y2="215" stroke="#e8790c" stroke-width="3" stroke-dasharray="7 5"/>';
  s += tanqueSvg(160, 232, colores.J3);
  s += '<text x="10" y="205" font-size="12" fill="#e8790c" font-weight="bold">se queda atrás</text><text x="10" y="220" font-size="12" fill="#e8790c">z &lt; foco.z - limiteAtras</text>';
  s += '</svg>';
  return s;
}

function dibujoTeclas() {
  const tecla = (x, y, t, c) => '<rect x="' + x + '" y="' + y + '" width="34" height="34" rx="6" fill="' + c + '" stroke="#222"/><text x="' + (x + 17) + '" y="' + (y + 23) + '" font-size="16" text-anchor="middle" font-weight="bold" fill="#111">' + t + '</text>';
  const grupo = (x, y, titulo, c, a, b, i, d) => '<text x="' + (x + 55) + '" y="' + (y - 8) + '" font-size="14" font-weight="bold" text-anchor="middle" fill="#1b232c">' + titulo + '</text>' +
    tecla(x + 38, y, a, c) + tecla(x, y + 38, i, c) + tecla(x + 38, y + 38, b, c) + tecla(x + 76, y + 38, d, c);
  let s = '<svg viewBox="0 0 360 250" role="img" aria-label="Teclas de los cuatro jugadores">';
  s += '<rect width="360" height="250" fill="#e9eef3"/>';
  s += grupo(25, 35, 'J1 azul', '#9db9f5', 'W', 'S', 'A', 'D');
  s += grupo(215, 35, 'J2 rojo', '#f2a3a3', '▲', '▼', '◀', '▶');
  s += grupo(25, 155, 'J3 verde', '#a6e3b5', 'I', 'K', 'J', 'L');
  s += grupo(215, 155, 'J4 amarillo', '#f7e08e', 'T', 'G', 'F', 'H');
  s += '</svg>';
  return s;
}

const fig = (svg, pie) => '<figure>' + svg + '<figcaption>' + pie + '</figcaption></figure>';

// ---------- Contenido ----------
const arbol = `Foco                  (objeto vacío, lleva el script CamaraRuta)
  Main Camera         (hija del Foco, mira la carretera en diagonal)
  ParedInvisible      (hija del Foco, frena a quien se adelante)
Carretera             (5 tramos de 40 m, del 0 al 160 en Z)
Tanque_J1 ... J4      (cada uno con TanqueRuta)
Moneda, Bomba, Barril, Barrera   (repartidos por la carretera)
Canvas
  TextoJ1 ... TextoJ4, TextoCentral
Marcador              (objeto vacío, lleva el script MarcadorRuta)`;

const piezas = [
  ['Tanque', 'caja', 'sólido', 'sí (rotación X y Z congelada)', '-'],
  ['Carretera', 'caja', 'sólido', 'no', '-'],
  ['Barril', 'cápsula', 'sólido', 'no', '-'],
  ['Barrera', 'caja', 'sólido', 'no', '-'],
  ['Moneda', 'esfera', 'trigger', 'no', 'Moneda'],
  ['Bomba', 'esfera', 'trigger', 'no', 'Bomba']
];
const tablaPiezas = '<table><thead><tr><th>Pieza</th><th>Collider</th><th>Tipo</th><th>Rigidbody</th><th>Tag</th></tr></thead><tbody>' +
  piezas.map(p => '<tr>' + p.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';

const pasos = [
  {
    n: 0, titulo: 'Armar el entorno', min: 30,
    conceptos: 'Prefabs, Inspector, collider sólido y trigger.',
    digo: [
      'Les paso un paquete con las piezas. Ustedes arman la carretera, ponen los 4 tanques y reparten los obstáculos. Tienen media hora.',
      'Todavía no hay código: ahora solo estamos armando el escenario. Pero miren cada pieza en el Inspector, porque después cada una se va a comportar distinto.',
      'La carretera es una sola tira larga. Se arma duplicando un tramo de 40 metros.'
    ],
    preguntas: [
      '¿Cuáles piezas tienen Is Trigger activado y cuáles no?',
      '¿Cuáles tienen Rigidbody?',
      '¿Qué tag tiene cada una?'
    ],
    ellos: [
      'Importar el paquete: Assets, Import Package, Custom Package. Abrir la escena <b>Ruta_Vacia</b>.',
      'Arrastrar el prefab <b>Carretera</b> a la escena y dejarlo en Position (0, 0, 0). Duplicarlo con Ctrl+D y subir cada copia 40 en Z: 40, 80, 120 y 160. Quedan 5 tramos, 200 metros.',
      'Arrastrar 4 prefabs <b>Tanque</b> y nombrarlos Tanque_J1 a Tanque_J4. Posiciones: J1 (-1.5, 0.45, -1), J2 (1.5, 0.45, -1), J3 (-1.5, 0.45, -3.5), J4 (1.5, 0.45, -3.5).',
      'Dar un color a cada tanque: dentro de cada Tanque, el hijo <b>Cuerpo</b>, y arrastrar el material Azul (J1), Rojo (J2), Verde (J3) o Amarillo (J4).',
      'Repartir por la carretera, entre Z = 20 y Z = 190: 10 <b>Moneda</b>, 6 <b>Bomba</b>, 8 <b>Barril</b> y 6 <b>Barrera</b>. Con X entre -3 y 3. Alturas Y: Moneda 0.8, Bomba 0.45, Barril 0.6, Barrera 0.5.',
      'Darle Play. No debe pasar nada: los tanques quedan quietos.'
    ],
    pistas: [
      'Ctrl+D duplica el objeto seleccionado.',
      'Si un tanque queda hundido o flotando, revisar su Y.',
      'Para ver las propiedades de una pieza: seleccionarla y mirar el Inspector.'
    ],
    compruebo: [
      'En Play no se mueve nada y la cámara ve la carretera en diagonal.',
      'Todos los tanques están sobre la carretera, apretados en la parte de abajo.',
      'Cada pieza está sobre el asfalto, no enterrada ni flotando.'
    ],
    errores: [
      'Tanque o ítems con la Y mal puesta: quedan enterrados bajo la carretera o en el aire.',
      'Mover el Foco o la Main Camera sin querer.',
      'Quien no alcance: abrir la escena <b>Ruta_Inicio</b>, que ya trae la carretera y los 86 objetos colocados. Es el plan B.'
    ],
    dibujo: fig(dibujoVista(), 'Así debe quedar, visto desde arriba: tanques abajo, objetos repartidos y el Foco en el medio.') + tablaPiezas,
    agrega: null
  },
  {
    n: 1, titulo: 'Que un tanque avance y retroceda', min: 15,
    conceptos: 'Input.GetKey, KeyCode, Rigidbody, Update y FixedUpdate.',
    digo: [
      'Cada tanque se controla con su propio teclado. Por eso la tecla no puede estar escrita fija en el código: tiene que ser una variable que se elige en el Inspector.',
      'Hay varias formas de mover algo con Rigidbody: MovePosition, AddForce o cambiar la velocidad. Escojan la que quieran. Yo uso AddForce porque así los choques se sienten naturales.',
      'Regla: las teclas se leen en Update y la fuerza se aplica en FixedUpdate.'
    ],
    preguntas: [
      '¿Qué tipo de variable guarda una tecla?',
      '¿Hacia dónde apunta el tanque?',
      '¿Qué pasa cuando suelto la tecla?'
    ],
    ellos: [
      'Abrir <b>TanqueRuta.cs</b>.',
      'Agregar variables públicas para la tecla de adelante, la de atrás y la fuerza.',
      'Leer las teclas en Update y guardar si el tanque quiere ir adelante (1), atrás (-1) o quedarse quieto (0).',
      'Aplicar la fuerza en FixedUpdate.',
      'Poner el script solo en Tanque_J1 y elegir sus teclas en el Inspector (W y S).'
    ],
    pistas: [
      'Una tecla se guarda en una variable de tipo KeyCode.',
      'Para mover un Rigidbody hace falta guardarlo en Start con GetComponent.',
      'La dirección en la que apunta el tanque es transform.forward.',
      'ForceMode.Acceleration hace que la masa no importe.'
    ],
    compruebo: [
      'En Play, W hace avanzar el tanque azul y S lo hace retroceder.',
      'Al soltar la tecla el tanque se frena solo (lo hace el Linear Damping del Rigidbody).'
    ],
    errores: [
      'Las teclas quedan en None en el Inspector: el tanque no responde.',
      'NullReference al darle Play: olvidaron guardar el Rigidbody en Start.',
      'Mover con transform.position: el tanque atraviesa todo.'
    ],
    dibujo: fig(dibujoTanque(), 'El empuje va hacia donde apunta el cañón. Lo que cambia al girar es hacia dónde apunta.'),
    agrega: [
      ['TanqueRuta.cs: variables nuevas', `
    public KeyCode teclaAdelante;
    public KeyCode teclaAtras;
    public float fuerza = 28f;

    private Rigidbody rb;
    private float empuje = 0f;`],
      ['TanqueRuta.cs: Start, Update y FixedUpdate', `
    void Start()
    {
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        empuje = 0f;
        if (Input.GetKey(teclaAdelante))
        {
            empuje = 1f;
        }
        if (Input.GetKey(teclaAtras))
        {
            empuje = -1f;
        }
    }

    void FixedUpdate()
    {
        rb.AddForce(transform.forward * empuje * fuerza, ForceMode.Acceleration);
    }`]
    ]
  },
  {
    n: 2, titulo: 'Que el tanque gire', min: 10,
    conceptos: 'Rotación, Quaternion.Euler, Time.fixedDeltaTime.',
    digo: [
      'Girar es cambiar hacia dónde apunta el tanque. Como el empuje siempre va hacia transform.forward, si giro el tanque, el empuje también cambia de dirección.',
      'No hay que entender los Quaternion a fondo. Quaternion.Euler(0, ángulo, 0) significa "gira ese ángulo alrededor del eje Y".'
    ],
    preguntas: [
      '¿Qué pasaría si usan Vector3.forward en vez de transform.forward?',
      '¿Por qué el giro se multiplica por el tiempo?'
    ],
    ellos: [
      'Agregar las teclas de izquierda y derecha y una velocidad de giro.',
      'Leer esas teclas en Update y guardar si gira a la derecha (1), a la izquierda (-1) o no gira (0).',
      'En FixedUpdate, rotar el Rigidbody ese ángulo.'
    ],
    pistas: [
      'Rigidbody.MoveRotation recibe la rotación nueva.',
      'La rotación nueva es la actual multiplicada por una rotación pequeña de este instante.',
      'Time.fixedDeltaTime es el tiempo entre dos pasos de la física.'
    ],
    compruebo: [
      'A y D giran el tanque en su lugar.',
      'Al girar y apretar W, el tanque avanza hacia donde apunta.'
    ],
    errores: [
      'El tanque se voltea o rueda: se les quitó el Freeze Rotation en X y Z del Rigidbody.',
      'Gira rapidísimo: olvidaron multiplicar por el tiempo.'
    ],
    dibujo: '',
    agrega: [
      ['TanqueRuta.cs: variables nuevas', `
    public KeyCode teclaIzquierda;
    public KeyCode teclaDerecha;
    public float velocidadGiro = 120f;

    private float giro = 0f;`],
      ['TanqueRuta.cs: en Update, debajo de la lectura de adelante y atrás', `
        giro = 0f;
        if (Input.GetKey(teclaDerecha))
        {
            giro = 1f;
        }
        if (Input.GetKey(teclaIzquierda))
        {
            giro = -1f;
        }`],
      ['TanqueRuta.cs: en FixedUpdate, debajo de AddForce', `
        Quaternion rotacion = Quaternion.Euler(0f, giro * velocidadGiro * Time.fixedDeltaTime, 0f);
        rb.MoveRotation(rb.rotation * rotacion);`]
    ]
  },
  {
    n: 3, titulo: 'Cuatro jugadores con el mismo script', min: 15,
    conceptos: 'Reutilizar un script, variables públicas, colisiones entre Rigidbody.',
    digo: [
      'Un solo script, cuatro tanques. Lo que cambia entre un tanque y otro no es el código: es la información, o sea las teclas.',
      'Ahora que juegan varios, choquen entre ustedes. Fíjense quién empuja a quién.'
    ],
    preguntas: [
      '¿Hay que escribir 4 scripts?',
      '¿Qué cambia si un tanque pesa 3 en vez de 1 (Mass)?',
      '¿Y si subo o bajo el Linear Damping?'
    ],
    ellos: [
      'Poner el script TanqueRuta en Tanque_J2, J3 y J4.',
      'Elegir las teclas de cada uno (ver el dibujo del teclado).',
      'Jugar entre todos en el mismo teclado y chocarse.',
      'Probar cambiar la Mass y el Linear Damping de un tanque y ver qué pasa.'
    ],
    pistas: [
      'Se puede copiar el componente de un tanque a otro, o arrastrar el script al Inspector del otro.',
      'No repetir teclas entre jugadores.'
    ],
    compruebo: [
      'Los 4 tanques se mueven al mismo tiempo, cada uno con sus teclas.',
      'Cuando chocan, se empujan.'
    ],
    errores: [
      'Dos tanques con las mismas teclas: se mueven juntos.',
      'Teclas en None.'
    ],
    dibujo: fig(dibujoTeclas(), 'Las teclas de los cuatro jugadores. J1 y J2 usan las de siempre; J3 y J4 usan IJKL y TFGH.'),
    agrega: null
  },
  {
    n: 4, titulo: 'Que la cámara se mueva', min: 25,
    conceptos: 'Time.deltaTime, variables que cambian con el tiempo, condiciones.',
    digo: [
      'La carretera está quieta. Lo que se mueve es la cámara. Visto en la pantalla es igual a que el mapa baje hacia nosotros.',
      'Foco no es un script: es un objeto vacío que lleva la cámara y una pared invisible. El script que lo mueve se llama CamaraRuta y se pone en el Foco.',
      'Quiero que arranque despacio, que acelere poco a poco y que se detenga cuando llegue al final de la carretera.'
    ],
    preguntas: [
      '¿Qué pasa si no multiplico por Time.deltaTime?',
      '¿Por qué la pared invisible es hija del Foco?',
      '¿Cómo hago que espere unos segundos antes de empezar?'
    ],
    ellos: [
      'Abrir <b>CamaraRuta.cs</b>. En la escena Ruta_Vacia ya está puesto en el objeto <b>Foco</b>. Debe estar en el Foco y no en la cámara.',
      'Hacer que el Foco avance en Z con una velocidad, después de esperar unos segundos.',
      'Hacer que la velocidad aumente poco a poco hasta un máximo.',
      'Hacer que se detenga al llegar a una Z final. Con 5 tramos de carretera, usar 180.',
      'Jugar: ahora hay que mantener W apretada para seguir el ritmo.'
    ],
    pistas: [
      'Vector3.forward es el eje Z.',
      'Una variable que cuenta el tiempo ayuda a esperar: se le suma Time.deltaTime en cada Update.',
      'Para aumentar la velocidad: velocidad += aceleracion * Time.deltaTime.',
      'La Z final debe ser menor que el largo de la carretera.'
    ],
    compruebo: [
      'Después de unos segundos la cámara empieza a avanzar sola y cada vez más rápido.',
      'Los tanques se quedan atrás si sueltan W.',
      'Quien intenta adelantarse choca con la pared invisible.',
      'Al llegar a la Z final todo se detiene.'
    ],
    errores: [
      'El script está en la Main Camera y no en el Foco: se mueve la cámara pero no la pared invisible.',
      'La velocidad es enorme: olvidaron multiplicar por Time.deltaTime.',
      'La Z final es menor que la Z actual: el Foco nunca arranca.'
    ],
    dibujo: fig(dibujoVista(), 'El Foco avanza por la carretera. La cámara y la pared invisible se mueven con él.') + '<pre class="arbol">' + esc(arbol) + '</pre>',
    agrega: [
      ['CamaraRuta.cs completo', leer('CamaraRuta.cs')]
    ]
  },
  {
    n: 5, titulo: 'Monedas', min: 15,
    conceptos: 'OnTriggerEnter, CompareTag, Destroy.',
    digo: [
      'Un objeto sólido frena y empuja. Un trigger no frena: atraviesa y avisa. La moneda es un trigger.',
      'El aviso le llega al tanque, porque el tanque tiene Rigidbody. Por eso el script que recoge la moneda va en el tanque, no en la moneda.',
      'Cómo sabe el tanque que lo que tocó es una moneda: por su tag.'
    ],
    preguntas: [
      '¿Por qué la moneda no frena al tanque?',
      '¿Qué tiene que tener el tanque para que le llegue el aviso?',
      '¿Para qué sirve el tag?'
    ],
    ellos: [
      'En TanqueRuta, escribir la función que se ejecuta cuando el tanque entra en un trigger.',
      'Si lo que tocó tiene el tag Moneda: sumar 1 a puntos y destruir la moneda.',
      'Jugar y pasar por encima de monedas.'
    ],
    pistas: [
      'La función se llama OnTriggerEnter y recibe un Collider.',
      'Para comparar tags: other.CompareTag("Moneda").',
      'Destroy(other.gameObject) borra la moneda.'
    ],
    compruebo: [
      'La moneda desaparece al pasar por encima.',
      'Durante Play, seleccionar un tanque en el Hierarchy: la variable Puntos del Inspector sube.'
    ],
    errores: [
      'El tag mal escrito (moneda con minúscula): nunca la detecta.',
      'Pusieron el script en la moneda en vez del tanque.',
      'Destroy(other) en vez de Destroy(other.gameObject): solo borra el componente.'
    ],
    dibujo: fig(dibujoSolidoTrigger(), 'Sólido frente a trigger. Es la idea central de este paso y del siguiente.'),
    agrega: [
      ['TanqueRuta.cs: función nueva', `
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Moneda"))
        {
            puntos++;
            Destroy(other.gameObject);
        }
    }`]
    ]
  },
  {
    n: 6, titulo: 'Bombas', min: 25,
    conceptos: 'OnTriggerEnter, Physics.OverlapSphere, ciclo for, AddExplosionForce.',
    digo: [
      'Una bomba es como una moneda: es un trigger con su propio tag. Pero en vez de dar puntos, empuja.',
      'Para empujar a todos los que están cerca, primero buscamos todos los colliders dentro de una esfera y después empujamos el Rigidbody de cada uno.',
      'Unity ya trae una función para empujar desde un punto: AddExplosionForce.'
    ],
    preguntas: [
      '¿Qué pasa con los colliders que no tienen Rigidbody, como la carretera o los barriles?',
      '¿Qué pasa si no destruyo la bomba?',
      '¿Quién sale más empujado: el que está pegado a la bomba o el que está lejos?'
    ],
    ellos: [
      'Agregar variables para el radio y la fuerza de la explosión.',
      'En OnTriggerEnter, si lo que tocó tiene el tag Bomba, llamar a una función Explotar.',
      'En Explotar: buscar todos los colliders cerca de la bomba, recorrerlos y empujar los que tengan Rigidbody. Al final, destruir la bomba.',
      'Jugar y chocar contra una bomba con un tanque cerca de otro.'
    ],
    pistas: [
      'Physics.OverlapSphere(centro, radio) devuelve un arreglo de Collider.',
      'collider.attachedRigidbody es el Rigidbody de ese collider, o null si no tiene.',
      'rigidbody.AddExplosionForce(fuerza, centro, radio, 0.3f, ForceMode.Impulse).',
      'Recorrer el arreglo con un ciclo for.'
    ],
    compruebo: [
      'Al tocar una bomba el tanque sale empujado y la bomba desaparece.',
      'Los tanques cercanos también salen empujados.',
      'Un tanque lejos de la bomba no se mueve.'
    ],
    errores: [
      'Radio en 0: no empuja a nadie.',
      'No destruyeron la bomba: explota muchas veces seguidas.',
      'No revisaron si el Rigidbody es null: error al llegar a un collider sin Rigidbody.'
    ],
    dibujo: fig(dibujoBomba(), 'La explosión empuja desde el centro hacia afuera, solo dentro del radio.'),
    agrega: [
      ['TanqueRuta.cs: variables nuevas', `
    public float radioExplosion = 4f;
    public float fuerzaExplosion = 14f;`],
      ['TanqueRuta.cs: dentro de OnTriggerEnter, debajo del if de la moneda', `
        if (other.CompareTag("Bomba"))
        {
            Explotar(other.gameObject);
        }`],
      ['TanqueRuta.cs: función nueva', `
    void Explotar(GameObject bomba)
    {
        Vector3 centro = bomba.transform.position;
        Collider[] cercanos = Physics.OverlapSphere(centro, radioExplosion);

        for (int i = 0; i < cercanos.Length; i++)
        {
            Rigidbody otro = cercanos[i].attachedRigidbody;
            if (otro != null)
            {
                otro.AddExplosionForce(fuerzaExplosion, centro, radioExplosion, 0.3f, ForceMode.Impulse);
            }
        }

        Destroy(bomba);
    }`]
    ]
  },
  {
    n: 7, titulo: 'Quedar fuera: caerse o quedarse atrás', min: 20,
    conceptos: 'Comparar posiciones, bool, SetActive.',
    digo: [
      'El que se cae pierde. Y el que se queda atrás de la cámara también.',
      '¿Cómo sabe el tanque que se cayó? Porque su altura baja. ¿Y que se quedó atrás? Comparando su posición con la del Foco.',
      'Cuando un tanque queda fuera, lo desactivamos y marcamos que ya no está vivo. Esa información la va a usar el marcador.'
    ],
    preguntas: [
      '¿A qué altura decido que ya se cayó?',
      '¿Qué pasa si el tanque no sabe dónde está el Foco?',
      '¿Por qué desactivar el tanque en vez de borrarlo?'
    ],
    ellos: [
      'Agregar una variable para la distancia máxima que se puede quedar atrás.',
      'En Update: si la altura del tanque es menor que -3, o si está más de esa distancia detrás del Foco, llamar a una función Eliminar.',
      'En Eliminar: marcar vivo como falso y desactivar el tanque.',
      'Arrastrar el objeto Foco al campo foco de los 4 tanques en el Inspector.'
    ],
    pistas: [
      'transform.position.y es la altura. transform.position.z es la posición a lo largo de la carretera.',
      'foco.position.z es la posición del Foco.',
      'gameObject.SetActive(false) apaga el objeto.'
    ],
    compruebo: [
      'Empujar a un tanque fuera de la carretera: cae y desaparece.',
      'Quedarse quieto: el tanque desaparece cuando el Foco se aleja 9 metros.'
    ],
    errores: [
      'No arrastraron el Foco al campo foco: NullReference al darle Play.',
      'Usaron la Y del Foco en vez de la Z.'
    ],
    dibujo: fig(dibujoFuera(), 'Hay dos formas de quedar fuera: caerse por el borde o quedarse atrás.'),
    agrega: [
      ['TanqueRuta.cs: variable nueva', `
    public float limiteAtras = 9f;`],
      ['TanqueRuta.cs: en Update, debajo de la lectura del giro', `
        if (transform.position.y < -3f)
        {
            Eliminar();
        }

        if (transform.position.z < foco.position.z - limiteAtras)
        {
            Eliminar();
        }`],
      ['TanqueRuta.cs: función nueva', `
    void Eliminar()
    {
        vivo = false;
        gameObject.SetActive(false);
    }`]
    ]
  },
  {
    n: 8, titulo: 'Marcador y ganador', min: 25,
    conceptos: 'Referencias entre objetos, TextMeshPro, métodos con parámetros, contar.',
    digo: [
      'El marcador no controla a nadie: solo lee. Lee los puntos y si está vivo cada tanque, y lo escribe en pantalla.',
      'Como los 4 jugadores se muestran igual, escribo una función una sola vez y la uso 4 veces, cambiando el texto, el nombre y el tanque. Eso es un método con parámetros.',
      'Cuando solo quede uno vivo, el texto del centro anuncia al ganador.'
    ],
    preguntas: [
      '¿Qué tiene que saber el marcador para escribir un texto?',
      '¿Cómo cuento cuántos siguen vivos?',
      '¿Qué muestro si nadie queda vivo?'
    ],
    ellos: [
      'Arrastrar al objeto Marcador: los 4 tanques, los 4 textos de las esquinas y el texto del centro.',
      'En Update, escribir en cada texto el nombre del jugador y sus puntos. Si el tanque ya no está vivo, mostrar "fuera".',
      'Contar cuántos tanques siguen vivos.',
      'Si queda uno, escribir "Ganó" y el nombre en el texto del centro. Si no queda ninguno, "Nadie ganó".'
    ],
    pistas: [
      'Para escribir en un TextMeshPro: texto.text = "..." (hace falta using TMPro).',
      'Unir texto con números: "J1: " + puntos.',
      'Un método con parámetros: void MostrarJugador(TextMeshProUGUI texto, string nombre, TanqueRuta tanque).'
    ],
    compruebo: [
      'Cada esquina muestra los puntos de su tanque.',
      'Cuando un tanque queda fuera, su texto cambia a "fuera".',
      'Cuando solo queda uno, aparece "¡Ganó J#!" en el centro.'
    ],
    errores: [
      'Se les olvidó arrastrar algún texto o tanque: NullReference al darle Play.',
      'Arrastraron el texto de J2 en el campo de J1: los puntos aparecen en la esquina equivocada.'
    ],
    dibujo: '',
    agrega: [
      ['MarcadorRuta.cs completo', leer('MarcadorRuta.cs')]
    ]
  },
  {
    n: 9, titulo: 'Jugar, equilibrar y mejorar', min: 30,
    conceptos: 'Probar, ajustar valores, ideas propias.',
    digo: [
      'Ahora juguemos de verdad. Tres rondas.',
      'Después de cada ronda, cada grupo propone un ajuste: ¿qué estuvo muy fácil, muy difícil o injusto? Lo cambiamos en el Inspector y probamos otra vez.'
    ],
    preguntas: [
      '¿El mapa va muy rápido o muy lento?',
      '¿Las bombas son muy fuertes?',
      '¿Hay muchos o pocos objetos?'
    ],
    ellos: [
      'Jugar 3 rondas.',
      'Cambiar al menos 2 valores en el Inspector para equilibrar el juego y probar otra vez.',
      'Elegir un reto extra de la lista y hacerlo.'
    ],
    pistas: [
      'Todos los valores están como variables públicas: no hace falta tocar el código para ajustarlos.'
    ],
    compruebo: [
      'Hay una ronda completa con ganador.',
      'Cada grupo puede explicar qué cambió y por qué.'
    ],
    errores: [],
    dibujo: '',
    agrega: null,
    extra: '<h4>Retos extra</h4>' + ul([
      'Que al llegar a la cima gane quien tenga más puntos, aunque sigan varios vivos.',
      'Un objeto nuevo con otro tag, por ejemplo un turbo que dé velocidad extra por unos segundos.',
      'Que la bomba también cambie el color del tanque al que empuja.',
      'Agregar más tramos de carretera y más objetos.',
      'Cambiar la forma de mover el tanque (por ejemplo, con MovePosition) y comparar cómo se siente.'
    ])
  }
];

const ajustes = [
  ['Los tanques son muy lentos o muy rápidos', 'fuerza', 'TanqueRuta (en cada tanque)', '28'],
  ['El mapa arranca o acelera muy rápido', 'velocidadInicial, aceleracion, velocidadMaxima', 'CamaraRuta (en el Foco)', '4, 0.03, 9'],
  ['Eliminan muy rápido a quien se atrasa', 'limiteAtras', 'TanqueRuta', '9'],
  ['Las bombas son muy fuertes', 'fuerzaExplosion, radioExplosion', 'TanqueRuta', '14, 4'],
  ['Cuesta girar', 'velocidadGiro', 'TanqueRuta', '120'],
  ['Se resbalan mucho o poco', 'Linear Damping', 'Rigidbody del tanque', '1.5'],
  ['Hay muchos o pocos objetos', 'mover o borrar', 'objetos en la escena', '-']
];

const tareas = [
  ['TanqueRuta', 'foco, puntos y vivo (variables vacías)', 'Teclas, empuje, giro, monedas, bombas y quedar fuera', '1, 2, 5, 6, 7'],
  ['CamaraRuta', 'Nada (clase vacía)', 'Mover el Foco: espera, velocidad, aceleración y parada', '4'],
  ['MarcadorRuta', 'Referencias a los 4 tanques y a los 5 textos', 'Escribir los textos, contar vivos y anunciar al ganador', '8']
];

const esqueletos = {
  'TanqueRuta.cs': `
using UnityEngine;

// META: convertir este tanque en un tanque jugable para varias personas en el mismo teclado.
// Cada tanque tiene sus propias teclas. Tiene que avanzar, retroceder y girar,
// empujar a los otros tanques al chocar y recoger monedas para ganar puntos.
// Si toca una bomba, la explosión empuja a los tanques que estén cerca.
// Si se cae de la carretera o se queda atrás de la cámara, queda fuera de la partida.
public class TanqueRuta : MonoBehaviour
{
    public Transform foco;
    public int puntos;
    public bool vivo = true;
}`,
  'CamaraRuta.cs': `
using UnityEngine;

// META: que el mapa avance solo por la carretera, cada vez más rápido,
// y se detenga al llegar a la cima. Los tanques pueden ir más rápido que el mapa.
public class CamaraRuta : MonoBehaviour
{

}`,
  'MarcadorRuta.cs': `
using UnityEngine;
using TMPro;

// META: que cada texto muestre los puntos de su tanque, o que ya quedó fuera.
// Cuando solo quede un tanque en la carretera, el texto del centro tiene que anunciar al ganador.
public class MarcadorRuta : MonoBehaviour
{
    public TanqueRuta tanque1;
    public TanqueRuta tanque2;
    public TanqueRuta tanque3;
    public TanqueRuta tanque4;

    public TextMeshProUGUI texto1;
    public TextMeshProUGUI texto2;
    public TextMeshProUGUI texto3;
    public TextMeshProUGUI texto4;
    public TextMeshProUGUI textoCentral;
}`
};

// ---------- Estilos ----------
const css = `
:root{--text:#1b232c;--muted:#5b6672;--line:#c9d2dc;--soft:#f2f5f9;--accent:#b8672f;--accent-soft:#f7e6d6;--ok:#17806f;--ok-soft:#dbf1ec;--bad:#c0392b;--bad-soft:#fbe4e1;--mono:ui-monospace,"Cascadia Code",Consolas,monospace;--sans:"Segoe UI",-apple-system,"Helvetica Neue",Arial,sans-serif;}
*{box-sizing:border-box;}
html{-webkit-text-size-adjust:100%;}
body{margin:0;background:#fff;color:var(--text);font-family:var(--sans);font-size:17px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.wrap{max-width:780px;margin:0 auto;padding:18px 16px 60px;}
h1{font-family:var(--mono);font-size:30px;line-height:1.1;margin:6px 0 6px;}
h2{font-family:var(--mono);font-size:22px;margin:28px 0 8px;border-bottom:2px solid var(--line);padding-bottom:4px;}
h3{font-size:18px;margin:18px 0 4px;}
h4{font-size:16px;margin:14px 0 4px;}
p{margin:0 0 8px;} ul,ol{margin:0 0 10px;padding-left:22px;} li{margin-bottom:4px;}
.eyebrow{font-family:var(--mono);font-size:13px;letter-spacing:.09em;text-transform:uppercase;color:var(--accent);margin:0;}
.sub{color:var(--muted);margin:0 0 12px;}
nav{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 4px;}
nav a{background:var(--soft);border:1px solid var(--line);border-radius:999px;padding:3px 11px;color:var(--text);text-decoration:none;font-size:15px;}
.paso{border:1px solid var(--line);border-radius:12px;padding:6px 14px 12px;margin:22px 0;}
.paso>h2{border:0;margin:8px 0 4px;}
.badge{display:inline-block;background:var(--accent);color:#fff;border-radius:999px;padding:0 10px;margin-right:6px;font-family:var(--mono);}
.min{color:var(--muted);font-size:15px;margin:0 0 6px;}
.dice{background:var(--accent-soft);border-left:5px solid var(--accent);border-radius:6px;padding:6px 12px;margin:8px 0;}
.dice ul{margin:4px 0;}
.preg{background:var(--soft);border-radius:6px;padding:6px 12px;margin:8px 0;}
.hacen{background:var(--ok-soft);border-radius:6px;padding:6px 12px;margin:8px 0;}
.err{background:var(--bad-soft);border-radius:6px;padding:6px 12px;margin:8px 0;}
.rotulo{font-family:var(--mono);font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 2px;}
pre{background:#10161d;color:#e8edf2;border-radius:8px;padding:10px 12px;overflow:auto;font-size:13.5px;line-height:1.4;margin:8px 0;tab-size:4;}
pre code{font-family:var(--mono);white-space:pre;}
pre.arbol{background:var(--soft);color:var(--text);}
details{border:1px solid var(--line);border-radius:8px;margin:10px 0;background:#fff;}
summary{cursor:pointer;padding:8px 12px;font-weight:600;background:var(--soft);border-radius:8px;}
.det{padding:4px 12px 8px;}
table{border-collapse:collapse;width:100%;margin:8px 0 12px;font-size:15px;}
th,td{border:1px solid var(--line);padding:5px 8px;text-align:left;vertical-align:top;}
th{background:var(--soft);}
figure{margin:12px 0;} figure svg{width:100%;height:auto;max-width:460px;display:block;margin:0 auto;border:1px solid var(--line);border-radius:8px;}
figcaption{color:var(--muted);font-size:14.5px;text-align:center;margin-top:4px;}
.dos{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
@media (max-width:700px){.dos{grid-template-columns:1fr;} body{font-size:16px;} h1{font-size:26px;}}
@media print{
  body{font-size:11pt;} .wrap{max-width:none;padding:0;} nav{display:none;}
  pre{white-space:pre-wrap;word-break:break-word;font-size:9.5pt;}
  .paso{break-inside:auto;} figure,pre,table,.dice,.preg,.hacen,.err{break-inside:avoid;}
  h2,h3{break-after:avoid;}
  summary{background:#fff;}
  @page{size:A4;margin:12mm;}
}`;

const cabeza = (titulo, sub) => '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + titulo + '</title><style>' + css + '</style></head><body><div class="wrap">';
const pie = '</div></body></html>';

// ---------- Guía del profesor ----------
function guiaProfesor() {
  let h = cabeza('Subida Chocona: guía del profesor');
  h += '<p class="eyebrow">Programación para Videojuegos · Unity</p><h1>Subida Chocona</h1><p class="sub">Guía del profesor: qué explicar, qué preguntar y qué esperar en cada paso, desde el paquete de Inicio hasta el juego terminado.</p>';
  h += '<nav>' + pasos.map(p => '<a href="#p' + p.n + '">Paso ' + p.n + '</a>').join('') + '<a href="#scripts">Los 3 scripts</a><a href="#ajustes">Ajustes</a></nav>';

  h += '<h2>El juego en una frase</h2>';
  h += '<p>Hasta 4 tanques van apretados por una carretera de montaña que "sube" sola. Se empujan, recogen monedas, esquivan barriles y barreras y huyen de las bombas. Quien se cae o se queda atrás queda fuera. Gana el último que siga.</p>';
  h += fig(dibujoVista(), 'Vista desde arriba. La carretera está quieta: lo que avanza es el Foco, y con él la cámara.');
  h += '<h3>¿Cómo se mueve "el mapa"?</h3><p>No se mueve el mapa: se mueve la cámara. Visto en la pantalla se ve igual que si el mapa bajara hacia los tanques, pero la física se queda estable. Los tanques pueden ir más rápido que la cámara; si se quedan atrás, quedan fuera.</p>';

  h += '<h2>Qué hay en el paquete</h2>';
  h += '<table><thead><tr><th>Qué</th><th>Contenido</th></tr></thead><tbody>' +
    '<tr><td>Prefabs</td><td>Tanque, Carretera (tramo de 40 m), Moneda, Bomba, Barril, Barrera</td></tr>' +
    '<tr><td>Scripts vacíos</td><td>TanqueRuta, CamaraRuta, MarcadorRuta (solo traen la meta escrita)</td></tr>' +
    '<tr><td>Escena <b>Ruta_Vacia</b></td><td>Solo el Foco con la cámara, la luz y el marcador en pantalla. Aquí arman su entorno.</td></tr>' +
    '<tr><td>Escena <b>Ruta_Inicio</b></td><td>El nivel ya armado, con 86 objetos. Es el plan B para quien no termine el paso 0.</td></tr>' +
    '</tbody></table>';
  h += '<p>Importar: Assets, Import Package, Custom Package. Requisitos: Unity 6 con plantilla URP y Active Input Handling en "Both". El paquete crea solo los tags Moneda y Bomba.</p>';

  h += '<h2>Los tres scripts</h2>';
  h += '<p>Son tres. Ojo: <b>Foco</b> no es un script, es un objeto vacío. El script que lo mueve se llama <b>CamaraRuta</b>.</p>';
  h += '<table><thead><tr><th>Script</th><th>Va en</th><th>Qué hace</th></tr></thead><tbody>' +
    '<tr><td>TanqueRuta</td><td>cada Tanque (4)</td><td>Mueve el tanque, recoge monedas, explota bombas y lo saca de la partida.</td></tr>' +
    '<tr><td>CamaraRuta</td><td>el objeto Foco (1)</td><td>Hace avanzar la cámara por la carretera.</td></tr>' +
    '<tr><td>MarcadorRuta</td><td>el objeto Marcador (1)</td><td>Escribe los puntos y anuncia al ganador.</td></tr></tbody></table>';

  h += '<h2>Plan de tiempos</h2>';
  const total = pasos.reduce((a, p) => a + p.min, 0);
  h += '<table><thead><tr><th>Paso</th><th>Qué</th><th>Minutos</th></tr></thead><tbody>' +
    pasos.map(p => '<tr><td>' + p.n + '</td><td>' + p.titulo + '</td><td>' + p.min + '</td></tr>').join('') +
    '<tr><td></td><td><b>Total</b></td><td><b>' + total + '</b></td></tr></tbody></table>';
  h += '<p>Es mucho para una sola clase. Sugerencia: <b>clase A</b> pasos 0 a 4 (' + pasos.slice(0, 5).reduce((a, p) => a + p.min, 0) + ' min) y <b>clase B</b> pasos 5 a 9 (' + pasos.slice(5).reduce((a, p) => a + p.min, 0) + ' min). Al terminar la clase A ya se puede jugar a correr y empujarse.</p>';

  h += '<h2>Qué practican</h2>';
  h += '<table><thead><tr><th>Paso</th><th>Conceptos</th></tr></thead><tbody>' + pasos.map(p => '<tr><td>' + p.n + '</td><td>' + p.conceptos + '</td></tr>').join('') + '</tbody></table>';

  pasos.forEach(p => {
    h += '<section class="paso" id="p' + p.n + '"><h2><span class="badge">' + p.n + '</span>' + p.titulo + '</h2><p class="min">' + p.min + ' minutos · ' + p.conceptos + '</p>';
    h += '<div class="dice"><p class="rotulo">Lo que digo</p>' + ul(p.digo) + '</div>';
    h += '<div class="preg"><p class="rotulo">Preguntas para el grupo</p>' + ul(p.preguntas) + '</div>';
    h += '<div class="hacen"><p class="rotulo">Lo que hacen ellos</p>' + ol(p.ellos) + '</div>';
    h += '<h4>Pistas (sin dar el código)</h4>' + ul(p.pistas);
    h += '<h4>Cómo compruebo que funciona</h4>' + ul(p.compruebo);
    if (p.errores.length) { h += '<div class="err"><p class="rotulo">Errores típicos</p>' + ul(p.errores) + '</div>'; }
    h += p.dibujo || '';
    if (p.agrega) {
      h += det('Solución del paso ' + p.n + ' (mostrar al final)', p.agrega.map(a => '<h4>' + a[0] + '</h4>' + code(a[1])).join(''));
    }
    if (p.extra) { h += p.extra; }
    h += '</section>';
  });

  h += '<h2 id="scripts">Los tres scripts: de Inicio a Final</h2>';
  h += '<p>Lo que traen los estudiantes y lo que tiene la solución. La última columna dice en qué paso se agrega cada parte.</p>';
  h += '<table><thead><tr><th>Script</th><th>Inicio</th><th>Final</th><th>Pasos</th></tr></thead><tbody>' + tareas.map(t => '<tr>' + t.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  Object.keys(esqueletos).forEach(f => {
    h += '<h3>' + f.replace('.cs', '') + '</h3><div class="dos"><div><p class="rotulo">Inicio (lo que traen)</p>' + code(esqueletos[f]) + '</div><div>' + det('Final (la solución completa)', code(leer(f))) + '</div></div>';
  });

  h += '<h2 id="ajustes">Ajustes si no se siente bien</h2>';
  h += '<table><thead><tr><th>Problema</th><th>Variable</th><th>Dónde</th><th>Valor inicial</th></tr></thead><tbody>' + ajustes.map(a => '<tr>' + a.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  h += '<h3>Las teclas</h3>' + fig(dibujoTeclas(), 'J1 azul, J2 rojo, J3 verde, J4 amarillo. Q y E no se usan en esta versión.');
  h += '<h3>Nota</h3><p>Los valores son una primera propuesta: hay que ajustarlos jugando. La escena final y los scripts finales los guardo solo yo; los estudiantes reciben el paquete de Inicio.</p>';
  h += pie;
  return h;
}

// ---------- Guía de estudiantes ----------
function guiaEstudiantes() {
  let h = cabeza('Subida Chocona: guía para estudiantes');
  h += '<p class="eyebrow">Programación para Videojuegos · Unity</p><h1>Subida Chocona</h1><p class="sub">Un juego de tanques en una carretera de montaña. Hasta 4 jugadores en el mismo teclado.</p>';
  h += '<nav>' + pasos.map(p => '<a href="#p' + p.n + '">Paso ' + p.n + '</a>').join('') + '</nav>';
  h += '<h2>Qué se va a construir</h2><p>Cuatro tanques van apretados por una carretera que sube sola. Se empujan, recogen monedas, esquivan barriles y barreras y huyen de las bombas. Quien se cae o se queda atrás queda fuera. Gana el último que siga.</p>';
  h += fig(dibujoVista(), 'Vista desde arriba. La carretera está quieta: avanza el Foco, y con él la cámara.');
  h += '<h2>Cómo se trabaja</h2>' + ul([
    'Cada paso tiene una <b>meta</b>, unas <b>pistas</b> y una forma de <b>comprobar</b> que quedó bien.',
    'Hay varias formas de resolver cada paso. Escoger la que se entienda mejor.',
    'Los tres scripts a completar son <b>TanqueRuta</b>, <b>CamaraRuta</b> y <b>MarcadorRuta</b>. Cada uno trae escrita su meta arriba.',
    'Si algo falla: leer el mensaje rojo de la Console, que dice en qué línea.'
  ]);
  pasos.forEach(p => {
    h += '<section class="paso" id="p' + p.n + '"><h2><span class="badge">' + p.n + '</span>' + p.titulo + '</h2><p class="min">' + p.min + ' minutos aproximados</p>';
    h += '<div class="hacen"><p class="rotulo">Qué hacer</p>' + ol(p.ellos) + '</div>';
    h += '<h4>Pistas</h4>' + ul(p.pistas);
    h += '<h4>Cómo saber que funciona</h4>' + ul(p.compruebo);
    if (p.n === 0 || p.n === 3 || p.n === 5 || p.n === 6 || p.n === 7 || p.n === 1) { h += p.dibujo || ''; }
    if (p.extra) { h += p.extra; }
    h += '</section>';
  });
  h += '<h2>Valores que se pueden ajustar</h2><table><thead><tr><th>Problema</th><th>Variable</th><th>Dónde</th><th>Valor inicial</th></tr></thead><tbody>' + ajustes.map(a => '<tr>' + a.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  h += pie;
  return h;
}

// ---------- Escritura y PDF ----------
const edges = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'];
const exe = edges.find(p => fs.existsSync(p));

function aPdf(html, destino) {
  if (!exe) { console.log('Sin Edge ni Chrome: no se generó ' + destino); return; }
  const tmp = path.join(os.tmpdir(), 'subida-' + path.basename(destino, '.pdf') + '.html');
  fs.writeFileSync(tmp, html.replace(/<details>/g, '<details open>'));
  const url = 'file:///' + tmp.replace(/\\/g, '/');
  try { execFileSync(exe, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=' + destino, url], { stdio: 'pipe' }); } catch (e) { /* Edge devuelve ruido por stderr aunque funcione */ }
  fs.unlinkSync(tmp);
  const t = fs.existsSync(destino) ? fs.statSync(destino).mtime : null;
  console.log(t && Date.now() - t.getTime() < 60000 ? 'PDF listo: ' + destino : 'No se pudo escribir ' + destino + ' (¿está abierto en otro programa?)');
}

const prof = guiaProfesor();
const est = guiaEstudiantes();
fs.writeFileSync(path.join(salida, 'guia-profesor.html'), prof);
fs.writeFileSync(path.join(salida, 'guia-estudiantes.html'), est);
console.log('HTML listos en ' + salida);
if (!process.argv.includes('--sin-pdf')) {
  aPdf(prof, path.join(salida, 'guia-profesor.pdf'));
  aPdf(est, path.join(salida, 'guia-estudiantes.pdf'));
}
