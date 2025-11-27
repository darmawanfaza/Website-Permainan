// ========== NAVIGASI SCREEN ==========
document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");
  const menuScreen = document.getElementById("menu-screen");

  function showScreen(id) {
    screens.forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) {
      target.classList.add("active");
    }
  }

  // Klik kartu game -> pindah screen
  document.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      const targetId = card.getAttribute("data-target");
      if (!targetId) return;
      showScreen(targetId);

      // Jika ingin inisialisasi khusus saat masuk game, bisa panggil di sini
      if (targetId === "tic-tac-toe-screen") initTicTacToe();
    });
  });

  // Tombol Back
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showScreen("menu-screen");
    });
  });

  // Inisialisasi game
  initTicTacToe();
  initSnake();
  initFlappy();
  initSolitaire();
  initAirHockey();
});

// ========== TIC TAC TOE ==========
let tttBoard = [];
let tttCurrentPlayer = "X";
let tttGameOver = false;

function initTicTacToe() {
  const boardEl = document.getElementById("ttt-board");
  const statusEl = document.getElementById("ttt-status");
  const restartBtn = document.getElementById("ttt-restart");

  if (!boardEl || !statusEl || !restartBtn) return;

  // Hanya buat cell sekali saja
  if (!boardEl.hasChildNodes()) {
    tttBoard = Array(9).fill("");
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("button");
      cell.className = "ttt-cell";
      cell.dataset.index = i;
      cell.addEventListener("click", handleTicTacToeClick);
      boardEl.appendChild(cell);
    }
  }

  restartBtn.onclick = resetTicTacToe;
  resetTicTacToe();
}

function resetTicTacToe() {
  tttBoard = Array(9).fill("");
  tttCurrentPlayer = "X";
  tttGameOver = false;

  document.querySelectorAll(".ttt-cell").forEach((cell) => {
    cell.textContent = "";
  });

  const statusEl = document.getElementById("ttt-status");
  if (statusEl) statusEl.textContent = "Giliran: X";
}

function handleTicTacToeClick(e) {
  const index = parseInt(e.currentTarget.dataset.index, 10);
  if (tttGameOver || tttBoard[index] !== "") return;

  tttBoard[index] = tttCurrentPlayer;
  e.currentTarget.textContent = tttCurrentPlayer;

  if (checkTicTacToeWin(tttCurrentPlayer)) {
    const statusEl = document.getElementById("ttt-status");
    if (statusEl) statusEl.textContent = `Pemenang: ${tttCurrentPlayer}!`;
    tttGameOver = true;
    return;
  }

  if (tttBoard.every((c) => c !== "")) {
    const statusEl = document.getElementById("ttt-status");
    if (statusEl) statusEl.textContent = "Seri!";
    tttGameOver = true;
    return;
  }

  tttCurrentPlayer = tttCurrentPlayer === "X" ? "O" : "X";
  const statusEl = document.getElementById("ttt-status");
  if (statusEl) statusEl.textContent = `Giliran: ${tttCurrentPlayer}`;
}

function checkTicTacToeWin(player) {
  const b = tttBoard;
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  return lines.some((line) => line.every((i) => b[i] === player));
}

// ========== SNAKE ==========
let snakeCanvas,
  snakeCtx,
  snakeInterval = null,
  snake,
  snakeDir,
  snakeFood,
  snakeScore = 0;

const SNAKE_TILE = 20;
const SNAKE_SPEED_MS = 120;

function initSnake() {
  snakeCanvas = document.getElementById("snake-canvas");
  if (!snakeCanvas) return;
  snakeCtx = snakeCanvas.getContext("2d");

  const startBtn = document.getElementById("snake-start");
  if (startBtn) {
    startBtn.addEventListener("click", startSnakeGame);
  }

  document.addEventListener("keydown", handleSnakeKey);
  resetSnake();
  drawSnake();
}

function resetSnake() {
  const cols = Math.floor(snakeCanvas.width / SNAKE_TILE);
  const rows = Math.floor(snakeCanvas.height / SNAKE_TILE);
  const startX = Math.floor(cols / 2);
  const startY = Math.floor(rows / 2);

  snake = [{ x: startX, y: startY }];
  snakeDir = { x: 1, y: 0 };
  snakeScore = 0;
  updateSnakeScore();
  spawnSnakeFood();
}

