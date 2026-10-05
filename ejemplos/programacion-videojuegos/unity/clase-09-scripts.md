# Clase 09: scripts

Scripts completos de la clase 9, en el orden en que aparecen. El nombre de la clase tiene que ser igual al nombre del archivo.

## 1. DetectorChoque

```csharp
using UnityEngine;

public class DetectorChoque : MonoBehaviour
{
    void OnCollisionEnter(Collision collision)
    {
        Debug.Log("ENTER: choqué con " + collision.gameObject.name);
    }

    void OnCollisionStay(Collision collision)
    {
        Debug.Log("STAY: sigo tocando a " + collision.gameObject.name);
    }

    void OnCollisionExit(Collision collision)
    {
        Debug.Log("EXIT: me separé de " + collision.gameObject.name);
    }
}
```

## 2. ChoqueConTag

```csharp
using UnityEngine;

public class ChoqueConTag : MonoBehaviour
{
    void OnCollisionEnter(Collision collision)
    {
        if (collision.gameObject.CompareTag("Peligro"))
        {
            Debug.Log("¡Toqué algo peligroso!");
            GetComponent<Renderer>().material.color = Color.red;
        }
        else
        {
            Debug.Log("Choque normal con " + collision.gameObject.name);
        }
    }
}
```

## 3. GirarMoneda

```csharp
using UnityEngine;

public class GirarMoneda : MonoBehaviour
{
    public float velocidadGiro = 120f;

    void Update()
    {
        transform.Rotate(0f, velocidadGiro * Time.deltaTime, 0f);
    }
}
```

## 4. Recolector

```csharp
using UnityEngine;
using TMPro;

public class Recolector : MonoBehaviour
{
    public TextMeshProUGUI textoMonedas; // arrastran aquí el texto desde el Inspector
    public int totalMonedas = 5;
    private int monedas = 0;

    void Start()
    {
        textoMonedas.text = "Monedas: 0 / " + totalMonedas;
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Moneda"))
        {
            monedas++;
            Destroy(other.gameObject);
            textoMonedas.text = "Monedas: " + monedas + " / " + totalMonedas;

            if (monedas >= totalMonedas)
                textoMonedas.text = "¡Las conseguiste todas!";
        }
    }
}
```

## 5. ZonaReinicio

```csharp
using UnityEngine;

public class ZonaReinicio : MonoBehaviour
{
    public Transform puntoInicio; // arrastran aquí el PuntoInicio desde el Inspector

    void OnTriggerEnter(Collider other)
    {
        if (!other.CompareTag("Player")) return;

        // Si el jugador usa Character Controller, hay que apagarlo un instante
        CharacterController cc = other.GetComponent<CharacterController>();
        if (cc != null) cc.enabled = false;

        // Si el jugador usa Rigidbody, hay que frenarlo
        Rigidbody rb = other.attachedRigidbody;
        if (rb != null) rb.linearVelocity = Vector3.zero;

        other.transform.position = puntoInicio.position;

        if (cc != null) cc.enabled = true;
    }
}
```

## 6. ChoqueController

```csharp
using UnityEngine;

public class ChoqueController : MonoBehaviour
{
    void OnControllerColliderHit(ControllerColliderHit hit)
    {
        Debug.Log("El Character Controller tocó: " + hit.gameObject.name);
    }
}
```

