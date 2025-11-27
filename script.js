// ========== SIMPLE SOUND ENGINE (Web Audio) ==========
let audioCtx = null;

function playSound(type = "click") {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    let freq = 440;
    switch (type) {
      case "click":
        freq = 440;
        break;
      case "positive":
        freq = 880;
        break;
      case "negative":
        freq = 220;
        break;
      case "score":
        freq = 660;
        break;
      case "flap":
        freq = 520;
        break;
      case "hit":
        freq = 400;
        break;
      case "move":
        freq = 500;
        break;
      default:
        freq = 440;
    }

    osc.frequency.value = freq;
    osc.type = "sine";

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    // ignore audio error
  }
}

// ========== NAVIGASI SCREEN ==========
document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");

  function showScreen(id) {
    screens.forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) {
      target.classList.add("active");
    }
  }

  // Klik kartu game -> pindah screen
  document.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", () => {
      const targetId = card.getAttribute("data-target");
      if (!targetId) return;
      playSound("click");
      showScreen(targetId);

      if (targetId === "tic-tac-toe-screen") initTicTacToe();
    });
  });

  // Tombol Back
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      playSound("click");
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

  restartBtn.onclick = () => {
    playSound("click");
    resetTicTacToe();
  };
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
  playSound("click");

  if (checkTicTacToeWin(tttCurrentPlayer)) {
    const statusEl = document.getElementById("ttt-status");
    if (statusEl) statusEl.textContent = `Pemenang: ${tttCurrentPlayer}!`;
    tttGameOver = true;
    playSound("positive");
    return;
  }

  if (tttBoard.every((c) => c !== "")) {
    const statusEl = document.getElementById("ttt-status");
    if (statusEl) statusEl.textContent = "Seri!";
    tttGameOver = true;
    playSound("negative");
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
    startBtn.addEventListener("click", () => {
      play
