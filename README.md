# Tic Tac Toe Game
This project is a web-based Tic Tac Toe game. The game is a part of The Odin Project's curriculum. The main focus of this project was to understand JavaScript modules and factories as well as separating concerns between game logic and screen logic.

![Screenshot of TTT Game]()

## Live Demo
[Live Demo Link](#) (Add link here)

## Features
<!-- - Play against computer. -->
<!-- - Displays the choice made by the player and the computer. -->
- Play against another player.
- Choice of symbols (X or O) for player.
- Displays the moves made by the player.
- Determines who wins the game
<!-- - Keeps track of the score for multiple games. -->
- Replay the game after it's over
- Engaging UI.


## Technology Stack
- HTML
- CSS
- JavaScript

## Highlights
### JavaScript
- Array manipulation to generate computer choice.
- Event listeners to capture user interactions.
- DOM manipulation to display content dynamically.
- Module patter for organizing code.
- Custom messages for winner, loser or tie.


<!-- check for a winner

function playRound(row, col) {
    if (!gameBoard.isEmptyCell(row, col) || isGameOver) return;
    
    gameBoard.setCell(row, col, currentPlayer.symbol);
    updateDisplay();
    
    if (gameBoard.hasWinner()) {
        endGame(currentPlayer);
    } else if (gameBoard.isFull()) {
        endGame(null);
    } else {
        switchPlayer();
    }
}
 -->
## CSS
- Flexbox for layout design.
- Custom CSS variables.

## Acknowledgments
This project is part of The Odin Project's curriculum.

## License
Distributed under the MIT License. See LICENSE for more information.

## Contact
Zachary Kahlig - zkahlig64@gmail.com
