// Config de browser-sync para el dev server local.
// Agrega, además del live-reload normal, un mini endpoint de archivo
// (GET/POST /api/estado) para que el índice pueda leer y escribir
// assets/datos/estado-clases.json directamente en el proyecto, sin localStorage.
// Así el estado de cada clase viaja con git (commit/push/pull) en vez de
// quedar atado al navegador de una sola máquina.
//
// También sirve /descargar/billar (o /descargar/billar.zip): un .zip con la carpeta "Billar"
// (index.html, estilos.css y script.js sin comentarios), armado al momento por docs/billar-zip.js a partir de
// ejemplos/programacion-web/billar-descargable/. Con la red del salón, los estudiantes lo
// bajan con la dirección "External" que imprime browser-sync al arrancar.
// Desde GitHub no hay servidor: ahí se baja el archivo estático ejemplos/programacion-web/Billar.zip
// (se regenera con: node docs/billar-zip.js).
const fs = require("fs");
const path = require("path");
const { armarZipBillar } = require("./docs/billar-zip.js");

const ESTADO_PATH = path.join(__dirname, "assets", "datos", "estado-clases.json");

function descargarBillar(req, res) {
  try {
    const zip = armarZipBillar();
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


