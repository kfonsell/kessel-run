window.onload = function() {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });


    function preload() {
        game.load.image('logo', 'assets/title.png');
        game.load.image('ship', 'assets/ship.png');
        game.load.image('asteroid', 'assets/asteroid.png');
        game.load.image('background', 'assets/background.png');
        game.load.image('stars', 'assets/stars.png');
        game.load.image('bullet', 'assets/bullet.png');
        game.load.audio('bulletSound', 'assets/audio/Pew_Pew-DKnight556.mp3');
        game.load.image('asteroid', 'assets/asteroid.png')
    }

    var bg;
    var ship;
    var stars;
    var bullet;
    var bullets;
    var bulletTime = 0;
    var bulletSound;
    var asteroid;
    var asteroids;
    var asteroidTime = 0;
    var lives;
    var hurt = false;
    var hurtTime = 0;
    var hurtDuration = 0;

    function create() {
        game.renderer.clearBeforeRender = false;
        game.renderer.roundPixels = true;

        game.physics.startSystem(Phaser.Physics.ARCADE)

        bg = game.add.tileSprite(0, 0, 800, 600, 'background');
        stars = game.add.tileSprite(0, 0, 800, 600, 'stars');

        ship = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
        ship.anchor.setTo(0.5, 0.5);

        game.physics.enable(ship, Phaser.Physics.ARCADE);
        ship.body.drag.set(100);
        ship.body.maxVelocity.set(400);

        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(20, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 0.5);

        asteroids = game.add.group();
        asteroids.enableBody = true;
        asteroids.physicsBodyType = Phaser.Physics.ARCADE;
        asteroids.createMultiple(5, 'asteroid');
        asteroids.setAll('anchor.x', 0.5);
        asteroids.setAll('anchor.y', 0.5);

        bulletSound = game.add.audio('bulletSound');

        lives = game.add.group();
        for (var i = 0; i < 3; i++) {
            var life = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
            life.anchor.setTo(0.5, 0.5);
            life.angle = 90;
            life.scale.x = 0.2;
            life.scale.y = 0.2;
            life.alpha = 0.8
        }

        cursors = game.input.keyboard.createCursorKeys();
        game.input.keyboard.addKeyCapture([ 
            Phaser.Keyboard.SPACEBAR,
            Phaser.Keyboard.W,
            Phaser.Keyboard.A,
            Phaser.Keyboard.D ]);
    }

    function update() {
        stars.tilePosition.x += 0.5;
        bg.tilePosition.x -= 0.5;

        if (cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            game.physics.arcade.accelerationFromRotation(ship.rotation, 200, ship.body.acceleration);
        } else {
            ship.body.acceleration.set(0);
        }

        if (cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            ship.body.angularVelocity = -300;
        } else if (cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            ship.body.angularVelocity = 300;
        } else {
            ship.body.angularVelocity = 0;
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            fireBullet();
        }

        screenWrap(ship);
        animateHurt();

        createAsteroid();
        asteroids.forEachExists(screenWrap, this);

        game.physics.arcade.overlap(bullets, asteroids, collisionHandler, null, this);
        game.physics.arcade.overlap(asteroids, ship, playerHitHander, null, this);
    }

    function render() {

    }

    function fireBullet() {
        if (game.time.now > bulletTime) {
            bullet = bullets.getFirstExists(false);

            if (bullet) {
                bulletSound.play();
                bullet.reset(ship.body.x + 64, ship.body.y + 48);
                bullet.lifespan = 2000;
                bullet.rotation = ship.rotation;
                game.physics.arcade.velocityFromRotation(ship.rotation, 400, bullet.body.velocity);
                bulletTime = game.time.now + 200;
            }
        }
    }

    function createAsteroid() {
        if (game.time.now > asteroidTime) {
            asteroid = asteroids.getFirstExists(false);

            if (asteroid) {
                asteroid.reset(Math.floor((Math.random() * game.width) + 1), Math.floor(Math.random() * 2)*game.height);
                asteroid.rotation = Math.floor((Math.random() * 360) + 0);
                var scale = (Math.random() * (0.7 - 0.3) + 0.3)
                asteroid.scale.x = scale;
                asteroid.scale.y = scale;
                game.physics.arcade.velocityFromRotation(asteroid.rotation, 10, asteroid.body.velocity);
                asteroidTime = game.time.now + 1000;
            }
        }
    }

    function screenWrap(sprite) {
        if (sprite.x < 0) {
            sprite.x = game.width;
        } else if (sprite.x > game.width) {
            sprite.x = 0;
        }

        if (sprite.y < 0) {
            sprite.y = game.height;
        } else if (sprite.y > game.height) {
            sprite.y = 0;
        }
    }

    function collisionHandler (bullet, asteroid){
        bullet.kill();
        asteroid.kill();
    }

    function playerHitHander(ship, asteroid){
        asteroid.kill();
        live = lives.getFirstAlive();
        if (live) { live.kill(); }
        hurt = true;
        hurtDuration = game.time.now + 800;
    }

    function animateHurt(){
        if (hurt && game.time.now > hurtTime) {
            if(ship.alpha == 1){
                ship.alpha = 0.5;
            } else {
                ship.alpha = 1;
            }
            hurtTime = game.time.now + 150;
        }

        if (hurt && game.time.now > hurtDuration) {
            hurt = false;
            ship.alpha = 1;
        }
    }

};