// Presentación de clase "Armamos el carrito, paso a paso": la guía de 23 pasos como diapositivas.
// Cada paso: título y logro, contexto (con el esquema), el pantallazo de la protoboard con las conexiones, y la prueba.
// Uso: node docs/gen-clase-carrito.js   → materias/sistemas-hipermedia/clase-11.html
// Los pantallazos salen de: node docs/gen-protoboard-paginas.js && node docs/capturas-carrito.js
// Este script genera el HTML una sola vez como punto de partida: después se puede editar clase-11.html a mano.
'use strict';
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'materias', 'sistemas-hipermedia', 'clase-11.html');
const IMG = '../../assets/imagenes/sistemas-hipermedia/';
const CAP = IMG + 'carrito-pasos/';
const ESQ = IMG + 'guia-carrito-1t/';
const BLOQUES_CIRCUITO = require('./gen-protoboard.js').BLOQUES;   // nombre y texto de cada bloque (los mismos de los botones "Aislar")

// ------------------------------------------------------------------ contenido de los 23 pasos
// d = minutos que se le dedican; esq = esquema de la guía; ojo / falla = diapositivas extra; notas = notas del profe (falla, trucos)
const L = arr => arr.map(x => `<li>${x}</li>`).join('');
const PASOS = [
  { n: 1, d: 6, titulo: 'Alimentación de 6 V', cap: 'paso-01',
    logro: 'Tener <span class="resaltar">6 V</span> entre el positivo y el negativo, con un interruptor para apagar todo.',
    contexto: 'Todo el carrito toma energía de <span class="resaltar">4 pilas AA en serie</span>: unos 6 V. <br>El interruptor es el botón de apagado de todo.',
    conectar: ['Cable <b>rojo</b> del portapilas a una pata de un lado del interruptor', 'Pata del <b>centro</b> del interruptor al <b>positivo</b> (fila roja)', 'Cable <b>negro</b> del portapilas al <b>negativo</b> (fila azul)', 'Cables entre filas: rojo con rojo, negro con negro'],
    prueba: 'Interruptor <span class="resaltar">encendido</span>. Multímetro en voltios DC: punta roja al positivo, negra al negativo. <br>Debe marcar <span class="resaltar2">entre 5,6 y 6,4 V</span>. <br>Probar en varios puntos de cada fila.',
    ojo: { titulo: 'Revisar positivo y negativo', texto: 'Muchas protoboards traen las filas del positivo y del negativo <span class="resaltar2">cortadas por la mitad</span>. <br>Hay que unir las dos mitades con un cable. <br>Y unir las filas de arriba con las de abajo: <br>rojo con rojo, negro con negro.' },
    falla: ['Menos de 4,5 V: pilas gastadas', '0 V: interruptor apagado o cable rojo sin contacto', 'Bien en un extremo y 0 V en el otro: la fila está partida, unirla con un cable', 'Número negativo: puntas del multímetro al revés'],
    notas: 'Nunca más de 7 V. No usar la pila de 9 V. Si es el caso, unir las dos mitades de cada fila.' },

  { n: 2, d: 7, titulo: 'El emisor infrarrojo', cap: 'paso-02', esq: 'paso-02-emisor.svg',
    logro: 'Que el LED infrarrojo emita luz que se pueda <span class="resaltar">ver con la cámara del celular</span>.',
    contexto: 'El emisor es un LED que echa luz <span class="resaltar">infrarroja</span>: el ojo no la ve, la cámara del celular sí. <br>Esa luz sale, rebota en un obstáculo y vuelve.',
    frente: true,
    conectar: ['<b>R1</b> (220 Ω): un extremo al <b>positivo</b>', 'El otro extremo de R1 a la <b>pata larga (+)</b> del LED infrarrojo (el transparente)', '<b>Pata corta (−)</b> del LED al <b>negativo</b>', 'El LED va <b>al frente</b>: patas en las primeras columnas, cabeza hacia afuera'],
    prueba: 'Multímetro entre las dos patas del LED infrarrojo: <span class="resaltar2">cerca de 1,2 V</span>. <br>Cámara del celular apuntando al LED: <span class="resaltar">luz morada</span>.',
    falla: ['No se ve la luz y marca casi 6 V: el LED está al revés', '0 V: el LED no recibe positivo, revisar el cable y R1', '1,2 V pero no se ve nada: la cámara tiene filtro infrarrojo, probar con la frontal', 'El valor salta: mal contacto, mover las piezas o cambiarlas de hueco'] },

  { n: 3, d: 8, titulo: 'El receptor y R3', cap: 'paso-03', esq: 'paso-03-receptor.svg',
    logro: 'Que el receptor <span class="resaltar">detecte la luz reflejada</span> y ese cambio se pueda medir como un voltaje.',
    contexto: 'El receptor se parece a un LED pero es oscuro: <span class="resaltar">deja pasar más corriente cuando le llega luz infrarroja</span>. <br>R3 convierte eso en un voltaje en el punto <span class="resaltar2">N</span>: <br>sin nada enfrente, casi 0 V; con una mano, sube.',
    conectar: ['<b>Pata corta</b> del receptor (el oscuro) al <b>positivo</b>', '<b>Pata larga</b> en una fila libre: ese punto se llama <b>N</b>', '<b>R3</b> (1 kΩ) de la fila de N al <b>negativo</b>', '<b>Barrera opaca</b> entre emisor y receptor'],
    ojo: { titulo: 'Barrera y obstáculo de prueba', texto: '<span class="resaltar">Barrera</span>: termoencogible negro grueso, dos vueltas de cinta negra o cartón negro grueso. <br>Los plásticos negros delgados dejan pasar el infrarrojo. <br><span class="resaltar2">Obstáculo</span>: cartón blanco, opaco y mate. <br>Lo negro absorbe y lo brillante no sirve.' },
    prueba: 'Pila desconectada, en ohmios: de la pata larga al negativo, <span class="resaltar2">cerca de 1 kΩ</span>. <br>Pila conectada: en N, sin nada enfrente, <span class="resaltar">menos de 0,5 V</span>. <br>Con un cartón blanco a 2 o 3 cm: N <span class="resaltar">sube</span>.',
    falla: ['Pata corta con casi 0 V: no le llega el positivo', 'En ohmios marca OL: R3 no llega al negativo, medir por tramos', 'N no sube con el cartón: acercar más, revisar la barrera y que el receptor no esté al revés', 'N se queda alto sin nada enfrente: R3 sin contacto, o el receptor ve el emisor directo', 'Sube muy poco: cambiar R3 por 4,7 kΩ'] },

  { n: 4, d: 6, titulo: 'El LED rojo', cap: 'paso-04', esq: 'paso-04-led-rojo.svg',
    logro: 'Armar la salida del sensor: un LED rojo que <span class="resaltar">por ahora queda apagado</span> y un punto <span class="resaltar2">S</span> con voltaje alto.',
    contexto: 'El LED rojo es nuestro <span class="resaltar">indicador</span>: nos dice cuándo el sensor "ve". <br><span class="resaltar2">S</span> es la salida: en reposo está en alto, cerca de 5,4 V, y el LED apagado. <br>Si S se conecta al negativo, el LED prende.',
    conectar: ['<b>R2</b> (1 kΩ) del <b>positivo</b> a la <b>pata larga (+)</b> del LED rojo', '<b>Pata corta (−)</b> en una fila libre: el punto <b>S</b>', '<b>R4</b> (10 kΩ) del <b>positivo</b> a la misma fila S', 'Nada más en S por ahora'],
    prueba: 'S marca <span class="resaltar2">cerca de 5,4 V</span> y el LED está <span class="resaltar">apagado</span>. <br>Con un cable de S al negativo: el LED <span class="resaltar">prende</span>. <br>Al quitar el cable, se apaga.',
    falla: ['No prende al unir S con el negativo: LED al revés', 'S casi 0 V y LED prendido sin tocar nada: la fila S toca el negativo', 'S bajo (por ejemplo 3 V): R4 mal puesta o de menor valor (café, negro, naranja)'] },

  { n: 5, d: 7, titulo: 'El transistor', cap: 'paso-05', esq: 'paso-05-transistor.svg',
    logro: 'Poner el transistor que <span class="resaltar">enciende el LED rojo</span> cuando le llega una pequeña corriente en la base.',
    contexto: 'El transistor es un <span class="resaltar">interruptor controlado</span>: una corriente pequeña en la base (B) deja pasar una grande de C a E. <br>Aquí: si B recibe corriente, <span class="resaltar2">baja S al negativo</span> y el LED rojo prende.',
    conectar: ['2N2222A con la <b>cara plana hacia ustedes</b>: de izquierda a derecha <b>E, B, C</b>', '<b>E</b> al <b>negativo</b>', '<b>C</b> a la fila <b>S</b>', '<b>B</b> sin conectar por ahora'],
    ojo: { titulo: 'Ojo con las patas del transistor', texto: 'Muchos 2N2222A traen las patas <span class="resaltar">E, B, C</span> mirando la cara plana. <br>Algunos vienen al revés: <span class="resaltar2">C, B, E</span>. <br>Si la prueba no funciona: <span class="resaltar">girar el transistor 180°</span> y cambiar los dos cables de lugar.' },
    prueba: 'LED apagado y S cerca de 5,4 V. <br>Tocar la pata del centro (B) con una resistencia de <span class="resaltar2">1 kΩ</span> cuyo otro extremo va al <span class="resaltar">positivo</span>: el LED <span class="resaltar">prende</span>. <br>Al quitarla, se apaga.',
    falla: ['No prende al tocar B: transistor al revés, o cables de E o C sin contacto', 'Prendido sin tocar nada: patas en otro orden o una pata toca otra fila', 'S baja apenas se pone el transistor: algún cable toca la base', 'Sin resistencia de 1 kΩ sirve una de 2,2 kΩ o 4,7 kΩ'] },

  { n: 6, d: 8, titulo: 'Unir el receptor con el transistor', cap: 'paso-06', esq: 'paso-06-sensor-completo.svg',
    logro: 'Completar el sensor: el LED rojo <span class="resaltar">prende al acercar una mano</span> y se apaga al alejarla.',
    contexto: 'Ahora unimos lo que ve el receptor (N) con la base del transistor. <br><span class="resaltar">Luz que rebota, N sube, el transistor conduce, S baja, el LED prende.</span> <br>Ya tenemos un <span class="resaltar2">sensor de proximidad</span>.',
    conectar: ['Un cable del punto <b>N</b> a la <b>base</b> del transistor (pata del centro)', 'Nada más'],
    prueba: 'Sin nada enfrente: LED <span class="resaltar">apagado</span>. <br>Mano o cartón blanco frente al emisor y al receptor: <span class="resaltar">prende</span>. <br>Al alejarlos: se apaga. <br>Medir a qué distancia empieza: <span class="resaltar2">unos 5 a 10 cm</span>.',
    falla: ['Prendido siempre: revisar R3 al negativo (1 kΩ), la barrera y probar con menos luz', 'Nunca prende: cable de N a la pata del centro, repetir las pruebas de los pasos 5 y 3', 'Prende solo con la mano pegada: cambiar R3 por 4,7 kΩ', 'Prende tenue o parpadea: mal contacto'] },

  { n: 7, d: 9, titulo: 'El L293D, alimentado', cap: 'paso-07', esq: 'paso-07-l293d.svg',
    logro: 'Dejar puesto y alimentado el chip que mueve los motores, <span class="resaltar">todavía sin motores</span>.',
    contexto: 'El L293D es un <span class="resaltar">puente H</span>: recibe una señal pequeña (la del sensor) y maneja los motores, que piden más corriente de la que el sensor puede dar. <br>Va <span class="resaltar2">a caballo del canal central</span>. La muesca marca la pata 1 y las patas se cuentan en forma de U.',
    conectar: ['Patas <b>1, 8, 9 y 16</b> al <b>positivo</b> (+6 V)', 'Patas <b>2, 4, 5, 10, 12 y 13</b> al <b>negativo</b>', 'Patas <b>7 y 15</b> al negativo <b>por ahora</b>', 'Patas <b>3, 6, 11 y 14</b> libres: son las de los motores'],
    prueba: 'Pata <span class="resaltar">16</span> contra el negativo: <span class="resaltar2">5,4 a 6 V</span>. <br>Lo mismo en las patas 8, 1 y 9. <br>El chip <span class="resaltar">no debe calentarse</span>: tocarlo unos segundos.',
    falla: ['El chip se calienta: apagar ya y revisar que esté a caballo del canal y que ninguna pata esté mal conectada', 'Pata 16 casi 0 V: el cable no hace contacto', 'Nunca pasar de 7 V en la pata 16'] },

  { n: 8, d: 8, titulo: 'Motor 1 y el sensor izquierdo', cap: 'paso-08', esq: 'paso-08-motor1.svg',
    logro: 'Que el motor 1 <span class="resaltar">gire con el camino libre</span> y se frene al poner la mano frente al sensor.',
    contexto: 'El chip hace girar el motor cuando sus dos patas de entrada (1A y 2A) tienen voltaje <span class="resaltar">distinto</span>. <br>Sin obstáculo: 2A en alto y 1A en tierra, el motor gira. <br>Con la mano: el sensor baja 2A a tierra, quedan <span class="resaltar2">iguales</span> y el motor frena.',
    conectar: ['Un cable del <b>motor 1</b> a la pata <b>3</b>', 'El otro cable del motor 1 a la pata <b>6</b>', 'Pata <b>7</b>: quitarla de GND y llevarla a la <b>salida S del sensor izquierdo</b>', 'Este motor 1 será la rueda <b>derecha</b>'],
    prueba: 'Sin nada frente al sensor: el motor <span class="resaltar">gira</span>. <br>Con la mano: se <span class="resaltar">frena</span> (y el LED rojo prende). <br>Al retirarla: vuelve a girar.',
    falla: ['No gira nunca: patas 1, 8, 9 y 16 a +6 V, cables en 3 y 6, probar el motor directo a la pila', 'Gira siempre aunque el LED prenda: la pata 7 no llega a S', 'Gira siempre y el LED no prende: repetir el paso 6', 'Gira lento: pilas gastadas', 'Gira al revés: invertir sus dos cables'],
    notas: 'Colores de cable del profe: azul positivo, café negativo, anaranjado conexiones entre componentes. En los dibujos el positivo es rojo y el negativo negro.' },

  { n: 9, d: 5, titulo: 'Motor 2', cap: 'paso-09', esq: 'paso-09-motor2.svg',
    logro: 'Que <span class="resaltar">los dos motores</span> giren y se frenen juntos con el mismo sensor. Es un paso intermedio.',
    contexto: 'Repetimos con la otra mitad del chip. <br>Por ahora el motor 2 usa <span class="resaltar2">el mismo cable del sensor izquierdo</span>: más adelante se lo pasamos al derecho.',
    conectar: ['Un cable del <b>motor 2</b> a la pata <b>14</b>', 'El otro cable del motor 2 a la pata <b>11</b>', 'Pata <b>15</b>: quitarla de GND y unirla al <b>mismo cable de S del sensor izquierdo</b>', 'Este motor 2 será la rueda <b>izquierda</b>'],
    prueba: 'Sin obstáculo: <span class="resaltar">los dos motores giran</span>. <br>Con la mano frente al sensor: <span class="resaltar">los dos se frenan</span>.',
    falla: ['El 2 no gira y el 1 sí: cables en 14 y 11, pata 15 en el cable de S, probar el motor 2 directo a la pila', 'El 2 gira siempre: la pata 15 sigue a GND', 'Los dos lentos: pilas gastadas'] },

  { n: 10, d: 3, titulo: 'Sensor derecho: el emisor', cap: 'paso-10', esq: 'paso-02-emisor.svg',
    logro: 'Empezar el segundo sensor, <span class="resaltar">igual al izquierdo</span>, en la otra mitad de la protoboard.',
    contexto: null,
    conectar: ['<b>R1</b> (220 Ω) del <b>positivo</b> a la <b>pata larga (+)</b> del LED infrarrojo', '<b>Pata corta (−)</b> al <b>negativo</b>', 'Al frente, con la cabeza hacia la <b>derecha</b>', 'El positivo y el negativo de este lado deben estar unidos con los del otro lado'],
    prueba: 'Entre las patas del LED infrarrojo <span class="resaltar2">cerca de 1,2 V</span> y <span class="resaltar">luz morada</span> en la cámara del celular, como en el paso 2.',
    notas: 'Si el positivo o el negativo de este lado marcan 0 V, revisar que estén unidos con los del otro lado. Los mismos errores del paso 2.' },

  { n: 11, d: 4, titulo: 'Sensor derecho: el receptor y R3', cap: 'paso-11', esq: 'paso-03-receptor.svg',
    logro: 'Que el receptor derecho detecte la luz reflejada, <span class="resaltar">igual que el izquierdo</span>.',
    contexto: null,
    conectar: ['<b>Pata corta</b> del receptor al <b>positivo</b>', '<b>Pata larga</b> en una fila libre (punto <b>N</b>) y <b>R3</b> (1 kΩ) en esa fila', 'Otro extremo de R3 al <b>negativo</b>', '<b>Barrera</b> entre emisor y receptor, y <b>otra barrera</b> entre el sensor izquierdo y el derecho'],
    prueba: 'Pila desconectada, en ohmios: <span class="resaltar2">cerca de 1 kΩ</span> entre el negativo y la pata larga. <br>Pila conectada: menos de 0,5 V sin nada enfrente y <span class="resaltar">sube</span> con un cartón blanco a 2 o 3 cm.',
    notas: 'Los mismos errores del paso 3. Si en este lado el voltaje sube poco, cambiar R3 por 4,7 kΩ.' },

  { n: 12, d: 3, titulo: 'Sensor derecho: el LED rojo', cap: 'paso-12', esq: 'paso-04-led-rojo.svg',
    logro: 'La parte de salida del sensor derecho, con su propio punto <span class="resaltar2">S</span>.',
    contexto: null,
    conectar: ['<b>R2</b> (1 kΩ) del <b>positivo</b> a la <b>pata larga (+)</b> del LED rojo', '<b>Pata corta (−)</b> en una fila libre: el punto <b>S</b>', '<b>R4</b> (10 kΩ) del <b>positivo</b> a la misma fila S', 'Nada más en S'],
    prueba: 'S marca <span class="resaltar2">cerca de 5,4 V</span> y el LED está apagado. <br>Con un cable de S al negativo: el LED <span class="resaltar">prende</span>.',
    notas: 'Los mismos errores del paso 4.' },

  { n: 13, d: 4, titulo: 'Sensor derecho: el transistor', cap: 'paso-13', esq: 'paso-05-transistor.svg',
    logro: 'Poner el transistor del sensor derecho y <span class="resaltar">comprobar que responde</span>.',
    contexto: null,
    conectar: ['Transistor con la <b>cara plana hacia ustedes</b>: <b>E, B, C</b> de izquierda a derecha', '<b>E</b> al <b>negativo</b> y <b>C</b> a la fila <b>S</b>', '<b>B</b> sin conectar por ahora'],
    prueba: 'LED apagado. <br>Tocar la pata B con una resistencia de <span class="resaltar2">1 kΩ</span> cuyo otro extremo va al positivo: el LED <span class="resaltar">prende</span>. <br>Al quitarla, se apaga.',
    notas: 'Los mismos errores del paso 5: transistor al revés (girarlo 180° y cambiar los dos cables), cables sin contacto o la base tocando algo.' },

  { n: 14, d: 3, titulo: 'Sensor derecho: unir receptor y transistor', cap: 'paso-14', esq: 'paso-06-sensor-completo.svg',
    logro: 'Completar el sensor derecho: su LED rojo <span class="resaltar">prende con la mano</span> y se apaga al alejarla.',
    contexto: null,
    conectar: ['Un cable del punto <b>N</b> a la <b>base</b> del transistor (pata del centro)'],
    prueba: 'Sin nada enfrente: LED derecho apagado. <br>Con la mano o un cartón: <span class="resaltar">prende</span>; al alejarlos, se apaga. <br>Probarlo <span class="resaltar2">solo</span>, sin tapar el sensor izquierdo.',
    notas: 'Los mismos errores del paso 6: LED siempre prendido (R3, barrera, luz fuerte), nunca prende (cable a la pata del centro, repetir pasos 13 y 11) o poco rango (R3 a 4,7 kΩ).' },

  { n: 15, d: 8, titulo: 'El cruce: la pata 15 al sensor derecho', cap: 'paso-15', esq: 'paso-15-cruce.svg',
    logro: 'Un carrito que <span class="resaltar">esquiva</span>: cada sensor frena la rueda del <span class="resaltar2">lado contrario</span>.',
    contexto: 'Si el sensor <span class="resaltar">izquierdo</span> ve un obstáculo, hay que frenar la rueda <span class="resaltar2">derecha</span>: el carrito gira a la derecha y se aleja. <br>Por eso <span class="resaltar">cruzamos</span> los cables: la pata 15 deja el sensor izquierdo y pasa al derecho.',
    conectar: ['Quitar de la <b>pata 15</b> el cable que venía de S del sensor izquierdo', 'Llevarlo a la <b>salida S del sensor derecho</b>', 'Pata <b>7</b> recibe el sensor izquierdo y mueve el motor 1 (rueda derecha)', 'Pata <b>15</b> recibe el sensor derecho y mueve el motor 2 (rueda izquierda)'],
    prueba: null,
    tabla: { titulo: 'Los cuatro casos', filas: [['Nada enfrente', 'los dos motores giran'], ['Mano al sensor <b>izquierdo</b>', 'frena el motor 1 (rueda derecha): <span class="resaltar">gira a la derecha</span>'], ['Mano al sensor <b>derecho</b>', 'frena el motor 2 (rueda izquierda): <span class="resaltar">gira a la izquierda</span>'], ['Mano a los <b>dos</b>', 'los dos se frenan']] },
    falla: ['Un motor no se frena con su sensor: la pata 7 o la 15 no llega a la S de ese sensor', 'Frena el motor del mismo lado: intercambiar los cables de los dos motores', 'Los dos se frenan con un solo sensor: las patas 7 y 15 están en la misma salida'],
    notas: 'Buen momento para montar los motores en el chasis: motor 1 a la derecha y motor 2 a la izquierda, mirando hacia donde avanza. Sensores adelante, apuntando un poco hacia afuera, con una barrera opaca entre el izquierdo y el derecho.' },

  { n: 16, d: 6, titulo: 'El LM358, alimentado', cap: 'paso-16', esq: 'paso-16-lm358.svg',
    logro: 'Poner el chip que va a decidir <span class="resaltar">cuándo hay un obstáculo</span> y alimentarlo.',
    contexto: 'El transistor decide con un "sí o no" brusco y depende mucho de la luz del salón. <br>El <span class="resaltar">LM358</span> es un <span class="resaltar2">comparador</span>: compara dos voltajes y decide con precisión. <br>A partir de aquí los transistores <span class="resaltar">se retiran</span>.',
    conectar: ['LM358 <b>a caballo del canal</b>, junto al L293D sin tocarlo', 'La <b>muesca</b> marca la pata 1; se cuentan en U: 1 a 4 por un lado, 5 a 8 por el otro', '<b>Pata 8</b> al <b>positivo</b>', '<b>Pata 4</b> al <b>negativo</b>'],
    prueba: 'Pata <span class="resaltar">8</span>: <span class="resaltar2">5,4 a 6 V</span>. <br>Pata <span class="resaltar">4</span>: <span class="resaltar2">0 V</span>.',
    falla: ['Pata 8 con muy poco (por ejemplo 1 V): es el error más común, el cable está en otra fila o no hace contacto', 'El chip se calienta: está al revés o hay una pata en tierra que no corresponde', 'Pata 4 sin 0 V: el cable al negativo no hace contacto'] },

  { n: 17, d: 7, titulo: 'El umbral: R5 y el potenciómetro', cap: 'paso-17', esq: 'paso-17-umbral.svg',
    logro: 'Fabricar un voltaje <span class="resaltar">ajustable</span>, el umbral, que decide qué tan cerca debe estar un obstáculo.',
    contexto: 'R5 y el potenciómetro forman un <span class="resaltar">divisor de voltaje</span>: al girar el potenciómetro, el voltaje del centro (el cursor) sube y baja entre 0 y unos 0,8 V. <br>Ese voltaje es la <span class="resaltar2">vara de medir</span> del LM358.',
    conectar: ['<b>R5</b> (47 kΩ) del <b>positivo</b> a una pata de un <b>extremo</b> del potenciómetro', 'La otra pata del extremo al <b>negativo</b>', 'La <b>pata del centro</b> (cursor) a la <b>pata 3</b> del LM358'],
    prueba: 'Midiendo en la pata <span class="resaltar">3</span> mientras se gira el potenciómetro: <br>el voltaje cambia de casi <span class="resaltar2">0 V</span> a unos <span class="resaltar2">0,8 V</span>.',
    falla: ['Siempre 0 V: no le llega el positivo a R5 o el cursor no está unido a la pata 3', 'Voltaje máximo muy bajo (0,1 V): el potenciómetro o trimmer es de 1 kΩ, hace falta de 10 kΩ', 'El voltaje salta al girar: mal contacto del cursor'],
    notas: 'El profe compró trimmers de 1 kΩ y no servían: usó potenciómetros de 10 kΩ. Un trimmer de 10 kΩ queda más bonito y funciona igual.' },

  { n: 18, d: 9, titulo: 'Pasar el sensor izquierdo al LM358', cap: 'paso-18', esq: 'paso-18-lm358-izq.svg',
    logro: 'Que el LM358 <span class="resaltar">reemplace al transistor</span> en el sensor izquierdo.',
    contexto: 'El LM358 compara: si <span class="resaltar2">N</span> (lo que ve el receptor) pasa del umbral de la pata 3, la salida baja a tierra y el LED prende. <br>Igual que hacía el transistor, pero ahora el <span class="resaltar">umbral lo ajustamos nosotros</span>. <br>La parte que ve la luz no cambia: <span class="resaltar">receptor + R3</span> entregan N, que ahora llega a la pata 2.',
    conectar: ['<b>Quitar</b> el transistor del sensor izquierdo y los <b>tres cables</b> que iban a él', 'Un cable de <b>N</b> a la <b>pata 2</b> del LM358', 'Un cable de la <b>pata 1</b> (la salida) a la fila <b>S</b>', 'R3 se queda en 1 kΩ'],
    prueba: 'Pata 2 sin nada enfrente: <span class="resaltar2">menos de 0,4 V</span>. <br>Girar el potenciómetro hasta que el LED quede <span class="resaltar">apagado</span> sin nada enfrente y <span class="resaltar">prenda</span> al acercar la mano. <br>El motor 1 gira libre y frena con la mano.',
    falla: ['LED prendido siempre: medir la pata 2; si marca 1 V o más, R3 no llega al negativo o es de 4,7 kΩ; si está baja, revisar la pata 8', 'Nunca prende: el umbral está muy alto, bajarlo, o la pata 1 no está unida a S', 'El potenciómetro no cambia nada: repetir el paso 17'],
    notas: 'El punto justo del potenciómetro es el que queda un poco antes de que el LED se prenda solo. Subir el umbral da menos rango pero más estable; bajarlo da más rango.' },

  { n: 19, d: 4, titulo: 'El umbral del sensor derecho', cap: 'paso-19', esq: 'paso-19-umbral-der.svg',
    logro: 'El mismo voltaje ajustable del paso 17, ahora para el sensor derecho, con <span class="resaltar">la otra mitad del LM358</span>.',
    contexto: 'El LM358 tiene <span class="resaltar">dos comparadores</span>: <br>el izquierdo usa las patas 1, 2 y 3; el derecho, las patas <span class="resaltar2">5, 6 y 7</span>.',
    conectar: ['Otro divisor igual: <b>R5</b> (47 kΩ) del <b>positivo</b> a un extremo de un segundo potenciómetro', 'El otro extremo al <b>negativo</b>', 'La <b>pata del centro</b> (cursor) a la <b>pata 5</b> del LM358'],
    prueba: 'En la pata <span class="resaltar">5</span>, girando el potenciómetro: de casi <span class="resaltar2">0 V</span> a unos <span class="resaltar2">0,8 V</span>.',
    notas: 'Los mismos errores del paso 17: R5 sin positivo, cursor que no llega a la pata 5, o potenciómetro de un valor muy chico.' },

  { n: 20, d: 7, titulo: 'Pasar el sensor derecho al LM358', cap: 'paso-20', esq: 'paso-20-lm358-der.svg',
    logro: 'Que <span class="resaltar">los dos sensores</span> usen el LM358 y el carrito sea ajustable de los dos lados.',
    contexto: 'Igual que en el sensor izquierdo: <span class="resaltar">receptor + R3</span> entregan N, ahora a la pata <span class="resaltar2">6</span>. <br>La salida del comparador, la pata <span class="resaltar2">7</span>, va a S, y de S sigue el cable a la pata 15 del L293D.',
    conectar: ['<b>Quitar</b> el transistor del sensor derecho y los <b>tres cables</b> que iban a él', 'Un cable de <b>N</b> del sensor derecho a la <b>pata 6</b>', 'Un cable de la <b>pata 7</b> (salida) a la fila <b>S</b> del sensor derecho', 'La pata 15 del L293D sigue unida a esa fila'],
    prueba: 'Girar el segundo potenciómetro hasta que el LED derecho quede <span class="resaltar">apagado</span> sin nada enfrente y <span class="resaltar">prenda</span> con la mano. <br>Repetir los <span class="resaltar2">cuatro casos</span> del paso 15.',
    falla: ['Los mismos errores del paso 18, con las patas 6, 5 y 7', 'Un sensor reacciona y el otro no: revisar su salida (pata 1 o 7) y que la entrada (7 o 15) del L293D siga ahí'],
    tabla: { titulo: 'Los cuatro casos otra vez', filas: [['Nada enfrente', 'los dos motores giran'], ['Mano al sensor <b>izquierdo</b>', 'frena la rueda derecha'], ['Mano al sensor <b>derecho</b>', 'frena la rueda izquierda'], ['Mano a los <b>dos</b>', 'se frenan los dos']] } },

  { n: 21, d: 5, titulo: 'Los condensadores de la alimentación', cap: 'paso-21', esq: 'paso-21-condensadores.svg',
    logro: 'Que la alimentación <span class="resaltar">no tiemble ni se reinicie</span> cuando los motores arrancan.',
    contexto: 'Al arrancar, un motor <span class="resaltar">tira la alimentación hacia abajo</span> y mete ruido. <br>Los condensadores son <span class="resaltar2">pequeñas reservas de energía</span>: la entregan en picos rápidos y todo se mantiene estable.',
    conectar: ['<b>C1</b> (470 µF, electrolítico) entre positivo y negativo, cerca de la batería: <b>pata larga al +, franja al −</b>', '<b>C2</b> (100 nF, marcado 104) pegado al LM358', '<b>C3</b> (100 nF) pegado al L293D, cerca de la pata 16'],
    ojo: { titulo: 'Cuidado con C1', texto: 'El electrolítico <span class="resaltar">sí tiene polaridad</span>: la <span class="resaltar2">franja</span> del cuerpo marca la pata negativa y va al negativo. <br>Al revés se calienta y puede explotar. <br>Si se calienta o huele raro: <span class="resaltar">apagar de inmediato</span>.' },
    prueba: 'El voltaje positivo-negativo sigue en <span class="resaltar2">5,4 a 6 V</span>. <br>Poner y quitar la mano varias veces, rápido: los motores arrancan y paran <span class="resaltar">sin que los LED parpadeen</span> y sin que nada se reinicie.',
    falla: ['Los LED parpadean: C2 y C3 deben estar pegados a los chips y C1 bien puesto', 'C1 se calienta: está al revés, apagar y darle la vuelta', 'Todo se reinicia al arrancar un motor: pilas gastadas'] },

  { n: 22, d: 5, titulo: 'Los condensadores de los motores', cap: 'paso-22', esq: 'paso-21-condensadores.svg',
    logro: 'Quitarle el ruido a cada motor <span class="resaltar">desde su origen</span>.',
    contexto: 'Un motor mientras gira genera chispitas eléctricas que confunden al chip y a los sensores. <br>Un condensador de <span class="resaltar2">100 nF</span> directo entre sus dos terminales se las come. <br>No tiene polaridad.',
    conectar: ['<b>C4</b> (100 nF) directo entre los <b>dos terminales del motor 1</b>', '<b>C5</b> (100 nF) directo entre los <b>dos terminales del motor 2</b>', 'Mejor soldados; si no hay soldadura, enrollar bien las patas'],
    prueba: 'Poner y quitar la mano rápido frente a cada sensor: los motores arrancan y paran <span class="resaltar">sin que los LED parpadeen</span> y sin que se reinicie nada.',
    falla: ['El motor no gira después de poner el condensador: sus patas se tocan entre sí o tocan la carcasa', 'Sigue el ruido: C4 y C5 deben estar en los terminales del motor, no en los cables largos'],
    notas: 'Extra, solo si todavía "tiembla" en el límite de la distancia: R6 de 470 kΩ entre la salida del comparador y su entrada +: pata 1 con pata 3 (izquierdo) y pata 7 con pata 5 (derecho).' },

  { n: 23, d: 6, opcional: true, titulo: 'Motores con su propio pack de pilas', cap: 'paso-23', esq: 'paso-23-pack-motores.svg',
    logro: 'Solo si los motores <span class="resaltar">no son de 3 a 6 V</span>, o si con 6 V giran muy despacio.',
    contexto: 'Hasta ahora un solo pack de 6 V alimenta todo. <br>Aquí los motores pasan a <span class="resaltar">su propio pack</span>, por la pata 8 del L293D. <br>La lógica (pata 16), los sensores y el LM358 siguen en los 6 V.',
    conectar: ['<b>Pata 8</b> del L293D: quitarla del positivo y llevarla al <b>positivo del pack de motores</b>', '<b>Negativo del pack de motores</b> al negativo del circuito (el mismo de todo)', '<b>Pata 16</b> sigue en el positivo de 6 V de la lógica'],
    tabla: { titulo: 'Qué pack poner (el L293D se come unos 2,5 V)', filas: [['Motor de 5 V', 'pack de unos 7,5 V (5 pilas AA)'], ['Motor de 6 V', 'pack de 8 a 9 V (6 pilas AA)'], ['Motor de 10 a 12 V', 'pack de unos 12 V (8 pilas AA)']] },
    ojo: { titulo: 'Cuidado', texto: '<span class="resaltar">Los dos negativos se unen siempre</span>. <br>La pata 16 nunca debe pasar de 7 V. <br>El L293D aguanta 600 mA por motor. <br>No usar la pila rectangular de 9 V: no entrega la corriente.' },
    prueba: 'Pata <span class="resaltar">16</span> contra el negativo: <span class="resaltar2">5,4 a 6 V</span>. <br>Pata <span class="resaltar">8</span>: el voltaje del pack de motores. <br>Los motores giran <span class="resaltar">más fuerte</span> y los sensores siguen igual.',
    falla: ['Los motores no giran: los dos negativos no están unidos', 'Los sensores se vuelven locos o el chip se calienta: la pata 16 recibe el voltaje del pack grande, devolverla al positivo de 6 V'] },
];

