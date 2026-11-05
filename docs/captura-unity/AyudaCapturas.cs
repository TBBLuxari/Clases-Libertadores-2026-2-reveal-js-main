using System.IO;
using System.Reflection;
using UnityEditor;
using UnityEngine;
using UnityEngine.SceneManagement;

// Ayudas para sacar capturas de pantalla fiables de la ventana de Unity.
// Unity no repinta sus paneles cuando está en segundo plano, así que estos comandos lo fuerzan.
public static class AyudaCapturas
{
    [MenuItem("Window/Clase/Repintar todo")]
    public static void RepintarTodo()
    {
        ActiveEditorTracker.sharedTracker.ForceRebuild();
        UnityEditorInternal.InternalEditorUtility.RepaintAllViews();
        EditorApplication.RepaintHierarchyWindow();
        EditorApplication.RepaintProjectWindow();

        EditorWindow[] ventanas = Resources.FindObjectsOfTypeAll<EditorWindow>();

        for (int i = 0; i < ventanas.Length; i++)
        {
            ventanas[i].Repaint();
        }
    }

    [MenuItem("Window/Clase/Probar golpe (solo en Play)")]
    public static void ProbarGolpe()
    {
        if (Application.isPlaying == false)
        {
            return;
        }

        GameObject jugador = GameObject.FindWithTag("Player");

        if (jugador != null)
        {
            jugador.SendMessage("Pegar", SendMessageOptions.DontRequireReceiver);
        }
    }

    [MenuItem("Window/Clase/Probar disparo (solo en Play)")]
    public static void ProbarDisparo()
    {
        if (Application.isPlaying == false)
        {
            return;
        }

        if (Camera.main != null)
        {
            Camera.main.gameObject.SendMessage("Disparar", SendMessageOptions.DontRequireReceiver);
        }
    }

    [MenuItem("Window/Clase/Desplegar componentes")]
    public static void DesplegarComponentes()
    {
        GameObject seleccionado = Selection.activeGameObject;

        if (seleccionado != null)
        {
            Component[] componentes = seleccionado.GetComponents<Component>();

            for (int i = 0; i < componentes.Length; i++)
            {
                bool desplegar = true;

                if (componentes[i] == null)
                {
                    continue;
                }

                string nombreTipo = componentes[i].GetType().Name;

                if (nombreTipo.StartsWith("UniversalAdditional") == true || nombreTipo == "Camera" || nombreTipo == "Light" || nombreTipo == "MeshFilter" || nombreTipo == "MeshRenderer")
                {
                    desplegar = false;
                }

                UnityEditorInternal.InternalEditorUtility.SetIsInspectorExpanded(componentes[i], desplegar);

                if (desplegar == false)
                {
                    continue;
                }

                SerializedObject serializado = new SerializedObject(componentes[i]);
                SerializedProperty propiedad = serializado.GetIterator();

                while (propiedad.NextVisible(true) == true)
                {
                    if (propiedad.isArray == true && propiedad.propertyType != SerializedPropertyType.String)
                    {
                        propiedad.isExpanded = true;
                    }
                }
            }
        }

        RepintarTodo();
    }

    [MenuItem("Window/Clase/Mostrar Tags y Layers")]
    public static void MostrarTagsYLayers()
    {
        Object administrador = Unsupported.GetSerializedAssetInterfaceSingleton("TagManager");
        Selection.activeObject = administrador;

        SerializedObject serializado = new SerializedObject(administrador);
        serializado.FindProperty("layers").isExpanded = true;

        RepintarTodo();
    }

    [MenuItem("Window/Clase/Expandir jerarquia")]
    public static void ExpandirJerarquia()
    {
        System.Type tipo = typeof(Editor).Assembly.GetType("UnityEditor.SceneHierarchyWindow");
        Object[] ventanas = Resources.FindObjectsOfTypeAll(tipo);

        if (ventanas.Length == 0)
        {
            return;
        }

        MethodInfo metodo = tipo.GetMethod("SetExpandedRecursive", BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);
        GameObject[] raices = SceneManager.GetActiveScene().GetRootGameObjects();

        for (int i = 0; i < raices.Length; i++)
        {
            metodo.Invoke(ventanas[0], new object[] { raices[i].GetInstanceID(), true });
        }

        RepintarTodo();
    }

    [MenuItem("Window/Clase/Mostrar carpeta de Temp-ruta.txt")]
    public static void MostrarCarpeta()
    {
        string archivo = Path.Combine(Directory.GetCurrentDirectory(), "Temp", "ruta.txt");

        if (File.Exists(archivo) == false)
        {
            return;
        }

        string ruta = File.ReadAllText(archivo).Trim();
        Object objeto = AssetDatabase.LoadAssetAtPath<Object>(ruta);

        if (objeto != null)
        {
            EditorUtility.FocusProjectWindow();
            Selection.activeObject = objeto;
            EditorGUIUtility.PingObject(objeto);
        }

        RepintarTodo();
    }
}
