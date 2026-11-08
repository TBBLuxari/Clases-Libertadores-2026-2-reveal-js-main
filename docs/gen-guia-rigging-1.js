// Genera la guía para estudiantes "Rigging para dummies" (Diseño para 3D, guía 1: joints, FK, skin e IK básico) sobre un brazo del modelo humanoide.
// Uso: node docs/gen-guia-rigging-1.js        -> escribe ejemplos/diseno-3d/rigging/guia-rigging-1.html y .pdf
// Las capturas salen de Downloads/scriptsmaya/rig_*.py (carpeta rigging/img; los menús son m_*.png de rig_81_menus.py y rig_131).
// Si el PDF está abierto, ciérralo antes.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = path.join(__dirname, '..', 'ejemplos', 'diseno-3d', 'rigging');
const css = fs.readFileSync(path.join(__dirname, 'guia.css'), 'utf8');
const html = path.join(dir, 'guia-rigging-1.html');
const pdf = process.env.PDF_OUT ? path.resolve(process.env.PDF_OUT) : path.join(dir, 'guia-rigging-1.pdf');

const extra = `
  :root{
    --accent:#1f3a5f; --accent-soft:#e9eef5; --text:#1d2733; --muted:#5a6572; --line:#cfd6df; --soft:#f4f6f9;
    --sans:"Segoe UI","Helvetica Neue",Arial,sans-serif;
    --serif:Georgia,"Times New Roman",serif;
    --mono:Consolas,"Cascadia Mono",monospace;
  }
  body{font-size:10.5pt;line-height:1.5;}
  h1{font-family:var(--serif);font-size:27pt;font-weight:700;letter-spacing:0;line-height:1.1;margin:0 0 4px;color:#14273f;}
  h2,h3{font-family:var(--sans);}
  h2{font-size:14.5pt;font-weight:600;}
  h3{font-size:11.5pt;font-weight:600;color:#14273f;margin:12px 0 3px;break-after:avoid;}
  .eyebrow{font-family:var(--sans);font-size:9.5pt;font-weight:600;letter-spacing:.08em;color:var(--accent);}
  .sub{font-family:var(--sans);font-size:12pt;color:var(--muted);}
  th{font-family:var(--sans);font-weight:600;font-size:9.5pt;}
  td.n{font-family:var(--sans);}
  .box .t{font-family:var(--sans);font-weight:700;font-size:9pt;letter-spacing:.07em;}
  .dlg{display:block;width:62%;border:1px solid var(--line);border-radius:6px;margin:6px 0 4px;}
  .tool{display:block;width:52%;border:1px solid var(--line);border-radius:6px;margin:6px 0 4px;}
  .mimg{display:block;border:1px solid var(--line);border-radius:6px;margin:6px 0 4px;}
  .fila{display:flex;gap:14px;align-items:flex-start;}
  .cap{font-size:9.5pt;color:var(--muted);margin:0 0 8px;font-family:var(--sans);}
  code{font-family:var(--mono);font-size:9.3pt;background:var(--soft);border:1px solid var(--line);border-radius:3px;padding:0 4px;}
  kbd{font-family:var(--sans);font-size:9.3pt;font-weight:600;background:#fff;border:1px solid #9aa6b2;border-bottom-width:2px;border-radius:4px;padding:0 6px;}
  .menu{font-family:var(--sans);font-size:10pt;font-weight:600;color:var(--accent);background:var(--accent-soft);border-radius:3px;padding:0 4px;}
  h2.sec{border-bottom:2px solid var(--accent);padding-bottom:2px;margin:12px 0 6px;display:flex;gap:10px;align-items:baseline;color:#14273f;}
  .min{font-family:var(--sans);font-size:9pt;font-weight:600;color:var(--accent);background:var(--accent-soft);border:1px solid #b7c5d9;border-radius:99px;padding:0 9px;margin-left:auto;}
  .pagina{break-before:page;}
  ol.pasos{padding-left:22px;} ol.pasos li{margin-bottom:5px;}
  .idea{font-size:11pt;margin:3px 0;}
  .fig{break-inside:avoid;}
  table.err td:first-child{width:38%;font-weight:600;}
  .box.ok{background:#edf5f1;border-color:#2f7d62;} .box.ok .t{color:#1f6b52;}
  .box.warn{background:#fbf4e1;border-color:#d6b85a;} .box.warn .t{color:#7a5a00;}
  .box.photo{background:#e9eef5;border-color:var(--accent);} .box.photo .t{color:var(--accent);}
  .box.big{background:#fbeceb;border:2px solid #b3352b;} .box.big .t{color:#8f2119;}
  .familia{display:flex;align-items:center;gap:6px;margin:6px 0 4px;font-family:var(--sans);font-size:10pt;}
  .familia span{border:1px solid var(--accent);background:var(--accent-soft);border-radius:6px;padding:3px 10px;font-weight:600;color:#14273f;}
  .familia i{font-style:normal;color:var(--accent);font-weight:700;}
  .familia small{color:var(--muted);font-weight:400;display:block;font-size:8.5pt;}
  table.val td{font-variant-numeric:tabular-nums;}
`;

