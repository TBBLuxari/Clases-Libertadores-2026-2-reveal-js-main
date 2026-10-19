// Guía en PDF de la sala de billar (Programación Web, clase 9). Se arma desde cero, sin archivo de partida y sin texturas incluidas:
// cada estudiante busca las suyas.
// Uso: node docs/gen-guia-billar.js
//   1. Toma el código que muestra la guía (objeto G), lo resalta y lo convierte en IMAGEN (PNG), para que no se pueda copiar y pegar.
//   2. Arma guia-sala-billar.html (con esquemas en SVG) y lo exporta a PDF con Edge headless.
//   3. Arma además una SOLUCIÓN de referencia (objeto S: index.html + script.js completos) para comprobar que lo que pide la guía
//      produce una sala que funciona. Va en ENSAMBLADO_DIR (por defecto la carpeta temporal). No se entrega a los estudiantes.
// Variables de entorno: PDF_OUT (otra ruta para el PDF), ENSAMBLADO_DIR.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const DIR = path.join(RAIZ, 'materias', 'programacion-web', 'apoyo', 'guia-sala-billar');
const IMGS = path.join(DIR, 'codigo');
const HTML = path.join(DIR, 'guia-sala-billar.html');
const PDF = process.env.PDF_OUT ? path.resolve(process.env.PDF_OUT) : path.join(DIR, 'guia-sala-billar.pdf');
const TMP = path.join(process.env.TEMP || __dirname, 'guia-billar-tmp');
const ENSAMBLADO_DIR = process.env.ENSAMBLADO_DIR ? path.resolve(process.env.ENSAMBLADO_DIR) : path.join(TMP, 'ensamblado');
const HLJS = path.join(RAIZ, 'node_modules', 'reveal.js', 'plugin', 'highlight');
const edges = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'];
const EXE = edges.find(p => fs.existsSync(p));
if (!EXE) { console.error('No encontré Edge ni Chrome.'); process.exit(1); }

const aUrl = p => 'file:///' + p.replace(/\\/g, '/').split('/').map((s, i) => (i === 0 ? s : encodeURIComponent(s))).join('/');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function edge(args) { try { return execFileSync(EXE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', ...args], { stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString(); } catch (e) { return (e.stdout || '').toString(); } }

// =============================================================== SOLUCIÓN DE REFERENCIA (S): archivo completo para probar
const S = {};

S.html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Sala de billar</title>
  <style>
    body { margin: 0; overflow: hidden; }
  </style>

  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.169.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.169.0/examples/jsm/"
    }
  }
  </script>
</head>
<body>

  <script type="module" src="script.js"></script>

</body>
</html>`;

S.base = `import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120e18);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 4, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(animar);

const controles = new OrbitControls(camera, renderer.domElement);

// ---------- Aquí va todo lo que sigue ----------

function animar()
{
  controles.update();
  renderer.render(scene, camera);
}`;
const MARCA = '// ---------- Aquí va todo lo que sigue ----------';

S.luzProvisional = `scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const sol = new THREE.DirectionalLight(0xffffff, 1.5);
sol.position.set(-4, 8, 6);
scene.add(sol);
`;
S.pisoPlano = `const piso = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x9a7b5a, roughness: 0.8 })
);
piso.rotation.x = -Math.PI / 2;
scene.add(piso);
`;
function texturaSol(nombre, archivo, rx, ry, esColor) {
  return `const ${nombre} = cargador.load("texturas/${archivo}");
${nombre}.wrapS = THREE.RepeatWrapping;
${nombre}.wrapT = THREE.RepeatWrapping;
${nombre}.repeat.set(${rx}, ${ry});
${esColor ? nombre + '.colorSpace = THREE.SRGBColorSpace;\n' : ''}`;
}
S.pisoTextura = `const cargador = new THREE.TextureLoader();

${texturaSol('texturaPiso', 'piso-color.jpg', 10, 10, true)}
${texturaSol('texturaPisoRelieve', 'piso-relieve.jpg', 10, 10, false)}
${texturaSol('texturaPisoRugosidad', 'piso-rugosidad.jpg', 10, 10, false)}
`;
S.pisoMaterial = `new THREE.MeshStandardMaterial({
  map: texturaPiso,
  color: 0xbbbbbb,
  bumpMap: texturaPisoRelieve,
  bumpScale: 2,
  roughnessMap: texturaPisoRugosidad,
  roughness: 1
})`;

S.paredes = `${texturaSol('texturaLadrillo', 'ladrillo-color.jpg', 5, 2, true)}
${texturaSol('texturaLadrilloRelieve', 'ladrillo-relieve.jpg', 5, 2, false)}
const materialLadrillo = new THREE.MeshStandardMaterial({
  map: texturaLadrillo,
  bumpMap: texturaLadrilloRelieve,
  bumpScale: 4,
  roughness: 0.9
});

const tamanoSala = 20;
const alturaSala = 8;

const paredFondo = new THREE.Mesh(new THREE.PlaneGeometry(tamanoSala, alturaSala), materialLadrillo);
paredFondo.position.set(0, alturaSala / 2, -tamanoSala / 2);
scene.add(paredFondo);

const paredFrente = new THREE.Mesh(new THREE.PlaneGeometry(tamanoSala, alturaSala), materialLadrillo);
paredFrente.position.set(0, alturaSala / 2, tamanoSala / 2);
paredFrente.rotation.y = Math.PI;
scene.add(paredFrente);

const paredIzquierda = new THREE.Mesh(new THREE.PlaneGeometry(tamanoSala, alturaSala), materialLadrillo);
paredIzquierda.position.set(-tamanoSala / 2, alturaSala / 2, 0);
paredIzquierda.rotation.y = Math.PI / 2;
scene.add(paredIzquierda);

const paredDerecha = new THREE.Mesh(new THREE.PlaneGeometry(tamanoSala, alturaSala), materialLadrillo);
paredDerecha.position.set(tamanoSala / 2, alturaSala / 2, 0);
paredDerecha.rotation.y = -Math.PI / 2;
scene.add(paredDerecha);

const techo = new THREE.Mesh(
  new THREE.PlaneGeometry(tamanoSala, tamanoSala),
  new THREE.MeshStandardMaterial({ color: 0x2b2233, roughness: 1 })
);
techo.rotation.x = Math.PI / 2;
techo.position.y = alturaSala;
scene.add(techo);
`;

S.mesa = `const anchoMesa = 8;
const fondoMesa = 4;
const alturaPata = 2;
const grosorTablero = 0.3;
const alturaPano = alturaPata + grosorTablero;

${texturaSol('texturaMaderaLarga', 'madera-color.jpg', 4, 1, true)}
${texturaSol('texturaMaderaLargaRelieve', 'madera-relieve.jpg', 4, 1, false)}
const materialMaderaLarga = new THREE.MeshStandardMaterial({
  map: texturaMaderaLarga,
  color: 0x7a4a2a,
  bumpMap: texturaMaderaLargaRelieve,
  bumpScale: 2,
  roughness: 0.6
});

${texturaSol('texturaMaderaCorta', 'madera-color.jpg', 2, 1, true)}
${texturaSol('texturaMaderaCortaRelieve', 'madera-relieve.jpg', 2, 1, false)}
const materialMaderaCorta = new THREE.MeshStandardMaterial({
  map: texturaMaderaCorta,
  color: 0x7a4a2a,
  bumpMap: texturaMaderaCortaRelieve,
  bumpScale: 2,
  roughness: 0.6
});

const tablero = new THREE.Mesh(
  new THREE.BoxGeometry(anchoMesa + 0.6, grosorTablero, fondoMesa + 0.6),
  materialMaderaLarga
);
tablero.position.y = alturaPata + grosorTablero / 2;
scene.add(tablero);

const pano = new THREE.Mesh(
  new THREE.PlaneGeometry(anchoMesa, fondoMesa),
  new THREE.MeshStandardMaterial({ color: 0x0b6e3a, roughness: 1 })
);
pano.rotation.x = -Math.PI / 2;
pano.position.y = alturaPano + 0.01;
scene.add(pano);

const bordeFondo = new THREE.Mesh(new THREE.BoxGeometry(anchoMesa + 0.6, 0.4, 0.3), materialMaderaLarga);
bordeFondo.position.set(0, alturaPano + 0.2, -fondoMesa / 2 - 0.15);
scene.add(bordeFondo);

