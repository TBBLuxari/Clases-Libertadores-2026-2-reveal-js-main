# rig_221_pruebas_reglas.py - PRUEBA: con el rig en una pose, mover/rotar/escalar ctrl_global debe mover TODO como un cuerpo rigido (joints y malla).
import maya.cmds as cmds

G = "ctrl_global"
joints = cmds.ls(type="joint")
n = cmds.polyEvaluate("Modelo", vertex=True)
muestra = list(range(0, n, 20))


def tomar():
    j = {x: cmds.xform(x, q=True, ws=True, t=True) for x in joints}
    pts = cmds.xform("Modelo.vtx[*]", q=True, ws=True, t=True)
    v = [(pts[3 * i], pts[3 * i + 1], pts[3 * i + 2]) for i in muestra]
    return j, v


def reset_global():
    for a in ("tx", "ty", "tz", "rx", "ry", "rz"):
        cmds.setAttr("%s.%s" % (G, a), 0)
    cmds.setAttr(G + ".sx", 1)


def posar(activar):
    s = 1 if activar else 0
    cmds.setAttr("ctrl_pie_L.Roll", 5 * s)
    cmds.setAttr("ctrl_pie_R.translateZ", 12 * s)
    cmds.setAttr("ctrl_pie_R.rotateY", 20 * s)
    cmds.setAttr("ctrl_mano_L.translateX", -25 * s)
    cmds.setAttr("ctrl_mano_L.translateY", -15 * s)
    cmds.setAttr("ctrl_mano_L.translateZ", 20 * s)
    cmds.setAttr("ctrl_columna1.rotateX", 15 * s)
    cmds.setAttr("ctrl_pecho.rotateY", 25 * s)
    cmds.setAttr("ctrl_cabeza.rotateY", -20 * s)
    cmds.setAttr("ctrl_cadera.translateY", -6 * s)


def dist(a, b):
    return sum((a[i] - b[i]) ** 2 for i in range(3)) ** 0.5


def mover(p, m):
    x, y, z = p
    return (x * m[0] + y * m[4] + z * m[8] + m[12], x * m[1] + y * m[5] + z * m[9] + m[13], x * m[2] + y * m[6] + z * m[10] + m[14])


reset_global()
posar(False)
jr, vr = tomar()
posar(True)
j0, v0 = tomar()
cambio = max(dist(vr[i], v0[i]) for i in range(len(v0)))
print("pose real: la malla se movio hasta %.1f cm respecto a la pose de reposo" % cambio)

casos = [
    ("mover (40, 0, -25)", {"tx": 40, "tz": -25}),
    ("rotar Y 90", {"ry": 90}),
    ("rotar (30, -45, 20)", {"rx": 30, "ry": -45, "rz": 20}),
    ("escalar x2", {"sx": 2}),
    ("escalar x0.5", {"sx": 0.5}),
    ("todo junto: mover + rotar + escalar 1.7", {"tx": -30, "ty": 10, "tz": 20, "rx": 15, "ry": -60, "rz": 10, "sx": 1.7}),
]
peor = 0
for nombre, vals in casos:
    reset_global()
    for k, v in vals.items():
        cmds.setAttr("%s.%s" % (G, k), v)
    m = cmds.xform(G, q=True, ws=True, matrix=True)
    j1, v1 = tomar()
    ej = max(dist(j1[x], mover(j0[x], m)) for x in joints)
    ev = max(dist(v1[i], mover(v0[i], m)) for i in range(len(v0)))
    peor = max(peor, ej, ev)
    print("%-45s error joints %.4f cm | error malla %.4f cm" % (nombre, ej, ev))
reset_global()
posar(False)
print("PEOR ERROR:", round(peor, 4), "cm (0 = todo se movio como un cuerpo rigido)")
