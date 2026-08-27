// Config de browser-sync para el dev server local.
// Agrega, además del live-reload normal, un mini endpoint de archivo
// (GET/POST /api/estado) para que el índice pueda leer y escribir
// assets/estado-clases.json directamente en el proyecto, sin localStorage.
// Así el estado de cada clase viaja con git (commit/push/pull) en vez de
// quedar atado al navegador de una sola máquina.
const fs = require("fs");
const path = require("path");

const ESTADO_PATH = path.join(__dirname, "assets", "estado-clases.json");

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
      next();
    },
  ],
};

//-----------------------------------
// 


