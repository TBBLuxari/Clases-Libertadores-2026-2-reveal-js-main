// gen-clase-diseno3d-12.js - genera materias/diseno-3d/clase-12.html (rig del cuerpo: el pie, foot roll y pole vector).
// Uso: node docs/gen-clase-diseno3d-12.js   (copia las capturas aprobadas a assets/imagenes/diseno-3d/rig-cuerpo/)
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const ORIGEN_IMG = path.join(RAIZ, 'ejemplos/diseno-3d/cuerpo/borrador/img');
const DESTINO_IMG = path.join(RAIZ, 'assets/imagenes/diseno-3d/rig-cuerpo');
const PLANTILLA = path.join(RAIZ, 'materias/diseno-3d/clase-10.html');
const SALIDA = path.join(RAIZ, 'materias/diseno-3d/clase-12.html');
fs.mkdirSync(DESTINO_IMG, { recursive: true });

// nombre del archivo en el borrador -> nombre en assets (solo las capturas aprobadas por el profesor)
const IMG = {};
function img(origen, nombre) {
  fs.copyFileSync(path.join(ORIGEN_IMG, origen), path.join(DESTINO_IMG, nombre));
  IMG[origen] = '../../assets/imagenes/diseno-3d/rig-cuerpo/' + nombre;
  return IMG[origen];
}
const A = {
  poses: img('29_roll_4_poses.png', '29-roll-cuatro-poses.png'),
  joints1: img('01_joints_pierna.png', '01-joints-pierna.png'),
  joints2: img('02_joints_pie.png', '02-joints-pie.png'),
  menuIK: img('03_menu_create_ik.png', '03-menu-create-ik.png'),
  optRP: img('04_tool_settings_ik_rp.png', '04-opciones-ik-rotate-plane.png'),
  ik1: img('05_ik_pierna_creado.png', '05-ik-pierna-creado.png'),
  ik2: img('06_ik_pierna_mover.png', '06-ik-pierna-mover.png'),
  ikBola: img('07_ik_bola.png', '07-ik-bola.png'),
  ikPunta: img('08_ik_punta.png', '08-ik-punta.png'),
  menuGroup: img('09_menu_group.png', '09-menu-group.png'),
  grupos: img('10_cuatro_grupos.png', '10-cuatro-grupos.png'),
  pivOrigen: img('11a_pivote_origen.png', '11a-pivote-origen.png'),
  pivTalon: img('11b_pivote_talon.png', '11b-pivote-talon.png'),
  pivPunta: img('12_pivote_punta.png', '12-pivote-punta.png'),
  pivBola: img('13_pivote_bola.png', '13-pivote-bola.png'),
  anidados: img('14_grupos_anidados.png', '14-grupos-anidados.png'),
  ikEnGrupos: img('15_ik_dentro_de_grupos.png', '15-ik-dentro-de-grupos.png'),
  menuCircle: img('16_menu_circle.png', '16-menu-circle.png'),
  optCircle: img('17_opciones_circulo.png', '17-opciones-circulo.png'),
  grupos3: img('10n_tres_grupos.png', '10n-tres-grupos.png'),
  pivOrigenN: img('11a_pivote_origen_n.png', '11a-pivote-origen-n.png'),
  pivTalonN: img('11b_pivote_talon_n.png', '11b-pivote-talon-n.png'),
  pivPuntaN: img('12n_pivote_punta.png', '12n-pivote-punta.png'),
  pivBolaN: img('13n_pivote_bola.png', '13n-pivote-bola.png'),
  anidadosN: img('14n_grupos_anidados.png', '14n-grupos-anidados.png'),
  ikEnGruposN: img('15n_ik_dentro_de_grupos.png', '15n-ik-dentro-de-grupos.png'),
  cbRollN: img('25n_channel_box_roll.png', '25n-channel-box-roll.png'),
  posesN: img('29n_roll_4_poses.png', '29n-roll-cuatro-poses.png'),
  locFrenteN: img('31n_locator_frente_rodilla.png', '31n-locator-frente-rodilla.png'),
  selLocN: img('32n_seleccion_locator_e_ik.png', '32n-seleccion-locator-e-ik.png'),
  pvCreadoN: img('34n_pole_vector_creado.png', '34n-pole-vector-creado.png'),
  pv35aN: img('35an_locator_al_frente.png', '35an-locator-al-frente.png'),
  pv35bN: img('35bn_locator_al_costado.png', '35bn-locator-al-costado.png'),
  menuCirculoN: img('16n_menu_circle.png', '16n-menu-circle.png'),  circuloPie: img('18n_circulo_sobre_el_pie.png', '18n-circulo-sobre-el-pie.png'),  menuFreeze: img('19a_menu_freeze.png', '19a-menu-freeze.png'),  congelado: img('19b_congelado.png', '19b-congelado.png'),  jerarquiaN: img('21n_jerarquia_control.png', '21n-jerarquia-control.png'),
  circulo: img('18_circulo_creado.png', '18-circulo-creado.png'),
  offset: img('19_grupo_offset.png', '19-grupo-offset.png'),
  offMovido: img('20a_grupo_movido_al_pie.png', '20a-grupo-movido-al-pie.png'),
  ctrlCero: img('20b_control_en_cero.png', '20b-control-en-cero.png'),
  menuParent: img('21_menu_parent.png', '21-menu-parent.png'),
  jerarquia: img('22_jerarquia_control.png', '22-jerarquia-control.png'),
  menuAttr: img('23_menu_add_attribute.png', '23-menu-add-attribute.png'),
  winAttr: img('24_ventana_add_attribute.png', '24-ventana-add-attribute.png'),
  cbRoll: img('25_channel_box_roll.png', '25-channel-box-roll.png'),
  menuSDK: img('26_menu_set_driven_key.png', '26-menu-set-driven-key.png'),
  sdk1: img('27_sdk_talon_cargado.png', '27-sdk-talon-cargado.png'),
  sdk2: img('28_sdk_bola_cargada.png', '28-sdk-bola-cargada.png'),
  menuLoc: img('30_menu_locator.png', '30-menu-locator.png'),
  locFrente: img('31_locator_frente_rodilla.png', '31-locator-frente-rodilla.png'),
  selLoc: img('32_seleccion_locator_e_ik.png', '32-seleccion-locator-e-ik.png'),
  menuPV: img('33_menu_pole_vector.png', '33-menu-pole-vector.png'),
  pvCreado: img('34_pole_vector_creado.png', '34-pole-vector-creado.png'),
  pv35a: img('35a_locator_al_frente.png', '35a-locator-al-frente.png'),
  pv35b: img('35b_locator_al_costado.png', '35b-locator-al-costado.png'),
};

