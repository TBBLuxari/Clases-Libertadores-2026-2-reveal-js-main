using UnityEngine;

public class Mirar : MonoBehaviour
{
    public float sensibilidad = 2f;
    public Transform camara;

    private float giroVertical;

    void Start()
    {
        Cursor.lockState = CursorLockMode.Locked;
    }

    void Update()
    {
        float mouseX = Input.GetAxis("Mouse X") * sensibilidad;
        float mouseY = Input.GetAxis("Mouse Y") * sensibilidad;

        transform.Rotate(0f, mouseX, 0f);

        giroVertical = giroVertical - mouseY;
        giroVertical = Mathf.Clamp(giroVertical, -80f, 80f);
        camara.localRotation = Quaternion.Euler(giroVertical, 0f, 0f);
    }
}