const bordeFrente = new THREE.Mesh(new THREE.BoxGeometry(anchoMesa + 0.6, 0.4, 0.3), materialMaderaLarga);
bordeFrente.position.set(0, alturaPano + 0.2, fondoMesa / 2 + 0.15);
scene.add(bordeFrente);

const bordeIzquierdo = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, fondoMesa), materialMaderaCorta);
bordeIzquierdo.position.set(-anchoMesa / 2 - 0.15, alturaPano + 0.2, 0);
scene.add(bordeIzquierdo);

const bordeDerecho = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, fondoMesa), materialMaderaCorta);
bordeDerecho.position.set(anchoMesa / 2 + 0.15, alturaPano + 0.2, 0);
scene.add(bordeDerecho);
`;

S.patas = `${texturaSol('texturaPata', 'madera-color.jpg', 1, 2, true)}
const materialPata = new THREE.MeshStandardMaterial({ map: texturaPata, color: 0x5a3418, roughness: 0.6 });

class Pata
{
  constructor(x, z, alto, material)
  {
    this.malla = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.16, alto, 24),
      material
    );
    this.malla.position.set(x, alto / 2, z);
    this.malla.castShadow = true;
    this.malla.receiveShadow = true;
    scene.add(this.malla);
  }
}

new Pata(-3.8, -1.9, alturaPata, materialPata);
new Pata(3.8, -1.9, alturaPata, materialPata);
new Pata(-3.8, 1.9, alturaPata, materialPata);
new Pata(3.8, 1.9, alturaPata, materialPata);
`;

S.bolas = `const radioBola = 0.2;

class Bola
{
  constructor(color, x, z)
  {
    this.malla = new THREE.Mesh(
      new THREE.SphereGeometry(radioBola, 48, 48),
      new THREE.MeshPhysicalMaterial({
        color: color,
        roughness: 0.15,
        clearcoat: 1,
        clearcoatRoughness: 0.03
      })
    );
    this.malla.position.set(x, alturaPano + radioBola, z);
    this.malla.castShadow = true;
    scene.add(this.malla);
  }
}

new Bola(0xffffff, -2, 0);
new Bola(0xffd166, 1.0, 0);
new Bola(0x1d4ed8, 1.36, -0.205);
new Bola(0xd62828, 1.36, 0.205);
new Bola(0x7b2cbf, 1.72, -0.41);
new Bola(0x111111, 1.72, 0);
new Bola(0xf77f00, 1.72, 0.41);
`;

S.taco = `const taco = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.09, 3.4, 24),
  new THREE.MeshStandardMaterial({ color: 0xd9a066, roughness: 0.5 })
);
taco.rotation.z = -Math.PI / 2;
taco.position.set(-4.1, alturaPano + radioBola, 0.2);
taco.castShadow = true;
scene.add(taco);
`;

S.luces = `scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const cielo = new THREE.HemisphereLight(0xbcd4ff, 0x5a3a20, 0.35);
scene.add(cielo);

const ventana = new THREE.DirectionalLight(0x8fb4ff, 0.6);
ventana.position.set(-8, 6, 6);
scene.add(ventana);

const luzParedIzquierda = new THREE.PointLight(0xffa94d, 35);
luzParedIzquierda.position.set(-6, 4.5, -9.3);
scene.add(luzParedIzquierda);

const focoIzquierdo = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffc27a }));
focoIzquierdo.position.copy(luzParedIzquierda.position);
scene.add(focoIzquierdo);

const luzParedDerecha = new THREE.PointLight(0xffa94d, 35);
luzParedDerecha.position.set(6, 4.5, -9.3);
scene.add(luzParedDerecha);

const focoDerecho = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffc27a }));
focoDerecho.position.copy(luzParedDerecha.position);
scene.add(focoDerecho);
`;

S.lampara = `const lampara = new THREE.SpotLight(0xfff0d0, 140);
lampara.position.set(0, 5.5, 0);
lampara.target.position.set(0, alturaPano, 0);
lampara.angle = Math.PI / 3.2;
lampara.penumbra = 0.5;
scene.add(lampara);
scene.add(lampara.target);

const cable = new THREE.Mesh(
  new THREE.CylinderGeometry(0.02, 0.02, alturaSala - 5.5, 8),
  new THREE.MeshStandardMaterial({ color: 0x111111 })
);
cable.position.set(0, 5.5 + (alturaSala - 5.5) / 2, 0);
scene.add(cable);

const pantalla = new THREE.Mesh(
  new THREE.ConeGeometry(1, 0.7, 32, 1, true),
  new THREE.MeshStandardMaterial({ color: 0x1f3d2b, roughness: 0.6, side: THREE.DoubleSide })
);
pantalla.position.set(0, 5.55, 0);
scene.add(pantalla);

const bombilla = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfff0d0 }));
bombilla.position.set(0, 5.4, 0);
scene.add(bombilla);
`;

S.sombras = `renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

lampara.castShadow = true;
lampara.shadow.mapSize.set(2048, 2048);
lampara.shadow.bias = -0.0005;

piso.receiveShadow = true;
pano.receiveShadow = true;
tablero.castShadow = true;
tablero.receiveShadow = true;
bordeFondo.castShadow = true;
bordeFrente.castShadow = true;
bordeIzquierdo.castShadow = true;
bordeDerecho.castShadow = true;
`;

function ensamblar() {
  let js = S.base;
  // cada bloque se agrega justo debajo de la marca; se insertan del último al primero para que queden en orden de lectura
  const piso = S.pisoTextura + S.pisoPlano.replace('new THREE.MeshStandardMaterial({ color: 0x9a7b5a, roughness: 0.8 })', S.pisoMaterial);
  // las luces provisionales del paso 2 se reemplazan por las definitivas (paso 12): no entran en la solución
  const secuencia = [piso, S.paredes, S.mesa, S.patas, S.bolas, S.taco, S.luces, S.lampara, S.sombras];
  for (let i = secuencia.length - 1; i >= 0; i--) {
    const fin = js.indexOf(MARCA) + MARCA.length;
    js = js.slice(0, fin) + '\n\n' + secuencia[i].replace(/\n+$/, '') + js.slice(fin);
  }
  return { html: S.html, js };
}

// =============================================================== CÓDIGO QUE MUESTRA LA GUÍA (G): solo lo que se explica por primera vez
const G = {};
const LENGUAJE = { baseHtml: 'xml' };

G.baseHtml = S.html;
G.baseJs = S.base;
G.luzProvisional = S.luzProvisional;
G.pisoPlano = S.pisoPlano;

G.pisoTextura = `// Cada vez que se necesite una textura, se carga así
const cargador = new THREE.TextureLoader();

const texturaPiso = cargador.load("texturas/piso-color.jpg");
texturaPiso.wrapS = THREE.RepeatWrapping;
texturaPiso.wrapT = THREE.RepeatWrapping;
texturaPiso.repeat.set(10, 10);
texturaPiso.colorSpace = THREE.SRGBColorSpace;`;

G.pisoMaterialColor = `new THREE.MeshStandardMaterial({
  map: texturaPiso,
  color: 0xbbbbbb,
  roughness: 0.8
})`;

G.pisoRelieve = `const texturaPisoRelieve = cargador.load("texturas/piso-relieve.jpg");
texturaPisoRelieve.wrapS = THREE.RepeatWrapping;
texturaPisoRelieve.wrapT = THREE.RepeatWrapping;
texturaPisoRelieve.repeat.set(10, 10);`;

G.pisoMaterialMapas = `new THREE.MeshStandardMaterial({
  map: texturaPiso,
  color: 0xbbbbbb,
  bumpMap: texturaPisoRelieve,
  bumpScale: 2,
  roughnessMap: texturaPisoRugosidad,
  roughness: 1
})`;

G.pared = `const tamanoSala = 20;
const alturaSala = 8;

const paredFondo = new THREE.Mesh(
  new THREE.PlaneGeometry(tamanoSala, alturaSala),
  materialLadrillo
);
paredFondo.position.set(x, y, z);
paredFondo.rotation.y = giro;
scene.add(paredFondo);`;

G.mesa = `const anchoMesa = 8;
const fondoMesa = 4;
const alturaPata = 2;
const grosorTablero = 0.3;
const alturaPano = alturaPata + grosorTablero;