// ---------- ayudas de maquetación ----------
const esc = (s) => s; // el texto ya viene en HTML
let n = 0;
const sec = (cuerpo, nota) => `        <section>\n${nota ? `          <aside class="notes">\n            ${nota}\n          </aside>\n` : ''}${cuerpo}\n        </section>\n`;
const texto = (html, nota) => sec(html.split('\n').map((l) => '          ' + l).join('\n'), nota);
const neon = (t) => `        <section data-background-color="#000000">\n          <div class="neon-rays"></div>\n          <div class="titulo blink neon">${t}</div>\n        </section>\n`;
// Sin huecos de meme en esta clase (el profesor no tiene tiempo para ponerlos). Para volver a ponerlos, cambiar CON_MEMES a true.
const CON_MEMES = false;
const meme = (idea) => (CON_MEMES ? `        <section>\n          <!-- MEME/GIF: ${idea} -->\n          <div class="img-placeholder">🖼️ ESPACIO PARA MEME/GIF</div>\n        </section>\n` : '');
let pasoN = 0;
const paso = (etiqueta, titulo, imagen, alt, pie, nota, estilo) => sec(
  `          <div class="pequeno">${/^Paso [0-9]+$/.test(etiqueta) ? 'Paso ' + (++pasoN) : etiqueta} </div>\n          <div class="paso-titulo">${titulo}</div>\n          <img class="captura"${estilo ? ` style="${estilo}"` : ''} src="${imagen}" alt="${alt}">\n          <div class="pequeno">${pie} </div>`, nota);
