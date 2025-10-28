// ...existing code...
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset-button');
const board = document.getElementById('board');
const modeSelect = document.getElementById('mode'); // Nuevo: selector de modo

// Estado del juego
let gameActive = true;
let currentPlayer = 'X';
let gameState = ["", "", "", "", "", "", "", "", ""]; // Representa el tablero (9 celdas)
let mode = modeSelect ? modeSelect.value : 'pvp'; // 'pvp' or 'pvc'

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

    // Si estamos en modo vs CPU, permitir clic solo cuando es el turno del jugador humano (X)
    if (mode === 'pvc' && currentPlayer !== 'X') {
        return;
    }

    // Actualiza el estado del juego y la interfaz
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();

    // Si modo vs CPU y el juego sigue activo y ahora es turno de la CPU, pedir movimiento
    if (mode === 'pvc' && gameActive && currentPlayer === 'O') {
        makeComputerMove();
    }
}

// Actualiza el estado y la interfaz después de un movimiento
function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase()); // Agrega clase para estilos (x o o)
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
        cell.innerHTML = "";
        cell.classList.remove('x');
        cell.classList.remove('o');
    });

    // Si se reinicia en modo vs CPU y la CPU fuera a jugar primero (no implementado por defecto),
    // podríamos arrancar su movimiento aquí. Actualmente CPU juega O, jugador X comienza.
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
// Estrategia: 1) gana si puede, 2) bloquea si el jugador puede ganar, 3) centro, 4) esquinas, 5) aleatorio

function makeComputerMove() {
    if (!gameActive) return;
    if (currentPlayer !== 'O') return;

    // Pequeña demora para simular "pensar"
    setTimeout(() => {
        const move = findBestMove('O');
        if (move === null) return;
        const cell = document.querySelector(`.cell[data-index="${move}"]`);
        if (!cell) return;
        handleCellPlayed(cell, move);
        handleResultValidation();
    }, 350);
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
// ...existing code...