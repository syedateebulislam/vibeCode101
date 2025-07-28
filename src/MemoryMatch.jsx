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
  const [selectedCard, setSelectedCard] = useState(0);

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
    setSelectedCard(0);
  }

  // Navigation functions
  const moveLeft = () => {
    setSelectedCard(prev => prev > 0 ? prev - 1 : cards.length - 1);
  };
  
  const moveRight = () => {
    setSelectedCard(prev => prev < cards.length - 1 ? prev + 1 : 0);
  };
  
  const moveUp = () => {
    setSelectedCard(prev => prev >= 4 ? prev - 4 : prev + 12);
  };
  
  const moveDown = () => {
    setSelectedCard(prev => prev < 12 ? prev + 4 : prev - 12);
  };
  
  const flipSelected = () => {
    handleFlip(selectedCard);
  };

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
        🏠
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
              (justFlipped===idx?' just-flipped':'') +
              (selectedCard===idx?' selected':'')
            }
            onClick={() => handleFlip(idx)}
            disabled={flipped.includes(idx)||matched.includes(idx)}
            style={{
              border: selectedCard === idx ? '3px solid #ffe138' : undefined,
              boxShadow: selectedCard === idx ? '0 0 12px #ffe138' : undefined
            }}
          >
            {flipped.includes(idx)||matched.includes(idx)? sym : '❓'}
          </button>
        ))}
      </div>
      {won && <div className="win-message">🎉 You won! <button onClick={reset}>Play Again</button></div>}
      {!won && <button onClick={reset} style={{marginTop:16}}>Restart</button>}
      
      {/* Touch Control Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onTouchStart={moveUp}
            onClick={moveUp}
            style={{
              width: 50,
              height: 50,
              fontSize: 24,
              background: 'linear-gradient(135deg, #8ac926 0%, #52b788 100%)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.1s',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none'
            }}
            title="Move Up"
          >
            ⬆️
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button
            onTouchStart={moveLeft}
            onClick={moveLeft}
            style={{
              width: 50,
              height: 50,
              fontSize: 24,
              background: 'linear-gradient(135deg, #61dafb 0%, #21b7e6 100%)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.1s',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none'
            }}
            title="Move Left"
          >
            ⬅️
          </button>
          
          <button
            onTouchStart={flipSelected}
            onClick={flipSelected}
            disabled={flipped.includes(selectedCard)||matched.includes(selectedCard)}
            style={{
              width: 50,
              height: 50,
              fontSize: 20,
              background: 'linear-gradient(135deg, #ffe138 0%, #f9c74f 100%)',
              border: 'none',
              borderRadius: 8,
              color: '#222',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (flipped.includes(selectedCard)||matched.includes(selectedCard)) ? 0.5 : 1,
              transition: 'all 0.1s',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none'
            }}
            title="Flip Card"
          >
            🔄
          </button>
          
          <button
            onTouchStart={moveRight}
            onClick={moveRight}
            style={{
              width: 50,
              height: 50,
              fontSize: 24,
              background: 'linear-gradient(135deg, #61dafb 0%, #21b7e6 100%)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.1s',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none'
            }}
            title="Move Right"
          >
            ➡️
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onTouchStart={moveDown}
            onClick={moveDown}
            style={{
              width: 50,
              height: 50,
              fontSize: 24,
              background: 'linear-gradient(135deg, #8ac926 0%, #52b788 100%)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.1s',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none'
            }}
            title="Move Down"
          >
            ⬇️
          </button>
        </div>
      </div>
    </div>
  );
}
