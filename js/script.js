
let game;
const gameOptions = {
    gravity: 300,
    
    dudeSpeed: 300,
    dudeHealth: 3,    

    shotDelay: 300,
    bulletGravity: 400,
    bulletSpeed: 400,
    bulletRange: 600,
    bulletSpread: 0,
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
        this.roomCleared = true;
        this.gameStarted = false; 
        this.layer = null;
        this.map = null;
        this.currentMapName = "start";
        this.rounds = 0;
    }

    preload(){
        
        this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
        this.load.image("star", "assets/star.png");
        this.load.image("enemy", "assets/boy.png");
        this.load.image("map", "assets/map.png");
        this.load.tilemapTiledJSON("cave", "assets/cave.json");
        this.load.tilemapTiledJSON("caveClosed", "assets/caveClosed.json");
        this.load.tilemapTiledJSON("start", "assets/start.json");
        this.load.tilemapTiledJSON("howToPlay", "assets/howToPlay.json");
    }

    create(){
        //init create
        this.lastShot = 0;

        //create map
        this.setMap(this.currentMapName)


        //init UI
        this.gameUI = new GameUI(this);
        this.gameUI.updateHealth(gameOptions.dudeHealth);
        this.gameUI.updateRounds(this.rounds);
        this.gameUI.hideHealthScore();
        
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
        this.dude.dudeHealth = gameOptions.dudeHealth;
        
        
        //create enemies
        this.enemies = this.physics.add.group({classType: Enemy});
        this.physics.add.collider(this.enemies, this.enemies);
        
      
        
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
        /*  
        this.physics.add.collider(this.bullets, this.layer, (bullet, layer)=>{
            bullet.setActive(false);
            bullet.setVisible(false);
            bullet.body.enable = false;

        });
        */
        this.physics.add.collider(this.bullets, this.enemies, (bullet, enemy)=>{
            if (enemy.active) { // Check if the enemy is active before interacting
                bullet.setActive(false);
                bullet.setVisible(false);
                bullet.body.enable = false;
                enemy.takeDamage(gameOptions.damage);
            }
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
        
        if(this.enemies.getChildren().length === 0 && this.currentMapName != "cave"){
            this.roomCleared = true
        }

        if(this.gameStarted && this.roomCleared == true){
            this.currentMapName = "cave";
            this.setMap("cave");
        }
        
        if(this.isPlayerOutsideMap() == "left" && this.currentMapName == "start"){
            this.currentMapName = "howToPlay";
            this.setMap(this.currentMapName);          
        }

    
        if(this.isPlayerOutsideMap() == "right" && this.currentMapName == "howToPlay"){
            this.currentMapName = "start";
            this.setMap(this.currentMapName);        
        }

        if(this.isPlayerOutsideMap() == "right" && this.currentMapName == "start"){
            this.currentMapName = "caveClosed";
            this.gameStarted = true;
            this.gameUI.showHealthScore();
            this.setMap(this.currentMapName);          
        }

        if(this.isPlayerOutsideMap() != "inside" && this.gameStarted){
            this.currentMapName = "caveClosed";
            this.setMap(this.currentMapName);
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

        this.gameUI.updateHealth(this.dude.dudeHealth);

        if(this.dude.dudeHealth <= 0){
            this.gameOver();
        }
    }

    setMap(mapKey){

        console.log("current map: "+ this.currentMapName)
        if(this.layer !== null){
        this.layer.setVisible(false);
        this.layer.setCollisionByExclusion([-1], false);
        }

        const newMapKey = mapKey;
        this.map = this.make.tilemap({key: newMapKey});
        const tileset = this.map.addTilesetImage(newMapKey, "map");
       
        this.layer = this.map.createLayer("Tile Layer "+ mapKey, tileset, 0, 0);
        
        
        this.layer.setCollisionByProperty({collides: true});

        const offsetX = (this.game.config.width - this.map.widthInPixels) / 2;
        const offsetY = (this.game.config.height - this.map.heightInPixels) / 2; 
        this.layer.setPosition(offsetX, offsetY);
        
        
        

        if(this.dude && this.currentMapName == "caveClosed"){
            console.log(this.isPlayerOutsideMap())
            this.dude.setDepth(this.layer.depth + 1);
            if(this.isPlayerOutsideMap() == "left"){
                this.dude.x = (game.config.width + this.dude.x) / 1.2;
            }else if(this.isPlayerOutsideMap() == "right"){
                this.dude.x = (game.config.width - this.dude.x) * 1.7;
            }else if(this.isPlayerOutsideMap() == "top"){
                this.dude.y = (game.config.height - this.dude.y) / 1.3;
            }else if(this.isPlayerOutsideMap() == "bottom"){
                this.dude.y = (game.config.height - this.dude.y) * 1.3;
            }     
        }
        
        /*
        else if(this.dude){
            this.dude.setDepth(this.layer.depth + 1);
            this.dude.x = game.config.width / 2;
            this.dude.y =  game.config.height / 2;
        }
        */
        if(this.dude && this.layer){
            this.physics.add.collider(this.dude, this.layer);

            this.physics.add.collider(this.bullets, this.layer, (bullet, layer)=>{
                bullet.setActive(false);
                bullet.setVisible(false);
                bullet.body.enable = false;
            });
            this.bullets.setDepth(this.layer.depth + 1);
        }

        if(this.dude && this.currentMapName == "howToPlay"){
            this.dude.setDepth(this.layer.depth + 1);
            this.dude.x = game.config.width / 1.1;
            this.dude.y =  game.config.height / 2;
        }

        //enemy creation
        if(this.gameStarted && this.currentMapName != "cave"){
            let enemy, enemy1, enemy2, enemy3, boss;  
            if(this.rounds == 0){
                enemy = new Enemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height),this.dude.x, this.dude.y);
                this.enemies.add(enemy);

            }else if(this.rounds == 1){
                enemy1 = new Enemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height),this.dude.x, this.dude.y);
                enemy2 = new FastEnemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height),this.dude.x, this.dude.y);
                this.enemies.add(enemy1);
                this.enemies.add(enemy2);
            }else if(this.rounds == 2){
                enemy1 = new Enemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height),this.dude.x, this.dude.y);
                enemy2 = new FastEnemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height),this.dude.x, this.dude.y);
                enemy3 = new StrongEnemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height),this.dude.x, this.dude.y);
                this.enemies.add(enemy1);
                this.enemies.add(enemy2);
                this.enemies.add(enemy3);
           
            }else{
                for (let i = 0; i < this.rounds + 1; i++) {
                    let enemyType = Phaser.Math.Between(0, 2); 
                      
                    switch(enemyType) {
                        case 0:
                            enemy = new Enemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height),this.dude.x, this.dude.y);
                            break;
                        case 1: 
                            enemy = new FastEnemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height),this.dude.x, this.dude.y);
                            break;
                        case 2:
                            enemy = new StrongEnemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height),this.dude.x, this.dude.y);
                            break;
                    }
                    
                    this.enemies.add(enemy);
                }
                if(this.rounds % 3 === 0){
                    boss = new BossEnemy(this, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height),this.dude.x, this.dude.y);
                    this.enemies.add(boss);
                }
            }
            this.gameUI.updateRounds(this.rounds);
            this.rounds += 1;
            this.enemies.getChildren().forEach(enemy => {
                this.physics.add.collider(enemy, this.dude, (enemy, dude)=>{
                    this.dudeTakeDamage(enemy);
                });
            
            });
        }

        console.log("map changed to "+ this.currentMapName)
       
        this.roomCleared = false;

    }

    isPlayerOutsideMap() {
        const playerX = this.dude.x;
        const playerY = this.dude.y;
        const mapWidth = this.map.widthInPixels;
        const mapHeight = this.map.heightInPixels;
    
        if (playerX < 50) {
            return "left"; 
        } else if (playerY < 50) {
            return "top"; 
        } else if (playerX > mapWidth + 10) {
            return "right"; 
        } else if (playerY > mapHeight) {
            return "bottom"; 
        } else {
            return "inside"; 
        }
    }


    gameOver(){

        this.enemies.getChildren().forEach(child => {
            child.takeDamage(1000000)
        })

        //another one for good measure :)
        this.enemies.getChildren().forEach(child => {
            child.takeDamage(1000000)
        })


        this.gameStarted = false;
        this.currentMapName = "start"
        this.setMap("start");

        

        this.gameUI.updateRounds(this.rounds);
        
        this.gameUI.hideHealthScore();

        

        this.rounds = 0;
        this.gameUI.updateRounds(this.rounds);
        this.dude.dudeHealth = gameOptions.dudeHealth;
        this.gameUI.updateHealth(this.dude.dudeHealth);



    }
}

