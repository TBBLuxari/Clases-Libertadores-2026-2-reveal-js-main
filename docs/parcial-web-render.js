// Renderiza figuras de Three.js sin pantalla (Edge headless + WebGL por software) para el parcial de Programación Web.
// Cada trabajo (job) es un trozo de JavaScript que arma una escena; el módulo devuelve el PNG y, si el job trae "ref", cuánto
// se parece su imagen a la del job de referencia (así se comprueba que una opción de la pregunta SÍ produce la figura y las
// otras NO). Los jobs de tipo "error" ejecutan el código y devuelven el mensaje real que lanza el navegador.
// Uso: const { renderJobs } = require('./parcial-web-render'); const res = await renderJobs(jobs, carpetaTemporal);
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFile } = require('child_process');

const THREE_URL = 'https://unpkg.com/three@0.169.0/build/three.module.js';
const EDGES = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'];

const PAGINA = (jobsJson) => `<!doctype html><html><head><meta charset="utf-8"></head><body><pre id="out">esperando</pre>
<script type="module">
import * as THREE from "./three.module.js";
const JOBS = ${jobsJson};
const salida = document.getElementById("out");

function mosaico()
{
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#efe2c0";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#3b2a1a";
  g.lineWidth = 12;
  g.strokeRect(6, 6, 244, 244);
  g.fillStyle = "#3b2a1a";
  g.font = "bold 190px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("F", 128, 142);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
const pixelesDe = {};
const resultados = {};

function nuevaEscena(job)
{
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf3efe6);
  const camera = new THREE.PerspectiveCamera(job.cam.fov || 45, job.w / job.h, 0.1, 200);
  camera.position.set(job.cam.pos[0], job.cam.pos[1], job.cam.pos[2]);
  camera.lookAt(job.cam.look[0], job.cam.look[1], job.cam.look[2]);
  return { scene, camera };
}

for (const job of JOBS)
{
  const r = { id: job.id };
  try
  {
    renderer.setSize(job.w, job.h, false);
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    const { scene, camera } = nuevaEscena(job);
    const f = new Function("THREE", "scene", "camera", "renderer", "mosaico", job.code);
    if (job.tipo === "error")
    {
      try { f(THREE, scene, camera, renderer, mosaico); r.mensaje = null; }
      catch (e) { r.mensaje = e.message; r.nombre = e.name; }
    }
    else
    {
      f(THREE, scene, camera, renderer, mosaico);
      renderer.render(scene, camera);
      const c2 = document.createElement("canvas");
      c2.width = job.w;
      c2.height = job.h;
      const g = c2.getContext("2d");
      g.drawImage(renderer.domElement, 0, 0);
      const px = g.getImageData(0, 0, job.w, job.h).data;
      pixelesDe[job.id] = px;
      if (job.ref)
      {
        const ref = pixelesDe[job.ref];
        let distintos = 0;
        for (let i = 0; i < px.length; i += 4)
        {
          const d = Math.max(Math.abs(px[i] - ref[i]), Math.abs(px[i + 1] - ref[i + 1]), Math.abs(px[i + 2] - ref[i + 2]));
          if (d > 16) { distintos++; }
        }
        r.distintos = distintos / (px.length / 4);
      }
      if (job.guardar) { r.png = renderer.domElement.toDataURL("image/png").split(",")[1]; }
    }
  }
  catch (e) { r.fallo = e.message; }
  resultados[job.id] = r;
}
salida.textContent = "LISTO" + btoa(unescape(encodeURIComponent(JSON.stringify(resultados)))) + "FIN";
</script></body></html>`;

function renderJobs(jobs, tmp) {
  return new Promise(async (resolve, reject) => {
    fs.mkdirSync(tmp, { recursive: true });
    const threePath = path.join(tmp, 'three.module.js');
    if (!fs.existsSync(threePath)) {
      const r = await fetch(THREE_URL);
      fs.writeFileSync(threePath, Buffer.from(await r.arrayBuffer()));
    }
    const json = JSON.stringify(jobs).replace(/</g, '\\u003c');
    fs.writeFileSync(path.join(tmp, 'render.html'), PAGINA(json));
    const exe = EDGES.find(p => fs.existsSync(p));
    if (!exe) return reject(new Error('No encontré Edge ni Chrome.'));
    const srv = http.createServer((q, r) => {
      const f = path.join(tmp, decodeURIComponent(q.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
      r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : 'text/html');
      r.end(fs.readFileSync(f));
    }).listen(0, () => {
      const port = srv.address().port;
      execFile(exe, ['--headless=new', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
        '--virtual-time-budget=120000', '--dump-dom', `http://localhost:${port}/render.html`],
        { maxBuffer: 512 * 1024 * 1024, timeout: 280000 }, (e, out) => {
          srv.close();
          const m = /LISTO([A-Za-z0-9+/=]+)FIN/.exec(out || '');
          if (!m) return reject(new Error('El render no terminó. ' + (e ? e.message : '') + ' ' + (out || '').slice(0, 300)));
          resolve(JSON.parse(Buffer.from(m[1], 'base64').toString('utf8')));
        });
    });
  });
}

module.exports = { renderJobs };