const sec = (titulo, min) => `<h2 class="sec"><span>${titulo}</span>${min ? `<span class="min">~${min} min</span>` : ''}</h2>`;
// Recortes (x, y, ancho, alto, % de ancho de página) sobre las capturas de 1920x1009 para que el texto se lea en el PDF
const CROP = {
  '01_ventana.png': [0, 0, 1920, 890, 100],
  '02_pivote_centro.png': [400, 340, 1240, 300, 100],
  '03_pivote_codo.png': [400, 340, 1240, 300, 100],
  '04_gira_sin_padre.png': [400, 170, 1240, 520, 100],
  '05_con_jerarquia.png': [40, 130, 1600, 520, 100],
  '06_joints_creados.png': [40, 130, 1600, 520, 100],
  '07_ejes_locales.png': [400, 380, 1240, 280, 100],
  '08_fk_sin_skin.png': [400, 130, 1500, 500, 100],
  '10_skin_doblado.png': [400, 260, 1500, 500, 100],
  '11_pesos_pintar.png': [400, 360, 1240, 300, 100],
  '13_ik_handle.png': [40, 130, 1500, 560, 100],
  '14_ik_mover.png': [40, 130, 1860, 600, 100],
  '15_ik_blend_fk.png': [40, 130, 1860, 600, 100],
  'A1_marco.png': [400, 130, 1240, 750, 78],
};
const img = (f, cap) => {
  const [x, y, w, h, pct] = CROP[f];
  const W = 1920, H = 1009;
  return `<div class="fig"><div style="position:relative;overflow:hidden;width:${pct}%;padding-bottom:${(h / w * pct).toFixed(3)}%;border:1px solid var(--line);border-radius:6px;margin:6px 0 4px;">
    <img src="img/${f}" style="position:absolute;width:${(W / w * 100).toFixed(3)}%;left:${(-x / w * 100).toFixed(3)}%;top:${(-y / h * 100).toFixed(3)}%;max-width:none;">
  </div><p class="cap">${cap}</p></div>`;
};
// Captura de un menú o de una ventana: el ancho en la hoja sale del ancho real de la imagen
const pngAncho = f => fs.readFileSync(path.join(dir, 'img', f)).readUInt32BE(16);
const menu = (f, cap, max = 72) => {
  const pct = Math.min(max, Math.round(pngAncho(f) * 0.105));
  return `<div class="fig"><img class="mimg" src="img/${f}" style="width:${pct}%"><p class="cap">${cap}</p></div>`;
};
const ancha = (f, cap, pct = 100) => `<div class="fig"><img class="mimg" src="img/${f}" style="width:${pct}%"><p class="cap">${cap}</p></div>`;
const menu2 = (f1, cap1, f2, cap2) => {
  const w1 = pngAncho(f1), w2 = pngAncho(f2), tot = w1 + w2;
  return `<div class="fila"><div class="fig" style="width:${(w1 / tot * 96).toFixed(1)}%"><img class="mimg" src="img/${f1}" style="width:100%"><p class="cap">${cap1}</p></div>
  <div class="fig" style="width:${(w2 / tot * 96).toFixed(1)}%"><img class="mimg" src="img/${f2}" style="width:100%"><p class="cap">${cap2}</p></div></div>`;
};

