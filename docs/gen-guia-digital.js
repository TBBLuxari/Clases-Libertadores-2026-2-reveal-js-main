// Guía en PDF del carrito DIGITAL (Arduino UNO + L298N + 2 sensores infrarrojos). Mismo formato de la guía del carrito análogo.
// Primero todo el cableado paso a paso (con prueba sin código), la programación al final.
// Uso: node docs/gen-guia-digital.js   (genera apoyo/carrito/guia-estudiantes/carrito-digital-guia.html y .pdf)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = path.join(__dirname, '..', 'materias', 'sistemas-hipermedia', 'apoyo', 'carrito', 'guia-estudiantes');
const HTML = path.join(DIR, 'carrito-digital-guia.html');
const PDF = process.env.PDF_OUT ? path.resolve(process.env.PDF_OUT) : path.join(DIR, 'carrito-digital-guia.pdf');
const css = fs.readFileSync(path.join(__dirname, 'guia.css'), 'utf8');

// ---------------------------------------------------------------- esquemas
const C = { txt: '#1b232c', mut: '#5b6672', wire: '#44505c', red: '#d62828', blk: '#1b232c', halo: '#ffd24a' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.fs || 13}" ${o.b ? 'font-weight="700"' : ''} fill="${o.c || C.txt}" text-anchor="${o.a || 'start'}" dominant-baseline="central">${esc(s)}</text>`;
const box = (x, y, w, h, fill, stroke, p, n) => (p === n ? `<rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" rx="12" fill="${C.halo}" opacity=".75"/>` : '') + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
const pl = pts => pts.map(p => p.join(',')).join(' ');

