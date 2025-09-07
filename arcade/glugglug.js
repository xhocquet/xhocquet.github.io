// Glug Glug - Dig Dug Clone
class GlugGlugGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = 'menu'; // menu, playing, paused, gameOver, victory

    // Game settings
    this.tileSize = 32;
    this.cols = Math.floor(this.canvas.width / this.tileSize);
    this.rows = Math.floor(this.canvas.height / this.tileSize);

    // Game state
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameSpeed = 1;

    // Player
    this.player = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      speed: 2,
      size: 24,
      drinking: false,
      drinkTimer: 0,
      drinkDuration: 30,
      direction: 'right'
    };

    // Game objects
    this.tiles = [];
    this.enemies = [];
    this.beerMugs = [];
    this.particles = [];
    this.drinkingAreas = [];

    // Input
    this.keys = {};

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.generateLevel();
    this.gameLoop();
  }

  setupEventListeners() {
    // Menu buttons
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('instructions-btn').addEventListener('click', () => this.toggleInstructions());
    document.getElementById('back-btn').addEventListener('click', () => this.toggleInstructions());
    document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
    document.getElementById('menu-btn').addEventListener('click', () => this.showMenu());

    // Keyboard input
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.startDrinking();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') {
        this.stopDrinking();
      }
    });
  }

  toggleInstructions() {
    const instructions = document.getElementById('instructions');
    instructions.classList.toggle('hidden');
  }

  showMenu() {
    this.gameState = 'menu';
    this.showScreen('menu-screen');
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.generateLevel();
    this.updateHUD();
    this.showScreen('game-screen');
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
  }

  generateLevel() {
    this.tiles = [];
    this.enemies = [];
    this.beerMugs = [];
    this.particles = [];
    this.drinkingAreas = [];

    // Generate solid ground
    for (let y = 0; y < this.rows; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.cols; x++) {
        if (y === this.rows - 1 || (x === 0 || x === this.cols - 1)) {
          this.tiles[y][x] = 1; // Solid
        } else if (y > this.rows - 8) {
          this.tiles[y][x] = Math.random() > 0.3 ? 1 : 0; // Random solid blocks
        } else {
          this.tiles[y][x] = 0; // Empty
        }
      }
    }

    // Place player at top
    this.player.x = Math.floor(this.cols / 2) * this.tileSize + this.tileSize / 2;
    this.player.y = this.tileSize / 2;

    // Generate enemies
    const enemyCount = Math.min(3 + this.level, 8);
    for (let i = 0; i < enemyCount; i++) {
      this.spawnEnemy();
    }

    // Generate beer mugs
    const mugCount = Math.min(5 + this.level, 12);
    for (let i = 0; i < mugCount; i++) {
      this.spawnBeerMug();
    }
  }

  spawnEnemy() {
    const x = Math.floor(Math.random() * (this.cols - 2) + 1) * this.tileSize + this.tileSize / 2;
    const y = Math.floor(Math.random() * (this.rows - 8) + 8) * this.tileSize + this.tileSize / 2;

    this.enemies.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 20,
      type: Math.random() > 0.7 ? 'drunkard' : 'monster',
      health: this.level,
      maxHealth: this.level,
      stunned: false,
      stunTimer: 0,
      targetX: x,
      targetY: y
    });
  }

  spawnBeerMug() {
    let x, y;
    do {
      x = Math.floor(Math.random() * (this.cols - 2) + 1) * this.tileSize + this.tileSize / 2;
      y = Math.floor(Math.random() * (this.rows - 8) + 8) * this.tileSize + this.tileSize / 2;
    } while (this.getTile(x, y) !== 0);

    this.beerMugs.push({
      x: x,
      y: y,
      size: 16,
      collected: false
    });
  }

  getTile(x, y) {
    const col = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return 1;
    return this.tiles[row][col];
  }

  setTile(x, y, value) {
    const col = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.tiles[row][col] = value;
    }
  }

  startDrinking() {
    if (this.gameState !== 'playing') return;
    this.player.drinking = true;
    this.player.drinkTimer = this.player.drinkDuration;
  }

  stopDrinking() {
    this.player.drinking = false;
  }

  updatePlayer() {
    if (this.gameState !== 'playing') return;

    // Handle movement
    this.player.vx = 0;
    this.player.vy = 0;

    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.player.vx = -this.player.speed;
      this.player.direction = 'left';
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.player.vx = this.player.speed;
      this.player.direction = 'right';
    }
    if (this.keys['KeyW'] || this.keys['ArrowUp']) {
      this.player.vy = -this.player.speed;
    }
    if (this.keys['KeyS'] || this.keys['ArrowDown']) {
      this.player.vy = this.player.speed;
    }

    // Move player
    const newX = this.player.x + this.player.vx;
    const newY = this.player.y + this.player.vy;

    // Check collision with solid tiles
    if (!this.checkCollision(newX, this.player.y)) {
      this.player.x = newX;
    }
    if (!this.checkCollision(this.player.x, newY)) {
      this.player.y = newY;
    }

    // Handle drinking
    if (this.player.drinking && this.player.drinkTimer > 0) {
      this.player.drinkTimer--;

      // Create drinking area
      const drinkX = this.player.x + (this.player.direction === 'right' ? this.player.size : -this.player.size);
      const drinkY = this.player.y;

      this.drinkingAreas.push({
        x: drinkX,
        y: drinkY,
        size: 20,
        timer: 10
      });

      // Remove tiles in drinking area
      const tileX = Math.floor(drinkX / this.tileSize);
      const tileY = Math.floor(drinkY / this.tileSize);
      if (tileX >= 0 && tileX < this.cols && tileY >= 0 && tileY < this.rows) {
        if (this.tiles[tileY][tileX] === 1) {
          this.tiles[tileY][tileX] = 0;
          this.createParticles(drinkX, drinkY, '#8B4513');
          this.score += 10;
        }
      }

      if (this.player.drinkTimer === 0) {
        this.player.drinking = false;
      }
    }

    // Keep player in bounds
    this.player.x = Math.max(this.player.size, Math.min(this.canvas.width - this.player.size, this.player.x));
    this.player.y = Math.max(this.player.size, Math.min(this.canvas.height - this.player.size, this.player.y));
  }

  checkCollision(x, y) {
    const size = this.player.size / 2;
    const corners = [
      { x: x - size, y: y - size },
      { x: x + size, y: y - size },
      { x: x - size, y: y + size },
      { x: x + size, y: y + size }
    ];

    return corners.some(corner => this.getTile(corner.x, corner.y) === 1);
  }

  updateEnemies() {
    this.enemies.forEach((enemy, index) => {
      if (enemy.stunned) {
        enemy.stunTimer--;
        if (enemy.stunTimer <= 0) {
          enemy.stunned = false;
        }
        return;
      }

      // Simple AI - move towards player
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        enemy.vx = (dx / distance) * 0.5;
        enemy.vy = (dy / distance) * 0.5;
      }

      // Move enemy
      const newX = enemy.x + enemy.vx;
      const newY = enemy.y + enemy.vy;

      if (!this.checkEnemyCollision(newX, enemy.y, enemy.size)) {
        enemy.x = newX;
      }
      if (!this.checkEnemyCollision(enemy.x, newY, enemy.size)) {
        enemy.y = newY;
      }

      // Check collision with player
      const playerDistance = Math.sqrt(
        Math.pow(this.player.x - enemy.x, 2) +
        Math.pow(this.player.y - enemy.y, 2)
      );

      if (playerDistance < (this.player.size + enemy.size) / 2) {
        this.playerHit();
      }

      // Check if enemy is in drinking area
      this.drinkingAreas.forEach(area => {
        const areaDistance = Math.sqrt(
          Math.pow(area.x - enemy.x, 2) +
          Math.pow(area.y - enemy.y, 2)
        );

        if (areaDistance < (area.size + enemy.size) / 2) {
          enemy.stunned = true;
          enemy.stunTimer = 60;
          enemy.health--;
          this.createParticles(enemy.x, enemy.y, '#FF6B6B');

          if (enemy.health <= 0) {
            this.enemies.splice(index, 1);
            this.score += 100;
            this.createParticles(enemy.x, enemy.y, '#FFD700');
          }
        }
      });
    });
  }

  checkEnemyCollision(x, y, size) {
    const corners = [
      { x: x - size / 2, y: y - size / 2 },
      { x: x + size / 2, y: y - size / 2 },
      { x: x - size / 2, y: y + size / 2 },
      { x: x + size / 2, y: y + size / 2 }
    ];

    return corners.some(corner => this.getTile(corner.x, corner.y) === 1);
  }

  updateBeerMugs() {
    this.beerMugs.forEach((mug, index) => {
      if (mug.collected) return;

      const distance = Math.sqrt(
        Math.pow(this.player.x - mug.x, 2) +
        Math.pow(this.player.y - mug.y, 2)
      );

      if (distance < (this.player.size + mug.size) / 2) {
        mug.collected = true;
        this.score += 50;
        this.createParticles(mug.x, mug.y, '#FFD700');

        // Check if all mugs collected
        if (this.beerMugs.every(m => m.collected)) {
          this.levelComplete();
        }
      }
    });
  }

  updateParticles() {
    this.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;

      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });
  }

  updateDrinkingAreas() {
    this.drinkingAreas.forEach((area, index) => {
      area.timer--;
      if (area.timer <= 0) {
        this.drinkingAreas.splice(index, 1);
      }
    });
  }

  createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: color,
        life: 30,
        maxLife: 30,
        alpha: 1,
        size: Math.random() * 4 + 2
      });
    }
  }

  playerHit() {
    this.lives--;
    this.createParticles(this.player.x, this.player.y, '#FF0000');

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Reset player position
      this.player.x = Math.floor(this.cols / 2) * this.tileSize + this.tileSize / 2;
      this.player.y = this.tileSize / 2;
    }

    this.updateHUD();
  }

  levelComplete() {
    this.level++;
    this.gameSpeed += 0.1;
    this.generateLevel();
    this.updateHUD();
  }

  gameOver() {
    this.gameState = 'gameOver';
    document.getElementById('final-score-value').textContent = this.score;
    this.showScreen('end-screen');
  }

  updateHUD() {
    document.getElementById('score-value').textContent = this.score;
    document.getElementById('lives-value').textContent = this.lives;
    document.getElementById('level-value').textContent = this.level;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    this.ctx.fillStyle = '#2c1810';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw tiles
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.tiles[y][x] === 1) {
          this.ctx.fillStyle = '#8B4513';
          this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);

          // Add texture
          this.ctx.fillStyle = '#654321';
          this.ctx.fillRect(x * this.tileSize + 2, y * this.tileSize + 2, this.tileSize - 4, this.tileSize - 4);
        }
      }
    }

    // Draw drinking areas
    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    this.drinkingAreas.forEach(area => {
      this.ctx.beginPath();
      this.ctx.arc(area.x, area.y, area.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw beer mugs
    this.beerMugs.forEach(mug => {
      if (!mug.collected) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(mug.x - mug.size / 2, mug.y - mug.size / 2, mug.size, mug.size);

        // Mug handle
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(mug.x + mug.size / 2 - 2, mug.y - mug.size / 4, 4, mug.size / 2);
      }
    });

    // Draw enemies
    this.enemies.forEach(enemy => {
      if (enemy.type === 'drunkard') {
        this.ctx.fillStyle = enemy.stunned ? '#FF6B6B' : '#8B4513';
      } else {
        this.ctx.fillStyle = enemy.stunned ? '#FF6B6B' : '#4A4A4A';
      }

      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Eyes
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(enemy.x - 5, enemy.y - 5, 3, 0, Math.PI * 2);
      this.ctx.arc(enemy.x + 5, enemy.y - 5, 3, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Draw player
    this.ctx.fillStyle = '#4169E1';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.size / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Player face
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x - 4, this.player.y - 4, 2, 0, Math.PI * 2);
    this.ctx.arc(this.player.x + 4, this.player.y - 4, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Drinking effect
    if (this.player.drinking) {
      this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
      this.ctx.beginPath();
      const drinkX = this.player.x + (this.player.direction === 'right' ? this.player.size : -this.player.size);
      this.ctx.arc(drinkX, this.player.y, 15, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  update() {
    if (this.gameState !== 'playing') return;

    this.updatePlayer();
    this.updateEnemies();
    this.updateBeerMugs();
    this.updateParticles();
    this.updateDrinkingAreas();
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  new GlugGlugGame();
});