const tablero = new THREE.Mesh(
  new THREE.BoxGeometry(anchoMesa + 0.6, grosorTablero, fondoMesa + 0.6),
  materialMaderaLarga
);
tablero.position.y = alturaPata + grosorTablero / 2;
scene.add(tablero);

const pano = new THREE.Mesh(
  new THREE.PlaneGeometry(anchoMesa, fondoMesa),
  new THREE.MeshStandardMaterial({ color: 0x0b6e3a, roughness: 1 })
);
pano.rotation.x = -Math.PI / 2;
pano.position.y = alturaPano + 0.01;
scene.add(pano);`;

G.borde = `const bordeFondo = new THREE.Mesh(
  new THREE.BoxGeometry(anchoMesa + 0.6, 0.4, 0.3),
  materialMaderaLarga
);
bordeFondo.position.set(0, alturaPano + 0.2, -fondoMesa / 2 - 0.15);
scene.add(bordeFondo);`;

G.pataFuncion = `function crearPata(x, z, alto, material)
{
  const malla = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.16, alto, 24),
    material
  );
  malla.position.set(x, alto / 2, z);
  scene.add(malla);
}

crearPata(-3.8, -1.9, 2, materialPata);`;

G.pataClase = `class Pata
{
  constructor(x, z, alto, material)
  {
    this.malla = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.16, alto, 24),
      material
    );
    this.malla.position.set(x, alto / 2, z);
    this.malla.castShadow = true;
    this.malla.receiveShadow = true;
    scene.add(this.malla);
  }
}

const pata1 = new Pata(-3.8, -1.9, alturaPata, materialPata);`;

G.bolaMaterial = `new THREE.MeshPhysicalMaterial({
  color: color,
  roughness: 0.15,
  clearcoat: 1,
  clearcoatRoughness: 0.03
})`;

G.taco = `const taco = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.09, 3.4, 24),
  new THREE.MeshStandardMaterial({ color: 0xd9a066, roughness: 0.5 })
);
taco.rotation.z = -Math.PI / 2;
scene.add(taco);`;

G.luces = `scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const cielo = new THREE.HemisphereLight(0xbcd4ff, 0x5a3a20, 0.35);
scene.add(cielo);

const ventana = new THREE.DirectionalLight(0x8fb4ff, 0.6);
ventana.position.set(-8, 6, 6);
scene.add(ventana);`;

G.luzPared = `const luzParedIzquierda = new THREE.PointLight(0xffa94d, 35);
luzParedIzquierda.position.set(-6, 4.5, -9.3);
scene.add(luzParedIzquierda);

const focoIzquierdo = new THREE.Mesh(
  new THREE.SphereGeometry(0.15, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffc27a })
);
focoIzquierdo.position.copy(luzParedIzquierda.position);
scene.add(focoIzquierdo);`;

G.lampara = `const lampara = new THREE.SpotLight(0xfff0d0, 140);
lampara.position.set(0, 5.5, 0);
lampara.target.position.set(0, alturaPano, 0);
lampara.angle = Math.PI / 3.2;
lampara.penumbra = 0.5;
scene.add(lampara);
scene.add(lampara.target);`;

G.pantalla = `const pantalla = new THREE.Mesh(
  new THREE.ConeGeometry(1, 0.7, 32, 1, true),
  new THREE.MeshStandardMaterial({ color: 0x1f3d2b, roughness: 0.6, side: THREE.DoubleSide })
);
pantalla.position.set(0, 5.55, 0);
scene.add(pantalla);`;

G.sombras = `renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

lampara.castShadow = true;
lampara.shadow.mapSize.set(2048, 2048);
lampara.shadow.bias = -0.0005;

piso.receiveShadow = true;
tablero.castShadow = true;
tablero.receiveShadow = true;`;

G.cambioColor = `new THREE.MeshStandardMaterial({ color: 0x6b1fa8, roughness: 1 })`;

// =============================================================== imágenes del código
function paginaCodigo(codigos) {
  const bloques = codigos.map(([id, code]) => `<pre class="c" id="${id}"><code class="hljs language-${LENGUAJE[id] || 'js'}" data-lang="${LENGUAJE[id] || 'javascript'}">${esc(code)}</code></pre>`).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${aUrl(path.join(HLJS, 'monokai.css'))}">
<style>
  html,body{margin:0;padding:0;background:#272822;}
  pre.c{margin:0 0 20px 0;padding:14px 18px;background:#272822;display:inline-block;font-family:Consolas,"Cascadia Mono",monospace;font-size:16px;line-height:24px;}
  pre.c code{font-family:inherit;font-size:inherit;line-height:inherit;padding:0;background:none;white-space:pre;}
  body > pre.c{display:block;width:max-content;}
</style></head><body>
${bloques}
<script src="${aUrl(path.join(HLJS, 'highlight.js'))}"></script>
<script>
  const h = RevealHighlight().hljs;
  document.querySelectorAll('pre.c code').forEach(c => { c.innerHTML = h.highlight(c.textContent, { language: c.dataset.lang }).value; });
  window.__medidas = {};
  document.querySelectorAll('pre.c').forEach(p => { const r = p.getBoundingClientRect(); window.__medidas[p.id] = [Math.ceil(r.width), Math.ceil(r.height)]; });
  const out = document.createElement('div'); out.id = 'medidas'; out.textContent = JSON.stringify(window.__medidas); document.body.appendChild(out);
</script></body></html>`;
}

function generarImagenes() {
  fs.rmSync(IMGS, { recursive: true, force: true });
  fs.mkdirSync(IMGS, { recursive: true });
  fs.mkdirSync(TMP, { recursive: true });
  const imagenes = Object.entries(G).map(([id, code]) => [id, code.trim()]);
  const pMedir = path.join(TMP, 'medir.html');
  fs.writeFileSync(pMedir, paginaCodigo(imagenes));
  const dom = edge(['--virtual-time-budget=4000', '--dump-dom', aUrl(pMedir)]);
  const m = dom.match(/<div id="medidas">([^<]*)<\/div>/);
  if (!m) throw new Error('No pude medir los bloques de código');
  const medidas = JSON.parse(m[1].replace(/&quot;/g, '"'));
  const dims = {};
  for (const [id, code] of imagenes) {
    const [w, h] = medidas[id];
    dims[id] = { w, h };
    const pSolo = path.join(TMP, 'c_' + id + '.html');
    fs.writeFileSync(pSolo, paginaCodigo([[id, code]]).replace('margin:0 0 20px 0', 'margin:0'));
    const png = path.join(IMGS, id + '.png');
    edge(['--force-device-scale-factor=2', '--virtual-time-budget=3000', `--window-size=${Math.max(w, 500)},${Math.max(h, 120)}`, `--screenshot=${png}`, aUrl(pSolo)]);
    if (!fs.existsSync(png)) throw new Error('No se generó ' + png);
  }
  return dims;
}

