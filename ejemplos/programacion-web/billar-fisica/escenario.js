// Escenario de la clase 10: es la sala de billar de la clase 9 (piso, paredes, techo, mesa, patas, taco y luces)
// SIN las bolas. Las bolas y su física viven en los archivos de la carpeta pasos/.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export { THREE };

const TEXTURAS = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r169/examples/textures/";

// ---------- Medidas que usa la física ----------
export const anchoMesa = 8;
export const fondoMesa = 4;
export const alturaPata = 2;
export const grosorTablero = 0.3;
export const alturaPano = alturaPata + grosorTablero;
export const radioBola = 0.2;
const tamanoSala = 20;
const alturaSala = 8;

// ---------- Escena, cámara y renderer ----------
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120e18);

export const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 6.5, 7);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

export const controles = new OrbitControls(camera, renderer.domElement);
controles.target.set(0, alturaPano, 0);
controles.update();

window.addEventListener("resize", function ()
{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Texturas ----------
const cargador = new THREE.TextureLoader();
const texturas = [];

function cargarTextura(archivo, repetirX, repetirY, esColor)
{
  const textura = cargador.load(TEXTURAS + archivo);
  texturas.push(textura);
  textura.wrapS = THREE.RepeatWrapping;
  textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(repetirX, repetirY);
  textura.anisotropy = 8;
  if (esColor)
  {
    textura.colorSpace = THREE.SRGBColorSpace;
  }
  return textura;
}

function crearMaterialMadera(repetirX, repetirY, tinte)
{
  return new THREE.MeshStandardMaterial({
    color: tinte,
    map: cargarTextura("hardwood2_diffuse.jpg", repetirX, repetirY, true),
    bumpMap: cargarTextura("hardwood2_bump.jpg", repetirX, repetirY, false),
    bumpScale: 2,
    roughnessMap: cargarTextura("hardwood2_roughness.jpg", repetirX, repetirY, false)
  });
}

function crearMaterialLadrillo(repetirX, repetirY)
{
  return new THREE.MeshStandardMaterial({
    map: cargarTextura("brick_diffuse.jpg", repetirX, repetirY, true),
    bumpMap: cargarTextura("brick_bump.jpg", repetirX, repetirY, false),
    bumpScale: 4,
    roughnessMap: cargarTextura("brick_roughness.jpg", repetirX, repetirY, false)
  });
}

// ---------- Sala: piso, paredes y techo ----------
const piso = new THREE.Mesh(
  new THREE.PlaneGeometry(tamanoSala, tamanoSala),
  crearMaterialMadera(10, 10, 0xbbbbbb)
);
piso.rotation.x = -Math.PI / 2;
piso.receiveShadow = true;
scene.add(piso);

const techo = new THREE.Mesh(
  new THREE.PlaneGeometry(tamanoSala, tamanoSala),
  new THREE.MeshStandardMaterial({ color: 0x2b2233, roughness: 1 })
);
techo.rotation.x = Math.PI / 2;
techo.position.y = alturaSala;
scene.add(techo);

function crearPared(x, z, giroY)
{
  const pared = new THREE.Mesh(
    new THREE.PlaneGeometry(tamanoSala, alturaSala),
    crearMaterialLadrillo(5, 2)
  );
  pared.position.set(x, alturaSala / 2, z);
  pared.rotation.y = giroY;
  pared.receiveShadow = true;
  scene.add(pared);
  return pared;
}

crearPared(0, -tamanoSala / 2, 0);
crearPared(0, tamanoSala / 2, Math.PI);
crearPared(-tamanoSala / 2, 0, Math.PI / 2);
crearPared(tamanoSala / 2, 0, -Math.PI / 2);

// ---------- Mesa: tablero, paño, bordes ----------
const tablero = new THREE.Mesh(
  new THREE.BoxGeometry(anchoMesa + 0.6, grosorTablero, fondoMesa + 0.6),
  crearMaterialMadera(4, 1, 0x7a4a2a)
);
tablero.position.y = alturaPata + grosorTablero / 2;
tablero.castShadow = true;
tablero.receiveShadow = true;
scene.add(tablero);

const pano = new THREE.Mesh(
  new THREE.PlaneGeometry(anchoMesa, fondoMesa),
  new THREE.MeshStandardMaterial({ color: 0x0b6e3a, roughness: 1 })
);
pano.rotation.x = -Math.PI / 2;
pano.position.y = alturaPano + 0.01;
pano.receiveShadow = true;
scene.add(pano);

const bordeLargo = new THREE.BoxGeometry(anchoMesa + 0.6, 0.4, 0.3);
const bordeCorto = new THREE.BoxGeometry(0.3, 0.4, fondoMesa);
const maderaBordeLargo = crearMaterialMadera(4, 1, 0x7a4a2a);
const maderaBordeCorto = crearMaterialMadera(2, 1, 0x7a4a2a);

function crearBorde(geometria, material, x, z)
{
  const borde = new THREE.Mesh(geometria, material);
  borde.position.set(x, alturaPano + 0.2, z);
  borde.castShadow = true;
  borde.receiveShadow = true;
  scene.add(borde);
  return borde;
}

crearBorde(bordeLargo, maderaBordeLargo, 0, -fondoMesa / 2 - 0.15);
crearBorde(bordeLargo, maderaBordeLargo, 0, fondoMesa / 2 + 0.15);
crearBorde(bordeCorto, maderaBordeCorto, -anchoMesa / 2 - 0.15, 0);
crearBorde(bordeCorto, maderaBordeCorto, anchoMesa / 2 + 0.15, 0);

// ---------- Clase Pata ----------
const maderaPata = crearMaterialMadera(1, 2, 0x5a3418);

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

const xPata = anchoMesa / 2 - 0.2;
const zPata = fondoMesa / 2 - 0.1;
new Pata(-xPata, -zPata, alturaPata, maderaPata);
new Pata(xPata, -zPata, alturaPata, maderaPata);
new Pata(-xPata, zPata, alturaPata, maderaPata);
new Pata(xPata, zPata, alturaPata, maderaPata);

// ---------- Clase Taco ----------
const maderaTaco = new THREE.MeshStandardMaterial({ color: 0xd9a066, roughness: 0.5 });
const materialPunta = new THREE.MeshStandardMaterial({ color: 0x2a6fdb, roughness: 0.9 });

class Taco
{
  constructor(largo, x, z)
  {
    this.grupo = new THREE.Group();

    const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, largo, 24), maderaTaco);
    cuerpo.rotation.x = Math.PI / 2;
    cuerpo.position.z = -largo / 2 - 0.04;
    cuerpo.castShadow = true;

    const punta = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 24), materialPunta);
    punta.rotation.x = Math.PI / 2;
    punta.position.z = -0.02;
    punta.castShadow = true;

    this.grupo.add(cuerpo);
    this.grupo.add(punta);
    this.grupo.position.set(x, alturaPano + radioBola, z);
    scene.add(this.grupo);
  }

  apuntarA(x, z)
  {
    this.grupo.lookAt(x, alturaPano + radioBola, z);
    this.grupo.rotateX(0.14);
  }
}

