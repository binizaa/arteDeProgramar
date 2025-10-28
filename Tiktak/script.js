const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset-button');
const board = document.getElementById('board');

// Estado del juego
let gameActive = true;
let currentPlayer = 'X';
let gameState = ["", "", "", "", "", "", "", "", ""]; // Representa el tablero (9 celdas)

// Posibilidades de victoria (índices de las celdas)
const winningConditions = [
    [0, 1, 2], // Fila superior
    [3, 4, 5], // Fila del medio
    [6, 7, 8], // Fila inferior
    [0, 3, 6], // Columna izquierda
    [1, 4, 7], // Columna del medio
    [2, 5, 8], // Columna derecha
    [0, 4, 8], // Diagonal principal
    [2, 4, 6]  // Diagonal secundaria
];

// Mensajes
const currentPlayerTurn = () => `Turno de: **${currentPlayer}**`;
const winningMessage = () => `¡El jugador **${currentPlayer}** ha ganado! 🎉`;
const drawMessage = () => `¡Es un empate! 🤝`;

// Inicializa el estado en la pantalla
statusDisplay.innerHTML = currentPlayerTurn();

// Función para manejar el clic en una celda
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Si la celda ya está ocupada o el juego no está activo, salimos
    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    // Actualiza el estado del juego y la interfaz
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

// Estilos de animación para los personajes
const styleSheet = document.createElement("style");
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

// Verifica si hay un ganador o un empate
function handleResultValidation() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue; // Si alguna celda está vacía, no hay victoria todavía
        }
        if (a === b && b === c) {
            roundWon = true;
            break; // ¡Hay un ganador!
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        gameActive = false; // Detiene el juego
        return;
    }

    // Verifica si hay un empate (todas las celdas están llenas y nadie ganó)
    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        gameActive = false;
        return;
    }

    // Si no hay ganador ni empate, cambiamos de jugador
    handlePlayerChange();
}

// Cambia el turno al siguiente jugador
function handlePlayerChange() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.innerHTML = currentPlayerTurn();
}

// Reinicia el juego
function handleRestartGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();

    cells.forEach(cell => {
        cell.innerHTML = ""; // Limpia los SVG
        cell.classList.remove('x');
        cell.classList.remove('o');
    });
}

// Añade los 'event listeners' (escuchadores de eventos)
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', handleRestartGame);