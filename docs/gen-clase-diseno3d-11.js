// gen-clase-diseno3d-11.js - genera materias/diseno-3d/clase-11.html (rig del cuerpo: el pie, foot roll y pole vector).
// Uso: node docs/gen-clase-diseno3d-11.js   (copia las capturas aprobadas a assets/imagenes/diseno-3d/rig-cuerpo/)
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const ORIGEN_IMG = path.join(RAIZ, 'ejemplos/diseno-3d/cuerpo/borrador/img');
const DESTINO_IMG = path.join(RAIZ, 'assets/imagenes/diseno-3d/rig-cuerpo');
const PLANTILLA = path.join(RAIZ, 'materias/diseno-3d/clase-10.html');
const SALIDA = path.join(RAIZ, 'materias/diseno-3d/clase-11.html');
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
const paso = (etiqueta, titulo, imagen, alt, pie, nota, estilo) => sec(
  `          <div class="pequeno">${etiqueta} </div>\n          <div class="paso-titulo">${titulo}</div>\n          <img class="captura"${estilo ? ` style="${estilo}"` : ''} src="${imagen}" alt="${alt}">\n          <div class="pequeno">${pie} </div>`, nota);
const bloque = (t) => `\n        <!-- ================================= ${t} ================================= -->\n\n`;

const S = [];
const add = (x) => S.push(x);

// ---------- portada ----------
add(`        <section>
          <ul class="listasordenadas">
            <div class="subtitulo"> Diseño para 3D </div>
            <li> Semestre 5 · Clase 11 </li>
            <li> Rig del cuerpo: el pie y el foot roll </li>
          </ul>
        </section>
`);
add(neon('Rig del cuerpo'));

add(texto(`<div class="pequeno">Ya vimos </div>
<span class="resaltar">Joints</span>, <span class="resaltar2">FK</span>, <span class="resaltar">skin</span> e <span class="resaltar2">IK</span>
<div class="pequeno">Hoy: el cuerpo completo y el pie </div>`,
`Repaso corto y espacio para dudas. Quien no haya terminado el brazo derecho de la guía lo termina ahora mientras los demás repasan. La guía contó como la primera clase del cuerpo: hoy se continúa con el cuerpo completo (escena modelo_completo.ma) y se agregan el pie con foot roll y el pole vector.`));
add(meme('"a ver, ¿quién sí terminó el brazo?"'));

add(texto(`<div class="pequeno">Todo rig sigue el mismo orden </div>
<span class="resaltar">1 Joints</span> → <span class="resaltar2">2 Skin</span> → <span class="resaltar">3 Controles</span> → <span class="resaltar2">4 Conexión</span>
<div class="pequeno">Hoy lo repetimos con el cuerpo y el pie </div>`,
`Esta es la idea para organizar todo lo de hoy: cada parte del cuerpo se hace igual. Joints: el esqueleto. Skin: pegar la malla. Controles: curvas que mueve el animador en vez de los joints. Conexión: constraints o IK para que el control mueva al joint. Con el brazo ya lo vieron; hoy repiten el patrón con la columna, las piernas y el pie.`));

add(texto(`<div class="pequeno">La regla de todo rig </div>
Se puede <span class="resaltar">mover</span>, <span class="resaltar2">rotar</span> y <span class="resaltar">escalar</span> <br>
sin que <span class="resaltar2">se rompa</span>
<div class="pequeno">Un control global manda sobre todo </div>`,
`Esta regla la tiene que cumplir cualquier rig. Cómo se logra, con la jerarquía que probé en Maya: (1) un control global (ctrl_global) que es el padre del esqueleto y de todos los controles, IK y pole vectors; (2) la malla va aparte, fuera del control global (si no, se transforma dos veces); el skin la hace seguir a los joints; (3) cada control tiene un grupo encima (el grupo offset) para que sus valores queden en cero; (4) la escala de los controles está bloqueada, y la del control global es un solo valor (X, Y y Z juntos). Prueba hecha en el rig completo con el cuerpo en pose: mover, rotar y escalar el control global de seis formas dio error 0,0000 cm en joints y malla. Lo que no probé: giros de más de 180° en los controles del pie y pole vectors, y Maya 2022 a 2025.`));
add(texto(`<div class="pequeno">Orden de la escena </div>
<span class="resaltar">personaje</span> <br>
<span class="resaltar2">geo_GRP</span> (la malla) · <span class="resaltar">ctrl_global</span> <br>
dentro: <span class="resaltar2">esqueleto_GRP</span> y <span class="resaltar">controles_GRP</span>`,
`Árbol del rig de referencia (escena cuerpo_rig_prueba.ma, solo para el profesor): personaje > geo_GRP > Modelo; personaje > ctrl_global > esqueleto_GRP (cadera_JNT y todos los joints) y controles_GRP (controles con su grupo offset, IK handles, pole vectors). Hoy no hace falta armarlo completo: se explica la idea y se va armando al final. Lo que sí deben respetar desde ya: nada de valores sueltos en los controles (se mueve el grupo, no el círculo) y no tocar la malla.`));
add(meme('"un rig que se rompe cuando lo escalas"'));

