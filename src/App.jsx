
import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';
import Tetris from './Components/Tetris';

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
  const [gameOverMsg, setGameOverMsg] = useState(null);
  // Load scoreboard from localStorage or public/scoreboard.xlsx on mount
  useEffect(() => {
    const local = localStorage.getItem('tetris_scoreboard');
    if (local) {
      try {
        const json = JSON.parse(local);
        setScoreboard(json);
        if (json.length > 0) {
          const best = json.reduce((a, b) => (a.score > b.score ? a : b), json[0]);
          setTopScorer(best);
        }
        return;
      } catch {}
    }
    fetch('/scoreboard.xlsx')
      .then(res => res.arrayBuffer())
      .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        let json = XLSX.utils.sheet_to_json(sheet);
        // Normalize handle column (case-insensitive)
        json = json.map(row => {
          if (!row.handle && (row.Handle || row.HANDLE)) {
            row.handle = row.Handle || row.HANDLE;
          }
          return row;
        });
        setScoreboard(json);
        if (json.length > 0) {
          const best = json.reduce((a, b) => (a.score > b.score ? a : b), json[0]);
          setTopScorer(best);
        }
      })
      .catch(() => {});
  }, []);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canvasSize, setCanvasSize] = useState(getCanvasSize());
  const [handle, setHandle] = useState('');
  const [topScorer, setTopScorer] = useState(null);
  const timerRef = useRef();

  useEffect(() => {
    function handleResize() {
      setCanvasSize(getCanvasSize());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tetris logic is now handled in the Tetris React component

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
    setGameOverMsg(null);
  };
  const handlePause = () => {
    setPaused(true);
    setRunning(false);
  };
  const handleReset = () => {
    setRunning(false);
    setPaused(false);
    setTimer(300);
    setHandle('');
    setGameOverMsg(null);
  };
  const handleGameOver = (reason, score = 0) => {
    setRunning(false);
    setPaused(false);
    setGameOverMsg(`${reason} Final Score: ${score} | Handle: ${handle}`);
    const entry = { handle, score, reason, time: new Date().toLocaleTimeString() };
    setScoreboard(prev => {
      const updated = [entry, ...prev];
      // Update top scorer if needed
      const best = updated.reduce((a, b) => (a.score > b.score ? a : b), updated[0]);
      setTopScorer(best);
      // Persist to localStorage
      localStorage.setItem('tetris_scoreboard', JSON.stringify(updated));
      return updated;
    });
    setTimer(300);
  };
  const handleScoreUpdate = (score) => {
    // Optionally update live score elsewhere
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 30 }}>
      <h1>Vibe Coded Tetris Game</h1>
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
        {/* Game Board (center) */}
        <div style={{ position: 'relative' }}>
          <Tetris
            running={running}
            paused={paused}
            onGameOver={(reason, score) => handleGameOver(reason, score)}
            onScore={handleScoreUpdate}
            blockSize={canvasSize.block}
            width={canvasSize.width}
            height={canvasSize.height}
            handle={handle}
            timer={timer}
            setTimer={setTimer}
            setRunning={setRunning}
            setPaused={setPaused}
          />
          {gameOverMsg && (
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
            }}>{gameOverMsg}</div>
          )}
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
        <button onClick={handleReset} style={{ padding: '8px 24px', fontWeight: 'bold', background: '#ffe138', color: '#222', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Reset</button>
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
