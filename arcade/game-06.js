(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const ballsEl = document.getElementById('balls');
  const multiplierEl = document.getElementById('multiplier');
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
  const BALL_RADIUS = 8;
  const FLIPPER_LENGTH = 60;
  const FLIPPER_WIDTH = 12;
  const LAUNCHER_POWER = 12;
  const GRAVITY = 0.3;
  const FRICTION = 0.98;
  const BOUNCE = 0.8;

  // Game state
  let state = 'menu'; // 'menu' | 'playing' | 'paused' | 'end'
  let keys = { left: false, right: false, space: false };
  let ball, leftFlipper, rightFlipper, launcher;
  let score = 0, ballsLeft = 3, multiplier = 1;
  let lastTs = 0, raf = 0;
  let easyMode = false;

  // Game objects
  const bumpers = [];
  const targets = [];
  const walls = [];

  function initGame() {
    // Ball
    ball = {
      x: W / 2,
      y: H - 100,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      inPlay: false
    };

    // Flippers
    leftFlipper = {
      x: W / 2 - 80,
      y: H - 60,
      angle: 0,
      targetAngle: 0,
      length: FLIPPER_LENGTH,
      width: FLIPPER_WIDTH
    };

    rightFlipper = {
      x: W / 2 + 80,
      y: H - 60,
      angle: 0,
      targetAngle: 0,
      length: FLIPPER_LENGTH,
      width: FLIPPER_WIDTH
    };

    // Launcher
    launcher = {
      x: W / 2,
      y: H - 30,
      power: 0,
      maxPower: 100
    };

    // Bumpers
    bumpers.length = 0;
    bumpers.push(
      { x: 200, y: 150, radius: 25, score: 100 },
      { x: 720, y: 150, radius: 25, score: 100 },
      { x: 460, y: 200, radius: 20, score: 50 },
      { x: 300, y: 300, radius: 20, score: 50 },
      { x: 620, y: 300, radius: 20, score: 50 }
    );

    // Targets
    targets.length = 0;
    targets.push(
      { x: 150, y: 100, w: 20, h: 60, score: 200 },
      { x: 750, y: 100, w: 20, h: 60, score: 200 },
      { x: 400, y: 120, w: 120, h: 15, score: 150 },
      { x: 300, y: 250, w: 15, h: 40, score: 100 },
      { x: 605, y: 250, w: 15, h: 40, score: 100 }
    );

    // Walls
    walls.length = 0;
    walls.push(
      // Top wall
      { x: 0, y: 0, w: W, h: 20 },
      // Left wall
      { x: 0, y: 0, w: 20, h: H },
      // Right wall
      { x: W - 20, y: 0, w: 20, h: H },
      // Bottom wall (with gap for flippers)
      { x: 0, y: H - 20, w: W / 2 - 100, h: 20 },
      { x: W / 2 + 100, y: H - 20, w: W / 2 - 100, h: 20 },
      // Side walls near flippers
      { x: 0, y: H - 80, w: 100, h: 20 },
      { x: W - 100, y: H - 80, w: 100, h: 20 }
    );

    score = 0;
    ballsLeft = 3;
    multiplier = 1;
    updateHUD();
  }

  function updateHUD() {
    scoreEl.textContent = `Score: ${score.toLocaleString()}`;
    ballsEl.textContent = `Balls: ${ballsLeft}`;
    multiplierEl.textContent = `Multiplier: ${multiplier}x`;
  }

  function addScore(points) {
    score += points * multiplier;
    updateHUD();
  }

  function resetBall() {
    ball.x = W / 2;
    ball.y = H - 100;
    ball.vx = 0;
    ball.vy = 0;
    ball.inPlay = false;
    launcher.power = 0;
  }

  function launchBall() {
    if (ball.inPlay || ballsLeft <= 0) return;

    ball.inPlay = true;
    ball.vy = -launcher.power * 0.3;
    ball.vx = (Math.random() - 0.5) * 2;
    launcher.power = 0;
  }

  function updateFlippers() {
    // Left flipper
    if (keys.left) {
      leftFlipper.targetAngle = -Math.PI / 3;
    } else {
      leftFlipper.targetAngle = Math.PI / 6;
    }
    leftFlipper.angle += (leftFlipper.targetAngle - leftFlipper.angle) * 0.3;

    // Right flipper
    if (keys.right) {
      rightFlipper.targetAngle = Math.PI / 3;
    } else {
      rightFlipper.targetAngle = -Math.PI / 6;
    }
    rightFlipper.angle += (rightFlipper.targetAngle - rightFlipper.angle) * 0.3;
  }

  function updateBall(dt) {
    if (!ball.inPlay) return;

    // Apply gravity
    ball.vy += GRAVITY * (easyMode ? 0.5 : 1);

    // Apply friction
    ball.vx *= FRICTION;
    ball.vy *= FRICTION;

    // Update position
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall collisions
    walls.forEach(wall => {
      if (ball.x - ball.radius < wall.x + wall.w &&
        ball.x + ball.radius > wall.x &&
        ball.y - ball.radius < wall.y + wall.h &&
        ball.y + ball.radius > wall.y) {

        // Determine collision side
        const overlapX = Math.min(ball.x + ball.radius - wall.x, wall.x + wall.w - (ball.x - ball.radius));
        const overlapY = Math.min(ball.y + ball.radius - wall.y, wall.y + wall.h - (ball.y - ball.radius));

        if (overlapX < overlapY) {
          ball.vx *= -BOUNCE;
          ball.x = ball.vx > 0 ? wall.x + wall.w + ball.radius : wall.x - ball.radius;
        } else {
          ball.vy *= -BOUNCE;
          ball.y = ball.vy > 0 ? wall.y + wall.h + ball.radius : wall.y - ball.radius;
        }
      }
    });

    // Bumper collisions
    bumpers.forEach(bumper => {
      const dx = ball.x - bumper.x;
      const dy = ball.y - bumper.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ball.radius + bumper.radius) {
        // Resolve collision
        const angle = Math.atan2(dy, dx);
        const overlap = ball.radius + bumper.radius - distance;
        ball.x += Math.cos(angle) * overlap;
        ball.y += Math.sin(angle) * overlap;

        // Bounce
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        ball.vx = Math.cos(angle) * speed * 1.2;
        ball.vy = Math.sin(angle) * speed * 1.2;

        addScore(bumper.score);
        multiplier = Math.min(multiplier + 0.1, 5);
        updateHUD();
      }
    });

    // Target collisions
    targets.forEach(target => {
      if (ball.x - ball.radius < target.x + target.w &&
        ball.x + ball.radius > target.x &&
        ball.y - ball.radius < target.y + target.h &&
        ball.y + ball.radius > target.y) {

        // Simple bounce
        ball.vy *= -0.8;
        ball.vx += (Math.random() - 0.5) * 2;

        addScore(target.score);
        multiplier = Math.min(multiplier + 0.2, 5);
        updateHUD();
      }
    });

    // Flipper collisions
    [leftFlipper, rightFlipper].forEach(flipper => {
      const tipX = flipper.x + Math.cos(flipper.angle) * flipper.length;
      const tipY = flipper.y + Math.sin(flipper.angle) * flipper.length;

      const dx = ball.x - tipX;
      const dy = ball.y - tipY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ball.radius + flipper.width / 2) {
        const angle = Math.atan2(dy, dx);
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        ball.vx = Math.cos(angle) * speed * 1.5;
        ball.vy = Math.sin(angle) * speed * 1.5;

        addScore(50);
      }
    });

    // Check if ball fell out
    if (ball.y > H) {
      ballsLeft--;
      updateHUD();

      if (ballsLeft <= 0) {
        endGame();
      } else {
        resetBall();
      }
    }
  }

  function update(dt) {
    if (state !== 'playing') return;

    updateFlippers();
    updateBall(dt);

    // Launch ball with space
    if (keys.space && !ball.inPlay) {
      launcher.power = Math.min(launcher.power + 2, launcher.maxPower);
    } else if (!keys.space && launcher.power > 0) {
      launchBall();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, W, H);

    // Draw walls
    ctx.fillStyle = '#1f2937';
    walls.forEach(wall => {
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    });

    // Draw bumpers
    ctx.fillStyle = '#7dd3fc';
    bumpers.forEach(bumper => {
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7dd3fc';
    });

    // Draw targets
    ctx.fillStyle = '#ef4444';
    targets.forEach(target => {
      ctx.fillRect(target.x, target.y, target.w, target.h);
    });

    // Draw flippers
    ctx.fillStyle = '#fbbf24';
    [leftFlipper, rightFlipper].forEach(flipper => {
      ctx.save();
      ctx.translate(flipper.x, flipper.y);
      ctx.rotate(flipper.angle);
      ctx.fillRect(0, -flipper.width / 2, flipper.length, flipper.width);
      ctx.restore();
    });

    // Draw launcher
    if (!ball.inPlay) {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(launcher.x - 10, launcher.y - 5, 20, 10);

      // Power bar
      const powerWidth = (launcher.power / launcher.maxPower) * 100;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(launcher.x - 50, launcher.y - 20, powerWidth, 4);
    }

    // Draw ball
    if (ball.inPlay) {
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw ball in launcher
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function endGame() {
    state = 'end';
    finalScore.textContent = score.toLocaleString();
    endOverlay.classList.remove('hidden');
  }

  function loop(ts) {
    const dt = Math.min(32, ts - lastTs);
    lastTs = ts;
    update(dt);
    draw();
    raf = requestAnimationFrame(loop);
  }

  // Input handling
  const keymap = {
    ArrowLeft: 'left', ArrowRight: 'right',
    a: 'left', A: 'left', d: 'right', D: 'right',
    ' ': 'space'
  };

  addEventListener('keydown', (e) => {
    if (keymap[e.key]) keys[keymap[e.key]] = true;
    if (e.key === 'p' || e.key === 'P') togglePause();
    if (state === 'menu' && (e.key === 'Enter' || e.key === ' ')) startGame();
    if (state === 'end') {
      if (e.key === 'Enter' || e.key === ' ') restart();
      if (e.key === 'm' || e.key === 'M') goMenu();
    }
    if (e.key === 'r' || e.key === 'R') restart();
  });

  addEventListener('keyup', (e) => {
    if (keymap[e.key]) keys[keymap[e.key]] = false;
  });

  // Button event listeners
  startBtn.addEventListener('click', () => { easyMode = false; startGame(); });
  easyBtn.addEventListener('click', () => { easyMode = true; startGame(); });
  playAgainBtn.addEventListener('click', restart);
  menuBtn.addEventListener('click', goMenu);
  resumeBtn.addEventListener('click', resume);
  restartBtn.addEventListener('click', restart);
  mainMenuBtn.addEventListener('click', goMenu);

  function startGame() {
    startOverlay.classList.add('hidden');
    endOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    state = 'playing';
    initGame();
  }

  function restart() {
    endOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    state = 'playing';
    initGame();
  }

  function goMenu() {
    endOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    startOverlay.classList.remove('hidden');
    state = 'menu';
  }

  function resume() {
    pauseOverlay.classList.add('hidden');
    state = 'playing';
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      pauseOverlay.classList.remove('hidden');
    } else if (state === 'paused') {
      resume();
    }
  }

  // Initialize
  initGame();
  raf = requestAnimationFrame(loop);
})();
