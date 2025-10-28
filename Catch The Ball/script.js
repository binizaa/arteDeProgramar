
// 🎮 Juego: Catch the Ball
// Explicación: Mueves una barra con el mouse para atrapar una bola que cae.
// Si la atrapas, ganas puntos. Si no, se reinicia el juego.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🔧 Ajustes del lienzo
canvas.width = 400;
canvas.height = 600;

// 🏀 Configuración de la bola
let ball = {
  x: Math.random() * 380 + 10, // Posición aleatoria inicial (evita los bordes)
  y: 0,
  radius: 15,
  speed: 3,
  color: "red",
};

// 🧍 Control del jugador (la barra)
let catcher = {
  width: 80,
  height: 10,
  x: canvas.width / 2 - 40, // Centrado al inicio
  y: canvas.height - 40,
  color: "white",
};

let score = 0;
let mouseX = canvas.width / 2;
let musicStarted = false;

// ⚠ Audio sintetizado (sin archivo): Web Audio API
let audioCtx = null;
function initAudioIfNeeded() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Función para reproducir un beep corto al subir el score
function playScoreBeep() {
  try {
    initAudioIfNeeded();
    if (audioCtx.state === "suspended") {
      // resume normalmente se desbloquea con interacción (el mousemove ya llama startMusic)
      audioCtx.resume().catch(() => {});
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now); // tono
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    // silencioso si falla
    console.warn("Audio beep failed:", e);
  }
}

// ☁️ Nubes en el fondo
let clouds = [
  { x: 50, y: 100, size: 40 },
  { x: 250, y: 150, size: 50 },
  { x: 150, y: 200, size: 35 },
  { x: 320, y: 80, size: 45 },
  { x: 80, y: 250, size: 40 },
  { x: 300, y: 220, size: 55 },
];

// 🎵 Configuración de música
const bgMusic = document.getElementById("bgMusic");

// Función para iniciar la música
function startMusic() {
  if (!musicStarted && bgMusic) {
    bgMusic.volume = 0.3; // Volumen bajo para no molestar
    bgMusic.play().catch((e) => {
      console.log("💡 Música no disponible. Agrega un archivo jazz.mp3 en la carpeta del juego.");
    });
    musicStarted = true;
  }
  // Intentar inicializar AudioContext al primer movimiento (sin botón)
  initAudioIfNeeded();
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

// 🖱 Evento: mover el mouse
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  startMusic(); // Inicia la música / inicializa audio cuando mueves el mouse
});

// ⚙️ Actualizar posición y lógica
function update() {
  // Mueve la bola
  ball.y += ball.speed;

  // Actualiza la posición del catcher
  catcher.x = mouseX - catcher.width / 2;

  // 🧮 Detección de colisión (bola vs catcher)
  if (
    ball.y + ball.radius >= catcher.y &&
    ball.x >= catcher.x &&
    ball.x <= catcher.x + catcher.width
  ) {
    score++;
    // reproducir beep sintetizado cuando sube el score
    playScoreBeep();
    resetBall();
    // Aumenta un poco la dificultad cada 5 puntos
    if (score % 5 === 0) ball.speed += 0.5;
  }

  // 🚫 Si la bola cae fuera del canvas
  if (ball.y > canvas.height) {
    alert(`💀 Game Over! Score: ${score}`);
    score = 0;
    ball.speed = 3;
    resetBall();
  }
}

// 🔁 Reinicia la bola desde arriba
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

// 🎨 Dibujar todo en pantalla
function draw() {
  // Fondo azul cielo
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87CEEB");
  gradient.addColorStop(0.5, "#98D8F0");
  gradient.addColorStop(1, "#B0E0E6");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibuja las nubes
  clouds.forEach((cloud) => {
    drawCloud(cloud.x, cloud.y, cloud.size);
  });

  // Dibuja la bola
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();

  // Dibuja el catcher
  ctx.fillStyle = catcher.color;
  ctx.fillRect(catcher.x, catcher.y, catcher.width, catcher.height);

  // Dibuja el score
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 25);
}

// 🌀 Bucle del juego
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();