const bloque = (t) => `\n        <!-- ================================= ${t} ================================= -->\n\n`;

const S = [];
const add = (x) => S.push(x);

// ---------- repaso, orden de la escena, cuerpo completo, Mirror Joint, Parent y skin: los explica el profesor en vivo (clase 12 empieza directo en lo dificil) ----------

// ---------- el pie ----------
add(bloque('EL PIE'));
add(neon('El pie'));
add(paso('Lo que vamos a lograr', 'Un solo número mueve el pie', A.posesN, 'Cuatro posiciones del foot roll',
  'Roll en -10, 0, 5 y 10',
`Meta del bloque: un atributo llamado Roll en el control del pie que mueva, con un solo número, el talón, la bola y la punta. -10 apoya el talón y sube la punta; 0 es el pie plano; 5 sube el talón con la bola apoyada; 10 deja el pie sobre la punta. En las capturas de este bloque las dos piernas se ven superpuestas porque la vista es lateral: es normal. Con la cadera fija la rodilla se dobla bastante al subir el talón; en una animación se baja el control de la cadera.`, 'max-height:66vh;'));
add(texto(`<div class="pequeno">El pie rueda sobre tres puntos </div>
<span class="resaltar">Talón</span> · <span class="resaltar2">bola</span> · <span class="resaltar">punta</span>
<div class="pequeno">Cada punto es el pivote de un grupo </div>`,
`Idea central. Un grupo gira alrededor de su pivote, y todo lo que tiene adentro gira con él. Entonces: un grupo con el pivote en el talón (levanta la punta), uno con el pivote en la punta (sube el talón y apoya el pie en los dedos) y uno con el pivote en la bola (sube el talón con los dedos apoyados). Son tres grupos, uno por punto. Los IK van dentro de los grupos para que los joints sigan el movimiento. Pivote = el punto alrededor del cual gira un objeto; cada objeto tiene un solo pivote, por eso hacen falta tres objetos.`));
add(meme('"el foot roll, ese gran desconocido"'));

add(bloque('A. JOINTS DEL PIE'));
add(paso('Paso 1', 'Los joints de la pierna', A.joints1, 'Joints de la pierna en vista lateral', 'Muslo, rodilla y tobillo',
`Punto de partida: el cuerpo ya con joints y skin. Pierna izquierda: muslo, rodilla, tobillo, bola y punta. La rodilla queda un poco adelantada de la línea muslo-tobillo para que el IK sepa hacia dónde doblar. Los joints no son exactos; deben quedar dentro de la malla.`));
add(paso('Paso 2', 'Y los del pie', A.joints2, 'Joints del pie: tobillo, bola y punta', 'Tobillo, bola del pie y punta',
`Zoom al pie. El tobillo en el hueso del tobillo, la bola donde se doblan los dedos y la punta en el extremo de los dedos.`));

