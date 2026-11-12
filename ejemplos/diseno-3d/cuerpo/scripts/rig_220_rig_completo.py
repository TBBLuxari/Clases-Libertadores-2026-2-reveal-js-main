# rig_220_rig_completo.py - PRUEBA: rig completo con control global (mover, rotar y escalar sin romperse).
# personaje > geo_GRP (malla) | ctrl_global > esqueleto_GRP (joints) + controles_GRP (controles, IK, pole vectors)
import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds

RIG = "C:/Users/JuanT/OneDrive/Escritorio/Clases libertadores/ejemplos/diseno-3d/rigging/"
cmds.file(RIG + "escenas/modelo_completo.ma", open=True, force=True)
cmds.select(clear=True)

# ---------- 1. Orden de la escena ----------
personaje = cmds.group(empty=True, name="personaje")
geo = cmds.group(empty=True, name="geo_GRP", parent=personaje)
cmds.parent("Modelo", geo)
ctrl_global = cmds.circle(name="ctrl_global", normal=(0, 1, 0), radius=60, constructionHistory=False)[0]
cmds.parent(ctrl_global, personaje)
esq = cmds.group(empty=True, name="esqueleto_GRP", parent=ctrl_global)
ctl = cmds.group(empty=True, name="controles_GRP", parent=ctrl_global)

# ---------- 2. Joints ----------
cmds.select(clear=True)
cad = cmds.joint(p=(0, 92, 3), name="cadera_JNT")
c1 = cmds.joint(p=(0, 104, 4.5), name="columna1_JNT")
c2 = cmds.joint(p=(0, 118, 4), name="columna2_JNT")
pecho = cmds.joint(p=(0, 132, 2), name="pecho_JNT")
cuello = cmds.joint(p=(0, 148, 1.5), name="cuello_JNT")
cabeza = cmds.joint(p=(0, 158, 1.5), name="cabeza_JNT")
cfin = cmds.joint(p=(0, 176, 1.5), name="cabeza_fin_JNT")
cmds.joint(cad, edit=True, orientJoint="yzx", secondaryAxisOrient="zup", children=True, zeroScaleOrient=True)
cmds.joint(cfin, edit=True, orientJoint="none", zeroScaleOrient=True)
cmds.select(pecho)
cla = cmds.joint(p=(4, 144, -1), name="clavicula_L_JNT")
hom = cmds.joint(p=(20, 141.5, -4), name="hombro_L_JNT")
cod = cmds.joint(p=(45, 140.5, -4), name="codo_L_JNT")
mun = cmds.joint(p=(70, 141.5, -4), name="muneca_L_JNT")
man = cmds.joint(p=(85, 141.5, -4), name="mano_L_JNT")
cmds.joint(cla, edit=True, orientJoint="xyz", secondaryAxisOrient="yup", children=True, zeroScaleOrient=True)
cmds.joint(man, edit=True, orientJoint="none", zeroScaleOrient=True)
cmds.select(cad)
mus = cmds.joint(p=(9.5, 88, 1.5), name="muslo_L_JNT")
rod = cmds.joint(p=(12.0, 50, 1.2), name="rodilla_L_JNT")
tob = cmds.joint(p=(15.2, 9.5, -3.4), name="tobillo_L_JNT")
bol = cmds.joint(p=(18.2, 2.5, 10.0), name="bola_L_JNT")
pun = cmds.joint(p=(17.6, 1.2, 16.4), name="punta_L_JNT")
cmds.joint(mus, edit=True, orientJoint="xyz", secondaryAxisOrient="zup", children=True, zeroScaleOrient=True)
cmds.joint(pun, edit=True, orientJoint="none", zeroScaleOrient=True)
cmds.joint(rod, edit=True, setPreferredAngles=True)
cmds.joint(cod, edit=True, setPreferredAngles=True)
cmds.mirrorJoint(cla, mirrorYZ=True, mirrorBehavior=True, searchReplace=("_L_", "_R_"))
cmds.mirrorJoint(mus, mirrorYZ=True, mirrorBehavior=True, searchReplace=("_L_", "_R_"))
cmds.parent(cad, esq)

# ---------- 3. Skin (Closest distance) ----------
joints = cmds.listRelatives(cad, allDescendents=True, type="joint") + [cad]
cmds.skinCluster(joints, "Modelo", toSelectedBones=True, bindMethod=0, skinMethod=0, normalizeWeights=1, maximumInfluences=4, obeyMaxInfluences=True, name="skin_cuerpo")
cmds.select(clear=True)

# ---------- 4. Controles ----------
COL = {"C": 17, "L": 6, "R": 13}


def control(nombre, pos, radio, normal=(0, 1, 0), lado="C", padre=None):
    c = cmds.circle(name=nombre, normal=normal, radius=radio, constructionHistory=False)[0]
    off = cmds.group(c, name=nombre + "_OFF")
    cmds.xform(off, ws=True, piv=(0, 0, 0))
    cmds.setAttr(off + ".translate", pos[0], pos[1], pos[2])
    cmds.parent(off, padre or ctl)
    sh = cmds.listRelatives(c, shapes=True)[0]
    cmds.setAttr(sh + ".overrideEnabled", 1)
    cmds.setAttr(sh + ".overrideColor", COL[lado])
    for a in ("sx", "sy", "sz", "v"):
        cmds.setAttr("%s.%s" % (c, a), lock=True, keyable=False, channelBox=False)
    return c


