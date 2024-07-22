class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        const radius = 36;
        
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.body.setCircle(radius);
        this.body.setOffset(90, 80);

        this.health = 100;  
        this.speed = 10; 
        this.scale = 0.5; 
        this.stepSize = 64; 
        this.nextStepTime = 0; 
        this.stepDelay = 1000;
        this.targetX = this.x; // Initialize target X
        this.targetY = this.y; // Initialize target Y
    }

    updateEnemy(player, time) {
        if (time >= this.nextStepTime) {
            let dx = player.x - this.x;
            let dy = player.y - this.y;

            let distance = Math.sqrt(dx * dx + dy * dy);

          
                let normalizedX = dx / distance;
                let normalizedY = dy / distance;

                // Calculate target position instead of moving immediately
                this.targetX = this.x + normalizedX * this.stepSize;
                this.targetY = this.y + normalizedY * this.stepSize;

                // Reset the next step time immediately
                this.nextStepTime = time + this.stepDelay;
            
        }

        // Interpolate position towards the target position for fluid movement
        this.x += (this.targetX - this.x) * 0.02;
        this.y += (this.targetY - this.y) * 0.02;
    }

    takeDamage(damage) {

        this.setTint(0xff0000);

        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        }); 
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }   
        
       


    }
}