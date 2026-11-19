import sys
if r"C:\Users\JuanT\Downloads\scriptsmaya" not in sys.path:
    sys.path.insert(0, r"C:\Users\JuanT\Downloads\scriptsmaya")
import maya.cmds as cmds
import rig_lib
rig_lib.hs_lib.esperar(200)
main = rig_lib.principal()
pix = main.grab()
pix.save("C:/Users/JuanT/AppData/Local/Temp/claude/44f3e31a732f4333/c1bd3b5e-f5b2-4dff-870b-18cd867bab0e/scratchpad/layout2.png")
print("ok", main.geometry())
