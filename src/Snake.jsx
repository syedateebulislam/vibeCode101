import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const INIT_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];
const INIT_DIR = { x: 1, y: 0 };
const SPEED = 120;

function getRandomFood(snake) {
  let food;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some(seg => seg.x === food.x && seg.y === food.y) ||
    food.x < 0 || food.x >= GRID_SIZE || food.y < 0 || food.y >= GRID_SIZE
  );
  return food;
}

export default function Snake({ onHome }) {
  const [snake, setSnake] = useState(INIT_SNAKE);
  const [dir, setDir] = useState(INIT_DIR);
  const [food, setFood] = useState(getRandomFood(INIT_SNAKE));
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [scoreboard, setScoreboard] = useState(() => JSON.parse(localStorage.getItem('snake_scoreboard')||'[]'));
  const [showScoreMsg, setShowScoreMsg] = useState(null);
  const [handle, setHandle] = useState('');
  const moveRef = useRef();
  const dirRef = useRef(dir);
  dirRef.current = dir;

  const randomHandle = () => {
    const animals = ['Tiger', 'Wolf', 'Falcon', 'Shark', 'Panther', 'Eagle', 'Viper', 'Rhino', 'Dragon', 'Cobra'];
    const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Golden', 'Crimson', 'Shadow', 'Neon'];
    return (
      colors[Math.floor(Math.random() * colors.length)] +
      animals[Math.floor(Math.random() * animals.length)] +
      Math.floor(100 + Math.random() * 900)
    );
  };

  useEffect(() => {
    if (!running || paused || gameOver) return;
    moveRef.current = setInterval(() => {
      setSnake(prev => {
        const next = { x: prev[0].x + dirRef.current.x, y: prev[0].y + dirRef.current.y };
        if (
          next.x < 0 || next.x >= GRID_SIZE ||
          next.y < 0 || next.y >= GRID_SIZE ||
          prev.some(seg => seg.x === next.x && seg.y === next.y)
        ) {
          setGameOver(true);
          setShowScoreMsg(`Game Over! Score: ${score} | Handle: ${handle}`);
          const entry = { handle, score, time: new Date().toLocaleTimeString() };
          const updated = [entry, ...scoreboard].slice(0, 10);
          setScoreboard(updated);
          localStorage.setItem('snake_scoreboard', JSON.stringify(updated));
          setRunning(false);
          return prev;
        }
        let newSnake = [next, ...prev];
        if (next.x === food.x && next.y === food.y) {
          setScore(s => s + 1);
          setFood(getRandomFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, SPEED);
    return () => clearInterval(moveRef.current);
  }, [running, paused, gameOver, food, score, scoreboard, handle]);

  useEffect(() => {
    const handleKey = e => {
      if (!running || paused) return;
      if (e.key === 'ArrowUp' && dirRef.current.y !== 1) setDir({ x: 0, y: -1 });
      if (e.key === 'ArrowDown' && dirRef.current.y !== -1) setDir({ x: 0, y: 1 });
      if (e.key === 'ArrowLeft' && dirRef.current.x !== 1) setDir({ x: -1, y: 0 });
      if (e.key === 'ArrowRight' && dirRef.current.x !== -1) setDir({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [running, paused]);

  const handleStart = () => {
    setSnake(INIT_SNAKE);
    setDir(INIT_DIR);
    setFood(getRandomFood(INIT_SNAKE));
    setScore(0);
    setGameOver(false);
    setShowScoreMsg(null);
    setHandle(randomHandle());
    setRunning(true);
    setPaused(false);
  };
  const handlePauseResume = () => {
    if (paused) {
      setPaused(false);
      setRunning(true);
    } else {
      setPaused(true);
    }
  };
  const handleReset = () => {
    setSnake(INIT_SNAKE);
    setDir(INIT_DIR);
    setFood(getRandomFood(INIT_SNAKE));
    setScore(0);
    setGameOver(false);
    setShowScoreMsg(null);
    setRunning(false);
    setPaused(false);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 30 }}>
      {/* Home/Menu Button */}
      <button
        onClick={onHome}
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          zIndex: 100,
          background: 'linear-gradient(135deg, #ffe138 0%, #f538ff 100%)',
          border: 'none',
          borderRadius: '50%',
          width: 54,
          height: 54,
          boxShadow: '0 2px 12px #0006',
          cursor: 'pointer',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 'bold',
          color: '#fff',
          transition: 'transform 0.15s',
        }}
        title="Back to Home"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" style={{ display: 'block' }}>
          <path d="M3 12L12 5l9 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="7" y="13" width="10" height="7" rx="2" fill="#222" stroke="#fff" strokeWidth="2.5" />
          <path d="M9 21V16h6v5" fill="none" stroke="#fff" strokeWidth="2" />
        </svg>
      </button>
      <h1>Snake Game</h1>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '20px auto',
        width: '100%',
        maxWidth: 480
      }}>
        {/* Score (top, centered) */}
        <div style={{ textAlign: 'center', color: '#f538ff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
          <div>Score</div>
          <div>{score}</div>
          <div style={{ color: '#ffe138', fontSize: 16, marginTop: 2 }}>Handle: <b>{handle}</b></div>
        </div>
        {/* Game Board (centered) */}
        <div style={{ position: 'relative', background: '#111', borderRadius: 8, boxShadow: '0 0 12px #0008', overflow: 'hidden', width: 400, height: 400, display: 'grid', gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {[...Array(GRID_SIZE)].map((_, y) =>
            [...Array(GRID_SIZE)].map((_, x) => {
              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = snake.some((seg, i) => i > 0 && seg.x === x && seg.y === y);
              const isFood = food.x === x && food.y === y;
              return (
                <div key={x + '-' + y} style={{
                  width: '100%',
                  height: '100%',
                  background: isHead ? '#ffe138' : isBody ? '#00eaff' : isFood ? '#f538ff' : 'transparent',
                  border: isHead || isBody || isFood ? '1px solid #222' : '1px solid #2222',
                  borderRadius: isFood ? '50%' : 4,
                  boxSizing: 'border-box',
                  transition: 'background 0.1s',
                }} />
              );
            })
          )}
          {showScoreMsg && (
            <div style={{
              position: 'absolute',
              top: '40%',
              left: 0,
              width: '100%',
              color: '#fff',
              fontSize: 22,
              fontWeight: 'bold',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.85)',
              padding: 24,
              borderRadius: 12,
              zIndex: 10,
              boxShadow: '0 0 16px #000a',
              pointerEvents: 'none',
            }}>{showScoreMsg}</div>
          )}
        </div>
      </div>
      <div style={{ margin: '20px auto', width: 400, display: 'flex', justifyContent: 'center', gap: 16 }}>
        <button onClick={handleStart} disabled={running && !paused} style={{ padding: '8px 24px', fontWeight: 'bold', background: '#61dafb', border: 'none', borderRadius: 4, cursor: running && !paused ? 'not-allowed' : 'pointer' }}>Start</button>
        <button
          onClick={handlePauseResume}
          disabled={!running && !paused}
          style={{
            padding: '8px 24px',
            fontWeight: 'bold',
            background: paused ? '#61dafb' : '#f538ff',
            color: paused ? '#222' : '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: (!running && !paused) ? 'not-allowed' : 'pointer',
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={handleReset} style={{ padding: '8px 24px', fontWeight: 'bold', background: '#ffe138', color: '#222', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Reset</button>
      </div>
      <div style={{ color: '#888', marginTop: 20 }}>
        Controls: <b>←</b> Left, <b>→</b> Right, <b>↑</b> Up, <b>↓</b> Down
      </div>
      <div style={{ margin: '40px auto', maxWidth: 500 }}>
        <h2>Scoreboard</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#222', color: '#fff', borderRadius: 8 }}>
          <thead>
            <tr style={{ background: '#444' }}>
              <th style={{ padding: 6 }}>Handle</th>
              <th style={{ padding: 6 }}>Score</th>
              <th style={{ padding: 6 }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {scoreboard.map((entry, i) => (
              <tr key={i} style={{ background: i % 2 ? '#333' : '#222' }}>
                <td style={{ padding: 6 }}>{entry.handle}</td>
                <td style={{ padding: 6 }}>{entry.score}</td>
                <td style={{ padding: 6 }}>{entry.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
