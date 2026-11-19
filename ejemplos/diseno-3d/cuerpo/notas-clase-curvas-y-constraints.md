# Notas para explicar en clase (rig del cuerpo, curvas de control)

Escena de trabajo: `ejemplos/diseno-3d/cuerpo/escenas/rig_curvas.ma` (respaldo solo con joints: `joints_completos.ma`, misma carpeta).

## Regla de oro de los constraints
**Siempre se selecciona primero el que manda y de último el que obedece.**
"El último que toco es el que recibe la orden."
- Control -> joint (Parent, Orient, Point).
- Locator -> IK handle (Pole Vector).

## Receta de un control (sin grupo)
1. Crear el circulo (normal en el eje que corresponda, sin historial).
2. Llevarlo al joint con snap (V mantenida, o Move y escribir las coordenadas).
3. Modify > Freeze Transformations (canales en 0).
4. Modify > Center Pivot (por seguridad: el pivote debe quedar en el joint).
5. Seleccionar el control, Ctrl+clic en el joint, Constrain > Parent, con las opciones abajo.
6. Probar: mover y rotar el control; volver a 0.

Se crea un grupo (_OFF) solo si hace falta: control dentro de otro control (FK del brazo) o cuando se necesita un "cero" que sobreviva a mover el control.

## Opciones de la ventana Constrain > Parent (hay que explicarlas)
- **Maintain Offset:** el joint se queda donde esta y mantiene su diferencia respecto al control. Sin esta opcion el joint salta a la posicion/orientacion del control. Marcarlo cuando el control y el joint no tienen la misma orientacion.
- **Constraint axes:** Translate X/Y/Z y Rotate X/Y/Z. Se pueden desmarcar ejes (ejemplo: solo Translate Y). Por defecto "All".
- **Weight:** 1 = el control manda al 100 %. Con varios controles se reparte el peso.
- Parent hace translate + rotate; Point solo mueve; Orient solo gira; Scale solo escala; Aim apunta; Pole Vector decide hacia donde mira la rodilla/codo.

## Por que constraint y no parent normal
El joint ya tiene padre (el joint anterior de la cadena); un objeto solo puede tener un padre. El constraint es un segundo jefe sin romper la jerarquia (parent = padre que lleva al hijo de la mano; constraint = correa).

## Hecho hasta ahora
- Joints: cadera, columna1-2, pecho, cuello, cabeza, cabeza_fin, pierna L (muslo, rodilla, tobillo, bola, punta), brazo L (clavicula, hombro, codo, muneca, mano). Orientacion: X al hijo, Y hacia +Z del mundo (huesos verticales); brazo con Y arriba.
- ctrl_cadera (circulo horizontal, radio 20, amarillo) con Parent Constraint + Maintain Offset, sin grupo. Probado: ty = 6 y ry = 30 mueven y giran todo, y vuelve a 0.

## Columna, cuello y cabeza (controles FK, sin grupos)
- Un circulo por joint (columna1, columna2, pecho, cuello, cabeza), con la receta de arriba.
- **Cada control es hijo del anterior** (Ctrl+P / tecla P): ctrl_cadera > ctrl_columna1 > ctrl_columna2 > ctrl_pecho > ctrl_cuello > ctrl_cabeza. Asi, al girar uno, los de arriba lo acompanan. Funciona sin grupo porque cada control esta congelado (canales en 0).
- Constraint: **Orient** (control primero, joint de ultimo) con Maintain Offset. Orient porque estos controles solo giran; la posicion la lleva la cadena de joints.
- Se bloquean Translate, Scale y Visibility para que no se muevan por error.
- Prueba: ctrl_columna1 rx = 20 mueve todo lo de arriba; ctrl_cabeza solo gira la cabeza; ctrl_cadera ry = 30 gira todo el torso. Volver a 0.
- El constraint pone la orientacion MUNDIAL del joint igual a la del control (mas el offset), por eso no se suma doble giro aunque el control y el joint esten dentro de cadenas.

