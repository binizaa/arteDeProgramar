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
}

// 🖱 Evento: mover el mouse
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  startMusic(); // Inicia la música cuando mueves el mouse
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
  // Reemplazamos la línea blanca por una canasta caricaturesca
  drawBasket(catcher);

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

// Dibuja una canasta caricaturesca y simpática en la posición del catcher
function drawBasket(c) {
  const x = c.x;
  const y = c.y;
  const w = c.width;
  const h = c.height;

  ctx.save();

  // Permitimos que la canasta sea visualmente más alta que el bbox original
  const basketH = Math.max(h * 4, 24);
  const rx = w / 2;
  const ry = basketH;
  const cx = x + w / 2; // centro horizontal
  const cy = y - basketH * 0.75; // centro vertical de la elipse (arriba del y del catcher)

  // Sombra debajo
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, y + h, rx, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cazo semicircular (ahora mirando hacia arriba)
  ctx.fillStyle = '#8B5A2B';
  ctx.beginPath();
  // Arco superior ahora mira hacia arriba
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  // Base recta ahora en la parte inferior
  ctx.lineTo(cx - rx, cy);
  ctx.lineTo(cx + rx, cy);
  ctx.closePath();
  ctx.fill();

  // Cavidad interior más clara para dar profundidad
  ctx.fillStyle = '#C27C4A';
  ctx.beginPath();
  ctx.ellipse(cx, cy - ry * 0.12, rx * 0.9, ry * 0.72, 0, 0, Math.PI);
  ctx.lineTo(cx - rx * 0.9, cy);
  ctx.lineTo(cx + rx * 0.9, cy);
  ctx.closePath();
  ctx.fill();

  // Borde/rim (trazo sobre el arco)
  ctx.strokeStyle = '#6B3E1C';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  ctx.stroke();

  // Líneas de tejido como arcos interiores para dar textura
  ctx.strokeStyle = '#A0522D';
  ctx.lineWidth = 1.5;
  for (let i = 1; i <= 3; i++) {
    const factor = 1 - i * 0.18;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.12, rx * factor, ry * 0.72, 0, 0, Math.PI);
    ctx.stroke();
  }

  // Carita simpática en la parte frontal del cuenco
  const faceX = cx;
  const faceY = cy + ry * 0.1; // Movemos la cara más abajo del centro
  const eyeOffset = Math.min(w * 0.14, 10);

  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(faceX - eyeOffset, faceY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(faceX + eyeOffset, faceY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(faceX - eyeOffset, faceY, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(faceX + eyeOffset, faceY, 1.8, 0, Math.PI * 2); ctx.fill();

  // Sonrisa feliz (curva hacia arriba)
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(faceX, faceY + 2, 6, 0, Math.PI, false); // false para curva hacia arriba
  ctx.stroke();

  ctx.restore();
}
