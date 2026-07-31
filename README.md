# Clases (Reveal.js)

Presentaciones de clase, organizadas por materia, compartiendo un bloque común de inducción.

## Estructura

- `index.html` — selector inicial: elige materia, bienvenida o clase, coloreado según el progreso guardado.
- `comun/intro.md` — slides de bienvenida/inducción (metodología, evaluación, dudas, normas). Se edita **una sola vez** y se refleja en todas las materias.
- `materias/<materia>/clase-00.html` — la Bienvenida/Inducción de esa materia (incluye `comun/intro.md`). Es una clase aparte, no va dentro de `clase-01`.
- `materias/<materia>/clase-01.html` ... `clase-16.html` — un archivo por clase, contenido propio de la materia. Cada uno es independiente, se edita solo el que estés preparando.
- `assets/` — imágenes, gifs, video, audio para las slides.
- `assets/progreso.js` — guarda en el navegador (localStorage) hasta qué diapositiva llegaste en cada clase y la retoma ahí la próxima vez.
- `scripts/nueva-clase.mjs` — genera un `clase-NN.html` placeholder nuevo si necesitas más de 16.
- `scripts/generar-bienvenida.mjs` — regenera los `clase-00.html` de bienvenida (por si agregas una materia nueva).

## Uso

```bash
bun install
bun run serve
```

Se abre en un puerto libre (lo elige `serve` automáticamente, revisa la consola). Entra a `http://localhost:<puerto>/` para el selector.
(El include de `comun/intro.md` en `clase-00` necesita servidor local, no abrir el `.html` con doble clic.)

## Progreso y retomar donde quedamos

Cada clase guarda cuántas diapositivas viste (barra abajo del todo) y te lleva ahí automáticamente si la reabres — útil si toca cortar la clase a la mitad. En el selector, cada botón se pinta: gris = sin ver, borde amarillo = en progreso, verde = completada. Vive en el navegador (localStorage), no se sincroniza entre dispositivos.

## Exportar a PDF sin texto seleccionable

Con el servidor corriendo, entra a `.../clase-XX.html?print-pdf` y usa "Imprimir > Guardar como PDF" desde el navegador. Genera imágenes de las slides, útil para subir a Blackboard sin que se pueda copiar el texto tal cual.

## Agregar una clase extra (más de 16)

```bash
bun scripts/nueva-clase.mjs <carpeta-materia> <numero> "<Nombre visible de la materia>"
# ejemplo:
bun scripts/nueva-clase.mjs sistemas-fisicos-hipermedia 17 "Sistemas Físicos Hipermedia"
```

## Agregar una materia nueva

Copia una carpeta de `materias/` como base (su `clase-00.html` y `clase-01.html`...`clase-16.html`), cambia el título/contenido, y agrégala a la lista `materias` dentro de `index.html` (incluyendo el `<a class="bienvenida">` y el `<ul>` correspondientes).
