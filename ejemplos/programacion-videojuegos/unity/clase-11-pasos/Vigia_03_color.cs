using UnityEngine;

public class Vigia : MonoBehaviour
{
    public Transform jugador;
    public float alcance = 12f;
    public bool veAlJugador;
    public string loPrimeroQueVe;

    private Renderer render;
    private Color colorOriginal;

    void Start()
    {
        render = GetComponent<Renderer>();
        colorOriginal = render.material.color;
    }

    void Update()
    {
        Vector3 direccion = jugador.position - transform.position;
        RaycastHit hit;

        veAlJugador = false;
        loPrimeroQueVe = "";

        if (Physics.Raycast(transform.position, direccion.normalized, out hit, alcance) == true)
        {
            loPrimeroQueVe = hit.collider.name;

            if (hit.collider.CompareTag("Player") == true)
            {
                veAlJugador = true;
            }
        }

        if (veAlJugador == true)
        {
            render.material.color = Color.red;
            Debug.DrawRay(transform.position, direccion, Color.green);
        }
        else
        {
            render.material.color = colorOriginal;
            Debug.DrawRay(transform.position, direccion, Color.red);
        }
    }
}
