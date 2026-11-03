# Billar con física (clases 10 y 11 de Programación Web)

El código de las clases 10 y 11, paso por paso (los pasos 00 a 03 son de la clase 10; del 04 al 11, de la clase 11). Parte de la sala de billar de la clase 9 (`../billar-final/`): `escenario.js` es esa sala sin las bolas, y cada archivo de `pasos/` es lo que se escribe en ese momento de la clase (las líneas nuevas llevan el comentario `NUEVO`).

Se abre con el servidor de las clases (`bun run serve` o `bun run dev`) y la dirección:

```
.../ejemplos/programacion-web/billar-fisica/index.html?paso=NN
```

Sin `?paso` se abre el último (el 11).

| Paso | Qué agrega |
|------|------------|
| 00 | Punto de partida: la `Bola` de la clase 9, todo quieto |
| 01 | `x`, `z`, `vx`, `vz` y el método `update()` (por cuadro) |
| 02 | `delta` con `THREE.Clock`: la velocidad pasa a ser por segundo |
| 03 | Arreglo `bolas`, `for … of` y velocidad desde el constructor (`vx = 0`, `vz = 0`) |
| 04 | `rebotarEnBordes()` |
| 05 | Fricción: `rapidez()` y `frenar(delta)` |
| 06 | `chocar(otra)`: detectar con la distancia (las bolas tocadas se ponen rojas) |
| 07 | Separar con la normal y el traslape; `dibujar()` pasa a ser un método aparte |
| 08 | Rebote entre dos bolas (intercambio de la parte normal de la velocidad) |
| 09 | Todas contra todas (un `for` dentro de otro) y la rotura del triángulo |
| 10 | Teclado: espacio golpea la blanca, R reinicia (`reiniciar()`) |
| 11 | Versión final: `RESTITUCION` y el taco solo se ve con la mesa quieta |

## Capturas de la presentación

Las imágenes de `assets/imagenes/programacion-web/clase-10/` salen de estos mismos archivos. `escenario.js` trae un modo captura (`?t=SEGUNDOS&vista=mesa|arriba|sala&rastro=1&colliders=1`) que simula el tiempo con cuadros fijos de 1/60 s y dibuja un solo cuadro, así que se pueden volver a generar iguales:

```bash
node docs/capturas-clase-10.js            # todas (necesita el servidor en el puerto 4173)
node docs/capturas-clase-10.js 06-rebote-en-bordes
```
