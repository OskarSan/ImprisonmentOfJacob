
let game;
const gameOptions = {
    gravity: 300,
    
    dudeSpeed: 200,
    dudeHealth: 3,    

    shotDelay: 300,
    bulletGravity: 400,
    bulletSpeed: 400,
    bulletRange: 400,
    bulletSpread: 0.2,
    damage: 10
}

window.onload = function() {

    let gameConfig ={
        type: Phaser.AUTO,
        backgroundColor: "#050505",
        
        scale :  {
        
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            
        },

        physics: {
            default: 'arcade',
            arcade: {
                gravity: {y: 0},
                debug: true
            }
        },
        pixelArt: true,
        scene: PlayGame

    }
    

    game = new Phaser.Game(gameConfig);
    window.focus();

}



class PlayGame extends Phaser.Scene{

    constructor(){
        super("PlayGame");
        this.lastShot = 0;
        this.isKnocked = false;
        this.mapChanged = false; 
        this.layer = null;
        this.map = null;
    }

    preload(){
        
        this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
        this.load.image("star", "assets/star.png");
        this.load.image("enemy", "assets/boy.png");
        this.load.image("map", "assets/map.png");
        this.load.tilemapTiledJSON("cave", "assets/cave.json");
        this.load.tilemapTiledJSON("caveClosed", "assets/caveClosed.json");
        
    }