// Componentes: p = paso en el que aparecen (se dibuja desde ahí). Cables: p = paso en el que se conectan (brillan en ese paso).
const comps = [
  { p: 1, draw: n => box(170, 340, 150, 44, '#fff1c9', '#8a5a00', 1, n) + T(245, 362, 'Portapilas 4×AA', { b: 1, a: 'middle', fs: 14 }) },
  { p: 1, draw: n => box(170, 40, 150, 260, '#fbe9e1', '#b8672f', 1, n) + T(245, 58, 'L298N', { b: 1, a: 'middle', fs: 14 }) + T(200, 284, '12V', { a: 'middle', fs: 12 }) + T(250, 284, 'GND', { a: 'middle', fs: 12 }) + T(295, 284, '5V', { a: 'middle', fs: 12, c: C.mut }) + T(295, 268, 'vacío', { a: 'middle', fs: 11, c: C.mut }) +
    ['OUT1', 'OUT2'].map((s, i) => T(178, 75 + 20 * i, s, { fs: 12 })).join('') + ['OUT3', 'OUT4'].map((s, i) => T(178, 205 + 20 * i, s, { fs: 12 })).join('') +
    ['IN1', 'IN2', 'IN3', 'IN4'].map((s, i) => T(312, 115 + 25 * i, s, { a: 'end', fs: 12 })).join('') + T(312, 90, 'ENA', { a: 'end', fs: 12, c: C.mut }) + T(312, 215, 'ENB', { a: 'end', fs: 12, c: C.mut }) + T(245, 310, '', {}) +
    T(245, 238, 'jumpers puestos', { a: 'middle', fs: 11, c: C.mut }) + T(245, 253, 'en ENA y ENB', { a: 'middle', fs: 11, c: C.mut }) },
  { p: 2, draw: n => box(20, 60, 110, 50, '#eceff3', '#5b6672', 2, n) + T(75, 85, 'Motor izq.', { b: 1, a: 'middle', fs: 14 }) },
  { p: 3, draw: n => box(20, 190, 110, 50, '#eceff3', '#5b6672', 3, n) + T(75, 215, 'Motor der.', { b: 1, a: 'middle', fs: 14 }) },
  { p: 4, draw: n => box(400, 40, 110, 260, '#dbeaf8', '#1d6fd6', 4, n) + T(455, 58, 'Arduino UNO', { b: 1, a: 'middle', fs: 14 }) + T(408, 245, 'GND', { fs: 12 }) +
    [['D7', 115], ['D8', 140], ['D9', 165], ['D10', 190]].map(([s, y]) => T(408, y, s, { fs: 12 })).join('') +
    [['5V', 85], ['D2', 105], ['GND', 125], ['IOREF', 185], ['D3', 205], ['GND', 225]].map(([s, y]) => T(502, y, s, { a: 'end', fs: 12 })).join('') },
  { p: 4, draw: n => box(400, 340, 110, 44, '#fff1c9', '#8a5a00', 4, n) + T(455, 362, 'Pila de 9 V', { b: 1, a: 'middle', fs: 14 }) },
  { p: 9, draw: n => T(610, 56, 'Sensor izquierdo', { b: 1, a: 'middle', fs: 14 }) + box(560, 70, 100, 70, '#dbf1ec', '#17806f', 9, n) + T(568, 85, 'VCC', { fs: 12 }) + T(568, 105, 'OUT', { fs: 12 }) + T(568, 125, 'GND', { fs: 12 }) },
  { p: 10, draw: n => T(610, 156, 'Sensor derecho', { b: 1, a: 'middle', fs: 14 }) + box(560, 170, 100, 70, '#dbf1ec', '#17806f', 10, n) + T(568, 185, 'VCC', { fs: 12 }) + T(568, 205, 'OUT', { fs: 12 }) + T(568, 225, 'GND', { fs: 12 }) },
];
const wires = [
  { p: 1, pts: [[200, 300], [200, 340]], c: C.red },
  { p: 1, pts: [[250, 300], [250, 340]], c: C.blk },
  { p: 2, pts: [[130, 75], [170, 75]] }, { p: 2, pts: [[130, 95], [170, 95]] },
  { p: 3, pts: [[130, 205], [170, 205]] }, { p: 3, pts: [[130, 225], [170, 225]] },
  { p: 4, pts: [[455, 300], [455, 340]], lab: ['al jack', 463, 322] },
  { p: 4, pts: [[400, 245], [365, 245], [365, 322], [262, 322], [262, 300]], c: C.blk },
  { p: 7, pts: [[320, 115], [400, 115]] }, { p: 7, pts: [[320, 140], [400, 140]] },
  { p: 8, pts: [[320, 165], [400, 165]] }, { p: 8, pts: [[320, 190], [400, 190]] },
  { p: 9, pts: [[510, 85], [560, 85]], c: C.red }, { p: 9, pts: [[510, 105], [560, 105]] }, { p: 9, pts: [[510, 125], [560, 125]], c: C.blk },
  { p: 10, pts: [[510, 185], [560, 185]], c: C.red }, { p: 10, pts: [[510, 205], [560, 205]] }, { p: 10, pts: [[510, 225], [560, 225]], c: C.blk },
];
// n = paso que se muestra; todo = esquema final completo (sin brillo)
function esquema(n, vb = [0, 0, 690, 404]) {
  const extra = '';
  const todo = n === 99;
  const m = todo ? 99 : n;
  let s = '';
  comps.filter(c => c.p <= m).forEach(c => { s += c.draw(todo ? -1 : n); });
  wires.filter(w => w.p <= m).forEach(w => {
    const nuevo = !todo && w.p === n;
    if (nuevo) s += `<polyline points="${pl(w.pts)}" fill="none" stroke="${C.halo}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<polyline points="${pl(w.pts)}" fill="none" stroke="${w.c || C.wire}" stroke-width="${nuevo ? 3.5 : 2.5}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (w.lab) s += T(w.lab[1], w.lab[2], w.lab[0], { fs: 12, c: C.mut });
  });
  if (m >= 1) s += `<rect x="190" y="311" width="20" height="18" rx="3" fill="#fff" stroke="${C.blk}" stroke-width="1.5"/>` + T(184, 320, 'interruptor', { a: 'end', fs: 12, c: C.mut });
  return `<svg class="d" viewBox="${vb.join(' ')}" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif" role="img" aria-label="Esquema de conexiones del paso ${n}">${s}${extra}</svg>`;
}
// Pasos 5 y 6: cables de prueba provisionales (puntas a 5V y a GND del Arduino)
const prueba5 = (a, b, ya, yb, la, lb) => esquema(4.5, V2).replace('</svg>', `
  <polyline points="320,${ya} 345,${ya}" stroke="${C.halo}" stroke-width="9" stroke-linecap="round" fill="none"/><polyline points="320,${ya} 345,${ya}" stroke="${C.red}" stroke-width="3.5" fill="none"/>${T(350, ya, 'a 5V', { fs: 12, b: 1, c: C.red })}
  <polyline points="320,${yb} 345,${yb}" stroke="${C.halo}" stroke-width="9" stroke-linecap="round" fill="none"/><polyline points="320,${yb} 345,${yb}" stroke="${C.blk}" stroke-width="3.5" fill="none"/>${T(350, yb, 'a GND', { fs: 12, b: 1, c: C.blk })}</svg>`);
const n5 = n => (n === 5 ? 4 : 4);

// ---------------------------------------------------------------- piezas de la página
const falla = items => `<div class="box warn keep"><span class="t">Si algo falla</span><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
const prueba = html => `<div class="box ok keep"><span class="t">Prueba</span>${html}</div>`;
const ojo = (t, html) => `<div class="box warn keep"><span class="t">${t}</span>${html}</div>`;
const code = c => `<pre class="code">${esc(c.trim())}</pre>`;
const tabla = (cab, filas) => `<table><tr>${cab.map(c => `<th>${c}</th>`).join('')}</tr>${filas.map(f => `<tr>${f.map((c, i) => (i === 0 ? `<td class="n">${c}</td>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</table>`;
const V1 = [10, 30, 330, 365], V2 = [10, 30, 510, 365], V3 = [385, 30, 300, 235];
const full = (e, txt) => `<div style="width:80%;margin:0 auto">${e}</div><div>${txt}</div>`;
const par = (e, txt) => `<div class="two" style="align-items:center;grid-template-columns:1fr 1fr">${e}<div>${txt}</div></div>`;
const paso = (n, titulo, meta, cuerpo) => `
<section class="paso">
  <p class="eyebrow">Paso ${n}</p>
  <h1>${titulo}</h1>
  <p class="goal"><b>Lo que se logra:</b> ${meta}</p>
  ${cuerpo}
</section>`;

const CODIGO_SENSORES = `
const int SENSOR_IZQ = 2;
const int SENSOR_DER = 3;

void setup() {
  pinMode(SENSOR_IZQ, INPUT);
  pinMode(SENSOR_DER, INPUT);
  Serial.begin(9600);
}

void loop() {
  int izquierdo = digitalRead(SENSOR_IZQ);
  int derecho = digitalRead(SENSOR_DER);

  Serial.print("Izquierdo: ");
  if (izquierdo == LOW) {
    Serial.print("OBSTACULO");
  } else {
    Serial.print("libre");
  }

  Serial.print("   Derecho: ");
  if (derecho == LOW) {
    Serial.println("OBSTACULO");
  } else {
    Serial.println("libre");
  }

  delay(200);
}`;

const CODIGO_MOTORES = `
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
}

void detener() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
}

void loop() {
  // izquierdo adelante
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  delay(2000);
  detener();
  delay(1000);

  // izquierdo atras
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  delay(2000);
  detener();
  delay(1000);

  // derecho adelante
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  delay(2000);
  detener();
  delay(1000);

  // derecho atras
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  delay(2000);
  detener();
  delay(3000);
}`;

const CODIGO_FINAL = `
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;

const int SENSOR_IZQ = 2;
const int SENSOR_DER = 3;

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(SENSOR_IZQ, INPUT);
  pinMode(SENSOR_DER, INPUT);
}

void adelante() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void atras() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void girarDerecha() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void girarIzquierda() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void loop() {
  int izquierdo = digitalRead(SENSOR_IZQ);
  int derecho = digitalRead(SENSOR_DER);

  if (izquierdo == LOW && derecho == LOW) {
    atras();
    delay(400);
    girarDerecha();
    delay(400);
  } else if (izquierdo == LOW) {
    girarDerecha();
  } else if (derecho == LOW) {
    girarIzquierda();
  } else {
    adelante();
  }
}`;

// ---------------------------------------------------------------- pasos
const pasos = [];
pasos.push(paso(1, 'Alimentación de los motores',
  'llevar los 6 V del portapilas hasta el L298N, con un interruptor para apagar todo.',
  par(esquema(1, V1), `<h3>Conectar así</h3><ol>
    <li>Conectar el <span class="pos">cable ROJO (+)</span> del portapilas a una pata del <b>interruptor</b>. Si el portapilas ya trae interruptor propio, se usa ese y se salta este paso.</li>
    <li>Conectar la pata del <b>centro</b> del interruptor al borne <b>12V</b> del L298N.</li>
    <li>Conectar el <span class="neg">cable NEGRO (−)</span> del portapilas al borne <b>GND</b> (el del medio de los tres).</li>
  </ol><p class="small">Los bornes azules se abren con un destornillador pequeño. El cable pelado entra por abajo y se aprieta.</p>`) +
  ojo('Los tres bornes del L298N', '<p>De un lado al otro dicen <b>12V</b>, <b>GND</b> y <b>5V</b>. Aquí solo se usan <b>12V</b> y <b>GND</b>. El borne <b>5V se deja sin nada</b>: con 6 V la placa no logra entregar bien los 5 V, y el Arduino ya se alimenta aparte.</p>') +
  prueba('<p>Con el interruptor encendido y el multímetro en <b>voltios DC</b>: punta roja en el borne <b>12V</b> y punta negra en el borne <b>GND</b>. Debe marcar <b>entre 5,6 y 6,4 V</b>.</p>') +
  falla(['Marca <b>menos de 4,5 V</b>: las pilas están gastadas.', 'Marca <b>0 V</b>: el interruptor está apagado o mal conectado, o un cable no hace contacto dentro del borne. Apretar el tornillo.', 'Marca un número <b>negativo</b>: las puntas del multímetro están al revés.', '<b>Nunca</b> conectar la pila de 9 V a este portapilas ni poner más de 4 pilas AA: los motores son de 3 a 6 V.'])));

pasos.push(paso(2, 'El motor izquierdo',
  'conectar el primer motor a su salida del L298N.',
  par(esquema(2, V1), `<h3>Conectar así</h3><ol>
    <li>Un cable del motor izquierdo al borne <b>OUT1</b>.</li>
    <li>El otro cable del motor al borne <b>OUT2</b>.</li>
  </ol><p>No importa cuál va en cuál: en el paso 5 se revisa hacia dónde gira y, si es al revés, se intercambian.</p>`) +
  prueba('<p>Tirar suavemente de cada cable: <b>no se sale</b>. Todavía no gira porque nadie le manda corriente.</p>') +
  falla(['Si el cable se sale, pelar un poco más de cobre y apretar de nuevo el tornillo.', 'Dos cables que se tocan entre sí hacen cortocircuito: separarlos.'])));

pasos.push(paso(3, 'El motor derecho',
  'conectar el segundo motor a la otra salida del L298N.',
  par(esquema(3, V1), `<h3>Conectar así</h3><ol>
    <li>Un cable del motor derecho al borne <b>OUT3</b>.</li>
    <li>El otro cable al borne <b>OUT4</b>.</li>
  </ol>`) +
  prueba('<p>Los dos motores tienen sus dos cables firmes en los bornes (OUT1, OUT2, OUT3, OUT4) y ningún cable pelado toca a otro.</p>')));

pasos.push(paso(4, 'El Arduino y el negativo en común',
  'encender el Arduino con su propia pila de 9 V y unir su negativo con el del L298N.',
  full(esquema(4, V2), `<h3>Conectar así</h3><ol>
    <li>Conectar la <b>pila de 9 V</b> al Arduino. Lo más fácil es el clip con conector redondo, que se enchufa en el <b>jack</b> del Arduino. Si el clip trae los cables pelados, el <span class="pos">rojo (+)</span> va al pin <b>VIN</b> y el <span class="neg">negro (−)</span> al borne <b>GND</b> del L298N, junto a los otros cables (así los pines GND de energía quedan libres para los sensores).</li>
    <li>Con un cable macho-macho, ir del pin <b>GND</b> que está junto al pin 13 (fila de pines de arriba, al lado de AREF) al <b>mismo borne GND</b> del L298N donde ya está el cable negro del portapilas (los cables comparten el borne).</li>
  </ol>`) +
  ojo('Por qué', '<p>El Arduino (pila de 9 V) y el L298N (portapilas de 6 V) tienen fuentes distintas. Para que el Arduino pueda mandar órdenes, los dos tienen que compartir el negativo. <b>Sin este cable no funciona nada.</b></p><p>La pila de 9 V es <b>solo para el Arduino</b>. No se conecta a los motores ni al L298N. Para apagar el Arduino, se desconecta el clip de la pila.</p>') +
  prueba('<p>Se enciende el LED <b>ON</b> del Arduino. Con el multímetro en <b>voltios DC</b>, el pin <b>5V</b> del Arduino contra GND marca <b>entre 4,8 y 5,2 V</b>. Después, en <b>continuidad</b> (el que pita), una punta en el pin GND del Arduino y la otra en el borne GND del L298N: <b>pita</b>.</p>') +
  falla(['El LED ON no enciende: la pila de 9 V está gastada (con menos de 7 V el Arduino se reinicia) o el clip está mal puesto. Medir la pila con el multímetro: una buena marca cerca de 9 V.', 'Marca menos de 4,8 V en el pin 5V: la pila está gastada. Cambiarla.', 'No pita: el cable GND está mal metido en el borne. Apretar el tornillo.'])));

const probarMotor = (n, lado, inA, inB, outs, y1, y2) => paso(n, `Probar el motor ${lado} (sin programar)`,
  `comprobar que el motor ${lado} gira hacia <b>adelante</b> con solo dos cables de prueba, antes de usar código.`,
  full(prueba5(0, 0, y1, y2), `<h3>Conectar así</h3><p>Con el interruptor <b>encendido</b>, usar dos cables macho-macho <b>provisionales</b>:</p><ol>
    <li>Del pin <b>5V</b> del Arduino al pin <b>${inA}</b> del L298N.</li>
    <li>Del pin <b>GND</b> del Arduino al pin <b>${inB}</b> del L298N.</li>
  </ol>`) +
  prueba(`<p>El motor ${lado} gira. Mirando el carro desde arriba, la rueda debe girar <b>hacia adelante</b> (hacia donde apuntan los sensores).</p><p>Después, cambiar los dos cables de lugar (5V a <b>${inB}</b> y GND a <b>${inA}</b>): la rueda gira <b>al revés</b>.</p>`) +
  falla([`La rueda gira hacia <b>atrás</b> con la conexión de arriba: intercambiar los dos cables del motor en los bornes (${outs}).`, '<b>No gira</b> con ninguna de las dos conexiones: revisar el paso 1 (voltaje en 12V y GND) y que los jumpers de ENA y ENB sigan puestos.', 'Gira muy despacio o con ruido: las pilas están gastadas.']) +
  `<p class="small">Al terminar, <b>quitar los dos cables provisionales</b>. Los cables definitivos van en el paso ${n + 2}.</p>`);
pasos.push(probarMotor(5, 'izquierdo', 'IN1', 'IN2', 'OUT1 y OUT2', 115, 140));
pasos.push(probarMotor(6, 'derecho', 'IN3', 'IN4', 'OUT3 y OUT4', 165, 190));

pasos.push(paso(7, 'Los cables de control del motor izquierdo',
  'conectar los dos pines que el Arduino usará para mandar al motor izquierdo.',
  full(esquema(7, V2), `<h3>Conectar así</h3>` + tabla(['L298N', 'Arduino'], [['IN1', 'pin <b>7</b>'], ['IN2', 'pin <b>8</b>']]) + '<p class="small">Cables macho-macho.</p>') +
  prueba('<p>Todavía no hay código, así que el motor <b>no se mueve</b>. Revisar con la tabla que cada cable esté en su pin y que los cables provisionales del paso 5 ya no estén.</p>')));

pasos.push(paso(8, 'Los cables de control del motor derecho',
  'conectar los dos pines que el Arduino usará para mandar al motor derecho.',
  full(esquema(8, V2), `<h3>Conectar así</h3>` + tabla(['L298N', 'Arduino'], [['IN3', 'pin <b>9</b>'], ['IN4', 'pin <b>10</b>']]) + '<p class="small">Cables macho-macho.</p>') +
  prueba('<p>Revisar con la tabla. Los pines <b>ENA</b> y <b>ENB</b> del L298N <b>no llevan cable</b>: sus jumpers siguen puestos.</p>')));

const sensorCuerpo = (n, lado, pin, vcc, gnd, extra) => par(esquema(n, V3), `<h3>Conectar así</h3>` + tabla(['Sensor', 'Va a (en el Arduino)'], [['VCC', vcc], ['GND', gnd], ['OUT', `pin <b>${pin}</b> (fila de pines digitales)`]]) + '<p class="small">Cables hembra-macho: el lado hembra se mete en la pata del sensor y el lado macho en el pin del Arduino.</p>') +
  extra +
  prueba(`<p>Al conectar, se enciende el LED de <b>energía</b> del sensor. Pasar la mano o un cartón blanco a unos 3 a 10 cm del sensor: se enciende el <b>segundo LED</b> (el de la salida). Al retirarla, se apaga.</p><p>Con el multímetro en voltios DC, punta negra en un pin GND del Arduino, punta roja en <b>OUT</b>: marca <b>cerca de 5 V</b> con el camino libre y <b>cerca de 0 V</b> con el obstáculo enfrente.</p>`) +
  falla(['No enciende ningún LED: VCC y GND están al revés o el cable de VCC no está en el pin indicado.', 'Detecta todo el tiempo, aun sin nada al frente: bajar la sensibilidad girando el tornillo azul del sensor (con un destornillador pequeño) hasta que se apague.', 'No detecta nada: subir la sensibilidad girando el tornillo en sentido contrario. Con objetos negros o brillantes detecta poco: probar con cartón blanco.'].concat(n === 10 ? ['El LED de energía no enciende y el pin IOREF marca 0 V: ese Arduino no trae IOREF conectado a 5V. Llevar el VCC de los dos sensores a una misma fila de una protoboard que reciba el pin 5V.'] : [])) +
  ojo('Dónde ponerlo en el carro', `<p>El sensor ${lado} va al frente, en la esquina ${lado === 'izquierdo' ? 'izquierda' : 'derecha'}, <b>mirando un poco hacia afuera</b>. Los dos sensores deben quedar separados unos 6 a 10 cm.</p>`);
pasos.push(paso(9, 'El sensor izquierdo', 'que el sensor izquierdo detecte un obstáculo y le avise al Arduino.',
  sensorCuerpo(9, 'izquierdo', 2, 'pin <b>5V</b> (fila de pines de energía, abajo)', 'pin <b>GND</b> de la fila de energía, el que está pegado al 5V', '')));
pasos.push(paso(10, 'El sensor derecho', 'que el sensor derecho haga lo mismo, en su propio pin.',
  sensorCuerpo(10, 'derecho', 3, 'pin <b>IOREF</b> (fila de pines de energía, el segundo pin empezando por el lado del USB)', 'el <b>otro</b> pin GND de la fila de energía (el que está junto a VIN)',
    ojo('Por qué IOREF', '<p>El Arduino tiene un solo pin 5V y ya lo usa el sensor izquierdo. El pin <b>IOREF</b> está unido internamente al 5V, así que da los mismos 5 V. <b>Antes de conectar el sensor</b>, medir con el multímetro en voltios DC: punta negra en un pin GND, punta roja en IOREF. Debe marcar <b>cerca de 5 V</b> (4,8 a 5,2 V).</p>'))));

pasos.push(paso(11, 'Instalar el IDE de Arduino',
  'tener en el computador el programa donde se escribe el código y se le manda al Arduino.',
  `<h3>Hacer así</h3><ol>
    <li>Entrar a <b>arduino.cc/en/software</b> y descargar el <b>Arduino IDE 2</b> para su sistema operativo (Windows, Mac o Linux).</li>
    <li>Abrir el archivo descargado e instalar con las opciones que trae por defecto (siguiente, siguiente).</li>
    <li>Abrir el <b>Arduino IDE</b>. Si pregunta por instalar controladores, aceptar.</li>
  </ol>` +
  prueba('<p>Se abre el programa y muestra un archivo nuevo con dos bloques: <code>void setup()</code> y <code>void loop()</code>.</p>') +
  falla(['Pide permisos de administrador: aceptar, o instalarlo desde una cuenta que los tenga.', 'En los computadores de la universidad puede estar bloqueado: avisar al profesor.'])));

pasos.push(paso(12, 'Conectar el Arduino al computador',
  'comprobar que el computador reconoce el Arduino y que le puede mandar un programa.',
  `<h3>Hacer así</h3><ol>
    <li>Desconectar el clip de la <b>pila de 9 V</b> y conectar el <b>cable USB del computador</b> al puerto del Arduino. Mientras se programa, el Arduino se alimenta del computador.</li>
    <li>En el IDE, menú <b>Herramientas → Placa → Arduino AVR Boards → Arduino Uno</b>.</li>
    <li>En <b>Herramientas → Puerto</b>, elegir el que dice <b>COM</b> con un número (por ejemplo, COM3). Es el que aparece al conectar el Arduino.</li>
    <li>Abrir <b>Archivo → Ejemplos → 01.Basics → Blink</b> y presionar el botón <b>Subir</b> (la flecha →, arriba a la izquierda).</li>
  </ol>` +
  prueba('<p>Abajo dice <b>Subido</b> (o "Done uploading") y el LED pequeño marcado <b>L</b> de la placa <b>parpadea</b> cada segundo.</p>') +
  falla(['No aparece ningún puerto COM: probar con otro cable (muchos son solo de carga) y otro puerto USB.', 'Si el Arduino es una copia y el computador no lo reconoce, instalar el controlador <b>CH340</b> y volver a conectar.', 'Dice "access denied" o "puerto ocupado": cerrar el Monitor Serie u otro programa que use el puerto.'])));

pasos.push(paso(13, 'Código de prueba: los sensores',
  'ver en pantalla lo que dice cada sensor, para comprobar el cableado de los pasos 9 y 10.',
  `<h3>Hacer así</h3><ol>
    <li>Con el cable USB del computador conectado, abrir un archivo nuevo (<b>Archivo → Nuevo sketch</b>), borrar lo que trae y pegar este código.</li>
    <li>Presionar <b>Subir</b>.</li>
    <li>Abrir el <b>Monitor Serie</b> (<b>Herramientas → Monitor Serie</b>) y poner abajo a la derecha la velocidad en <b>9600 baudios</b>.</li>
  </ol>` + code(CODIGO_SENSORES) +
  prueba('<p>En el Monitor Serie aparecen líneas como <code>Izquierdo: libre   Derecho: libre</code>. Al poner un cartón frente al sensor izquierdo, dice <b>Izquierdo: OBSTACULO</b>; frente al derecho, <b>Derecho: OBSTACULO</b>.</p>') +
  falla(['Cambian al revés (el izquierdo avisa cuando se tapa el derecho): intercambiar los pines en el código (<code>SENSOR_IZQ = 3</code> y <code>SENSOR_DER = 2</code>).', 'Siempre dice OBSTACULO o siempre libre: ajustar el tornillo azul del sensor (paso 9 o 10).', 'No salen letras raras ni nada: revisar que la velocidad sea 9600.'])));

pasos.push(paso(14, 'Código de prueba: los motores',
  'comprobar que cada rueda gira en el sentido correcto cuando el Arduino la manda.',
  `<h3>Hacer así</h3><ol>
    <li><b>Levantar el carro</b> para que las ruedas queden en el aire (sobre una caja o un libro).</li>
    <li>Encender el interruptor de los motores.</li>
    <li>Pegar este código y presionar <b>Subir</b>.</li>
  </ol>` + code(CODIGO_MOTORES) +
  prueba('<p>Se repite este orden, con una pausa de un segundo entre cada uno: <b>izquierda adelante</b> (2 s), <b>izquierda atrás</b>, <b>derecha adelante</b>, <b>derecha atrás</b>. En "adelante" la rueda gira hacia donde apuntan los sensores.</p>') +
  falla(['Una rueda gira al revés de lo que dice: intercambiar sus dos cables en los bornes del L298N (OUT1 con OUT2, o OUT3 con OUT4).', 'Giran las dos ruedas cuando solo debería girar una: revisar que IN1 e IN2 vayan a los pines 7 y 8, y IN3 e IN4 a los pines 9 y 10.', 'No gira ninguna: ver el voltaje del paso 1 y que el cable de GND del paso 4 esté firme.'])));

pasos.push(paso(15, 'El código completo: esquivar obstáculos',
  'que el carro avance solo y esquive lo que encuentre.',
  `<h3>Cómo decide</h3>` + tabla(['Sensores', 'El carro'], [['ninguno ve algo', 'avanza'], ['solo el izquierdo ve algo', 'gira a la derecha'], ['solo el derecho ve algo', 'gira a la izquierda'], ['los dos ven algo', 'retrocede un momento y gira']]) +
  `<h3>Hacer así</h3><ol>
    <li>Pegar este código y presionar <b>Subir</b>.</li>
    <li>Desconectar el cable del computador y volver a conectar el clip de la <b>pila de 9 V</b> al Arduino.</li>
    <li>Poner el carro en el piso, en un espacio despejado, con el interruptor de los motores encendido.</li>
  </ol>` + code(CODIGO_FINAL) +
  prueba('<p>El carro avanza. Al poner la mano o un cartón blanco al frente, <b>gira para esquivarlo</b>. Con un obstáculo de lado, gira hacia el lado contrario.</p>') +
  falla(['Gira <b>hacia el obstáculo</b> en vez de alejarse: los sensores están al revés. Intercambiar los dos valores de <code>SENSOR_IZQ</code> y <code>SENSOR_DER</code> en el código.', 'Gira muy poco: subir el número de <code>delay(400)</code> (por ejemplo, a 700).', 'Choca porque detecta tarde: subir la sensibilidad con el tornillo azul de cada sensor.', 'Anda muy rápido y no alcanza a esquivar: ver el paso 16.'])));

pasos.push(paso(16, 'Ajustes opcionales',
  'afinar el carro después de que ya funciona.',
  `<ul>
    <li><b>Girar más o menos:</b> cambiar los números de los <code>delay()</code> dentro de <code>loop()</code>. Más milisegundos, más giro.</li>
    <li><b>Detectar más lejos o más cerca:</b> el tornillo azul de cada sensor. Probar siempre con el mismo cartón blanco.</li>
    <li><b>Controlar la velocidad:</b> quitar los jumpers de ENA y ENB, conectar ENA al pin <b>5</b> y ENB al pin <b>6</b>, y en cada función de movimiento agregar al final <code>analogWrite(5, 200);</code> y <code>analogWrite(6, 200);</code> (el número va de 0 a 255). Para <code>detener()</code> usar 0.</li>
    <li><b>Un tercer sensor al centro:</b> otro sensor igual, con OUT al pin 4. Si ve algo, el carro retrocede y gira.</li>
  </ul>` +
  ojo('Antes de cambiar algo', '<p>Probar de a <b>un solo cambio</b> por vez y anotar qué pasó. Si se daña, volver al código del paso 15.</p>')));

// ---------------------------------------------------------------- página
const page = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Carrito digital que esquiva obstáculos: guía paso a paso</title>
<style>${css}
  @page{margin:9mm 12mm;}
  body{font-size:9.6pt;line-height:1.32;}
  header{text-align:center;} header h1{font-size:22pt;margin-bottom:2px;} header .eyebrow{margin-bottom:2px;}
  h3{margin:6px 0 2px;} p{margin:0 0 4px;} ul,ol{margin:0 0 4px;} li{margin-bottom:1px;}
  .box{padding:5px 9px;margin:5px 0;}
  table{margin:3px 0 5px;font-size:9pt;} th,td{padding:1.5px 6px;}
  section.paso h1{font-size:15pt;margin-bottom:1px;} .goal{font-size:10.5pt;margin:1px 0 4px;} .eyebrow{margin:0 0 2px;}
  .two{gap:10px;} .two img.d,.two svg.d{margin:2px 0;}
  svg.d{width:100%;height:auto;display:block;border:1px solid var(--line);border-radius:8px;margin:6px 0;background:#fbfaf6;}
  section.paso{break-before:auto;margin-top:10px;break-inside:avoid-page;} h1,h3,.eyebrow{break-after:avoid;} .two{break-inside:avoid;}
  pre.code{font-family:var(--mono);font-size:8.3pt;line-height:1.25;background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:6px 10px;margin:5px 0;white-space:pre;break-inside:auto;}
  code{font-family:var(--mono);font-size:9pt;background:var(--soft);padding:0 3px;border-radius:3px;}
</style></head>
<body><div class="wrap">

<header>
  <p class="eyebrow">Sistemas Físicos Hipermedia</p>
  <h1>Carrito digital que esquiva obstáculos</h1>
  <p class="small">Arduino UNO, driver L298N y dos sensores infrarrojos. Primero se arma todo el cableado, y al final se programa.</p>
</header>

<div class="box big keep">
  <h2>Todo está pensado para 6 voltios en los motores</h2>
  <p>El portapilas es de <b>4 pilas AA (aprox. 6 V)</b>. <b>No poner más pilas</b>. Ese portapilas es <b>solo para los motores</b>. El Arduino se alimenta con su propia <b>pila de 9 V</b> (o con el cable USB del computador mientras se programa). La pila de 9 V <b>nunca</b> va a los motores. <b>Nunca</b> conectar nada al borne <b>5V</b> del L298N.</p>
</div>

<h3>Cómo se trabaja</h3>
<ol>
  <li><b>Armar</b> solo lo que dice el paso, con el interruptor <b>apagado</b>.</li>
  <li><b>Revisar</b> cada cable contra la tabla del paso antes de prender. Una pata mal puesta es la causa de casi todos los errores.</li>
  <li><b>Probar</b> lo que dice el paso. Si no hace lo esperado, <b>no avanzar</b>: buscar el error en ese mismo paso. Cada paso trae recuadros de colores: <span style="background:var(--ok-soft);border:1px solid var(--ok);padding:0 5px;border-radius:4px"><b>verde</b></span> es la <b>Prueba</b> (lo que debe pasar); <span style="background:var(--warn-soft);border:1px solid #e2b93b;padding:0 5px;border-radius:4px"><b>amarillo</b></span> es <b>Si algo falla</b> u <b>Ojo</b> (qué revisar o tener en cuenta); <span style="background:var(--bad-soft);border:1px solid var(--bad);padding:0 5px;border-radius:4px"><b>rojo</b></span> es una <b>advertencia importante</b>. En los esquemas, lo que se conecta en ese paso va <b>resaltado en amarillo</b>.</li>
  <li><b>Documentar</b> cada paso en un documento propio (PDF o Word), con una foto o un video de <b>máximo 20 segundos</b> del montaje haciendo lo que dice la prueba.</li>
</ol>

<section>
  <h1 style="font-size:15pt;margin:6px 0 2px">Materiales</h1>
  <table>
    <tr><th>Cant.</th><th>Pieza</th><th>Nota</th></tr>
    <tr class="grp"><td colspan="3">PARA ARMAR</td></tr>
    <tr><td class="n">1</td><td>Arduino UNO y su cable USB</td><td>el cable que va al computador</td></tr>
    <tr><td class="n">1</td><td>Módulo L298N (la plaquita roja)</td><td>driver de los motores</td></tr>
    <tr><td class="n">2</td><td>Motorreductores con rueda</td><td>los amarillos</td></tr>
    <tr><td class="n">2</td><td>Sensor infrarrojo FC-51 (o HW-201)</td><td>3 patas: VCC, GND, OUT</td></tr>
    <tr><td class="n">1</td><td>Portapilas de 4 pilas AA, con sus pilas</td><td>aprox. 6 V</td></tr>
    <tr><td class="n">1</td><td>Interruptor deslizante</td><td>si el portapilas no trae uno</td></tr>
    <tr><td class="n">1</td><td>Pila de 9 V con clip y conector redondo (jack)</td><td>solo para el Arduino; el clip de cables pelados también sirve</td></tr>
    <tr><td class="n">7</td><td>Cables Dupont macho-macho</td><td>mejor llevar 8</td></tr>
    <tr><td class="n">6</td><td>Cables Dupont hembra-macho</td><td>mejor llevar 8, para los sensores</td></tr>
    <tr class="grp"><td colspan="3">HERRAMIENTAS</td></tr>
    <tr><td class="n">1</td><td>Multímetro</td><td>se pueden usar los del laboratorio Caldas</td></tr>
    <tr><td class="n">1</td><td>Destornillador pequeño</td><td>bornes del L298N y tornillo azul de los sensores</td></tr>
    <tr><td class="n">1</td><td>Computador con puerto USB</td><td>para instalar el Arduino IDE (paso 11)</td></tr>
  </table>
</section>

<section class="keep">
  <h3>Así queda todo al final del paso 10</h3>
  ${esquema(99)}
  <p class="small">Los pines <b>ENA</b> y <b>ENB</b> del L298N quedan sin cable, con sus jumpers puestos. El borne <b>5V</b> también queda vacío.</p>
</section>

${pasos.join('\n')}

</div></body></html>`;
fs.writeFileSync(HTML, page, 'utf8');

// ---------------------------------------------------------------- PDF con Edge
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
const url = 'file:///' + HTML.replace(/\\/g, '/').split('/').map((s, i) => (i === 0 ? s : encodeURIComponent(s))).join('/');
try { execFileSync(exe, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${PDF}`, url], { stdio: 'pipe' }); } catch (e) { /* ruido de stderr */ }
const t = fs.existsSync(PDF) ? fs.statSync(PDF).mtime : null;
console.log(t && Date.now() - t.getTime() < 60000 ? `PDF listo: ${PDF}` : 'No se pudo escribir el PDF (¿está abierto en otro programa?)');
