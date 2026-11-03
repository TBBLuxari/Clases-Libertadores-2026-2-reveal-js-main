// PASO 0 — Punto de partida: la clase Bola de la clase 9. Las bolas están quietas.
import { THREE, scene, camera, renderer, controles, alturaPano, radioBola } from "../escenario.js";

class Bola
{
  constructor(color, x, z)
  {
    this.malla = new THREE.Mesh(
      new THREE.SphereGeometry(radioBola, 48, 48),
      new THREE.MeshPhysicalMaterial({
        color: color,
        roughness: 0.15,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.03
      })
    );
    this.malla.position.set(x, alturaPano + radioBola, z);
    this.malla.castShadow = true;
    scene.add(this.malla);
  }
}

const blanca = new Bola(0xffffff, -2, 0);
const amarilla = new Bola(0xffd166, 1.0, 0);
const azul = new Bola(0x1d4ed8, 1.36, -0.205);
const roja = new Bola(0xd62828, 1.36, 0.205);
const morada = new Bola(0x7b2cbf, 1.72, -0.41);
const negra = new Bola(0x111111, 1.72, 0);
const naranja = new Bola(0xf77f00, 1.72, 0.41);

renderer.setAnimationLoop(animar);

function animar()
{
  controles.update();
  renderer.render(scene, camera);
}
