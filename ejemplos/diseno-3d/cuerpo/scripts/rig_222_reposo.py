# rig_222_reposo.py - SOLO LECTURA: en reposo los controles deben estar en cero, la escala bloqueada y la malla sin deformar.
import maya.cmds as cmds

print("bbox malla:", [round(v, 2) for v in cmds.exactWorldBoundingBox("Modelo")], "(original: -88.98 0.41 -11.39 88.98 176.92 16.83)")
sucios = []
sin_bloqueo = []
for c in cmds.ls("ctrl_*", "pv_*", type="transform"):
    if cmds.listRelatives(c, shapes=True) is None:
        continue
    for a in ("tx", "ty", "tz", "rx", "ry", "rz"):
        v = cmds.getAttr("%s.%s" % (c, a))
        if abs(v) > 1e-4:
            sucios.append((c, a, round(v, 3)))
    if c != "ctrl_global":
        for a in ("sx", "sy", "sz"):
            if not cmds.getAttr("%s.%s" % (c, a), lock=True):
                sin_bloqueo.append((c, a))
print("canales distintos de cero en reposo:", sucios)
print("escala sin bloquear (fuera de ctrl_global):", sin_bloqueo)
print("ctrl_global bloqueos sy/sz:", cmds.getAttr("ctrl_global.sy", lock=True), cmds.getAttr("ctrl_global.sz", lock=True), "| conexion sx->sy:", cmds.listConnections("ctrl_global.sy", plugs=True, source=True))
print("hijos de personaje:", cmds.listRelatives("personaje", children=True))
print("hijos de ctrl_global:", cmds.listRelatives("ctrl_global", children=True, type="transform"))
print("IK handles:", cmds.ls(type="ikHandle"))
print("padre de cada IK:", {h: cmds.listRelatives(h, parent=True)[0] for h in cmds.ls(type="ikHandle")})
print("transform de la malla:", [round(cmds.getAttr("Modelo." + a), 3) for a in ("tx", "ty", "tz", "rx", "ry", "rz", "sx")])
