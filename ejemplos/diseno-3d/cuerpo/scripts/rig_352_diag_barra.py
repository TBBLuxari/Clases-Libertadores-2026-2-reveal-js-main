import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds
import rig_lib
QtWidgets = rig_lib.QtWidgets
main = rig_lib.principal()
print("estado:", main.windowState(), "geom:", main.geometry(), "pantalla:", QtWidgets.QApplication.primaryScreen().size() if hasattr(QtWidgets.QApplication, "primaryScreen") else None)
main.showMaximized()
rig_lib.hs_lib.esperar(300)
print("tras maximizar:", main.width(), main.height())
for n in ("outlinerPanel1", "modelPanel4"):
    w = rig_lib.widget(n)
    print(n, w.width() if w else None, w.height() if w else None, w.isVisible() if w else None)
print("paneles de layout:", cmds.getPanel(visiblePanels=True))
print("channelBox visible:", cmds.workspaceControl("ChannelBoxLayerEditor", q=True, visible=True) if cmds.workspaceControl("ChannelBoxLayerEditor", q=True, exists=True) else "no existe")
print("outliner workspaceControl:", cmds.workspaceControl("Outliner", q=True, visible=True) if cmds.workspaceControl("Outliner", q=True, exists=True) else "no existe")