add(bloque('B. TRES IK'));
add(paso('Paso 3', 'Create IK Handle', A.menuIK, 'Menú Skeleton, Create IK Handle', 'Skeleton → Create IK Handle',
`Menú Skeleton → Create IK Handle. El cuadrito de la derecha abre las opciones. (El menú Skeleton está en el conjunto Rigging.)`));
add(paso('Paso 4', 'Rotate-Plane Solver para la pierna', A.optRP, 'Opciones del IK Handle, Rotate-Plane Solver', 'Este solver permite dirigir la rodilla',
`Por qué Rotate-Plane (RP): le da a la cadena un plano en el que se dobla, y ese plano se controla con el pole vector (o con el atributo Twist); así se dirige hacia dónde apunta la rodilla. El Single-Chain Solver (SC) solo acerca la punta de la cadena al handle y no deja dirigir el doblez. En Maya 2027 el RP ya viene seleccionado por defecto en las opciones: en la pierna solo hay que verificarlo. El cambio real es a Single-Chain Solver para el IK de la bola y el de la punta: son tramos cortos de dos joints donde no hay nada que dirigir.`));
add(paso('Paso 5', 'Clic en el muslo y clic en el tobillo', A.ik1, 'IK de la pierna creado', 'ik_pierna_L en el Outliner',
`Con la herramienta activa: un clic en el muslo y otro en el tobillo. Aparece el IK Handle en el tobillo. Renombrarlo ik_pierna_L.`));
add(paso('Paso 6', 'Se mueve el handle y la rodilla se dobla sola', A.ik2, 'IK de la pierna movido', 'Esa es la gracia del IK',
`Prueba rápida: mover el IK Handle hacia adelante y arriba y la rodilla se acomoda sola. Después se devuelve el handle al tobillo (o se deshace con Ctrl+Z) antes de seguir.`));
add(paso('Paso 7', 'IK de la bola', A.ikBola, 'IK de la bola', 'Del tobillo a la bola · Single-Chain',
`Cambiar Current solver a Single-Chain Solver. Clic en el tobillo y clic en la bola. Renombrar ik_bola_L. Este IK sirve para que la bola quede quieta en el suelo cuando el talón sube.`));
add(paso('Paso 8', 'IK de la punta', A.ikPunta, 'IK de la punta', 'De la bola a la punta · Single-Chain',
`Clic en la bola y clic en la punta. Renombrar ik_punta_L. Ya hay tres IK Handles: pierna, bola y punta.`));
add(meme('"tres IK y todavía no hay control"'));

add(bloque('C. TRES GRUPOS Y SUS PIVOTES'));
add(paso('Paso 9', 'Un grupo vacío', A.menuGroup, 'Menú Edit, Group', 'Grupo = una caja vacía que lleva lo que se le meta adentro',
`Primera vez que aparece el grupo: es una caja vacía (sin geometría) que sirve para llevar objetos adentro; lo que se mueva o gire el grupo, se lo llevan sus hijos. Con nada seleccionado, Ctrl+G (Edit → Group) crea un grupo vacío. Hacer tres y nombrarlos: grp_talon_L, grp_punta_L y grp_bola_L. Aquí el grupo sí hace falta: cada uno tendrá su propio pivote.`));
add(paso('Paso 10', 'Tres grupos', A.grupos3, 'Tres grupos vacíos en el Outliner', 'Todavía sin nada adentro',
`Los tres grupos quedan sueltos en el Outliner, al lado de los IK.`));
add(paso('Paso 11', 'El pivote nace en el origen', A.pivOrigenN, 'Pivote del grupo en el origen', 'Pivote = el punto alrededor del cual gira un objeto',
`Todo grupo nuevo tiene su pivote en el origen del mundo. Con el grupo seleccionado se entra al modo pivote con la tecla D (mantenida). El punto amarillo de la captura marca dónde está el pivote. Para ubicarlo con precisión: tecla V mantenida pega el pivote al punto más cercano (el vértice del talón, el de la punta o el joint de la bola). Ojo: en mis pruebas puse los valores por comando, no lo hice arrastrando con V. Los tres pivotes quedan a la altura del suelo.`));
add(paso('Paso 12', 'Pivote del talón', A.pivTalonN, 'Pivote en el talón', 'grp_talon_L',
`El pivote del grupo del talón, en la parte de atrás del talón, a la altura del suelo. En vista lateral basta: el giro es sobre el eje X y no depende de qué tan a un lado quede el pivote.`));
add(paso('Paso 13', 'Pivote de la punta', A.pivPuntaN, 'Pivote en la punta', 'grp_punta_L',
`El pivote del grupo de la punta, en el extremo de los dedos, a la altura del suelo.`));
add(paso('Paso 14', 'Pivote de la bola', A.pivBolaN, 'Pivote en la bola del pie', 'grp_bola_L: en el suelo, debajo de la bola',
`El pivote del grupo de la bola, a la altura del suelo, justo debajo de la bola (donde se doblan los dedos).`));
add(paso('Paso 15', 'Los grupos se anidan', A.anidadosN, 'Grupos anidados en el Outliner', 'talón > punta > bola',
`Para anidar: se selecciona primero el hijo y de último el padre (el último que se selecciona recibe la orden) y se pulsa P. Orden de afuera hacia adentro: grp_talon_L contiene a grp_punta_L, y grp_punta_L contiene a grp_bola_L. Por eso al girar el talón se mueve todo el pie, y al girar la bola solo se levanta el talón.`));
add(paso('Paso 16', 'Los IK entran en los grupos', A.ikEnGruposN, 'IK dentro de los grupos', 'Pierna y bola en grp_bola_L · punta en grp_punta_L',
`Un IK handle es el punto al que debe llegar el extremo de la cadena; si el grupo lo lleva adentro, cuando el grupo gira el handle cambia de lugar y los joints lo persiguen. ik_pierna_L e ik_bola_L van dentro de grp_bola_L (select hijo, luego padre, P). ik_punta_L va dentro de grp_punta_L y NO en el de la bola: así la punta se queda clavada en el suelo cuando el talón sube. Al girar un grupo, todo lo que lleva adentro gira con él.`));
add(meme('"los grupos como muñecas rusas"'));