## Brazo FK (lado +X, azul)
- ctrl_clavicula_L, ctrl_hombro_L, ctrl_codo_L, ctrl_muneca_L: circulos con la normal en X (el eje del hueso), azules (izquierda del personaje). Receta igual: snap, Freeze, Center Pivot, Orient Constraint con Maintain Offset.
- Jerarquia: ctrl_pecho > ctrl_clavicula_L > ctrl_hombro_L > ctrl_codo_L > ctrl_muneca_L. Si el torso gira, el brazo va con el.
- Pruebas: hombro rz = 30 (la mano sube, coincide con el calculo); codo rz = 40 (el codo no se mueve, solo antebrazo y mano); muneca rz = 30 (solo la mano); ctrl_pecho ry = 30 (arrastra el brazo). Todo vuelve a 0.
- Aviso para el IK: un Orient Constraint sobre un joint le gana al IK. Para tener FK e IK en el mismo brazo hay que decidir como se combinan (tres cadenas, o un switch).

## Decision sobre el brazo (2026-11-18)
- Brazo solo FK por ahora. En clase se vio una version rapida (IK y FK sobre la misma cadena, el IK handle con parent al control). Decirles que esa fue la version rapida: en una misma cadena el IK y el FK pueden pelearse (un constraint le gana al IK) y al cambiar de modo el brazo salta. El metodo completo (cadena IK aparte + interruptor) queda para despues.
- Para caminar, el brazo se anima en FK; el IK es necesario en la pierna (pie pegado al piso, foot roll).

## Pierna IK (paso 1)
- IK handle (Rotate Plane) de muslo_L_JNT a tobillo_L_JNT, nombre ik_pierna_L.
- ctrl_pie_L: rectangulo azul en el piso, pivote bajo el tobillo, sin grupo. **El IK handle cuelga del control con parent normal** (no constraint): lo que se mueva el control se lo lleva el handle.
- Pruebas: subir pie (ty 15), adelantar (tz 20), abrir (tx 8), girar (ry 30); la rodilla se dobla sola. Todo vuelve a 0.
- Pendiente: pole vector de la rodilla, y el foot roll (IK handle de bola y de punta, pivotes de talon/punta/bola).

## Pole Vector de la rodilla (paso 2 de la pierna)
- Que es: el IK sabe cuanto doblar la rodilla pero no hacia donde. El pole vector es un punto (locator) delante de la rodilla; la rodilla apunta siempre hacia el.
- Receta: 1) Create > Locator, nombrarlo pv_rodilla_L. 2) Llevarlo delante de la rodilla (a su altura, unos 40 cm adelante: 12, 50, 40) y Freeze. 3) **Seleccionar primero el locator y de ultimo el IK handle** (el handle esta dentro de ctrl_pie_L en el Outliner; Ctrl+clic). 4) Constrain > Pole Vector. Es el unico constraint de este tipo: no mueve ni rota nada, solo decide el plano del doblez.
- Se ve con el pie levantado (ctrl_pie_L ty = 22): mover el locator en X abre o cierra la rodilla (tx = 30 la abre, tx = -10 la cierra).
- Efecto secundario: al conectarlo el pie gira unos 7 grados en reposo. Se corrige con el atributo **Twist** del IK handle (6.77 en esta escena) hasta que el pie quede como estaba. Explicarlo: el pole vector cambia el plano y el pie se tuerce; Twist lo devuelve.

