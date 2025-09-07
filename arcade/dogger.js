// Dogger - Frogger-style game with dog character

class DoggerGame {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.easyMode = false;

    // Dog properties
    this.dog = {
      x: this.width / 2 - 20,
      y: this.height - 60,
      width: 40,
      height: 40,
      speed: 4,
      onLog: false,
      logSpeed: 0
    };

    // Game objects
    this.cars = [];
    this.logs = [];
    this.turtles = [];
    this.goals = [];

    // Timing
    this.lastTime = 0;
    this.carSpawnTimer = 0;
    this.logSpawnTimer = 0;
    this.turtleSpawnTimer = 0;

    // Input
    this.keys = {};

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupGoals();
    this.gameLoop();
  }

  setupEventListeners() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'KeyP' && this.gameState === 'playing') {
        this.pauseGame();
      } else if (e.code === 'KeyR' && this.gameState === 'playing') {
        this.restartGame();
      } else if (e.code === 'Enter' && this.gameState === 'gameOver') {
        this.startGame();
      } else if (e.code === 'KeyM' && this.gameState === 'gameOver') {
        this.showMenu();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Button events
    document.getElementById('startBtn').addEventListener('click', () => {
      this.easyMode = false;
      this.startGame();
    });

    document.getElementById('easyBtn').addEventListener('click', () => {
      this.easyMode = true;
      this.startGame();
    });

    document.getElementById('playAgain').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('menuBtn').addEventListener('click', () => {
      this.showMenu();
    });

    document.getElementById('resumeBtn').addEventListener('click', () => {
      this.resumeGame();
    });

    document.getElementById('restartBtn').addEventListener('click', () => {
      this.restartGame();
    });

    document.getElementById('mainMenuBtn').addEventListener('click', () => {
      this.showMenu();
    });
  }

  setupGoals() {
    const goalWidth = 60;
    const goalSpacing = (this.width - 5 * goalWidth) / 6;

    for (let i = 0; i < 5; i++) {
      this.goals.push({
        x: goalSpacing + i * (goalWidth + goalSpacing),
        y: 40,
        width: goalWidth,
        height: 40,
        occupied: false
      });
    }
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.cars = [];
    this.logs = [];
    this.turtles = [];
    this.dog.x = this.width / 2 - 20;
    this.dog.y = this.height - 60;
    this.dog.onLog = false;
    this.dog.logSpeed = 0;

    // Reset goals
    this.goals.forEach(goal => goal.occupied = false);

    this.hideAllOverlays();
    this.updateHUD();
  }

  pauseGame() {
    this.gameState = 'paused';
    document.getElementById('pause').classList.remove('hidden');
  }

  resumeGame() {
    this.gameState = 'playing';
    document.getElementById('pause').classList.add('hidden');
  }

  restartGame() {
    this.startGame();
  }

  showMenu() {
    this.gameState = 'menu';
    document.getElementById('start').classList.remove('hidden');
    document.getElementById('pause').classList.add('hidden');
    document.getElementById('end').classList.add('hidden');
  }

  gameOver() {
    this.gameState = 'gameOver';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('end').classList.remove('hidden');
  }

  hideAllOverlays() {
    document.getElementById('start').classList.add('hidden');
    document.getElementById('pause').classList.add('hidden');
    document.getElementById('end').classList.add('hidden');
  }

  updateHUD() {
    document.getElementById('score').textContent = `Score: ${this.score}`;
    document.getElementById('lives').textContent = `Lives: ${this.lives}`;
    document.getElementById('level').textContent = `Level: ${this.level}`;
  }

  handleInput() {
    if (this.gameState !== 'playing') return;

    const speed = this.dog.speed;
    let newX = this.dog.x;
    let newY = this.dog.y;

    if (this.keys['ArrowUp'] || this.keys['KeyW']) {
      newY -= speed;
    }
    if (this.keys['ArrowDown'] || this.keys['KeyS']) {
      newY += speed;
    }
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      newX -= speed;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      newX += speed;
    }

    // Keep dog on screen
    newX = Math.max(0, Math.min(newX, this.width - this.dog.width));
    newY = Math.max(0, Math.min(newY, this.height - this.dog.height));

    this.dog.x = newX;
    this.dog.y = newY;
  }

  spawnCars() {
    this.carSpawnTimer++;
    const spawnRate = this.easyMode ? 120 : 60 + Math.max(0, 60 - this.level * 5);

    if (this.carSpawnTimer >= spawnRate) {
      this.carSpawnTimer = 0;

      // Spawn cars on different lanes
      const lanes = [this.height - 120, this.height - 160, this.height - 200];
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      const direction = Math.random() < 0.5 ? 1 : -1;
      const speed = (this.easyMode ? 1 : 2) + Math.random() * 2;

      this.cars.push({
        x: direction > 0 ? -60 : this.width,
        y: lane,
        width: 60,
        height: 30,
        speed: speed * direction,
        color: this.getRandomCarColor()
      });
    }
  }

  spawnLogs() {
    this.logSpawnTimer++;
    const spawnRate = this.easyMode ? 150 : 100 + Math.max(0, 50 - this.level * 3);

    if (this.logSpawnTimer >= spawnRate) {
      this.logSpawnTimer = 0;

      // Spawn logs on different lanes
      const lanes = [120, 80, 40];
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      const direction = Math.random() < 0.5 ? 1 : -1;
      const speed = (this.easyMode ? 0.5 : 1) + Math.random() * 1;

      this.logs.push({
        x: direction > 0 ? -80 : this.width,
        y: lane,
        width: 80,
        height: 30,
        speed: speed * direction
      });
    }
  }

  getRandomCarColor() {
    const colors = ['#ff0000', '#0000ff', '#ffff00', '#00ff00', '#ff00ff', '#00ffff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  updateCars() {
    this.cars.forEach((car, index) => {
      car.x += car.speed;

      // Remove cars that are off screen
      if (car.x < -60 || car.x > this.width) {
        this.cars.splice(index, 1);
      }
    });
  }

  updateLogs() {
    this.logs.forEach((log, index) => {
      log.x += log.speed;

      // Remove logs that are off screen
      if (log.x < -80 || log.x > this.width) {
        this.logs.splice(index, 1);
      }
    });
  }

  checkCollisions() {
    // Check car collisions
    this.cars.forEach(car => {
      if (this.isColliding(this.dog, car)) {
        this.loseLife();
      }
    });

    // Check water collision (if not on log)
    if (this.dog.y < 160 && this.dog.y > 40) {
      let onLog = false;
      this.logs.forEach(log => {
        if (this.isColliding(this.dog, log)) {
          onLog = true;
          this.dog.onLog = true;
          this.dog.logSpeed = log.speed;
        }
      });

      if (!onLog) {
        this.loseLife();
      }
    } else {
      this.dog.onLog = false;
      this.dog.logSpeed = 0;
    }

    // Check goal collision
    this.goals.forEach(goal => {
      if (!goal.occupied && this.isColliding(this.dog, goal)) {
        goal.occupied = true;
        this.score += 100 * this.level;
        this.dog.x = this.width / 2 - 20;
        this.dog.y = this.height - 60;
        this.dog.onLog = false;
        this.dog.logSpeed = 0;

        // Check if all goals are filled
        if (this.goals.every(g => g.occupied)) {
          this.nextLevel();
        }
      }
    });
  }

  isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y;
  }

  loseLife() {
    this.lives--;
    this.dog.x = this.width / 2 - 20;
    this.dog.y = this.height - 60;
    this.dog.onLog = false;
    this.dog.logSpeed = 0;

    if (this.lives <= 0) {
      this.gameOver();
    }

    this.updateHUD();
  }

  nextLevel() {
    this.level++;
    this.lives++;
    this.goals.forEach(goal => goal.occupied = false);
    this.updateHUD();
  }

  updateDog() {
    if (this.dog.onLog) {
      this.dog.x += this.dog.logSpeed;
    }

    // Keep dog on screen
    this.dog.x = Math.max(0, Math.min(this.dog.x, this.width - this.dog.width));
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw background sections
    this.drawBackground();

    // Draw goals
    this.drawGoals();

    // Draw cars
    this.drawCars();

    // Draw logs
    this.drawLogs();

    // Draw dog
    this.drawDog();
  }

  drawBackground() {
    // Sky
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.width, 40);

    // Water
    this.ctx.fillStyle = '#0066cc';
    this.ctx.fillRect(0, 40, this.width, 120);

    // Road
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 160, this.width, 120);

    // Sidewalk
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, 280, this.width, 40);

    // Grass
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, 320, this.width, this.height - 320);

    // Road lines
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    for (let y = 180; y < 280; y += 40) {
      this.ctx.beginPath();
      this.ctx.setLineDash([10, 10]);
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);
  }

  drawGoals() {
    this.goals.forEach(goal => {
      this.ctx.fillStyle = goal.occupied ? '#00ff00' : '#8B4513';
      this.ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(goal.x, goal.y, goal.width, goal.height);
    });
  }

  drawCars() {
    this.cars.forEach(car => {
      this.ctx.fillStyle = car.color;
      this.ctx.fillRect(car.x, car.y, car.width, car.height);

      // Car details
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(car.x + 5, car.y + 5, 15, 10);
      this.ctx.fillRect(car.x + 40, car.y + 5, 15, 10);
      this.ctx.fillRect(car.x + 5, car.y + 15, 15, 10);
      this.ctx.fillRect(car.x + 40, car.y + 15, 15, 10);
    });
  }

  drawLogs() {
    this.logs.forEach(log => {
      this.ctx.fillStyle = '#8B4513';
      this.ctx.fillRect(log.x, log.y, log.width, log.height);

      // Log texture
      this.ctx.strokeStyle = '#654321';
      this.ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        this.ctx.beginPath();
        this.ctx.arc(log.x + 20 + i * 20, log.y + 15, 8, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    });
  }

  drawDog() {
    // Dog body
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(this.dog.x + 10, this.dog.y + 15, 20, 20);

    // Dog head
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(this.dog.x + 15, this.dog.y + 5, 15, 15);

    // Dog ears
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(this.dog.x + 12, this.dog.y + 3, 6, 8);
    this.ctx.fillRect(this.dog.x + 27, this.dog.y + 3, 6, 8);

    // Dog eyes
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(this.dog.x + 18, this.dog.y + 8, 2, 2);
    this.ctx.fillRect(this.dog.x + 25, this.dog.y + 8, 2, 2);

    // Dog nose
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(this.dog.x + 20, this.dog.y + 12, 3, 2);

    // Dog tail
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(this.dog.x + 5, this.dog.y + 20, 8, 4);

    // Dog legs
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(this.dog.x + 12, this.dog.y + 30, 4, 8);
    this.ctx.fillRect(this.dog.x + 20, this.dog.y + 30, 4, 8);
    this.ctx.fillRect(this.dog.x + 28, this.dog.y + 30, 4, 8);
  }

  gameLoop(currentTime = 0) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.gameState === 'playing') {
      this.handleInput();
      this.updateDog();
      this.spawnCars();
      this.spawnLogs();
      this.updateCars();
      this.updateLogs();
      this.checkCollisions();
    }

    this.draw();
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new DoggerGame();
});