add(bloque('D. EL CONTROL DEL PIE'));
add(paso('Paso 17', 'Una curva para mover el pie', A.menuCirculoN, 'Menú Create, NURBS Primitives, Circle', 'Create → NURBS Primitives → Circle',
`El control es un círculo NURBS. Se crea directamente con el item Circle, sin abrir las opciones: Maya lo crea acostado sobre el suelo y el tamaño y la posición se arreglan después con Mover y Escalar. Renombrarlo ctrl_pie_L. Es solo una curva: no hace nada hasta que se le metan adentro los grupos del pie.`));
add(paso('Paso 18', 'Se pone sobre el pie: mover y escalar', A.circuloPie, 'Círculo alrededor del pie con valores en el Channel Box', 'W mover · R escalar',
`Con las teclas W y R: se escala hasta que rodee el pie (en mi prueba escala 12) y se lleva al pie con Mover (16,6, 0,5 y 3). Que el círculo quede un poco más grande que el pie y apoyado en el suelo. No importa el tamaño exacto. Fijarse en el Channel Box: quedan valores sueltos (Translate distinto de 0 y Scale 12). Si el círculo no nació acostado, se gira con E hasta que quede plano.`));
add(paso('Paso 19', 'Congelar', A.menuFreeze, 'Menú Modify, Freeze Transformations', 'Modify → Freeze Transformations',
`Con el círculo seleccionado: Modify → Freeze Transformations. El círculo se queda donde está, pero sus valores se "guardan" en la forma de la curva.`));
add(paso('Paso 20', 'Todo en cero', A.congelado, 'Channel Box del círculo en cero', 'Translate 0 · Rotate 0 · Scale 1',
`Resultado: el círculo no se movió, pero el Channel Box vuelve a Translate 0, Rotate 0 y Scale 1. Así, cuando se mueva el control más adelante, "0" significa "pie en su sitio" y siempre se puede volver a esa pose escribiendo 0. Con este paso no hace falta ningún grupo encima del círculo.`));
add(paso('Paso 21', 'Los grupos entran en el control', A.menuParent, 'Menú Edit, Parent', 'Edit → Parent (P)',
`Seleccionar grp_talon_L, luego ctrl_pie_L y pulsar P (Edit → Parent). Recordar: P junta, Shift+P separa. Así el control queda como padre: lo que se mueva el control se lo llevan los grupos, y con ellos los IK handles y los joints.`));
add(paso('Paso 22', 'Esta es la jerarquía', A.jerarquiaN, 'Jerarquía del control del pie', 'ctrl_pie_L > grupos > IK',
`Resultado: ctrl_pie_L contiene a grp_talon_L y todo lo que ya estaba dentro (grupos e IK handles). Ahora mover el círculo mueve todo el pie. El círculo no "se asigna" a nada con un comando especial: simplemente es el padre de los grupos.`));
add(meme('"mover el control y que el pie siga: se siente como magia"'));

