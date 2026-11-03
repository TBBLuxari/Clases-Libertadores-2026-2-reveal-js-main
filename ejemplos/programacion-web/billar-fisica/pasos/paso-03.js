// PASO 3 — Todas las bolas se mueven: velocidad desde el constructor (parámetros con valor por defecto)
// y un arreglo con todas las bolas para actualizarlas con un for.
import { THREE, scene, camera, renderer, controles, alturaPano, radioBola } from "../escenario.js";

class Bola
{
  constructor(color, x, z, vx = 0, vz = 0)     // NUEVO: vx y vz valen 0 si no los pasan
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
    this.malla.position.set(this.x, alturaPano + this.radio, this.z);
  }
}

const blanca = new Bola(0xffffff, -2, 0, 4, 0.5);
const amarilla = new Bola(0xffd166, 1.0, 0, -1.5, 0.8);
const azul = new Bola(0x1d4ed8, 1.36, -0.205, 0.6, -1.4);
const roja = new Bola(0xd62828, 1.36, 0.205, 1.2, 1.0);
const morada = new Bola(0x7b2cbf, 1.72, -0.41, -0.8, -1.8);
const negra = new Bola(0x111111, 1.72, 0, 1.6, 0);
const naranja = new Bola(0xf77f00, 1.72, 0.41, 0.4, 1.6);

const bolas = [blanca, amarilla, azul, roja, morada, negra, naranja];   // NUEVO

const reloj = new THREE.Clock();

renderer.setAnimationLoop(animar);

function animar()
{
  const delta = Math.min(reloj.getDelta(), 0.05);

  for (const bola of bolas)      // NUEVO: una línea para todas
  {
    bola.update(delta);
  }

  controles.update();
  renderer.render(scene, camera);
}
