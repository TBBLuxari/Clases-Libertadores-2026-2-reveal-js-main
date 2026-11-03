// Arma Billar.zip (carpeta "Billar" con index.html, estilos.css y script.js sin comentarios)
// a partir de ejemplos/programacion-web/billar-descargable/.
//
// Lo usan dos cosas:
//   - bs-config.cjs: sirve el zip al momento en /descargar/billar (solo con `bun run dev`).
//   - Este mismo archivo, ejecutado a mano, escribe el zip estático para GitHub Pages:
//         node docs/billar-zip.js
//     y deja ejemplos/programacion-web/Billar.zip (se sube con git y se baja desde la web).
//
// El zip sale siempre igual si los archivos no cambian (fecha fija), así git no marca cambios de más.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BILLAR_DIR = path.join(__dirname, "..", "ejemplos", "programacion-web", "billar-descargable");
const BILLAR_ARCHIVOS = ["index.html", "estilos.css", "script.js"];
const ZIP_ESTATICO = path.join(__dirname, "..", "ejemplos", "programacion-web", "Billar.zip");

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

function crc32(datos) {
  let c = 0xffffffff;
  for (const byte of datos) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function crearZip(archivos) {
  const locales = [];
  const centrales = [];
  let desplazamiento = 0;
  for (const { nombre, datos } of archivos) {
    const nom = Buffer.from(nombre, "utf8");
    const comprimido = zlib.deflateRawSync(datos);
    const crc = crc32(datos);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comprimido.length, 18);
    local.writeUInt32LE(datos.length, 22);
    local.writeUInt16LE(nom.length, 26);
    local.writeUInt16LE(0, 28);
    locales.push(local, nom, comprimido);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(comprimido.length, 20);
    central.writeUInt32LE(datos.length, 24);
    central.writeUInt16LE(nom.length, 28);
    central.writeUInt32LE(desplazamiento, 42);
    centrales.push(central, nom);

    desplazamiento += local.length + nom.length + comprimido.length;
  }
  const tamanoCentral = centrales.reduce((suma, b) => suma + b.length, 0);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0);
  fin.writeUInt16LE(archivos.length, 8);
  fin.writeUInt16LE(archivos.length, 10);
  fin.writeUInt32LE(tamanoCentral, 12);
  fin.writeUInt32LE(desplazamiento, 16);
  return Buffer.concat([...locales, ...centrales, fin]);
}

function armarZipBillar() {
  const archivos = BILLAR_ARCHIVOS.map((nombre) => ({
    nombre: "Billar/" + nombre,
    datos: fs.readFileSync(path.join(BILLAR_DIR, nombre)),
  }));
  return crearZip(archivos);
}

module.exports = { armarZipBillar };

if (require.main === module) {
  const zip = armarZipBillar();
  fs.writeFileSync(ZIP_ESTATICO, zip);
  console.log("Escribí " + path.relative(process.cwd(), ZIP_ESTATICO) + " (" + zip.length + " bytes)");
}