add(bloque('E. EL ATRIBUTO ROLL'));
add(paso('Paso 25', 'Add Attribute', A.menuAttr, 'Menú Modify, Add Attribute', 'Modify → Add Attribute…',
`Con el círculo (ctrl_pie_L) seleccionado: Modify → Add Attribute…`));
add(paso('Paso 26', 'Roll: de -10 a 10', A.winAttr, 'Ventana Add Attribute', 'Roll · Float · Keyable · -10 a 10',
`Long name: Roll. Make attribute: Keyable. Data Type: Float. Minimum -10, Maximum 10, Default 0. Botón OK. En mi prueba se creó con el botón OK de la ventana.`));
add(paso('Paso 27', 'Roll ya está en el Channel Box', A.cbRollN, 'Channel Box con Roll', 'Todavía no mueve nada',
`Roll aparece como último renglón del Channel Box. Moverlo todavía no hace nada: falta conectarlo con los grupos.`));

add(bloque('F. SET DRIVEN KEY'));
add(paso('Paso 28', 'Set Driven Key', A.menuSDK, 'Menú Key, Set Driven Key, Set', 'Key → Set Driven Key → Set…',
`El menú Key solo existe en el conjunto de menús Animation (tecla F4); en Rigging no aparece. Alternativa: clic derecho sobre el atributo en el Channel Box → Set Driven Key. Volver a Rigging con F3 cuando termine.`));
add(paso('Paso 29', 'Driver: Roll · Driven: el grupo', A.sdk1, 'Ventana Set Driven Key con el talón cargado', '1 Roll · 2 grupo · 3 Rotate X · 4 Key',
`Orden en la ventana: (1) seleccionar ctrl_pie_L y Load Driver, clic en Roll. (2) Seleccionar grp_talon_L y Load Driven, clic en Rotate X. (3) Poner Roll en el valor, poner la rotación del grupo y pulsar Key. Se repite para cada valor de la tabla siguiente. Si Key está gris es que falta elegir el atributo en las dos listas.`));
add(paso('Paso 30', 'Lo mismo con la bola', A.sdk2, 'Ventana Set Driven Key con la bola cargada', 'Cambia solo el grupo: Load Driven',
`Para cada grupo se cambia solo el Load Driven; el driver sigue siendo Roll. Orden sugerido: talón, bola y punta.`));
add(texto(`<div class="pequeno">Los valores de cada grupo (Rotate X) </div>
<table class="tabla-sdk" style="margin:0 auto; font-size:3.2vw; border-collapse:collapse;">
  <tr><th style="padding:0.4vw 1.6vw;"></th><th style="padding:0.4vw 1.6vw;">Roll -10</th><th style="padding:0.4vw 1.6vw;">Roll 0</th><th style="padding:0.4vw 1.6vw;">Roll 5</th><th style="padding:0.4vw 1.6vw;">Roll 10</th></tr>
  <tr><td class="resaltar" style="padding:0.4vw 1.6vw;">Talón</td><td>-30</td><td>0</td><td></td><td></td></tr>
  <tr><td class="resaltar2" style="padding:0.4vw 1.6vw;">Bola</td><td></td><td>0</td><td>30</td><td></td></tr>
  <tr><td class="resaltar" style="padding:0.4vw 1.6vw;">Punta</td><td></td><td></td><td>0</td><td>60</td></tr>
</table>
<div class="pequeno">Solo 6 claves (botón Key): las casillas vacías no llevan clave </div>`,
`Valores que verifiqué en Maya (grados), con tres grupos. Talón: Roll -10 vale -30 y Roll 0 vale 0; de 0 en adelante se queda en 0. Bola: Roll 0 vale 0 y Roll 5 vale 30; de 5 en adelante se queda en 30 (el talón sigue arriba mientras ruedan los dedos). Punta: Roll 5 vale 0 y Roll 10 vale 60. En total 6 claves; después de la última clave el valor se queda quieto. Tangentes lineales (en la ventana Set Driven Key: Options o en el Graph Editor), si no el giro se pasa de largo entre dos claves. Los signos dependen de que el pie mire hacia +Z (el modelo mira a +Z). Si el pie de algún estudiante mira a otro lado, los signos se invierten. Set Driven Key = una regla "cuando este atributo valga X, este otro valga Y": el driver es el que manda (Roll) y el driven el que obedece (el giro de cada grupo).`));
add(paso('Paso 31', 'Probar el Roll', A.posesN, 'Cuatro posiciones del Roll', 'Mover Roll en el Channel Box',
`Seleccionar ctrl_pie_L y mover Roll en el Channel Box: -10, 0, 5 y 10. Medí el tobillo, la bola y la punta con estos valores: a Roll 5 la bola y la punta se quedan en el suelo mientras el talón sube. Con la cadera fija la rodilla se dobla bastante, es normal (y todavía no hay pole vector). Si algo gira al revés, revisar el signo de los valores del grupo correspondiente.`, 'max-height:66vh;'));
add(meme('"cuando el Roll por fin funciona"'));