// ------------------------------------------------------------------ bloques (títulos de sección)
const BLOQUES = {
  1: { t: 'Bloque 1: la alimentación', s: 'Paso 1' },
  2: { t: 'Bloque 2: el sensor izquierdo', s: 'Pasos 2 a 6' },
  7: { t: 'Bloque 3: el chip y los motores', s: 'Pasos 7 a 9' },
  10: { t: 'Bloque 4: el sensor derecho y el cruce', s: 'Pasos 10 a 15' },
  16: { t: 'Bloque 5: el LM358', s: 'Pasos 16 a 20' },
  21: { t: 'Bloque 6: condensadores y pack', s: 'Pasos 21 a 23' },
};

// ------------------------------------------------------------------ construcción
let min = 0;
const out = [];
const cruda = (dur, attrs, inner, notas) => {
  const m = min; min += dur;
  out.push(`      <section data-min="${m.toFixed(1)}"${attrs ? ' ' + attrs : ''}>\n${inner}${notas ? `\n        <aside class="notes">\n          ${notas}\n        </aside>` : ''}\n      </section>\n`);
};
const meme = (txt, dur = 0.3) => out.push(`      <!-- MEME/GIF: ${txt} -->\n      <section data-min="${(min += dur, min - dur).toFixed(1)}">\n        <div class="img-placeholder">🖼️ ESPACIO PARA MEME/GIF</div>\n      </section>\n`);
const comentario = t => out.push(`\n      <!-- ===================== ${t} ===================== -->\n`);

