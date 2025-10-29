const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset-button');
const board = document.getElementById('board');
const modeSelect = document.getElementById('mode');

// Estado del juego
let gameActive = true;
let currentPlayer = 'X';
let startingPlayer = 'X'; // Quién empieza la partida actual
let gameState = ["", "", "", "", "", "", "", "", ""];
let mode = modeSelect ? modeSelect.value : 'pvp';
let isProcessing = false; // Para evitar múltiples clics

// Posibilidades de victoria
const winningConditions = [
    [0, 1, 2], // Fila 0
    [3, 4, 5], // Fila 1
    [6, 7, 8], // Fila 2
    [0, 3, 6], // Col 0
    [1, 4, 7], // Col 1
    [2, 5, 8], // Col 2
    [0, 4, 8], // Diag 0
    [2, 4, 6]  // Diag 1
];

// Mensajes
const currentPlayerTurn = () => `Turno de: ${currentPlayer}`;
const winningMessage = () => `¡El jugador ${currentPlayer} ha ganado! 🎉`;
const drawMessage = () => `¡Es un empate! 🤝`;

statusDisplay.innerHTML = currentPlayerTurn();

// --- Lógica del temporizador (ESTO SE QUEDA IGUAL) ---
let timer; 
let timeLeft = 10; 
const timerDisplay = document.createElement('div'); 
timerDisplay.id = 'timer-display';
statusDisplay.parentNode.insertBefore(timerDisplay, statusDisplay.nextSibling); 