// ---------- cuerpo completo ----------
add(bloque('CUERPO COMPLETO (lo explica el profesor en vivo; sin capturas)'));
add(neon('Cuerpo completo'));
add(texto(`<div class="pequeno">Se parte desde la cadera </div>
<span class="resaltar">Cadera</span> → <span class="resaltar2">columna</span> → <span class="resaltar">cuello</span> → <span class="resaltar2">cabeza</span> <br>
y de la cadera salen <span class="resaltar">las piernas</span>
<div class="pequeno">Pocos joints en la columna </div>`,
`Sin capturas: lo explica el profesor en vivo con modelo_completo.ma. En mi prueba usé cadera, tres joints de columna y pecho, cuello y cabeza; los brazos cuelgan del pecho (clavícula, hombro, codo, muñeca, mano) y las piernas de la cadera (muslo, rodilla, tobillo, bola, punta). Esos valores no son obligatorios: cualquier ubicación aproximada que quede dentro de la malla sirve.`));
add(texto(`<div class="pequeno">Un lado y se refleja </div>
Una pierna y un brazo, <br>
el otro lado con <span class="resaltar">Mirror Joint</span>
<div class="pequeno">Skeleton → Mirror Joint (plano YZ, Behavior) </div>`,
`Probado en Maya 2027: con el muslo seleccionado, Skeleton → Mirror Joint con el plano YZ y Mirroring Function en Behavior crea la pierna derecha como hija de la misma cadera. Lo mismo con la clavícula. Los nombres: reemplazar _L_ por _R_ en las opciones (Search for / Replace with).`));
add(texto(`<div class="pequeno">Parent </div>
Primero el <span class="resaltar">hijo</span>, luego el <span class="resaltar2">padre</span>: <span class="resaltar">P</span> <br>
<span class="resaltar2">Shift + P</span> los separa
<div class="pequeno">Edit → Parent · Edit → Unparent </div>`,
`Corrección importante para no equivocarse en vivo: P junta (hace parent) y Shift+P separa (unparent). Para colgar la pierna de la cadera: seleccionar el joint del muslo, después la cadera, y pulsar P. Si se crea la pierna con la cadera seleccionada, ya queda como hija sin tener que hacer parent.`));
add(texto(`<div class="pequeno">Skin de todo el cuerpo </div>
<span class="resaltar">Closest distance</span> <br>
y corregir <span class="resaltar2">hombro, cadera y rodilla</span>
<div class="pequeno">Skin → Bind Skin </div>`,
`Una sola malla y todos los joints en un mismo Bind Skin, con Bind method en Closest distance (en la guía quedó igual porque con joints puestos a ojo Heat Map falla). Con el skin automático el cuerpo ya se mueve; el pulido de pesos se deja como mejora.`));
add(meme('"Mirror Joint, el mejor amigo del perezoso"'));

// ---------- el pie ----------
add(bloque('EL PIE'));
add(neon('El pie'));
add(paso('Lo que vamos a lograr', 'Un solo número mueve el pie', A.poses, 'Cuatro posiciones del foot roll',
  'Roll en -10, 0, 5 y 10',
`Meta del bloque: un atributo llamado Roll en el control del pie que mueva, con un solo número, el talón, la bola y la punta. -10 apoya el talón y sube la punta; 0 es el pie plano; 5 sube el talón con la bola apoyada; 10 deja el pie sobre la punta. En las capturas de este bloque las dos piernas se ven superpuestas porque la vista es lateral: es normal. Con la cadera fija la rodilla se dobla bastante al subir el talón; en una animación se baja el control de la cadera.`, 'max-height:66vh;'));
add(texto(`<div class="pequeno">El pie rueda sobre tres puntos </div>
<span class="resaltar">Talón</span> · <span class="resaltar2">bola</span> · <span class="resaltar">punta</span>
<div class="pequeno">Cada punto es el pivote de un grupo </div>`,
`Idea central. Un grupo gira alrededor de su pivote, y todo lo que tiene adentro gira con él. Entonces: un grupo con el pivote en el talón (levanta la punta), uno con el pivote en la punta (sube el talón y apoya el pie en los dedos), uno con el pivote en la bola (sube el talón con los dedos apoyados) y uno para doblar los dedos. Los IK van dentro de los grupos para que los joints sigan el movimiento.`));
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