const slideTitulo = p => `        <div class="pequeno">Paso ${p.n} de 23${p.opcional ? ' (opcional)' : ''}</div>\n        <div class="paso-titulo">${p.titulo}</div>\n        <div class="paso-logro"><span class="resaltar2">Lo que logramos:</span> ${p.logro}</div>`;
const slideContexto = p => {
  const frente = p.frente ? `<br><span class="resaltar2">Y lo ponemos al frente</span>, en diagonal hacia afuera, como las luces de un carro.` : '';
  if (p.esq) {
    return `        <div class="ctx">\n          <div class="ctx-texto"><div class="pequeno">Paso ${p.n} · ${p.titulo}</div>${p.contexto}${frente}</div>\n          <img class="esq" data-preview-image src="${ESQ}${p.esq}" alt="Esquema del paso ${p.n}">\n        </div>`;
  }
  return `        <div class="pequeno">Paso ${p.n} · ${p.titulo}</div>\n        ${p.contexto}${frente}`;
};
const slideCaptura = p => `        <div class="cab"><span class="resaltar2">Paso ${p.n}</span> · ${p.titulo}</div>\n        <div class="cuerpo">\n          <img class="cap" data-preview-image src="${CAP}${p.cap}.png" alt="La protoboard al terminar el paso ${p.n}: ${p.titulo}">\n          <ul class="pie">${L(p.conectar)}</ul>\n        </div>`;
const slidePrueba = p => `        <div class="tablero">Paso ${p.n} · Prueba</div>\n        <br>\n        ${p.prueba}`;
const slideTabla = p => `        <div class="tablero">Paso ${p.n} · ${p.tabla.titulo}</div>\n        <table class="casos">${p.tabla.filas.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table>`;
const slideOjo = p => `        <div class="tablero">Paso ${p.n} · ${p.ojo.titulo}</div>\n        <br>\n        ${p.ojo.texto}`;
const slideFalla = p => `        <div class="tablero">Paso ${p.n} · Si algo falla</div>\n        <ul class="falla">${L(p.falla)}</ul>`;

