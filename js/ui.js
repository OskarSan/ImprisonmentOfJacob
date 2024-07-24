class GameUI {
	constructor(scene) {
		this.scene = scene;
		this.rounds = 1;
		this.health = gameOptions.dudeHealth; // Assuming gameOptions is accessible here, otherwise pass it as a parameter
		this.createHealthText();
		this.createRoundsText();
	}

	createHealthText() {
		const gameWidth = this.scene.sys.game.config.width;
        this.healthText = this.scene.add.text(40, 20, `Health: ${this.health}`, { fontSize: '20px', fill: '#FFF' });
    }

	createRoundsText() {
		const gameWidth = this.scene.sys.game.config.width;
        this.scoreText = this.scene.add.text(gameWidth - 150, 20, `Rounds: ${this.rounds}`, { fontSize: '20px', fill: '#FFF' });
    }
    
   

	updateHealth(health) {
		this.health = health;
		this.healthText.setText(`Health: ${this.health}`);
	}

	updateRounds(rounds) {
		this.rounds = rounds;
		this.scoreText.setText(`Rounds: ${this.rounds + 1}`);
	}


    showHealthScore() {
        this.healthText.setVisible(true);
        this.scoreText.setVisible(true);
    
    }
    
    hideHealthScore() {
        this.healthText.setVisible(false);
        this.scoreText.setVisible(false);
       
    }

 
  
}