# Actividad: Sala de billar en 3D

Chicos, qué pena la tardanza con esta actividad. Como la clase 9 no alcanzó a verse completa, les dejo todo lo necesario para que la hagan por su cuenta: el PDF de la clase y una guía paso a paso. Abajo les cuento qué tienen que entregar y cómo.

Lo que van a hacer es una **sala de billar en 3D con Three.js**, con una **temática propia**: cada uno decide cómo se ve (un salón vaquero, un casino, el espacio, un bar de playa, algo medieval, neón retro...). Las texturas, los colores y las luces son los que cuentan la historia, así que dos entregas iguales no deberían existir.

## Material de apoyo

- **PDF de la clase 9**: luces, sombras, mapas de textura, repeat y clases.
- **Guía paso a paso en PDF**: arma la sala completa desde cero, de principio a fin.
- **Video de muestra**: cómo queda la sala terminada. [Ver el video](https://fundacionlibertadores-my.sharepoint.com/:v:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/stream.aspx?id=%2Fpersonal%2Fjjardilag_libertadores_edu_co%2FDocuments%2FMATERIAS%2F2026-2%2FProgramacion%20web%2FMesa%20de%20billar.mp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&share=cQoP1-M9jfyWS5J1236gOzLLEgUCMkd_IT2f-IhhJq0Md5Dklw)

Las **texturas** las buscan ustedes (sitios gratis como ambientcg.com y polyhaven.com). Recuerden abrir siempre el proyecto con **Live Server** en Visual Studio Code: con doble clic las texturas no cargan.

## Qué debe tener la escena

- Una **sala** con piso, 4 paredes y techo, con texturas.
- Una **mesa** con bordes y 4 patas hechas con la **clase Pata**.
- **Bolas** hechas con la **clase Bola** (7, 16 o las que quieran; una blanca y las demás de colores), brillantes y con barniz.
- Un **taco** apoyado cerca de la bola blanca.
- Por lo menos **6 luces**, y por lo menos una que proyecte **sombras**.
- Texturas con el **repeat bien calculado** (que no se vean estiradas) y por lo menos **2 mapas además del color** (por ejemplo bumpMap, roughnessMap, normalMap o displacementMap).
- La **temática propia**: se nota en las texturas, los colores, las luces y los detalles que agreguen.

## Qué se entrega

Se entregan **dos cosas**:

1. **La carpeta del proyecto**, con `index.html`, `script.js` y la carpeta `texturas`.
2. **Un timelapse** de ustedes haciendo toda la sala.

### Condiciones del timelapse

- Grabar la **pantalla completa**. **No vale compartir solo la ventana de Visual Studio Code.**
- **Sin cortes ni ediciones**: tiene que ser un solo video grabado, de principio a fin.
- Se puede acelerar la velocidad hasta **4 veces (x4) como máximo**.

Un timelapse que no cumpla estas condiciones no se tiene en cuenta.

## Fecha de entrega

[FECHA Y HORA]

## Criterios de evaluación (propuesta, ajustar antes de publicar)

| Criterio | Puntos |
|---|---|
| Sala: piso, paredes y techo con texturas y repeat bien calculado | 20 |
| Mesa con bordes y 4 patas con la clase Pata | 15 |
| Bolas con la clase Bola y el taco | 20 |
| Luces (mínimo 6) y sombras | 20 |
| Temática propia y cuidado en los detalles | 15 |
| Timelapse que cumple las condiciones | 10 |
| **Total** | **100** |

La siguiente clase empezamos con lo que sigue: ya tenemos la parte estética, ahora vamos a ver cómo se mueve para poder calcular y jugar, con eventos y después colisiones.
