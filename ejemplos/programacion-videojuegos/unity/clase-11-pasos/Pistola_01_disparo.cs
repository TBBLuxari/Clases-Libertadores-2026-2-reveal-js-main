using UnityEngine;

public class Pistola : MonoBehaviour
{
    public int danio = 1;
    public float alcance = 50f;

    void Update()
    {
        if (Input.GetButtonDown("Fire1") == true)
        {
            Disparar();
        }
    }

    void Disparar()
    {
        Ray rayo = new Ray(transform.position, transform.forward);
        RaycastHit hit;

        if (Physics.Raycast(rayo, out hit, alcance) == true)
        {
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
