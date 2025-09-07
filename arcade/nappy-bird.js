(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const startOverlay = document.getElementById('start');
  const endOverlay = document.getElementById('end');
  const pauseOverlay = document.getElementById('pause');
  const endTitle = document.getElementById('endTitle');
  const endSubtitle = document.getElementById('endSubtitle');
  const finalScore = document.getElementById('finalScore');
  const startBtn = document.getElementById('startBtn');
  const easyBtn = document.getElementById('easyBtn');
  const playAgainBtn = document.getElementById('playAgain');
  const menuBtn = document.getElementById('menuBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const mainMenuBtn = document.getElementById('mainMenuBtn');

  const W = canvas.width, H = canvas.height;

  // Game constants
  const BIRD_SIZE = 30;
  const BIRD_X = W * 0.2;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const CLOUD_WIDTH = 80;
  const CLOUD_GAP = 200;
  const CLOUD_SPEED = 3;
  const GROUND_HEIGHT = 60;

  // Tunables
  const DIFFICULTY = {
    normal: { cloudSpeed: 3, cloudGap: 200, gravity: 0.6 },
    easy: { cloudSpeed: 2, cloudGap: 250, gravity: 0.4 }
  };

  // State
  let settings = DIFFICULTY.normal;
  let state = 'menu'; // 'menu' | 'playing' | 'paused' | 'end'
  let keys = {};
  let bird, clouds, score, highScore, lastTs = 0, raf = 0;

  // Load high score from localStorage
  highScore = parseInt(localStorage.getItem('nappyBirdHighScore') || '0');
  highScoreEl.textContent = `Best: ${highScore}`;

  function resetGame() {
    bird = {
      x: BIRD_X,
      y: H / 2,
      size: BIRD_SIZE,
      velocity: 0,
      rotation: 0
    };
    clouds = [];
    score = 0;
    updateScore();
  }

  function updateScore() {
    scoreEl.textContent = `Score: ${score}`;
  }

  function addCloud() {
    const gap = settings.cloudGap;
    const cloudHeight = Math.random() * (H - GROUND_HEIGHT - gap - 100) + 50;

    clouds.push({
      x: W,
      topHeight: cloudHeight,
      bottomY: cloudHeight + gap,
      width: CLOUD_WIDTH,
      passed: false
    });
  }

  function updateBird(dt) {
    if (state !== 'playing') return;

    bird.velocity += settings.gravity;
    bird.y += bird.velocity;
    bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 30);

    // Check ground collision
    if (bird.y + bird.size > H - GROUND_HEIGHT) {
      gameOver();
      return;
    }

    // Check ceiling collision
    if (bird.y < 0) {
      bird.y = 0;
      bird.velocity = 0;
    }
  }

  function updateClouds(dt) {
    if (state !== 'playing') return;

    // Move clouds
    for (let i = clouds.length - 1; i >= 0; i--) {
      const cloud = clouds[i];
      cloud.x -= settings.cloudSpeed;

      // Check if bird passed cloud
      if (!cloud.passed && cloud.x + cloud.width < bird.x) {
        cloud.passed = true;
        score++;
        updateScore();
      }

      // Remove off-screen clouds
      if (cloud.x + cloud.width < 0) {
        clouds.splice(i, 1);
      }
    }

    // Add new clouds
    if (clouds.length === 0 || clouds[clouds.length - 1].x < W - 300) {
      addCloud();
    }
  }

  function checkCollisions() {
    if (state !== 'playing') return;

    for (const cloud of clouds) {
      // Check collision with top cloud
      if (bird.x + bird.size > cloud.x &&
        bird.x < cloud.x + cloud.width &&
        bird.y < cloud.topHeight) {
        gameOver();
        return;
      }

      // Check collision with bottom cloud
      if (bird.x + bird.size > cloud.x &&
        bird.x < cloud.x + cloud.width &&
        bird.y + bird.size > cloud.bottomY) {
        gameOver();
        return;
      }
    }
  }

  function gameOver() {
    state = 'end';
    endOverlay.classList.remove('hidden');

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('nappyBirdHighScore', highScore.toString());
      highScoreEl.textContent = `Best: ${highScore}`;
      endTitle.textContent = 'New High Score!';
    } else {
      endTitle.textContent = 'Game Over!';
    }

    finalScore.textContent = score;
    endSubtitle.textContent = `Final score: ${score}`;
  }

  function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, H - GROUND_HEIGHT, W, GROUND_HEIGHT);

    // Ground texture
    ctx.fillStyle = '#7CCD7C';
    for (let x = 0; x < W; x += 20) {
      ctx.fillRect(x, H - GROUND_HEIGHT, 10, 5);
    }
  }

  function drawClouds() {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;

    for (const cloud of clouds) {
      // Top cloud
      drawCloud(cloud.x, 0, cloud.width, cloud.topHeight);

      // Bottom cloud
      drawCloud(cloud.x, cloud.bottomY, cloud.width, H - GROUND_HEIGHT - cloud.bottomY);
    }
  }

  function drawCloud(x, y, width, height) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 20);
    ctx.fill();
    ctx.stroke();
  }

  function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
    ctx.rotate(bird.rotation * Math.PI / 180);

    // Bird body (sleeping animal)
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.size / 2, bird.size / 3, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Sleepy eyes
    ctx.fillStyle = '#DDA0DD';
    ctx.beginPath();
    ctx.arc(-8, -5, 3, 0, 2 * Math.PI);
    ctx.arc(8, -5, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Closed eyes (sleeping)
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -5);
    ctx.lineTo(-4, -5);
    ctx.moveTo(4, -5);
    ctx.lineTo(12, -5);
    ctx.stroke();

    // Wings
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.ellipse(-5, 0, 8, 12, 0, 0, 2 * Math.PI);
    ctx.ellipse(5, 0, 8, 12, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Z's for sleeping
    ctx.strokeStyle = '#DDA0DD';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(15, -10);
    ctx.lineTo(25, -10);
    ctx.lineTo(20, -5);
    ctx.lineTo(30, -5);
    ctx.stroke();

    ctx.restore();
  }

  function draw() {
    drawBackground();
    drawClouds();
    drawBird();
  }

  function update(dt) {
    updateBird(dt);
    updateClouds(dt);
    checkCollisions();
  }

  function gameLoop(ts) {
    if (lastTs === 0) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 16.67, 2); // Cap at 2x speed
    lastTs = ts;

    update(dt);
    draw();

    if (state === 'playing' || state === 'paused') {
      raf = requestAnimationFrame(gameLoop);
    }
  }

  function startGame() {
    resetGame();
    state = 'playing';
    startOverlay.classList.add('hidden');
    endOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    lastTs = 0;
    raf = requestAnimationFrame(gameLoop);
  }

  function pauseGame() {
    if (state === 'playing') {
      state = 'paused';
      pauseOverlay.classList.remove('hidden');
    }
  }

  function resumeGame() {
    if (state === 'paused') {
      state = 'playing';
      pauseOverlay.classList.add('hidden');
      lastTs = 0;
      raf = requestAnimationFrame(gameLoop);
    }
  }

  function jump() {
    if (state === 'playing') {
      bird.velocity = JUMP_FORCE;
    }
  }

  // Event listeners
  startBtn.addEventListener('click', startGame);
  easyBtn.addEventListener('click', () => {
    settings = DIFFICULTY.easy;
    startGame();
  });
  playAgainBtn.addEventListener('click', startGame);
  menuBtn.addEventListener('click', () => {
    state = 'menu';
    startOverlay.classList.remove('hidden');
    endOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
  });
  resumeBtn.addEventListener('click', resumeGame);
  restartBtn.addEventListener('click', startGame);
  mainMenuBtn.addEventListener('click', () => {
    state = 'menu';
    startOverlay.classList.remove('hidden');
    endOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (state === 'menu') startGame();
        else if (state === 'playing') jump();
        else if (state === 'paused') resumeGame();
        break;
      case 'KeyP':
        if (state === 'playing') pauseGame();
        else if (state === 'paused') resumeGame();
        break;
      case 'KeyR':
        if (state === 'playing' || state === 'paused') startGame();
        break;
      case 'Enter':
        if (state === 'end') startGame();
        break;
      case 'KeyM':
        if (state === 'end' || state === 'paused') {
          state = 'menu';
          startOverlay.classList.remove('hidden');
          endOverlay.classList.add('hidden');
          pauseOverlay.classList.add('hidden');
        }
        break;
    }
  });

  document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  // Mouse/touch controls
  canvas.addEventListener('click', (e) => {
    if (state === 'menu') startGame();
    else if (state === 'playing') jump();
    else if (state === 'paused') resumeGame();
  });

  // Initialize
  resetGame();
  draw();
})();
