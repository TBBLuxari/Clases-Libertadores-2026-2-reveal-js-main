using UnityEngine;

public class Torreta : MonoBehaviour
{
    public float velocidad = 25f;
    public Transform puntaCanon;

    void Update()
    {
        transform.Rotate(0f, velocidad * Time.deltaTime, 0f);

        Ray rayo = new Ray(puntaCanon.position, puntaCanon.forward);

        Debug.DrawRay(rayo.origin, rayo.direction * 10f, Color.red);
    }
}