export const taco = new Taco(3.4, -2.4, 0);
taco.apuntarA(-2, 0);

// ---------- Luces ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const cielo = new THREE.HemisphereLight(0xbcd4ff, 0x5a3a20, 0.35);
scene.add(cielo);

const ventana = new THREE.DirectionalLight(0x8fb4ff, 0.6);
ventana.position.set(-8, 6, 6);
scene.add(ventana);

// Lámpara colgante sobre la mesa: la que da la sombra
const lampara = new THREE.SpotLight(0xfff0d0, 140);
lampara.position.set(0, 5.5, 0);
lampara.target.position.set(0, alturaPano, 0);
lampara.angle = Math.PI / 3.2;
lampara.penumbra = 0.5;
lampara.castShadow = true;
lampara.shadow.mapSize.set(2048, 2048);
lampara.shadow.bias = -0.0005;
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

const bombilla = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff0d0 })
);
bombilla.position.set(0, 5.4, 0);
scene.add(bombilla);

// Dos luces cálidas en la pared del fondo
function crearLuzDePared(x)
{
  const luz = new THREE.PointLight(0xffa94d, 35);
  luz.position.set(x, 4.5, -9.3);
  scene.add(luz);

  const foco = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffc27a })
  );
  foco.position.copy(luz.position);
  scene.add(foco);
  return luz;
}

