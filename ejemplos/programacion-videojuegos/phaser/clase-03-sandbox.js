// ============================================================================
// Clase 3 — código de referencia (main.js completo)
// ============================================================================
// Esto NO es para mostrar en clase ni para que los estudiantes lo vean. Es la
// versión COMPLETA de lo que main.js debería tener al final de clase-03.html,
// para comparar rápido contra lo que van armando ellos.
//
// Cada bloque de create()/update() está comentado con el título del bloque
// correspondiente en clase-03.html y su minuto aproximado (data-min), para
// ubicarlo rápido en el deck.
//
// Usa this.add.sprite (no this.add.image) y la textura "personaje" para
// todos los objetos, igual que en el deck. Para pegar esto en un proyecto
// real, cambien la ruta de preload() por "assets/personaje.png".
// ============================================================================

// clase-03.html: declarar afuera de create()/update() lo que ambas
// funciones necesitan compartir (~27.6 - 38.6 min)
let personaje;
let cursors;
let teclaEspacio;
let seguidor;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload: preload, create: create, update: update }
};

function preload() {
  this.load.image("personaje", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
}

function create() {

  // ---- "Teclado: movimiento continuo" (~26.6 min) ----
  personaje = this.add.sprite(400, 300, "personaje");
  cursors = this.input.keyboard.createCursorKeys();

  // ---- "Acciones de una sola pulsación" / JustDown (~101.5 min) ----
  // teclaEspacio SÍ se guarda en variable (a diferencia de Shift): JustDown
  // necesita comparar este cuadro contra el anterior.
  teclaEspacio = this.input.keyboard.addKey("SPACE");

  // ---- "Input de mouse" → "seguir el mouse" (~126.3 min) ----
  seguidor = this.add.sprite(100, 100, "personaje");

  // ---- "Clics" (~138.6 min) + Reto 2 de "Todo junto" (rastro de clics, ~189.3 min) ----
  const marcador = this.add.sprite(400, 100, "personaje");

  this.input.on("pointerdown", (pointer) => {
    marcador.x = pointer.x;
    marcador.y = pointer.y;

    // Reto 2: dejar un rastro de círculos en cada clic
    this.add.circle(pointer.x, pointer.y, 4, 0xffe066, 0.6);
  });

  // ---- "Arrastrar objetos" (~148.9 min) ----
  const arrastrable = this.add.sprite(200, 450, "personaje");
  arrastrable.setInteractive();
  this.input.setDraggable(arrastrable);

  this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // ---- "Rueda del mouse" (~179.5 min) ----
  this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
    personaje.scale += dy > 0 ? -0.05 : 0.05;
  });
}

function update() {

  // ---- "Teclado: movimiento continuo" + "Combos: correr con Shift" (~26.6 / 81.8 min) ----
  // Shift NO se guarda en variable: se revisa inline, dentro de cada if.
  if (cursors.left.isDown) {
    if (this.input.keyboard.addKey("SHIFT").isDown) { personaje.x -= 10; } else { personaje.x -= 4; }
  }
  if (cursors.right.isDown) {
    if (this.input.keyboard.addKey("SHIFT").isDown) { personaje.x += 10; } else { personaje.x += 4; }
  }
  if (cursors.up.isDown) {
    if (this.input.keyboard.addKey("SHIFT").isDown) { personaje.y -= 10; } else { personaje.y -= 4; }
  }
  if (cursors.down.isDown) {
    if (this.input.keyboard.addKey("SHIFT").isDown) { personaje.y += 10; } else { personaje.y += 4; }
  }

  // ---- "El problema del borde" (~54.6 min) ----
  // Esta es la versión base (todo el canvas). Los retos de franja
  // vertical/horizontal/diagonal son variantes que cada estudiante
  // resuelve distinto — no hay una única respuesta que poner aquí.
  personaje.x = Phaser.Math.Clamp(personaje.x, 0, 800);
  personaje.y = Phaser.Math.Clamp(personaje.y, 0, 600);

  // ---- "Acciones de una sola pulsación" / JustDown (~101.5 min) ----
  if (Phaser.Input.Keyboard.JustDown(teclaEspacio)) {
    personaje.setTint(Phaser.Math.Between(0, 0xffffff));
  }

  // ---- "Input de mouse" → "seguir el mouse" (~126.3 min) ----
  seguidor.x = this.input.activePointer.x;
  seguidor.y = this.input.activePointer.y;

  // ---- "Apuntar hacia el mouse" (~164.7 min) ----
  personaje.rotation = Phaser.Math.Angle.Between(
    personaje.x, personaje.y,
    this.input.activePointer.x, this.input.activePointer.y
  );
}

const juego = new Phaser.Game(config);
