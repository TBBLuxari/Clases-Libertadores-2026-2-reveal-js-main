import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds
import maya.mel as mel
import rig_lib
hs = rig_lib.hs_lib
main = rig_lib.principal()
try:
    print("layouts guardados:", mel.eval('workspaceLayoutManager -q -listLayouts'))
except Exception as e:
    print("sin lista:", e)
print("workspace actual:", cmds.workspace(q=True, act=True) if False else "", cmds.workspaceLayoutManager(q=True, current=True) if hasattr(cmds, "workspaceLayoutManager") else "")
for wc in ("Outliner", "ChannelBoxLayerEditor"):
    if cmds.workspaceControl(wc, q=True, exists=True):
        print(wc, "collapse:", cmds.workspaceControl(wc, q=True, collapse=True), "dock:", cmds.workspaceControl(wc, q=True, dockToControl=True) if False else "")
        cmds.workspaceControl(wc, e=True, collapse=False, visible=True)
hs.esperar(500)
for n in ("outlinerPanel1", "modelPanel4"):
    w = rig_lib.widget(n)
    print(n, w.width(), w.height(), w.isVisible(), w.mapTo(main, rig_lib.QtCore.QPoint(0, 0)))
print("visibles:", cmds.getPanel(visiblePanels=True))
