# restaurar_maya_de_fabrica.py
# Deja Maya como recien instalado: preferencias, atajos, shelves, layouts, ventanas y Maya.env.
#
# Por que asi: Maya reescribe sus preferencias al cerrarse, asi que "Restore Default Settings" o resetear el workspace
# desde adentro casi nunca limpia todo. Lo unico que funciona siempre es cerrar Maya y apartar las carpetas de
# configuracion. Este script hace eso por ti y, si lo corres desde adentro de Maya, se encarga de cerrar Maya,
# esperar a que termine de escribir, hacer la limpieza y volver a abrirlo.
#
# NO se borra nada: todo se renombra a *_respaldo_AAAAMMDD_HHMMSS (se conservan los ultimos 3 respaldos de prefs).
# NO se toca: escenas, proyectos, imagenes ni tus scripts. Solo userSetup.py/userSetup.mel (se apartan, porque
# son una causa comun de menus rotos) y Maya.env.
#
# USO 1 (dentro de Maya): Script Editor, pestana Python, pegar todo este archivo y ejecutar (Ctrl + Enter).
# USO 2 (fuera de Maya, con Maya cerrado):
#     "C:\Program Files\Autodesk\Maya2027\bin\mayapy.exe" restaurar_maya_de_fabrica.py
# Opciones:  --simular (solo muestra que haria)   --solo-prefs (no toca Maya.env ni userSetup)
#            --version 2027   --si (no pregunta)   --sin-relanzar (no vuelve a abrir Maya)
#            --carpeta-maya RUTA (carpeta que contiene 2027, 2025... por si Documents esta en otro lugar)
import os
import re
import sys
import subprocess
import argparse

# El "nucleo" vive en un texto para poder escribirlo tal cual en un archivo aparte: ese archivo lo corre mayapy
# cuando Maya ya se cerro (asi no importa si este script se pego en el Script Editor y no existe como archivo).
NUCLEO = r'''
import os
import sys
import shutil
import datetime

ES_WINDOWS = os.name == "nt"
RESPALDOS_A_CONSERVAR = 3


class Registro(object):
    def __init__(self, ruta=None):
        self.ruta = ruta
        self.lineas = []

    def __call__(self, texto):
        print(texto)
        self.lineas.append(texto)

    def guardar(self):
        if not self.ruta:
            return
        try:
            with open(self.ruta, "a", encoding="utf-8") as f:
                f.write("\n".join(self.lineas) + "\n\n")
        except Exception:
            pass


def esperar_proceso(pid, segundos=180):
    """Espera a que termine el proceso pid (Windows: WaitForSingleObject; otros: sondeo)."""
    import time
    if ES_WINDOWS:
        import ctypes
        h = ctypes.windll.kernel32.OpenProcess(0x00100000, False, int(pid))
        if not h:
            return True
        ctypes.windll.kernel32.WaitForSingleObject(h, int(segundos * 1000))
        ctypes.windll.kernel32.CloseHandle(h)
        return True
    fin = time.time() + segundos
    while time.time() < fin:
        try:
            os.kill(int(pid), 0)
        except OSError:
            return True
        time.sleep(0.5)
    return False


def apartar(ruta, sello, simular, log):
    """Renombra ruta a ruta_respaldo_sello. Devuelve True si se aparto (o se apartaria)."""
    if not os.path.exists(ruta):
        return False
    destino = "%s_respaldo_%s" % (ruta, sello) if os.path.isdir(ruta) else "%s.respaldo_%s" % (ruta, sello)
    if simular:
        log("  [simulacion] apartaria %s  ->  %s" % (ruta, os.path.basename(destino)))
        return True
    try:
        os.rename(ruta, destino)
    except Exception:
        try:
            shutil.move(ruta, destino)
        except Exception as e:
            log("  ERROR no se pudo apartar %s: %s (Maya sigue abierto?)" % (ruta, e))
            return False
    log("  apartado %s  ->  %s" % (ruta, os.path.basename(destino)))
    return True


def podar_respaldos(carpeta, prefijo, simular, log):
    """Deja solo los ultimos RESPALDOS_A_CONSERVAR respaldos de prefs que creo este script (por nombre)."""
    if not os.path.isdir(carpeta):
        return
    viejos = sorted(n for n in os.listdir(carpeta) if n.startswith(prefijo))
    for n in viejos[:-RESPALDOS_A_CONSERVAR]:
        ruta = os.path.join(carpeta, n)
        if simular:
            log("  [simulacion] borraria el respaldo viejo %s" % n)
            continue
        try:
            shutil.rmtree(ruta) if os.path.isdir(ruta) else os.remove(ruta)
            log("  respaldo viejo eliminado: %s" % n)
        except Exception as e:
            log("  no se pudo eliminar el respaldo viejo %s: %s" % (n, e))


def restaurar(base, version, solo_prefs, simular, log, scripts_base=True):
    base = os.path.normpath(base)
    carpeta = os.path.join(base, version)
    sello = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    log("== Maya %s  (%s)  %s" % (version, carpeta, "SIMULACION" if simular else sello))
    hecho = apartar(os.path.join(carpeta, "prefs"), sello, simular, log)
    if not solo_prefs:
        apartar(os.path.join(carpeta, "Maya.env"), sello, simular, log)
        for nombre in ("userSetup.py", "userSetup.mel"):
            apartar(os.path.join(carpeta, "scripts", nombre), sello, simular, log)
            if scripts_base:
                apartar(os.path.join(base, "scripts", nombre), sello, simular, log)
    podar_respaldos(carpeta, "prefs_respaldo_", simular, log)
    return hecho


def relanzar(exe, log):
    import subprocess
    try:
        if ES_WINDOWS:
            subprocess.Popen([exe], creationflags=0x00000008 | 0x00000200, close_fds=True)
        else:
            subprocess.Popen([exe], close_fds=True, start_new_session=True)
        log("Maya se esta abriendo de nuevo (la primera vez tarda mas porque rehace sus preferencias).")
    except Exception as e:
        log("No pude volver a abrir Maya (%s). Abrelo tu desde el escritorio." % e)


def trabajador(pid, base, version, solo_prefs, exe, volver_a_abrir):
    """Corre DESPUES de cerrar Maya: espera a que el proceso termine, limpia y (si se pide) vuelve a abrir."""
    import time
    log = Registro(os.path.join(base, "restaurar_maya_log.txt"))
    esperar_proceso(pid)
    time.sleep(2)
    restaurar(base, version, solo_prefs, False, log)
    log.guardar()
    if volver_a_abrir:
        relanzar(exe, log)
'''
exec(NUCLEO)