const notasFalla = p => (p.falla ? 'Si algo falla: ' + p.falla.join('; ') + '.' : '') + (p.notas ? ' ' + p.notas : '');

// ---- apertura
comentario('APERTURA');
cruda(0.7, '', `        <span class="subtitulo">Sistemas Físicos Hipermedia</span>\n        <br>\n        <span class="pequeno">Clase 11 "Armamos el carrito, paso a paso"</span>`);
cruda(0.8, 'class="muchotexto"', `        La guía era larga <br>\n        y <span class="resaltar">no salió como esperábamos</span>. <br>\n        Hoy lo armamos <span class="resaltar2">juntos</span>, <br>\n        un paso a la vez.`, 'Tono: sin culpas. La guía tenía 23 pasos y era mucho para hacerla solos. Hoy se arma con el grupo entero, cada paso con su prueba, y nadie avanza hasta que el paso anterior funcione.');
cruda(1, 'class="muchotexto"', `        <div class="pequeno">Las reglas de hoy</div>\n        <ul class="listasordenadas">\n          <li><span class="resaltar">Armar</span> solo lo del paso, con el interruptor apagado</li>\n          <li><span class="resaltar">Revisar</span> el positivo y el negativo antes de prender</li>\n          <li><span class="resaltar">Probar</span> lo que dice el paso</li>\n          <li>Si no funciona, <span class="resaltar2">no avanzamos</span>: levanten la mano</li>\n        </ul>`);
cruda(0.8, 'class="muchotexto"', `        <div class="tablero">Ojo</div>\n        <br>\n        Todo está calculado para <span class="resaltar">6 voltios</span>: <br>\n        4 pilas AA en serie. <br>\n        <span class="resaltar2">Nada de la pila de 9 V</span>: <br>\n        el L293D se daña con más de 7 V.`);
meme('algo de "esto va a salir bien", "plan", o "paso a paso"');
cruda(1.4, 'class="muchotexto"', `        <div class="ctx">\n          <div class="ctx-texto"><div class="pequeno">El carrito que vamos a armar</div>Dos sensores <span class="resaltar">al frente</span>, uno a cada lado, <span class="resaltar2">mirando en diagonal hacia afuera</span>: como las luces de un carro. <br>Cada sensor frena la rueda del lado contrario, y el carrito <span class="resaltar">se guía solo</span>.</div>\n          <img class="cap-media" data-preview-image src="${CAP}frente-luces.png" alt="El frente de la protoboard: el emisor y el receptor de cada sensor, inclinados hacia afuera como las luces de un carro">\n        </div>`,
  'La placa se dibuja con el frente del carrito a la izquierda. El sensor izquierdo está en la mitad de abajo y el derecho en la de arriba. Las cabezas de los LED miran en diagonal hacia afuera. Entre el sensor izquierdo y el derecho hay una pared opaca, y entre el emisor y el receptor de cada uno, una barrera.');
