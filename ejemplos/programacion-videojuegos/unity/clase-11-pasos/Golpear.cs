using UnityEngine;

public class Golpear : MonoBehaviour
{
    public float alcance = 2.5f;
    public LayerMask capas;
    public int danio = 1;

    void Update()
    {
        Debug.DrawRay(transform.position, transform.forward * alcance, Color.cyan);

        if (Input.GetKeyDown(KeyCode.Space) == true)
        {
            Pegar();
        }
    }

    void Pegar()
    {
        RaycastHit hit;

        if (Physics.Raycast(transform.position, transform.forward, out hit, alcance, capas) == true)
        {
            Salud salud = hit.collider.GetComponent<Salud>();

            if (salud != null)
            {
                salud.RecibirDanio(danio);
            }
        }
    }
}
