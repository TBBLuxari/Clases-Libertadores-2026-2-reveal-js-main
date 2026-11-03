// Config de browser-sync para el dev server local.
// Agrega, además del live-reload normal, un mini endpoint de archivo
// (GET/POST /api/estado) para que el índice pueda leer y escribir
// assets/datos/estado-clases.json directamente en el proyecto, sin localStorage.
// Así el estado de cada clase viaja con git (commit/push/pull) en vez de
// quedar atado al navegador de una sola máquina.
//
// También sirve /descargar/billar (o /descargar/billar.zip): un .zip con la carpeta "Billar"
// (index.html, estilos.css y script.js sin comentarios), armado al momento a partir de
// ejemplos/programacion-web/billar-descargable/. Con la red del salón, los estudiantes lo
// bajan con la dirección "External" que imprime browser-sync al arrancar.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ESTADO_PATH = path.join(__dirname, "assets", "datos", "estado-clases.json");
const BILLAR_DIR = path.join(__dirname, "ejemplos", "programacion-web", "billar-descargable");
const BILLAR_ARCHIVOS = ["index.html", "estilos.css", "script.js"];

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

function descargarBillar(req, res) {
  try {
    const archivos = BILLAR_ARCHIVOS.map((nombre) => ({ nombre: "Billar/" + nombre, datos: fs.readFileSync(path.join(BILLAR_DIR, nombre)) }));
    const zip = crearZip(archivos);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="Billar.zip"');
    res.setHeader("Content-Length", zip.length);
    res.end(zip);
  } catch (e) {
    res.statusCode = 500;
    res.end("No pude armar el zip: " + e.message);
  }
}

function leerEstado(req, res) {
  fs.readFile(ESTADO_PATH, "utf8", (err, data) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(err ? "{}" : data);
  });
}

function guardarEstado(req, res) {
  let cuerpo = "";
  req.on("data", (chunk) => (cuerpo += chunk));
  req.on("end", () => {
    try {
      const datos = JSON.parse(cuerpo);
      fs.writeFileSync(ESTADO_PATH, JSON.stringify(datos, null, 2) + "\n");
      res.statusCode = 204;
      res.end();
    } catch (e) {
      res.statusCode = 400;
      res.end("JSON invalido: " + e.message);
    }
  });
}

module.exports = {
  server: { baseDir: "." },
  files: ["**/*.html", "comun/**/*.md", "assets/**/*.js", "styles/**/*.css"],
  notify: false,
  port: 4173,
  middleware: [
    function (req, res, next) {
      if (req.url === "/api/estado" && req.method === "GET") return leerEstado(req, res);
      if (req.url === "/api/estado" && req.method === "POST") return guardarEstado(req, res);
      const ruta = req.url.split("?")[0];
      if ((ruta === "/descargar/billar" || ruta === "/descargar/billar.zip") && req.method === "GET") return descargarBillar(req, res);
      next();
    },
  ],
};

//-----------------------------------
// 