function startSnakeGame() {
  resetSnake();
  if (snakeInterval) clearInterval(snakeInterval);
  snakeInterval = setInterval(updateSnake, SNAKE_SPEED_MS);
}

function handleSnakeKey(e) {
  if (!snake) return;
  const key = e.key.toLowerCase();
  if ((key === "arrowup" || key === "w") && snakeDir.y !== 1) {
    snakeDir = { x: 0, y: -1 };
  } else if ((key === "arrowdown" || key === "s") && snakeDir.y !== -1) {
    snakeDir = { x: 0, y: 1 };
  } else if ((key === "arrowleft" || key === "a") && snakeDir.x !== 1) {
    snakeDir = { x: -1, y: 0 };
  } else if ((key === "arrowright" || key === "d") && snakeDir.x !== -1) {
    snakeDir = { x: 1, y: 0 };
  }
}

function spawnSnakeFood() {
  const cols = Math.floor(snakeCanvas.width / SNAKE_TILE);
  const rows = Math.floor(snakeCanvas.height / SNAKE_TILE);
  let x, y;
  do {
    x = Math.floor(Math.random() * cols);
    y = Math.floor(Math.random() * rows);
  } while (snake.some((seg) => seg.x === x && seg.y === y));
  snakeFood = { x, y };
}

function updateSnake() {
  const cols = Math.floor(snakeCanvas.width / SNAKE_TILE);
  const rows = Math.floor(snakeCanvas.height / SNAKE_TILE);

  const head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };

  // Tabrak dinding
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    endSnakeGame();
    return;
  }

  // Tabrak badan
  if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
    endSnakeGame();
    return;
  }

  snake.unshift(head);

  // Makan
  if (head.x === snakeFood.x && head.y === snakeFood.y) {
    snakeScore += 10;
    updateSnakeScore();
    spawnSnakeFood();
  } else {
    snake.pop();
  }

  drawSnake();
}

function drawSnake() {
  if (!snakeCtx) return;
  snakeCtx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);

  // Snake
  snakeCtx.fillStyle = "#38bdf8";
  snake.forEach((seg, i) => {
    snakeCtx.globalAlpha = 0.7 + (snake.length - i) / (snake.length * 4);
    snakeCtx.fillRect(
      seg.x * SNAKE_TILE,
      seg.y * SNAKE_TILE,
      SNAKE_TILE - 2,
      SNAKE_TILE - 2
    );
  });
  snakeCtx.globalAlpha = 1;

  // Food
  if (snakeFood) {
    snakeCtx.fillStyle = "#f97373";
    snakeCtx.beginPath();
    snakeCtx.arc(
      snakeFood.x * SNAKE_TILE + SNAKE_TILE / 2,
      snakeFood.y * SNAKE_TILE + SNAKE_TILE / 2,
      SNAKE_TILE / 2.5,
      0,
      Math.PI * 2
    );
    snakeCtx.fill();
  }
}

function endSnakeGame() {
  if (snakeInterval) clearInterval(snakeInterval);
  snakeInterval = null;
  alert("Game over! Skor kamu: " + snakeScore);
}

function updateSnakeScore() {
  const scoreEl = document.getElementById("snake-score");
  if (scoreEl) scoreEl.textContent = snakeScore;
}

// ========== FLAPPY BIRD ==========
let flappyCanvas,
  flappyCtx,
  flappyBird,
  flappyPipes,
  flappyScore,
  flappyLoopId = null;

const GRAVITY = 0.5;
const FLAP_FORCE = -8;
const PIPE_GAP = 130;
const PIPE_WIDTH = 60;
const PIPE_INTERVAL = 1600; // ms
let lastPipeTime = 0;

function initFlappy() {
  flappyCanvas = document.getElementById("flappy-canvas");
  if (!flappyCanvas) return;
  flappyCtx = flappyCanvas.getContext("2d");

  const startBtn = document.getElementById("flappy-start");
  if (startBtn) startBtn.addEventListener("click", startFlappy);

  flappyCanvas.addEventListener("mousedown", flap);
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      flap();
    }
  });

  resetFlappy();
  renderFlappy(0);
}

function resetFlappy() {
  flappyBird = {
    x: 80,
    y: flappyCanvas.height / 2,
    vy: 0,
    r: 14,
  };
  flappyPipes = [];
  flappyScore = 0;
  lastPipeTime = 0;
  updateFlappyScore();
}

