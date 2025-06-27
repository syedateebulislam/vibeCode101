import { useEffect, useRef, useState } from 'react';
import './App.css';

function getCanvasSize() {
  const min = Math.min(window.innerWidth, window.innerHeight);
  // Keep aspect ratio 1:2 (width:height)
  let width = Math.max(200, Math.floor(min * 0.5));
  let height = width * 2;
  return { width, height };
}

function App() {
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scoreboard, setScoreboard] = useState([]);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canvasSize, setCanvasSize] = useState(getCanvasSize());
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
        window.startTetris('tetris-canvas', 'tetris-score', onGameOver, onScore, timerRef, canvasSize.width, canvasSize.height);
      };
      window._tetrisPauseGame = () => {
        window._tetrisPause = true;
        window._tetrisRunning = false;
      };
    });
  }, [canvasSize]);

  useEffect(() => {
    if (running && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && running) {
      handleGameOver('Time Up!');
    }
    return () => clearTimeout(timerRef.current);
  }, [running, timer]);

  const handleStart = () => {
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
    setScoreboard(prev => [{ score, reason, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    setTimer(300);
    alert(reason + ' Final Score: ' + score);
  };
  const handleScoreUpdate = (score) => {
    // Optionally update live score elsewhere
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 30 }}>
      <h1>Tetris Game (Vanilla JS)</h1>
      <div style={{ margin: '20px auto', width: canvasSize.width }}>
        <canvas ref={tetrisRef} id="tetris-canvas" width={canvasSize.width} height={canvasSize.height} style={{ background: '#111', display: 'block', margin: '0 auto', borderRadius: 8, maxWidth: '100vw', maxHeight: '80vh', touchAction: 'none' }}></canvas>
        <div style={{ marginTop: 10, fontSize: 18, color: '#61dafb' }}>
          Score: <span id="tetris-score">0</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 16, color: '#f538ff' }}>
          Time Left: {Math.floor(timer/60)}:{('0'+(timer%60)).slice(-2)}
        </div>
      </div>
      <div style={{ margin: '20px auto', width: canvasSize.width, display: 'flex', justifyContent: 'center', gap: 16 }}>
        <button onClick={handleStart} disabled={running} style={{ padding: '8px 24px', fontWeight: 'bold', background: '#61dafb', border: 'none', borderRadius: 4, cursor: running ? 'not-allowed' : 'pointer' }}>Start</button>
        <button onClick={handlePause} disabled={!running} style={{ padding: '8px 24px', fontWeight: 'bold', background: '#f538ff', color: '#fff', border: 'none', borderRadius: 4, cursor: !running ? 'not-allowed' : 'pointer' }}>Pause</button>
      </div>
      <div style={{ color: '#888', marginTop: 20 }}>
        Controls: <b>←</b> Left, <b>→</b> Right, <b>↓</b> Fast Down, <b>↑</b> Rotate
      </div>
      <div style={{ margin: '40px auto', maxWidth: 400 }}>
        <h2>Scoreboard</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#222', color: '#fff', borderRadius: 8 }}>
          <thead>
            <tr style={{ background: '#444' }}>
              <th style={{ padding: 6 }}>Score</th>
              <th style={{ padding: 6 }}>Reason</th>
              <th style={{ padding: 6 }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {scoreboard.map((entry, i) => (
              <tr key={i} style={{ background: i % 2 ? '#333' : '#222' }}>
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
