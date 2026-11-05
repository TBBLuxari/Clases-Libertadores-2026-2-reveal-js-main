using UnityEngine;

public class Vigia : MonoBehaviour
{
    public Transform jugador;

    void Update()
    {
        Vector3 direccion = jugador.position - transform.position;

        Debug.DrawRay(transform.position, direccion, Color.yellow);
    }
}
