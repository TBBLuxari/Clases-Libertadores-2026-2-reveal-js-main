# rig_360_tres_grupos.py - desde pie_inicio.ma: 3 IK + 3 grupos (talon, punta, bola) con capturas de clase-12:
# 10n tres grupos vacios, 11a pivote en el origen, 11b talon, 12n punta, 13n bola, 14n anidados, 15n IK dentro, 21n control con los grupos.
import importlib
import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds
import maya.mel as mel
import rig_lib
importlib.reload(rig_lib)
hs = rig_lib.hs_lib
QRect = rig_lib.QtCore.QRect
S = "C:/Users/JuanT/OneDrive/Escritorio/Clases libertadores/ejemplos/diseno-3d/cuerpo/borrador/img"
RECORTE = QRect(0, 128, 1640, 752)
DY = -22
if cmds.objExists("grp_talon_L"):
    raise RuntimeError("ya existe grp_talon_L (abrir pie_inicio.ma)")
mel.eval("setPolyCountVisibility 0")
cmds.grid(size=200, spacing=5, divisions=1)
cmds.jointDisplayScale(2.0)
cmds.setToolTo("selectSuperContext")


def mostrar(sel):
    cmds.select(clear=True)
    cmds.outlinerEditor("outlinerPanel1", edit=True, expandAllItems=False)
    hs.esperar(60)
    cmds.select(sel)
    cmds.outlinerEditor("outlinerPanel1", edit=True, showSelected=True)
    hs.esperar(150)


def marca_pivote(w, texto, dx, dy, num=1):
    p = rig_lib.pantalla(w)
    x, y = p.x(), p.y() + DY
    return {"rect": QRect(x - 18, y - 18, 36, 36), "num": num, "texto": texto, "pos": (x + dx, y + dy), "punto": True}


def captura_pivote(nombre, grupo, piv, texto, dx, dy):
    cmds.select(grupo)
    hs.esperar(60)
    rig_lib.captura(S + "/" + nombre + ".png", [marca_pivote(piv, texto, dx, dy)], recorte=RECORTE)


# IK (sin capturas: 05 a 08 ya estan aprobadas)
ik1 = cmds.ikHandle(startJoint="muslo_L_JNT", endEffector="tobillo_L_JNT", solver="ikRPsolver", name="ik_pierna_L")[0]
ik2 = cmds.ikHandle(startJoint="tobillo_L_JNT", endEffector="bola_L_JNT", solver="ikSCsolver", name="ik_bola_L")[0]
ik3 = cmds.ikHandle(startJoint="bola_L_JNT", endEffector="punta_L_JNT", solver="ikSCsolver", name="ik_punta_L")[0]
cmds.select(clear=True)
rig_lib.vista("side", ancho=40, centro=(4, 10), xray=False, malla_alambre=False, joints_encima=True)

# 10n: tres grupos vacios
for n in ("grp_talon_L", "grp_punta_L", "grp_bola_L"):
    cmds.select(clear=True)
    cmds.group(empty=True, name=n)
cmds.select(clear=True)
hs.esperar(60)
rig_lib.captura(S + "/10n_tres_grupos.png", [
    {"rect": rig_lib.rect_de("outlinerPanel1"), "num": 1, "texto": "Tres grupos vacíos (Ctrl+G sin nada seleccionado)", "lado": "dentro", "dy": 420}], recorte=RECORTE)

# 11a: pivote en el origen; 11b talon; 12n punta; 13n bola (a la altura del suelo)
PIV = {"grp_talon_L": (14.59, 0.5, -7.87), "grp_punta_L": (16.98, 0.5, 16.33), "grp_bola_L": (18.2, 0.5, 10.0)}
cmds.select("grp_talon_L")
cmds.setToolTo("moveSuperContext")
mel.eval("ctxEditMode")
for n in PIV:
    cmds.xform(n, ws=True, piv=(0, 0, 0))
captura_pivote("11a_pivote_origen_n", "grp_talon_L", (0, 0, 0), "El pivote nace en el origen del mundo", 100, -150)
cmds.xform("grp_talon_L", ws=True, piv=PIV["grp_talon_L"])
captura_pivote("11b_pivote_talon_n", "grp_talon_L", PIV["grp_talon_L"], "Pivote del talón (grp_talon_L)", -330, -150)
cmds.xform("grp_punta_L", ws=True, piv=PIV["grp_punta_L"])
captura_pivote("12n_pivote_punta", "grp_punta_L", PIV["grp_punta_L"], "Pivote de la punta (grp_punta_L)", 80, -200)
cmds.xform("grp_bola_L", ws=True, piv=PIV["grp_bola_L"])
captura_pivote("13n_pivote_bola", "grp_bola_L", PIV["grp_bola_L"], "Pivote de la bola (grp_bola_L), en el suelo", -150, -230)
mel.eval("ctxEditMode")
cmds.setToolTo("selectSuperContext")

# 14n: anidar talon > punta > bola
cmds.parent("grp_punta_L", "grp_talon_L")
cmds.parent("grp_bola_L", "grp_punta_L")
mostrar(["grp_bola_L"])
rig_lib.captura(S + "/14n_grupos_anidados.png", [
    {"rect": rig_lib.rect_de("outlinerPanel1"), "num": 1, "texto": "talón > punta > bola", "lado": "dentro", "dy": 540}], recorte=RECORTE)

# 15n: IK dentro de los grupos (pierna y bola en grp_bola_L; punta en grp_punta_L)
cmds.parent(ik1, "grp_bola_L")
cmds.parent(ik2, "grp_bola_L")
cmds.parent(ik3, "grp_punta_L")
mostrar([ik1, ik2, ik3])
rig_lib.captura(S + "/15n_ik_dentro_de_grupos.png", [
    {"rect": rig_lib.rect_de("outlinerPanel1"), "num": 1, "texto": "Los IK de la pierna y la bola en grp_bola_L, el de la punta en grp_punta_L", "lado": "dentro", "dy": 540}], recorte=RECORTE)

# control del pie: circulo, escalar, mover, congelar, grupos adentro (pasos 17 a 22 ya capturados)
c = cmds.circle(name="ctrl_pie_L", normal=(0, 1, 0), constructionHistory=False)[0]
cmds.setAttr(c + ".scale", 12, 12, 12)
cmds.setAttr(c + ".translate", 16.6, 0.5, 3.0)
cmds.makeIdentity(c, apply=True, translate=True, rotate=True, scale=True, normal=False)
cmds.parent("grp_talon_L", c)
cmds.setAttr("persp.translate", 70, 45, 75)
cmds.setAttr("persp.rotate", -22, 42, 0)
rig_lib.vista("persp", seleccion=[c, "tobillo_L_JNT", "punta_L_JNT"], xray=False, malla_alambre=False, joints_encima=True)
mostrar([c, ik1, ik3])
cmds.select(c)
rig_lib.captura(S + "/21n_jerarquia_control.png", [
    {"rect": rig_lib.rect_de("outlinerPanel1"), "num": 1, "texto": "Jerarquía: ctrl_pie_L > grupos > IK", "lado": "dentro", "dy": 540}], recorte=RECORTE)
print("listo")
