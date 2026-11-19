# rig_361_roll_tres_grupos.py - clase-12: atributo Roll (25n), Set Driven Key con 3 grupos (6 llaves), hoja de 4 poses (29n).
import importlib
import os
import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds
import rig_lib
importlib.reload(rig_lib)
from PySide6 import QtGui, QtCore
hs = rig_lib.hs_lib
QRect = rig_lib.QtCore.QRect
S = "C:/Users/JuanT/OneDrive/Escritorio/Clases libertadores/ejemplos/diseno-3d/cuerpo/borrador/img"


def mostrar(sel):
    cmds.select(clear=True)
    cmds.outlinerEditor("outlinerPanel1", edit=True, expandAllItems=False)
    hs.esperar(60)
    cmds.select(sel)
    cmds.outlinerEditor("outlinerPanel1", edit=True, showSelected=True)
    hs.esperar(150)


cmds.setToolTo("selectSuperContext")
if not cmds.attributeQuery("Roll", node="ctrl_pie_L", exists=True):
    cmds.addAttr("ctrl_pie_L", longName="Roll", attributeType="double", minValue=-10, maxValue=10, defaultValue=0, keyable=True)

# 25n: Channel Box con Roll (y el Outliner con la jerarquia nueva)
cmds.setAttr("persp.translate", 70, 45, 75)
cmds.setAttr("persp.rotate", -22, 42, 0)
rig_lib.vista("persp", seleccion=["ctrl_pie_L", "tobillo_L_JNT", "punta_L_JNT"], xray=False, malla_alambre=False, joints_encima=True)
mostrar(["ctrl_pie_L"])
cmds.select("ctrl_pie_L")
hs.esperar(100)
rig_lib.captura(S + "/25n_channel_box_roll.png", [
    {"rect": QRect(1643, 352, 255, 22), "num": 1, "texto": "Roll aparece en el Channel Box", "pos": (1380, 330)}], recorte=QRect(0, 128, 1920, 752), escala=0.85)

# Set Driven Key (6 llaves, tangentes lineales)
D = "ctrl_pie_L.Roll"


def sdk(destino, driver_val, valor):
    cmds.setDrivenKeyframe(destino, currentDriver=D, driverValue=driver_val, value=valor, inTangentType="linear", outTangentType="linear")


sdk("grp_talon_L.rx", -10, -30)
sdk("grp_talon_L.rx", 0, 0)
sdk("grp_bola_L.rx", 0, 0)
sdk("grp_bola_L.rx", 5, 30)
sdk("grp_punta_L.rx", 5, 0)
sdk("grp_punta_L.rx", 10, 60)
cmds.select(clear=True)

# 29n: hoja de 4 poses
poses = [(-10, "Roll = -10: apoya el talón, la punta sube"), (0, "Roll = 0: pie plano"), (5, "Roll = 5: talón arriba, la bola apoyada"), (10, "Roll = 10: pie sobre la punta")]
W = 560
imgs = []
cmds.jointDisplayScale(2.0)
for roll, txt in poses:
    cmds.setAttr(D, roll)
    rig_lib.vista(camara="side", ancho=64, centro=(5, 30), joints_encima=True, malla_alambre=False, xray=True)
    tmp = os.path.join(os.environ.get("TEMP", "C:/Temp"), "rig_hoja").replace("\\", "/")
    cmds.playblast(frame=cmds.currentTime(q=True), format="image", compression="png", completeFilename=tmp + ".png", widthHeight=(W, W), percent=100, showOrnaments=False, viewer=False, offScreen=False, forceOverwrite=True, framePadding=0)
    cand = sorted([f for f in os.listdir(os.path.dirname(tmp)) if f.startswith("rig_hoja") and f.endswith(".png")], key=lambda f: os.path.getmtime(os.path.join(os.path.dirname(tmp), f)))
    imgs.append((QtGui.QImage(os.path.join(os.path.dirname(tmp), cand[-1])), txt))
cmds.setAttr(D, 0)
hoja = QtGui.QImage(2 * W + 30, 2 * (W + 44) + 10, QtGui.QImage.Format_RGB32)
hoja.fill(QtGui.QColor(255, 255, 255))
p = QtGui.QPainter(hoja)
f = QtGui.QFont("Segoe UI", 15)
f.setBold(True)
p.setFont(f)
for i, (im, txt) in enumerate(imgs):
    x = 10 + (i % 2) * (W + 10)
    y = 5 + (i // 2) * (W + 49)
    p.setPen(QtGui.QColor(30, 30, 30))
    p.drawText(QtCore.QRect(x, y, W, 38), QtCore.Qt.AlignVCenter | QtCore.Qt.AlignLeft, txt)
    p.drawImage(x, y + 40, im)
p.end()
print("poses guardadas:", hoja.save(S + "/29n_roll_4_poses.png"))
print("listo; Roll =", cmds.getAttr(D))
