const GAME_STAGE_WIDTH = 800;
const GAME_STAGE_HEIGHT = 600;
const HUD_HEIGHT = 50;
const CRAFT_VELOCITY = 150;
const LASERS_GROUP_SIZE = 40;
const LEFT_LASER_OFFSET_X = 11;
const RIGHT_LASER_OFFSET_X = 12;
const LASERS_OFFSET_Y = 10;
const LASERS_VELOCITY = 500;
const UFOS_GROUP_SIZE = 150;
const NEW_UFOS_GROUP_SIZE = 50;

const TIMER_RHYTHM = 0.1 * Phaser.Timer.SECOND;
const BLASTS_GROUP_SIZE = 30;
const UFO_PROBABILITY = 0.3;
const UFO_VELOCITY = 120;
const HITS_FOR_NEW_ENEMY = 20;
const MAX_LIVES = 2;

let craft;
let cursors;
let stars;
let lasers;
let fireButton;
let ufos;
let newUfos;
let newUfosVelocity;
let newUfosMinX;
let newUfosMaxX;

let currentUfoProbability;
let currentUfoVelocity;
let blasts;
let score;
let scoreText;
let lives;
let livesText;

let levelConfig;

let ufo;
let newufo;

let check;

let playState = {
    preload: preloadPlay,
    create: createPlay,
    update: updatePlay
};

let game = new Phaser.Game(GAME_STAGE_WIDTH, GAME_STAGE_HEIGHT, Phaser.CANVAS, 'gamestage');

let levelsData = ['assets/enemy.json'];




// Entry point
window.onload = startGame;

function startGame() {
    game.state.add('play', playState);
    game.state.add('end',hofState);
    game.state.start('play');
   
}

function preloadPlay() {
    game.load.image('craft', 'assets/imgs/craft.png');
    game.load.image('stars', 'assets/imgs/stars.png');
    game.load.image('laser', 'assets/imgs/laser.png');
    game.load.image('ufo', 'assets/imgs/ufo.png');
    game.load.spritesheet('blast', 'assets/imgs/blast.png', 128, 128);
    game.load.spritesheet('newufo', 'assets/imgs/newUfo.png', 64, 64);

    game.load.text('enemy', levelsData[0], true);
}

function createPlay() {
    score = 0;
    lives = MAX_LIVES;
    let w = game.world.width;
    let h = game.world.height;
    stars = game.add.tileSprite(0, 0, w, h, 'stars');

    levelConfig = JSON.parse(game.cache.getText('enemy'));
    check=10

    createCraft();
    createKeyControls();
    createLasers(LASERS_GROUP_SIZE);
    createBlasts(BLASTS_GROUP_SIZE);
    createUfos(UFOS_GROUP_SIZE);

    createNewUfos(NEW_UFOS_GROUP_SIZE);

    createHUD();
    
}

function createNewUfos(number) {
    newUfos = game.add.group();
    newUfos.enableBody = true;
    newUfos.createMultiple(number, 'newufo');
    newUfos.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetMember);
    newUfos.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    newUfos.setAll('checkWorldBounds', true);

    
    newUfosVelocity= levelConfig.velocity; 
    newUfosMinX=levelConfig.posX.min;
    newUfosMaxX=levelConfig.posX.max;

    game.time.events.loop(TIMER_RHYTHM, activateNewUfo, this);
    

}


function createCraft() {
    let x = game.world.centerX;
    let y = game.world.height - HUD_HEIGHT;
    craft = game.add.sprite(x, y, 'craft');
    craft.anchor.setTo(0.5, 0.5);

    game.physics.arcade.enable(craft);
    craft.body.collideWorldBounds = true;
}

function createKeyControls() {
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function createHUD() {
    let scoreX = 5;
    let livesX = game.world.width - 20;
    let allY = game.world.height - 25;
    let styleHUD = {
        fontSize: '18px',
        fill: '#FFFFFF'
    };
    scoreText = game.add.text(scoreX, allY, 'Score: ' + score, styleHUD);
    livesText = game.add.text(livesX, allY, 'Lives: ' + lives, styleHUD);
    livesText.anchor.setTo(1, 0);
}

function createUfos(number) {
    ufos = game.add.group();
    ufos.enableBody = true;
    ufos.createMultiple(number, 'ufo');
    ufos.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetMember);
    ufos.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    ufos.setAll('checkWorldBounds', true);
    currentUfoProbability = UFO_PROBABILITY;
    currentUfoVelocity = UFO_VELOCITY;
    game.time.events.loop(TIMER_RHYTHM, activateUfo, this);
}

