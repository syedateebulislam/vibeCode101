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
  const [selectedShape, setSelectedShape] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  function fillShape(idx, e) {
    // Only fill if click is inside the SVG drawing area
    if (e && e.target.nodeName !== 'svg' && e.target.nodeName !== 'g') return;
    setFills(fills.map((f, i) => i === idx ? color : f));
  }

  function reset() {
    setFills(Array(shapes.length).fill('#fff'));
    setSelectedShape(0);
    setSelectedColorIndex(0);
  }

  // Navigation functions
  const nextColor = () => {
    const newIndex = (selectedColorIndex + 1) % palette.length;
    setSelectedColorIndex(newIndex);
    setColor(palette[newIndex]);
  };
  
  const prevColor = () => {
    const newIndex = selectedColorIndex === 0 ? palette.length - 1 : selectedColorIndex - 1;
    setSelectedColorIndex(newIndex);
    setColor(palette[newIndex]);
  };
  
  const nextShape = () => {
    setSelectedShape((selectedShape + 1) % shapes.length);
  };
  
  const prevShape = () => {
    setSelectedShape(selectedShape === 0 ? shapes.length - 1 : selectedShape - 1);
  };
  
  const fillSelectedShape = () => {
    fillShape(selectedShape);
  };

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
        🏠
      </button>
      <div style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap'}}>
        {shapes.map((shape, idx) => (
          <div key={shape.name} style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24}}>
            <svg 
              width={200} 
              height={240} 
              style={{
                background:'#eee',
                borderRadius:24,
                cursor:'pointer',
                boxShadow: selectedShape === idx ? '0 0 16px #ffe138' : '0 4px 16px #0001',
                border: selectedShape === idx ? '3px solid #ffe138' : 'none'
              }} 
              onClick={(e)=>fillShape(idx, e)}
            >
              {React.cloneElement(shape.svg, { fill: fills[idx] })}
            </svg>
            <div style={{marginTop:8,fontWeight:'bold',fontSize:18,color: selectedShape === idx ? '#ffe138' : '#333'}}>{shape.name}</div>
          </div>
        ))}
      </div>
      <button onClick={reset} style={{marginTop:20}}>Reset Colors</button>
      
      {/* Touch Control Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
        padding: '0 20px'
      }}>
        <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
          Touch Controls
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <button
            onTouchStart={prevColor}
            onClick={prevColor}
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
            title="Previous Color"
          >
            ⬅️
          </button>
          
          <div style={{
            width: 50,
            height: 50,
            background: color,
            border: '3px solid #333',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: color === '#fff' ? '#000' : '#fff',
            fontWeight: 'bold'
          }}>
            Color
          </div>
          
          <button
            onTouchStart={nextColor}
            onClick={nextColor}
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
            title="Next Color"
          >
            ➡️
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <button
            onTouchStart={prevShape}
            onClick={prevShape}
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
            title="Previous Shape"
          >
            ⬆️
          </button>
          
          <button
            onTouchStart={fillSelectedShape}
            onClick={fillSelectedShape}
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
              transition: 'all 0.1s',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none'
            }}
            title="Fill Selected Shape"
          >
            🎨
          </button>
          
          <button
            onTouchStart={nextShape}
            onClick={nextShape}
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
            title="Next Shape"
          >
            ⬇️
          </button>
        </div>
        
        <div style={{ color: '#666', fontSize: 12, textAlign: 'center', maxWidth: 300 }}>
          Use arrows to navigate colors/shapes, then tap 🎨 to fill
        </div>
      </div>
    </div>
  );
}
