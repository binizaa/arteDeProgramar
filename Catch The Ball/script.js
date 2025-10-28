// 🎮 Catch the Ball
// Explicación: Mueves una barra con el mouse para atrapar una bola que cae.
// Si la atrapas, ganas puntos. Si no, se reinicia el juego.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 👇 Referencias a los controles de color
const ballColorInput = document.getElementById("ballColor");
const catcherColorInput = document.getElementById("catcherColor");

// 🎵 Música y botones
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const pauseBtn = document.getElementById("pauseBtn");

canvas.width = 400;
canvas.height = 600;

// 🏀 Bola
let ball = {
  x: Math.random() * 380 + 10,
  y: 0,
  radius: 15,
  speed: 3,
  color: ballColorInput.value,
};

// 🧍 Barra
let catcher = {
  width: 80,
  height: 10,
  x: canvas.width / 2 - 40,
  y: canvas.height - 40,
  color: catcherColorInput.value,
};

let score = 0;
let mouseX = canvas.width / 2;
let musicStarted = false;
let paused = false;

// ☁️ Nubes decorativas
let clouds = [
  { x: 50, y: 100, size: 40 },
  { x: 250, y: 150, size: 50 },
  { x: 150, y: 200, size: 35 },
  { x: 320, y: 80, size: 45 },
  { x: 80, y: 250, size: 40 },
  { x: 300, y: 220, size: 55 },
];

// ⚡ Sistema de audio (beep)
let audioCtx = null;
function initAudioIfNeeded() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playScoreBeep() {
  try {
    initAudioIfNeeded();
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    console.warn("Audio beep failed:", e);
  }
}

// 🟢 Iniciar música automáticamente
function startMusic() {
  if (!musicStarted && bgMusic) {
    bgMusic.volume = 0.3;
    bgMusic.play().then(() => {
      musicStarted = true;
      musicBtn.textContent = "⏸️ Pausar música";
      musicBtn.setAttribute("aria-pressed", "true");
    }).catch(() => {
      console.log("⚠️ El navegador bloqueó la reproducción automática. Usa el botón.");
    });
  }
  initAudioIfNeeded();
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

// 🖱 Movimiento del mouse
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  startMusic(); // inicia música en primera interacción
});

// 🔘 Botón de música
musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.volume = 0.3;
    bgMusic.play();
    musicBtn.textContent = "⏸️ Pausar música";
    musicBtn.setAttribute("aria-pressed", "true");
    musicStarted = true;
  } else {
    bgMusic.pause();
    musicBtn.textContent = "▶️ Reproducir música";
    musicBtn.setAttribute("aria-pressed", "false");
  }
});

// 🔘 Botón de pausa del juego
pauseBtn.addEventListener("click", () => {
  paused = !paused;
  if (paused) {
    pauseBtn.textContent = "▶️ Reanudar juego";
    pauseBtn.setAttribute("aria-pressed", "true");
    // Si quieres que también pause la música:
    bgMusic.pause();
    musicBtn.textContent = "▶️ Reproducir música";
    musicBtn.setAttribute("aria-pressed", "false");
  } else {
    pauseBtn.textContent = "⏸️ Pausar juego";
    pauseBtn.setAttribute("aria-pressed", "false");
    // Reanudar música
    if (bgMusic.paused) {
      bgMusic.play();
      musicBtn.textContent = "⏸️ Pausar música";
      musicBtn.setAttribute("aria-pressed", "true");
    }
  }
});

// 🎨 Actualizar colores
ballColorInput.addEventListener("input", (e) => {
  ball.color = e.target.value;
});
catcherColorInput.addEventListener("input", (e) => {
  catcher.color = e.target.value;
});

// ⚙️ Lógica del juego
function update() {
  ball.y += ball.speed;
  catcher.x = mouseX - catcher.width / 2;

  // Colisión bola-barra
  if (
    ball.y + ball.radius >= catcher.y &&
    ball.x >= catcher.x &&
    ball.x <= catcher.x + catcher.width
  ) {
    score++;
    playScoreBeep();
    resetBall();
    // Aumentar velocidad en cada captura
    ball.speed += 0.2; // Incremento más suave y gradual
  }

  // Si cae fuera del canvas
  if (ball.y > canvas.height) {
    alert(`💀 Game Over! Puntuación: ${score}`);
    score = 0;
    ball.speed = 3;
    resetBall();
  }
}

// 🔁 Reiniciar bola
function resetBall() {
  ball.x = Math.random() * (canvas.width - ball.radius * 2) + ball.radius;
  ball.y = 0;
}

// ☁️ Dibujar nubes
function drawCloud(x, y, size) {
  ctx.beginPath();
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.5, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.3, y - size * 0.5, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

// 🎨 Dibujar todo
function draw() {
  // Fondo
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87CEEB");
  gradient.addColorStop(0.5, "#98D8F0");
  gradient.addColorStop(1, "#B0E0E6");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Nubes
  clouds.forEach((cloud) => drawCloud(cloud.x, cloud.y, cloud.size));

  // Bola
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();

  // Barra (canasta)
  ctx.fillStyle = catcher.color;
  ctx.fillRect(catcher.x, catcher.y, catcher.width, catcher.height);
  drawBasket(catcher);

  // Score
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 25);

  // Si está en pausa, mostrar cartel
  if (paused) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("⏸️ Juego en pausa", canvas.width / 2, canvas.height / 2);
  }
}

// 🌀 Bucle del juego
function gameLoop() {
  if (!paused) {
    update();
    draw();
  } else {
    draw(); // Redibuja con overlay de pausa
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();

// 🧺 Canasta caricaturesca
function drawBasket(c) {
  const x = c.x;
  const y = c.y;
  const w = c.width;
  const h = c.height;

  ctx.save();
  const basketH = Math.max(h * 4, 24);
  const rx = w / 2;
  const ry = basketH;
  const cx = x + w / 2;
  const cy = y - basketH * 0.75;

  // Sombra
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, y + h, rx, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base
  ctx.fillStyle = '#8B5A2B';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  ctx.lineTo(cx - rx, cy);
  ctx.lineTo(cx + rx, cy);
  ctx.closePath();
  ctx.fill();

  // Interior claro
  ctx.fillStyle = '#C27C4A';
  ctx.beginPath();
  ctx.ellipse(cx, cy - ry * 0.12, rx * 0.9, ry * 0.72, 0, 0, Math.PI);
  ctx.lineTo(cx - rx * 0.9, cy);
  ctx.lineTo(cx + rx * 0.9, cy);
  ctx.closePath();
  ctx.fill();

  // Borde
  ctx.strokeStyle = '#6B3E1C';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  ctx.stroke();

  // Textura
  ctx.strokeStyle = '#A0522D';
  ctx.lineWidth = 1.5;
  for (let i = 1; i <= 3; i++) {
    const factor = 1 - i * 0.18;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.12, rx * factor, ry * 0.72, 0, 0, Math.PI);
    ctx.stroke();
  }

  // Carita simpática
  const faceX = cx;
  const faceY = cy + ry * 0.1;
  const eyeOffset = Math.min(w * 0.14, 10);

  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(faceX - eyeOffset, faceY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(faceX + eyeOffset, faceY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(faceX - eyeOffset, faceY, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(faceX + eyeOffset, faceY, 1.8, 0, Math.PI * 2); ctx.fill();

  // Sonrisa
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(faceX, faceY + 2, 6, 0, Math.PI, false);
  ctx.stroke();

  ctx.restore();
}