cruda(1.5, '', `        <div class="pequeno">Hoy vamos a ver</div>\n        <ul class="listasordenadas">\n          <li>Bloque 1: la alimentación (paso 1)</li>\n          <li>Bloque 2: el sensor izquierdo (pasos 2 a 6)</li>\n          <li>Bloque 3: el chip y los motores (pasos 7 a 9)</li>\n          <li>Bloque 4: el sensor derecho y el cruce (pasos 10 a 15)</li>\n          <li>Bloque 5: el LM358 (pasos 16 a 20)</li>\n          <li>Bloque 6: condensadores y pack (pasos 21 a 23)</li>\n        </ul>`, 'Son unos 175 minutos con los descansos. Si el tiempo no alcanza, un corte natural es después del paso 9 (los dos motores girando) o después del paso 15 (el carrito que esquiva).');
cruda(1.2, 'class="muchotexto"', `        <div class="pequeno">Lo que necesitamos</div>\n        <div class="materiales">\n          <div><span class="resaltar2">Base</span><br>protoboard, portapilas 4×AA con pilas, interruptor, cables, multímetro</div>\n          <div><span class="resaltar2">Cada sensor (×2)</span><br>LED infrarrojo, receptor, LED rojo, R1 220 Ω, R2 y R3 1 kΩ, R4 10 kΩ, transistor 2N2222A</div>\n          <div><span class="resaltar2">Motores</span><br>L293D y dos motores con rueda de 3 a 6 V</div>\n          <div><span class="resaltar2">El LM358</span><br>LM358, 2 potenciómetros de 10 kΩ, 2 R5 de 47 kΩ</div>\n          <div><span class="resaltar2">Condensadores</span><br>1 de 470 µF y 4 de 100 nF (104)</div>\n        </div>`, 'Termoencogible negro grueso o cinta negra para las barreras. Cartón blanco como obstáculo de prueba. El multímetro se presta en el laboratorio Caldas.');
meme('algo de "revisar que no falte nada", "lista de compras" o "ya tengo todo"');

