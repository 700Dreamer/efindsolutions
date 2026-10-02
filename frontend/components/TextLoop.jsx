"use client";

import { useMemo } from 'react';
import './TextLoop.css';

const TextLoop = ({
  text = 'Laser Metal Engraving ✦ Custom Garment Embroidery ✦ GPS Vehicle Telemetry ✦ Corporate Brand Packaging ✦ Garment Printing ✦ Rapid Doorstep Dispatch',
  speed = 40,
  direction = 'forward',
  separator = '✦',
  fontSize = 20,
  fontWeight = 800,
  letterSpacing = 2,
  uppercase = true,
  color = '#ffffff',
  ribbon = true,
  ribbonColor = '#087FEF',
  pauseOnHover = true,
  className = '',
  style = {}
}) => {
  const items = useMemo(() => {
    const raw = String(text);
    const parts = separator ? raw.split(separator).map(s => s.trim()).filter(Boolean) : [raw];
    return parts;
  }, [text, separator]);

  const formattedText = uppercase ? text.toUpperCase() : text;

  // Duplicate stream items to ensure infinite seamless loop
  const stream = [...items, ...items, ...items, ...items];

  const durationStyle = {
    animationDuration: `${Math.max(15, 1200 / speed)}s`,
    animationDirection: direction === 'reverse' ? 'reverse' : 'normal',
  };

  return (
    <div
      className={`text-loop-marquee-container ${pauseOnHover ? 'hover:pause' : ''} ${className}`.trim()}
      style={{
        backgroundColor: ribbon ? ribbonColor : 'transparent',
        ...style,
      }}
    >
      <div className="text-loop-track" style={durationStyle}>
        {stream.map((item, idx) => (
          <span
            key={idx}
            className="text-loop-item"
            style={{
              fontSize: `${fontSize}px`,
              fontWeight,
              letterSpacing: `${letterSpacing}px`,
              color,
            }}
          >
            <span className="text-loop-word">{uppercase ? item.toUpperCase() : item}</span>
            {separator && <span className="text-loop-sep">{separator}</span>}
          </span>
        ))}
      </div>

      {/* Duplicate track for seamless infinite marquee */}
      <div className="text-loop-track" style={durationStyle} aria-hidden="true">
        {stream.map((item, idx) => (
          <span
            key={`dup-${idx}`}
            className="text-loop-item"
            style={{
              fontSize: `${fontSize}px`,
              fontWeight,
              letterSpacing: `${letterSpacing}px`,
              color,
            }}
          >
            <span className="text-loop-word">{uppercase ? item.toUpperCase() : item}</span>
            {separator && <span className="text-loop-sep">{separator}</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TextLoop;