function startFlappy() {
  resetFlappy();
  if (flappyLoopId) cancelAnimationFrame(flappyLoopId);
  let lastTime = performance.now();

  function loop(time) {
    const delta = time - lastTime;
    lastTime = time;
    updateFlappy(delta);
    renderFlappy(delta);
    flappyLoopId = requestAnimationFrame(loop);
  }

  flappyLoopId = requestAnimationFrame(loop);
}

function flap() {
  if (!flappyBird) return;
  flappyBird.vy = FLAP_FORCE;
}

function updateFlappy(delta) {
  // Bird physics
  flappyBird.vy += GRAVITY;
  flappyBird.y += flappyBird.vy;

  // Spawn pipes
  if (delta + lastPipeTime >= PIPE_INTERVAL || flappyPipes.length === 0) {
    const gapY =
      60 + Math.random() * (flappyCanvas.height - PIPE_GAP - 120);
    flappyPipes.push({
      x: flappyCanvas.width,
      gapY,
      passed: false,
    });
    lastPipeTime = 0;
  } else {
    lastPipeTime += delta;
  }

  // Move pipes
  const speed = 2.5;
  flappyPipes.forEach((pipe) => {
    pipe.x -= speed;
  });

  // Hapus pipes di luar layar
  flappyPipes = flappyPipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0);

  // Cek skor & tabrakan
  for (const pipe of flappyPipes) {
    // Nambah skor
    if (!pipe.passed && flappyBird.x > pipe.x + PIPE_WIDTH) {
      pipe.passed = true;
      flappyScore += 1;
      updateFlappyScore();
    }

    // Cek tabrakan
    if (
      flappyBird.x + flappyBird.r > pipe.x &&
      flappyBird.x - flappyBird.r < pipe.x + PIPE_WIDTH
    ) {
      if (
        flappyBird.y - flappyBird.r < pipe.gapY ||
        flappyBird.y + flappyBird.r > pipe.gapY + PIPE_GAP
      ) {
        endFlappy();
        return;
      }
    }
  }

  // Tabrak tanah atau langit
  if (
    flappyBird.y + flappyBird.r > flappyCanvas.height ||
    flappyBird.y - flappyBird.r < 0
  ) {
    endFlappy();
  }
}

function renderFlappy() {
  if (!flappyCtx) return;
  flappyCtx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  // Latar belakang sederhana
  flappyCtx.fillStyle = "#020617";
  flappyCtx.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  // Pipes
  flappyCtx.fillStyle = "#22c55e";
  flappyPipes.forEach((pipe) => {
    // Atas
    flappyCtx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
    // Bawah
    flappyCtx.fillRect(
      pipe.x,
      pipe.gapY + PIPE_GAP,
      PIPE_WIDTH,
      flappyCanvas.height - pipe.gapY - PIPE_GAP
    );
  });

  // Bird
  flappyCtx.fillStyle = "#facc15";
  flappyCtx.beginPath();
  flappyCtx.arc(flappyBird.x, flappyBird.y, flappyBird.r, 0, Math.PI * 2);
  flappyCtx.fill();
}

function endFlappy() {
  if (flappyLoopId) cancelAnimationFrame(flappyLoopId);
  flappyLoopId = null;
  alert("Game over! Skor kamu: " + flappyScore);
}

function updateFlappyScore() {
  const el = document.getElementById("flappy-score");
  if (el) el.textContent = flappyScore;
}

// ========== SOLITAIRE SEDERHANA (FOUNDATION-ONLY) ==========
let solitaireDeck = [];
let solitaireFoundations = [[], [], [], []];

function initSolitaire() {
  const newBtn = document.getElementById("solitaire-new");
  if (newBtn) {
    newBtn.addEventListener("click", setupSolitaire);
  }
  setupSolitaire();
}

function setupSolitaire() {
  const tableauEl = document.getElementById("solitaire-tableau");
  const statusEl = document.getElementById("solitaire-status");
  if (!tableauEl) return;

  tableauEl.innerHTML = "";
  solitaireFoundations = [[], [], [], []];

  // Buat deck
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  solitaireDeck = [];

  suits.forEach((suit) => {
    ranks.forEach((rank, idx) => {
      const value = idx + 1; // A =1, K=13
      solitaireDeck.push({ suit, rank, value });
    });
  });

  // Shuffle
  for (let i = solitaireDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [solitaireDeck[i], solitaireDeck[j]] = [solitaireDeck[j], solitaireDeck[i]];
  }

  // Semua kartu ke tableau
  solitaireDeck.forEach((card, index) => {
    const cardEl = createCardElement(card, index);
    tableauEl.appendChild(cardEl);
  });

  // Kosongkan foundation visual
  document.querySelectorAll(".foundation").forEach((f) => (f.textContent = ""));
  if (statusEl) {
    statusEl.textContent =
      "Aturan: Klik kartu di tableau untuk memindahkannya ke foundation jika urut (A → K, satu jenis kartu).";
  }
}

