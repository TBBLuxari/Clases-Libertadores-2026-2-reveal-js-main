using UnityEngine;

public class Salud : MonoBehaviour
{
    public int vida = 3;

    public void RecibirDanio(int cantidad)
    {
        vida = vida - cantidad;

        if (vida <= 0)
        {
            Destroy(gameObject);
        }
    }
}