// ---- el circuito en bloques (antes del LM358, que es donde más cuesta ubicarse)
const slidesBloques = () => {
  comentario('EL CIRCUITO EN BLOQUES');
  cruda(0.5, '', `        <span class="pequeno">Antes de seguir</span>
        <br>
        <span class="subtitulo2">El circuito en bloques</span>`,
    'Aquí los transistores ya no están y cuesta ubicar qué parte es cuál. Se separa el circuito en 7 bloques. Los mismos botones "Aislar" están en cada página de protoboard-pasos.');
  cruda(1.2, 'class="muchotexto"', `        <div class="bloque">
          <div class="cab">Así viaja la señal</div>
          <div class="cadena"><span class="resaltar2">Emisor</span> manda luz, el <span class="resaltar2">Receptor</span> la ve y entrega <span class="resaltar">N</span>. <br><span class="resaltar2">El que decide</span> compara y mueve <span class="resaltar">S</span>. <br>La <span class="resaltar2">Salida</span> prende el LED y avisa al <span class="resaltar2">L293D</span>, que frena un <span class="resaltar2">motor</span>.</div>
          <img class="bl" data-preview-image src="${CAP}placa-completa-total.png" alt="La placa completa del carrito">
        </div>`);
  ['alim', 'emisor', 'receptor', 'salida', 'decision', 'motores', 'condensadores'].forEach(b => {
    cruda(0.8, 'class="muchotexto"', `        <div class="bloque">
          <div class="cab"><span class="resaltar2">Bloque</span> · ${BLOQUES_CIRCUITO[b].n}</div>
          <img class="bl" data-preview-image src="${CAP}bloque-${b}.png" alt="La placa con solo el bloque ${BLOQUES_CIRCUITO[b].n} encendido">
          <div class="cadena">${BLOQUES_CIRCUITO[b].t}</div>
        </div>`);
  });
  meme('algo de "ya entendí" o "se prendió el bombillo"', 0.2);
};

