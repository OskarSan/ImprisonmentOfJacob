
let game;
const gameOptions = {
    gravity: 300,
    
    dudeSpeed: 200,
    
    shotDelay: 300,
    bulletGravity: 400,
    bulletSpeed: 400,
    bulletRange: 300,
    bulletSpread: 0.2
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
    }

    preload(){
        this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
        this.load.image("star", "assets/star.png");
        
        this.load.image("tiles", "assets/tiles.png");
        this.load.tilemapTiledJSON("cave", "assets/cave.json");
        
    }

    create(){
        //init create
        this.lastShot = 0;

        //create map
        const map = this.make.tilemap({key: "cave"});
        const tileset = map.addTilesetImage("cave", "tiles");
        const layer = map.createLayer("Tile Layer 1", tileset, 0, 0);
        layer.setCollisionByProperty({collides: true});
        const offsetX = (this.game.config.width - map.widthInPixels) / 2;
        const offsetY = (this.game.config.height - map.heightInPixels) / 2; 
        layer.setPosition(offsetX, offsetY);

        //create player
        this.dude = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, "dude");
        this.dude.setFrame(4);
        const hitboxRadius = 16;
        this.dude.body.setCircle(hitboxRadius);
        this.dude.body.setOffset((this.dude.width - hitboxRadius * 2) / 2, (this.dude.height - hitboxRadius * 2) / 2);
        this.dude.body.drag.set(1000);
        this.physics.add.collider(this.dude, layer);
        
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
        
        this.physics.add.collider(this.bullets, layer, (bullet, layer)=>{
            bullet.setActive(false);
            bullet.setVisible(false);
            bullet.body.enable = false;

        });

    }

    update(time){

        //this.dude.body.setVelocity(0); 
        

        //movement
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

}

