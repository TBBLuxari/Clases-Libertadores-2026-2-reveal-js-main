// PASO 8 — El rebote entre dos bolas: de la velocidad de cada una solo se intercambia
// la parte que va por la línea que une los dos centros (la normal). Masas iguales, choque elástico.
// Todavía solo se revisa la pareja blanca-amarilla.
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
  }

  dibujar()
  {
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

  chocar(otra)
  {
    const dx = otra.x - this.x;
    const dz = otra.z - this.z;
    const distancia = Math.sqrt(dx * dx + dz * dz);

    if (distancia >= this.radio + otra.radio)
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

    // NUEVO: velocidad de esta bola vista desde la otra
    const relativaX = this.vx - otra.vx;
    const relativaZ = this.vz - otra.vz;

    // NUEVO: cuánto de esa velocidad apunta hacia la otra bola (producto punto con la normal)
    const acercamiento = relativaX * nx + relativaZ * nz;

    if (acercamiento <= 0)
    {
      return;                       // ya se están separando: no hay rebote
    }

    // NUEVO: se intercambia la parte que va por la normal
    this.vx -= acercamiento * nx;
    this.vz -= acercamiento * nz;
    otra.vx += acercamiento * nx;
    otra.vz += acercamiento * nz;
  }
}

const blanca = new Bola(0xffffff, -2, 0, 6, 0);
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

  blanca.chocar(amarilla);

  for (const bola of bolas)
  {
    bola.dibujar();
  }

  controles.update();
  renderer.render(scene, camera);
}
