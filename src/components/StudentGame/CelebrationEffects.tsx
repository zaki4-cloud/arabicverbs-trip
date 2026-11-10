import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  shape: 'rect' | 'circle' | 'star';
  opacity: number;
}

interface ConfettiProps {
  onComplete?: () => void;
  particleCount?: number;
}

export const ConfettiBurst: React.FC<ConfettiProps> = ({ onComplete, particleCount = 36 }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#10B981', '#F59E0B', '#06B6D4', '#EC4899', '#8B5CF6', '#FBBF24', '#34D399'];
    const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'circle', 'star'];
    const initial: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const speed = 2.5 + Math.random() * 5.5;
      initial.push({
        id: i,
        x: 50, // center in percent
        y: 45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // slightly upward bias
        size: 7 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: 1,
      });
    }

    setParticles(initial);

    let animationFrameId: number;
    let elapsed = 0;

    const animate = () => {
      elapsed += 16;
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.45,
            y: p.y + p.vy * 0.45,
            vy: p.vy + 0.12, // subtle gravity
            rotation: p.rotation + 8,
            opacity: Math.max(0, p.opacity - 0.022),
          }))
          .filter((p) => p.opacity > 0.05)
      );

      if (elapsed < 1400) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          className="absolute transition-transform duration-75"
        >
          {p.shape === 'circle' ? (
            <div
              className="w-full h-full rounded-full shadow-sm"
              style={{ backgroundColor: p.color }}
            />
          ) : p.shape === 'rect' ? (
            <div
              className="w-full h-full rounded-xs shadow-sm"
              style={{ backgroundColor: p.color }}
            />
          ) : (
            <svg viewBox="0 0 24 24" fill={p.color} className="w-full h-full drop-shadow">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

// Floating score points notification (+50 ✨)
interface FloatingScoreProps {
  points: number;
  x?: number; // percent
  y?: number;
  onComplete: () => void;
}

export const FloatingScoreBadge: React.FC<FloatingScoreProps> = ({ points, x = 50, y = 50, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-float-fade flex items-center gap-1 bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-full shadow-2xl border-2 border-white text-sm sm:text-base tabular-nums select-none"
    >
      <span>+{points}</span>
      <span>💎</span>
    </div>
  );
};
