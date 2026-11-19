# rig_362_pole_vector_sin_grupo.py - clase-12: locator sin grupo offset. 31n locator (valores sueltos), 32n seleccion, 34n constraint, 35an / 35bn pruebas con el pie levantado.
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
DY = -22
cmds.setToolTo("selectSuperContext")
cmds.setAttr("ctrl_pie_L.Roll", 0)
if cmds.objExists("pv_rodilla_L"):
    raise RuntimeError("pv_rodilla_L ya existe")


def mostrar(sel):
    cmds.select(clear=True)
    cmds.outlinerEditor("outlinerPanel1", edit=True, expandAllItems=False)
    hs.esperar(60)
    cmds.select(sel)
    cmds.outlinerEditor("outlinerPanel1", edit=True, showSelected=True)
    hs.esperar(150)


def caja(w, tam=44):
    p = rig_lib.pantalla(w)
    return QRect(p.x() - tam // 2, p.y() + DY - tam // 2, tam, tam), (p.x(), p.y() + DY)


def pos(n):
    return [round(v, 2) for v in cmds.xform(n, q=True, ws=True, t=True)]


cmds.select(clear=True)
rig_lib.vista("side", ancho=170, centro=(14, 46), xray=False, malla_alambre=False, joints_encima=True)

# 31n: locator movido a mano delante de la rodilla (valores sueltos en el Channel Box)
loc = cmds.spaceLocator(name="pv_rodilla_L")[0]
cmds.setAttr(loc + ".translate", 12.0, 50.0, 40.0)
cmds.select(loc)
rig_lib.vista("side", ancho=170, centro=(14, 46), xray=False, malla_alambre=False, joints_encima=True)
cmds.select(loc)
mostrar([loc])
hs.esperar(100)
r, (x, y) = caja((12.0, 50.0, 40.0))
rig_lib.captura(S + "/31n_locator_frente_rodilla.png", [
    {"rect": r, "num": 1, "texto": "El locator va delante de la rodilla", "pos": (x + 180, y - 120)},
    {"rect": QRect(1643, 192, 255, 50), "num": 2}], recorte=RECORTE_CB, escala=0.85)
cmds.makeIdentity(loc, apply=True, translate=True, rotate=True, scale=True, normal=False)

# 32n: seleccion (locator primero, IK handle despues)
mostrar([loc, "ik_pierna_L"])
rig_lib.captura(S + "/32n_seleccion_locator_e_ik.png", [
    {"rect": rig_lib.rect_de("outlinerPanel1"), "num": 1, "texto": "Primero el locator, después ik_pierna_L", "lado": "dentro", "dy": 540}], recorte=RECORTE)

# 34n: constraint creado
antes = {n: pos(n) for n in ("rodilla_L_JNT", "bola_L_JNT", "punta_L_JNT")}
cmds.select(loc, "ik_pierna_L")
pvc = cmds.poleVectorConstraint(loc, "ik_pierna_L")[0]
despues = {n: pos(n) for n in antes}
print("constraint:", pvc, "| reposo antes", antes, "| despues", despues, "| twist", cmds.getAttr("ik_pierna_L.twist"))
cmds.select("ik_pierna_L")
mostrar(["ik_pierna_L", pvc])
rig_lib.vista("side", ancho=170, centro=(14, 46), xray=False, malla_alambre=False, joints_encima=True)
r, (x, y) = caja((12.0, 50.0, 40.0))
rig_lib.captura(S + "/34n_pole_vector_creado.png", [
    {"rect": rig_lib.rect_de("outlinerPanel1"), "num": 1, "texto": "El constraint cuelga del IK Handle", "lado": "dentro", "dy": 540}], recorte=RECORTE)
print("listo hasta 34n")
