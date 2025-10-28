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
const currentPlayerTurn = () => `Turno de: ${currentPlayer}`;
const winningMessage = () => `¡El jugador ${currentPlayer} ha ganado! 🎉`;
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
}

// Añade los 'event listeners' (escuchadores de eventos)
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', handleRestartGame);