add(bloque('C. CUATRO GRUPOS Y SUS PIVOTES'));
add(paso('Paso 9', 'Un grupo vacío', A.menuGroup, 'Menú Edit, Group', 'Ctrl + G sin nada seleccionado',
`Con nada seleccionado, Ctrl+G (Edit → Group) crea un grupo vacío. Hacer cuatro y nombrarlos: grp_talon_L, grp_punta_L, grp_bola_L y grp_dedos_L.`));
add(paso('Paso 10', 'Cuatro grupos', A.grupos, 'Cuatro grupos vacíos en el Outliner', 'Todavía sin nada adentro',
`Los cuatro grupos quedan sueltos en el Outliner, al lado de los IK.`));
add(paso('Paso 11', 'El pivote nace en el origen', A.pivOrigen, 'Pivote del grupo en el origen', 'Hay que llevarlo al talón',
`Todo grupo nuevo tiene su pivote en el origen del mundo. Con el grupo seleccionado se entra al modo pivote con la tecla D. El punto amarillo de la captura marca dónde está el pivote (en Maya se ve el manipulador del pivote). Para ubicarlo con precisión: tecla V mantenida pega el pivote al punto más cercano (el vértice del talón, el de la punta o el joint de la bola). Ojo: en mis pruebas puse los valores por comando, no lo hice arrastrando con V.`));
add(paso('Paso 12', 'Pivote del talón', A.pivTalon, 'Pivote en el talón', 'grp_talon_L',
`El pivote del grupo del talón, en la parte de atrás del talón, a la altura del suelo. En vista lateral basta: el giro es sobre el eje X y no depende de qué tan a un lado quede el pivote.`));
add(paso('Paso 13', 'Pivote de la punta', A.pivPunta, 'Pivote en la punta', 'grp_punta_L',
`El pivote del grupo de la punta, en el extremo de los dedos, a la altura del suelo.`));
add(paso('Paso 14', 'Pivote de la bola', A.pivBola, 'Pivote en la bola del pie', 'grp_bola_L y grp_dedos_L comparten pivote',
`grp_bola_L y grp_dedos_L llevan el pivote en el joint de la bola.`));
add(paso('Paso 15', 'Los grupos se anidan', A.anidados, 'Grupos anidados en el Outliner', 'talón > punta > bola, y dedos dentro de punta',
`Para anidar: seleccionar el hijo, luego el padre y P. Orden de afuera hacia adentro: grp_talon_L contiene a grp_punta_L, y grp_punta_L contiene a grp_bola_L y a grp_dedos_L.`));
add(paso('Paso 16', 'Los IK entran en los grupos', A.ikEnGrupos, 'IK dentro de los grupos', 'Pierna y bola en grp_bola_L · punta en grp_dedos_L',
`ik_pierna_L e ik_bola_L dentro de grp_bola_L. ik_punta_L dentro de grp_dedos_L. Por eso, al girar un grupo, todo lo que lleva dentro gira con él.`));
add(meme('"los grupos como muñecas rusas"'));