function startTimer() {
    if (timer) {
        clearInterval(timer);
    }
    timeLeft = 10;
    timerDisplay.textContent = `Tiempo restante: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Tiempo restante: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            timerDisplay.textContent = "¡Tiempo agotado!";
            handlePlayerChange();
            if (gameActive) { 
                startTimer();
            } else {
                timerDisplay.textContent = ""; 
            }
        }
    }, 1000); 
}

function stopTimer() {
    clearInterval(timer);
    timerDisplay.textContent = ""; 
}
startTimer();
// --- Fin de la lógica del temporizador ---

// Función para manejar el clic en una celda
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Prevenir clics múltiples o en celdas ocupadas
    if (gameState[clickedCellIndex] !== "" || !gameActive || isProcessing) {
        return;
    }

    // En modo vs CPU, solo permitir clics cuando es turno del jugador X
    if (mode === 'pvc' && currentPlayer === 'O') {
        return;
    }

    // Marcar que estamos procesando
    isProcessing = true;

    // Realizar el movimiento
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();

    if (gameActive) { 
        startTimer();
        
        // Si es modo vs CPU y ahora es turno de O, la computadora juega
        if (mode === 'pvc' && currentPlayer === 'O') {
            makeComputerMove();
        } else {
            isProcessing = false;
        }
    } else {
        stopTimer();
        isProcessing = false;
    }
}

// Estilos de animación para los personajes
const styleSheet = document.createElement("style");  //hola
styleSheet.textContent = `
    .cell {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        padding: 5px !important;
        border: 2px solid #333 !important;
        background-color: white !important;
    }
    .board {
        gap: 4px !important;
        background-color: #333 !important;
        padding: 4px !important;
        border: 2px solid #333 !important;
    }
    @keyframes floatX {
        0%, 100% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
    }
    @keyframes bounceO {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
    }
    .character-x {
        animation: floatX 3s ease-in-out infinite;
        transform-origin: center;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }
    .character-o {
        animation: bounceO 2s ease-in-out infinite;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }
`;
document.head.appendChild(styleSheet);

// Dibuja un personaje X estilizado en rojo
function drawXCharacter(cell) {
    const size = 80; // Aumentado de 60 a 80
    const svg = `
        <div class="character-x">
            <svg width="${size}" height="${size}" viewBox="0 0 60 60">
                <defs>
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
                    </filter>
                </defs>

                <!-- X sólida con relleno -->
                <g filter="url(#shadow)">
                    <path d="M15,15 L45,45 M45,15 L15,45" 
                          stroke="#ff4444" 
                          stroke-width="8" 
                          stroke-linecap="round"
                          fill="none"/>
                </g>

                <!-- Cara centrada -->
                <g transform="translate(30,30)">
                    <!-- Ojos grandes -->
                    <circle cx="-8" cy="0" r="7" fill="white" stroke="#ff4444" stroke-width="2"/>
                    <circle cx="8" cy="0" r="7" fill="white" stroke="#ff4444" stroke-width="2"/>
                    
                    <!-- Pupilas grandes -->
                    <circle cx="-8" cy="0" r="3.5" fill="#333"/>
                    <circle cx="8" cy="0" r="3.5" fill="#333"/>
                    
                    <!-- Brillos en los ojos -->
                    <circle cx="-10" cy="-2" r="2" fill="white"/>
                    <circle cx="6" cy="-2" r="2" fill="white"/>
                    
                    <!-- Mejillas -->
                    <circle cx="-12" cy="8" r="4" fill="#ff8888" opacity="0.6"/>
                    <circle cx="12" cy="8" r="4" fill="#ff8888" opacity="0.6"/>
                </g>
            </svg>
        </div>`;
    cell.innerHTML = svg;
}

// Dibuja un personaje O estilizado en azul pastel
function drawOCharacter(cell) {
    const size = 80; // Aumentado de 60 a 80
    const svg = `
        <div class="character-o">
            <svg width="${size}" height="${size}" viewBox="0 0 60 60">
                <defs>
                    <radialGradient id="OBodyGradient">
                        <stop offset="0%" stop-color="#a3c4ff"/>
                        <stop offset="100%" stop-color="#7fa8ff"/>
                    </radialGradient>
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
                    </filter>
                </defs>
                
                <!-- Cuerpo circular principal en azul pastel -->
                <circle cx="30" cy="30" r="22" 
                        fill="url(#OBodyGradient)" 
                        stroke="#6b8fd5" 
                        stroke-width="2"
                        filter="url(#shadow)"/>
                
                <!-- Cara -->
                <g transform="translate(30,30)">
                    <!-- Ojos extra grandes estilo anime -->
                    <!-- Fondo blanco de los ojos -->
                    <ellipse cx="-8" cy="-2" rx="8" ry="9" 
                             fill="white" stroke="#6b8fd5" stroke-width="1.5"/>
                    <ellipse cx="8" cy="-2" rx="8" ry="9" 
                             fill="white" stroke="#6b8fd5" stroke-width="1.5"/>
                    
                    <!-- Pupilas grandes -->
                    <circle cx="-8" cy="-2" r="4" fill="#333"/>
                    <circle cx="8" cy="-2" r="4" fill="#333"/>
                    
                    <!-- Brillos en los ojos -->
                    <circle cx="-10" cy="-4" r="2" fill="white"/>
                    <circle cx="6" cy="-4" r="2" fill="white"/>
                    
                    <!-- Mejillas más suaves -->
                    <circle cx="-12" cy="6" r="5" fill="#c4d8ff" opacity="0.8"/>
                    <circle cx="12" cy="6" r="5" fill="#c4d8ff" opacity="0.8"/>
                    
                    <!-- Boca feliz y suave -->
                    <path d="M-12,10 Q0,20 12,10" 
                          stroke="#6b8fd5" 
                          stroke-width="3" 
                          stroke-linecap="round"
                          fill="none"/>
                </g>
            </svg>
        </div>`;
    cell.innerHTML = svg;
}

// Actualiza el estado y la interfaz después de un movimiento
function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    // Dibuja el personaje correspondiente
    if (currentPlayer === 'X') {
        drawXCharacter(clickedCell);
    } else {
        drawOCharacter(clickedCell);
    }
    clickedCell.classList.add(currentPlayer.toLowerCase()); // Agrega clase para estilos adicionales
}

// ===========================================
//     👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 👇
// ===========================================
function handleResultValidation() {
    let roundWon = false;
    let winningConditionIndex = -1;

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue; 
        }
        if (a === b && b === c) {
            roundWon = true;
            winningConditionIndex = i;
            break; 
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        gameActive = false; 
        stopTimer(); 
        board.classList.add(`win-condition-${winningConditionIndex}`); 
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        gameActive = false;
        stopTimer(); 
        return;
    }

    // Cambiar de jugador solo si el juego continúa
    handlePlayerChange();
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.innerHTML = currentPlayerTurn();
}

// ===========================================
//     👇 Y AQUÍ SE LIMPIA ESA CLASE 👇
// ===========================================
function handleRestartGame() {
    gameActive = true;
    
    // Alternar quién empieza después de cada reinicio
    startingPlayer = startingPlayer === 'X' ? 'O' : 'X';
    currentPlayer = startingPlayer;
    
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();
    isProcessing = false;

    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('x');
        cell.classList.remove('o');
    });

    for (let i = 0; i < 8; i++) {
        board.classList.remove(`win-condition-${i}`);
    }

    startTimer();
    
    // Si es modo CPU y empieza O (la computadora), que haga su movimiento
    if (mode === 'pvc' && currentPlayer === 'O') {
        makeComputerMove();
    }
}

// Añade los 'event listeners' (escuchadores de eventos)
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', handleRestartGame);

// Nuevo: escucha cambios de modo
if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
        mode = e.target.value;
        handleRestartGame();
    });
}

// ---- Lógica simple de CPU ----
function makeComputerMove() {
    if (!gameActive) {
        isProcessing = false;
        return;
    }
    if (currentPlayer !== 'O') {
        isProcessing = false;
        return;
    }

    // Pequeña demora para simular "pensar"
    setTimeout(() => {
        const move = findBestMove('O');
        if (move === null) {
            isProcessing = false;
            return;
        }
        
        const cell = document.querySelector(`.cell[data-index="${move}"]`);
        if (!cell) {
            isProcessing = false;
            return;
        }
        
        handleCellPlayed(cell, move);
        handleResultValidation();
        
        if (gameActive) {
            startTimer();
        } else {
            stopTimer();
        }
        
        isProcessing = false;
    }, 500);
}

function findBestMove(player) {
    const opponent = player === 'O' ? 'X' : 'O';

    // 1) Ganar si es posible
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === "") {
            gameState[i] = player;
            if (checkWinFor(player)) {
                gameState[i] = "";
                return i;
            }
            gameState[i] = "";
        }
    }

    // 2) Bloquear al oponente si puede ganar
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === "") {
            gameState[i] = opponent;
            if (checkWinFor(opponent)) {
                gameState[i] = "";
                return i;
            }
            gameState[i] = "";
        }
    }

    // 3) Tomar centro si está libre
    if (gameState[4] === "") return 4;

    // 4) Tomar una esquina
    const corners = [0, 2, 6, 8];
    for (let c of corners) {
        if (gameState[c] === "") return c;
    }

    // 5) Cualquier espacio disponible (aleatorio)
    const empties = [];
    for (let i = 0; i < 9; i++) if (gameState[i] === "") empties.push(i);
    if (empties.length === 0) return null;
    return empties[Math.floor(Math.random() * empties.length)];
}

function checkWinFor(player) {
    for (let condition of winningConditions) {
        let [a, b, c] = condition;
        if (gameState[a] === player && gameState[b] === player && gameState[c] === player) {
            return true;
        }
    }
    return false;
}

// Si el modo es pvc y la CPU debe moverse al inicio (si quisieras permitir que CPU empiece),
// podrías comprobar aquí y llamar a makeComputerMove() cuando corresponda.