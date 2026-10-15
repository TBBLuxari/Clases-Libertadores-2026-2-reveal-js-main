using UnityEngine;
using TMPro;

public class MarcadorRuta : MonoBehaviour
{
    public TanqueRuta tanque1;
    public TanqueRuta tanque2;
    public TanqueRuta tanque3;
    public TanqueRuta tanque4;

    public TextMeshProUGUI texto1;
    public TextMeshProUGUI texto2;
    public TextMeshProUGUI texto3;
    public TextMeshProUGUI texto4;
    public TextMeshProUGUI textoCentral;

    void Update()
    {
        MostrarJugador(texto1, "J1", tanque1);
        MostrarJugador(texto2, "J2", tanque2);
        MostrarJugador(texto3, "J3", tanque3);
        MostrarJugador(texto4, "J4", tanque4);

        int vivos = 0;
        if (tanque1.vivo)
        {
            vivos++;
        }
        if (tanque2.vivo)
        {
            vivos++;
        }
        if (tanque3.vivo)
        {
            vivos++;
        }
        if (tanque4.vivo)
        {
            vivos++;
        }

        if (vivos == 0)
        {
            textoCentral.text = "Nadie ganó";
        }

        if (vivos == 1)
        {
            if (tanque1.vivo)
            {
                textoCentral.text = "¡Ganó J1!";
            }
            if (tanque2.vivo)
            {
                textoCentral.text = "¡Ganó J2!";
            }
            if (tanque3.vivo)
            {
                textoCentral.text = "¡Ganó J3!";
            }
            if (tanque4.vivo)
            {
                textoCentral.text = "¡Ganó J4!";
            }
        }
    }

    void MostrarJugador(TextMeshProUGUI texto, string nombre, TanqueRuta tanque)
    {
        if (tanque.vivo)
        {
            texto.text = nombre + ": " + tanque.puntos;
        }
        else
        {
            texto.text = nombre + ": fuera (" + tanque.puntos + ")";
        }
    }
}
