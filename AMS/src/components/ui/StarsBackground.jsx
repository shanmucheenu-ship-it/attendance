import React, { useRef, useEffect } from 'react';
import { cn } from './Button';

export const StarsBackground = ({ starColor = "#000", className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let stars = [];
    // Adjust density based on screen size
    const numStars = window.innerWidth < 768 ? 50 : 150;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          vx: Math.random() * 0.3 - 0.15,
          vy: Math.random() * 0.3 - 0.15,
          alpha: Math.random() * 0.5 + 0.3,
          alphaChange: (Math.random() - 0.5) * 0.02,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.globalAlpha = star.alpha;
        ctx.fill();

        star.x += star.vx;
        star.y += star.vy;
        star.alpha += star.alphaChange;

        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
        
        if (star.alpha <= 0.1 || star.alpha >= 0.8) {
          star.alphaChange = -star.alphaChange;
        }
      });
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [starColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
    />
  );
};
