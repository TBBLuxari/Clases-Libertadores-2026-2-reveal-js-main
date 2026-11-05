param(
    [Parameter(Mandatory = $true)][string]$Entrada,
    [Parameter(Mandatory = $true)][string]$Salida,
    [Parameter(Mandatory = $true)][string]$Recortes,
    [string]$Cajas = "",
    [double]$Escala = 2.0,
    [int]$PadIzq = 0
)

# Recortes = "x,y,ancho,alto;x,y,ancho,alto" (pixeles de la captura completa). Se unen de izquierda a derecha.
# Cajas    = "x,y,ancho,alto,etiqueta;..." (pixeles de la captura completa). Se dibujan antes de recortar.
# PadIzq   = pixeles extra a la izquierda de cada recorte (se rellenan en oscuro) para que el numero rojo
#            de una caja pegada al borde izquierdo no quede cortado.
Add-Type -AssemblyName System.Drawing

$rects = @()
foreach ($r in $Recortes.Split(";")) {
    $q = $r.Split(",")
    $rects += New-Object System.Drawing.Rectangle ([int]$q[0]), ([int]$q[1]), ([int]$q[2]), ([int]$q[3])
}

$img = [System.Drawing.Image]::FromFile($Entrada)
$bmp = New-Object System.Drawing.Bitmap $img.Width, $img.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$img.Dispose()

# margen oscuro a la izquierda de cada recorte
$fondo = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 30, 34, 40))
for ($i = 0; $i -lt $rects.Count; $i++) {
    $pad = [Math]::Min($PadIzq, $rects[$i].X)
    if ($pad -gt 0) {
        $g.FillRectangle($fondo, $rects[$i].X - $pad, $rects[$i].Y, $pad, $rects[$i].Height)
        $rects[$i] = New-Object System.Drawing.Rectangle ($rects[$i].X - $pad), $rects[$i].Y, ($rects[$i].Width + $pad), $rects[$i].Height
    }
}

$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$rojo = [System.Drawing.Color]::FromArgb(255, 255, 60, 80)
$lapiz = New-Object System.Drawing.Pen $rojo, 3
$pincel = New-Object System.Drawing.SolidBrush $rojo
$blanco = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$fuente = New-Object System.Drawing.Font "Segoe UI", 14, ([System.Drawing.FontStyle]::Bold)

if ($Cajas -ne "") {
    foreach ($c in $Cajas.Split(";")) {
        $p = $c.Split(",")
        $x = [int]$p[0]; $y = [int]$p[1]; $w = [int]$p[2]; $h = [int]$p[3]
        $etiqueta = $p[4]
        $g.DrawRectangle($lapiz, $x, $y, $w, $h)
        $d = 24
        $cx = $x - $d - 5
        $cy = $y + ($h - $d) / 2
        if ($cx -lt 0) { $cx = $x + $w + 5 }
        $g.FillEllipse($pincel, $cx, $cy, $d, $d)
        $tam = $g.MeasureString($etiqueta, $fuente)
        $g.DrawString($etiqueta, $fuente, $blanco, $cx + ($d - $tam.Width) / 2 + 1, $cy + ($d - $tam.Height) / 2 + 1)
    }
}
$g.Dispose()

$hueco = 12
$anchoTotal = 0
$altoMax = 0
foreach ($rc in $rects) {
    $anchoTotal += $rc.Width
    if ($rc.Height -gt $altoMax) { $altoMax = $rc.Height }
}
$anchoTotal += $hueco * ($rects.Count - 1)

$lienzo = New-Object System.Drawing.Bitmap ([int]($anchoTotal * $Escala)), ([int]($altoMax * $Escala))
$g2 = [System.Drawing.Graphics]::FromImage($lienzo)
$g2.Clear([System.Drawing.Color]::FromArgb(255, 30, 34, 40))
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$x0 = 0
foreach ($rc in $rects) {
    $destino = New-Object System.Drawing.Rectangle ([int]($x0 * $Escala)), 0, ([int]($rc.Width * $Escala)), ([int]($rc.Height * $Escala))
    $g2.DrawImage($bmp, $destino, $rc.X, $rc.Y, $rc.Width, $rc.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $x0 += $rc.Width + $hueco
}
$g2.Dispose()

$carpeta = Split-Path -Parent $Salida
if (-not (Test-Path $carpeta)) { New-Item -ItemType Directory -Path $carpeta -Force | Out-Null }
$lienzo.Save($Salida, [System.Drawing.Imaging.ImageFormat]::Png)
$lienzo.Dispose()
$bmp.Dispose()
Write-Output ("OK " + $Salida)
