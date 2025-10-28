const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset-button');
const board = document.getElementById('board');

// Estado del juego
let gameActive = true;
let currentPlayer = 'X';
let gameState = ["", "", "", "", "", "", "", "", ""]; 

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
const currentPlayerTurn = () => `Turno de: **${currentPlayer}**`;
const winningMessage = () => `¡El jugador **${currentPlayer}** ha ganado! 🎉`;
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

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation(); // Esta función ahora tiene la lógica nueva

    if (gameActive) { 
        startTimer();
    } else {
        stopTimer(); 
    }
}

// Actualiza el estado y la interfaz después de un movimiento
function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase()); 
}

// ===========================================
//     👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 👇
// ===========================================
function handleResultValidation() {
    let roundWon = false;
    let winningConditionIndex = -1; // Para guardar QUÉ condición ganó (0-7)

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
            winningConditionIndex = i; // Guardamos el índice (0-7) de la condición ganadora
            break; 
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        gameActive = false; 
        stopTimer(); 

        // ❗️MODIFICADO: Aplicamos la clase de victoria al TABLERO, no a las celdas
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
    currentPlayer = 'X';
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();

    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('x');
        cell.classList.remove('o');
    });

    // ❗️MODIFICADO: Limpiamos todas las clases de victoria del TABLERO
    for (let i = 0; i < 8; i++) {
        board.classList.remove(`win-condition-${i}`);
    }

    startTimer();
}

// Añade los 'event listeners' (escuchadores de eventos)
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', handleRestartGame);