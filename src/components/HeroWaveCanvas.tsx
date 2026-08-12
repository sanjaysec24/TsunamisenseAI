import React, { useEffect, useRef } from 'react';

export const HeroWaveCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      step += 0.015;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw mathematical ocean wave layers
      const waves = [
        { amplitude: 18, frequency: 0.008, speed: 0.02, color: 'rgba(14, 165, 233, 0.25)', yOffset: height * 0.6 },
        { amplitude: 25, frequency: 0.005, speed: 0.015, color: 'rgba(6, 182, 212, 0.18)', yOffset: height * 0.65 },
        { amplitude: 12, frequency: 0.012, speed: 0.025, color: 'rgba(59, 130, 246, 0.12)', yOffset: height * 0.7 }
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 5) {
          const y = wave.yOffset + Math.sin(x * wave.frequency + step * (wave.speed / 0.02)) * wave.amplitude + Math.cos(x * 0.003 + step * 0.5) * 8;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        ctx.fillStyle = wave.color;
        ctx.fill();

        // Stroke line on top edge
        ctx.strokeStyle = wave.color.replace('0.25', '0.6').replace('0.18', '0.5').replace('0.12', '0.4');
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw epicenter seismic wave ripple ring placeholders
      const centerX = width * 0.5;
      const centerY = height * 0.45;

      for (let r = 1; r <= 3; r++) {
        const radius = ((step * 25 + r * 60) % 220);
        const opacity = Math.max(0, 1 - radius / 220) * 0.25;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Epicenter point
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0ea5e9';
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
