using UnityEngine;

public class Torreta : MonoBehaviour
{
    public float velocidad = 25f;
    public Transform puntaCanon;

    void Update()
    {
        transform.Rotate(0f, velocidad * Time.deltaTime, 0f);

        Ray rayo = new Ray(puntaCanon.position, puntaCanon.forward);

        bool pego = Physics.Raycast(rayo);

        if (pego == true)
        {
            Debug.DrawRay(rayo.origin, rayo.direction * 10f, Color.green);
        }
        else
        {
            Debug.DrawRay(rayo.origin, rayo.direction * 10f, Color.red);
        }
    }

    void OnDrawGizmos()
    {
        if (puntaCanon == null)
        {
            return;
        }

        Gizmos.color = Color.yellow;
        Gizmos.DrawRay(puntaCanon.position + puntaCanon.right * 0.3f, puntaCanon.forward * 10f);
    }
}
