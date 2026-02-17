document.addEventListener('DOMContentLoaded', () => {
  console.log("CERN Magnetic Confinement System: ONLINE");

  // ─── CONFIGURATION & PHYSICS CONSTANTS ───
  const maxTilt = 8;
  const transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
  const gridSpacing = 70;      // Distance between grid lines
  const warpRadius = 100;       // How far the "magnetic field" reach is
  const warpStrength = 55;      // Intensity of the line bending
  const gridOpacity = 0.1;     // Visibility of the grid lines

  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let stars = [], pulses = [], dataBits = [];

  // ─── 1. SELF-INJECT BACKGROUND STYLES ───
  const style = document.createElement('style');
  style.textContent = `
    #bg-canvas {
      position: fixed;
      top: -10%; left: -10%;
      width: 120%; height: 120%;
      z-index: -999;
      background: #020205; /* Matches your --vacuum-black */
      pointer-events: none;
    }
    /* Ensuring the body doesn't hide the canvas */
    body { background-color: transparent !important; }
  `;
  document.head.appendChild(style);

  // ─── 2. CANVAS INITIALIZATION ───
  let canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const initScene = () => {
    canvas.width = window.innerWidth * 1.2;
    canvas.height = window.innerHeight * 1.2;
    
    // Generate static stars
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.8,
      alpha: Math.random(),
      speed: Math.random() * 0.01 + 0.005
    }));

    // Generate floating hex/binary data
    dataBits = Array.from({ length: 15 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      text: Math.random() > 0.5 ? "101" : "0x" + Math.floor(Math.random()*16).toString(16).toUpperCase(),
      speed: Math.random() * 0.4 + 0.1
    }));
  };

  // ─── 3. CORE PHYSICS DRAWING ───

  function drawMagneticGrid() {
    ctx.strokeStyle = `rgba(0, 255, 255, ${gridOpacity})`;
    ctx.lineWidth = 1;

    // Vertical Lines
    for (let x = 0; x <= canvas.width; x += gridSpacing) {
      ctx.beginPath();
      for (let y = 0; y <= canvas.height; y += 20) {
        const dx = mouse.x - x;
        const dy = mouse.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const warp = dist < warpRadius ? (1 - dist / warpRadius) * warpStrength : 0;
        
        // Pull the line point toward the mouse cursor
        const moveX = (dx / dist || 0) * warp;
        const moveY = (dy / dist || 0) * warp;
        ctx.lineTo(x + moveX, y + moveY);
      }
      ctx.stroke();
    }

    // Horizontal Lines
    for (let y = 0; y <= canvas.height; y += gridSpacing) {
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 20) {
        const dx = mouse.x - x;
        const dy = mouse.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const warp = dist < warpRadius ? (1 - dist / warpRadius) * warpStrength : 0;

        const moveX = (dx / dist || 0) * warp;
        const moveY = (dy / dist || 0) * warp;
        ctx.lineTo(x + moveX, y + moveY);
      }
      ctx.stroke();
    }
  }

  function drawAnnihilation() {
    if (Math.random() < 0.01) { // 1% chance per frame to create a particle event
      pulses.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: 0, a: 0.4 });
    }
    pulses.forEach((p, i) => {
      p.r += 2.5;
      p.a -= 0.008;
      if (p.a <= 0) pulses.splice(i, 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(188, 19, 254, ${p.a})`; // Extraction Purple
      ctx.stroke();
    });
  }

  function animate() {
    // Smooth Mouse Tracking for the Grid Warp
    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background Radial Glow
    const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, warpRadius * 1.5);
    grd.addColorStop(0, 'rgba(0, 40, 80, 0.1)');
    grd.addColorStop(1, '#020205');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMagneticGrid();
    drawAnnihilation();

    // Drifting Data
    ctx.font = "10px monospace";
    dataBits.forEach(b => {
      b.y -= b.speed;
      if (b.y < 0) b.y = canvas.height;
      ctx.fillStyle = "rgba(0, 255, 255, 0.15)";
      ctx.fillText(b.text, b.x, b.y);
    });

    // Twinkling Stars
    stars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    requestAnimationFrame(animate);
  }

  // ─── 4. PARALLAX INTERACTION ───
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;

    const xVal = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const yVal = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

    // Target elements based on your provided screenshots
    const layers = [
      { el: canvas, depth: 0.1 },
      { el: document.getElementById('ui-grid'), depth: 0.4 },
      { el: document.querySelector('.beam-profile-box'), depth: 1.2 },
      { el: document.querySelector('[ION_SOURCE_CONTROL]'), depth: 1.5 }
    ];

    layers.forEach(({ el, depth }) => {
      if (!el) return;
      const rotX = yVal * maxTilt * depth;
      const rotY = -xVal * maxTilt * depth;
      const moveX = xVal * 25 * depth;
      const moveY = yVal * 25 * depth;

      el.style.transition = transition;
      el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  });

  window.addEventListener('resize', initScene);
  initScene();
  animate();
});