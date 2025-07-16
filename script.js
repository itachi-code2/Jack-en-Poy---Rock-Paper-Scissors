class JackEnPoyGame {
    constructor() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.roundsPlayed = 0;
        this.gameHistory = [];
        this.isPlaying = false;
       
        this.choices = {
            rock: { emoji: '🪨', beats: 'scissors' },
            paper: { emoji: '📄', beats: 'rock' },
            scissors: { emoji: '✂️', beats: 'paper' }
        };

        this.sounds = {
            click: () => this.playSound(800, 100),
            win: () => this.playSound(600, 200),
            lose: () => this.playSound(200, 300),
            tie: () => this.playSound(400, 150)
        };

        this.initializeGame();
    }

    initializeGame() {
        const choiceButtons = document.querySelectorAll('.choice-btn');
        const playAgainBtn = document.getElementById('play-again-btn');

        choiceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePlayerChoice(e));
        });

        playAgainBtn.addEventListener('click', () => this.resetGame());
    }

    async handlePlayerChoice(event) {
        if (this.isPlaying) return;

        const playerChoice = event.target.dataset.choice;
        const computerChoice = this.getComputerChoice();

        this.isPlaying = true;
        this.sounds.click();

        // Highlight selected choice
        this.highlightChoice(event.target);

        // Show countdown
        await this.showCountdown();

        // Show battle animation
        this.showBattle(playerChoice, computerChoice);

        // Determine winner and update scores
        const result = this.determineWinner(playerChoice, computerChoice);
        this.updateScores(result);
        this.displayResult(result, playerChoice, computerChoice);

        // Add to history
        this.addToHistory(playerChoice, computerChoice, result);

        // Show play again button
        document.getElementById('play-again-btn').style.display = 'block';
    }

    getComputerChoice() {
        const choices = Object.keys(this.choices);
        return choices[Math.floor(Math.random() * choices.length)];
    }

    highlightChoice(button) {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
    }

    async showCountdown() {
        const battleDisplay = document.getElementById('battle-display');
        const resultMessage = document.getElementById('result-message');
       
        for (let i = 3; i > 0; i--) {
            resultMessage.innerHTML = `<div class="countdown">${i}</div>`;
            await this.delay(1000);
        }
    }

    showBattle(playerChoice, computerChoice) {
        const playerChoiceEl = document.getElementById('player-choice');
        const computerChoiceEl = document.getElementById('computer-choice');
        const battleDisplay = document.getElementById('battle-display');

        // Add battle animation
        battleDisplay.classList.add('battle-animation');
        setTimeout(() => {
            battleDisplay.classList.remove('battle-animation');
        }, 500);

        // Show choices
        playerChoiceEl.textContent = this.choices[playerChoice].emoji;
        computerChoiceEl.textContent = this.choices[computerChoice].emoji;
    }

    determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            return 'tie';
        }
       
        if (this.choices[playerChoice].beats === computerChoice) {
            return 'win';
        }
       
        return 'lose';
    }

    updateScores(result) {
        this.roundsPlayed++;
       
        if (result === 'win') {
            this.playerScore++;
        } else if (result === 'lose') {
            this.computerScore++;
        }

        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('computer-score').textContent = this.computerScore;
        document.getElementById('rounds-played').textContent = this.roundsPlayed;
    }

    displayResult(result, playerChoice, computerChoice) {
        const resultMessage = document.getElementById('result-message');
        let message = '';
        let className = '';

        switch (result) {
            case 'win':
                message = '🎉 You Win!';
                className = 'win';
                this.sounds.win();
                break;
            case 'lose':
                message = '😔 Computer Wins!';
                className = 'lose';
                this.sounds.lose();
                break;
            case 'tie':
                message = '🤝 It\'s a Tie!';
                className = 'tie';
                this.sounds.tie();
                break;
        }

        resultMessage.textContent = message;
        resultMessage.className = `result-message ${className}`;
    }

    addToHistory(playerChoice, computerChoice, result) {
        const historyItem = {
            player: playerChoice,
            computer: computerChoice,
            result: result,
            round: this.roundsPlayed
        };

        this.gameHistory.unshift(historyItem);
       
        // Keep only last 5 games
        if (this.gameHistory.length > 5) {
            this.gameHistory.pop();
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historySection = document.getElementById('game-history');
        const historyList = document.getElementById('history-list');
       
        historySection.style.display = 'block';
        historyList.innerHTML = '';

        this.gameHistory.forEach((game, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
           
            const resultText = game.result === 'win' ? '🎉 Win' :
                             game.result === 'lose' ? '😔 Lose' : '🤝 Tie';
           
            historyItem.innerHTML = `
                <span>Round ${game.round}</span>
                <span>${this.choices[game.player].emoji} vs ${this.choices[game.computer].emoji}</span>
                <span>${resultText}</span>
            `;
           
            historyList.appendChild(historyItem);
        });
    }

    resetGame() {
        this.isPlaying = false;
       
        // Reset displays
        document.getElementById('player-choice').textContent = '❓';
        document.getElementById('computer-choice').textContent = '❓';
        document.getElementById('result-message').textContent = 'Choose your weapon!';
        document.getElementById('result-message').className = 'result-message';
        document.getElementById('play-again-btn').style.display = 'none';

        // Remove selection highlights
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    playSound(frequency, duration) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
           
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
           
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
           
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
           
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (e) {
            // Fallback for browsers without Web Audio API
            console.log('Sound effect triggered');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new JackEnPoyGame();
}); 