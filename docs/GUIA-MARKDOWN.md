# Guía: cómo escribir diapositivas en Markdown (Reveal.js)

Todo esto aplica a `comun/intro.md` (y a cualquier otro `.md` que quieras incluir con `data-markdown`).

## 1. Dónde empieza y termina una diapositiva

Tu archivo usa `---` en su propia línea como separador (así está configurado en `data-separator` del HTML). Todo lo que hay **entre dos `---`** es UNA diapositiva:

```markdown
## Diapositiva A
contenido...

---

## Diapositiva B
contenido...
```

## 2. Título y cuerpo

```markdown
## Este es el título

Este es un párrafo normal.

- Este es un punto de lista
- Otro punto
- Otro más
```

- `#` = título gigante (nivel 1, úsalo solo para portadas)
- `##` = título normal de diapositiva (el que más vas a usar)
- `###` = subtítulo, más pequeño
- Una línea sin `#` = párrafo normal
- Líneas que empiezan con `-` = lista con viñetas

## 3. Cambiar el fondo de la diapositiva (color)

Va **al final** del contenido de esa diapositiva, antes del `---` que la cierra:

```markdown
## Mi diapositiva

Contenido...

<!-- .slide: data-background-color="#1a1a2e" -->

---
```

Puedes usar cualquier color en hex (`#rrggbb`) o nombre CSS (`"tomato"`, `"black"`, etc).

## 4. Fondo con imagen o GIF

Mismo truco, pero con `data-background-image`:

```markdown
## Mi diapositiva

<!-- .slide: data-background-image="../assets/img/foto.jpg" -->

---
```

Para que el fondo no tape el texto y se vea oscurecido, puedes combinar con opacidad:

```markdown
<!-- .slide: data-background-image="../assets/gif/fiesta.gif" data-background-opacity="0.3" -->
```

## 5. Imagen o GIF normal (dentro del contenido, no de fondo)

Sintaxis normal de Markdown — un GIF es solo una imagen animada, se pone igual:

```markdown
## Mi diapositiva

![descripción de la imagen](../assets/img/diagrama.png)

![reacción graciosa](../assets/gif/risa.gif)
```

Si quieres controlar el tamaño, se puede meter como HTML crudo (también funciona dentro del `.md`):

```markdown
<img src="../assets/gif/risa.gif" width="400">
```

## 6. Video

```markdown
## Mi diapositiva

<video src="../assets/video/demo.mp4" controls width="600"></video>
```

- `controls` = le agrega play/pausa/volumen visibles
- Si quieres que se reproduzca solo al entrar a la diapositiva: `autoplay`
- Si lo quieres de **fondo** (sin controles, cubriendo toda la diapositiva):

```markdown
<!-- .slide: data-background-video="../assets/video/fondo.mp4" data-background-video-loop -->
```

## 7. Audio

```markdown
<audio src="../assets/audio/clip.mp3" controls></audio>
```

## 8. Cambiar el color de un texto específico (no todo el fondo)

Markdown no tiene sintaxis propia para esto — se usa HTML crudo, que también funciona embebido en el `.md`:

```markdown
Este texto es normal, pero <span style="color:#ff5555">esta parte está en rojo</span> para resaltar.
```

Igual funciona con negrita/cursiva usando Markdown puro (esto sí es nativo):

```markdown
Esto es **negrita**, esto es *cursiva*, esto es ***negrita y cursiva***.
```

## 9. Bloques de código con resaltado de sintaxis

En Markdown, usa triple comilla invertida (tres backticks) + el nombre del lenguaje — Reveal lo resalta automático, no necesitas HTML:

````markdown
```javascript
console.log("hola clase");
```
````

Cambia `javascript` por `cpp`, `csharp`, `python`, etc. según lo que estés enseñando.

## 10. Que algo aparezca poco a poco (al dar clic/flecha)

Se envuelve en un `<span>` o `<div>` con la clase `fragment` (HTML crudo dentro del md):

```markdown
- Primer punto (aparece de una)
- <span class="fragment">Segundo punto (aparece con el siguiente clic)</span>
- <span class="fragment">Tercer punto</span>
```

## 11. Enlaces

```markdown
Más info en [la documentación oficial](https://revealjs.com/markdown/)
```

## 12. Notas del orador (las tuyas, no las ve el estudiante)

Ya lo tienes configurado con `data-separator-notes="^Nota:"` — cualquier línea que empiece con `Nota:` se vuelve nota privada:

```markdown
## Mi diapositiva

Contenido visible para el estudiante.

Nota: Esto solo lo veo yo en el modo presentador (tecla S).
```

---

## Plantilla rápida para copiar y pegar

```markdown
## Título de la diapositiva

![imagen opcional](../assets/img/algo.png)

- Punto 1
- Punto 2
- Punto 3

<!-- .slide: data-background-color="#1a1a2e" -->

Nota: Lo que voy a explicar en vivo sobre esta diapositiva.

---
```

Documentación oficial completa: https://revealjs.com/markdown/