const body = `
<div class="wrap">

<p class="eyebrow">DISEÑO PARA 3D · GUÍA 1</p>
<h1>Rigging para dummies</h1>
<p class="sub">Primer rig: joints, FK, skin e IK sobre un brazo de un modelo humanoide.</p>

<div class="box ok">
  <span class="t">CONCEPTOS FUNDAMENTALES</span>
  <p class="idea"><b>1.</b> Un <b>joint</b> es un punto con una orientación propia dentro de una jerarquía. Se <b>rota</b>; rara vez se traslada.</p>
  <p class="idea"><b>2.</b> El <b>skin</b> vincula la malla a los joints. Sin skin, la malla no responde al movimiento de los joints.</p>
  <p class="idea"><b>3.</b> Cuando el resultado no es el esperado, la causa suele estar en la <b>orientación</b> de los joints, en el estado de la malla o en los <b>pesos</b>.</p>
</div>

<table>
  <tr><th>Parte</th><th>Contenido</th><th>Duración</th></tr>
  <tr><td class="n">1</td><td>Preparación de Maya y atajos nuevos</td><td>10 min</td></tr>
  <tr><td class="n">2</td><td>Padres e hijos: jerarquía con piezas sueltas (sin joints)</td><td>20 min</td></tr>
  <tr><td class="n">3</td><td>Creación y orientación de los joints</td><td>25 min</td></tr>
  <tr><td class="n">4</td><td>FK: poses mediante rotación de joints</td><td>10 min</td></tr>
  <tr><td class="n">5</td><td>Skin y pesos</td><td>25 min</td></tr>
  <tr><td class="n">6</td><td>IK: desplazar la mano y que el brazo la siga</td><td>15 min</td></tr>
  <tr><td class="n">7</td><td>Entrega: el brazo derecho del modelo</td><td>45 min</td></tr>
</table>

<div class="box">
  <span class="t">MODELO Y ARCHIVOS DE APOYO</span>
  <p>El modelo es una figura humanoide en T-pose, expresada en centímetros. El personaje mira hacia el frente de la escena (+Z); por eso su brazo <b>izquierdo</b> queda en el lado <b>+X</b> (a la derecha de la pantalla en la vista frontal) y su brazo <b>derecho</b> en el lado <b>−X</b>. La demostración se hace sobre el brazo izquierdo; la entrega, sobre el derecho.</p>
  <p>Carpeta <code>escenas</code> que acompaña esta guía:</p>
  <ul>
    <li><code>modelo_completo.ma</code>: la figura completa.</li>
    <li><code>brazo_piezas.ma</code>: el brazo izquierdo cortado en tres piezas sueltas (parte 2).</li>
    <li><code>brazo_base.ma</code>: el brazo izquierdo como una sola malla (partes 3 a 6).</li>
    <li><code>brazo_derecho_base.ma</code>: el brazo derecho como una sola malla (parte 7, entrega).</li>
    <li><code>brazo_joints.ma</code>, <code>brazo_skin.ma</code>, <code>brazo_ik.ma</code>: estado esperado del brazo izquierdo al terminar las partes 3, 5 y 6. Se consultan <b>solo en caso de bloqueo</b>.</li>
  </ul>
  <p class="small">Las capturas son de Maya 2027. En las versiones 2022 a 2025 los menús y botones son casi idénticos.</p>
</div>

<!-- PARTE 1 -->
<section class="pagina">
${sec('1 · Preparación de Maya', 10)}
<ol class="pasos">
  <li>Abra <code>brazo_base.ma</code>.</li>
  <li>En el selector de la esquina superior izquierda (donde dice <i>Modeling</i>) elija <b>Rigging</b>. Aparecen entonces los menús <b>Skeleton</b>, <b>Skin</b> y <b>Constrain</b>.</li>
</ol>
${img('01_ventana.png', '① Menu set. ② Menús de rigging. ③ Outliner: lista de todo lo que contiene la escena. ④ Visor. ⑤ Channel Box: valores del objeto seleccionado.')}
<p>Casi todo el trabajo se realiza en la vista frontal. En el menú del visor:</p>
${menu('m_front.png', 'Panels ▸ Orthographic ▸ front.')}
<div class="box">
  <span class="t">TRES ATAJOS NUEVOS</span>
  <p><kbd>X</kbd> <b>(mantenida): ajuste a la cuadrícula.</b> Mientras se mantiene pulsada, lo que se arrastra salta de línea en línea de la cuadrícula en lugar de moverse de forma continua. Permite ubicar un elemento en una posición exacta.</p>
  <p><kbd>D</kbd> <b>(mantenida): editar solo el pivote.</b> El pivote es el punto alrededor del cual gira un objeto. Con <kbd>D</kbd> pulsada, el manipulador deja de mover el objeto y mueve únicamente el pivote. Al soltar <kbd>D</kbd>, todo vuelve a la normalidad.</p>
  <p><kbd>P</kbd> <b>: parent.</b> Convierte un objeto en hijo de otro. Se explica en la parte 2.</p>
</div>
</section>

<!-- PARTE 2 -->
<section class="pagina">
${sec('2 · Padres e hijos: la jerarquía', 20)}
<h3>2.1 La relación de padre e hijo (parent)</h3>
<p>En Maya, la relación entre dos objetos puede entenderse como la de un padre y un hijo. A esa relación se le denomina <b>parent</b> (en inglés, “padre”). Un ejemplo cotidiano es un padre que lleva a su hijo de la mano:</p>
<ul>
  <li>Cuando el <b>padre camina</b> (se mueve o se rota), el <b>hijo se desplaza con él</b>.</li>
  <li>Cuando el <b>hijo mueve un brazo</b> o gira sobre sí mismo, el <b>padre no se ve afectado</b>.</li>
  <li>Un hijo puede ser, a su vez, padre de otro objeto: abuelo, padre, hijo, nieto. La estructura de un brazo es un caso típico:</li>
</ul>
<div class="familia"><span>hombro<small>abuelo</small></span><i>▸</i><span>codo<small>padre</small></span><i>▸</i><span>muñeca<small>hijo</small></span><i>▸</i><span>mano<small>nieto</small></span></div>
<p>Al rotar el <b>hombro</b>, se mueve todo el brazo. Al rotar el <b>codo</b>, solo se mueven el antebrazo y la mano. Al rotar la mano, el resto del brazo permanece quieto. Recuerde esta regla: <b>el movimiento se hereda de padres a hijos, nunca al revés</b>.</p>
<p>El <b>Outliner</b> presenta esta familia como un árbol genealógico: los hijos aparecen anidados debajo de su padre.</p>

<div class="box photo">
  <span class="t">PARENT Y CONSTRAINT: DOS RELACIONES DISTINTAS</span>
  <p>En el rigging se usa con frecuencia el término <b>constraint</b> (en inglés, “restricción” o “atadura”). También permite que un objeto <b>siga</b> a otro, pero <b>sin que exista parentesco</b> entre ambos. Un ejemplo es un perro sujeto con una correa: el perro no es hijo del dueño ni pertenece a su “familia” en el Outliner, pero va atado a él y, cuando el dueño se desplaza, lo arrastra.</p>
  <table>
    <tr><th></th><th>Parent</th><th>Constraint</th></tr>
    <tr><td class="n">Imagen</td><td>Un padre que lleva al hijo de la mano</td><td>Un dueño que lleva al perro con una correa</td></tr>
    <tr><td class="n">Relación</td><td>Son familia: se refleja en el Outliner</td><td>No son familia: cada objeto permanece en su sitio de la jerarquía</td></tr>
    <tr><td class="n">Qué se hereda</td><td>Todo: posición, rotación y escala</td><td>Solo lo que se elija (únicamente posición, únicamente rotación, etc.)</td></tr>
    <tr><td class="n">Cómo se deshace</td><td>Con Unparent</td><td>Se puede quitar o regular en cualquier momento (cuánto sigue)</td></tr>
  </table>
  <p class="small">En esta guía solo se utiliza <b>parent</b>. Los constraints se aplican en la clase del cuerpo, para conectar las curvas que el animador manipula (los controles) con los joints.</p>
</div>

<h3>2.2 El pivote y el parent en la práctica</h3>
<p>Abra <code>brazo_piezas.ma</code>: es el mismo brazo izquierdo, cortado en tres piezas (brazo, antebrazo y mano), en vista frontal. Todavía no existe parentesco entre ellas.</p>
<p>Seleccione el antebrazo y active la rotación (<kbd>E</kbd>). El giro se realiza alrededor del <b>pivote</b>, que por defecto está en el centro de la pieza. Un codo no gira por el centro del antebrazo, sino por su extremo.</p>
${img('02_pivote_centro.png', 'El pivote (punto amarillo) está en el centro del antebrazo.')}
<p>Para mover el pivote al codo: mantenga pulsada <kbd>D</kbd>, mantenga también <kbd>X</kbd> y arrastre el pivote hasta el extremo izquierdo del antebrazo. Suelte ambas teclas.</p>
${img('03_pivote_codo.png', 'El pivote ahora está en el codo.')}
<table class="val">
  <tr><th>Pieza</th><th>El pivote debe quedar en</th></tr>
  <tr><td>brazo_sup_GEO</td><td>El hombro</td></tr>
  <tr><td>antebrazo_GEO</td><td>El codo</td></tr>
  <tr><td>mano_GEO</td><td>La muñeca</td></tr>
</table>
<p class="small">Una pequeña diferencia de ubicación no afecta el ejercicio; lo importante es que cada pivote quede en la articulación correspondiente.</p>
</section>

<section>
<h3>2.3 Sin parent, las piezas no se acompañan</h3>
<p>Rote el antebrazo en Z. La mano permanece donde estaba, porque no existe parentesco entre ambas piezas.</p>
${img('04_gira_sin_padre.png', 'La mano no sigue al antebrazo.')}
<h3>2.4 Con parent, sí</h3>
<p>El orden de selección es importante: primero se selecciona al <b>hijo</b> y, de último, al <b>padre</b>.</p>
<ol class="pasos">
  <li>Seleccione la <b>mano</b> (el hijo) y, con <kbd>Shift</kbd>, el <b>antebrazo</b> (el padre). Pulse <kbd>P</kbd>.</li>
  <li>Seleccione el <b>antebrazo</b> (hijo) y, con <kbd>Shift</kbd>, el <b>brazo</b> (padre). Pulse <kbd>P</kbd>.</li>
  <li>Despliegue la jerarquía en el Outliner y rote de nuevo el antebrazo.</li>
</ol>
${menu('m_parent.png', 'La tecla P es el atajo de Edit ▸ Parent. Unparent (Shift+P) deshace la relación.')}
${img('05_con_jerarquia.png', '① Brazo ▸ antebrazo ▸ mano en el Outliner. ② La mano ahora sigue al antebrazo.')}
<div class="box warn">
  <span class="t">LIMITACIÓN</span>
  <p>El método funciona, pero al doblar el codo aparecen huecos entre las piezas. Para que una sola malla continua se doble de forma suave se requieren joints y skin, que se desarrollan a continuación.</p>
</div>
</section>

<!-- PARTE 3 -->
<section class="pagina">
${sec('3 · Creación y orientación de los joints', 25)}
<p>Abra <code>brazo_base.ma</code> (el brazo izquierdo como una sola malla, <code>brazo_GEO</code>) y trabaje en la vista frontal.</p>
<h3>3.1 Crear la cadena</h3>
<p>Una cadena de joints se construye con la misma jerarquía de la parte 2: cada joint nuevo queda como hijo del anterior, de forma automática.</p>
${menu('m_create_joints.png', 'Skeleton ▸ Create Joints.')}
<ol class="pasos">
  <li>Con <b>Create Joints</b> activo, en la vista frontal haga clic, de izquierda a derecha, sobre el centro del brazo en cuatro puntos. Pulse <kbd>Enter</kbd> al terminar.</li>
</ol>
<table class="val">
  <tr><th>Clic</th><th>Joint</th><th>Dónde se ubica</th></tr>
  <tr><td>1</td><td>hombro_JNT</td><td>En la articulación del hombro, donde el brazo se une al torso.</td></tr>
  <tr><td>2</td><td>codo_JNT</td><td>En la articulación del codo, aproximadamente a la mitad del brazo.</td></tr>
  <tr><td>3</td><td>muneca_JNT</td><td>En la articulación de la muñeca, donde termina el antebrazo y comienza la mano.</td></tr>
  <tr><td>4</td><td>mano_JNT</td><td>En el extremo de la mano.</td></tr>
</table>
<ol class="pasos" start="2">
  <li>Asigne nombre a cada joint en el Outliner (doble clic) con los nombres de la tabla.</li>
</ol>
<h3>3.2 Criterios de ubicación</h3>
<p>No se requieren posiciones exactas: cada estudiante obtendrá valores ligeramente distintos según su clic. Basta con respetar estos criterios.</p>
<ul>
  <li><b>Alineación.</b> Los cuatro joints quedan, aproximadamente, a la misma altura, siguiendo el eje del brazo.</li>
  <li><b>Doblez del codo.</b> Ubique el clic del codo <b>ligeramente por debajo</b> de la línea que une el hombro con la muñeca. Un brazo real nunca está perfectamente recto; este doblez mínimo indica a Maya hacia qué lado flexiona el codo y se utilizará en la parte 6.</li>
  <li><b>Dentro de la malla.</b> En la vista lateral (Side) los joints deben quedar dentro del grosor del brazo, cerca de su centro. Si alguno queda fuera, selecciónelo, pulse <kbd>W</kbd> y desplácelo en Z. Al mover el hombro se desplaza toda la cadena, porque los demás joints son sus hijos: es la jerarquía de la parte 2 en acción.</li>
</ul>
${img('06_joints_creados.png', '① Hombro ② Codo ③ Muñeca ④ Mano. ⑤ Cada joint es hijo del anterior.')}
<p class="small">Si la malla impide ver los joints, active el modo transparente del visor:</p>
${menu('m_xray.png', 'Shading ▸ X-Ray.')}
<p class="small">Si los joints se ven demasiado grandes o pequeños:</p>
${menu('m_joint_size.png', 'Display ▸ Animation ▸ Joint Size...')}
</section>

<section>
<h3>3.3 Orientar los joints</h3>
<p>Cada joint tiene sus propios ejes (X, Y, Z). El objetivo es que el <b>eje X apunte al siguiente joint</b> y que el codo flexione alrededor de <b>Z</b>.</p>
<ol class="pasos">
  <li>Seleccione <code>hombro_JNT</code> (el primero de la cadena).</li>
  <li>Abra las opciones de Orient Joint con el cuadrito de la derecha:</li>
</ol>
${menu('m_orient_joint.png', 'Skeleton ▸ Orient Joint ▸ ☐ (el cuadrito marcado en rojo abre las opciones).')}
<ol class="pasos" start="3">
  <li>Configure la ventana como se muestra y pulse <b>Orient</b>.</li>
</ol>
<div class="fig"><img class="dlg" src="img/07a_orient_opciones.png">
<p class="cap">① Orient Joint to World: <b>desmarcado</b>. ② Primary Axis: <b>X</b>. ③ Secondary Axis: <b>Y</b>. ④ Secondary Axis World Orientation: <b>Y</b> (+). ⑤ Auto orient secondary axis: <b>desmarcado</b>. ⑥ Orient children of selected joints: <b>marcado</b>. ⑦ Orient.</p></div>
<ol class="pasos" start="4">
  <li>Seleccione los cuatro joints y active los ejes locales para verificar hacia dónde apunta cada uno:</li>
</ol>
${menu('m_local_axes.png', 'Display ▸ Transform Display ▸ Local Rotation Axes.')}
${img('07_ejes_locales.png', 'El eje X (rojo) de cada joint apunta al siguiente. El eje Z (azul) sale hacia el observador.')}
<div class="box ok">
  <span class="t">VERIFICACIÓN</span>
  <p>En los cuatro joints el <b>eje X rojo</b> debe apuntar hacia la mano. Si alguno apunta en otra dirección, repita <b>Orient Joint</b> con el hombro seleccionado y las opciones indicadas. Al terminar, desactive los ejes locales (mismo menú).</p>
</div>
<p class="small">El resultado debe corresponder al de <code>brazo_joints.ma</code>.</p>
</section>

<!-- PARTE 4 -->
<section class="pagina">
${sec('4 · FK: poses mediante rotación de joints', 10)}
<p><b>FK</b> (Forward Kinematics) es la forma más directa de mover un rig: se rota el hombro, luego el codo y luego la muñeca, <b>de padre a hijo</b>. Es el mismo principio de la parte 2: cada joint arrastra a sus hijos.</p>
<ol class="pasos">
  <li>Seleccione <code>codo_JNT</code>, pulse <kbd>E</kbd> y rote alrededor de Z (o escriba <b>Rotate Z = 50</b> en el Channel Box).</li>
  <li>Repita con <code>hombro_JNT</code> y <code>muneca_JNT</code>. Cree tres poses distintas.</li>
</ol>
${img('08_fk_sin_skin.png', '① Se rota el joint; no se traslada. ② La malla permanece inmóvil: aún no está vinculada.')}
<div class="box warn">
  <span class="t">OBSERVACIÓN</span>
  <p>La malla no se movió porque ningún joint está vinculado a ella. Ese vínculo es el <b>skin</b>.</p>
</div>
<p>Antes de continuar, devuelva los joints a su estado inicial: seleccione los joints y escriba <b>0</b> en Rotate X, Y y Z.</p>
</section>

<!-- PARTE 5 -->
<section class="pagina">
${sec('5 · Skin y pesos', 25)}
<h3>5.1 Vincular la malla</h3>
<div class="box">
  <span class="t">ANTES DE HACER SKIN CON MODELOS PROPIOS</span>
  <p>La malla debe tener los <b>Freeze Transformations</b> aplicados. En <code>brazo_base.ma</code> ya están aplicados.</p>
  ${menu('m_freeze.png', 'Modify ▸ Freeze Transformations.', 50)}
</div>
<div class="box big">
  <span class="t">IMPORTANTE: NO BORRAR EL HISTORIAL</span>
  <p>En ningún momento de esta guía debe ejecutarse <b>Edit ▸ Delete by Type ▸ History</b> ni el botón equivalente del shelf. El rig depende del historial de construcción: al borrarlo sobre una malla con skin, Maya puede eliminar el vínculo con los joints o dejar la deformación dañada.</p>
</div>
<ol class="pasos">
  <li>Seleccione <code>hombro_JNT</code> y, con <kbd>Shift</kbd>, la malla <code>brazo_GEO</code>.</li>
  <li>Abra las opciones de Bind Skin:</li>
</ol>
${menu('m_bind_skin.png', 'Skin ▸ Bind Skin ▸ ☐ (el cuadrito marcado en rojo).')}
<ol class="pasos" start="3">
  <li>En <b>Bind method</b> elija <b>Closest distance</b> y pulse <b>Apply and Close</b>. Este método asigna a cada zona de la malla el joint más cercano, por lo que funciona aunque los joints no estén ubicados con exactitud.</li>
</ol>
<div class="fig"><img class="dlg" src="img/09_bind_opciones.png">
<p class="cap">① Bind method: Closest distance. ② Apply and Close.</p></div>
</section>

<section>
<h3>5.2 Comprobar el resultado</h3>
<p>Rote el codo (Rotate Z = 60) y la muñeca (−20). La malla ahora se deforma junto con los joints.</p>
${img('10_skin_doblado.png', 'La malla sigue al joint. Se observa cómo se suaviza el pliegue del codo.')}
<div class="box warn">
  <span class="t">SI LA MALLA NO SE MUEVE</span>
  <p>Quite el skin, compruebe que se seleccionó el <b>primer joint</b> y la malla, y repita el bind. Para regresar a la pose original utilice Go to Bind Pose.</p>
  ${menu2('m_unbind.png', 'Skin ▸ Unbind Skin.', 'm_bind_pose.png', 'Skin ▸ Go to Bind Pose.')}
</div>
<h3>5.3 Los pesos: qué joint controla cada vértice</h3>
<p>Cada vértice recibe un <b>peso</b> de cada joint cercano (la suma es 1). Un vértice junto al codo puede pertenecer en un 50 % al brazo y en un 50 % al antebrazo, y eso es lo que suaviza el pliegue.</p>
<ol class="pasos">
  <li>Seleccione la malla y abra las opciones de Paint Skin Weights:</li>
</ol>
${menu('m_paint_weights.png', 'Skin ▸ Paint Skin Weights ▸ ☐ (el cuadrito marcado en rojo).')}
<ol class="pasos" start="2">
  <li>En la lista <b>Influences</b> elija un joint. El <b>blanco</b> indica dónde ese joint controla al 100 %; el <b>negro</b>, dónde no controla.</li>
  <li>Pinte con <b>Replace</b>, <b>Add</b> o <b>Smooth</b> (suaviza). El <b>Value</b> es el peso que se aplica.</li>
</ol>
${img('11_pesos_pintar.png', 'Pesos del hombro: blanco donde controla al 100 %, con un degradado alrededor del codo.')}
<div class="fig"><img class="tool" src="img/12_tool_settings.png">
<p class="cap">Ventana Tool Settings del Paint Skin Weights Tool. ① Joint a pintar. ② Operación. ③ Peso.</p></div>
<div class="box ok">
  <span class="t">PRÁCTICA</span>
  <p>Elija <code>codo_JNT</code>, rote el codo y observe qué zona se deforma mal. Pinte con <b>Smooth</b> sobre el pliegue hasta que quede redondeado. Después pruebe lo contrario: pinte con <b>Replace</b> y Value 1 justo en el codo y analice qué ocurre.</p>
</div>
<p class="small">El resultado debe corresponder al de <code>brazo_skin.ma</code>.</p>
</section>

<!-- PARTE 6 -->
<section class="pagina">
${sec('6 · IK: desplazar la mano y que el brazo la siga', 15)}
<p><b>IK</b> (Inverse Kinematics) es el procedimiento inverso a FK: el usuario mueve la <b>mano</b> y Maya calcula cómo deben rotar el hombro y el codo. Se emplea cuando la mano debe llegar a un punto exacto (agarrar un objeto) o cuando un pie debe permanecer apoyado.</p>
<ol class="pasos">
  <li>Active la herramienta del IK Handle:</li>
</ol>
${menu('m_ik_handle.png', 'Skeleton ▸ Create IK Handle. Las opciones por defecto (solver Rotate-Plane Solver) son adecuadas.')}
<ol class="pasos" start="2">
  <li>Haga clic en <code>hombro_JNT</code> y después en <code>muneca_JNT</code>. Aparece un <b>IK Handle</b> en la muñeca. Cámbiele el nombre a <code>brazo_IK</code>.</li>
</ol>
${img('13_ik_handle.png', '① El IK Handle está en la muñeca. ② Aparece en el Outliner.')}
<ol class="pasos" start="3">
  <li>Seleccione el IK Handle y muévalo con <kbd>W</kbd>. El brazo lo sigue y el codo se acomoda automáticamente.</li>
</ol>
</section>

<section>
${img('14_ik_mover.png', '① Se mueve el handle. ② El codo se acomoda solo. ③ Ik Blend = 1: controla el IK.')}
<h3>Alternar entre IK y FK</h3>
<p>Con el IK Handle seleccionado, el Channel Box muestra el atributo <b>Ik Blend</b>. Con valor <b>1</b> controla el IK; con valor <b>0</b> controlan los joints, como en FK.</p>
${img('15_ik_blend_fk.png', 'Ik Blend en 0: los joints se rotan manualmente de nuevo.')}
<div class="box warn">
  <span class="t">PRECAUCIÓN</span>
  <p>Con Ik Blend en 1 no deben rotarse los joints: el IK los controla. Para rotarlos, ponga Ik Blend en 0. El control de la dirección hacia la que apunta el codo (<b>Pole Vector</b>) se estudia en la clase del cuerpo.</p>
</div>
<p class="small">El resultado debe corresponder al de <code>brazo_ik.ma</code>.</p>
</section>

<!-- PARTE 7 -->
<section class="pagina">
${sec('7 · Entrega: el brazo derecho del modelo', 45)}
<div class="box photo">
  <span class="t">OBJETIVO</span>
  <p class="idea">Aplicar sobre el <b>brazo derecho</b> del modelo (<code>brazo_derecho_base.ma</code>) el mismo proceso que se desarrolló en el brazo izquierdo: <b>joints, orientación, skin e IK</b>. Quien lo prefiera puede trabajar con un modelo propio, descargado o duplicado, siempre que el resultado sea equivalente.</p>
</div>
<ul>
  <li>El brazo derecho es la imagen espejo del izquierdo: la cadena se crea del mismo modo, pero el hombro queda junto al torso y la mano en el extremo opuesto (a la izquierda de la pantalla en la vista frontal). Se aplican los mismos criterios de ubicación de la parte 3.2.</li>
  <li>Utilice el esquema de nombres de la guía agregando el sufijo <code>_der</code> (por ejemplo, <code>hombro_der_JNT</code>).</li>
  <li>El brazo debe poder rotarse con FK y desplazarse con IK, y la malla debe deformarse sin pliegues evidentes. Si alguna zona se ve mal, corríjala con los pesos.</li>
</ul>
<div class="box big">
  <span class="t">CONDICIÓN DE LA ENTREGA: CONSERVAR EL HISTORIAL</span>
  <p>El historial de construcción es el registro de cada paso del rig. Si se borra, el skin y los joints pueden dañarse y no es posible revisar ni corregir el proceso. Por eso:</p>
  <ul>
    <li><b>No borre el historial</b> en ningún momento: ni con <b>Edit ▸ Delete by Type ▸ History</b>, ni con <b>Delete All by Type ▸ History</b>, ni con el botón del shelf que se muestra a continuación.</li>
    <li>No limpie ni optimice la escena antes de guardarla.</li>
    <li>Entregue la escena completa tal como quedó, incluso si descargó o duplicó el modelo.</li>
  </ul>
  ${menu('m_history.png', 'Edit ▸ Delete by Type ▸ History. No debe utilizarse.', 56)}
  ${ancha('A2_boton_historial.png', 'Botón del shelf Delete By Type: History. No debe utilizarse.', 80)}
</div>
<h3>Qué se entrega</h3>
<ul class="check">
  <li>Un archivo de Maya (<code>.ma</code>) con los joints, el skin y el IK del brazo derecho, sin historial borrado. Nombre sugerido: <code>Apellido_Nombre_brazo_rig.ma</code>.</li>
  <li>Tres capturas de pantalla del brazo en poses distintas (una con FK y dos con IK).</li>
</ul>
</section>

<!-- APÉNDICE -->
<section class="pagina">
<h2 class="sec"><span>Apéndice: cómo se separó el brazo del modelo</span></h2>
<p>Los brazos de las escenas de esta guía se obtuvieron del modelo completo. Este procedimiento solo es necesario para quienes trabajen con un modelo propio.</p>
<ol class="pasos">
  <li>Seleccione el modelo y duplíquelo:</li>
</ol>
${menu('m_duplicate.png', 'Edit ▸ Duplicate. Se trabaja sobre la copia; el original se oculta o se conserva aparte.')}
<ol class="pasos" start="2">
  <li>En la vista frontal, active el modo transparente (Shading ▸ X-Ray, parte 3.1) y el modo de selección de <b>caras</b> (clic derecho sobre el modelo ▸ Face, o la tecla <kbd>F11</kbd>).</li>
  <li>Arrastre un marco de selección que abarque todo lo que <b>no</b> sea el brazo que se desea conservar (el torso, la cabeza, las piernas y el otro brazo) y pulse <kbd>Delete</kbd>.</li>
</ol>
${img('A1_marco.png', 'Marco de selección para conservar únicamente el brazo derecho del modelo (el lado −X, a la izquierda de la pantalla).')}
</section>

<!-- ERRORES -->
<section class="pagina">
<h2 class="sec"><span>Si algo no funciona</span></h2>
<table class="err">
  <tr><th>Situación</th><th>Qué hacer</th></tr>
  <tr><td>Se rota el joint y la malla no se mueve</td><td>No hay skin. Seleccione el primer joint y la malla, y aplique <b>Bind Skin</b> (parte 5). Si ya existe skin, compruebe en el Outliner que pertenezca a esa malla.</td></tr>
  <tr><td>Maya indica que no puede realizar el bind</td><td>Seleccione primero el joint raíz y después (<kbd>Shift</kbd>) la malla. La malla no puede ser hija de los joints.</td></tr>
  <tr><td>El codo gira hacia un lado inesperado</td><td>Los joints no están orientados. Seleccione el primer joint y repita <b>Orient Joint</b> (parte 3.3). Verifique con los ejes locales.</td></tr>
  <tr><td>Se movió un joint después del skin y la malla se deformó</td><td>Deshaga (<kbd>Ctrl</kbd>+<kbd>Z</kbd>) o utilice <b>Go to Bind Pose</b>. Después del bind se rotan los joints; no se trasladan.</td></tr>
  <tr><td>El pliegue del codo se ve deformado</td><td>Corrija los pesos con <b>Paint Skin Weights</b> y la operación <b>Smooth</b>. Al modelar, conviene incluir más líneas de malla (edge loops) en las articulaciones.</td></tr>
  <tr><td>Los joints quedan ocultos dentro de la malla</td><td>Active el modo transparente del visor (<b>Shading ▸ X-Ray</b>, parte 3.1).</td></tr>
  <tr><td>El IK Handle rota el brazo de forma extraña</td><td>Verifique que el codo conserve el doblez de la parte 3.2 (ligeramente por debajo de la línea hombro-muñeca) y cree de nuevo el IK Handle.</td></tr>
  <tr><td>Se borró el historial por error</td><td>Deshaga de inmediato con <kbd>Ctrl</kbd>+<kbd>Z</kbd>. Si ya no es posible, abra la escena de apoyo de la parte en la que va y repita desde ahí.</td></tr>
  <tr><td>La escena quedó irrecuperable</td><td>Abra la escena de apoyo de la parte en la que va (<code>brazo_joints.ma</code>, <code>brazo_skin.ma</code> o <code>brazo_ik.ma</code>) y continúe desde ahí.</td></tr>
</table>

<h2 class="sec"><span>Vocabulario</span></h2>
<table>
  <tr><td class="n">Rig</td><td>Sistema de joints, skin y controles que permite mover un modelo.</td></tr>
  <tr><td class="n">Joint</td><td>Punto dentro de una jerarquía. Se rota para mover la malla a la que está vinculado.</td></tr>
  <tr><td class="n">Parent / hijo</td><td>Relación de padre e hijo: el hijo sigue al padre, y no al contrario. Se refleja en el Outliner.</td></tr>
  <tr><td class="n">Constraint</td><td>“Correa”: un objeto sigue a otro sin ser su hijo. Se estudia en la clase del cuerpo.</td></tr>
  <tr><td class="n">Pivote</td><td>Punto alrededor del cual rota un objeto.</td></tr>
  <tr><td class="n">Orientar</td><td>Ajustar los ejes de cada joint para que roten de forma predecible.</td></tr>
  <tr><td class="n">FK</td><td>Mover rotando cada joint de padre a hijo.</td></tr>
  <tr><td class="n">IK</td><td>Mover el extremo de la cadena (mano, pie) y dejar que Maya calcule los joints.</td></tr>
  <tr><td class="n">Skin</td><td>Vincular la malla a los joints.</td></tr>
  <tr><td class="n">Pesos</td><td>Cuánto controla cada joint a cada vértice.</td></tr>
  <tr><td class="n">Bind pose</td><td>Pose en la que se hizo el skin. Es el punto de partida.</td></tr>
  <tr><td class="n">Historial</td><td>Registro de las operaciones realizadas sobre un objeto. Permite revisar el proceso paso a paso.</td></tr>
</table>
</section>

</div>
`;

const page = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Rigging para dummies</title><style>${css}${extra}</style></head><body>${body}</body></html>`;
fs.writeFileSync(html, page, 'utf8');
console.log('HTML:', html);

const edges = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'];
const exe = edges.find(p => fs.existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome.'); process.exit(1); }
const url = 'file:///' + html.replace(/\\/g, '/').split('/').map((s, i) => (i === 0 ? s : encodeURIComponent(s))).join('/');
try {
  execFileSync(exe, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, url], { stdio: 'pipe' });
} catch (e) { /* Edge devuelve ruido por stderr aunque funcione */ }
const t = fs.existsSync(pdf) ? fs.statSync(pdf).mtime : null;
console.log(t && Date.now() - t.getTime() < 60000 ? `PDF listo: ${pdf}` : `No se pudo escribir ${pdf} (¿está abierto en otro programa?)`);
