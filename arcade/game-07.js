class BubbleShooter3D {
  constructor() {
    this.container = document.getElementById('game-container');
    this.scoreElement = document.getElementById('score');
    this.levelElement = document.getElementById('level');
    this.nextBubbleElement = document.getElementById('nextBubble');

    this.gameState = 'menu';
    this.score = 0;
    this.level = 1;
    this.bubbles = [];
    this.shootingBubble = null;
    this.nextBubble = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isAiming = false;
    this.power = 0;
    this.maxPower = 100;
    this.isCharging = false;
    this.combo = 0;
    this.maxCombo = 0;

    this.bubbleRadius = 0.3;
    this.bubbleColors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff];
    this.rows = 8;
    this.cols = 12;
    this.startY = 2;
    this.grid = [];

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = null;
    this.mouse = new THREE.Vector2();
    this.aimLine = null;
    this.powerBar = null;

    this.initThreeJS();
    this.setupEventListeners();
    this.generateNextBubble();
    this.initializeGrid();
  }

  initThreeJS() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    this.camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(800, 600);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();

    this.setupLighting();
    this.createAimLine();
    this.createPowerBar();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(0, 0, 5);
    this.scene.add(pointLight);
  }

  createAimLine() {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    this.aimLine = new THREE.Line(geometry, material);
    this.scene.add(this.aimLine);
  }

  createPowerBar() {
    const geometry = new THREE.PlaneGeometry(2, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0x4CAF50, transparent: true, opacity: 0.8 });
    this.powerBar = new THREE.Mesh(geometry, material);
    this.powerBar.position.set(0, -2.5, 0);
    this.scene.add(this.powerBar);
  }

  setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('easyBtn').addEventListener('click', () => this.startGame(true));
    document.getElementById('playAgain').addEventListener('click', () => this.startGame());
    document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
    document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
    document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
    document.getElementById('mainMenuBtn').addEventListener('click', () => this.showMenu());

    this.renderer.domElement.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.renderer.domElement.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.renderer.domElement.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.renderer.domElement.addEventListener('click', (e) => this.handleClick(e));

    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    window.addEventListener('resize', () => this.onWindowResize());
  }

  handleMouseMove(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;

    this.mouse.x = (this.mouseX / rect.width) * 2 - 1;
    this.mouse.y = -(this.mouseY / rect.height) * 2 + 1;

    if (this.gameState === 'playing') {
      this.updateAimLine();
    }
  }

  handleMouseDown(e) {
    if (this.gameState === 'playing' && !this.shootingBubble) {
      this.isCharging = true;
      this.power = 0;
    }
  }

  handleMouseUp(e) {
    if (this.gameState === 'playing' && this.isCharging && !this.shootingBubble) {
      this.shootBubble();
      this.isCharging = false;
    }
  }

  handleClick(e) {
    if (this.gameState === 'playing' && !this.shootingBubble && !this.isCharging) {
      this.shootBubble();
    }
  }

  handleKeyDown(e) {
    switch (e.key.toLowerCase()) {
      case 'p':
        if (this.gameState === 'playing') this.pauseGame();
        else if (this.gameState === 'paused') this.resumeGame();
        break;
      case 'r':
        if (this.gameState === 'playing' || this.gameState === 'paused') this.startGame();
        break;
    }
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = 600;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  startGame(easyMode = false) {
    this.gameState = 'playing';
    this.score = 0;
    this.level = 1;
    this.combo = 0;
    this.maxCombo = 0;
    this.clearBubbles();
    this.shootingBubble = null;
    this.initializeGrid();
    this.generateNextBubble();
    this.updateUI();
    this.hideAllMenus();
    this.animate();
  }

  pauseGame() {
    this.gameState = 'paused';
    document.getElementById('pause').style.display = 'block';
  }

  resumeGame() {
    this.gameState = 'playing';
    document.getElementById('pause').style.display = 'none';
    this.animate();
  }

  showMenu() {
    this.gameState = 'menu';
    document.getElementById('start').style.display = 'block';
    document.getElementById('end').style.display = 'none';
    document.getElementById('pause').style.display = 'none';
  }

  hideAllMenus() {
    document.getElementById('start').style.display = 'none';
    document.getElementById('end').style.display = 'none';
    document.getElementById('pause').style.display = 'none';
  }

  clearBubbles() {
    this.bubbles.forEach(bubble => {
      this.scene.remove(bubble.mesh);
    });
    this.bubbles = [];
  }

  initializeGrid() {
    this.clearBubbles();
    this.grid = [];

    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        if (Math.random() < 0.7) {
          const color = this.bubbleColors[Math.floor(Math.random() * this.bubbleColors.length)];
          const x = (col - this.cols / 2) * this.bubbleRadius * 2.2;
          const y = this.startY + row * this.bubbleRadius * 1.8 + (col % 2) * this.bubbleRadius * 0.9;
          const z = 0;

          const bubble = this.createBubble(x, y, z, color);
          this.grid[row][col] = { bubble, active: true };
          this.bubbles.push(bubble);
        } else {
          this.grid[row][col] = null;
        }
      }
    }
  }

  createBubble(x, y, z, color) {
    const geometry = new THREE.SphereGeometry(this.bubbleRadius, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.scene.add(mesh);

    return { mesh, color, x, y, z, active: true };
  }

  generateNextBubble() {
    this.nextBubble = this.bubbleColors[Math.floor(Math.random() * this.bubbleColors.length)];
    this.nextBubbleElement.style.backgroundColor = `#${this.nextBubble.toString(16).padStart(6, '0')}`;
  }

  updateAimLine() {
    if (!this.aimLine || this.shootingBubble) return;

    const startPoint = new THREE.Vector3(0, -2.5, 0);
    const direction = new THREE.Vector3(this.mouse.x * 2, this.mouse.y * 2, 0).normalize();
    const endPoint = startPoint.clone().add(direction.multiplyScalar(3));

    const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
    this.aimLine.geometry = geometry;
  }

  shootBubble() {
    if (this.shootingBubble) return;

    const direction = new THREE.Vector3(this.mouse.x * 2, this.mouse.y * 2, 0).normalize();
    const speed = 0.3 + (this.power / this.maxPower) * 0.2;

    this.shootingBubble = this.createBubble(0, -2.5, 0, this.nextBubble);
    this.shootingBubble.velocity = direction.multiplyScalar(speed);
    this.shootingBubble.isShooting = true;

    this.generateNextBubble();
    this.power = 0;
  }

  updateShootingBubble() {
    if (!this.shootingBubble || !this.shootingBubble.isShooting) return;

    this.shootingBubble.mesh.position.add(this.shootingBubble.velocity);

    if (this.shootingBubble.mesh.position.x < -4 || this.shootingBubble.mesh.position.x > 4) {
      this.shootingBubble.velocity.x *= -1;
    }

    if (this.shootingBubble.mesh.position.y > 4) {
      this.shootingBubble.velocity.y *= -1;
    }

    const collision = this.checkCollision();
    if (collision) {
      this.placeBubble(collision);
      this.shootingBubble = null;
    }
  }

  checkCollision() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const gridBubble = this.grid[row][col];
        if (gridBubble && gridBubble.active) {
          const dx = this.shootingBubble.mesh.position.x - gridBubble.bubble.mesh.position.x;
          const dy = this.shootingBubble.mesh.position.y - gridBubble.bubble.mesh.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.bubbleRadius * 2) {
            return { row, col, bubble: gridBubble };
          }
        }
      }
    }

    if (this.shootingBubble.mesh.position.y > 3.5) {
      return { row: -1, col: -1, bubble: null };
    }

    return null;
  }

  placeBubble(collision) {
    if (collision.row === -1) {
      this.gameOver();
      return;
    }

    const newRow = collision.row;
    const newCol = collision.col;

    this.shootingBubble.isShooting = false;
    this.grid[newRow][newCol] = { bubble: this.shootingBubble, active: true };
    this.bubbles.push(this.shootingBubble);

    const matches = this.findMatches(newRow, newCol);
    if (matches.length >= 3) {
      this.clearMatches(matches);
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.score += matches.length * 10 * this.combo;
      this.updateUI();
      this.showComboText();
    } else {
      this.combo = 0;
    }

    this.checkLevelComplete();
  }

  findMatches(row, col) {
    const color = this.grid[row][col].bubble.color;
    const visited = new Set();
    const matches = [];

    const dfs = (r, c) => {
      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
      if (visited.has(`${r},${c}`)) return;

      const gridBubble = this.grid[r][c];
      if (!gridBubble || !gridBubble.active || gridBubble.bubble.color !== color) return;

      visited.add(`${r},${c}`);
      matches.push({ row: r, col: c });

      dfs(r - 1, c);
      dfs(r + 1, c);
      dfs(r, c - 1);
      dfs(r, c + 1);
      if (r % 2 === 0) {
        dfs(r - 1, c - 1);
        dfs(r + 1, c - 1);
      } else {
        dfs(r - 1, c + 1);
        dfs(r + 1, c + 1);
      }
    };

    dfs(row, col);
    return matches;
  }

  clearMatches(matches) {
    matches.forEach(match => {
      if (this.grid[match.row][match.col]) {
        this.scene.remove(this.grid[match.row][match.col].bubble.mesh);
        this.grid[match.row][match.col].active = false;
      }
    });

    this.dropBubbles();
  }

  dropBubbles() {
    for (let col = 0; col < this.cols; col++) {
      let writeIndex = this.rows - 1;
      for (let row = this.rows - 1; row >= 0; row--) {
        if (this.grid[row][col] && this.grid[row][col].active) {
          if (writeIndex !== row) {
            this.grid[writeIndex][col] = this.grid[row][col];
            this.grid[row][col] = null;
          }
          writeIndex--;
        }
      }
    }
  }

  checkLevelComplete() {
    let activeBubbles = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col] && this.grid[row][col].active) {
          activeBubbles++;
        }
      }
    }

    if (activeBubbles === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.score += 1000 * this.level;
    this.level++;
    this.combo = 0;
    this.updateUI();

    const levelCompleteDiv = document.createElement('div');
    levelCompleteDiv.className = 'level-complete';
    levelCompleteDiv.textContent = `Level ${this.level - 1} Complete!`;
    document.querySelector('.game-container').appendChild(levelCompleteDiv);

    setTimeout(() => {
      levelCompleteDiv.remove();
      this.initializeGrid();
    }, 2000);
  }

  gameOver() {
    this.gameState = 'gameOver';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('endTitle').textContent = 'Game Over!';
    document.getElementById('endSubtitle').textContent = `Final Score: ${this.score}`;
    document.getElementById('end').style.display = 'block';
  }

  showComboText() {
    if (this.combo > 1) {
      const comboText = document.createElement('div');
      comboText.className = 'combo-text';
      comboText.textContent = `${this.combo}x Combo!`;
      comboText.style.left = '50%';
      comboText.style.top = '50%';
      comboText.style.transform = 'translate(-50%, -50%)';
      document.querySelector('.game-container').appendChild(comboText);

      setTimeout(() => comboText.remove(), 1000);
    }
  }

  updateUI() {
    this.scoreElement.textContent = this.score;
    this.levelElement.textContent = this.level;
  }

  update() {
    if (this.gameState !== 'playing') return;

    this.updateShootingBubble();

    if (this.isCharging) {
      this.power = Math.min(this.power + 2, this.maxPower);
      this.updatePowerBar();
    }
  }

  updatePowerBar() {
    if (this.powerBar) {
      const scale = this.power / this.maxPower;
      this.powerBar.scale.x = scale * 2;

      if (scale < 0.33) {
        this.powerBar.material.color.setHex(0x4CAF50);
      } else if (scale < 0.66) {
        this.powerBar.material.color.setHex(0xFFC107);
      } else {
        this.powerBar.material.color.setHex(0xFF5722);
      }
    }
  }

  animate() {
    if (this.gameState !== 'playing') return;

    this.update();
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BubbleShooter3D();
});
