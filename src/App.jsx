
import { useEffect, useRef, useState } from 'react';
import './App.css';

// Random handle generator
function randomHandle() {
  const animals = ['Tiger', 'Wolf', 'Falcon', 'Shark', 'Panther', 'Eagle', 'Viper', 'Rhino', 'Dragon', 'Cobra'];
  const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Golden', 'Crimson', 'Shadow', 'Neon'];
  return (
    colors[Math.floor(Math.random() * colors.length)] +
    animals[Math.floor(Math.random() * animals.length)] +
    Math.floor(100 + Math.random() * 900)
  );
}


// Always use TETRIS_COLS * BLOCK_SIZE and TETRIS_ROWS * BLOCK_SIZE for canvas
const TETRIS_COLS = 10;
const TETRIS_ROWS = 20;
const BLOCK_SIZE = 30;
function getCanvasSize() {
  // Fit to screen but keep exact block grid
  let maxWidth = Math.min(window.innerWidth, 0.9 * window.innerHeight / 2, 320);
  let block = Math.floor(maxWidth / TETRIS_COLS);
  let width = block * TETRIS_COLS;
  let height = block * TETRIS_ROWS;
  return { width, height, block };
}


function App() {
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scoreboard, setScoreboard] = useState([]);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canvasSize, setCanvasSize] = useState(getCanvasSize());
  const [handle, setHandle] = useState('');
  const [topScorer, setTopScorer] = useState(null);
  const timerRef = useRef();
  const tetrisRef = useRef(null);

  useEffect(() => {
    function handleResize() {
      setCanvasSize(getCanvasSize());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    import('./tetris.js').then(() => {
      window._tetrisPause = false;
      window._tetrisRunning = false;
      window._tetrisStart = (onGameOver, onScore) => {
        window._tetrisPause = false;
        window._tetrisRunning = true;
        window.startTetris('tetris-canvas', 'tetris-score', onGameOver, onScore, timerRef, TETRIS_COLS * canvasSize.block, TETRIS_ROWS * canvasSize.block);
      };
      window._tetrisPauseGame = () => {
        window._tetrisPause = true;
        window._tetrisRunning = false;
      };
      // Touch controls for mobile (call Tetris movement functions directly)
      setTimeout(() => {
        const canvas = document.getElementById('tetris-canvas');
        if (!canvas) return;
        let startX = 0, startY = 0, moved = false;
        const moveLeft = () => window._tetrisMove && window._tetrisMove(-1);
        const moveRight = () => window._tetrisMove && window._tetrisMove(1);
        const drop = () => window._tetrisDrop && window._tetrisDrop();
        const rotate = () => window._tetrisRotate && window._tetrisRotate();
        const handleTouchStart = (e) => {
          if (!window._tetrisRunning) return;
          if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            moved = false;
          }
        };
        const handleTouchMove = (e) => {
          if (!window._tetrisRunning) return;
          if (e.touches.length === 1) {
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0) {
                moveRight();
              } else {
                moveLeft();
              }
              moved = true;
              startX = e.touches[0].clientX;
              startY = e.touches[0].clientY;
            } else if (Math.abs(dy) > 30 && Math.abs(dy) > Math.abs(dx)) {
              if (dy > 0) {
                drop();
              }
              moved = true;
              startX = e.touches[0].clientX;
              startY = e.touches[0].clientY;
            }
          }
        };
        const handleTouchEnd = (e) => {
          if (!window._tetrisRunning) return;
          if (!moved) {
            rotate();
          }
          moved = false;
        };
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        // Clean up
        window._tetrisTouchCleanup = () => {
          canvas.removeEventListener('touchstart', handleTouchStart);
          canvas.removeEventListener('touchmove', handleTouchMove);
          canvas.removeEventListener('touchend', handleTouchEnd);
        };
      }, 100);
    });
    return () => {
      if (window._tetrisTouchCleanup) window._tetrisTouchCleanup();
    };

  useEffect(() => {
    if (running && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && running) {
      handleGameOver('Time Up!');
    }
    return () => clearTimeout(timerRef.current);
  }, [running, timer]);

  const handleStart = () => {
    const newHandle = randomHandle();
    setHandle(newHandle);
    setRunning(true);
    setPaused(false);
    setTimer(300);
    window._tetrisStart && window._tetrisStart(handleGameOver, handleScoreUpdate);
  };
  const handlePause = () => {
    setPaused(true);
    setRunning(false);
    window._tetrisPauseGame && window._tetrisPauseGame();
  };
  const handleGameOver = (reason) => {
    setRunning(false);
    setPaused(false);
    const score = parseInt(document.getElementById('tetris-score').textContent, 10);
    const entry = { handle, score, reason, time: new Date().toLocaleTimeString() };
    setScoreboard(prev => {
      const updated = [entry, ...prev.slice(0, 9)];
      // Update top scorer if needed
      const best = updated.reduce((a, b) => (a.score > b.score ? a : b), updated[0]);
      setTopScorer(best);
      return updated;
    });
    setTimer(300);
    alert(reason + ' Final Score: ' + score + '\nHandle: ' + handle);
  };
  const handleScoreUpdate = (score) => {
    // Optionally update live score elsewhere
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 30 }}>
      <h1>Tetris Game (Vanilla JS)</h1>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 32,
        margin: '20px auto',
        width: '100%',
        maxWidth: canvasSize.width + 320
      }}>
        {/* Timer (left) */}
        <div style={{ minWidth: 100, textAlign: 'right', color: '#f538ff', fontSize: 22, fontWeight: 'bold', marginTop: 40 }}>
          <div>Time Left</div>
          <div>{Math.floor(timer/60)}:{('0'+(timer%60)).slice(-2)}</div>
        </div>
        {/* Game Canvas (center) */}
        <div>
          <canvas ref={tetrisRef} id="tetris-canvas" width={TETRIS_COLS * canvasSize.block} height={TETRIS_ROWS * canvasSize.block} style={{ background: '#111', display: 'block', margin: '0 auto', borderRadius: 8, width: '100%', maxWidth: TETRIS_COLS * canvasSize.block, height: 'auto', touchAction: 'none' }}></canvas>
          <div style={{ marginTop: 10, fontSize: 18, color: '#61dafb' }}>
            Score: <span id="tetris-score">0</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 16, color: '#aaa' }}>
            Handle: <b>{handle}</b>
          </div>
        </div>
        {/* Top Scorer (right) */}
        <div style={{ minWidth: 120, textAlign: 'left', color: '#ffe138', fontSize: 18, fontWeight: 'bold', marginTop: 40 }}>
          <div>Top Scorer</div>
          {topScorer ? (
            <>
              <div style={{ fontSize: 16, color: '#fff' }}>{topScorer.handle}</div>
              <div style={{ fontSize: 20 }}>{topScorer.score}</div>
            </>
          ) : <div style={{ fontSize: 14, color: '#888' }}>No scores yet</div>}
        </div>
      </div>
      <div style={{ margin: '20px auto', width: canvasSize.width, display: 'flex', justifyContent: 'center', gap: 16 }}>
        <button onClick={handleStart} disabled={running} style={{ padding: '8px 24px', fontWeight: 'bold', background: '#61dafb', border: 'none', borderRadius: 4, cursor: running ? 'not-allowed' : 'pointer' }}>Start</button>
        <button onClick={handlePause} disabled={!running} style={{ padding: '8px 24px', fontWeight: 'bold', background: '#f538ff', color: '#fff', border: 'none', borderRadius: 4, cursor: !running ? 'not-allowed' : 'pointer' }}>Pause</button>
      </div>
      <div style={{ color: '#888', marginTop: 20 }}>
        Controls: <b>←</b> Left, <b>→</b> Right, <b>↓</b> Fast Down, <b>↑</b> Rotate
      </div>
      <div style={{ margin: '40px auto', maxWidth: 500 }}>
        <h2>Scoreboard</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#222', color: '#fff', borderRadius: 8 }}>
          <thead>
            <tr style={{ background: '#444' }}>
              <th style={{ padding: 6 }}>Handle</th>
              <th style={{ padding: 6 }}>Score</th>
              <th style={{ padding: 6 }}>Reason</th>
              <th style={{ padding: 6 }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {scoreboard.map((entry, i) => (
              <tr key={i} style={{ background: i % 2 ? '#333' : '#222' }}>
                <td style={{ padding: 6 }}>{entry.handle}</td>
                <td style={{ padding: 6 }}>{entry.score}</td>
                <td style={{ padding: 6 }}>{entry.reason}</td>
                <td style={{ padding: 6 }}>{entry.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