def pos(j):
    return cmds.xform(j, q=True, ws=True, t=True)


# Columna, cuello y cabeza en FK
prev = None
ctrls = {}
for n, r in (("cadera", 14), ("columna1", 13), ("columna2", 14), ("pecho", 16), ("cuello", 7), ("cabeza", 11)):
    c = control("ctrl_" + n, pos(n + "_JNT"), r, padre=(prev if prev else ctl))
    cmds.parentConstraint(c, n + "_JNT", maintainOffset=True)
    ctrls[n] = c
    prev = c

for L, s in (("L", 1), ("R", -1)):
    # Clavicula en FK (cuelga del control del pecho)
    cc = control("ctrl_clavicula_" + L, pos("clavicula_%s_JNT" % L), 5, normal=(1, 0, 0), lado=L, padre=ctrls["pecho"])
    cmds.parentConstraint(cc, "clavicula_%s_JNT" % L, maintainOffset=True)
    # Brazo con IK, control de mano y pole vector del codo
    ikb = cmds.ikHandle(sj="hombro_%s_JNT" % L, ee="muneca_%s_JNT" % L, sol="ikRPsolver", name="ik_brazo_" + L)[0]
    cm = control("ctrl_mano_" + L, pos("muneca_%s_JNT" % L), 6, normal=(1, 0, 0), lado=L)
    cmds.parent(ikb, cm)
    cmds.orientConstraint(cm, "muneca_%s_JNT" % L, maintainOffset=True)
    pvc = control("pv_codo_" + L, (s * 45, 140.5, -40), 3, normal=(0, 0, 1), lado=L)
    cmds.poleVectorConstraint(pvc, ikb)
    # Pierna con IK y foot roll
    ik_p = cmds.ikHandle(sj="muslo_%s_JNT" % L, ee="tobillo_%s_JNT" % L, sol="ikRPsolver", name="ik_pierna_" + L)[0]
    ik_b = cmds.ikHandle(sj="tobillo_%s_JNT" % L, ee="bola_%s_JNT" % L, sol="ikSCsolver", name="ik_bola_" + L)[0]
    ik_t = cmds.ikHandle(sj="bola_%s_JNT" % L, ee="punta_%s_JNT" % L, sol="ikSCsolver", name="ik_punta_" + L)[0]
    cp = control("ctrl_pie_" + L, (s * 16.6, 0.5, 3.0), 9, lado=L)
    grupos = {}
    for n, piv in (("talon", (s * 15.0, 0.5, -8.5)), ("punta", (s * 17.6, 0.5, 16.5)), ("bola", (s * 18.2, 2.5, 10.0)), ("dedos", (s * 18.2, 2.5, 10.0))):
        g = cmds.group(empty=True, name="grp_%s_%s" % (n, L))
        cmds.xform(g, ws=True, piv=piv)
        grupos[n] = g
    cmds.parent(grupos["talon"], cp)
    cmds.parent(grupos["punta"], grupos["talon"])
    cmds.parent(grupos["bola"], grupos["punta"])
    cmds.parent(grupos["dedos"], grupos["punta"])
    cmds.parent(ik_p, grupos["bola"])
    cmds.parent(ik_b, grupos["bola"])
    cmds.parent(ik_t, grupos["dedos"])
    cmds.addAttr(cp, longName="Roll", attributeType="double", min=-10, max=10, defaultValue=0, keyable=True)
    cmds.addAttr(cp, longName="Dedos", attributeType="double", min=0, max=10, defaultValue=0, keyable=True)

    def sdk(driver, driven, pares):
        for v, r in pares:
            cmds.setDrivenKeyframe(driven, currentDriver=driver, driverValue=v, value=r, inTangentType="linear", outTangentType="linear")

    sdk(cp + ".Roll", grupos["talon"] + ".rotateX", [(-10, -30), (0, 0), (10, 0)])
    sdk(cp + ".Roll", grupos["bola"] + ".rotateX", [(-10, 0), (0, 0), (5, 30), (10, 0)])
    sdk(cp + ".Roll", grupos["punta"] + ".rotateX", [(-10, 0), (0, 0), (5, 0), (10, 60)])
    sdk(cp + ".Dedos", grupos["dedos"] + ".rotateX", [(0, 0), (10, -45)])
    pvr = control("pv_rodilla_" + L, (s * 12.0, 50, 40), 3, normal=(0, 0, 1), lado=L)
    cmds.poleVectorConstraint(pvr, ik_p)

# Escala uniforme del control global (un solo valor) y bloqueos
cmds.connectAttr(ctrl_global + ".sx", ctrl_global + ".sy", force=True)
cmds.connectAttr(ctrl_global + ".sx", ctrl_global + ".sz", force=True)
for a in ("sy", "sz", "v"):
    cmds.setAttr("%s.%s" % (ctrl_global, a), lock=True, keyable=False, channelBox=False)
cmds.setAttr(ctrl_global + ".sx", keyable=True)
cmds.select(clear=True)
print("rig armado. joints:", len(cmds.ls(type="joint")), "controles:", len([c for c in cmds.ls("ctrl_*", type="transform")]))
