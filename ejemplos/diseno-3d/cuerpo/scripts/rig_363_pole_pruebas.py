# rig_363_pole_pruebas.py - clase-12: 35an locator al frente y 35bn locator al costado, con el pie levantado (Translate Y 22).
import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds
import rig_lib
hs = rig_lib.hs_lib
QRect = rig_lib.QtCore.QRect
S = "C:/Users/JuanT/OneDrive/Escritorio/Clases libertadores/ejemplos/diseno-3d/cuerpo/borrador/img"
RECORTE = QRect(0, 128, 1640, 752)
DY = -22
loc = "pv_rodilla_L"
cmds.setAttr("ctrl_pie_L.translateY", 22)
cmds.setAttr("persp.translate", 95, 60, 130)
cmds.setAttr("persp.rotate", -15, 35, 0)
rig_lib.vista("persp", seleccion=["muslo_L_JNT", "punta_L_JNT", loc], xray=False, malla_alambre=False, joints_encima=True)


def caja(w, tam=50):
    p = rig_lib.pantalla(w)
    return QRect(p.x() - tam // 2, p.y() + DY - tam // 2, tam, tam), (p.x(), p.y() + DY)


def mostrar(sel):
    cmds.select(clear=True)
    cmds.outlinerEditor("outlinerPanel1", edit=True, expandAllItems=False)
    hs.esperar(60)
    cmds.select(sel)
    cmds.outlinerEditor("outlinerPanel1", edit=True, showSelected=True)
    hs.esperar(150)


mostrar([loc])
cmds.select(loc)
hs.esperar(100)
rod = cmds.xform("rodilla_L_JNT", q=True, ws=True, t=True)
r1, (x1, y1) = caja(rod)
rig_lib.captura(S + "/35an_locator_al_frente.png", [
    {"rect": r1, "num": 1, "texto": "Locator al frente: la rodilla mira al frente", "pos": (x1 + 120, y1 - 140)}], recorte=RECORTE)
print("rodilla con locator al frente:", [round(v, 1) for v in rod])
cmds.setAttr(loc + ".translateX", 40)
cmds.select(loc)
hs.esperar(100)
rod = cmds.xform("rodilla_L_JNT", q=True, ws=True, t=True)
r2, (x2, y2) = caja(rod)
rig_lib.captura(S + "/35bn_locator_al_costado.png", [
    {"rect": r2, "num": 1, "texto": "Locator al costado: la rodilla gira hacia afuera", "pos": (x2 + 120, y2 - 140)}], recorte=RECORTE)
print("rodilla con locator al costado (x+40):", [round(v, 1) for v in rod])
cmds.setAttr(loc + ".translateX", 0)
cmds.setAttr("ctrl_pie_L.translateY", 0)
cmds.select(clear=True)
print("listo")
