/*
 ** A Cell represents one "Square" on the board and can have one of
 ** 0: no token is in the square,
 ** 1: Player One's token,
 ** 2: Player Two's token
 */

const Cell = () => {
  let value = 0;

  // accept a player's token to change the value of the cell
  const addToken = (player) => {
    value = player;
  };

  // How we will retrieve the current value of this cell through closure
  const getValue = () => value;

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
  const rows = 3;
  const columns = 3;
  const board = [];

  // create a 2D array that will represent the state of the game board
  // For this 2D array, row 0 will represent the top row and
  // column 0 will represent the left-most column.
  // simple nested-loop to create 2D array.

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  // This will be the method of getting the entire board that our
  // UI will eventually need to render it.
  const getBoard = () => board;

  const pickSpot = (row, column, player) => {
    //    const availableCells = board.filter((row) => row[column].getValue() === 0).map(row => row[column]);
    // check to see if it's available cell
    if (board[row][column].getValue() !== 0) return false;
    board[row][column].addToken(player);
    return true;
  };

  const printBoard = () => {
    for (let i = 0; i < rows; i++) {
      let rowString = "";
      for (let j = 0; j < columns; j++) {
        rowString += board[i][j].getValue() + " ";
      }
      console.log(rowString.trim());
    }
    // const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
    // console.log(boardWithCellValues);
  };

  return { getBoard, pickSpot, printBoard };
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
  const board = GameBoard;

  const players = [
    {
      name: playerOneName,
      token: 1,
    },
    {
      name: playerTwoName,
      token: 2,
    },
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const isWinner = () => {
    const b = board.getBoard();
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
    return board
      .getBoard()
      .every((row) => row.every((cell) => cell.getValue() !== 0));
  };

  const playRound = (row, column) => {

    if (isWinner() || isTie()) {
      console.log("Game Over. Start a new game.");
      return;
    }
    
    // Place a token for the current Player
    console.log(
      `Placing ${getActivePlayer().name}'s token into spot ${row}, ${column}...`
    );

    if (!board.pickSpot(row, column, getActivePlayer().token)) {
      console.log("Spot is already taken.");
      return;
    }
    board.pickSpot(row, column, getActivePlayer().token);

    if (isWinner()) {
      console.log(`${getActivePlayer().name} wins!`);
      return;
    }

    if (isTie()) {
      console.log("It's a tie!!");
      return;
    }

    // switch player turn
    switchPlayerTurn();
    printNewRound();
  };

  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
  };
};

const screencontroller = ((document) => {
  const game = GameController();
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");

  const updateScreen = () => {
    // clear the board
    boardDiv.textContent = "";

    // get the newest version of the board and player turn
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    // display player's turn
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
  };
  // Add event listener for the board
  function clickHandlerBoard(e) {
    const selectedColumn = e.target.dataset.column;
    const selectedRow = e.target.dataset.row;

    if (!selectedColumn) return;

    game.playRound(selectedRow, selectedColumn);
    updateScreen();
  }
  boardDiv.addEventListener("click", clickHandlerBoard);

  // Initial render
  updateScreen();
})(document);

