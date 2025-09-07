(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const startOverlay = document.getElementById('start');
  const endOverlay = document.getElementById('end');
  const endTitle = document.getElementById('endTitle');
  const endSubtitle = document.getElementById('endSubtitle');
  const finalScore = document.getElementById('finalScore');
  const startBtn = document.getElementById('startBtn');
  const practiceBtn = document.getElementById('slowBtn');
  const playAgainBtn = document.getElementById('playAgain');
  const menuBtn = document.getElementById('menuBtn');

  const W = canvas.width, H = canvas.height;

  // Game constants
  const PADDLE_W = 14, PADDLE_H = 90;
  const BALL_SIZE = 12;
  const NET_W = 4, NET_GAP = 18;
  const TARGET_SCORE = 7;

  // Tunables
  const SPEEDS = {
    normal: { paddle: 8, ai: 7, ball: 6.4, accel: 1.035 },
    slow: { paddle: 7, ai: 5.5, ball: 5.2, accel: 1.03 },
  };

  // State
  let settings = SPEEDS.normal;
  let state = 'menu'; // 'menu' | 'playing' | 'paused' | 'end'
  let keys = { up: false, down: false };
  let player, ai, ball, scores, lastTs = 0, raf = 0;

  function resetRound(dir = Math.random() < 0.5 ? -1 : 1) {
    player.y = H / 2 - PADDLE_H / 2;
    ai.y = H / 2 - PADDLE_H / 2;
    ball.x = W / 2 - BALL_SIZE / 2;
    ball.y = H / 2 - BALL_SIZE / 2;
    const angle = (Math.random() * .6 - .3); // -0.3..0.3 rad offset
    const speed = settings.ball;
    ball.vx = dir * speed * Math.cos(angle);
    ball.vy = speed * Math.sin(angle);
  }

  function resetMatch() {
    player = { x: 24, y: H / 2 - PADDLE_H / 2, w: PADDLE_W, h: PADDLE_H, vy: 0 };
    ai = { x: W - 24 - PADDLE_W, y: H / 2 - PADDLE_H / 2, w: PADDLE_W, h: PADDLE_H, vy: 0 };
    ball = { x: W / 2, y: H / 2, w: BALL_SIZE, h: BALL_SIZE, vx: 0, vy: 0 };
    scores = { left: 0, right: 0 };
    updateScore();
    resetRound();
  }

  function updateScore() { scoreEl.textContent = `${scores.left} — ${scores.right}`; }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function drawCourt() {
    ctx.clearRect(0, 0, W, H);

    // Middle net
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#93c5fd';
    for (let y = 0; y < H; y += NET_GAP) ctx.fillRect(W / 2 - NET_W / 2, y, NET_W, NET_GAP / 2);
    ctx.globalAlpha = 1;

    // Glows under paddles/ball
    ctx.fillStyle = 'rgba(167, 139, 250, 0.08)';
    ctx.fillRect(0, H - 40, W, 40);
  }

  function drawRect(x, y, w, h) {
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function drawBall() { drawRect(ball.x, ball.y, ball.w, ball.h); }
  function drawPaddles() { drawRect(player.x, player.y, player.w, player.h); drawRect(ai.x, ai.y, ai.w, ai.h); }

  function update(dt) {
    if (state !== 'playing') return;

    // Player movement
    const pySpeed = settings.paddle;
    if (keys.up && !keys.down) player.vy = -pySpeed; else if (keys.down && !keys.up) player.vy = pySpeed; else player.vy = 0;
    player.y = clamp(player.y + player.vy, 0, H - player.h);

    // AI movement — proportional controller with capped speed + tiny reaction delay & jitter
    const targetY = ball.y + ball.h / 2 - ai.h / 2;
    const diff = targetY - ai.y;
    const max = settings.ai;
    let step = clamp(diff * 0.12, -max, max);
    // add slight imperfection so it's beatable
    step += (Math.random() - 0.5) * 0.6;
    ai.y = clamp(ai.y + step, 0, H - ai.h);

    // Ball movement
    ball.x += ball.vx; ball.y += ball.vy;

    // Wall collisions
    if (ball.y <= 0 && ball.vy < 0) { ball.y = 0; ball.vy *= -1; }
    if (ball.y + ball.h >= H && ball.vy > 0) { ball.y = H - ball.h; ball.vy *= -1; }

    // Paddle collisions
    if (aabb(ball.x, ball.y, ball.w, ball.h, player.x, player.y, player.w, player.h) && ball.vx < 0) {
      ball.x = player.x + player.w; // resolve
      const rel = (ball.y + ball.h / 2) - (player.y + player.h / 2);
      const norm = rel / (player.h / 2);
      const speed = Math.hypot(ball.vx, ball.vy) * settings.accel;
      const angle = norm * (Math.PI / 3.2); // max ~56°
      ball.vx = Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
    }
    if (aabb(ball.x, ball.y, ball.w, ball.h, ai.x, ai.y, ai.w, ai.h) && ball.vx > 0) {
      ball.x = ai.x - ball.w;
      const rel = (ball.y + ball.h / 2) - (ai.y + ai.h / 2);
      const norm = rel / (ai.h / 2);
      const speed = Math.hypot(ball.vx, ball.vy) * settings.accel;
      const angle = norm * (Math.PI / 3.2);
      ball.vx = -Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
    }

    // Scoring
    if (ball.x + ball.w < 0) { // AI scores
      scores.right++; updateScore();
      if (scores.right >= TARGET_SCORE) return endMatch(false);
      resetRound(1);
    } else if (ball.x > W) { // Player scores
      scores.left++; updateScore();
      if (scores.left >= TARGET_SCORE) return endMatch(true);
      resetRound(-1);
    }
  }

  function endMatch(playerWon) {
    state = 'end';
    finalScore.textContent = `${scores.left}\u2013${scores.right}`;
    endTitle.textContent = playerWon ? 'You Win! 🎉' : 'You Lose!';
    endOverlay.classList.toggle('win', playerWon);
    endOverlay.classList.toggle('lose', !playerWon);
    endOverlay.classList.remove('hidden');
  }

  function loop(ts) {
    const dt = Math.min(32, ts - lastTs); lastTs = ts;
    update(dt);
    drawCourt();
    drawPaddles();
    drawBall();
    raf = requestAnimationFrame(loop);
  }

  // Input
  const keymap = {
    ArrowUp: 'up', ArrowDown: 'down',
    w: 'up', W: 'up', s: 'down', S: 'down'
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
  addEventListener('keyup', (e) => { if (keymap[e.key]) keys[keymap[e.key]] = false; });

  // Buttons
  startBtn.addEventListener('click', () => { settings = SPEEDS.normal; startGame(); });
  practiceBtn.addEventListener('click', () => { settings = SPEEDS.slow; startGame(); });
  playAgainBtn.addEventListener('click', restart);
  menuBtn.addEventListener('click', goMenu);

  function startGame() {
    startOverlay.classList.add('hidden');
    endOverlay.classList.add('hidden');
    state = 'playing';
    resetMatch();
  }
  function restart() {
    endOverlay.classList.add('hidden');
    state = 'playing';
    resetMatch();
  }
  function goMenu() {
    endOverlay.classList.add('hidden');
    startOverlay.classList.remove('hidden');
    state = 'menu';
  }

  function togglePause() {
    if (state === 'playing') { state = 'paused'; startOverlay.querySelector('h1').textContent = 'Paused'; startOverlay.querySelector('p').textContent = 'Press Start or Enter to resume.'; startOverlay.classList.remove('hidden'); }
    else if (state === 'paused') { startOverlay.classList.add('hidden'); state = 'playing'; }
  }

  // Boot
  resetMatch();
  raf = requestAnimationFrame(loop);
})();
