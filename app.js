
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
** the player represents the action objects of the game
** each player has a name and a symbol by which
** they represent themselves
*/
const Player = (name, symbol) => {
    let _name = name;
    let _symbol = symbol;

    const getName = () => {
        return _name;
    }

    const getSymbol = () => _symbol;

    const setSymbol = (newSymbol) => {
        _symbol = newSymbol;
    }

    return {
        getName,
        getSymbol,
        setSymbol
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
                let value = _board[i][j].getValue() != "" ? _board[i][j].getValue() : "?"
                rowString += value + " ";
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
    playerOne = Player("Player One", 'X'),
    playerTwo = Player("Player Two", 'O')
) => {

    // const observers = [];
    // const addObserver = (observer) => {
    //     observers.push(observer);
    // };
    // const notifyObservers = (_gameState) => {
    //     observers.forEach(observer => observer(_gameState));
    // }

    const _board = GameBoard;

    let _gameState = {
        gameOver: false,
        isTie: false,
        winner: null,
    }

    const _players = [playerOne, playerTwo];

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
        console.log(`${getActivePlayer().getName()}'s turn.`);
    };

    const isWinner = () => {
        const b = _board.getBoard();
        const token = getActivePlayer().getSymbol();
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
            `Placing ${getActivePlayer().getName()}'s token into spot ${row}, ${column}...`
        );

        if (!_board.pickSpot(row, column, getActivePlayer().getSymbol())) {
            console.log("Spot is already taken.");
            return;
        }

        _board.pickSpot(row, column, getActivePlayer().getSymbol());

        if (isWinner()) {
            _gameState.gameOver = true;
            _gameState.winner = getActivePlayer().getName();
            return;
        } else if (isTie()) {
            _gameState.gameOver = true;
            _gameState.isTie = true;
        }

        // switch player turn
        switchPlayerTurn();
        printNewRound();
        //notifyObservers()

    };

    const resetGame = () => {
        _board.resetBoard();
        resetGameState();
        setActivePlayer();
    };

    const resetGameState = () => {
        _gameState.gameOver = false,
            _gameState.isTie = false,
            _gameState.winner = null
            ;

    }

    const getGameState = () => {
        return _gameState;
    };

    // Start Initial round
    printNewRound();

    return {
        playRound,
        getActivePlayer,
        getBoard: _board.getBoard,
        resetGame,
        getGameState,
        //addObserver
    };


};

