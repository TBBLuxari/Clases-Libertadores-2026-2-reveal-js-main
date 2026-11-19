# rig_351_capturas_control_pie.py - capturas de clase-12 para el control del pie SIN grupo offset:
# 18n circulo movido y escalado (valores sueltos), 19a menu Modify > Freeze Transformations, 19b tras congelar (ceros), 21n jerarquia.
import importlib
import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds
import rig_lib
importlib.reload(rig_lib)
hs = rig_lib.hs_lib
QRect = rig_lib.QtCore.QRect
S = "C:/Users/JuanT/OneDrive/Escritorio/Clases libertadores/ejemplos/diseno-3d/cuerpo/borrador/img"
RECORTE = QRect(0, 128, 1640, 752)
RECORTE_CB = QRect(0, 128, 1920, 752)


def mostrar(sel):
    cmds.select(clear=True)
    cmds.outlinerEditor("outlinerPanel1", edit=True, expandAllItems=False)
    hs.esperar(60)
    cmds.select(sel)
    cmds.outlinerEditor("outlinerPanel1", edit=True, showSelected=True)
    hs.esperar(150)


def vista_persp(objs):
    cmds.setAttr("persp.translate", 70, 45, 75)
    cmds.setAttr("persp.rotate", -22, 42, 0)
    rig_lib.vista("persp", seleccion=objs, xray=False, malla_alambre=False, joints_encima=True)


cmds.setToolTo("selectSuperContext")
cmds.select(clear=True)
if cmds.objExists("grp_talon_L") and cmds.listRelatives("grp_talon_L", parent=True) == ["ctrl_pie_L"]:
    cmds.parent("grp_talon_L", world=True)
if cmds.objExists("ctrl_pie_L"):
    cmds.delete("ctrl_pie_L")
# 18n: circulo por defecto, escalado y llevado al pie con Mover/Escalar (queda con valores sueltos)
c = cmds.circle(name="ctrl_pie_L", normal=(0, 1, 0), constructionHistory=False)[0]
cmds.setAttr(c + ".scale", 12, 12, 12)
cmds.setAttr(c + ".translate", 16.6, 0.5, 3.0)
vista_persp([c, "tobillo_L_JNT", "punta_L_JNT"])
mostrar([c])
rig_lib.captura(S + "/18n_circulo_sobre_el_pie.png", [
    {"rect": QRect(1643, 192, 255, 152), "num": 1, "texto": "Valores sueltos", "pos": (1380, 200)}], recorte=RECORTE_CB, escala=0.85)

# 19a: menu Modify > Freeze Transformations
rig_lib.captura_menu("main", ["Modify", "Freeze Transformations"], S + "/19a_menu_freeze.png")

# 19b: despues de congelar: todo en cero y el circulo sigue en su sitio
cmds.select(c)
cmds.makeIdentity(c, apply=True, translate=True, rotate=True, scale=True, normal=False)
mostrar([c])
rig_lib.captura(S + "/19b_congelado.png", [
    {"rect": QRect(1643, 192, 255, 152), "num": 1, "texto": "Todo en cero", "pos": (1380, 260)}], recorte=RECORTE_CB, escala=0.85)

# 21n: los grupos entran en el control
cmds.parent("grp_talon_L", c)
mostrar([c, "ik_pierna_L"])
cmds.select(c)
rig_lib.captura(S + "/21n_jerarquia_control.png", [
    {"rect": rig_lib.rect_de("outlinerPanel1"), "num": 1, "texto": "Jerarquía: ctrl_pie_L > grupos > IK", "lado": "dentro", "dy": 540}], recorte=RECORTE)
print("listo")
