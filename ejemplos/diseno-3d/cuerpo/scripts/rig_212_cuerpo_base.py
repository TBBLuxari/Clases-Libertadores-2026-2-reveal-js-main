# rig_212_cuerpo_base.py - PRUEBA (no guarda): esqueleto completo (cadera, columna, cuello, brazos, piernas) + Mirror Joint + skin Closest distance.
import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds

RIG = "C:/Users/JuanT/OneDrive/Escritorio/Clases libertadores/ejemplos/diseno-3d/rigging/"
cmds.file(RIG + "escenas/modelo_completo.ma", open=True, force=True)
cmds.select(clear=True)

# Columna y cabeza
cad = cmds.joint(p=(0, 92, 3), name="cadera_JNT")
c1 = cmds.joint(p=(0, 104, 4.5), name="columna1_JNT")
c2 = cmds.joint(p=(0, 118, 4), name="columna2_JNT")
pecho = cmds.joint(p=(0, 132, 2), name="pecho_JNT")
cuello = cmds.joint(p=(0, 148, 1.5), name="cuello_JNT")
cabeza = cmds.joint(p=(0, 158, 1.5), name="cabeza_JNT")
cfin = cmds.joint(p=(0, 176, 1.5), name="cabeza_fin_JNT")
cmds.joint(cad, edit=True, orientJoint="yzx", secondaryAxisOrient="zup", children=True, zeroScaleOrient=True)
cmds.joint(cfin, edit=True, orientJoint="none", zeroScaleOrient=True)

# Brazo izquierdo (cuelga del pecho)
cmds.select(pecho)
cla = cmds.joint(p=(4, 144, -1), name="clavicula_L_JNT")
hom = cmds.joint(p=(20, 141.5, -4), name="hombro_L_JNT")
cod = cmds.joint(p=(45, 140.5, -4), name="codo_L_JNT")
mun = cmds.joint(p=(70, 141.5, -4), name="muneca_L_JNT")
man = cmds.joint(p=(85, 141.5, -4), name="mano_L_JNT")
cmds.joint(cla, edit=True, orientJoint="xyz", secondaryAxisOrient="yup", children=True, zeroScaleOrient=True)
cmds.joint(man, edit=True, orientJoint="none", zeroScaleOrient=True)

# Pierna izquierda (cuelga de la cadera)
cmds.select(cad)
mus = cmds.joint(p=(9.5, 88, 1.5), name="muslo_L_JNT")
rod = cmds.joint(p=(12.0, 50, 1.2), name="rodilla_L_JNT")
tob = cmds.joint(p=(15.2, 9.5, -3.4), name="tobillo_L_JNT")
bol = cmds.joint(p=(18.2, 2.5, 10.0), name="bola_L_JNT")
pun = cmds.joint(p=(17.6, 1.2, 16.4), name="punta_L_JNT")
cmds.joint(mus, edit=True, orientJoint="xyz", secondaryAxisOrient="zup", children=True, zeroScaleOrient=True)
cmds.joint(pun, edit=True, orientJoint="none", zeroScaleOrient=True)
cmds.joint(rod, edit=True, setPreferredAngles=True)

# Mirror Joint (Skeleton > Mirror Joint, plano YZ, Behavior)
cmds.mirrorJoint(cla, mirrorYZ=True, mirrorBehavior=True, searchReplace=("_L_", "_R_"))
cmds.mirrorJoint(mus, mirrorYZ=True, mirrorBehavior=True, searchReplace=("_L_", "_R_"))
print("hijos de la cadera:", cmds.listRelatives(cad, children=True, type="joint"))
print("hijos del pecho:", cmds.listRelatives(pecho, children=True, type="joint"))
print("derecha:", [(j, [round(v, 1) for v in cmds.xform(j, q=True, ws=True, t=True)]) for j in ("muslo_R_JNT", "rodilla_R_JNT", "tobillo_R_JNT", "bola_R_JNT", "punta_R_JNT", "hombro_R_JNT")])

# Skin: Closest distance, toda la malla con todos los joints
joints = cmds.listRelatives(cad, allDescendents=True, type="joint") + [cad]
sk = cmds.skinCluster(joints, "Modelo", toSelectedBones=True, bindMethod=0, skinMethod=0, normalizeWeights=1, maximumInfluences=4, obeyMaxInfluences=True, name="skin_cuerpo")[0]
print("skin:", sk, "influencias:", len(cmds.skinCluster(sk, q=True, influence=True)))
cmds.select(clear=True)
