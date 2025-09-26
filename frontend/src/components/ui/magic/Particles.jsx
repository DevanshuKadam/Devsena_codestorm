import React, { useMemo } from 'react';

const Particles = ({
  count = 120,
  className = "",
  colors = ["#b7753b", "#d4a770", "#e4c9a4", "#ffffff"],
  size = [3, 7],
  opacity = 0.45,
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const s = Math.random() * (size[1] - size[0]) + size[0];
      const delay = Math.random() * 6;
      const duration = 8 + Math.random() * 10;
      const color = colors[i % colors.length];
      return { left, top, s, delay, duration, color, id: i };
    });
  }, [count, colors, size]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute rounded-full animate-float backdrop-blur-[0.5px]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.s}px`,
            height: `${p.s}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity,
            boxShadow: `0 0 8px ${p.color}40`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0) scale(1); }
          33% { transform: translateY(-18px) translateX(12px) scale(1.05); }
          66% { transform: translateY(-6px) translateX(-6px) scale(0.98); }
          100% { transform: translateY(0) translateX(0) scale(1); }
        }
        .animate-float { animation-name: float; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
      `}</style>
    </div>
  );
};

export default Particles;


