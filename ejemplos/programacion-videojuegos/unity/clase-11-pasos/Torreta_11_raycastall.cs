using UnityEngine;

public class Torreta : MonoBehaviour
{
    public float velocidad = 25f;
    public float distanciaMaxima = 20f;
    public LayerMask capas;
    public QueryTriggerInteraction triggers = QueryTriggerInteraction.Collide;
    public Transform puntaCanon;

    public int cuantos;
    public string[] nombres;
    public Vector3[] puntos;

    void Update()
    {
        transform.Rotate(0f, velocidad * Time.deltaTime, 0f);

        Ray rayo = new Ray(puntaCanon.position, puntaCanon.forward);
        RaycastHit[] hits = Physics.RaycastAll(rayo, distanciaMaxima, capas, triggers);

        cuantos = hits.Length;
        nombres = new string[hits.Length];
        puntos = new Vector3[hits.Length];

        for (int i = 0; i < hits.Length; i++)
        {
            nombres[i] = hits[i].collider.name;
            puntos[i] = hits[i].point;
        }

        if (cuantos > 0)
        {
            Debug.DrawRay(rayo.origin, rayo.direction * distanciaMaxima, Color.green);
        }
        else
        {
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