    create(){
        //init create
        this.lastShot = 0;

        //create map

        this.setMap("caveClosed")
        
        /*
        const map = this.make.tilemap({key: "caveClosed"});
        const tileset = map.addTilesetImage("caveClosed", "map");
        this.layer = map.createLayer("Tile Layer 1", tileset, 0, 0);
        this.layer.setCollisionByProperty({collides: true});
        
        
        const offsetX = (this.game.config.width - map.widthInPixels) / 2;
        const offsetY = (this.game.config.height - map.heightInPixels) / 2; 
        this.layer.setPosition(offsetX, offsetY);
        */


        //create player
        this.dude = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, "dude");
        this.dude.setFrame(4);
        const hitboxRadius = 16;
        this.dude.body.setCircle(hitboxRadius);
        this.dude.body.setOffset((this.dude.width - hitboxRadius * 2) / 2, (this.dude.height - hitboxRadius * 2) / 2);
        this.dude.body.drag.set(1000);
        this.physics.add.collider(this.dude, this.layer);
        
        
        //create enemies
        this.enemies = this.physics.add.group();
        for (let i = 0; i < 2; i++) {
            let enemy = new Enemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height)); // Adjust position as needed
            this.enemies.add(enemy);
        }

        // Add collider between the player and each enemy
       
        
        //define keys
        this.keys = this.input.keyboard.addKeys({

            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,

            shootUp: Phaser.Input.Keyboard.KeyCodes.UP,
            shootDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
            shootLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
            shootRight: Phaser.Input.Keyboard.KeyCodes.RIGHT

        });

        
        //create bullets
        this.bullets=this.physics.add.group({
            defaultKey: "star",
        });
        
        this.physics.add.collider(this.bullets, this.layer, (bullet, layer)=>{
            bullet.setActive(false);
            bullet.setVisible(false);
            bullet.body.enable = false;

        });

        this.physics.add.collider(this.bullets, this.enemies, (bullet, enemy)=>{
            if (enemy.active) { // Check if the enemy is active before interacting
                bullet.setActive(false);
                bullet.setVisible(false);
                bullet.body.enable = false;
                enemy.takeDamage(gameOptions.damage);
            }
        });

        this.enemies.getChildren().forEach(enemy => {
            this.physics.add.collider(enemy, this.dude, (enemy, dude)=>{
                this.dudeTakeDamage(enemy);
            });
        
        });
        
      
    }

    update(time){

        //this.dude.body.setVelocity(0); 
        
        
        this.enemies.getChildren().forEach(enemy => {
            enemy.updateEnemy(this.dude, time);
        });
        
        
        //movement
        
        if(!this.isKnocked){
            if(this.keys.left.isDown){
                this.dude.body.setVelocityX(-gameOptions.dudeSpeed);
            } else if(this.keys.right.isDown){
                this.dude.body.setVelocityX(gameOptions.dudeSpeed);
            }
            if(this.keys.up.isDown){
                this.dude.body.setVelocityY(-gameOptions.dudeSpeed);
            } else if(this.keys.down.isDown){
                this.dude.body.setVelocityY(gameOptions.dudeSpeed);
            }
    
        }
        
        //shooting
        if((time- this.lastShot) > gameOptions.shotDelay){
            if(this.keys.shootLeft.isDown){
                this.shootBullet(-1, 0);
                this.lastShot = time;
            }else if(this.keys.shootRight.isDown){
                this.shootBullet(1, 0);
                this.lastShot = time;
            }else if(this.keys.shootUp.isDown){
                this.shootBullet(0, -1);
                this.lastShot = time;
            }else if(this.keys.shootDown.isDown){
                this.shootBullet(0, 1);
                this.lastShot = time;
            }
        }
        
        if(this.enemies.getChildren().length === 0 && !this.mapChanged){
            this.setMap("cave");
            this.mapChanged = true; // Step 3: Set the flag to true after changing the map
            console.log("map changed");
        }
    }    

    shootBullet(x, y){
        let bullet = this.bullets.get(this.dude.x, this.dude.y);
        
        if(bullet){
            bullet.body.enable = true;
            bullet.setActive(true);
            bullet.setVisible(true);
            
            const hitboxRadius = 10; 
            bullet.body.setCircle(hitboxRadius);

            const offsetX = 2; // Adjust as necessary
            const offsetY = 3; // Adjust as necessary
            bullet.body.setOffset(offsetX, offsetY);


            const spreadX = Phaser.Math.FloatBetween(-gameOptions.bulletSpread, gameOptions.bulletSpread);
            const spreadY = Phaser.Math.FloatBetween(-gameOptions.bulletSpread, gameOptions.bulletSpread);

            const magnitude = Math.sqrt(x * x + y * y);
            
            x = x / magnitude;
            y = y / magnitude;

            const directionX = x + spreadX + (this.dude.body.velocity.x / gameOptions.bulletSpeed);
            const directionY = y + spreadY + (this.dude.body.velocity.y / gameOptions.bulletSpeed);
            const directionMagnitude = Math.sqrt(directionX * directionX + directionY * directionY);

            
            bullet.body.velocity.x = (directionX / directionMagnitude) * gameOptions.bulletSpeed;
            bullet.body.velocity.y = (directionY / directionMagnitude) * gameOptions.bulletSpeed;
         }
        
        this.time.delayedCall(gameOptions.bulletRange, ()=>{
            bullet.body.setGravityY(gameOptions.bulletGravity);

        }, null, this);

        
    }


    dudeTakeDamage(enemy){

        this.dude.dudeHealth -= 1;
        
        let knockbackDirectionX = this.dude.x - enemy.x;
        let knockbackDirectionY = this.dude.y - enemy.y;
        let magnitude = Math.sqrt(knockbackDirectionX * knockbackDirectionX + knockbackDirectionY * knockbackDirectionY);
        
        
        knockbackDirectionX /= magnitude; 
        knockbackDirectionY /= magnitude; 
            
        let knockbackForce = 400; 
        this.dude.body.velocity.x = knockbackDirectionX * knockbackForce;
        this.dude.body.velocity.y = knockbackDirectionY * knockbackForce;
        
        this.dude.setTint(0xff0000);
        this.isKnocked = true;
        this.time.delayedCall(200, ()=>{
            this.dude.clearTint();
            this.isKnocked = false;
        });


    }

    setMap(mapKey){

        
        if(this.layer !== null){
        this.layer.setVisible(false);
        this.layer.setCollisionByExclusion([-1], false);
        }

        const newMapKey = mapKey; // Assuming you want to change to the "cave" map
        this.map = this.make.tilemap({key: newMapKey});
        const tileset = this.map.addTilesetImage(newMapKey, "map");
       
        this.layer = this.map.createLayer("Tile Layer "+ mapKey, tileset, 0, 0);
        this.layer.setCollisionByProperty({collides: true});

        const offsetX = (this.game.config.width - this.map.widthInPixels) / 2;
        const offsetY = (this.game.config.height - this.map.heightInPixels) / 2; 
        this.layer.setPosition(offsetX, offsetY);
        
        // Adjust player and other game objects as needed for the new map
        // For example, reposition the player

        if(this.dude){
            this.dude.setDepth(this.layer.depth + 1);
        }
        if(this.dude && this.layer){
            this.physics.add.collider(this.dude, this.layer);
        }
    }
}