add(bloque('D. EL CONTROL DEL PIE'));
add(paso('Paso 17', 'Una curva para mover el pie', A.menuCircle, 'Menú Create, NURBS Primitives, Circle', 'Create → NURBS Primitives → Circle',
`El control es un círculo NURBS. Abrir las opciones con el cuadrito de la derecha.`));
add(paso('Paso 18', 'Eje Y y radio 12', A.optCircle, 'Opciones del círculo NURBS', 'Normal axis en Y (1) · Radius 12 (2)',
`Normal axis en Y para que el círculo quede acostado sobre el suelo, y Radius en 12 para que rodee el pie.`));
add(paso('Paso 19', 'El círculo nace en el origen', A.circulo, 'Círculo en el origen', 'Hay que llevarlo al pie',
`El círculo aparece en el origen, entre los dos pies. Renombrarlo ctrl_pie_L.`));
add(paso('Paso 20', 'Un grupo encima: el grupo offset', A.offset, 'Círculo dentro de su grupo offset', 'ctrl_pie_L_OFF',
`Con el círculo seleccionado, Ctrl+G y nombre ctrl_pie_L_OFF. Así el círculo se queda en cero y el grupo es el que se mueve. Esto es lo que permite volver a la pose inicial en cualquier momento y cumple la regla del rig.`));
add(paso('Paso 21', 'Se mueve el grupo, no el círculo', A.offMovido, 'Grupo movido al pie', 'Translate del grupo: 16.6 · 0.5 · 3',
`Mover el grupo ctrl_pie_L_OFF para que el círculo rodee el pie. Los valores de mi prueba fueron 16,6, 0,5 y 3 (más o menos; no hace falta que sean esos). El círculo es un poco más corto que el pie y la punta de los dedos queda ligeramente fuera: es normal.`));
add(paso('Paso 22', 'El círculo conserva todo en cero', A.ctrlCero, 'Channel Box del círculo en cero', 'Translate y Rotate en 0 · Scale en 1',
`Revisión: seleccionar el círculo y mirar el Channel Box. Translate y Rotate en 0, Scale en 1.`));
add(paso('Paso 23', 'Los grupos entran en el control', A.menuParent, 'Menú Edit, Parent', 'Edit → Parent (P)',
`Seleccionar grp_talon_L, luego ctrl_pie_L y pulsar P (Edit → Parent). Recordar: P junta, Shift+P separa.`));
add(paso('Paso 24', 'Esta es la jerarquía', A.jerarquia, 'Jerarquía del control del pie', 'ctrl_pie_L_OFF > ctrl_pie_L > grupos',
`Resultado: ctrl_pie_L_OFF contiene a ctrl_pie_L, que contiene a grp_talon_L y todo lo que ya estaba dentro. Ahora mover el círculo mueve todo el pie.`));
add(meme('"mover el control y que el pie siga: se siente como magia"'));

