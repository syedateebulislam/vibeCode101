import React, { useState, useEffect } from 'react';
import './App.css';

const symbols = ['🍎','🍌','🍇','🍓','🍒','🍉','🍋','🍊'];
const shuffled = () => {
  const arr = [...symbols, ...symbols];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function MemoryMatch({ onHome }) {
  const [cards, setCards] = useState(shuffled());
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [justMatched, setJustMatched] = useState([]);
  const [justFlipped, setJustFlipped] = useState(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (matched.length === cards.length) setWon(true);
  }, [matched, cards]);

  function handleFlip(idx) {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    setJustFlipped(idx);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [i, j] = newFlipped;
      if (cards[i] === cards[j]) {
        setTimeout(() => {
          setMatched([...matched, i, j]);
          setJustMatched([i, j]);
          setFlipped([]);
          setTimeout(() => setJustMatched([]), 700);
        }, 600);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
    setTimeout(() => setJustFlipped(null), 300);
  }

  function reset() {
    setCards(shuffled());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setWon(false);
    setJustMatched([]);
    setJustFlipped(null);
  }

  return (
    <div className="game-container" style={{position:'relative', minHeight: 420, paddingTop: 0}}>
      <button
        onClick={onHome}
        style={{
          position: 'fixed',
          top: 32,
          left: 'max(32px, calc(50vw - 260px))',
          zIndex: 200,
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
      <h2>Memory Match</h2>
      <div style={{marginBottom:8}}>Moves: {moves}</div>
      <div className="memory-board">
        {cards.map((sym, idx) => (
          <button
            key={idx}
            className={
              `memory-card` +
              (flipped.includes(idx)||matched.includes(idx)?' flipped':'') +
              (justMatched.includes(idx)?' just-matched':'') +
              (justFlipped===idx?' just-flipped':'')
            }
            onClick={() => handleFlip(idx)}
            disabled={flipped.includes(idx)||matched.includes(idx)}
          >
            {flipped.includes(idx)||matched.includes(idx)? sym : '❓'}
          </button>
        ))}
      </div>
      {won && <div className="win-message">🎉 You won! <button onClick={reset}>Play Again</button></div>}
      {!won && <button onClick={reset} style={{marginTop:16}}>Restart</button>}
    </div>
  );
}
