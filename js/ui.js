class GameUI {
	constructor(scene) {
		this.scene = scene;
		this.rounds = 1;
		this.highScore = 0;
		this.health = gameOptions.dudeHealth; // Assuming gameOptions is accessible here, otherwise pass it as a parameter
		this.createHealthText();
		this.createRoundsText();
		this.createGameOverText();
	}

	createHealthText() {
		const gameWidth = this.scene.sys.game.config.width;
        this.healthText = this.scene.add.text(40, 20, `Health: ${this.health}`, { fontSize: '20px', fill: '#FFF' });
    }

	createRoundsText() {
		const gameWidth = this.scene.sys.game.config.width;
        this.scoreText = this.scene.add.text(gameWidth - 150, 20, `Rounds: ${this.rounds}`, { fontSize: '20px', fill: '#FFF' });
    }
    
	createGameOverText() {
		const gameWidth = this.scene.sys.game.config.width;
		this.gameOverText = this.scene.add.text(gameWidth / 2, 400, 'Game Over', { fontSize: '50px', fill: '#FF0000' });
		this.gameOverText.setOrigin(0.5);
		this.gameOverText.setDepth(100);
		
		this.yourScoreText = this.scene.add.text(gameWidth / 2, 450, `Your score: ${this.rounds}`, { fontSize: '30px', fill: '#FFF' });
		this.yourScoreText.setOrigin(0.5);
		this.yourScoreText.setDepth(100);


		this.highScoreText = this.scene.add.text(gameWidth / 2, 500, `High score: ${this.rounds}`, { fontSize: '30px', fill: '#FFF' });
		this.highScoreText.setOrigin(0.5);
		this.highScoreText.setDepth(100);
		

		this.gameOverText.setVisible(false);
		this.highScoreText.setVisible(false);
		this.yourScoreText.setVisible(false);
		
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

	showGameOver(rounds) {

		this.yourScoreText.setText(`Rooms Cleared: ${rounds-1}`);

		if (rounds > this.highScore) {
			this.highScoreText.setText(`High score: ${rounds-1} rooms`);
			this.highScore = rounds-1;
		}
		
		this.gameOverText.setVisible(true);
		this.highScoreText.setVisible(true);
		this.yourScoreText.setVisible(true);
	}
	hideGameOver() {
		this.gameOverText.setVisible(false);
		this.highScoreText.setVisible(false);
		this.yourScoreText.setVisible(false);
	}

 
  
}