function activateUfo() {
    if (Math.random() < currentUfoProbability) {
            ufo = ufos.getFirstExists(false);
        if (ufo) {
            let gw = game.world.width;
            let uw = ufo.body.width;
            let w = gw - uw;
            let x = Math.floor(Math.random() * w);
            let z = uw / 2 + x;
            ufo.reset(z, 0);
            ufo.body.velocity.x = 0;
            ufo.body.velocity.y = currentUfoVelocity;
        }
    }
}

function activateNewUfo() {
    if (score%10==0 && score!=0 && check==score) {
            newufo = newUfos.getFirstExists(false);
        check+=10;
        if (newufo ) {
            let x = Math.floor(Math.random() * (newUfosMaxX - newUfosMinX + 1) + newUfosMinX);
            newufo.reset(x, 0);
            newufo.body.velocity.x = 0;
            newufo.body.velocity.y = newUfosVelocity;
            newufo = newUfos.getFirstExists(true);
        }


    }
}

function createBlasts(number) {
    blasts = game.add.group();
    blasts.createMultiple(number, 'blast');
    blasts.forEach(setupBlast, this);
}

function setupBlast(blast) {
    blast.anchor.x = 0.5;
    blast.anchor.y = 0.5;
    blast.animations.add('blast');
}

function createLasers(number) {
    lasers = game.add.group();
    lasers.enableBody = true;
    lasers.createMultiple(number, 'laser');
    lasers.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetMember);
    lasers.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    lasers.setAll('checkWorldBounds', true);
}

function resetMember(item) {
    item.kill();
}

function updatePlay() {
    game.physics.arcade.overlap(lasers, ufos, laserHitsUfo, null, this);
    game.physics.arcade.overlap(craft, ufos, ufoHitsCraft, null, this);
    game.physics.arcade.overlap(craft, newUfos, NewufoHitsCraft, null, this);
    stars.tilePosition.y += 1;
    manageCraftMovements();
    manageCraftShots();

    
   
}

function laserHitsUfo(laser, ufo) {
    ufo.kill();
    laser.kill();
    displayBlast(ufo);
    score++;
    scoreText.text = 'Score: ' + score;
}

function ufoHitsCraft(craft, ufo) {
    ufo.kill();
    craft.kill();
    displayBlast(ufo);
    displayBlast(craft);
    lives--;
    livesText.text = 'Lives: ' + lives;
    ufos.forEach(clearStage, this);
    lasers.forEach(clearStage, this);
    newUfos.forEach(clearStage, this);

    game.input.enabled = false;
    currentUfoProbability = -1;
    game.time.events.add(2000, continueGame, this);
}

function NewufoHitsCraft(craft, newufo) {
    newufo.kill();
    craft.kill();
    displayBlast(newufo);               //Animación de explosión
    displayBlast(craft);
    lives=0;
    livesText.text = 'Lives: ' + lives;
    ufos.forEach(clearStage, this);
    lasers.forEach(clearStage, this);
    newUfos.forEach(clearStage, this);

    game.input.enabled = false;
    currentUfoProbability = -1;
    
    game.time.events.add(2000, EndGame, this);
}

function clearStage(item) {
    item.kill();
}

function continueGame() {
    game.input.enabled = true;
    if (lives > 0) {
        let x = game.world.centerX;
        let y = game.world.height - HUD_HEIGHT;
        craft.reset(x, y);
        cursors.left.reset();
        cursors.right.reset();
        currentUfoProbability = UFO_PROBABILITY;
    }
}

function EndGame(){
    game.state.start('end');
}

function displayBlast(ship) {
    let blast = blasts.getFirstExists(false);
    let x = ship.body.center.x;
    let y = ship.body.center.y;
    blast.reset(x, y);
    blast.play('blast', 30, false, true);
}

function manageCraftShots() {
    if (fireButton.justDown)
        fireLasers();
}

function fireLasers() {
    let lx = craft.x - LEFT_LASER_OFFSET_X;
    let rx = craft.x + RIGHT_LASER_OFFSET_X;
    let y = craft.y - LASERS_OFFSET_Y;
    let vy = -LASERS_VELOCITY;
    shootLaser(lx, y, vy);
    shootLaser(rx, y, vy);
}

function shootLaser(x, y, vy) {
    let shot = lasers.getFirstExists(false);
    if (shot) {
        shot.reset(x, y);
        shot.body.velocity.y = vy;
    }
}

function manageCraftMovements() {
    craft.body.velocity.x = 0;
    if (cursors.left.isDown)
        craft.body.velocity.x = -CRAFT_VELOCITY;
    else if (cursors.right.isDown)
        craft.body.velocity.x = CRAFT_VELOCITY;
}