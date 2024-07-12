class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        // Set enemy properties
        this.speed = 100; // Example speed, adjust as necessary
    }

    update() {
        // Add logic for enemy movement or behavior here
    }
}