const screenController = ((document) => {
    const playerTurnDiv = document.querySelector(".turn");
    const boardDiv = document.querySelector(".board");
    const resetButton = document.querySelector('.reset');
    const playerForm = document.querySelector('.player_form');
    let game = {}; // private variable to hold the game instance
    var firstPlayerSymbols = document.querySelectorAll('input[name="first_player_symbol"]');
    var secondPlayerSymbols = document.querySelectorAll('input[name="second_player_symbol"]');
    let newGameButton = document.querySelector('.new_game');
    let displayedMessages = {};

    let duringTurnMessages = [
        "{player}, unleash your {symbol}!",
        "{player}, it's time to make your mark!",
        "The battlefield awaits, {player}!",
        "Make it count, {player}!",
        "{player}, remember: great power comes with great responsibility!",
        "{player}, may the {symbol} be with you!",
        "Step right up, {player}! The spotlight is on you!",
        "{player}, time to spin the wheel of fortune!"
    ]

    let tieMessages = [
        "It's a stalemate, folks! The duel was too intense for a victor.",
        "Well, that's a wrap! Nobody won, but nobody lost either!",
        "The battle of wits ends in a draw! Play again for eternal glory?",
        "A tie! The tension was palpable, but the gods have decided on no victor this day."
    ]

    let winMessages = [
        "{player} stands victorious! The crowd goes wild!",
        "{player} triumphs! The {symbol}'s have it!",
        "And that's a wrap! {player} and their {symbol} takes the cake!",
        "{player} {symbol}’s strategy paid off! A round of applause for the victor!",
        "The dust settles and {player} emerges as the champion!",
        "{player} has conquered the board! Well played!",
        "The stars have aligned for {player} today! A well-deserved victory!",
        "Epic win for {player}! The Tic Tac Toe legend continues!",
    ]

    const originalDuringTurnMessages = [...duringTurnMessages];
    const originalTieMessages = [...tieMessages];
    const originalWinMessages = [...winMessages];


    document.getElementById("overlay").addEventListener("click", function (event) {
        document.getElementById("modal").classList.add("hidden");
    })

    const getRandomMessage = (messagesArray) => {
        const randomIndex = Math.floor(Math.random() * messagesArray.length);
        return messagesArray.splice(randomIndex, 1)[0];
    }

    const displayDuringTurnMessage = () => {
        const activePlayerName = game.getActivePlayer().getName();
        console.log(activePlayerName);
        if (!displayedMessages[activePlayerName]) {
            displayedMessages[activePlayerName] = [];
        }
        let availableMessages = duringTurnMessages.filter(message => !displayedMessages[activePlayerName].includes(message));

        if (availableMessages.length === 0) {
            // Reset the displayed messages for the player if all have been shown.
            displayedMessages[activePlayerName] = [];
            availableMessages = duringTurnMessages;
        }

        const message = getRandomMessage(availableMessages);
        displayedMessages[activePlayerName].push(message);

        const formattedMessage = message.replace('{player}', activePlayerName).replace('{symbol}', game.getActivePlayer().getSymbol());
        return formattedMessage;
    }

    const resetMessages = () => {
        duringTurnMessages = [...originalDuringTurnMessages]
        winMessages = [...originalWinMessages];
        tieMessages = [...originalTieMessages];
    }

    const displayTieMessage = () => {
        const message = getRandomMessage(tieMessages);
        return message;
    }

    const displayWinMessage = () => {
        const message = getRandomMessage(winMessages);
        const player = game.getActivePlayer();
        const formattedMessage = message.replace('{player}', player.getName()).replace('{symbol}', player.getSymbol());
        return formattedMessage;
    }

    const updateScreen = () => {
        // clear the board
        boardDiv.textContent = "";

        // get the newest version of the board, player turn, and gameState
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();
        const gameState = game.getGameState();


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

        // Check and game state for the screen
        if (gameState.gameOver) {
            if (gameState.winner) {
                let winMessage = displayWinMessage();
                playerTurnDiv.textContent = `${winMessage}`
            } else if (gameState.isTie) {
                let tieMessage = displayTieMessage();
                playerTurnDiv.textContent = `${tieMessage}`
            }
        } else {
            let turnMessage = displayDuringTurnMessage();
            playerTurnDiv.textContent = `${turnMessage}`;
        }


    };

    const initialize = () => {
        //game.addObserver((gameState) => updateScreen());

        // Add event listeners here.
        boardDiv.addEventListener("click", clickHandlerBoard);
        resetButton.addEventListener("click", clickHandlerReset);

        // Initial render
        updateScreen();
    }

    // Add event listener for the board
    function clickHandlerBoard(e) {
        const selectedColumn = e.target.dataset.column;
        const selectedRow = e.target.dataset.row;

        if (!selectedColumn) return;
        if (game.getGameState().gameOver === true) return;
        game.playRound(selectedRow, selectedColumn);
        updateScreen();
    }

    // Add event listener for the reset button
    function clickHandlerReset() {
        game.resetGame();
        resetMessages();
        updateScreen();
    }

    // Add event listener for the player submit button
    function clickStartGame(e) {
        e.preventDefault();

        const playerOneName = document.getElementById("first_player").value;
        const playerTwoName = document.getElementById("second_player").value;
        const playerOneSymbol = document.querySelector('input[name="first_player_symbol"]:checked').value;
        console.log(playerOneSymbol)
        const playerTwoSymbol = document.querySelector('input[name="second_player_symbol"]:checked').value;

        let playerOne = Player(playerOneName, playerOneSymbol);
        let playerTwo = Player(playerTwoName, playerTwoSymbol);

        game = GameController(playerOne, playerTwo);
        game.resetGame();
        resetMessages();
        initialize();

        // clear form
        document.querySelector('.player_form').reset();

        // Hide form
        document.getElementById("modal").classList.add("hidden");
    }
    playerForm.addEventListener("submit", clickStartGame);

    // Add event listener for the new game button
    function clickStartNewGame(e) {
        e.preventDefault();
        document.getElementById("modal").classList.remove("hidden");

    }
    newGameButton.addEventListener("click", clickStartNewGame);

    // Add an event listener to the first player's radio buttons
    firstPlayerSymbols.forEach(function (radio) {
        radio.addEventListener("change", function () {
            updateSecondPlayerChoices(radio.value);
        });
    });

    // Function to update the second player's choices
    function updateSecondPlayerChoices(selectedSymbol) {
        secondPlayerSymbols.forEach(function (radio) {
            if (radio.value === selectedSymbol) {
                radio.disabled = true; // Disable the matching choice
                radio.checked = false; // uncheck the disabled radio button
            } else {
                radio.disabled = false; // Enable the other choice
                radio.checked = true;
                if (!Array.from(secondPlayerSymbols).some(r => r.checked && !r.disabled)) {
                    radio.checked = true; // Select the enabled choice if nothing is selected
                }
            }
        });
    }

    // Call this function initially to set the state
    updateSecondPlayerChoices(document.querySelector('input[name="first_player_symbol"]:checked').value);

    return {
        initialize
    };

})(document);

// Find and log new global variables
// Test to see if any global variables were created
// goal is not to have any globals in window object
// var currentGlobals = Object.getOwnPropertyNames(window);
// var newGlobals = currentGlobals.filter(function(i) {
//     return initialGlobals.indexOf(i) === -1;
// });

// console.log("New global variables:", newGlobals);