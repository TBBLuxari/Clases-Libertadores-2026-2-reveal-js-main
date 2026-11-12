# rig_corre.py - envoltorio: ejecuta el script indicado en __args__["f"] y devuelve el error completo si falla.
import traceback
a = globals().get("__args__") or {}
ruta = r"C:\Users\JuanT\Downloads\scriptsmaya\%s" % a.get("f", "")
try:
    with open(ruta, encoding="utf-8") as fh:
        codigo = fh.read()
    exec(compile(codigo, ruta, "exec"), globals())
except Exception:
    print("ERROR:\n" + traceback.format_exc())
