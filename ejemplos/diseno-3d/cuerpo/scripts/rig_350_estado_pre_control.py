# rig_350_estado_pre_control.py - desde pie_inicio.ma: 3 IK, 4 grupos con pivote, anidados, IK dentro (estado de la diapositiva "Paso 16" de clase-12).
import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds
import maya.mel as mel

if cmds.objExists("grp_talon_L"):
    raise RuntimeError("el estado ya existe")
mel.eval("setPolyCountVisibility 0")
cmds.grid(size=200, spacing=5, divisions=1)
cmds.jointDisplayScale(2.0)
ik1 = cmds.ikHandle(startJoint="muslo_L_JNT", endEffector="tobillo_L_JNT", solver="ikRPsolver", name="ik_pierna_L")[0]
ik2 = cmds.ikHandle(startJoint="tobillo_L_JNT", endEffector="bola_L_JNT", solver="ikSCsolver", name="ik_bola_L")[0]
ik3 = cmds.ikHandle(startJoint="bola_L_JNT", endEffector="punta_L_JNT", solver="ikSCsolver", name="ik_punta_L")[0]
pivs = {"grp_talon_L": (15.0, 0.5, -8.5), "grp_punta_L": (17.6, 0.5, 16.5), "grp_bola_L": (18.2, 2.5, 10.0), "grp_dedos_L": (18.2, 2.5, 10.0)}
for n, p in pivs.items():
    cmds.select(clear=True)
    cmds.group(empty=True, name=n)
    cmds.xform(n, ws=True, piv=p)
cmds.parent("grp_punta_L", "grp_talon_L")
cmds.parent("grp_bola_L", "grp_punta_L")
cmds.parent("grp_dedos_L", "grp_punta_L")
cmds.parent(ik1, "grp_bola_L")
cmds.parent(ik2, "grp_bola_L")
cmds.parent(ik3, "grp_dedos_L")
cmds.select(clear=True)
print("estado listo:", cmds.listRelatives("grp_talon_L", allDescendents=True, type="transform"))
