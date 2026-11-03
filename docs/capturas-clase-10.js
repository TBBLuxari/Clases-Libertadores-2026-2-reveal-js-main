// Pantallazos de la escena 3D de cada paso de la clase 10 de Programación Web (billar con física).
// Abre ejemplos/programacion-web/billar-fisica/index.html?paso=NN&t=SEGUNDOS (modo captura de escenario.js: simula el tiempo
// con cuadros de 1/60 s y dibuja un solo cuadro) y guarda un JPG por captura. Así cada imagen sale del código real del paso.
// Uso: node docs/capturas-clase-10.js [id ...]      (sin argumentos hace todas)    necesita el servidor de desarrollo en el puerto 4173
//   salida: assets/imagenes/programacion-web/clase-10/<id>.jpg
// Variables de entorno: PUERTO (por defecto 4173).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const OUT = path.join(RAIZ, 'assets', 'imagenes', 'programacion-web', 'clase-10');
const PUERTO = process.env.PUERTO || '4173';
const W = 1280, H = 720;
const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
if (!EXE) { console.error('No encontré Chrome ni Edge.'); process.exit(1); }

// id, paso, segundos simulados y opciones de escenario.js (vista, rastro, colliders)
const CAPTURAS = [
  { id: '01-punto-de-partida',          paso: '00', t: 0.1 },
  { id: '02-vista-desde-arriba',        paso: '00', t: 0.1, vista: 'arriba' },
  { id: '03-colliders-desde-arriba',    paso: '00', t: 0.1, vista: 'arriba', colliders: true },
  { id: '04-blanca-sale-de-la-mesa',    paso: '02', t: 2.4, vista: 'sala' },
  { id: '05-todas-se-escapan',          paso: '03', t: 1.8, vista: 'sala' },
  { id: '06-rebote-en-bordes',          paso: '04', t: 4, vista: 'arriba', rastro: 'blanca' },
  { id: '07-friccion-se-detiene',       paso: '05', t: 8, vista: 'arriba', rastro: 'blanca' },
  { id: '08-se-cruzan-sin-chocar',      paso: '05', t: 3, vista: 'arriba', rastro: 'todas' },
  { id: '09-tocar-se-pone-rojo',        paso: '06', t: 0.58 },
  { id: '10-blanca-atraviesa-amarilla', paso: '06', t: 1.2, vista: 'arriba' },
  { id: '11-topadora',                  paso: '07', t: 1.0, vista: 'arriba' },
  { id: '12-rebote-de-frente',          paso: '08', t: 1.0, vista: 'arriba' },
  { id: '13-rotura-contacto',           paso: '09', t: 0.45 },
  { id: '14-rotura-se-abre',            paso: '09', t: 0.9, vista: 'arriba' },
  { id: '15-rotura-en-movimiento',      paso: '09', t: 1.6, vista: 'arriba' },
  { id: '16-mesa-al-final',             paso: '09', t: 12, vista: 'arriba' },
  { id: '17-final-con-taco',            paso: '11', t: 0.1 },
];

const url = (c) => {
  const q = new URLSearchParams({ paso: c.paso, t: String(c.t), vista: c.vista || 'mesa' });
  if (c.rastro) q.set('rastro', c.rastro);
  if (c.colliders) q.set('colliders', '1');
  return `http://localhost:${PUERTO}/ejemplos/programacion-web/billar-fisica/index.html?${q}`;
};

const esperar = (ms) => new Promise(r => setTimeout(r, ms));

async function conectar(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let n = 0;
  const pendientes = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pendientes.has(d.id)) { pendientes.get(d.id)(d); pendientes.delete(d.id); } };
  const enviar = (method, params = {}) => new Promise((ok) => { const id = ++n; pendientes.set(id, ok); ws.send(JSON.stringify({ id, method, params })); });
  return { enviar, cerrar: () => ws.close() };
}

(async () => {
  const pedidos = process.argv.slice(2);
  const lista = CAPTURAS.filter(c => !pedidos.length || pedidos.includes(c.id));
  if (!lista.length) { console.error('Ningún id coincide. Ids:', CAPTURAS.map(c => c.id).join(', ')); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });

  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'capturas-clase-10-'));
  const puertoCdp = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn(EXE, ['--headless=new', `--remote-debugging-port=${puertoCdp}`, `--user-data-dir=${perfil}`, '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars', `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });

  try {
    for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${puertoCdp}/json/version`); break; } catch { await esperar(250); } }

    for (const c of lista) {
      const destino = path.join(OUT, c.id + '.jpg');
      const pestana = await (await fetch(`http://127.0.0.1:${puertoCdp}/json/new?about:blank`, { method: 'PUT' })).json();
      const cdp = await conectar(pestana.webSocketDebuggerUrl);
      await cdp.enviar('Page.enable');
      await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
      await cdp.enviar('Page.navigate', { url: url(c) });

      let listo = false;
      for (let i = 0; i < 240 && !listo; i++) {
        await esperar(250);
        const r = await cdp.enviar('Runtime.evaluate', { expression: 'document.title' });
        listo = r.result && r.result.result && r.result.result.value === 'listo';
      }
      if (!listo) { console.error('NO cargó:', c.id); cdp.cerrar(); continue; }
      await esperar(400);
      const foto = await cdp.enviar('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
      fs.writeFileSync(destino, Buffer.from(foto.result.data, 'base64'));
      console.log('ok', c.id);
      cdp.cerrar();
      await fetch(`http://127.0.0.1:${puertoCdp}/json/close/${pestana.id}`);
    }
  } finally {
    chrome.kill();
  }
})();