# ------------------------------------------------------------------ rutas y contexto
def dentro_de_maya():
    """True si este codigo corre en la ventana de Maya (maya.exe), no en mayapy ni en python normal."""
    nombre = os.path.basename(sys.executable or "").lower()
    return nombre.startswith("maya") and "mayapy" not in nombre


def carpeta_maya_base(forzada=None):
    """Carpeta que contiene las carpetas por version (2027, 2025...). Respeta MAYA_APP_DIR y Documents en OneDrive."""
    if forzada:
        return forzada
    if dentro_de_maya():
        import maya.cmds as cmds
        return os.path.dirname(os.path.dirname(cmds.internalVar(userPrefDir=True).rstrip("/\\")))
    if os.environ.get("MAYA_APP_DIR"):
        return os.environ["MAYA_APP_DIR"]
    if ES_WINDOWS:
        docs = None
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders") as k:
                docs = os.path.expandvars(winreg.QueryValueEx(k, "Personal")[0])
        except Exception:
            docs = None
        return os.path.join(docs or os.path.join(os.path.expanduser("~"), "Documents"), "maya")
    if sys.platform == "darwin":
        return os.path.join(os.path.expanduser("~"), "Library", "Preferences", "Autodesk", "maya")
    return os.path.join(os.path.expanduser("~"), "maya")


def versiones_instaladas(base):
    if not os.path.isdir(base):
        return []
    return [n for n in sorted(os.listdir(base)) if re.match(r"^\d{4}(\.\d+)?$", n) and os.path.isdir(os.path.join(base, n))]


def maya_abierto():
    if not ES_WINDOWS:
        return False
    try:
        r = subprocess.run(["tasklist", "/FI", "IMAGENAME eq maya.exe"], capture_output=True, text=True)
        return "maya.exe" in r.stdout.lower()
    except Exception:
        return False


def ejecutables():
    loc = os.environ.get("MAYA_LOCATION", "")
    if ES_WINDOWS:
        return os.path.join(loc, "bin", "maya.exe"), os.path.join(loc, "bin", "mayapy.exe")
    return os.path.join(loc, "bin", "maya"), os.path.join(loc, "bin", "mayapy")


