using UnityEngine;

public class Torreta : MonoBehaviour
{
    public float velocidad = 25f;
    public float distanciaMaxima = 5f;
    public LayerMask capas;
    public Transform puntaCanon;

    public string nombre;
    public float distancia;
    public Vector3 punto;

    void Update()
    {
        transform.Rotate(0f, velocidad * Time.deltaTime, 0f);

        Ray rayo = new Ray(puntaCanon.position, puntaCanon.forward);
        RaycastHit hit;
        bool pego = Physics.Raycast(rayo, out hit, distanciaMaxima, capas);

        if (pego == true)
        {
            nombre = hit.collider.name;
            distancia = hit.distance;
            punto = hit.point;

            Debug.DrawRay(rayo.origin, rayo.direction * hit.distance, Color.green);
        }
        else
        {
            nombre = "";
            distancia = 0f;
            punto = Vector3.zero;

            Debug.DrawRay(rayo.origin, rayo.direction * distanciaMaxima, Color.red);
        }
    }

    void OnDrawGizmos()
    {
        if (puntaCanon == null)
        {
            return;
        }

        Gizmos.color = Color.yellow;
        Gizmos.DrawRay(puntaCanon.position + puntaCanon.right * 0.3f, puntaCanon.forward * distanciaMaxima);
    }
}
