import React from 'react';

export default function TetrisTest({ width, height, running, paused }) {
  return (
    <div style={{ 
      padding: 20, 
      background: '#333', 
      color: '#fff', 
      textAlign: 'center',
      minHeight: 400,
      border: '2px solid #ffe138'
    }}>
      <h2>🟦 Tetris Test Component</h2>
      <p>✅ Component is rendering!</p>
      <p>Width: {width || 'undefined'}</p>
      <p>Height: {height || 'undefined'}</p>
      <p>Running: {running?.toString() || 'undefined'}</p>
      <p>Paused: {paused?.toString() || 'undefined'}</p>
      <button 
        onClick={() => alert('Tetris component is working!')}
        style={{
          padding: '10px 20px',
          background: '#61dafb',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Test Button
      </button>
    </div>
  );
}