
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
                gravity: {y: 0}
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
        this.load.tilemapTiledJSON("Floor1", "assets/Floor1.json");
        
    }

    create(){

        

        const map = this.make.tilemap({key: "Floor1"});
        const tileset = map.addTilesetImage("floor", "tiles");

    
        const layer = map.createLayer("Tile Layer 1", tileset, 0, 0);

        const offsetX = (this.game.config.width - map.widthInPixels) / 2;
        const offsetY = (this.game.config.height - map.heightInPixels) / 2;

        
        layer.setPosition(offsetX, offsetY);

        this.dude = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, "dude");
        this.dude.setFrame(4);
        this.lastShot = 0;

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

        this.bullets=this.physics.add.group({
            defaultKey: "star",
        });

    }

    update(time){

        this.dude.body.setVelocity(0); 
        

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
            bullet.setActive(true);
            bullet.setVisible(true);

            
            const spreadX = Phaser.Math.FloatBetween(-gameOptions.bulletSpread, gameOptions.bulletSpread);
            const spreadY = Phaser.Math.FloatBetween(-gameOptions.bulletSpread, gameOptions.bulletSpread);

            bullet.body.velocity.x = (x + spreadX) * gameOptions.bulletSpeed + this.dude.body.velocity.x;
            bullet.body.velocity.y = (y + spreadY) * gameOptions.bulletSpeed + this.dude.body.velocity.y;
        }
        
        this.time.delayedCall(gameOptions.bulletRange, ()=>{
            bullet.body.setGravityY(gameOptions.bulletGravity);
        }, null, this);

        
    }

}

