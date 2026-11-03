// PASO 2 — Movimiento con tiempo: la velocidad pasa a ser "unidades por segundo" y update recibe delta.
import { THREE, scene, camera, renderer, controles, alturaPano, radioBola } from "../escenario.js";

class Bola
{
  constructor(color, x, z)
  {
    this.radio = radioBola;
    this.x = x;
    this.z = z;
    this.vx = 0;
    this.vz = 0;

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

  update(delta)                       // NUEVO: recibe delta
  {
    this.x += this.vx * delta;        // NUEVO: velocidad × tiempo
    this.z += this.vz * delta;
    this.malla.position.set(this.x, alturaPano + this.radio, this.z);
  }
}

const blanca = new Bola(0xffffff, -2, 0);
const amarilla = new Bola(0xffd166, 1.0, 0);
const azul = new Bola(0x1d4ed8, 1.36, -0.205);
const roja = new Bola(0xd62828, 1.36, 0.205);
const morada = new Bola(0x7b2cbf, 1.72, -0.41);
const negra = new Bola(0x111111, 1.72, 0);
const naranja = new Bola(0xf77f00, 1.72, 0.41);

blanca.vx = 3;                        // NUEVO: 3 unidades por SEGUNDO

const reloj = new THREE.Clock();      // NUEVO

renderer.setAnimationLoop(animar);

function animar()
{
  const delta = Math.min(reloj.getDelta(), 0.05);   // NUEVO: segundos desde el cuadro anterior
  blanca.update(delta);
  controles.update();
  renderer.render(scene, camera);
}
