using UnityEngine;

// Script de referencia de la clase 8 (input + movimiento + rotacion), version completa.
// Usa CharacterController (no Rigidbody) y rotacion suave con Quaternion.
// Si no les alcanza el tiempo en clase, peguenlo sobre un GameObject
// que tenga agregado el Component "Character Controller".

[RequireComponent(typeof(CharacterController))]
public class ControladorPersonaje : MonoBehaviour
{
    public float velocidad = 5f;
    public float velocidadGiro = 8f;
    public float gravedad = -9.81f;

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

        // CharacterController no aplica gravedad solo: hay que sumarla a mano
        if (controller.isGrounded)
            velocidadVertical = -1f;
        else
            velocidadVertical += gravedad * Time.deltaTime;

        Vector3 movimiento = direccion * velocidad + Vector3.up * velocidadVertical;
        controller.Move(movimiento * Time.deltaTime);

        // Rotar suavemente hacia la direccion en la que nos estamos moviendo
        if (direccion.sqrMagnitude > 0.01f)
        {
            Quaternion rotacionObjetivo = Quaternion.LookRotation(direccion);
            transform.rotation = Quaternion.Slerp(transform.rotation, rotacionObjetivo, velocidadGiro * Time.deltaTime);
        }
    }
}
