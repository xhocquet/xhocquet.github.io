(function () {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const linesEl = document.getElementById('lines');
  const levelEl = document.getElementById('level');
  const nextEl = document.getElementById('next');
  const startOverlay = document.getElementById('start');
  const endOverlay = document.getElementById('end');
  const pauseOverlay = document.getElementById('pause');
  const startBtn = document.getElementById('startBtn');
  const easyBtn = document.getElementById('easyBtn');
  const playAgainBtn = document.getElementById('playAgain');
  const menuBtn = document.getElementById('menuBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const mainMenuBtn = document.getElementById('mainMenuBtn');

  // Game constants
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  const BLOCK_SIZE = 20;
  const BOARD_X = (canvas.width - BOARD_WIDTH * BLOCK_SIZE) / 2;
  const BOARD_Y = (canvas.height - BOARD_HEIGHT * BLOCK_SIZE) / 2;

  // Tetris pieces
  const PIECES = {
    I: {
      shape: [
        [1, 1, 1, 1]
      ],
      color: '#00f5ff'
    },
    O: {
      shape: [
        [1, 1],
        [1, 1]
      ],
      color: '#ffff00'
    },
    T: {
      shape: [
        [0, 1, 0],
        [1, 1, 1]
      ],
      color: '#a000f0'
    },
    S: {
      shape: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      color: '#00f000'
    },
    Z: {
      shape: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      color: '#f00000'
    },
    J: {
      shape: [
        [1, 0, 0],
        [1, 1, 1]
      ],
      color: '#0000f0'
    },
    L: {
      shape: [
        [0, 0, 1],
        [1, 1, 1]
      ],
      color: '#ff7f00'
    }
  };

  const PIECE_NAMES = Object.keys(PIECES);

  // Game state
  let gameState = {
    board: [],
    currentPiece: null,
    nextPiece: null,
    currentX: 0,
    currentY: 0,
    currentRotation: 0,
    score: 0,
    lines: 0,
    level: 1,
    dropTime: 0,
    dropInterval: 1000,
    gameRunning: false,
    gamePaused: false,
    easyMode: false
  };

  // Initialize game board
  function initBoard() {
    gameState.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
  }

  // Get random piece
  function getRandomPiece() {
    const pieceName = PIECE_NAMES[Math.floor(Math.random() * PIECE_NAMES.length)];
    return {
      name: pieceName,
      ...PIECES[pieceName]
    };
  }

  // Rotate piece
  function rotatePiece(piece, rotation) {
    let shape = piece.shape;

    // Apply rotation multiple times based on rotation count
    for (let r = 0; r < rotation; r++) {
      const rows = shape.length;
      const cols = shape[0].length;
      const rotated = Array(cols).fill().map(() => Array(rows).fill(0));

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          rotated[j][rows - 1 - i] = shape[i][j];
        }
      }

      shape = rotated;
    }

    return shape;
  }

  // Check if piece can be placed
  function canPlacePiece(piece, x, y, rotation) {
    const shape = rotation === 0 ? piece.shape : rotatePiece(piece, rotation);

    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const newX = x + px;
          const newY = y + py;

          if (newX < 0 || newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && gameState.board[newY][newX])) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Place piece on board
  function placePiece(piece, x, y, rotation) {
    const shape = rotation === 0 ? piece.shape : rotatePiece(piece, rotation);

    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const newX = x + px;
          const newY = y + py;
          if (newY >= 0) {
            gameState.board[newY][newX] = piece.color;
          }
        }
      }
    }
  }

  // Spawn new piece
  function spawnPiece() {
    gameState.currentPiece = gameState.nextPiece || getRandomPiece();
    gameState.nextPiece = getRandomPiece();
    gameState.currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(gameState.currentPiece.shape[0].length / 2);
    gameState.currentY = 0;
    gameState.currentRotation = 0;

    if (!canPlacePiece(gameState.currentPiece, gameState.currentX, gameState.currentY, 0)) {
      gameOver();
    }
  }

  // Move piece
  function movePiece(dx, dy) {
    const newX = gameState.currentX + dx;
    const newY = gameState.currentY + dy;

    if (canPlacePiece(gameState.currentPiece, newX, newY, gameState.currentRotation)) {
      gameState.currentX = newX;
      gameState.currentY = newY;
      return true;
    }
    return false;
  }

  // Rotate current piece
  function rotateCurrentPiece() {
    const newRotation = (gameState.currentRotation + 1) % 4;

    if (canPlacePiece(gameState.currentPiece, gameState.currentX, gameState.currentY, newRotation)) {
      gameState.currentRotation = newRotation;
    }
  }

  // Hard drop
  function hardDrop() {
    while (movePiece(0, 1)) {
      gameState.score += 2;
    }
    lockPiece();
  }

  // Lock piece
  function lockPiece() {
    placePiece(gameState.currentPiece, gameState.currentX, gameState.currentY, gameState.currentRotation);
    clearLines();
    spawnPiece();
  }

  // Clear completed lines
  function clearLines() {
    let linesCleared = 0;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (gameState.board[y].every(cell => cell !== 0)) {
        gameState.board.splice(y, 1);
        gameState.board.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++; // Check the same line again
      }
    }

    if (linesCleared > 0) {
      gameState.lines += linesCleared;
      gameState.score += linesCleared * 100 * gameState.level;

      // Level up every 10 lines
      const newLevel = Math.floor(gameState.lines / 10) + 1;
      if (newLevel > gameState.level) {
        gameState.level = newLevel;
        gameState.dropInterval = Math.max(50, 1000 - (gameState.level - 1) * 50);
      }

      updateUI();
    }
  }

  // Update UI
  function updateUI() {
    scoreEl.textContent = `Score: ${gameState.score}`;
    linesEl.textContent = `Lines: ${gameState.lines}`;
    levelEl.textContent = `Level: ${gameState.level}`;

    // Draw next piece
    nextEl.innerHTML = 'Next:';
    const nextCanvas = document.createElement('canvas');
    nextCanvas.className = 'next-piece';
    nextCanvas.width = 60;
    nextCanvas.height = 60;
    nextEl.appendChild(nextCanvas);

    if (gameState.nextPiece) {
      const nextCtx = nextCanvas.getContext('2d');
      nextCtx.clearRect(0, 0, 60, 60);
      drawPiece(nextCtx, gameState.nextPiece, 0, 0, 0, 15);
    }
  }

  // Draw piece
  function drawPiece(ctx, piece, x, y, rotation, blockSize = BLOCK_SIZE) {
    const shape = rotation === 0 ? piece.shape : rotatePiece(piece, rotation);

    ctx.fillStyle = piece.color;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const drawX = x + px * blockSize;
          const drawY = y + py * blockSize;

          ctx.fillRect(drawX, drawY, blockSize, blockSize);
          ctx.strokeRect(drawX, drawY, blockSize, blockSize);
        }
      }
    }
  }

  // Draw ghost piece
  function drawGhostPiece() {
    let ghostY = gameState.currentY;
    while (canPlacePiece(gameState.currentPiece, gameState.currentX, ghostY + 1, gameState.currentRotation)) {
      ghostY++;
    }

    ctx.save();
    ctx.globalAlpha = 0.3;
    drawPiece(ctx, gameState.currentPiece,
      BOARD_X + gameState.currentX * BLOCK_SIZE,
      BOARD_Y + ghostY * BLOCK_SIZE,
      gameState.currentRotation);
    ctx.restore();
  }

  // Draw board
  function drawBoard() {
    // Clear canvas
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(BOARD_X, BOARD_Y, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

    // Draw board border
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.strokeRect(BOARD_X, BOARD_Y, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

    // Draw placed pieces
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (gameState.board[y][x]) {
          ctx.fillStyle = gameState.board[y][x];
          ctx.fillRect(
            BOARD_X + x * BLOCK_SIZE,
            BOARD_Y + y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            BOARD_X + x * BLOCK_SIZE,
            BOARD_Y + y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      }
    }

    // Draw current piece
    if (gameState.currentPiece) {
      drawGhostPiece();
      drawPiece(ctx, gameState.currentPiece,
        BOARD_X + gameState.currentX * BLOCK_SIZE,
        BOARD_Y + gameState.currentY * BLOCK_SIZE,
        gameState.currentRotation);
    }
  }

  // Game over
  function gameOver() {
    gameState.gameRunning = false;
    document.getElementById('finalScore').textContent = gameState.score;
    endOverlay.classList.remove('hidden');
  }

  // Start game
  function startGame() {
    initBoard();
    gameState.score = 0;
    gameState.lines = 0;
    gameState.level = 1;
    gameState.dropInterval = 1000;
    gameState.gameRunning = true;
    gameState.gamePaused = false;
    gameState.easyMode = false;

    spawnPiece();
    updateUI();
    startOverlay.classList.add('hidden');
    endOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
  }

  // Easy mode
  function startEasyMode() {
    startGame();
    gameState.easyMode = true;
    gameState.dropInterval = 2000;
  }

  // Pause game
  function pauseGame() {
    if (gameState.gameRunning && !gameState.gamePaused) {
      gameState.gamePaused = true;
      pauseOverlay.classList.remove('hidden');
    }
  }

  // Resume game
  function resumeGame() {
    if (gameState.gamePaused) {
      gameState.gamePaused = false;
      pauseOverlay.classList.add('hidden');
    }
  }

  // Game loop
  function gameLoop(timestamp) {
    if (gameState.gameRunning && !gameState.gamePaused) {
      if (timestamp - gameState.dropTime > gameState.dropInterval) {
        if (!movePiece(0, 1)) {
          lockPiece();
        }
        gameState.dropTime = timestamp;
      }

      drawBoard();
    }

    requestAnimationFrame(gameLoop);
  }

  // Event listeners
  startBtn.addEventListener('click', startGame);
  easyBtn.addEventListener('click', startEasyMode);
  playAgainBtn.addEventListener('click', startGame);
  menuBtn.addEventListener('click', () => {
    endOverlay.classList.add('hidden');
    startOverlay.classList.remove('hidden');
  });
  resumeBtn.addEventListener('click', resumeGame);
  restartBtn.addEventListener('click', startGame);
  mainMenuBtn.addEventListener('click', () => {
    pauseOverlay.classList.add('hidden');
    startOverlay.classList.remove('hidden');
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!gameState.gameRunning || gameState.gamePaused) {
      if (e.key === 'p' || e.key === 'P') {
        if (gameState.gameRunning) {
          pauseGame();
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        startGame();
      }
      if (e.key === 'Enter' && endOverlay.classList.contains('hidden')) {
        startGame();
      }
      if (e.key === 'm' || e.key === 'M') {
        if (!endOverlay.classList.contains('hidden')) {
          endOverlay.classList.add('hidden');
          startOverlay.classList.remove('hidden');
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        movePiece(-1, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        movePiece(1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (movePiece(0, 1)) {
          gameState.score += 1;
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        rotateCurrentPiece();
        break;
      case ' ':
        e.preventDefault();
        hardDrop();
        break;
      case 'p':
      case 'P':
        pauseGame();
        break;
      case 'r':
      case 'R':
        startGame();
        break;
    }
  });

  // Start game loop
  requestAnimationFrame(gameLoop);
})();