# ------------------------------------------------------------------ dentro de Maya
def flujo_dentro_de_maya(o):
    import maya.cmds as cmds
    base = carpeta_maya_base(o.carpeta_maya)
    version = o.version or os.path.basename(os.path.dirname(cmds.internalVar(userPrefDir=True).rstrip("/\\")))
    exe, mayapy = ejecutables()
    log = Registro(os.path.join(base, "restaurar_maya_log.txt"))

    if o.simular:
        restaurar(base, version, o.solo_prefs, True, log)
        log("Simulacion terminada. Maya no se cerro ni se cambio nada.")
        return

    texto = ("Esto deja Maya %s como recien instalado:\n\n"
             "  - Preferencias, atajos de teclado, shelves y ventanas\n"
             "  - Maya.env y userSetup (si existen)\n\n"
             "Se cerrara Maya y se abrira de nuevo. Nada se borra: todo queda en carpetas *_respaldo_...\n"
             "Tus escenas y proyectos NO se tocan." % version)
    r = cmds.confirmDialog(title="Restaurar Maya de fabrica", message=texto, button=["Si, restaurar", "Cancelar"],
                           defaultButton="Cancelar", cancelButton="Cancelar", dismissString="Cancelar", icon="warning")
    if r != "Si, restaurar":
        print("Cancelado, no se cambio nada.")
        return
    if cmds.file(q=True, modified=True):
        r = cmds.confirmDialog(title="Escena sin guardar", message="La escena tiene cambios sin guardar. Que hago?",
                               button=["Guardar y seguir", "Seguir sin guardar", "Cancelar"], defaultButton="Guardar y seguir",
                               cancelButton="Cancelar", dismissString="Cancelar")
        if r == "Cancelar":
            print("Cancelado, no se cambio nada.")
            return
        if r == "Guardar y seguir":
            if not cmds.file(q=True, sceneName=True):
                cmds.confirmDialog(title="Restaurar Maya", message="La escena no tiene nombre. Guardala con File > Save Scene As y vuelve a correr el script.", button=["OK"])
                return
            cmds.file(save=True)
    if not os.path.exists(mayapy):
        cmds.confirmDialog(title="Restaurar Maya", message="No encontre mayapy en:\n%s\nCierra Maya y corre el script con mayapy (instrucciones al inicio del archivo)." % mayapy, button=["OK"])
        return

    # un proceso aparte espera a que Maya termine de cerrarse (Maya reescribe sus prefs al salir), limpia y vuelve a abrir
    ruta_trabajador = os.path.join(os.environ.get("TEMP", os.path.expanduser("~")), "restaurar_maya_trabajador.py")
    with open(ruta_trabajador, "w", encoding="utf-8") as f:
        f.write(NUCLEO + "\n%s\n" % "trabajador(int(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4] == '1', sys.argv[5], sys.argv[6] == '1')")
    args = [mayapy, ruta_trabajador, str(os.getpid()), base, version, "1" if o.solo_prefs else "0", exe, "0" if o.sin_relanzar else "1"]
    banderas = {"creationflags": 0x00000008 | 0x00000200 | 0x08000000} if ES_WINDOWS else {"start_new_session": True}
    subprocess.Popen(args, close_fds=True, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, **banderas)
    cmds.quit(force=True)


# ------------------------------------------------------------------ fuera de Maya
def flujo_fuera_de_maya(o):
    base = carpeta_maya_base(o.carpeta_maya)
    log = Registro(os.path.join(base, "restaurar_maya_log.txt") if os.path.isdir(base) else None)
    versiones = [o.version] if o.version else versiones_instaladas(base)
    if not versiones:
        print("No encontre carpetas de Maya en %s" % base)
        return 1
    if not o.simular and maya_abierto():
        print("Maya esta abierto. Cierralo (guardando antes lo que necesites) y vuelve a correr el script.")
        return 1
    if not o.simular and not o.si:
        print("Se van a apartar las preferencias de Maya %s (queda respaldo, nada se borra)." % ", ".join(versiones))
        if input("Escribe SI para continuar: ").strip().upper() != "SI":
            print("Cancelado, no se cambio nada.")
            return 0
    for i, v in enumerate(versiones):
        restaurar(base, v, o.solo_prefs, o.simular, log, scripts_base=(i == 0))
    if not o.simular:
        log.guardar()
    print("\nSimulacion terminada." if o.simular else "\nListo. La proxima vez que abras Maya tendra la configuracion de fabrica.")
    return 0


def main(argv=None, extra=None):
    p = argparse.ArgumentParser(description="Restaura Maya de fabrica (con respaldo).")
    p.add_argument("--simular", action="store_true")
    p.add_argument("--solo-prefs", action="store_true")
    p.add_argument("--version")
    p.add_argument("--si", action="store_true")
    p.add_argument("--sin-relanzar", action="store_true")
    p.add_argument("--carpeta-maya")
    o = p.parse_args(argv)
    for k, v in (extra or {}).items():
        setattr(o, k, v)
    if dentro_de_maya():
        flujo_dentro_de_maya(o)
        return 0
    return flujo_fuera_de_maya(o)


# __args__ solo existe cuando el MCP de Maya prueba el script; en el uso normal se leen los argumentos de la linea de comandos
if "__args__" in globals() and __args__:
    main([], __args__)
else:
    codigo = main(None if len(sys.argv) > 1 else [])
    if not dentro_de_maya():
        sys.exit(codigo)
