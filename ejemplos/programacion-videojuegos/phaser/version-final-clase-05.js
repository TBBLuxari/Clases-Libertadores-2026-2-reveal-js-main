// Clase 5 completa: nivel armado con array, collider/overlap, y mouse (seguir + clic)

let personaje;
let cursors;
let teclaEspacio;
let teclaShift;
let seguidor;
let marcador;

let plataformas;
let monedas;
let puntaje;

// 1 = piso, M = moneda, 0 = vacío
const nivel = [
  "0000000000",
  "00M0000M00",
  "0011110000",
  "1111111111",
];

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: { preload: preload, create: create, update: update }
};

function preload()
{
  this.load.image("personaje", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
}

function create()
{
  crearNivel(this);

  personaje = this.physics.add.sprite(100, 100, "personaje");
  cursors = this.input.keyboard.createCursorKeys();
  teclaEspacio = this.input.keyboard.addKey("SPACE");
  teclaShift = this.input.keyboard.addKey("SHIFT");

  this.physics.add.collider(personaje, plataformas);
  this.physics.add.overlap(personaje, monedas, recogerMoneda);

  // sprite que sigue el mouse
  seguidor = this.add.sprite(700, 50, "personaje");

  // sprite que salta a la posición del clic
  marcador = this.add.sprite(400, 50, "personaje");
  this.input.on("pointerdown", (pointer) =>
  {
    marcador.x = pointer.x;
    marcador.y = pointer.y;
  });
}

function update()
{

  moverPersonaje();

  // Clamp sigue sirviendo para no salirse del canvas: no hay ningún
  // collider peleando contra esto, así que no genera el problema de abajo.
  personaje.x = Phaser.Math.Clamp(personaje.x, 0, 800);
  personaje.y = Phaser.Math.Clamp(personaje.y, 0, 600);

  if (Phaser.Input.Keyboard.JustDown(teclaEspacio))
  {
    personaje.setTint(Phaser.Math.Between(0, 0xffffff));
  }

  // el seguidor se actualiza cuadro a cuadro con la posición del mouse
  seguidor.x = this.input.activePointer.x;
  seguidor.y = this.input.activePointer.y;

}


function moverPersonaje()
{
  // Velocidad en píxeles POR SEGUNDO (no por cuadro): con physics.add.sprite
  // el movimiento se hace con body.setVelocity, no escribiendo x/y a mano.
  // Si no, el collider pierde la pelea contra este código cada cuadro y
  // el personaje se atraviesa las plataformas igual (ver nota en el chat).
  const normal = 240;
  const sprint = 600;

  let velocidadX = 0;
  let velocidadY = 0;

  if (cursors.left.isDown)
  {
    velocidadX = teclaShift.isDown ? -sprint : -normal;
  }
  else if (cursors.right.isDown)
  {
    velocidadX = teclaShift.isDown ? sprint : normal;
  }

  if (cursors.up.isDown)
  {
    velocidadY = teclaShift.isDown ? -sprint : -normal;
  }
  else if (cursors.down.isDown)
  {
    velocidadY = teclaShift.isDown ? sprint : normal;
  }

  personaje.body.setVelocity(velocidadX, velocidadY);
}

// recorre el array "nivel" y crea las plataformas y monedas correspondientes
function crearNivel(escena)
{
  plataformas = escena.physics.add.staticGroup();
  monedas = escena.physics.add.staticGroup();
  puntaje = 0;

  for (let fila = 0; fila < nivel.length; fila++)
  {
    for (let col = 0; col < nivel[fila].length; col++)
    {
      if (nivel[fila][col] === "1")
      {
        plataformas.create(col * 64 + 32, fila * 64 + 32, "personaje");
      }
      if (nivel[fila][col] === "M")
      {
        monedas.create(col * 64 + 32, fila * 64 + 32, "personaje");
      }
    }
  }
}

// se dispara cuando el personaje toca una moneda
function recogerMoneda(personaje, moneda)
{
  moneda.destroy();
  puntaje += 1;
  console.log(puntaje);
}

const juego = new Phaser.Game(config);
