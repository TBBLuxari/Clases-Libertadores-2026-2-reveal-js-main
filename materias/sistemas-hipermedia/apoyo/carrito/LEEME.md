# Carrito que esquiva obstáculos: material de apoyo

Todo lo del carrito de Sistemas Físicos Hipermedia, en un solo lugar. La presentación de clase está en `../../clase-11.html`.

| Carpeta o archivo | Qué es |
|---|---|
| `guia-estudiantes/` | La guía de 23 pasos que se les entregó (`carrito-guia.pdf` y `carrito-guia.html`). Generador: `docs/gen-guia-1t.js`. |
| `protoboard-pasos/ebc/` | La protoboard hueco por hueco, **una página por paso con los mismos números de la guía** (1 a 23) más la placa completa. Abrir `index.html`. Transistor con patas E-B-C. |
| `protoboard-pasos/lm358/` | Guía **sin transistores** de 20 pasos: el sensor se arma directo con el LM358, y cada página dice qué medir. Se genera con `SOLO_LM=1 node docs/gen-protoboard-paginas.js`. |
| `protoboard-pasos/cbe/` | Lo mismo para los transistores con patas C-B-E (se cambia con el botón de cada página). |
| `carrito-fisico/` | Chasis de cartón (plantillas 1:1), placa de circuito impreso y su guía. Abrir `index.html`. |
| `material-profe/` | Fotos y videos de las pruebas del profe. Los nombres son de la numeración vieja (`Paso2b`, `Paso2E`...); la guía ya los toma de aquí. |
| `sin-usar/` | Guías anteriores y la versión de dos transistores (que no se validó). |

## Cómo se regenera

```bash
node docs/gen-protoboard-paginas.js            # páginas de protoboard-pasos/ebc  (PINOUT=CBE para cbe)
node docs/capturas-carrito.js                  # pantallazos de cada paso para la presentación
SOLO_LM=1 node docs/gen-protoboard-paginas.js  # guía sin transistores (protoboard-pasos/lm358)
SOLO_LM=1 node docs/capturas-carrito.js        # sus pantallazos
node docs/gen-clase-carrito.js                 # clase-11.html: una diapositiva por paso de esa guía (se puede editar a mano después)
```

En las páginas de `protoboard-pasos/` lo nuevo de cada paso brilla en amarillo y lo que se quita simplemente desaparece (sin X). El positivo va en las filas de afuera y el negativo en las de adentro. Los puntos **N** (salida del receptor) y **S** (salida del sensor) están rotulados en todos los pasos.

- **Girar 180°:** el botón da la vuelta completa a la placa (no es un espejo), como si la giraras en la mesa para armar desde el otro lado. Los textos se quedan derechos y la página se acuerda de cómo la dejaste al pasar de un paso a otro.
- **Aislar:** los botones "Aislar" dejan encendida una sola parte del circuito (alimentación, emisor, receptor, salida, el que decide, motores, condensadores), con una nota de si esa parte funciona sola. "Lado" elige izquierdo o derecho.
- **Cableado de S** (pasos 18 a 23): "Puente corto entre patas" cambia los dos cables largos de S por uno solo y un puente de la pata 7 del L293D a la 1 del LM358 (y de la 15 a la 7 en el lado derecho). Es la misma red, el generador comprueba que las conexiones no cambian.
- **Probar un cambio de cableado:** `node docs/probar-cableado.js 20 --quitar W-OR --agregar U1.15-U2.7` dice si el circuito sigue igual o qué se rompe (`--listar` muestra los cables del paso y sus ids).
Los LED del emisor y del receptor van al frente de la placa (columnas 1 a 9), con la cabeza inclinada en diagonal hacia afuera: el sensor izquierdo mira a la izquierda y el derecho a la derecha.
