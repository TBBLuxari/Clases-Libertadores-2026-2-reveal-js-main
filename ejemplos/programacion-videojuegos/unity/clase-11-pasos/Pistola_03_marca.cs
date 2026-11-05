using UnityEngine;

public class Pistola : MonoBehaviour
{
    public int danio = 1;
    public float alcance = 50f;
    public float cadencia = 0.3f;
    public GameObject marca;

    private float proximoDisparo;

    void Update()
    {
        if (Input.GetButton("Fire1") == true && Time.time >= proximoDisparo)
        {
            proximoDisparo = Time.time + cadencia;
            Disparar();
        }
    }

    void Disparar()
    {
        Ray rayo = new Ray(transform.position, transform.forward);
        RaycastHit hit;

        if (Physics.Raycast(rayo, out hit, alcance) == true)
        {
            GameObject copia = Instantiate(marca, hit.point, Quaternion.identity);
            Destroy(copia, 2f);

            Salud salud = hit.collider.GetComponent<Salud>();

            if (salud != null)
            {
                salud.RecibirDanio(danio);
            }
        }
    }

    void OnGUI()
    {
        GUI.Label(new Rect(Screen.width / 2 - 3, Screen.height / 2 - 10, 30, 30), "+");
    }
}
