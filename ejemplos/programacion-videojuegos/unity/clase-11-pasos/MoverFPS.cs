using UnityEngine;

public class MoverFPS : MonoBehaviour
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
        Vector3 movimiento = transform.right * x + transform.forward * z;

        controlador.Move(movimiento.normalized * velocidad * Time.deltaTime);
    }
}