// ---- pasos
let ultimoBloque = null;
PASOS.forEach(p => {
  if (p.n === 16) slidesBloques();
  if (BLOQUES[p.n]) {
    comentario(BLOQUES[p.n].t.toUpperCase());
    cruda(0.6, '', `        <span class="pequeno">${BLOQUES[p.n].s}</span>\n        <br>\n        <span class="subtitulo2">${BLOQUES[p.n].t}</span>`);
    if (p.n === 2) meme('algo de "ahora sí viene lo bueno" o "luces de carro"', 0.2);
  }
  comentario(`PASO ${p.n}: ${p.titulo.toUpperCase()}`);
  const slides = [];
  slides.push(['class="muchotexto"', slideTitulo(p)]);
  if (p.contexto) slides.push(['class="muchotexto"', slideContexto(p)]);
  slides.push(['data-state="captura"', slideCaptura(p), notasFalla(p)]);
  if (p.ojo) slides.push(['class="muchotexto"', slideOjo(p)]);
  if (p.tabla) slides.push(['class="muchotexto"', slideTabla(p)]);
  if (p.prueba) slides.push(['class="muchotexto"', slidePrueba(p)]);
  if (p.falla && p.n <= 8 || p.n === 15 || p.n === 16 || p.n === 18) slides.push(['class="muchotexto"', slideFalla(p)]);
  const dur = p.d / slides.length;
  slides.forEach(([attrs, inner, notas]) => cruda(dur, attrs, inner, notas));
  if (p.n === 6) meme('algo de "funciona" o "es vivo", el LED prende con la mano');
  if (p.n === 9) { meme('algo de "motor" o "el carrito se mueve"'); out.push(`      <section data-min="${min.toFixed(1)}"><span class="subtitulo">☕ Break</span><br><span class="pequeno">10 minutos</span></section>\n`); min += 10; }
  if (p.n === 15) { meme('algo de "esquivar" o "gira solo"'); out.push(`      <section data-min="${min.toFixed(1)}"><span class="subtitulo">☕ Break</span><br><span class="pequeno">10 minutos</span></section>\n`); min += 10; }
  if (p.n === 20) meme('algo de "ajustar" o "calibrando"');
});

