import React, { useEffect, useRef } from 'react';

export const Interactive3dBg = ({ intensity = 'normal' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle settings for 3D Botanical / Molecular dilution field
    const count = intensity === 'hero' ? 65 : 45;
    const fov = 350; // Camera field of view
    const points = [];

    // Colors matching emerald, mint, herbal gold
    const colors = [
      'rgba(16, 185, 129, ',  // Emerald
      'rgba(52, 211, 153, ',  // Mint
      'rgba(245, 158, 11, ',  // Amber/Gold
      'rgba(14, 165, 233, '   // Aqua dilution
    ];

    for (let i = 0; i < count; i++) {
      points.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 900,
        z: (Math.random() - 0.5) * 800,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2.8 + 1.2,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // Mouse interaction with smooth easing
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const handleMouseMove = (e) => {
      const mouseX = e.clientX - width / 2;
      const mouseY = e.clientY - height / 2;
      targetRotY = (mouseX / width) * 0.6;
      targetRotX = -(mouseY / height) * 0.6;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth camera interpolation
      rotX += (targetRotX - rotX) * 0.04;
      rotY += (targetRotY - rotY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Trigonometry for 3D rotation
      const cosY = Math.cos(rotY + time * 0.05);
      const sinY = Math.sin(rotY + time * 0.05);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const projected = [];

      // Update and project points in 3D
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Boundary wrapping in 3D box
        if (p.x > 600) p.x = -600;
        if (p.x < -600) p.x = 600;
        if (p.y > 450) p.y = -450;
        if (p.y < -450) p.y = 450;
        if (p.z > 400) p.z = -400;
        if (p.z < -400) p.z = 400;

        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Camera distance shift
        const cameraZ = z2 + 600;

        if (cameraZ > 30) {
          const scale = fov / cameraZ;
          const projX = x1 * scale + width / 2;
          const projY = y1 * scale + height / 2;
          const depthAlpha = Math.max(0.1, Math.min(0.85, (cameraZ - 100) / 700));
          const pulse = Math.sin(time * 2 + p.pulseOffset) * 0.5 + 0.5;

          projected.push({
            x: projX,
            y: projY,
            z: cameraZ,
            scale,
            radius: p.radius * scale,
            colorBase: p.colorBase,
            alpha: depthAlpha,
            pulse
          });
        }
      }

      // Draw 3D connecting molecular bonds
      const connectionDist = 130;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const lineAlpha = (1 - dist / connectionDist) * 0.18 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
            ctx.lineWidth = 0.8 * ((p1.scale + p2.scale) / 2);
            ctx.stroke();
          }
        }
      }

      // Draw projected nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        // Soft radial aura glow around each particle
        const glowRadius = Math.max(1, p.radius * 3.5);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, `${p.colorBase}${p.alpha * 0.7})`);
        grad.addColorStop(0.5, `${p.colorBase}${p.alpha * 0.25})`);
        grad.addColorStop(1, `${p.colorBase}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Solid particle core
        ctx.fillStyle = `${p.colorBase}${p.alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, p.radius), 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-60 transition-opacity duration-1000"
      />
      {/* Ambient gradient backlights for 3D depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute top-2/3 left-1/3 w-80 h-80 bg-amber-400/8 rounded-full blur-3xl" />
    </div>
  );
};

export default Interactive3dBg;
