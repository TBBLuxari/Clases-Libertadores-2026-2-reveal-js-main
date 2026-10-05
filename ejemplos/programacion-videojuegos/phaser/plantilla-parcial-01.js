// Plantilla de arranque del parcial 1 — el juego ya enciende y el personaje ya aparece.
// Peguen esto en su main.js y agreguen ahí mismo lo que pida su pregunta.

let personaje;
let cursors;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload: preload, create: create, update: update }
};

function preload()
{
  this.load.image("personaje", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
}

function create()
{
  personaje = this.add.sprite(400, 300, "personaje");

  cursors = this.input.keyboard.createCursorKeys();
}

function update()
{

}

const juego = new Phaser.Game(config);
