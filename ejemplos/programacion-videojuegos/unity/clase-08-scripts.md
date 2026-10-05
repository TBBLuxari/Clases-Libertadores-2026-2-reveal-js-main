# Clase 08: scripts

Scripts completos de la clase 8, en el orden en que aparecen. Cada uno se pega entero sobre el script del cubo (el nombre de la clase tiene que ser igual al del archivo). Los de Rigidbody ya traen freezeRotation: el cubo no se voltea.

## 1. MovimientoCubo (con position)

```csharp
using UnityEngine;

public class MovimientoCubo : MonoBehaviour
{
    public float velocidad = 5f;
    public float velocidadRotacion = 90f;

    void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        Vector3 direccion = new Vector3(horizontal, 0f, vertical);

        transform.position += direccion * velocidad * Time.deltaTime;

        if (Input.GetKey(KeyCode.Q))
            transform.Rotate(Vector3.up, -velocidadRotacion * Time.deltaTime);
        if (Input.GetKey(KeyCode.E))
            transform.Rotate(Vector3.up, velocidadRotacion * Time.deltaTime);
    }
}
```

## 2. MovimientoCubo (Translate con Space.World)

```csharp
using UnityEngine;

public class MovimientoCubo : MonoBehaviour
{
    public float velocidad = 5f;
    public float velocidadRotacion = 90f;

    void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        Vector3 direccion = new Vector3(horizontal, 0f, vertical);

        transform.Translate(direccion * velocidad * Time.deltaTime, Space.World);

        if (Input.GetKey(KeyCode.Q))
            transform.Rotate(Vector3.up, -velocidadRotacion * Time.deltaTime);
        if (Input.GetKey(KeyCode.E))
            transform.Rotate(Vector3.up, velocidadRotacion * Time.deltaTime);
    }
}
```

## 3. MovimientoCubo (Translate con Space.Self)

```csharp
using UnityEngine;

public class MovimientoCubo : MonoBehaviour
{
    public float velocidad = 5f;
    public float velocidadRotacion = 90f;

    void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        Vector3 direccion = new Vector3(horizontal, 0f, vertical);

        transform.Translate(direccion * velocidad * Time.deltaTime, Space.Self);

        if (Input.GetKey(KeyCode.Q))
            transform.Rotate(Vector3.up, -velocidadRotacion * Time.deltaTime);
        if (Input.GetKey(KeyCode.E))
            transform.Rotate(Vector3.up, velocidadRotacion * Time.deltaTime);
    }
}
```

## 4. MovimientoCubo (con forward)

```csharp
using UnityEngine;

public class MovimientoCubo : MonoBehaviour
{
    public float velocidad = 5f;
    public float velocidadRotacion = 90f;

    void Update()
    {
        float vertical = Input.GetAxis("Vertical");

        transform.position += transform.forward * vertical * velocidad * Time.deltaTime;

        if (Input.GetKey(KeyCode.Q))
            transform.Rotate(Vector3.up, -velocidadRotacion * Time.deltaTime);
        if (Input.GetKey(KeyCode.E))
            transform.Rotate(Vector3.up, velocidadRotacion * Time.deltaTime);
    }
}
```

## 5. MovimientoCubo (MoveTowards)

```csharp
using UnityEngine;

public class MovimientoCubo : MonoBehaviour
{
    public float velocidad = 5f;
    public Transform objetivo; // arrastran aquí el GameObject punto, desde el Inspector

    void Update()
    {
        if (objetivo == null) return; // si no han arrastrado el punto, no hace nada

        transform.position = Vector3.MoveTowards(
            transform.position, objetivo.position, velocidad * Time.deltaTime);
    }
}
```

## 6. MovimientoCubo (Rigidbody con MovePosition)

```csharp
using UnityEngine;

public class MovimientoCubo : MonoBehaviour
{
    public float velocidad = 5f;

    private Rigidbody rb;
    private Vector3 direccion;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        rb.freezeRotation = true;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
    }

    void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        direccion = new Vector3(horizontal, 0f, vertical);
    }

    void FixedUpdate()
    {
        rb.MovePosition(rb.position + direccion * velocidad * Time.fixedDeltaTime);
    }
}
```

## 7. MovimientoCubo (Rigidbody con AddForce)

```csharp
using UnityEngine;

public class MovimientoCubo : MonoBehaviour
{
    public float fuerza = 20f;

    private Rigidbody rb;
    private Vector3 direccion;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        rb.freezeRotation = true;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
        rb.linearDamping = 4f;
    }

    void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        direccion = new Vector3(horizontal, 0f, vertical);
    }

    void FixedUpdate()
    {
        rb.AddForce(direccion * fuerza);
    }
}
```

## 8. MovimientoCubo (Character Controller)

```csharp
using UnityEngine;

public class MovimientoCubo : MonoBehaviour
{
    public float velocidad = 5f;

    private CharacterController controller;

    void Start()
    {
        controller = GetComponent<CharacterController>();
    }

    void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        Vector3 direccion = new Vector3(horizontal, 0f, vertical);

        controller.Move(direccion * velocidad * Time.deltaTime);
    }
}
```

## 9. MovimientoCubo (Character Controller con gravedad)

```csharp
using UnityEngine;

public class MovimientoCubo : MonoBehaviour
{
    public float velocidad = 5f;
    public float gravedad = -20f;

    private CharacterController controller;
    private float velocidadVertical;

    void Start()
    {
        controller = GetComponent<CharacterController>();
    }

    void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        Vector3 direccion = new Vector3(horizontal, 0f, vertical);

        if (controller.isGrounded && velocidadVertical < 0f)
            velocidadVertical = -2f;

        velocidadVertical += gravedad * Time.deltaTime;

        Vector3 movimiento = direccion * velocidad;
        movimiento.y = velocidadVertical;

        controller.Move(movimiento * Time.deltaTime);
    }
}
```

## 10. MovimientoCubo (rotación suave con Slerp)

```csharp
using UnityEngine;

public class MovimientoCubo : MonoBehaviour
{
    public float velocidad = 5f;
    public float velocidadGiro = 8f;

    void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        Vector3 direccion = new Vector3(horizontal, 0f, vertical);

        transform.position += direccion * velocidad * Time.deltaTime;

        if (direccion.sqrMagnitude > 0.01f)
        {
            Quaternion rotacionObjetivo = Quaternion.LookRotation(direccion);
            transform.rotation = Quaternion.Slerp(transform.rotation, rotacionObjetivo, velocidadGiro * Time.deltaTime);
        }
    }
}
```