add(bloque('E. EL ATRIBUTO ROLL'));
add(paso('Paso 25', 'Add Attribute', A.menuAttr, 'Menú Modify, Add Attribute', 'Modify → Add Attribute…',
`Con el círculo (ctrl_pie_L) seleccionado: Modify → Add Attribute…`));
add(paso('Paso 26', 'Roll: de -10 a 10', A.winAttr, 'Ventana Add Attribute', 'Roll · Float · Keyable · -10 a 10',
`Long name: Roll. Make attribute: Keyable. Data Type: Float. Minimum -10, Maximum 10, Default 0. Botón OK. En mi prueba se creó con el botón OK de la ventana.`));
add(paso('Paso 27', 'Roll ya está en el Channel Box', A.cbRoll, 'Channel Box con Roll', 'Todavía no mueve nada',
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
  <tr><td class="resaltar" style="padding:0.4vw 1.6vw;">Talón</td><td>-30</td><td>0</td><td>sin clave</td><td>0</td></tr>
  <tr><td class="resaltar2" style="padding:0.4vw 1.6vw;">Bola</td><td>0</td><td>0</td><td>30</td><td>0</td></tr>
  <tr><td class="resaltar" style="padding:0.4vw 1.6vw;">Punta</td><td>0</td><td>0</td><td>0</td><td>60</td></tr>
</table>
<div class="pequeno">Una clave (botón Key) por casilla </div>`,
`Valores que verifiqué en Maya (grados). Talón: Roll -10 vale -30, Roll 0 vale 0, Roll 10 vale 0 (no tiene clave en 5). Bola: Roll -10 vale 0, 0 vale 0, 5 vale 30, 10 vale 0. Punta: Roll -10 vale 0, 0 vale 0, 5 vale 0, 10 vale 60. Los signos dependen de que el pie mire hacia +Z (el modelo mira a +Z). Si el pie de algún estudiante mira a otro lado, los signos se invierten.`));
add(paso('Paso 31', 'Probar el Roll', A.poses, 'Cuatro posiciones del Roll', 'Mover Roll en el Channel Box',
`Seleccionar ctrl_pie_L y mover Roll en el Channel Box: -10, 0, 5 y 10. Medí el tobillo, la bola y la punta con estos valores: a Roll 5 la bola y la punta se quedan en el suelo mientras el talón sube. Si algo gira al revés, revisar el signo de los valores del grupo correspondiente.`, 'max-height:66vh;'));
add(meme('"cuando el Roll por fin funciona"'));

add(bloque('G. POLE VECTOR'));
add(paso('Paso 32', 'Un locator delante de la rodilla', A.menuLoc, 'Menú Create, Locator', 'Create → Locator',
`Locator y pole vector no son lo mismo. El pole vector es la idea y la conexión: la rodilla apunta hacia un objeto (se crea con Constrain → Pole Vector). El locator es solo ese objeto: una cruz sin geometría que se mueve con la herramienta Mover; es lo que en el trabajo diario se llama "el control del pole vector". Se puede usar una curva (círculo, flecha, cono) en su lugar y funciona igual; aquí se usa un locator porque es lo más simple de crear (Create → Locator), y va delante de la rodilla.`));
add(paso('Paso 33', 'Con grupo offset, igual que el control', A.locFrente, 'Locator delante de la rodilla', 'pv_rodilla_L_OFF: 12 · 50 · 40',
`Mismo método que el control del pie: locator, Ctrl+G, y se mueve el grupo (pv_rodilla_L_OFF) hasta delante de la rodilla. En mi prueba: 12, 50 y 40. Nombre del locator: pv_rodilla_L.`));
add(paso('Paso 34', 'Primero el locator, después el IK', A.selLoc, 'Selección del locator y del IK handle', 'Orden de selección',
`El orden importa: primero el locator y luego ik_pierna_L (en el Outliner, Ctrl para sumar).`));
add(paso('Paso 35', 'Constrain → Pole Vector', A.menuPV, 'Menú Constrain, Pole Vector', 'Constrain → Pole Vector',
`Con las dos cosas seleccionadas: Constrain → Pole Vector.`));
add(paso('Paso 36', 'El constraint cuelga del IK Handle', A.pvCreado, 'Pole vector creado', 'ik_pierna_L_poleVectorConstraint1',
`En el Outliner aparece ik_pierna_L_poleVectorConstraint1 dentro de ik_pierna_L. La línea que une la rodilla con el locator no se ve en este layout.`));
add(paso('Paso 37', 'Locator al frente: la rodilla al frente', A.pv35a, 'Rodilla apuntando al frente', 'Para probarlo, levantar el pie',
`Con la pierna estirada el pole vector casi no se nota porque la rodilla casi no se dobla. Por eso la prueba se hace con el pie levantado (en mi prueba subí el control del pie 22 unidades en Translate Y). Con el locator al frente, la rodilla apunta al frente.`));
add(paso('Paso 38', 'Locator al costado: la rodilla afuera', A.pv35b, 'Rodilla apuntando hacia afuera', 'Mover el locator mueve la rodilla',
`Con el locator al costado de la pierna, la rodilla apunta hacia afuera. Devolver el locator y el pie a cero al terminar. El pole vector del codo es el mismo procedimiento, con el locator detrás del codo en lugar de delante.`));
add(texto(`<div class="pequeno">En el codo es igual </div>
Locator <span class="resaltar">detrás</span> del codo, <br>
grupo offset y <span class="resaltar2">Pole Vector</span>`,
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
cabecera = cabecera.replace('Diseño para 3D — Clase 10', 'Diseño para 3D — Clase 11');
// quita el comentario de plan de la clase 10 y pone el de la clase 11
cabecera = cabecera.replace(/<!-- ={5,}[\s\S]*?={5,} -->/, `<!-- =====================================================================================
         PLAN DEL PROFESOR: Clase 11, rig del cuerpo (segunda clase del cuerpo; la guía de rigging contó como la primera).
         Se continúa con el cuerpo completo (escena modelo_completo.ma) y se agregan el pie con foot roll y el
         pole vector. Orden: dudas y brazo derecho, patrón de 4 pasos y regla del rig, cuerpo completo (sin capturas,
         lo explica el profesor), el pie paso a paso (A a F), pole vector (G), puño opcional, taller y entrega.
         Capturas reales de Maya 2027 en assets/imagenes/diseno-3d/rig-cuerpo/. Las diapositivas dicen la meta;
         el detalle de menús y valores va en las notas del orador (tecla S).
         Escenas de apoyo en ejemplos/diseno-3d/cuerpo/escenas/. Generador: docs/gen-clase-diseno3d-11.js.
    ===================================================================================== -->`);
const cola = base.slice(cierre);
const html = cabecera + '\n\n' + S.join('\n') + '\n' + cola.replace(/^/, '        ');
fs.writeFileSync(SALIDA, html);
console.log('clase-11.html generada:', (html.match(/<section/g) || []).length, 'diapositivas,', Object.keys(A).length, 'imagenes copiadas');
