using UnityEngine;

public class TanqueRuta : MonoBehaviour
{
    public KeyCode teclaAdelante;
    public KeyCode teclaAtras;
    public KeyCode teclaIzquierda;
    public KeyCode teclaDerecha;

    public Transform foco;
    public float fuerza = 28f;
    public float velocidadGiro = 120f;
    public float limiteAtras = 9f;
    public float radioExplosion = 4f;
    public float fuerzaExplosion = 14f;
    public int puntos = 0;
    public bool vivo = true;

    private Rigidbody rb;
    private float empuje = 0f;
    private float giro = 0f;

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

        giro = 0f;
        if (Input.GetKey(teclaDerecha))
        {
            giro = 1f;
        }
        if (Input.GetKey(teclaIzquierda))
        {
            giro = -1f;
        }

        if (transform.position.y < -3f)
        {
            Eliminar();
        }

        if (transform.position.z < foco.position.z - limiteAtras)
        {
            Eliminar();
        }
    }

    void FixedUpdate()
    {
        rb.AddForce(transform.forward * empuje * fuerza, ForceMode.Acceleration);

        Quaternion rotacion = Quaternion.Euler(0f, giro * velocidadGiro * Time.fixedDeltaTime, 0f);
        rb.MoveRotation(rb.rotation * rotacion);
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Moneda"))
        {
            puntos++;
            Destroy(other.gameObject);
        }

        if (other.CompareTag("Bomba"))
        {
            Explotar(other.gameObject);
        }
    }

    void Explotar(GameObject bomba)
    {
        Vector3 centro = bomba.transform.position;
        Collider[] cercanos = Physics.OverlapSphere(centro, radioExplosion);

        for (int i = 0; i < cercanos.Length; i++)
        {
            Rigidbody otro = cercanos[i].attachedRigidbody;
            if (otro != null)
            {
                otro.AddExplosionForce(fuerzaExplosion, centro, radioExplosion, 0.3f, ForceMode.Impulse);
            }
        }

        Destroy(bomba);
    }

    void Eliminar()
    {
        vivo = false;
        gameObject.SetActive(false);
    }
}
