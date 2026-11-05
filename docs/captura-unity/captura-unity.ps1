param(
    [Parameter(Mandatory = $true)][string]$Salida
)

# Captura SOLO el contenido de la ventana de Unity con PrintWindow.
# No la trae al frente ni usa la pantalla, así que no ve ni molesta a otras ventanas.
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class VentanaUnity {
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
    public struct RECT { public int Left, Top, Right, Bottom; }
}
"@

[VentanaUnity]::SetProcessDPIAware() | Out-Null

$proceso = Get-Process -Name Unity -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowTitle -like "*Unity*" -and $_.MainWindowHandle -ne 0 } |
    Select-Object -First 1

if ($null -eq $proceso) { Write-Output "NO_UNITY"; exit 1 }

$h = $proceso.MainWindowHandle
if ([VentanaUnity]::IsIconic($h)) { Write-Output "MINIMIZADA"; exit 2 }

$r = New-Object VentanaUnity+RECT
[VentanaUnity]::GetWindowRect($h, [ref]$r) | Out-Null
$ancho = $r.Right - $r.Left
$alto = $r.Bottom - $r.Top

$bmp = New-Object System.Drawing.Bitmap $ancho, $alto
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
$ok = [VentanaUnity]::PrintWindow($h, $hdc, 2)
$g.ReleaseHdc($hdc)
$g.Dispose()
$bmp.Save($Salida, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Output ("PrintWindow={0} {1}x{2} titulo: {3}" -f $ok, $ancho, $alto, $proceso.MainWindowTitle)
