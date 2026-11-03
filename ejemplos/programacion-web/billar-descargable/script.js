import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const TEXTURAS = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r169/examples/textures/";

const anchoMesa = 8;
const fondoMesa = 4;
const alturaPata = 2;
const grosorTablero = 0.3;
const alturaPano = alturaPata + grosorTablero;
const radioBola = 0.2;
const tamanoSala = 20;
const alturaSala = 8;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120e18);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 6.5, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controles = new OrbitControls(camera, renderer.domElement);
controles.target.set(0, alturaPano, 0);
controles.update();

window.addEventListener("resize", function ()
{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const cargador = new THREE.TextureLoader();

function cargarTextura(archivo, repetirX, repetirY, esColor)
{
  const textura = cargador.load(TEXTURAS + archivo);
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

const taco = new Taco(3.4, -2.4, 0);
taco.apuntarA(-2, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const cielo = new THREE.HemisphereLight(0xbcd4ff, 0x5a3a20, 0.35);
scene.add(cielo);

const ventana = new THREE.DirectionalLight(0x8fb4ff, 0.6);
ventana.position.set(-8, 6, 6);
scene.add(ventana);

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

const FRICCION = 0.8;
const RESTITUCION = 0.92;

class Bola
{
  constructor(color, x, z, vx = 0, vz = 0)
  {
    this.radio = radioBola;
    this.x0 = x;
    this.z0 = z;
    this.x = x;
    this.z = z;
    this.vx = vx;
    this.vz = vz;

    this.malla = new THREE.Mesh(
      new THREE.SphereGeometry(this.radio, 48, 48),
      new THREE.MeshPhysicalMaterial({
        color: color,
        roughness: 0.15,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.03
      })
    );
    this.malla.position.set(this.x, alturaPano + this.radio, this.z);
    this.malla.castShadow = true;
    scene.add(this.malla);
  }

  update(delta)
  {
    this.x += this.vx * delta;
    this.z += this.vz * delta;
    this.rebotarEnBordes();
    this.frenar(delta);
  }

  dibujar()
  {
    this.malla.position.set(this.x, alturaPano + this.radio, this.z);
  }

  reiniciar()
  {
    this.x = this.x0;
    this.z = this.z0;
    this.vx = 0;
    this.vz = 0;
  }

  rebotarEnBordes()
  {
    const limiteX = anchoMesa / 2 - this.radio;
    const limiteZ = fondoMesa / 2 - this.radio;

    if (this.x > limiteX)
    {
      this.x = limiteX;
      this.vx = -this.vx * RESTITUCION;
    }
    if (this.x < -limiteX)
    {
      this.x = -limiteX;
      this.vx = -this.vx * RESTITUCION;
    }
    if (this.z > limiteZ)
    {
      this.z = limiteZ;
      this.vz = -this.vz * RESTITUCION;
    }
    if (this.z < -limiteZ)
    {
      this.z = -limiteZ;
      this.vz = -this.vz * RESTITUCION;
    }
  }

  rapidez()
  {
    return Math.sqrt(this.vx * this.vx + this.vz * this.vz);
  }

  frenar(delta)
  {
    const freno = 1 - FRICCION * delta;
    this.vx *= freno;
    this.vz *= freno;

    if (this.rapidez() < 0.05)
    {
      this.vx = 0;
      this.vz = 0;
    }
  }

  chocar(otra)
  {
    const dx = otra.x - this.x;
    const dz = otra.z - this.z;
    const distancia = Math.sqrt(dx * dx + dz * dz);

    if (distancia >= this.radio + otra.radio || distancia === 0)
    {
      return;
    }

    const nx = dx / distancia;
    const nz = dz / distancia;

    const traslape = this.radio + otra.radio - distancia;
    this.x -= nx * traslape / 2;
    this.z -= nz * traslape / 2;
    otra.x += nx * traslape / 2;
    otra.z += nz * traslape / 2;

    const relativaX = this.vx - otra.vx;
    const relativaZ = this.vz - otra.vz;
    const acercamiento = relativaX * nx + relativaZ * nz;

    if (acercamiento <= 0)
    {
      return;
    }

    const impulso = acercamiento * (1 + RESTITUCION) / 2;
    this.vx -= impulso * nx;
    this.vz -= impulso * nz;
    otra.vx += impulso * nx;
    otra.vz += impulso * nz;
  }
}

const blanca = new Bola(0xffffff, -2, 0);
const amarilla = new Bola(0xffd166, 1.0, 0);
const azul = new Bola(0x1d4ed8, 1.36, -0.205);
const roja = new Bola(0xd62828, 1.36, 0.205);
const morada = new Bola(0x7b2cbf, 1.72, -0.41);
const negra = new Bola(0x111111, 1.72, 0);
const naranja = new Bola(0xf77f00, 1.72, 0.41);

const bolas = [blanca, amarilla, azul, roja, morada, negra, naranja];

function todasQuietas()
{
  for (const bola of bolas)
  {
    if (bola.rapidez() > 0)
    {
      return false;
    }
  }
  return true;
}

window.addEventListener("keydown", function (evento)
{
  if (evento.code === "Space" && todasQuietas())
  {
    blanca.vx = 9;
    blanca.vz = 1.35;
  }
  if (evento.code === "KeyR")
  {
    for (const bola of bolas)
    {
      bola.reiniciar();
    }
  }
});

const reloj = new THREE.Clock();

renderer.setAnimationLoop(animar);

function animar()
{
  const delta = Math.min(reloj.getDelta(), 0.05);

  for (const bola of bolas)
  {
    bola.update(delta);
  }

  for (let i = 0; i < bolas.length; i++)
  {
    for (let j = i + 1; j < bolas.length; j++)
    {
      bolas[i].chocar(bolas[j]);
    }
  }

  for (const bola of bolas)
  {
    bola.dibujar();
  }

  taco.grupo.visible = todasQuietas();

  controles.update();
  renderer.render(scene, camera);
}
