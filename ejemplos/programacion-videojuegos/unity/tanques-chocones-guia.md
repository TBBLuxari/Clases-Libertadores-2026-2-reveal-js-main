# Tanques Chocones: guía del profesor

Proyecto de Unity para practicar movimiento, colisiones, triggers y cámara. Es una arena 3D con rampas donde juegan de 2 a 4 personas en el mismo teclado. Los tanques se empujan, recogen estrellas (puntos) y turbos (velocidad temporal), y si se caen de la arena reaparecen en su punto de inicio.

## Qué se reparte y qué no

| Archivo | Quién lo recibe |
|---|---|
| `Unity-Tanques-Inicio.unitypackage` | Los estudiantes. Trae la arena, los 4 tanques, las estrellas, los turbos, el marcador y la cámara, pero con los scripts vacíos. |
| Carpeta `Assets/TanquesChocones/Objetivo` del proyecto "Proyecto chiquito" | Solo tú. Tiene la escena terminada y las soluciones (`TanqueSolucion`, `CamaraGrupoSolucion`, `MarcadorSolucion`). |

Importar el paquete: Assets, Import Package, Custom Package. Requisitos: Unity 6 con plantilla URP y Active Input Handling en "Both". El paquete crea solo los tags `Estrella` y `Turbo`.

## Teclas del Objetivo

| Jugador | Adelante | Atrás | Izquierda | Derecha |
|---|---|---|---|---|
| J1 azul | W | S | A | D |
| J2 rojo | Flecha arriba | Flecha abajo | Flecha izquierda | Flecha derecha |
| J3 verde | I | K | J | L |
| J4 amarillo | T | G | F | H |

Cámara: Q y E giran alrededor de la arena.

## Qué hay en la escena de Inicio

- `Tanque_J1` a `Tanque_J4`: cada uno con Rigidbody (rotación en X y Z congelada, `Linear Damping` 1.5) y un collider. Solo tienen el script `Tanque`, que está vacío.
- `Main Camera` con el script `CamaraGrupo`, vacío, ya conectado a los 4 tanques.
- `Marcador` con el script `Marcador`, vacío, ya conectado a los 4 tanques y a los 4 textos.
- `Items`: 8 estrellas (tag `Estrella`) y 4 turbos (tag `Turbo`), todos con Is Trigger activado y girando.
- `Arena`: piso, 2 paredes, un bloque central y 3 rampas. Los lados este y oeste están abiertos para poder caer.

## Pasos para revelar en las diapositivas

Cada paso tiene la pregunta que les haces y el código de la solución. Hay varias formas válidas de resolverlos. Dejar que elijan es parte de la actividad.

### Paso 1: avanzar y retroceder

Preguntas: ¿qué tecla?, ¿cómo se mueve un objeto que tiene Rigidbody?, ¿Update o FixedUpdate?
Alternativas que pueden elegir: `MovePosition` (clase 8), `AddForce` o asignar `linearVelocity`.

```csharp
using UnityEngine;

public class Tanque : MonoBehaviour
{
    public KeyCode teclaAdelante;
    public KeyCode teclaAtras;
    public float fuerza = 28f;

    private Rigidbody rb;
    private float empuje = 0f;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        empuje = 0f;
        if (Input.GetKey(teclaAdelante))
        {
            empuje = 1f;
        }
        if (Input.GetKey(teclaAtras))
        {
            empuje = -1f;
        }
    }

    void FixedUpdate()
    {
        rb.AddForce(transform.forward * empuje * fuerza, ForceMode.Acceleration);
    }
}
```

### Paso 2: girar

Preguntas: ¿hacia dónde avanza el tanque cuando gira?, ¿por qué `transform.forward` y no `Vector3.forward`?

Se agregan dos teclas, una variable `giro` y esto en `FixedUpdate`:

```csharp
Quaternion rotacion = Quaternion.Euler(0f, giro * velocidadGiro * Time.fixedDeltaTime, 0f);
rb.MoveRotation(rb.rotation * rotacion);
```