add(bloque('G. POLE VECTOR'));
add(paso('Paso 32', 'Un locator delante de la rodilla', A.menuLoc, 'Menú Create, Locator', 'Create → Locator',
`Locator y pole vector no son lo mismo. El pole vector es la idea y la conexión: la rodilla apunta hacia un objeto (se crea con Constrain → Pole Vector). El locator es solo ese objeto: una cruz sin geometría que se mueve con la herramienta Mover; es lo que en el trabajo diario se llama "el control del pole vector". Se puede usar una curva (círculo, flecha, cono) en su lugar y funciona igual; aquí se usa un locator porque es lo más simple de crear (Create → Locator), y va delante de la rodilla.`));
add(paso('Paso 33', 'Delante de la rodilla y congelado', A.locFrenteN, 'Locator delante de la rodilla', 'Mover hasta (12 · 50 · 40) · Freeze',
`Mismo método que el control del pie, sin grupo: se mueve el locator hasta delante de la rodilla (en mi prueba 12, 50 y 40, a la misma altura de la rodilla y unos 40 hacia adelante) y se hace Modify → Freeze Transformations. Nombre del locator: pv_rodilla_L.`));
add(paso('Paso 34', 'Primero el locator, después el IK', A.selLocN, 'Selección del locator y del IK handle', 'El último que se selecciona recibe la orden',
`El orden importa: primero el locator (el que manda) y de último ik_pierna_L (el que obedece). En el Outliner, Ctrl para sumar. Esta es la regla de todos los constraints.`));
add(paso('Paso 35', 'Constrain → Pole Vector', A.menuPV, 'Menú Constrain, Pole Vector', 'Constrain → Pole Vector',
`Con las dos cosas seleccionadas: Constrain → Pole Vector.`));
add(paso('Paso 36', 'El constraint cuelga del IK Handle', A.pvCreadoN, 'Pole vector creado', 'ik_pierna_L_poleVectorConstraint1',
`En el Outliner aparece ik_pierna_L_poleVectorConstraint1 dentro de ik_pierna_L. La línea que une la rodilla con el locator no se ve en este layout.`));
add(paso('Paso 37', 'Locator al frente: la rodilla al frente', A.pv35aN, 'Rodilla apuntando al frente', 'Para probarlo, levantar el pie',
`Con la pierna estirada el pole vector casi no se nota porque la rodilla casi no se dobla. Por eso la prueba se hace con el pie levantado (en mi prueba subí el control del pie 22 unidades en Translate Y). Con el locator al frente, la rodilla apunta al frente.`));
add(paso('Paso 38', 'Locator al costado: la rodilla afuera', A.pv35bN, 'Rodilla apuntando hacia afuera', 'Mover el locator mueve la rodilla',
`Con el locator al costado de la pierna, la rodilla apunta hacia afuera. Devolver el locator y el pie a cero al terminar. El pole vector del codo es el mismo procedimiento, con el locator detrás del codo en lugar de delante.`));
add(texto(`<div class="pequeno">En el codo es igual </div>
Locator <span class="resaltar">detrás</span> del codo, <br>
y <span class="resaltar2">Pole Vector</span>`,
`Solo cambia el sitio: el codo se dobla hacia atrás, así que el locator va detrás. En la escena de referencia (cuerpo_rig_prueba.ma) está hecho para los dos brazos y las dos piernas.`));
add(meme('"rodilla hacia adentro: es un rig para películas de terror"'));

