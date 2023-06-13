
// var initialGlobals = Object.getOwnPropertyNames(window);

/*
 ** A Cell represents one "Square" on the board and can have one of
 ** 0: no token is in the square,
 ** 1: Player One's token,
 ** 2: Player Two's token
 */

const Cell = () => {
    let _value = '';

    // accept a player's token to change the value of the cell
    const addToken = (player) => {
        _value = player;
    };

    // How we will retrieve the current value of this cell through closure
    const getValue = () => _value;

    return {
        addToken,
        getValue,
    };
};

/*
 ** The GameBoard represents the state of the board
 ** Each square holds a Cell
 ** and we expose some functions that gamecontroller uses
 */

const GameBoard = (() => {
    const _rows = 3;
    const _columns = 3;
    const _board = [];

    // create a 2D array that will represent the state of the game board
    // For this 2D array, row 0 will represent the top row and
    // column 0 will represent the left-most column.
    // simple nested-loop to create 2D array.

    for (let i = 0; i < _rows; i++) {
        _board[i] = [];
        for (let j = 0; j < _columns; j++) {
            _board[i].push(Cell());
        }
    }

    // This will be the method of getting the entire board that our
    // UI will eventually need to render it.
    const getBoard = () => _board;

    const resetBoard = () => {
        for (let i = 0; i < _rows; i++) {
            for (let j = 0; j < _columns; j++) {
                _board[i][j].addToken('');
            }
        }
    };

    const pickSpot = (row, column, player) => {
        //    const availableCells = board.filter((row) => row[column].getValue() === 0).map(row => row[column]);
        // check to see if it's available cell
        if (_board[row][column].getValue() !== '') return false;
        _board[row][column].addToken(player);
        return true;
    };

    const printBoard = () => {
        for (let i = 0; i < _rows; i++) {
            let rowString = "";
            for (let j = 0; j < _columns; j++) {
                rowString += _board[i][j].getValue() + " ";
            }
            console.log(rowString.trim());
        }
        // const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        // console.log(boardWithCellValues);
    };

    return { getBoard, pickSpot, printBoard, resetBoard };
})();

/*
 ** The GameController will be ressponsible for controlling the
 ** flow and state of the game's turns, as well as whether
 ** anybody has won the game
 */

const GameController = (
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) => {

    let _gameState = {
        gameOver: false,
        isTie: false,
        winner: null
    };
    const _board = GameBoard;

    const _players = [
        {
            name: playerOneName,
            token: 'X',
        },
        {
            name: playerTwoName,
            token: 'O',
        },
    ];

    let activePlayer = _players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === _players[0] ? _players[1] : _players[0];
    };

    const getActivePlayer = () => activePlayer;

    const setActivePlayer = () => {
        activePlayer = _players[0];
    }

    const printNewRound = () => {
        _board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const isWinner = () => {
        const b = _board.getBoard();
        const token = activePlayer.token;
        // Check rows, columns, and diagonals for a winner
        return (
            [0, 1, 2].some((i) => b[i].every((cell) => cell.getValue() === token)) ||
            [0, 1, 2].some((i) => b.every((row) => row[i].getValue() === token)) ||
            b.every((row, i) => row[i].getValue() === token) ||
            b.every((row, i) => row[row.length - 1 - i].getValue() === token)
        );
    };

    const isTie = () => {
        return _board
            .getBoard()
            .every((row) => row.every((cell) => cell.getValue() !== ''));
    };

    const playRound = (row, column) => {

        if (isWinner() || isTie()) {
            return;
        }

        // Place a token for the current Player
        console.log(
            `Placing ${getActivePlayer().name}'s token into spot ${row}, ${column}...`
        );

        if (!_board.pickSpot(row, column, getActivePlayer().token)) {
            console.log("Spot is already taken.");
            return;
        }

        _board.pickSpot(row, column, getActivePlayer().token);

        if (isWinner() || isTie()) {
            getGameState();
            return;
        }


        // switch player turn
        switchPlayerTurn();
        printNewRound();

    };

    const resetGame = () => {
        _board.resetBoard();
        setActivePlayer();
    };

    const getGameState = () => {

        if (isWinner()) {
            console.log(`${getActivePlayer().name} wins!`);
            _gameState.gameOver = true;
            _gameState.winner = getActivePlayer();
        }

        if (isTie()) {
            console.log("It's a tie!!");
            _gameState.gameOver = true;
            _gameState.isTie = true;
        }

        return _gameState;

    };

    // Start Initial round
    printNewRound();

    return {
        playRound,
        getActivePlayer,
        getBoard: _board.getBoard,
        resetGame,
        getGameState
    };


};

const screenController = ((document) => {
    const game = GameController();
    const playerTurnDiv = document.querySelector(".turn");
    const boardDiv = document.querySelector(".board");
    const resetButton = document.querySelector('.reset');
    const gameStatusDiv = document.querySelector('.gameStatus');

    const updateScreen = (gameState) => {
        // clear the board
        boardDiv.textContent = "";

        // get the newest version of the board and player turn
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        playerTurnDiv.textContent = `${activePlayer.name}'s Turn...`;

        // Render board squares
        board.forEach((row, rowIdx) => {
            row.forEach((cell, index) => {
                // Anything clickable should be a button!!
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                // Create a data attribute to identify the column and row
                // makes it easier to pass into our 'playround' function
                cellButton.dataset.column = index;
                cellButton.dataset.row = rowIdx;
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild(cellButton);
            });
        });

        // Check and handle game state
        
        if (gameState.gameOver) {
            if (gameState.isTie) {
                playerTurnDiv.textContent = `It's a tie!!`
            } else if (gameState.winner) {
                playerTurnDiv.textContent = `${activePlayer.name} wins!!`
            }
        }


    };
    // Add event listener for the board
    function clickHandlerBoard(e) {
        const selectedColumn = e.target.dataset.column;
        const selectedRow = e.target.dataset.row;

        if (!selectedColumn) return;

        game.playRound(selectedRow, selectedColumn);
        const gameState = game.getGameState();
        updateScreen(gameState);
    }
    boardDiv.addEventListener("click", clickHandlerBoard);


    // Add event listener for the reset button
    function clickHandlerReset() {
        game.resetGame();
        updateScreen();
    }
    resetButton.addEventListener("click", clickHandlerReset);

    // Initial render
    updateScreen();

})(document);

// Find and log new global variables
// Test to see if any global variables were created
// goal is not to have any globals in window object
// var currentGlobals = Object.getOwnPropertyNames(window);
// var newGlobals = currentGlobals.filter(function(i) {
//     return initialGlobals.indexOf(i) === -1;
// });

// console.log("New global variables:", newGlobals);