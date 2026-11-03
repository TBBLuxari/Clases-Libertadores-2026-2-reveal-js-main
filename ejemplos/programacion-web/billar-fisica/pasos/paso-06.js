// PASO 6 — Detectar el choque: dos bolas se tocan cuando la distancia entre sus centros es menor que la suma de sus radios.
// Por ahora solo las pintamos de rojo para ver que funciona.
import { THREE, scene, camera, renderer, controles, anchoMesa, fondoMesa, alturaPano, radioBola } from "../escenario.js";

const FRICCION = 0.8;

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
    this.frenar(delta);
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

  // NUEVO
  chocar(otra)
  {
    const dx = otra.x - this.x;
    const dz = otra.z - this.z;
    const distancia = Math.sqrt(dx * dx + dz * dz);

    if (distancia < this.radio + otra.radio)
    {
      this.malla.material.color.set(0xff0000);
      otra.malla.material.color.set(0xff0000);
    }
  }
}

const blanca = new Bola(0xffffff, -2, 0, 6, 0);      // solo la blanca se mueve
const amarilla = new Bola(0xffd166, 1.0, 0);
const azul = new Bola(0x1d4ed8, 1.36, -0.205);
const roja = new Bola(0xd62828, 1.36, 0.205);
const morada = new Bola(0x7b2cbf, 1.72, -0.41);
const negra = new Bola(0x111111, 1.72, 0);
const naranja = new Bola(0xf77f00, 1.72, 0.41);

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

  blanca.chocar(amarilla);      // NUEVO: ¿se tocan estas dos?

  controles.update();
  renderer.render(scene, camera);
}