// ---- cierre
comentario('CIERRE');
cruda(1.5, 'class="muchotexto"', `        <div class="pequeno">Así queda la placa completa</div>\n        <img class="completa" data-preview-image src="${CAP}placa-completa-total.png" alt="La protoboard completa del carrito con los dos sensores, el L293D, el LM358, los condensadores y los motores">`, 'Recorrer la placa completa de izquierda a derecha: alimentación, sensores al frente, L293D, LM358 y condensadores. Lo que sigue: el chasis de cartón y la placa de circuito impreso (PCB).');
cruda(1.2, 'class="muchotexto"', `        <div class="pequeno">Para la próxima</div>\n        <ul class="listasordenadas">\n          <li>Montar el circuito en el <span class="resaltar">chasis</span></li>\n          <li>Calibrar los potenciómetros en el lugar de uso</li>\n          <li>Pasar de la protoboard a una <span class="resaltar2">placa de circuito</span></li>\n        </ul>`);
meme('algo de "misión cumplida" o "carrito terminado"');
out.push(`      <!-- Cierre fijo de todas las clases: contacto y video de despedida (ver la memoria feedback-clase-cierre-estandar) -->
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

// ------------------------------------------------------------------ documento
const estilos = `
  <style>
    /* diapositivas del paso a paso del carrito */
    .paso-titulo { color: #ff5fc4; font-size: 6vw; line-height: 1.05; margin: 0.6vh 0 2vh; }
    .paso-logro { font-size: 3.4vw; line-height: 1.15; }
    .ctx { display: flex; align-items: center; justify-content: center; gap: 2.5vw; width: 96vw; margin: 0 auto; }
    .ctx .ctx-texto { flex: 1 1 44vw; text-align: left; font-size: 3vw; line-height: 1.15; }
    .ctx .ctx-texto .pequeno { margin-bottom: 1.2vh; }
    .ctx img.esq { flex: 0 1 48vw; max-width: 48vw; max-height: 72vh; background: #fff; border-radius: 10px; border: 3px solid #5ff0d0; }
    .ctx img.cap-media { flex: 0 1 50vw; max-width: 50vw; max-height: 72vh; background: #fbfaf6; border-radius: 10px; border: 3px solid #5ff0d0; }
    section[data-state="captura"] { text-align: left; }
    .cab { font-size: 3vw; color: #efe9ff; margin-bottom: 1vh; text-align: center; }
    .cuerpo { display: flex; align-items: center; justify-content: center; gap: 2vw; width: 96vw; margin: 0 auto; }
    .cuerpo img.cap { flex: 0 1 65vw; max-width: 65vw; max-height: 74vh; object-fit: contain; background: #fbfaf6; border-radius: 10px; border: 3px solid #5ff0d0; }
    .cuerpo ul.pie { flex: 1 1 28vw; font-size: 2.3vw; line-height: 1.1; text-align: left; margin: 0; padding-left: 1.6vw; list-style: square; }
    .cuerpo ul.pie li { margin-bottom: 1.2vh; }
    .cuerpo ul.pie b { color: #ffd166; font-weight: normal; }
    ul.falla { font-size: 2.8vw; line-height: 1.15; text-align: left; display: inline-block; max-width: 92vw; margin-top: 1vh; }
    ul.falla li { margin-bottom: 1.2vh; }
    table.casos { margin: 2vh auto 0; border-collapse: collapse; font-size: 3vw; text-align: left; }
    table.casos td { border: 2px solid #5f527d; padding: 1vh 1.6vw; }
    table.casos td:first-child { color: #ffd166; white-space: nowrap; }
    .materiales { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6vh 2vw; font-size: 2.3vw; line-height: 1.1; text-align: left; width: 90vw; margin: 0 auto; }
    .materiales > div { border: 2px solid #5f527d; border-radius: 10px; padding: 1vh 1.4vw; }
    .bloque { display: flex; flex-direction: column; align-items: center; gap: 1.2vh; width: 96vw; margin: 0 auto; }
    .bloque .cab { font-size: 3vw; }
    .bloque img.bl { max-width: 92vw; max-height: 56vh; background: #fbfaf6; border-radius: 10px; border: 3px solid #5ff0d0; }
    .bloque .cadena { font-size: 2.5vw; line-height: 1.15; max-width: 90vw; }
    .bloque .cadena b { color: #5ff0d0; font-weight: normal; }
    img.completa { max-width: 92vw; max-height: 78vh; background: #fbfaf6; border-radius: 10px; border: 3px solid #5ff0d0; }
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
           La guía de 23 pasos (apoyo/carrito/guia-estudiantes/carrito-guia.pdf) como presentación:
           por cada paso, el logro, el contexto, el pantallazo de la protoboard con las conexiones y la prueba.
           Los pantallazos viven en assets/imagenes/sistemas-hipermedia/carrito-pasos/ y salen de
           apoyo/carrito/protoboard-pasos/ebc/ (los mismos números de paso que la guía).
           Los LED van al frente de la placa, en diagonal hacia afuera, como las luces de un carro.
           Las notas del presentador (tecla S) traen el "si algo falla" de cada paso. Clic en una imagen para ampliarla.
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
const nSlides = (html.match(/<section/g) || []).length;
console.log(`clase-11.html: ${nSlides} diapositivas, ${Math.round(min + 2)} min`);
