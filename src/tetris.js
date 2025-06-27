// Tetris game logic and rendering in vanilla JS
// This file will be loaded in index.html and used by main.jsx

const TETRIS_ROWS = 20;
const TETRIS_COLS = 10;
const BLOCK_SIZE = 30;
const COLORS = [
  '', '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
];
const SHAPES = [
  [],
  [[1,1,1,1]], // I
  [[2,2],[2,2]], // O
  [[0,3,0],[3,3,3]], // T
  [[0,4,4],[4,4,0]], // S
  [[5,5,0],[0,5,5]], // Z
  [[6,0,0],[6,6,6]], // J
  [[0,0,7],[7,7,7]] // L
];

function randomPiece() {
  const type = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
  return {
    type,
    shape: SHAPES[type].map(row => [...row]),
    row: 0,
    col: Math.floor((TETRIS_COLS - SHAPES[type][0].length) / 2)
  };
}

function drawBoard(ctx, board) {
  ctx.clearRect(0, 0, TETRIS_COLS * BLOCK_SIZE, TETRIS_ROWS * BLOCK_SIZE);
  for (let r = 0; r < TETRIS_ROWS; r++) {
    for (let c = 0; c < TETRIS_COLS; c++) {
      if (board[r][c]) {
        ctx.fillStyle = COLORS[board[r][c]];
        ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#222';
        ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function drawPiece(ctx, piece) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        ctx.fillStyle = COLORS[piece.type];
        ctx.fillRect((piece.col + c) * BLOCK_SIZE, (piece.row + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#222';
        ctx.strokeRect((piece.col + c) * BLOCK_SIZE, (piece.row + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function collide(board, piece) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        let newRow = piece.row + r;
        let newCol = piece.col + c;
        // Only check collision if the cell is within the board
        if (
          newRow < 0 ||
          newRow > TETRIS_ROWS - 1 ||
          newCol < 0 ||
          newCol > TETRIS_COLS - 1 ||
          board[newRow] && board[newRow][newCol]
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge(board, piece) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        board[piece.row + r][piece.col + c] = piece.type;
      }
    }
  }
}

function clearLines(board) {
  let lines = 0;
  outer: for (let r = TETRIS_ROWS - 1; r >= 0; r--) {
    for (let c = 0; c < TETRIS_COLS; c++) {
      if (!board[r][c]) continue outer;
    }
    board.splice(r, 1);
    board.unshift(Array(TETRIS_COLS).fill(0));
    lines++;
    r++;
  }
  return lines;
}

function rotate(piece) {
  const newShape = piece.shape[0].map((_, i) => piece.shape.map(row => row[i])).reverse();
  return { ...piece, shape: newShape };
}

window._tetrisPause = false;
window._tetrisRunning = false;
window._tetrisStart = null;
window._tetrisPauseGame = null;

window.startTetris = function(canvasId, scoreId, onGameOver, onScore, timerRef, canvasWidth, canvasHeight) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  if (canvasWidth && canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }
  let board = Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(0));
  let piece = randomPiece();
  let score = 0;
  let gameOver = false;
  let fastDrop = false;
  let interval = 400;
  let minInterval = 50;
  let gameLoopId;
  let dropCount = 0;

  window._tetrisPause = false;
  window._tetrisRunning = true;
  window._tetrisPauseGame = () => { window._tetrisPause = true; window._tetrisRunning = false; };
  window._tetrisStart = () => {
    if (!window._tetrisRunning) {
      window._tetrisPause = false;
      window._tetrisRunning = true;
      piece = randomPiece();
      board = Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(0));
      score = 0;
      gameOver = false;
      interval = 400;
      dropCount = 0;
      drawBoard(ctx, board);
      drawPiece(ctx, piece);
      document.getElementById(scoreId).textContent = score;
      gameLoop();
    }
  };

  function update() {
    if (gameOver || window._tetrisPause) return;
    let moved = { ...piece, row: piece.row + 1 };
    if (!collide(board, moved)) {
      piece = moved;
    } else {
      merge(board, piece);
      let lines = clearLines(board);
      score += lines * 100;
      if (typeof onScore === 'function') onScore(score);
      piece = randomPiece();
      dropCount++;
      // Each new piece increases speed (decreases interval, min 100ms)
      interval = Math.max(100, 400 - dropCount * 8);
      if (collide(board, piece)) {
        gameOver = true;
        window._tetrisRunning = false;
        if (typeof onGameOver === 'function') onGameOver('Game Over!');
        return;
      }
    }
    drawBoard(ctx, board);
    drawPiece(ctx, piece);
    document.getElementById(scoreId).textContent = score;
  }

  function move(dir) {
    let moved = { ...piece, col: piece.col + dir };
    if (!collide(board, moved)) {
      piece = moved;
      drawBoard(ctx, board);
      drawPiece(ctx, piece);
    }
  }

  function drop() {
    let moved = { ...piece, row: piece.row + 1 };
    if (!collide(board, moved)) {
      piece = moved;
      drawBoard(ctx, board);
      drawPiece(ctx, piece);
    }
  }

  function rotatePiece() {
    let rotated = rotate(piece);
    if (!collide(board, rotated)) {
      piece = rotated;
      drawBoard(ctx, board);
      drawPiece(ctx, piece);
    }
  }

  document.onkeydown = function(e) {
    if (gameOver || window._tetrisPause) return;
    if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft') move(-1);
    else if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowDown') {
      fastDrop = true;
      interval = minInterval;
    }
    else if (e.key === 'ArrowUp') rotatePiece();
  };
  document.onkeyup = function(e) {
    if (e.key === 'ArrowDown') {
      fastDrop = false;
      interval = Math.max(100, 400 - dropCount * 8);
    }
  };

  function gameLoop() {
    update();
    gameLoopId = setTimeout(gameLoop, interval);
  }

  gameLoop();
};
