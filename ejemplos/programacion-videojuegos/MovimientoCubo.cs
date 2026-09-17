using UnityEngine;

// Script de referencia de la clase 7 (Unity), version completa.
// Si en clase no les alcanza a quedar completo, peguenlo tal cual
// sobre el GameObject de su cubo y sigan desde ahi.
//
// A proposito sin fisicas (sin Rigidbody, sin salto): eso lo vemos
// en una clase mas adelante. Hoy el movimiento es directo, a mano,
// escribiendo transform.position.

public class MovimientoCubo : MonoBehaviour
{
    public float velocidad = 5f;
    public float velocidadRotacion = 100f;

    void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");

        transform.position += new Vector3(horizontal, 0f, vertical) * velocidad * Time.deltaTime;

        if (Input.GetKey(KeyCode.Q))
            transform.Rotate(Vector3.up, -velocidadRotacion * Time.deltaTime);

        if (Input.GetKey(KeyCode.E))
            transform.Rotate(Vector3.up, velocidadRotacion * Time.deltaTime);
    }
}