// =============================================================== esquemas (isométricos, SVG)
const COS = Math.cos(Math.PI / 6), SIN = 0.5;
function iso(x, y, z, s, ox, oy) { return [ox + (x - z) * COS * s, oy + (x + z) * SIN * s - y * s]; }
const pts = (arr) => arr.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
const poly = (arr, fill, stroke = '#3b4654', extra = '') => `<polygon points="${pts(arr)}" fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round" ${extra}/>`;
const txt = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-family="Segoe UI, Arial, sans-serif" font-size="${o.fs || 12}" ${o.b ? 'font-weight="700"' : ''} fill="${o.c || '#1b232c'}" text-anchor="${o.a || 'start'}">${t}</text>`;
const flecha = (x1, y1, x2, y2, c = '#b8672f') => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = [[x2, y2], [x2 - 8 * Math.cos(a - 0.4), y2 - 8 * Math.sin(a - 0.4)], [x2 - 8 * Math.cos(a + 0.4), y2 - 8 * Math.sin(a + 0.4)]];
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.8"/><polygon points="${pts(h)}" fill="${c}"/>`;
};
const svg = (w, h, cuerpo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;height:auto;display:block;margin:6px auto;border:1px solid #c9d2dc;border-radius:8px;background:#fbfcfe">${cuerpo}</svg>`;

function esquemaPiso() {
  const s = 14;
  let o = '';
  const parado = [iso(0, 0, 0, s, 130, 180), iso(10, 0, 0, s, 130, 180), iso(10, 8, 0, s, 130, 180), iso(0, 8, 0, s, 130, 180)];
  o += poly(parado, '#e6d3b3');
  o += txt(190, 26, 'El plano nace parado', { b: 1, a: 'middle' });
  o += txt(190, 44, '(de pie, como una pared)', { a: 'middle', c: '#5b6672' });
  o += flecha(300, 150, 370, 150);
  o += txt(335, 134, 'rotation.x', { a: 'middle', fs: 12, b: 1, c: '#b8672f' });
  o += txt(335, 172, '= -Math.PI / 2', { a: 'middle', fs: 12, c: '#b8672f' });
  const acostado = [iso(0, 0, 0, s, 500, 80), iso(10, 0, 0, s, 500, 80), iso(10, 0, 10, s, 500, 80), iso(0, 0, 10, s, 500, 80)];
  o += poly(acostado, '#e6d3b3');
  o += txt(500, 26, 'Acostado: ya es un piso', { b: 1, a: 'middle' });
  o += txt(500, 44, 'PlaneGeometry(20, 20)', { a: 'middle', c: '#5b6672', fs: 12 });
  return svg(640, 280, o);
}

function esquemaSala() {
  const s = 12, ox = 320, oy = 120, W = 10, H = 7, D = 10;
  const p = (x, y, z) => iso(x, y, z, s, ox, oy);
  let o = '';
  o += poly([p(0, 0, 0), p(W, 0, 0), p(W, H, 0), p(0, H, 0)], '#f1c9b9');
  o += poly([p(0, 0, 0), p(0, 0, D), p(0, H, D), p(0, H, 0)], '#e8b7a3');
  o += poly([p(0, 0, 0), p(W, 0, 0), p(W, 0, D), p(0, 0, D)], '#e6d3b3');
  o += `<g stroke="#3b4654" stroke-width="1" stroke-dasharray="4 3" fill="none"><polyline points="${pts([p(W, 0, 0), p(W, 0, D)])}"/><polyline points="${pts([p(0, 0, D), p(W, 0, D)])}"/></g>`;
  o += poly([p(0, H, 0), p(W, H, 0), p(W, H, D), p(0, H, D)], 'rgba(60,40,90,0.16)', '#5a4a78', 'stroke-dasharray="5 3"');
  o += txt(ox, oy + 63, 'piso (el del paso anterior)', { a: 'middle', fs: 11, b: 1 });
  o += txt(ox + 52, oy - 12, 'pared del fondo', { a: 'middle', fs: 11, b: 1 });
  o += txt(ox - 52, oy - 12, 'pared izquierda', { a: 'middle', fs: 11, b: 1 });
  o += txt(ox, 16, 'techo', { a: 'middle', fs: 11, b: 1, c: '#5a4a78' });
  o += txt(30, 266, 'La sala es una caja: 1 piso + 4 paredes + 1 techo', { b: 1, fs: 13 });
  o += txt(30, 284, 'Cada pared es un plano de 20 x 8 que mira hacia adentro. El centro del piso es (0, 0, 0).', { fs: 11, c: '#5b6672' });
  o += txt(30, 300, 'En el dibujo faltan la pared de enfrente y la derecha para poder ver el interior.', { fs: 11, c: '#5b6672' });
  o += txt(520, 60, 'x: hacia la derecha', { fs: 11, c: '#b8672f', b: 1 });
  o += txt(520, 76, 'y: hacia arriba', { fs: 11, c: '#b8672f', b: 1 });
  o += txt(520, 92, 'z: hacia ustedes', { fs: 11, c: '#b8672f', b: 1 });
  return svg(640, 315, o);
}

function esquemaMesa() {
  let o = '';
  const ox = 40, oy = 50;
  o += txt(ox, 30, 'Vista desde arriba', { b: 1, fs: 13 });
  o += `<rect x="${ox}" y="${oy}" width="${8.6 * 24}" height="${4.6 * 24}" fill="#7a4a2a" stroke="#3b4654"/>`;
  o += `<rect x="${ox + 0.3 * 24}" y="${oy + 0.3 * 24}" width="${8 * 24}" height="${4 * 24}" fill="#2f9e63" stroke="#1d6b42"/>`;
  o += txt(ox + 4.3 * 24, oy + 2.6 * 24, 'paño (8 x 4)', { a: 'middle', c: '#fff', b: 1, fs: 13 });
  o += txt(ox + 4.3 * 24, oy + 0.24 * 24, 'borde largo', { a: 'middle', c: '#fff', fs: 9 });
  o += txt(ox, oy + 4.6 * 24 + 18, 'tablero de madera: 8,6 x 4,6', { fs: 11, c: '#5b6672' });
  o += txt(ox, oy + 4.6 * 24 + 34, '(queda debajo del paño y los bordes)', { fs: 11, c: '#5b6672' });
  const lx = 330, base = 200;
  o += txt(lx, 30, 'Vista de lado (alturas)', { b: 1, fs: 13 });
  o += `<line x1="${lx - 10}" y1="${base}" x2="${lx + 300}" y2="${base}" stroke="#3b4654" stroke-width="2"/>`;
  const alt = 40;
  o += `<rect x="${lx}" y="${base - alt * 2}" width="26" height="${alt * 2}" fill="#5a3418" stroke="#3b4654"/>`;
  o += `<rect x="${lx + 250}" y="${base - alt * 2}" width="26" height="${alt * 2}" fill="#5a3418" stroke="#3b4654"/>`;
  o += `<rect x="${lx - 8}" y="${base - alt * 2.3}" width="${292}" height="${alt * 0.3}" fill="#7a4a2a" stroke="#3b4654"/>`;
  o += `<rect x="${lx - 8}" y="${base - alt * 2.7}" width="14" height="${alt * 0.4}" fill="#7a4a2a" stroke="#3b4654"/>`;
  o += `<rect x="${lx + 270}" y="${base - alt * 2.7}" width="14" height="${alt * 0.4}" fill="#7a4a2a" stroke="#3b4654"/>`;
  o += `<rect x="${lx + 6}" y="${base - alt * 2.31}" width="${264}" height="3" fill="#2f9e63"/>`;
  o += `<circle cx="${lx + 70}" cy="${base - alt * 2.3 - 8}" r="8" fill="#e8e8e8" stroke="#3b4654"/>`;
  o += txt(lx + 140, base - alt * 2.3 - 20, 'bola', { a: 'middle', fs: 11 });
  const llave = (y1, y2, t) => `<line x1="${lx + 305}" y1="${y1}" x2="${lx + 305}" y2="${y2}" stroke="#b8672f" stroke-width="1.6"/>` + txt(lx + 312, (y1 + y2) / 2 + 4, t, { fs: 11, c: '#b8672f', b: 1 });
  o += llave(base - alt * 2, base, 'alturaPata = 2');
  o += llave(base - alt * 2.3, base - alt * 2, 'grosorTablero = 0,3');
  o += txt(lx + 140, base + 20, 'las patas sostienen el tablero', { a: 'middle', fs: 11, c: '#5b6672' });
  o += txt(lx + 140, base + 36, 'el paño queda a alturaPano = 2,3', { a: 'middle', fs: 11, c: '#5b6672' });
  return svg(760, 260, o);
}

function esquemaClase() {
  let o = '';
  o += `<rect x="30" y="40" width="190" height="120" rx="10" fill="#f7e6d6" stroke="#b8672f" stroke-width="1.6"/>`;
  o += txt(125, 68, 'class Pata', { a: 'middle', b: 1, fs: 16, c: '#b8672f' });
  o += txt(125, 92, 'el molde (la función)', { a: 'middle', fs: 12 });
  o += txt(125, 118, 'recibe: x, z, alto, material', { a: 'middle', fs: 12 });
  o += txt(125, 138, 'hace: una malla de cilindro', { a: 'middle', fs: 12 });
  const patas = [[330, 35, 'new Pata(...)  esquina 1'], [330, 85, 'new Pata(...)  esquina 2'], [330, 135, 'new Pata(...)  esquina 3'], [330, 185, 'new Pata(...)  esquina 4']];
  patas.forEach(([x, y, t]) => {
    o += flecha(222, 100, x - 6, y + 14, '#17806f');
    o += `<rect x="${x}" y="${y}" width="270" height="30" rx="6" fill="#dbf1ec" stroke="#17806f"/>`;
    o += txt(x + 135, y + 20, t, { a: 'middle', fs: 12, c: '#17806f', b: 1 });
  });
  o += txt(30, 245, 'Se escribe el molde una vez y se fabrican las cuatro patas con new', { fs: 12, c: '#5b6672' });
  return svg(640, 258, o);
}

// =============================================================== contenido de la guía
let DIMS = {};
const codeImg = (id, alt) => {
  const d = DIMS[id];
  return `<div class="code keep" style="width:${d.w}px;max-width:100%;"><img src="codigo/${id}.png" width="${d.w}" height="${d.h}" alt="${alt || 'Código del paso (imagen: hay que escribirlo)'}"></div>`;
};
const prueba = (t) => `<div class="box ok keep"><span class="t">Prueba</span>${t}</div>`;
const falla = (t) => `<div class="box warn keep"><span class="t">Si algo falla</span>${t}</div>`;
const queEs = (items) => `<div class="box photo keep"><span class="t">Qué hace cada cosa</span><ul>${items.map(([n, d]) => `<li><b>${n}</b>: ${d}</li>`).join('')}</ul></div>`;
const paso = (n, titulo, meta, cuerpo) => `<section class="paso"><h1>Paso ${n}: ${titulo}</h1><p class="goal">${meta}</p>${cuerpo}</section>`;
const VIDEO_URL = 'https://fundacionlibertadores-my.sharepoint.com/:v:/r/personal/jjardilag_libertadores_edu_co/_layouts/15/stream.aspx?id=%2Fpersonal%2Fjjardilag_libertadores_edu_co%2FDocuments%2FMATERIAS%2F2026-2%2FProgramacion%20web%2FMesa%20de%20billar.mp4&amp;nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&amp;share=cQoP1-M9jfyWS5J1236gOzLLEgUCMkd_IT2f-IhhJq0Md5Dklw';

function cuerpoGuia() {
  const p = [];
  p.push(`<section class="portada">
  <p class="eyebrow">Programación Web · Unidad 2</p>
  <h1>Sala de billar en 3D</h1>
  <p class="sub">Guía paso a paso con Three.js</p>
  <p>En esta guía les cuento cómo armar, paso a paso, una sala de billar: piso, paredes y techo con texturas, una mesa con sus cuatro patas, bolas, un taco y varias luces con sombras. Cuando terminen van a tener una sala completa, y con ella hacen su propia versión con temática en la actividad.</p>
  <div class="box ok keep"><span class="t">Video de muestra: así debería quedar</span><p><a href="${VIDEO_URL}">Ver el video de la sala terminada</a> (en OneDrive).</p></div>
  <div class="box photo keep"><span class="t">Antes de empezar</span>
    <ul>
      <li>Tener <b>Visual Studio Code</b> con la extensión <b>Live Server</b>.</li>
      <li>Buscar y descargar <b>sus propias texturas</b>: madera para el piso y la mesa, y ladrillo (o lo que prefieran) para las paredes. Hay sitios con texturas gratis, como <b>ambientcg.com</b> y <b>polyhaven.com</b>. Cada textura suele venir en varias imágenes: la de <b>color</b>, la de <b>rugosidad</b> (roughness) y alguna de <b>relieve</b> (bump, displacement o normal).</li>
      <li>Crear una carpeta para el proyecto, por ejemplo <b>sala-billar</b>, con una carpeta <b>texturas</b> adentro (para las imágenes) y dos archivos nuevos: <b>index.html</b> y <b>script.js</b>.</li>
      <li>Tener internet: Three.js se carga desde la red.</li>
      <li>Abrir siempre el proyecto con <b>Live Server</b> (clic derecho sobre <b>index.html</b>, <i>Open with Live Server</i>).</li>
    </ul>
  </div>
  <h3>Los pasos</h3>
  <table>
    <tr><th>Paso</th><th>Qué se hace</th></tr>
    <tr><td class="n">1</td><td>La escena base</td></tr>
    <tr><td class="n">2</td><td>Una luz para poder ver</td></tr>
    <tr><td class="n">3, 4 y 5</td><td>El piso: forma, textura de color, relieve y rugosidad</td></tr>
    <tr><td class="n">6</td><td>Las paredes y el techo</td></tr>
    <tr><td class="n">7 y 8</td><td>La mesa: tablero, paño y bordes</td></tr>
    <tr><td class="n">9, 10 y 11</td><td>La clase Pata, las bolas y el taco</td></tr>
    <tr><td class="n">12, 13 y 14</td><td>Las luces, la lámpara y las sombras</td></tr>
    <tr><td class="n">15</td><td>Revisar y volverla propia</td></tr>
  </table>
</section>`);

  p.push(paso(1, 'La escena base',
    'Partir de una escena que ya funciona: la misma estructura de las clases anteriores, más un control de cámara.',
    `<p>Las variables, la escena, la cámara y el renderer ya se conocen de las clases anteriores. Lo que se necesita es una <b>escena base que funcione</b>. El JavaScript va en un <b>archivo aparte</b>, no dentro del HTML. En <b>index.html</b> escribir:</p>
    ${codeImg('baseHtml')}
    <p>La etiqueta <b>script</b> con <b>type="module"</b> y <b>src="script.js"</b> carga el archivo <b>script.js</b>. El <b>importmap</b> es el mismo de la clase 6: permite escribir <b>import ... from "three"</b> dentro de <b>script.js</b>. Después, en <b>script.js</b>, escribir la escena base:</p>
    ${codeImg('baseJs')}
    ${queEs([
      ['renderer.setAnimationLoop(animar)', 'queda arriba, apenas se crea el renderer, como se vio en clase. La función <b>animar</b> se escribe abajo del todo: JavaScript la encuentra igual.'],
      ['import { OrbitControls }', 'trae el control de cámara con el mouse. No viene dentro de Three.js: se importa de la carpeta <b>addons</b>.'],
      ['new OrbitControls(camera, renderer.domElement)', 'permite mover la cámara con el mouse: arrastrar gira alrededor de la escena y la rueda acerca y aleja. Necesita la cámara y el elemento donde está el dibujo.'],
      ['controles.update()', 'va dentro de <b>animar</b>, para que los controles se actualicen en cada cuadro.']
    ])}
    <p>Todo lo que viene a partir del paso 2 se escribe <b>debajo del comentario "Aquí va todo lo que sigue"</b>, en el orden de la guía.</p>
    ${prueba('La pantalla se ve de color oscuro, sin errores, y la consola (F12) está limpia. Aún no hay nada que mirar.')}
    ${falla('<ul><li>Pantalla en blanco y error en la consola: revisar que las llaves y los paréntesis estén cerrados.</li><li>Error al cargar <b>script.js</b> o al importar: abrir el proyecto con <b>Live Server</b>, no con doble clic, y revisar que el archivo se llame exactamente <b>script.js</b>.</li></ul>')}`));

  p.push(paso(2, 'Una luz para poder ver',
    'Poner luces provisionales: los materiales de este proyecto se ven negros si no hay luz.',
    `${codeImg('luzProvisional')}
    <p>Son las luces de la clase 8: <b>AmbientLight</b> ilumina todo por igual y <b>DirectionalLight</b> ilumina como el sol, con rayos paralelos desde la posición indicada. Más adelante se borran y se reemplazan por la iluminación definitiva (paso 12).</p>
    ${prueba('Sigue sin verse nada: todavía no hay objetos.')}`));

  p.push(paso(3, 'El piso: un plano acostado',
    'Crear el piso de la sala con un plano grande.',
    `${esquemaPiso()}
    ${codeImg('pisoPlano')}
    ${queEs([
      ['PlaneGeometry(20, 20)', 'un plano de 20 de ancho y 20 de fondo. Esas son las medidas que yo uso, pero si quieren una sala más grande o más pequeña, pueden cambiarlas (y entonces cambiar también las medidas de lo que viene después).'],
      ['MeshStandardMaterial', 'el material con luz de la clase 8. <b>color</b> es el color base y <b>roughness</b> qué tan mate es (1 = totalmente mate).'],
      ['rotation.x', 'el giro alrededor del eje x. El plano nace parado, hay que acostarlo.'],
      ['Math', 'es la biblioteca de matemáticas de JavaScript. <b>Math.PI</b> es el número π (3,1416...).'],
      ['Radianes', 'los giros en Three.js no se miden en grados sino en <b>radianes</b>: una vuelta completa son 2π y media vuelta (180 grados) es π. Por eso <b>Math.PI / 2</b> es un cuarto de vuelta (90 grados), y el signo negativo decide hacia qué lado gira. Si prefieren pensar en grados, pueden buscar la forma de convertir grados a radianes y usar el resultado.']
    ])}
    ${prueba('Un piso plano de color café claro sobre el que se puede girar con el mouse.')}
    ${falla('<ul><li>No se ve el piso: revisar que esté <b>scene.add(piso)</b>. Si se ve solo desde abajo, el signo del giro está al revés.</li></ul>')}`));

  p.push(paso(4, 'Textura de color para el piso',
    'Cubrir el piso con una imagen de madera repetida.',
    `<p>Una <b>textura</b> es una imagen que se pega sobre una superficie. Primero se crea el <b>cargador</b> y después se carga la imagen. <b>Cada vez que se necesite una textura nueva, se carga de esta misma manera</b>, una por una. Escribir este bloque <b>encima de</b> <b>const piso</b>, con el nombre de su archivo:</p>
    ${codeImg('pisoTextura')}
    ${queEs([
      ['new THREE.TextureLoader()', 'el cargador: el objeto que sabe leer imágenes y volverlas texturas.'],
      ['cargador.load("texturas/piso-color.jpg")', 'carga la imagen que está en esa dirección y devuelve la textura. En la dirección va <b>el nombre de su propio archivo</b>, escrita desde la carpeta donde está <b>index.html</b>: si guardaron la imagen en la carpeta <b>texturas</b>, queda "texturas/nombre.jpg". Si la guardan en otra carpeta, cambia la dirección. Revisar mayúsculas y la extensión (.jpg, .png).'],
      ['wrapS y wrapT', 'qué pasa cuando la imagen se acaba: S es el eje horizontal y T el vertical. <b>RepeatWrapping</b> significa "volver a empezar", es decir, repetirla en mosaico.'],
      ['repeat.set(10, 10)', 'cuántas veces se repite: 10 en horizontal y 10 en vertical. Regla: repeat = medida del objeto ÷ medida de un mosaico. El piso mide 20 y si cada tabla ocupa 2, entonces 20 ÷ 2 = 10. Cada textura es distinta, así que hay que probar hasta que se vea natural. Si no se repite, la imagen se ve enorme y estirada.'],
      ['colorSpace = SRGBColorSpace', 'le avisa a Three.js que esta imagen es de <b>color</b>. Sin esto los colores se ven lavados.']
    ])}
    <p>Ahora, en el material del piso, sustituir el <b>color</b> plano por la textura. Cambiar la línea del material por:</p>
    ${codeImg('pisoMaterialColor')}
    <p><b>map</b> es la propiedad donde va la textura de color. Aquí <b>color</b> se mezcla con la imagen: un gris (0xbbbbbb) la oscurece un poco; el blanco (0xffffff) la deja tal cual.</p>
    ${prueba('El piso se ve de tablas de madera pequeñas y repetidas, no de una sola imagen enorme.')}
    ${falla('<ul><li>El piso queda gris o sin textura: abrir la consola (<b>F12</b>). Un error <b>404</b> indica que la dirección o el nombre del archivo no coinciden con el de su carpeta.</li><li>Error de seguridad al cargar la imagen: el proyecto se abrió sin Live Server.</li><li>Madera estirada: falta <b>repeat</b> o <b>RepeatWrapping</b>.</li></ul>')}`));

  p.push(paso(5, 'Relieve y rugosidad del piso',
    'Agregar dos imágenes más al piso para que la madera tenga relieve y no brille igual en todas partes.',
    `<p>Una textura no tiene que ser solo color: cada imagen puede controlar <b>una propiedad distinta</b> del material. Cada una es <b>una textura aparte</b>: se carga igual que la de color, con el mismo <b>wrapS</b>, <b>wrapT</b> y <b>repeat</b> (o las capas no coinciden). Estas imágenes son datos, no colores, así que <b>no llevan colorSpace</b>. Por ejemplo, la de relieve:</p>
    ${codeImg('pisoRelieve')}
    <p>La de rugosidad (<b>texturaPisoRugosidad</b>) se carga <b>de la misma manera</b>: háganla ustedes. Después, cambiar de nuevo el material del piso para que use las dos:</p>
    ${codeImg('pisoMaterialMapas')}
    ${queEs([
      ['bumpMap', 'imagen en escala de grises: lo claro es "alto" y lo oscuro es "bajo". Con la luz se ve como relieve, aunque el piso sigue plano (relieve falso). Si su set trae una imagen de <b>displacement</b> o <b>height</b>, también sirve; la de <b>normal</b> es otra propiedad (<b>normalMap</b>) y funciona parecido.'],
      ['bumpScale', 'cuánto se nota ese relieve. Más grande, más marcado. Prueben el valor hasta que se vea bien.'],
      ['roughnessMap', 'imagen que dice qué zonas son más lisas (brillan) y cuáles más rugosas (mates).'],
      ['roughness: 1', 'con un roughnessMap, este número multiplica al mapa. En 1 el mapa manda por completo; con valores más bajos el material se vuelve más brillante en general. Prueben ustedes cuál prefieren.']
    ])}
    ${prueba('La madera ahora tiene vetas marcadas y unas zonas brillan más que otras al girar la cámara.')}
    ${falla('<ul><li>El relieve se ve desfasado de la imagen de color: los tres <b>repeat</b> deben ser iguales.</li><li>No se nota el relieve: subir <b>bumpScale</b>.</li></ul>')}`));

  p.push(paso(6, 'Las paredes y el techo',
    'Cerrar la sala con cuatro paredes y un techo.',
    `${esquemaSala()}
    <p>La sala es una caja: el piso ya está. Primero se crea el <b>material de las paredes</b> igual que el del piso: una textura de color (con <b>colorSpace</b>) y una de relieve, las dos con el mismo <b>repeat</b>, y un <b>MeshStandardMaterial</b> con <b>map</b> y <b>bumpMap</b>. Las paredes miden 20 x 8, así que el repeat horizontal será mayor que el vertical. Llamarlo <b>materialLadrillo</b> (o como quieran). Después, <b>así se hace una pared</b>:</p>
    ${codeImg('pared')}
    ${queEs([
      ['tamanoSala y alturaSala', 'variables con las medidas de la sala (20 de lado y 8 de alto), para no repetir números. Si cambiaron el tamaño del piso, cambiarlas aquí.'],
      ['position.set(x, y, z)', 'ubica la pared en la escena. x va hacia la derecha, y hacia arriba y z hacia ustedes. El centro del piso es (0, 0, 0).'],
      ['rotation.y', 'gira la pared alrededor del eje vertical. Un plano solo se ve por su cara delantera (clase 8, <b>side</b>): una pared mal girada desaparece desde adentro, así que hay que girarla hasta que mire <b>hacia adentro</b> de la sala.'],
      ['El mismo material', 'un mismo material puede servir a varias mallas, así no se cargan las imágenes cuatro veces.']
    ])}
    <p>Ahora hacer <b>otras tres paredes de estas</b> y el <b>techo</b> (un plano como el piso, pero arriba de todo y mirando hacia abajo). Una vez creadas, <b>moverlas y girarlas</b> para que se acomoden según el esquema y cierren la sala. Los valores de <b>position</b> y <b>rotation</b> se encuentran probando.</p>
    ${prueba('Una sala cerrada: paredes con textura, piso de madera y un techo oscuro. Desde adentro no se ven huecos.')}
    ${falla('<ul><li>Una pared no se ve: probablemente mira hacia afuera. Probar con el signo contrario en su <b>rotation.y</b>.</li><li>Ladrillos enormes: revisar el <b>repeat</b>.</li></ul>')}`));

  p.push(paso(7, 'La mesa: tablero y paño',
    'Armar la base de la mesa: un tablero de madera y, encima, el paño verde.',
    `${esquemaMesa()}
    <p>Dentro de la caja de la sala va la mesa. Primero el <b>material de la madera</b>, creado como el del piso (color y relieve, con <b>MeshStandardMaterial</b>). Llamarlo <b>materialMaderaLarga</b>. Una caja tiene un detalle: pone la imagen <b>entera en cada una de sus 6 caras</b>, así que el <b>repeat</b> depende de la medida de la cara larga. Para el tablero y los bordes largos sirve un repeat de unas 4 veces en horizontal y 1 en vertical. Después, escribir las medidas, el tablero y el paño:</p>
    ${codeImg('mesa')}
    ${queEs([
      ['BoxGeometry(ancho, alto, fondo)', 'una caja. El tablero mide 8,6 de ancho y 4,6 de fondo, un poco más que el paño para dejar espacio a los bordes. Sus medidas también se pueden cambiar.'],
      ['alturaPano', 'la altura de la superficie de la mesa: lo que miden las patas más el grosor del tablero. Las bolas se apoyan ahí.'],
      ['position.y = alturaPata + grosorTablero / 2', 'el centro del tablero queda a la mitad de su grosor por encima de donde terminan las patas.'],
      ['pano.position.y = alturaPano + 0.01', 'el paño es un plano que queda justo encima del tablero. El 0,01 de más evita que los dos se peleen por el mismo lugar y parpadeen.']
    ])}
    ${prueba('Una plataforma de madera con un paño verde encima, flotando en el aire (todavía no tiene patas).')}
    ${falla('<ul><li>El paño no se ve: probablemente quedó debajo del tablero. Revisar <b>alturaPano + 0.01</b>.</li></ul>')}`));

  p.push(paso(8, 'Los bordes de la mesa',
    'Cerrar la mesa con cuatro bordes de madera.',
    `<p>Así se hace un borde (el del fondo):</p>
    ${codeImg('borde')}
    <p>Está a <b>alturaPano + 0.2</b> (la mitad de su alto de 0,4, para que su base quede sobre el tablero) y separado del centro la mitad del fondo del paño más la mitad de su grosor (0,15).</p>
    <p>Hacer <b>otros tres bordes</b>: el del frente (igual, pero al otro lado) y los dos de los extremos. Los de los extremos son más cortos (la caja es <b>BoxGeometry(0.3, 0.4, fondoMesa)</b>), así que necesitan <b>otro material de madera</b> con otro repeat (por ejemplo 2 en horizontal): si usaran el mismo, la veta se vería aplastada.</p>
    ${prueba('La mesa ya tiene un marco de madera alrededor del paño.')}
    ${falla('<ul><li>Un borde queda dentro del paño o se separa de la mesa: revisar su <b>position.set</b> con el esquema de la mesa.</li><li>La veta se ve muy estirada en un borde: revisar que cada tamaño de borde use el material que le corresponde.</li></ul>')}`));

  p.push(paso(9, 'La clase Pata',
    'Hacer las cuatro patas con una clase en lugar de escribir el mismo código cuatro veces.',
    `<p>Las patas son iguales: cambian solo de lugar. Esto ya se sabe resolver con una <b>función</b> (como el <b>crearBola</b> de la clase 8). Antes, crear el <b>materialPata</b> (madera, con un repeat que haga que la veta corra a lo largo de la pata). Esta es la función:</p>
    ${codeImg('pataFuncion')}
    <p>Una <b>clase</b> es una función que <b>fabrica objetos</b>, con nombre propio y con memoria. Es la misma pata, escrita como clase:</p>
    ${esquemaClase()}
    ${codeImg('pataClase')}
    ${queEs([
      ['class Pata', 'el molde. Por convención, el nombre de una clase empieza con <b>mayúscula</b>.'],
      ['constructor(x, z, alto, material)', 'es la función que se ejecuta al fabricar una pata. Los <b>parámetros</b> son los datos que cambian de una pata a otra. El cuerpo del constructor es el cuerpo de la función de antes.'],
      ['this', 'significa "este objeto". <b>this.malla</b> guarda la malla dentro de la pata: en la función era una variable local (<b>const malla</b>) que desaparecía; con <b>this</b> queda guardada y se puede usar después, desde afuera (por ejemplo <b>pata1.malla.position.y</b>).'],
      ['new Pata(...)', 'fabrica una pata nueva y ejecuta el constructor con los datos que se le pasan. Es el equivalente de llamar a la función. Sin el <b>new</b>, da error.'],
      ['castShadow y receiveShadow', 'son para las sombras. Se explican en el paso 14: por ahora se dejan escritas y no hacen nada que se vea.']
    ])}
    <p>Ahora crear <b>las otras tres patas</b>, una en cada esquina de la mesa.</p>
    ${prueba('Cuatro patas de madera oscura, una en cada esquina, que sostienen la mesa.')}
    ${falla('<ul><li>No aparece nada: revisar que la línea lleve <b>new</b> antes de <b>Pata</b>.</li><li>Una pata se ve torcida o en otro lugar: revisar los signos de las coordenadas x y z de esa pata.</li></ul>')}`));

  p.push(paso(10, 'Las bolas',
    'Fabricar las bolas con una clase, igual que las patas.',
    `<p>Así como se hizo una clase <b>Pata</b> que recibe unos datos, ahora hacer una <b>clase Bola</b> que reciba el <b>color</b>, la <b>posición</b> (y, si quieren, el <b>radio</b> o lo que decidan ponerle). El cuerpo del constructor es lo que se haría con una sola bola: una esfera con su material, ubicada sobre el paño y agregada a la escena. Cuando la clase esté terminada, <b>llamarla</b> con <b>new</b> para crear todas las bolas que quieran: 7, 16 o las que prefieran. Con la clase es igual de fácil hacer 7 que 16.</p>
    <p>El material de las bolas tiene propiedades nuevas:</p>
    ${codeImg('bolaMaterial')}
    ${queEs([
      ['SphereGeometry(radio, 48, 48)', 'la esfera. Los dos 48 son cuántos segmentos tiene: más segmentos, más redonda.'],
      ['MeshPhysicalMaterial', 'es como el Standard, pero con extras, como el <b>clearcoat</b>.'],
      ['clearcoat', 'una capa de barniz encima (de 0 a 1), como en las bolas de resina.'],
      ['clearcoatRoughness', 'qué tan liso es ese barniz: bajo se ve como un espejo.'],
      ['Altura sobre el paño', 'para que la bola quede apoyada, su centro tiene que estar a <b>un radio</b> por encima del paño. Si se pone solo la altura del paño, queda medio enterrada.']
    ])}
    ${prueba('Las bolas que hayan decidido hacer, brillantes y apoyadas sobre el paño, sin encimarse.')}
    ${falla('<ul><li>Bolas medio hundidas: revisar la altura. Bolas encimadas: revisar sus coordenadas x y z.</li><li>No aparece nada: revisar que se haya llamado la clase con <b>new</b>.</li></ul>')}`));

  p.push(paso(11, 'El taco',
    'Poner un taco apoyado cerca de la bola blanca.',
    `<p>El taco es uno solo, así que no necesita clase: un cilindro bien ubicado. Se puede dejar así de sencillo o hacerlo más artístico (una punta de otro color, una cinta, detalles).</p>
    ${codeImg('taco')}
    ${queEs([
      ['CylinderGeometry(radioArriba, radioAbajo, alto, ...)', 'un cilindro. Con dos radios distintos queda en forma de cono cortado: el taco es más delgado en la punta. Estas medidas también se pueden cambiar.'],
      ['rotation.z', 'el cilindro nace parado (como el plano). Un cuarto de vuelta (<b>Math.PI / 2</b>) lo acuesta. El signo decide hacia qué lado queda la punta.']
    ])}
    <p>Después, ubicarlo con <b>position.set</b> cerca de la bola blanca, apuntándole, y un poco por encima del paño (la punta a la altura del centro de la bola).</p>
    ${prueba('Un taco de madera apoyado cerca de la bola blanca, apuntándole.')}
    ${falla('<ul><li>El taco queda atravesando la mesa o los bordes: subir un poco su altura (<b>y</b>) o moverlo.</li></ul>')}`));

  p.push(paso(12, 'Las luces del ambiente',
    'Cambiar las luces provisionales por una iluminación de sala de billar.',
    `<ol>
      <li>Borrar las luces provisionales del paso 2.</li>
      <li>Escribir las luces generales:
        ${codeImg('luces')}</li>
      <li>Y dos luces cálidas en la pared del fondo, cada una con una bolita brillante para que se vea. Así se hace la primera:
        ${codeImg('luzPared')}
        <p>Hacer <b>otra igual</b> al otro lado de la pared.</p></li>
    </ol>
    ${queEs([
      ['AmbientLight(color, 0.15)', 'una luz base muy suave, para que nada quede completamente negro.'],
      ['HemisphereLight(colorArriba, colorAbajo, intensidad)', 'pinta de un color lo que mira hacia arriba (azul cielo) y de otro lo que mira hacia abajo (café del piso). Da un ambiente más natural.'],
      ['DirectionalLight', 'aquí es la luz fría de una ventana: viene desde la posición indicada, con rayos paralelos.'],
      ['PointLight(color, intensidad)', 'una bombilla que ilumina en todas direcciones desde un punto. Necesita intensidades altas porque se debilita con la distancia.'],
      ['MeshBasicMaterial', 'material que no necesita luz: la bolita siempre se ve brillante, como una bombilla.'],
      ['position.copy(...)', 'copia la posición de otro objeto: la bolita queda justo donde está la luz.']
    ])}
    ${prueba('La sala queda en penumbra, con manchas de luz naranja cerca de las luces de pared.')}
    ${falla('<ul><li>Todo muy oscuro: subir un poco la intensidad de la <b>HemisphereLight</b> (el último número).</li><li>No se ven las luces de pared: girar la cámara y revisar que su posición quede dentro de la sala.</li></ul>')}`));

  p.push(paso(13, 'La lámpara colgante',
    'Colgar una lámpara sobre la mesa que la ilumine con un cono de luz.',
    `<p>Primero la luz:</p>
    ${codeImg('lampara')}
    <p>Después, para que parezca una lámpara, una pantalla (un cono abierto):</p>
    ${codeImg('pantalla')}
    <p>Y por último, <b>un cable</b> (un cilindro muy delgado que sube hasta el techo) y <b>una bombilla</b> (una esfera con <b>MeshBasicMaterial</b>): hacerlos ustedes.</p>
    ${queEs([
      ['SpotLight(color, intensidad)', 'un foco, como una lámpara de techo: ilumina en forma de cono. Necesita una intensidad alta (cerca de 100).'],
      ['angle', 'qué tan abierto es el cono.'],
      ['penumbra', 'qué tan suave es el borde del cono: 0 es un corte duro y 1 es muy difuso.'],
      ['target', 'el punto hacia el que apunta el foco. También se agrega a la escena (<b>scene.add(lampara.target)</b>).'],
      ['ConeGeometry(radio, alto, segmentos, ..., true)', 'un cono. El <b>true</b> final lo deja abierto, sin tapa, como la pantalla de una lámpara.'],
      ['side: THREE.DoubleSide', 'el material se ve por las dos caras (clase 8): así se ve la pantalla por dentro y por fuera.']
    ])}
    ${prueba('Un cono de luz cálida cae sobre el paño y las bolas brillan. Todavía no hay sombras.')}
    ${falla('<ul><li>La mesa sale oscura: revisar que <b>lampara.target</b> también esté agregado a la escena.</li></ul>')}`));

  p.push(paso(14, 'Las sombras',
    'Activar las sombras para que las bolas, el taco y las patas dejen de verse flotando.',
    `<p>Para que haya sombras hacen falta <b>tres interruptores</b>: el <b>renderer</b> las activa, la <b>luz</b> las proyecta y los <b>objetos</b> proyectan o reciben. Escribir debajo de todo lo demás:</p>
    ${codeImg('sombras')}
    ${queEs([
      ['renderer.shadowMap.enabled', 'el interruptor general. El <b>shadowMap</b> es una "foto" que la luz toma de la escena desde donde está: lo que se ve en la foto recibe luz y lo que queda detrás queda en sombra.'],
      ['lampara.castShadow', 'esta luz proyecta sombras. Cada luz con sombra tiene un costo, por eso solo se activa en la lámpara.'],
      ['shadow.mapSize', 'la resolución de esa foto. Poca resolución da sombras pixeladas; 2048 se ve bien.'],
      ['shadow.bias', 'un número negativo muy pequeño que evita rayas raras sobre las superficies.'],
      ['castShadow (objeto)', '"yo tapo la luz": el objeto proyecta sombra.'],
      ['receiveShadow (objeto)', '"sobre mí se ve la sombra": el objeto recibe sombras. Un objeto puede hacer las dos cosas, como el tablero.']
    ])}
    <p>Ahora hacer lo mismo con los <b>demás objetos</b>: los que tapan la luz (bolas, taco, bordes) y los que reciben la sombra (el paño). Las patas ya lo tienen escrito adentro de su clase.</p>
    ${prueba('Las bolas, el taco y las patas proyectan su sombra sobre el paño y el piso. Para ver qué hace cada interruptor, desactivar una línea con <b>//</b>, recargar y volverla a activar.')}
    ${falla('<ul><li>No hay sombras: revisar que el renderer, la lámpara y el objeto tengan su interruptor en <b>true</b>.</li><li>Sombras pixeladas: revisar que el <b>mapSize</b> sea 2048.</li></ul>')}`));

  p.push(paso(15, 'Revisar y volverla propia',
    'Comprobar que la sala está completa y empezar a darle una temática propia.',
    `<h3>Lista de revisión</h3>
    <ul class="check">
      <li>Piso, 4 paredes y techo, con texturas.</li>
      <li>Mesa con bordes y cuatro patas hechas con la clase <b>Pata</b>.</li>
      <li>Bolas hechas con la clase <b>Bola</b> y un taco.</li>
      <li>Por lo menos seis luces, una con sombras.</li>
      <li>Texturas con el repeat bien calculado y por lo menos dos mapas además del color.</li>
    </ul>
    <h3>Para su temática</h3>
    <ul>
      <li>Cambiar colores, texturas y luces: un salón vaquero, un casino, el espacio, un bar de playa, algo medieval.</li>
      <li>Para cambiar el color del paño, sustituir el material por otro color, por ejemplo:
        ${codeImg('cambioColor')}</li>
      <li>Probar mapas nuevos (<b>normalMap</b>, <b>aoMap</b>, <b>displacementMap</b>) en alguna superficie, y ajustar el repeat según la medida de cada objeto.</li>
    </ul>
    <div class="box photo keep"><span class="t">La entrega</span>
      <p>La actividad se entrega con <b>dos cosas</b>: la <b>carpeta del proyecto</b> (con <b>index.html</b>, <b>script.js</b> y la carpeta <b>texturas</b>) y un <b>timelapse</b> de ustedes haciéndola.</p>
      <ul>
        <li>Grabar la <b>pantalla completa</b>; no vale compartir solo la ventana de Visual Studio Code.</li>
        <li><b>Sin cortes ni ediciones</b>: un solo video grabado.</li>
        <li>Se puede acelerar hasta <b>4 veces</b> la velocidad, como máximo.</li>
      </ul>
    </div>`));
  return p.join('\n');
}

function htmlGuia() {
  const css = fs.readFileSync(path.join(__dirname, 'guia.css'), 'utf8');
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Guía: sala de billar en 3D</title>
<style>${css}
  @page{margin:10mm 13mm;}
  section.paso{break-before:auto;margin-top:14px;}
  section.paso h1{font-size:15pt;}
  .code{margin:6px 0;border-radius:8px;overflow:hidden;background:#272822;line-height:0;}
  .code img{display:block;width:100%;height:auto;}
  .portada h1{font-size:28pt;}
  ol>li,ul>li{margin-bottom:6px;}
</style></head><body><div class="wrap">
${cuerpoGuia()}
</div></body></html>`;
}

// =============================================================== ejecución
DIMS = generarImagenes();
fs.writeFileSync(HTML, htmlGuia());
const sol = ensamblar();
fs.mkdirSync(ENSAMBLADO_DIR, { recursive: true });
fs.writeFileSync(path.join(ENSAMBLADO_DIR, 'index.html'), sol.html);
fs.writeFileSync(path.join(ENSAMBLADO_DIR, 'script.js'), sol.js);
console.log('Solución de referencia (prueba):', ENSAMBLADO_DIR);
edge(['--no-pdf-header-footer', `--print-to-pdf=${PDF}`, aUrl(HTML)]);
const t = fs.existsSync(PDF) ? fs.statSync(PDF).mtime : null;
console.log(t && Date.now() - t.getTime() < 120000 ? `PDF listo: ${PDF}` : `No se pudo escribir ${PDF} (¿está abierto en otro programa?)`);