// ---------- opcional, taller y entrega ----------
add(bloque('OPCIONAL, TALLER Y ENTREGA'));
add(texto(`<div class="pequeno">Opcional </div>
<span class="resaltar">El puño</span> <br>
mismo método: un atributo y <span class="resaltar2">Set Driven Key</span>
<div class="pequeno">Si lo quieren, lo explico </div>`,
`Opcional, solo si los estudiantes lo piden. Mismo método que el Roll: un atributo (por ejemplo Puño, de 0 a 10) en un control de la mano y Set Driven Key sobre la rotación de los joints de los dedos. No lo probé en el modelo; sin capturas.`));
add(texto(`<div class="pequeno">Taller </div>
Que su personaje <span class="resaltar">pueda dar un paso</span>: <br>
<span class="resaltar2">los dos pies con Roll</span> <br>
y <span class="resaltar">las rodillas bien dirigidas</span>`,
`Taller sobre el modelo de cada uno. La meta, sin pasos: el pie izquierdo ya lo hicieron con la clase; ahora el derecho (para el derecho, elegir los joints desde el Outliner porque en vista lateral se superponen con los del izquierdo), con su Roll y su pole vector. Quien termine temprano: pole vector del codo, o el puño.`));
add(meme('"a trabajar"'));
add(texto(`<div class="pequeno">Entrega </div>
Escena guardada y <span class="resaltar">un pantallazo de las cuatro poses</span> del Roll <br>
<div class="pequeno">Sin borrar el historial </div>`,
`Condición de entrega: no borrar el historial (ni Delete by Type → History). Borrarlo sobre una malla con skin puede quitar el vínculo con los joints. Guardar con Save Scene Incremental.`));

// ---------- ensamblado con la plantilla de la clase 10 ----------
const base = fs.readFileSync(PLANTILLA, 'utf8');
const iniSlides = base.indexOf('<div class="slides">');
const cierre = base.indexOf('<!-- ===================== CIERRE FIJO');
if (iniSlides < 0 || cierre < 0) { throw new Error('No encuentro los marcadores de la plantilla clase-10.html'); }
let cabecera = base.slice(0, iniSlides + '<div class="slides">'.length);
cabecera = cabecera.replace('Diseño para 3D — Clase 10', 'Diseño para 3D — Clase 12');
// quita el comentario de plan de la clase 10 y pone el de la clase 11
cabecera = cabecera.replace(/<!-- ={5,}[\s\S]*?={5,} -->/, `<!-- =====================================================================================
         PLAN DEL PROFESOR: Clase 12, rig del cuerpo (repetición y ampliación de la clase 11; la guía de rigging contó como la primera).
         El repaso (patrón de 4 pasos, regla del rig, cuerpo completo, Mirror Joint, Parent y skin) lo dice el profesor
         en voz alta: la presentación empieza directo en lo difícil. La primera hora puede ser de correcciones (descargar
         el modelo y empezar desde las escenas por pasos). Orden: el pie paso a paso (A a F), pole vector (G),
         puño opcional, taller y entrega. Pendiente: bloque de curvas y constraints al inicio.
         Capturas reales de Maya 2027 en assets/imagenes/diseno-3d/rig-cuerpo/. Las diapositivas dicen la meta;
         el detalle de menús y valores va en las notas del orador (tecla S).
         Escenas de apoyo en ejemplos/diseno-3d/cuerpo/escenas/. Generador: docs/gen-clase-diseno3d-12.js.
    ===================================================================================== -->`);
const cola = base.slice(cierre);
const html = cabecera + '\n\n' + S.join('\n') + '\n' + cola.replace(/^/, '        ');
fs.writeFileSync(SALIDA, html);
console.log('clase-12.html generada:', (html.match(/<section/g) || []).length, 'diapositivas,', Object.keys(A).length, 'imagenes copiadas');