function createCardElement(card, index) {
  const el = document.createElement("div");
  el.className = "card";
  el.dataset.index = index;
  el.dataset.suit = card.suit;
  el.dataset.rank = card.rank;
  el.dataset.value = card.value;

  const isRed = card.suit === "♥" || card.suit === "♦";
  el.classList.add(isRed ? "red" : "black");

  el.innerHTML = `
    <span class="card-rank-top">${card.rank}</span>
    <span class="card-suit-center">${card.suit}</span>
    <span class="card-rank-bottom">${card.rank}</span>
  `;

  el.addEventListener("click", handleSolitaireCardClick);
  return el;
}

function handleSolitaireCardClick(e) {
  const cardEl = e.currentTarget;
  const value = parseInt(cardEl.dataset.value, 10);
  const suit = cardEl.dataset.suit;

  // Cari foundation yang cocok
  let moved = false;
  for (let i = 0; i < solitaireFoundations.length; i++) {
    const pile = solitaireFoundations[i];
    if (pile.length === 0) {
      // Hanya As yang boleh pindah pertama
      if (value === 1) {
        pile.push({ value, suit });
        updateFoundationView(i, cardEl);
        moved = true;
        break;
      }
    } else {
      const top = pile[pile.length - 1];
      if (top.suit === suit && value === top.value + 1) {
        pile.push({ value, suit });
        updateFoundationView(i, cardEl);
        moved = true;
        break;
      }
    }
  }

  if (moved) {
    cardEl.remove();
    checkSolitaireWin();
  }
}

function updateFoundationView(index, cardEl) {
  const foundations = document.querySelectorAll(".foundation");
  const f = foundations[index];
  if (!f) return;
  const rank = cardEl.dataset.rank;
  const suit = cardEl.dataset.suit;
  f.textContent = rank + suit;
}

function checkSolitaireWin() {
  const tableauEl = document.getElementById("solitaire-tableau");
  const statusEl = document.getElementById("solitaire-status");
  if (tableauEl && tableauEl.childElementCount === 0) {
    if (statusEl) {
      statusEl.textContent =
        "Selamat! Semua kartu sudah berpindah ke foundation. 🎉";
    }
  }
}

// ========== AIR HOCKEY SEDERHANA ==========
let airCanvas,
  airCtx,
  airLoopId = null;

let puck,
  playerPaddle,
  aiPaddle,
  airPlayerScore = 0,
  airAiScore = 0;

function initAirHockey() {
  airCanvas = document.getElementById("airhockey-canvas");
  if (!airCanvas) return;
  airCtx = airCanvas.getContext("2d");

  const startBtn = document.getElementById("airhockey-start");
  if (startBtn) startBtn.addEventListener("click", startAirHockey);

  airCanvas.addEventListener("mousemove", handleAirMouseMove);

  resetAirHockey();
  renderAirHockey();
}

function resetAirHockey() {
  const w = airCanvas.width;
  const h = airCanvas.height;

  puck = {
    x: w / 2,
    y: h / 2,
    vx: (Math.random() > 0.5 ? 2 : -2),
    vy: 2,
    r: 10,
  };

  playerPaddle = {
    x: w / 2,
    y: h - 30,
    r: 20,
  };

  aiPaddle = {
    x: w / 2,
    y: 30,
    r: 20,
  };
}

function startAirHockey() {
  resetAirHockey();
  airPlayerScore = 0;
  airAiScore = 0;
  updateAirHockeyScore();

  if (airLoopId) cancelAnimationFrame(airLoopId);

  let lastTime = performance.now();
  function loop(time) {
    const delta = time - lastTime;
    lastTime = time;
    updateAirHockey(delta);
    renderAirHockey();
    airLoopId = requestAnimationFrame(loop);
  }

  airLoopId = requestAnimationFrame(loop);
}

