// PASO 5 — Fricción: el paño frena las bolas poco a poco hasta que se detienen.
import { THREE, scene, camera, renderer, controles, anchoMesa, fondoMesa, alturaPano, radioBola } from "../escenario.js";

const FRICCION = 0.8;     // NUEVO: qué tanto frena el paño por segundo

class Bola
{
  constructor(color, x, z, vx = 0, vz = 0)
  {
    this.radio = radioBola;
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
    this.frenar(delta);         // NUEVO
    this.malla.position.set(this.x, alturaPano + this.radio, this.z);
  }

  rebotarEnBordes()
  {
    const limiteX = anchoMesa / 2 - this.radio;
    const limiteZ = fondoMesa / 2 - this.radio;

    if (this.x > limiteX)
    {
      this.x = limiteX;
      this.vx = -this.vx;
    }
    if (this.x < -limiteX)
    {
      this.x = -limiteX;
      this.vx = -this.vx;
    }
    if (this.z > limiteZ)
    {
      this.z = limiteZ;
      this.vz = -this.vz;
    }
    if (this.z < -limiteZ)
    {
      this.z = -limiteZ;
      this.vz = -this.vz;
    }
  }

  // NUEVO: qué tan rápido va (el largo de la flecha de velocidad)
  rapidez()
  {
    return Math.sqrt(this.vx * this.vx + this.vz * this.vz);
  }

  // NUEVO
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
}

const blanca = new Bola(0xffffff, -2, 0, 5, 1.8);
const amarilla = new Bola(0xffd166, 1.0, 0, -1.5, 0.8);
const azul = new Bola(0x1d4ed8, 1.36, -0.205, 0.6, -1.4);
const roja = new Bola(0xd62828, 1.36, 0.205, 1.2, 1.0);
const morada = new Bola(0x7b2cbf, 1.72, -0.41, -0.8, -1.8);
const negra = new Bola(0x111111, 1.72, 0, 1.6, 0);
const naranja = new Bola(0xf77f00, 1.72, 0.41, 0.4, 1.6);

const bolas = [blanca, amarilla, azul, roja, morada, negra, naranja];

const reloj = new THREE.Clock();

renderer.setAnimationLoop(animar);

function animar()
{
  const delta = Math.min(reloj.getDelta(), 0.05);

  for (const bola of bolas)
  {
    bola.update(delta);
  }

  controles.update();
  renderer.render(scene, camera);
}
