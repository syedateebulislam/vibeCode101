import React, { useState } from 'react';
import './App.css';

const shapes = [
  {
    name: 'Cat',
    svg: (
      <g>
        <ellipse cx="100" cy="140" rx="80" ry="60" stroke="#222" strokeWidth="7" fill="none" /> {/* Face */}
        <ellipse cx="60" cy="70" rx="30" ry="40" stroke="#222" strokeWidth="7" fill="none" /> {/* Left Ear */}
        <ellipse cx="140" cy="70" rx="30" ry="40" stroke="#222" strokeWidth="7" fill="none" /> {/* Right Ear */}
        <ellipse cx="80" cy="140" rx="10" ry="16" stroke="#222" strokeWidth="5" fill="none" /> {/* Left Eye */}
        <ellipse cx="120" cy="140" rx="10" ry="16" stroke="#222" strokeWidth="5" fill="none" /> {/* Right Eye */}
        <ellipse cx="100" cy="170" rx="12" ry="8" stroke="#222" strokeWidth="5" fill="none" /> {/* Nose */}
        <path d="M100 178 Q100 190 120 190" stroke="#222" strokeWidth="5" fill="none" /> {/* Smile */}
        <path d="M100 178 Q100 190 80 190" stroke="#222" strokeWidth="5" fill="none" /> {/* Smile */}
      </g>
    ),
  },
  {
    name: 'Dog',
    svg: (
      <g>
        <ellipse cx="100" cy="140" rx="80" ry="60" stroke="#222" strokeWidth="7" fill="none" /> {/* Face */}
        <ellipse cx="50" cy="80" rx="30" ry="40" stroke="#222" strokeWidth="7" fill="none" /> {/* Left Ear */}
        <ellipse cx="150" cy="80" rx="30" ry="40" stroke="#222" strokeWidth="7" fill="none" /> {/* Right Ear */}
        <ellipse cx="80" cy="140" rx="10" ry="16" stroke="#222" strokeWidth="5" fill="none" /> {/* Left Eye */}
        <ellipse cx="120" cy="140" rx="10" ry="16" stroke="#222" strokeWidth="5" fill="none" /> {/* Right Eye */}
        <ellipse cx="100" cy="170" rx="12" ry="8" stroke="#222" strokeWidth="5" fill="none" /> {/* Nose */}
        <ellipse cx="100" cy="190" rx="30" ry="10" stroke="#222" strokeWidth="5" fill="none" /> {/* Mouth */}
      </g>
    ),
  },
  {
    name: 'Butterfly',
    svg: (
      <g>
        <ellipse cx="100" cy="140" rx="20" ry="40" stroke="#222" strokeWidth="7" fill="none" /> {/* Body */}
        <ellipse cx="60" cy="140" rx="30" ry="60" stroke="#222" strokeWidth="7" fill="none" /> {/* Left Wing */}
        <ellipse cx="140" cy="140" rx="30" ry="60" stroke="#222" strokeWidth="7" fill="none" /> {/* Right Wing */}
        <ellipse cx="100" cy="90" rx="18" ry="18" stroke="#222" strokeWidth="7" fill="none" /> {/* Head */}
        <ellipse cx="90" cy="80" rx="6" ry="12" stroke="#222" strokeWidth="3.5" fill="none" /> {/* Left Antenna */}
        <ellipse cx="110" cy="80" rx="6" ry="12" stroke="#222" strokeWidth="3.5" fill="none" /> {/* Right Antenna */}
      </g>
    ),
  },
  {
    name: 'Flower',
    svg: (
      <g>
        <ellipse cx="100" cy="140" rx="18" ry="18" stroke="#222" strokeWidth="7" fill="none" /> {/* Center */}
        {[...Array(8)].map((_, i) => (
          <ellipse
            key={i}
            cx={100 + 50 * Math.cos((i * Math.PI) / 4)}
            cy={140 + 50 * Math.sin((i * Math.PI) / 4)}
            rx="18" ry="30"
            stroke="#222"
            strokeWidth="7"
            fill="none"
            transform={`rotate(${i * 45} 100 140)`}
          />
        ))}
        <rect x="92" y="158" width="16" height="50" stroke="#222" strokeWidth="7" fill="none" /> {/* Stem */}
      </g>
    ),
  },
];
const palette = [
  '#ff595e','#ffca3a','#8ac926','#1982c4','#6a4c93','#fff','#000',
  '#f672a1','#f7b801','#a0c4ff','#bdb2ff','#caff70','#ffd6e0','#b5ead7','#fbe7c6','#f9c74f','#43aa8b','#577590','#f94144','#f3722c','#90be6d','#277da1'
];

export default function ColoringBook({ onHome }) {
  const [color, setColor] = useState('#ff595e');
  const [fills, setFills] = useState(Array(shapes.length).fill('#fff'));

  function fillShape(idx, e) {
    // Only fill if click is inside the SVG drawing area
    if (e && e.target.nodeName !== 'svg' && e.target.nodeName !== 'g') return;
    setFills(fills.map((f, i) => i === idx ? color : f));
  }

  function reset() {
    setFills(Array(shapes.length).fill('#fff'));
  }

  return (
    <div className="game-container" style={{position:'relative', maxWidth: 480, margin: '32px auto', boxSizing: 'border-box'}}>
      <h2>Coloring Book</h2>
      <div style={{marginBottom:12}}>Pick a color:</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: 8,
        margin: '0 auto 16px auto',
        width: '100%',
        maxWidth: 288,
        justifyItems: 'center',
        boxSizing: 'border-box',
      }}>
        {palette.map(c => (
          <button key={c} onClick={()=>setColor(c)} style={{background:c,width:28,height:28,border:color===c?'2px solid #333':'1px solid #aaa',borderRadius:8,margin:0,padding:0}} />
        ))}
      </div>
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
      <div style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap'}}>
        {shapes.map((shape, idx) => (
          <div key={shape.name} style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24}}>
            <svg width={200} height={240} style={{background:'#eee',borderRadius:24,cursor:'pointer',boxShadow:'0 4px 16px #0001'}} onClick={(e)=>fillShape(idx, e)}>
              {React.cloneElement(shape.svg, { fill: fills[idx] })}
            </svg>
            <div style={{marginTop:8,fontWeight:'bold',fontSize:18,color:'#333'}}>{shape.name}</div>
          </div>
        ))}
      </div>
      <button onClick={reset} style={{marginTop:20}}>Reset Colors</button>
    </div>
  );
}
