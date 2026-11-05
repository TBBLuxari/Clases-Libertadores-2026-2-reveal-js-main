using UnityEngine;

public class Mover : MonoBehaviour
{
    public float velocidad = 5f;

    private CharacterController controlador;

    void Start()
    {
        controlador = GetComponent<CharacterController>();
    }

    void Update()
    {
        float x = Input.GetAxisRaw("Horizontal");
        float z = Input.GetAxisRaw("Vertical");
        Vector3 direccion = new Vector3(x, 0f, z).normalized;

        if (direccion != Vector3.zero)
        {
            controlador.Move(direccion * velocidad * Time.deltaTime);
            transform.forward = direccion;
        }
    }
}