function handleAirMouseMove(e) {
  if (!airCanvas || !playerPaddle) return;
  const rect = airCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  playerPaddle.x = Math.max(
    playerPaddle.r,
    Math.min(airCanvas.width - playerPaddle.r, x)
  );
}

function updateAirHockey() {
  const w = airCanvas.width;
  const h = airCanvas.height;

  // Pindahkan puck
  puck.x += puck.vx;
  puck.y += puck.vy;

  // Pantul dengan dinding samping
  if (puck.x - puck.r < 0 || puck.x + puck.r > w) {
    puck.vx *= -1;
  }

  // AI mengikuti puck dengan gerakan halus
  const aiSpeed = 2.1;
  if (puck.x < aiPaddle.x - 5) {
    aiPaddle.x -= aiSpeed;
  } else if (puck.x > aiPaddle.x + 5) {
    aiPaddle.x += aiSpeed;
  }
  aiPaddle.x = Math.max(aiPaddle.r, Math.min(w - aiPaddle.r, aiPaddle.x));

  // Tabrakan dengan paddle (player)
  handlePaddleCollision(playerPaddle, true);
  // Tabrakan dengan paddle (AI)
  handlePaddleCollision(aiPaddle, false);

  // Goal cek (atas & bawah)
  if (puck.y - puck.r <= 0) {
    // Goal untuk player
    airPlayerScore++;
    updateAirHockeyScore();
    resetAirHockey();
  } else if (puck.y + puck.r >= h) {
    // Goal untuk AI
    airAiScore++;
    updateAirHockeyScore();
    resetAirHockey();
  }
}

function handlePaddleCollision(paddle, isPlayer) {
  const dx = puck.x - paddle.x;
  const dy = puck.y - paddle.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = puck.r + paddle.r;

  if (dist < minDist) {
    // Normalisasi
    const nx = dx / (dist || 1);
    const ny = dy / (dist || 1);

    // Geser puck keluar dari paddle
    puck.x = paddle.x + nx * minDist;
    puck.y = paddle.y + ny * minDist;

    // Refleksi kecepatan
    const speed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy) || 3;
    // Jika player, arahkan turun; jika AI, arahkan naik
    const dirY = isPlayer ? -1 : 1;
    puck.vx = nx * speed * 1.05;
    puck.vy = ny * speed * 1.05;
    puck.vy = Math.abs(puck.vy) * dirY;
  }
}

function renderAirHockey() {
  if (!airCtx) return;
  const w = airCanvas.width;
  const h = airCanvas.height;

  // Background
  airCtx.clearRect(0, 0, w, h);
  airCtx.fillStyle = "#020617";
  airCtx.fillRect(0, 0, w, h);

  // Garis tengah
  airCtx.strokeStyle = "rgba(148, 163, 184, 0.5)";
  airCtx.setLineDash([8, 8]);
  airCtx.beginPath();
  airCtx.moveTo(0, h / 2);
  airCtx.lineTo(w, h / 2);
  airCtx.stroke();
  airCtx.setLineDash([]);

  // Area gawang (atas & bawah)
  airCtx.strokeStyle = "rgba(56, 189, 248, 0.5)";
  airCtx.lineWidth = 2;
  airCtx.strokeRect(w / 3, 2, w / 3, 10); // atas
  airCtx.strokeRect(w / 3, h - 12, w / 3, 10); // bawah

  // Puck
  airCtx.fillStyle = "#e5e7eb";
  airCtx.beginPath();
  airCtx.arc(puck.x, puck.y, puck.r, 0, Math.PI * 2);
  airCtx.fill();

  // Paddle player
  airCtx.fillStyle = "#38bdf8";
  airCtx.beginPath();
  airCtx.arc(playerPaddle.x, playerPaddle.y, playerPaddle.r, 0, Math.PI * 2);
  airCtx.fill();

  // Paddle AI
  airCtx.fillStyle = "#f97373";
  airCtx.beginPath();
  airCtx.arc(aiPaddle.x, aiPaddle.y, aiPaddle.r, 0, Math.PI * 2);
  airCtx.fill();
}

function updateAirHockeyScore() {
  const pEl = document.getElementById("airhockey-player-score");
  const aiEl = document.getElementById("airhockey-ai-score");
  if (pEl) pEl.textContent = airPlayerScore;
  if (aiEl) aiEl.textContent = airAiScore;
}
