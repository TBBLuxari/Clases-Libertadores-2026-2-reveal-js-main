// PASO 1 — La bola recuerda su posición y su velocidad, y tiene un método update() que la mueve.
// Todavía se mueve "por cuadro" (cada vez que se dibuja), sin tener en cuenta el tiempo.
import { THREE, scene, camera, renderer, controles, alturaPano, radioBola } from "../escenario.js";

class Bola
{
  constructor(color, x, z)
  {
    this.radio = radioBola;     // NUEVO: datos que la bola recuerda
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

  // NUEVO: método
  update()
  {
    this.x += this.vx;
    this.z += this.vz;
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

blanca.vx = 0.05;      // NUEVO: 0.05 unidades por cuadro

renderer.setAnimationLoop(animar);

function animar()
{
  blanca.update();     // NUEVO
  controles.update();
  renderer.render(scene, camera);
}
