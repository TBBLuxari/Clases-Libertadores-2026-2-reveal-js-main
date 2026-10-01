using UnityEngine;

// Version con Rigidbody del controlador de la clase 8.
// Pegar en un GameObject con Box Collider + Rigidbody (sin Character Controller).
// El script congela solo X y Z de la rotacion: asi el cubo NO se voltea,
// pero puede girar sobre Y para mirar hacia donde camina.

[RequireComponent(typeof(Rigidbody))]
public class ControladorPersonajeRigidbody : MonoBehaviour
{
    public float velocidad = 5f;
    public float velocidadGiro = 8f;

    private Rigidbody rb;
    private Vector3 direccion;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        rb.constraints = RigidbodyConstraints.FreezeRotationX | RigidbodyConstraints.FreezeRotationZ;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
    }

    void Update()
    {
        // El input se lee en Update (cada cuadro)
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        direccion = new Vector3(horizontal, 0f, vertical);
    }

    void FixedUpdate()
    {
        // El movimiento y el giro fisicos se aplican en FixedUpdate
        rb.MovePosition(rb.position + direccion * velocidad * Time.fixedDeltaTime);

        if (direccion.sqrMagnitude > 0.01f)
        {
            Quaternion rotacionObjetivo = Quaternion.LookRotation(direccion);
            rb.MoveRotation(Quaternion.Slerp(rb.rotation, rotacionObjetivo, velocidadGiro * Time.fixedDeltaTime));
        }
    }
}