### Paso 3: cuatro jugadores con el mismo script

Preguntas: ¿hay que escribir 4 scripts?, ¿qué cambia entre un tanque y otro?
Idea: las teclas son variables públicas. Se copia el script a los 4 tanques y se eligen las teclas en el Inspector.

### Paso 4: choques

Preguntas: ¿por qué se empujan?, ¿qué pasa si un tanque pesa más?, ¿qué hace el `Linear Damping`?
Actividad: agregar `DetectorChoque` (el de la clase 9) a un tanque y mirar la Console. Probar la masa del Rigidbody.

### Paso 5: estrellas

Preguntas: ¿Is Trigger o colisión sólida?, ¿en qué objeto va el script?, ¿qué se hace con la estrella después?

```csharp
void OnTriggerEnter(Collider other)
{
    if (other.CompareTag("Estrella"))
    {
        puntos++;
        Destroy(other.gameObject);
    }
}
```

### Paso 6: turbo

Preguntas: ¿cómo se hace algo temporal sin esperar?
Idea: una variable `tiempoTurbo` que se llena al recoger el turbo y baja con `Time.deltaTime`.

```csharp
if (other.CompareTag("Turbo"))
{
    tiempoTurbo = 3f;
    Destroy(other.gameObject);
}
```

En `Update`:

```csharp
if (tiempoTurbo > 0f)
{
    tiempoTurbo -= Time.deltaTime;
}
```

En `FixedUpdate`, antes de `AddForce`:

```csharp
float multiplicador = 1f;
if (tiempoTurbo > 0f)
{
    multiplicador = 1.5f;
}
```

### Paso 7: caer de la arena

Preguntas: ¿cómo sabe el tanque que se cayó?, ¿qué hay que reiniciar además de la posición?

```csharp
if (transform.position.y < -5f)
{
    Reaparecer();
}
```

```csharp
void Reaparecer()
{
    rb.linearVelocity = Vector3.zero;
    rb.angularVelocity = Vector3.zero;
    transform.position = posicionInicial;
    transform.rotation = rotacionInicial;

    if (puntos > 0)
    {
        puntos--;
    }
}
```

Hay que guardar `posicionInicial` y `rotacionInicial` en `Start`.

### Paso 8: marcador

Preguntas: ¿quién guarda los puntos y quién los muestra?

```csharp
void Update()
{
    texto1.text = "J1: " + tanque1.puntos;
    texto2.text = "J2: " + tanque2.puntos;
    texto3.text = "J3: " + tanque3.puntos;
    texto4.text = "J4: " + tanque4.puntos;
}
```

### Paso 9: cámara de grupo

Preguntas: ¿dónde debería mirar la cámara?, ¿qué hace falta para que se aleje si los tanques se separan?
Ideas: el promedio de las posiciones de los 4 tanques y la mayor distancia al centro. Script completo en `CamaraGrupoSolucion.cs`.

### Paso 10 (extra): girar la cámara

Pregunta: ¿cómo se gira alrededor de un punto?
Idea: una variable `angulo` que cambia con Q y E, y `Quaternion.Euler(0f, angulo, 0f) * desplazamiento`.

## Ajustes si no se siente bien

- Más velocidad o menos: `fuerza` en el tanque. Con 28 y `Linear Damping` 1.5 la velocidad máxima es de unos 16 m/s.
- Se resbala mucho: subir `Linear Damping` del Rigidbody.
- Les cuesta trepar las rampas: bajar el ángulo de la rampa (ahora 15 grados) o subir `fuerza`.
- El turbo es muy fuerte: bajar el multiplicador de 1.5 a 1.25.

## Estado

Armado y revisado con el diagnóstico de Unity (sin errores de compilación ni referencias rotas), pero sin jugarlo en Play: Unity se cerró la última vez que se entró a Play desde la herramienta. Los valores de fuerza, giro y rampas son una primera propuesta y hay que ajustarlos jugando.