## Foot roll, paso A: los tres grupos (aqui SI hacen falta grupos)
- Pivote = el punto alrededor del cual gira un objeto. Cada objeto tiene un solo pivote. El foot roll necesita girar el pie alrededor de TRES puntos (talon, bola, punta) => tres objetos distintos => tres grupos vacios (Ctrl+G con nada seleccionado). Por eso aqui no se puede evitar el grupo.
- Jerarquia (de afuera hacia adentro): ctrl_pie_L > grp_talon_L > grp_punta_L > grp_bola_L > ik_pierna_L. Se arma con parent (P): primero el hijo, de ultimo el padre.
- Pivotes (D + V, o Insert; aqui puestos por numeros a la altura del piso): talon (14.59, 0.5, -7.87), bola (18.2, 0.5, 10), punta (16.98, 0.5, 16.33). Medidos sobre la malla del pie.
- El IK handle de la pierna sale del control y entra en grp_bola_L.
- Giro en X (el personaje mira a +Z). Talon: rx negativo (la punta sube). Bola: rx positivo (sube el talon). Punta: rx positivo (sube todo menos la punta).
- Todavia falta: los dos IK cortos (SC) tobillo->bola y bola->punta; sin ellos el hueso de la bola no acompana el giro. Luego el atributo Roll con Set Driven Key.

## Foot roll, paso B: los dos IK cortos (Single Chain)
- Por que: el IK de la pierna llega hasta el tobillo; los huesos del pie (bola y punta) necesitan sus propios IK para quedarse en el piso mientras el talon sube.
- Se crean con Skeleton > Create IK Handle, solver **ikSCsolver** (Single Chain = sin pole vector ni Twist; basta para cadenas cortas), clic en el primer joint y luego en el ultimo:
  - ik_bola_L: de tobillo_L_JNT a bola_L_JNT.
  - ik_punta_L: de bola_L_JNT a punta_L_JNT.
- Donde van (parent): ik_bola_L dentro de grp_bola_L (junto con ik_pierna_L); **ik_punta_L dentro de grp_punta_L, NO dentro de grp_bola_L** (asi la punta se queda en el piso cuando gira la bola).
- Jerarquia final: ctrl_pie_L > grp_talon_L > grp_punta_L > [ik_punta_L, grp_bola_L > [ik_bola_L, ik_pierna_L]].
- Pruebas (cada una vuelve a 0): talon rx = -20 sube toda la punta del pie; bola rx = 30 sube tobillo y talon con bola y punta en el piso; punta rx = 40 sube todo menos la punta.
- Falta el atributo Roll (Set Driven Key) para que un solo numero haga las tres fases.

## Foot roll, paso C: el atributo Roll con Set Driven Key
- **Set Driven Key (SDK):** una regla "cuando este atributo valga X, este otro valga Y". **Driver** = el que manda (Roll); **Driven** = el que obedece (el giro de cada grupo). Igual que en los constraints: primero el que manda. Maya llena los valores intermedios con una curva.
- Atributo: seleccionar ctrl_pie_L > Channel Box > Edit > Add Attribute (o Modify > Add Attribute): nombre Roll, tipo Float, Minimum -10, Maximum 10, Default 0, Keyable.
- SDK: menu set **Animation (F4)** > Key > Set Driven Key > Set. Cargar ctrl_pie_L como Driver (Load Driver, atributo Roll) y el grupo como Driven (Load Driven, atributo Rotate X). Poner el Roll en el valor, el grupo en su giro, y pulsar Key. Repetir por cada valor.
- Valores usados (rx del grupo, el personaje mira a +Z):
  - grp_talon_L: Roll -10 -> -30; Roll 0 -> 0.
  - grp_bola_L: Roll 0 -> 0; Roll 5 -> 30 (se queda en 30 despues).
  - grp_punta_L: Roll 5 -> 0; Roll 10 -> 60.
- Lectura: Roll de -10 a 0 gira el talon; de 0 a 5 sube el talon sobre la bola; de 5 a 10 sube todo sobre la punta. Roll 0 = pie plano.
- Probado: Roll -10 / -5 / 0 / 2.5 / 5 / 7.5 / 10 y vuelve a 0 con el pie exacto en reposo. El atributo no deja pasar de -10 ni de 10.
- Tangentes lineales: si se dejan en spline el giro se pasa de largo entre dos llaves.
