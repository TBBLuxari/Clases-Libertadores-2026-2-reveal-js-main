using UnityEngine;

public class Torreta : MonoBehaviour
{
    public float velocidad = 25f;

    void Update()
    {
        transform.Rotate(0f, velocidad * Time.deltaTime, 0f);
    }
}
