using UnityEngine;

public class CamaraRuta : MonoBehaviour
{
    public float velocidadInicial = 4f;
    public float aceleracion = 0.03f;
    public float velocidadMaxima = 9f;
    public float retardoInicio = 3f;
    public float zFinal = 380f;

    private float velocidad;
    private float tiempo = 0f;

    void Start()
    {
        velocidad = velocidadInicial;
    }

    void Update()
    {
        tiempo += Time.deltaTime;

        if (tiempo > retardoInicio && transform.position.z < zFinal)
        {
            if (velocidad < velocidadMaxima)
            {
                velocidad += aceleracion * Time.deltaTime;
            }

            transform.position += Vector3.forward * velocidad * Time.deltaTime;
        }
    }
}
