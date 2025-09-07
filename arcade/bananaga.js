class BananagaGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameMenu = document.getElementById('gameMenu');
    this.gameOver = document.getElementById('gameOver');
    this.startBtn = document.getElementById('startBtn');
    this.restartBtn = document.getElementById('restartBtn');

    this.gameState = 'menu'; // menu, playing, gameOver
    this.score = 0;
    this.lives = 3;
    this.level = 1;

    this.player = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 50,
      width: 30,
      height: 30,
      speed: 5,
      shootCooldown: 0
    };

    this.bullets = [];
    this.bananas = [];
    this.explosions = [];
    this.keys = {};

    this.formation = {
      rows: 5,
      cols: 10,
      spacing: 40,
      startX: 50,
      startY: 50,
      direction: 1,
      speed: 2,
      moveTimer: 0,
      moveInterval: 10,
      dropDistance: 30
    };

    this.formationActive = true;
    this.bananaSpawnTimer = 0;
    this.bananaSpawnInterval = 300;
    this.bananaSpeed = 1;

    this.init();
  }

  init() {
    this.startBtn.addEventListener('click', () => this.startGame());
    this.restartBtn.addEventListener('click', () => this.restartGame());

    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));

    this.gameLoop();
  }

  startGame() {
    this.gameState = 'playing';
    this.gameMenu.style.display = 'none';
    this.gameOver.style.display = 'none';
    this.resetGame();
  }

  restartGame() {
    this.gameState = 'playing';
    this.gameOver.style.display = 'none';
    this.resetGame();
  }

  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.bullets = [];
    this.bananas = [];
    this.explosions = [];
    this.bananaSpawnTimer = 0;
    this.bananaSpeed = 1;
    this.bananaSpawnInterval = 300;
    this.formationActive = true;

    this.formation = {
      rows: 5,
      cols: 10,
      spacing: 40,
      startX: 50,
      startY: 50,
      direction: 1,
      speed: 2,
      moveTimer: 0,
      moveInterval: 10,
      dropDistance: 30
    };

    this.createFormation();

    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height - 50;
    this.player.shootCooldown = 0;

    this.updateUI();
  }

  handleKeyDown(e) {
    this.keys[e.code] = true;

    if (e.code === 'Space') {
      e.preventDefault();
      if (this.gameState === 'playing') {
        this.shoot();
      }
    }
  }

  handleKeyUp(e) {
    this.keys[e.code] = false;
  }

  update() {
    if (this.gameState !== 'playing') return;

    this.updatePlayer();
    this.updateBullets();
    this.updateFormation();
    this.updateBananas();
    this.updateExplosions();
    this.spawnBananas();
    this.checkCollisions();
    this.checkGameOver();
  }

  updatePlayer() {
    if (this.keys['ArrowLeft'] && this.player.x > 0) {
      this.player.x -= this.player.speed;
    }
    if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
      this.player.x += this.player.speed;
    }
    if (this.keys['ArrowUp'] && this.player.y > this.canvas.height / 2) {
      this.player.y -= this.player.speed;
    }
    if (this.keys['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) {
      this.player.y += this.player.speed;
    }

    if (this.player.shootCooldown > 0) {
      this.player.shootCooldown--;
    }
  }

  shoot() {
    if (this.player.shootCooldown <= 0) {
      this.bullets.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y,
        width: 4,
        height: 10,
        speed: 7
      });
      this.player.shootCooldown = 10;
    }
  }

  updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.y -= bullet.speed;
      return bullet.y > -bullet.height;
    });
  }

  createFormation() {
    this.bananas = [];
    for (let row = 0; row < this.formation.rows; row++) {
      for (let col = 0; col < this.formation.cols; col++) {
        this.bananas.push({
          x: this.formation.startX + col * this.formation.spacing,
          y: this.formation.startY + row * this.formation.spacing,
          width: 20,
          height: 20,
          speed: this.bananaSpeed,
          type: Math.random() < 0.1 ? 'golden' : 'normal',
          inFormation: true,
          originalX: this.formation.startX + col * this.formation.spacing,
          originalY: this.formation.startY + row * this.formation.spacing
        });
      }
    }
  }

  updateFormation() {
    if (!this.formationActive) return;

    this.formation.moveTimer++;
    if (this.formation.moveTimer >= this.formation.moveInterval) {
      this.formation.startX += this.formation.direction * this.formation.speed;

      // Check if formation hits screen edges
      const formationWidth = (this.formation.cols - 1) * this.formation.spacing;
      if (this.formation.startX <= 0 || this.formation.startX + formationWidth >= this.canvas.width) {
        this.formation.direction *= -1;
        this.formation.startY += this.formation.dropDistance;

        // Check if formation is too low
        if (this.formation.startY > this.canvas.height - 200) {
          this.formationActive = false;
        }
      }

      // Update all bananas in formation
      this.bananas.forEach(banana => {
        if (banana.inFormation) {
          const col = Math.round((banana.originalX - 50) / this.formation.spacing);
          const row = Math.round((banana.originalY - 50) / this.formation.spacing);
          banana.x = this.formation.startX + col * this.formation.spacing;
          banana.y = this.formation.startY + row * this.formation.spacing;
        }
      });

      this.formation.moveTimer = 0;
    }
  }

  updateBananas() {
    this.bananas = this.bananas.filter(banana => {
      if (!banana.inFormation) {
        banana.y += banana.speed;
        banana.x += Math.sin(banana.y * 0.01) * 0.5; // Slight wave motion
      }
      return banana.y < this.canvas.height + banana.height;
    });
  }

  updateExplosions() {
    this.explosions = this.explosions.filter(explosion => {
      explosion.timer--;
      explosion.scale += 0.1;
      return explosion.timer > 0;
    });
  }

  spawnBananas() {
    if (!this.formationActive) {
      this.bananaSpawnTimer++;
      if (this.bananaSpawnTimer >= this.bananaSpawnInterval) {
        this.bananas.push({
          x: Math.random() * (this.canvas.width - 20),
          y: -20,
          width: 20,
          height: 20,
          speed: this.bananaSpeed,
          type: Math.random() < 0.1 ? 'golden' : 'normal',
          inFormation: false
        });
        this.bananaSpawnTimer = 0;
      }
    }
  }

  checkCollisions() {
    // Bullets vs Bananas
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      for (let j = this.bananas.length - 1; j >= 0; j--) {
        if (this.isColliding(this.bullets[i], this.bananas[j])) {
          this.createExplosion(this.bananas[j].x, this.bananas[j].y);

          const points = this.bananas[j].type === 'golden' ? 100 : 10;
          this.score += points;

          // If banana was in formation, remove it from formation
          if (this.bananas[j].inFormation) {
            this.bananas[j].inFormation = false;
            this.bananas[j].speed = this.bananaSpeed;
          }

          this.bullets.splice(i, 1);
          this.bananas.splice(j, 1);
          break;
        }
      }
    }

    // Player vs Bananas
    for (let i = this.bananas.length - 1; i >= 0; i--) {
      if (this.isColliding(this.player, this.bananas[i])) {
        this.createExplosion(this.player.x, this.player.y);
        this.lives--;
        this.bananas.splice(i, 1);
        this.updateUI();

        if (this.lives <= 0) {
          this.gameOver();
        }
      }
    }
  }

  isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y;
  }

  createExplosion(x, y) {
    this.explosions.push({
      x: x,
      y: y,
      timer: 20,
      scale: 1
    });
  }

  checkGameOver() {
    if (this.lives <= 0) {
      this.gameOver();
    }

    // Check if all formation bananas are destroyed
    const formationBananas = this.bananas.filter(banana => banana.inFormation);
    if (formationBananas.length === 0 && this.formationActive) {
      this.formationActive = false;
      this.level++;
      this.bananaSpeed += 0.2;
      this.bananaSpawnInterval = Math.max(60, this.bananaSpawnInterval - 20);
    }
  }

  gameOver() {
    this.gameState = 'gameOver';
    document.getElementById('finalScore').textContent = this.score;
    this.gameOver.style.display = 'block';
  }

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('level').textContent = this.level;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.gameState === 'playing') {
      this.renderStars();
      this.renderPlayer();
      this.renderBullets();
      this.renderBananas();
      this.renderExplosions();
    }
  }

  renderStars() {
    this.ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % this.canvas.width;
      const y = (i * 23) % this.canvas.height;
      this.ctx.fillRect(x, y, 1, 1);
    }
  }

  renderPlayer() {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

    // Draw monkey face
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(this.player.x + 5, this.player.y + 5, 5, 5); // Left eye
    this.ctx.fillRect(this.player.x + 20, this.player.y + 5, 5, 5); // Right eye
    this.ctx.fillRect(this.player.x + 10, this.player.y + 15, 10, 3); // Mouth
  }

  renderBullets() {
    this.ctx.fillStyle = '#00ff00';
    this.bullets.forEach(bullet => {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
  }

  renderBananas() {
    this.bananas.forEach(banana => {
      if (banana.type === 'golden') {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 10;
      } else {
        this.ctx.fillStyle = '#FFA500';
        this.ctx.shadowColor = '#FFA500';
        this.ctx.shadowBlur = 5;
      }

      // Draw banana shape
      this.ctx.beginPath();
      this.ctx.arc(banana.x + banana.width / 2, banana.y + banana.height / 2, banana.width / 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Reset shadow
      this.ctx.shadowBlur = 0;
    });
  }

  renderExplosions() {
    this.explosions.forEach(explosion => {
      this.ctx.fillStyle = `rgba(255, 69, 0, ${explosion.timer / 20})`;
      this.ctx.beginPath();
      this.ctx.arc(explosion.x, explosion.y, explosion.scale * 10, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new BananagaGame();
});
