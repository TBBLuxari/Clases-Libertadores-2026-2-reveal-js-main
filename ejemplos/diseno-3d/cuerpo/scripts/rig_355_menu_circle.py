# rig_355_menu_circle.py - captura Create > NURBS Primitives > Circle resaltando el item (sin el cuadrito de opciones).
import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds
import rig_lib
S = "C:/Users/JuanT/OneDrive/Escritorio/Clases libertadores/ejemplos/diseno-3d/cuerpo/borrador/img"
cmds.select(clear=True)
rig_lib.captura_menu("main", ["Create", "NURBS Primitives", "Circle"], S + "/16n_menu_circle.png", opcion=False)
print("ok")