crearLuzDePared(-6);
crearLuzDePared(6);

// ---------- Modo captura ----------
// Solo para generar las imágenes de la presentación (docs/capturas-clase-10.js). No es parte de lo que escriben los estudiantes.
//   ?t=2.5       simula 2.5 segundos de animación (a 60 cuadros por segundo) y dibuja un solo cuadro
//   ?vista=arriba|mesa|sala
//   ?rastro=1    deja el rastro de cada bola;  ?colliders=1  dibuja el círculo de choque de cada bola
const params = new URLSearchParams(location.search);
if (params.has("t"))
{
  const cuadros = Math.round(parseFloat(params.get("t")) * 60);
  const vista = params.get("vista") || "mesa";

  renderer.setPixelRatio(1);
  THREE.Clock.prototype.getDelta = function () { return 1 / 60; };

  if (vista === "arriba")
  {
    camera.position.set(0, 7.0, 0.01);
    controles.target.set(0, alturaPano, 0);
    cable.visible = false;      // la lámpara taparía la mesa vista desde arriba
    pantalla.visible = false;
    bombilla.visible = false;
  }
  else if (vista === "sala")
  {
    camera.position.set(0, 5.5, 9);
    controles.target.set(0, 0, 0);
  }
  else
  {
    camera.position.set(0, 6.2, 6.4);
    controles.target.set(0, alturaPano, 0);
  }
  controles.update();

  // Las bolas se reconocen por su geometría; así no hay que tocar el código de cada paso.
  const esBola = (o) => o.isMesh && o.geometry.type === "SphereGeometry" && o.geometry.parameters.radius === radioBola;
  const rastros = new Map();
  const ayudas = new THREE.Group();
  scene.add(ayudas);

  const muestrear = () =>
  {
    if (!params.has("rastro")) return;
    const soloBlanca = params.get("rastro") === "blanca";
    scene.traverse((o) =>
    {
      if (!esBola(o)) return;
      if (soloBlanca && o.material.color.getHex() !== 0xffffff) return;
      if (!rastros.has(o)) rastros.set(o, []);
      const lista = rastros.get(o);
      const ultimo = lista[lista.length - 1];
      if (!ultimo || ultimo.distanceTo(o.position) > 0.12) lista.push(o.position.clone());
    });
  };

  const dibujarAyudas = () =>
  {
    for (const [bola, lista] of rastros)
    {
      for (const p of lista)
      {
        const punto = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 8, 8),
          new THREE.MeshBasicMaterial({ color: bola.material.color.getHex() === 0xffffff ? 0x5ff0d0 : 0xffd166 })
        );
        punto.position.set(p.x, alturaPano + 0.05, p.z);
        ayudas.add(punto);
      }
    }
    if (params.has("colliders"))
    {
      scene.traverse((o) =>
      {
        if (!esBola(o)) return;
        const aro = new THREE.Mesh(
          new THREE.RingGeometry(radioBola - 0.02, radioBola, 64),
          new THREE.MeshBasicMaterial({ color: 0x5ff0d0, side: THREE.DoubleSide, depthTest: false })
        );
        aro.renderOrder = 10;
        aro.rotation.x = -Math.PI / 2;
        aro.position.set(o.position.x, alturaPano + radioBola, o.position.z);
        ayudas.add(aro);
      });
    }
  };

  // Los cuadros intermedios no se dibujan (solo se calculan); el último sí, cuando ya cargaron las texturas.
  const dibujarDeVerdad = renderer.render.bind(renderer);
  renderer.render = muestrear;
  renderer.setAnimationLoop = function (animar)
  {
    if (!animar) return;
    for (let i = 0; i < cuadros; i++) animar();

    const esperarTexturas = () =>
    {
      if (!texturas.every((t) => t.image)) { setTimeout(esperarTexturas, 100); return; }
      renderer.render = dibujarDeVerdad;
      dibujarAyudas();
      animar();
      document.title = "listo";
    };
    esperarTexturas();
  };
}
