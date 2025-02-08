class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        this.isAIMode = true;
        this.difficulty = 'hard';
        this.AIDelay = 700; // milliseconds
        
        // DOM elements
        this.status = document.getElementById('status');
        this.cells = document.querySelectorAll('.cell');
        this.resetButton = document.getElementById('resetButton');
        this.scoreX = document.getElementById('scoreX');
        this.scoreO = document.getElementById('scoreO');
        this.playerX = document.querySelector('.player-x');
        this.playerO = document.querySelector('.player-o');
        this.modeButtons = document.querySelectorAll('.mode-button');
        this.difficultyButtons = document.querySelectorAll('.difficulty-button');
        
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        this.initializeGame();
    }

    initializeGame() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
        
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        this.modeButtons.forEach(button => {
            button.addEventListener('click', () => this.changeMode(button));
        });
        
        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => this.changeDifficulty(button));
        });
        
        this.updatePlayerIndicator();
    }

    changeMode(button) {
        this.modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.isAIMode = button.dataset.mode === 'ai';
        document.getElementById('difficultySelect').style.display = 
            this.isAIMode ? 'flex' : 'none';
        this.resetGame();
    }

    changeDifficulty(button) {
        this.difficultyButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.difficulty = button.dataset.difficulty;
        this.resetGame();
    }

    async handleCellClick(cell) {
        const index = cell.getAttribute('data-index');
        
        if (this.board[index] === '' && this.gameActive) {
            await this.makeMove(index);
            
            if (this.isAIMode && this.gameActive && this.currentPlayer === 'O') {
                this.makeAIMove();
            }
        }
    }

    async makeMove(index) {
        this.board[index] = this.currentPlayer;
        const cell = this.cells[index];
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        cell.style.transform = 'scale(0)';
        await new Promise(resolve => setTimeout(resolve, 50));
        cell.style.transform = 'scale(1)';

        const winningCombo = this.checkWin();
        if (winningCombo) {
            this.handleWin(winningCombo);
            return;
        }

        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }

        this.switchPlayer();
    }

    async makeAIMove() {
        // Show thinking animation
        this.cells.forEach(cell => {
            if (!cell.textContent) {
                cell.classList.add('ai-thinking');
            }
        });

        await new Promise(resolve => setTimeout(resolve, this.AIDelay));

        // Remove thinking animation
        this.cells.forEach(cell => cell.classList.remove('ai-thinking'));

        const move = this.getBestMove();
        await this.makeMove(move);
    }

    getBestMove() {
        if (this.difficulty === 'easy') {
            return this.getRandomMove();
        } else if (this.difficulty === 'medium') {
            return Math.random() < 0.7 ? this.getMinimaxMove() : this.getRandomMove();
        } else {
            return this.getMinimaxMove();
        }
    }

    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    getMinimaxMove() {
        let bestScore = -Infinity;
        let bestMove;

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        const scores = {
            X: -1,
            O: 1,
            draw: 0
        };

        const winner = this.checkWinningPlayer();
        if (winner !== null) {
            return scores[winner];
        }

        if (this.checkDraw()) {
            return scores.draw;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinningPlayer() {
        for (const combo of this.winningCombinations) {
            if (combo.every(index => this.board[index] === 'X')) return 'X';
            if (combo.every(index => this.board[index] === 'O')) return 'O';
        }
        return null;
    }

    checkWin() {
        for (const combo of this.winningCombinations) {
            if (combo.every(index => this.board[index] === this.currentPlayer)) {
                return combo;
            }
        }
        return null;
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    handleWin(winningCombo) {
        this.gameActive = false;
        this.scores[this.currentPlayer]++;
        this.updateScores();
        
        winningCombo.forEach(index => {
            this.cells[index].classList.add('winner');
        });

        this.status.textContent = this.isAIMode && this.currentPlayer === 'O' 
            ? "AI wins! 🤖" 
            : `Player ${this.currentPlayer} wins! 🎉`;
    }

    handleDraw() {
        this.gameActive = false;
        this.status.textContent = "It's a draw! 🤝";
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updatePlayerIndicator();
        this.status.textContent = this.isAIMode 
            ? (this.currentPlayer === 'X' ? "Your turn" : "AI is thinking...")
            : `Player ${this.currentPlayer}'s turn`;
    }

    updatePlayerIndicator() {
        this.playerX.classList.toggle('active', this.currentPlayer === 'X');
        this.playerO.classList.toggle('active', this.currentPlayer === 'O');
    }

    updateScores() {
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
    }

    resetGame() {
        const board = document.getElementById('board');
        board.style.opacity = '0';
        
        setTimeout(() => {
            this.board = Array(9).fill('');
            this.gameActive = true;
            this.currentPlayer = 'X';
            
            this.cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('x', 'o', 'winner');
            });
            
            this.status.textContent = this.isAIMode 
                ? "Your turn" 
                : `Player ${this.currentPlayer}'s turn`;
            this.updatePlayerIndicator();
            
            board.style.opacity = '1';
        }, 300);
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
