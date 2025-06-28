import React from 'react';
import './App.css';

export default function Home({ onSelectTetris, onSelectSnake }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    }}>
      <h1 style={{ color: '#61dafb', marginBottom: 40 }}>Welcome to VibeCode101</h1>
      <div style={{
        display: 'flex',
        gap: 32,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <div
          onClick={onSelectTetris}
          style={{
            width: 180,
            height: 180,
            background: 'linear-gradient(135deg, #00eaff 0%, #f538ff 100%)',
            borderRadius: 18,
            boxShadow: '0 4px 24px #0006',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s',
            fontWeight: 'bold',
            fontSize: 28,
            color: '#fff',
            border: '4px solid #ffe138',
          }}
        >
          <span role="img" aria-label="tetris" style={{ fontSize: 48, marginBottom: 12 }}>🟦🟧🟩🟪</span>
          Tetris
        </div>
        <div
          onClick={onSelectSnake}
          style={{
            width: 180,
            height: 180,
            background: 'linear-gradient(135deg, #ffe138 0%, #00eaff 100%)',
            borderRadius: 18,
            boxShadow: '0 4px 24px #0006',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s',
            fontWeight: 'bold',
            fontSize: 28,
            color: '#222',
            border: '4px solid #f538ff',
          }}
        >
          <span role="img" aria-label="snake" style={{ fontSize: 48, marginBottom: 12 }}>🐍</span>
          Snake
        </div>
      </div>
      <div style={{ color: '#aaa', marginTop: 40, fontSize: 16 }}>
        Click a tile to start playing!
      </div>
    </div>
  );
}
