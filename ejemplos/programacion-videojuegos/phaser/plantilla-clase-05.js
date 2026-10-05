let personaje;
let cursors;
let teclaEspacio;
let teclaShift;

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
  teclaEspacio = this.input.keyboard.addKey("SPACE");
  teclaShift = this.input.keyboard.addKey("SHIFT");
}

function update() 
{

  moverPersonaje();

  personaje.x = Phaser.Math.Clamp(personaje.x, 0, 800);
  personaje.y = Phaser.Math.Clamp(personaje.y, 0, 600);

  if (Phaser.Input.Keyboard.JustDown(teclaEspacio))  
  {   
    personaje.setTint(Phaser.Math.Between(0, 0xffffff));
  }

}


function moverPersonaje() 
{

  if (cursors.left.isDown) 
  {
    if (teclaShift.isDown)
    { 
      personaje.x -= 10; 
    } else 
    { 
      personaje.x -= 4; 
    }
  }

  if (cursors.right.isDown) 
  {
    if (teclaShift.isDown) 
    { 
      personaje.x += 10; 
    } 
    else 
    { 
      personaje.x += 4; 
    }
  }

  if (cursors.up.isDown) 
  {
    if (teclaShift.isDown) 
    { 
      personaje.y -= 10; 
    } 
    else
    { 
      personaje.y -= 4; 
    }
  }

  if (cursors.down.isDown) 
  {
    if (teclaShift.isDown) 
    { 
      personaje.y += 10; 
    } 
    else 
    { 
      personaje.y += 4; 
    }
  }

}

const juego = new Phaser.Game(config);
