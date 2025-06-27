import React, { useEffect, useRef, useState, useCallback } from 'react';

const TETRIS_ROWS = 20;
const TETRIS_COLS = 10;
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

function rotate(shape) {
  return shape[0].map((_, i) => shape.map(row => row[i])).reverse();
}

function collide(board, piece) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        let newRow = piece.row + r;
        let newCol = piece.col + c;
        if (
          newRow < 0 ||
          newRow > TETRIS_ROWS - 1 ||
          newCol < 0 ||
          newCol > TETRIS_COLS - 1 ||
          board[newRow][newCol]
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge(board, piece) {
  const newBoard = board.map(row => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        newBoard[piece.row + r][piece.col + c] = piece.type;
      }
    }
  }
  return newBoard;
}

function clearLines(board) {
  let lines = 0;
  let newBoard = board.filter(row => {
    if (row.every(cell => cell !== 0)) {
      lines++;
      return false;
    }
    return true;
  });
  while (newBoard.length < TETRIS_ROWS) {
    newBoard.unshift(Array(TETRIS_COLS).fill(0));
  }
  return { newBoard, lines };
}

const getInitialBoard = () => Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(0));

// Animation duration for line clear (ms)
const LINE_CLEAR_ANIMATION = 300;

export default function Tetris({
  running,
  paused,
  onGameOver,
  onScore,
  blockSize = 30,
  width = 300,
  height = 600,
  handle,
  timer,
  setTimer,
  setRunning,
  setPaused
}) {
  const [board, setBoard] = useState(getInitialBoard());
  const [clearingRows, setClearingRows] = useState([]);
  const [piece, setPiece] = useState(randomPiece());
  const [nextPiece, setNextPiece] = useState(randomPiece());
  const [score, setScore] = useState(0);
  const [interval, setIntervalState] = useState(400);
  const [dropCount, setDropCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [fastDropping, setFastDropping] = useState(false);
  const requestRef = useRef();
  const lastDropRef = useRef(Date.now());

  // Handle game loop
  useEffect(() => {
    if (!running || paused || gameOver) return;
    const loop = () => {
      const now = Date.now();
      if (now - lastDropRef.current > interval) {
        drop();
        lastDropRef.current = now;
      }
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line
  }, [running, paused, interval, gameOver, piece]);

  // Keyboard controls
  useEffect(() => {
    if (!running || paused || gameOver) return;
    const handleKeyDown = (e) => {
      if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') move(-1);
      else if (e.key === 'ArrowRight') move(1);
      else if (e.key === 'ArrowDown') setFastDropping(true);
      else if (e.key === 'ArrowUp') rotatePiece();
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowDown') setFastDropping(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line
  }, [running, paused, gameOver, piece]);

  // Touch controls (swipe/tap, tap on block to rotate only)
  useEffect(() => {
    if (!running || paused || gameOver) return;
    let startX = 0, startY = 0, moved = false;
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        moved = false;
      }
    };
    const handleTouchMove = (e) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) move(1);
          else move(-1);
          moved = true;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        } else if (Math.abs(dy) > 30 && Math.abs(dy) > Math.abs(dx)) {
          if (dy > 0) fastDrop();
          moved = true;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }
      }
    };
    const handleTouchEnd = (e) => {
      if (!moved && e.changedTouches && e.changedTouches.length === 1) {
        // Only rotate if tap was on a block of the current piece
        const touch = e.changedTouches[0];
        const boardDiv = document.getElementById('tetris-board');
        if (boardDiv) {
          const rect = boardDiv.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          const col = Math.floor(x / (rect.width / TETRIS_COLS));
          const row = Math.floor(y / (rect.height / TETRIS_ROWS));
          if (
            row >= piece.row && row < piece.row + piece.shape.length &&
            col >= piece.col && col < piece.col + piece.shape[0].length &&
            piece.shape[row - piece.row][col - piece.col]
          ) {
            rotatePiece();
          }
        }
      }
      moved = false;
    };
    const boardDiv = document.getElementById('tetris-board');
    if (boardDiv) {
      boardDiv.addEventListener('touchstart', handleTouchStart, { passive: false });
      boardDiv.addEventListener('touchmove', handleTouchMove, { passive: false });
      boardDiv.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    return () => {
      if (boardDiv) {
        boardDiv.removeEventListener('touchstart', handleTouchStart);
        boardDiv.removeEventListener('touchmove', handleTouchMove);
        boardDiv.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [running, paused, gameOver, piece]);

  // Reset on new game
  useEffect(() => {
    if (!running) {
      setBoard(getInitialBoard());
      setPiece(randomPiece());
      setNextPiece(randomPiece());
      setScore(0);
      setIntervalState(400);
      setDropCount(0);
      setGameOver(false);
    }
  }, [running]);

  // Drop piece with line clear animation
  const drop = useCallback(() => {
    if (gameOver || paused) return;
    const moved = { ...piece, row: piece.row + 1 };
    if (!collide(board, moved)) {
      setPiece(moved);
    } else {
      const merged = merge(board, piece);
      // Find which rows will be cleared
      const rowsToClear = [];
      for (let r = 0; r < merged.length; r++) {
        if (merged[r].every(cell => cell !== 0)) rowsToClear.push(r);
      }
      if (rowsToClear.length > 0) {
        setClearingRows(rowsToClear);
        setTimeout(() => {
          const { newBoard, lines } = clearLines(merged);
          let newScore = score + lines * 100;
          setScore(newScore);
          onScore && onScore(newScore);
          const newDropCount = dropCount + 1;
          setDropCount(newDropCount);
          setIntervalState(Math.max(100, 400 - newDropCount * 8));
          setFastDropping(false);
          setClearingRows([]);
          if (collide(newBoard, nextPiece)) {
            setGameOver(true);
            setRunning(false);
            onGameOver && onGameOver('Game Over!', newScore);
            return;
          }
          setBoard(newBoard);
          setPiece(nextPiece);
          setNextPiece(randomPiece());
        }, LINE_CLEAR_ANIMATION);
      } else {
        // No lines to clear, normal drop
        let newScore = score;
        onScore && onScore(newScore);
        const newDropCount = dropCount + 1;
        setDropCount(newDropCount);
        setIntervalState(Math.max(100, 400 - newDropCount * 8));
        setFastDropping(false);
        if (collide(merged, nextPiece)) {
          setGameOver(true);
          setRunning(false);
          onGameOver && onGameOver('Game Over!', newScore);
          return;
        }
        setBoard(merged);
        setPiece(nextPiece);
        setNextPiece(randomPiece());
      }
    }
    // eslint-disable-next-line
  }, [board, piece, gameOver, paused, score, dropCount, onScore, setRunning, onGameOver, nextPiece]);

  // Move left/right
  const move = useCallback((dir) => {
    const moved = { ...piece, col: piece.col + dir };
    if (!collide(board, moved)) {
      setPiece(moved);
    }
    // eslint-disable-next-line
  }, [board, piece]);

  // Fast drop effect
  useEffect(() => {
    if (fastDropping) {
      setIntervalState(50);
    } else {
      setIntervalState(Math.max(100, 400 - dropCount * 8));
    }
    // eslint-disable-next-line
  }, [fastDropping, dropCount]);

  // Rotate
  const rotatePiece = useCallback(() => {
    const rotated = { ...piece, shape: rotate(piece.shape) };
    if (!collide(board, rotated)) {
      setPiece(rotated);
    }
    // eslint-disable-next-line
  }, [board, piece]);

  // Render board and piece
  const renderBoard = () => {
    // Copy board
    const display = board.map(row => [...row]);
    // Overlay piece
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const row = piece.row + r;
          const col = piece.col + c;
          if (row >= 0 && row < TETRIS_ROWS && col >= 0 && col < TETRIS_COLS) {
            display[row][col] = piece.type;
          }
        }
      }
    }
    return display;
  };

  return (
    <div style={{ position: 'relative', width, margin: '0 auto' }}>
      <div id="tetris-board" style={{
        width,
        height,
        background: '#111',
        display: 'grid',
        gridTemplateRows: `repeat(${TETRIS_ROWS}, 1fr)`,
        gridTemplateColumns: `repeat(${TETRIS_COLS}, 1fr)`,
        borderRadius: 8,
        touchAction: 'none',
        position: 'relative',
        margin: '0 auto',
        boxShadow: '0 0 12px #0008',
        overflow: 'hidden',
        maxWidth: '100%'
      }}>
        {/* Next piece preview INSIDE board, smaller size */}
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: (blockSize * 2.2) + 8,
          height: (blockSize * 2.2) + 24,
          background: 'rgba(30,30,30,0.92)',
          borderRadius: 8,
          boxShadow: '0 2px 8px #0006',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          zIndex: 10,
          padding: 3,
        }}>
          <div style={{ color: '#ffe138', fontWeight: 'bold', fontSize: 12, marginBottom: 1 }}>Next</div>
          <div style={{ display: 'grid', gridTemplateRows: `repeat(4, ${(blockSize/2.2)-2}px)`, gridTemplateColumns: `repeat(4, ${(blockSize/2.2)-2}px)`, gap: 1 }}>
            {[0,1,2,3].map(r =>
              [0,1,2,3].map(c => (
                <div key={r + '-' + c} style={{
                  width: (blockSize/2.2)-2,
                  height: (blockSize/2.2)-2,
                  background: nextPiece.shape[r] && nextPiece.shape[r][c] ? COLORS[nextPiece.type] : 'transparent',
                  border: nextPiece.shape[r] && nextPiece.shape[r][c] ? '1px solid #222' : '1px solid #2222',
                  borderRadius: 2,
                  boxSizing: 'border-box',
                  transition: 'background 0.1s',
                }} />
              ))
            )}
          </div>
        </div>
        {renderBoard().map((row, r) =>
          row.map((cell, c) => {
            const isClearing = clearingRows.includes(r);
            // Animate dropping blocks (new piece) and pop on placement
            let classNames = [];
            if (isClearing) classNames.push('tetris-clearing');
            // Animate new piece drop
            if (piece && piece.row <= r && piece.col <= c && piece.col + piece.shape[0].length > c && piece.row + piece.shape.length > r && piece.shape[r - piece.row] && piece.shape[r - piece.row][c - piece.col]) {
              classNames.push('tetris-drop');
            }
            // Animate pop for placed blocks (not moving piece)
            if (!isClearing && cell && (!piece || r < piece.row || r >= piece.row + piece.shape.length || c < piece.col || c >= piece.col + piece.shape[0].length)) {
              classNames.push('tetris-pop');
            }
            return (
              <div
                key={r + '-' + c}
                className={classNames.join(' ')}
                style={{
                  width: blockSize,
                  height: blockSize,
                  background: cell ? COLORS[cell] : 'transparent',
                  border: cell ? '1px solid #222' : '1px solid #2222',
                  boxSizing: 'border-box',
                  borderRadius: 4,
                  transition: 'background 0.1s',
                  animation: isClearing ? `tetrisFlash ${LINE_CLEAR_ANIMATION}ms` : undefined,
                }}
              />
            );
          })
        )}
        {/* Score overlay */}
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          color: '#61dafb',
          fontWeight: 'bold',
          fontSize: 18,
          textShadow: '1px 1px 2px #000a',
          pointerEvents: 'none',
        }}>Score: {score}</div>
        <div style={{
          position: 'absolute',
          top: 36,
          left: 8,
          color: '#aaa',
          fontSize: 16,
          pointerEvents: 'none',
        }}>Handle: <b>{handle}</b></div>
        {gameOver && (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: 0,
            width: '100%',
            color: '#fff',
            fontSize: 32,
            fontWeight: 'bold',
            textAlign: 'center',
            background: '#000a',
            padding: 16,
            borderRadius: 8,
          }}>Game Over!</div>
        )}
      </div>
    </div>
  );
}
