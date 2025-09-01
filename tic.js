let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let modeToggle = document.getElementById("vsComputer");
let matchInput = document.getElementById("matchCount");
let startBtn = document.getElementById("startBtn");
let scoreO = document.getElementById("scoreO");
let scoreX = document.getElementById("scoreX");
let matchesLeft = document.getElementById("matchesLeft");
let scoreboard = document.getElementById("scoreBoard");
let seriesMsg = document.querySelector("#series-msg");
let gameActive = false;
let timerDisplay = document.getElementById("timer");
let moveTimer;
let timeLimit = 10; // seconds per move
let currentTime = timeLimit;

// NEW: Difficulty selection
let difficultySelect = document.getElementById("difficulty"); // NEW
let difficultyContainer = document.getElementById("difficulty-container"); // NEW
let difficulty = "easy"; // NEW

let turnO = true;
let count = 0;
let vsComputer = false;
let totalMatches = 0;
let matchesPlayed = 0;
let playerOScore = 0;
let playerXScore = 0;

const winPatterns = [
  [0, 1, 2], [0, 3, 6], [0, 4, 8],
  [1, 4, 7], [2, 5, 8], [2, 4, 6],
  [3, 4, 5], [6, 7, 8]
];

// UPDATED to show/hide difficulty container
modeToggle.addEventListener("change", () => {
  vsComputer = modeToggle.checked;
  difficultyContainer.style.display = vsComputer ? "block" : "none"; // NEW
});

// Listen for difficulty change
difficultySelect.addEventListener("change", () => { // NEW
  difficulty = difficultySelect.value;
});

startBtn.addEventListener("click", () => {
  totalMatches = parseInt(matchInput.value);
  if (!totalMatches || totalMatches < 1) {
    alert("Please enter a valid number of matches.");
    return;
  }
  matchesPlayed = 0;
  playerOScore = 0;
  playerXScore = 0;
  gameActive=true;
  updateScoreboard();
  scoreboard.classList.remove("hide");
  resetGame();
  startTimer();
});

const resetGame = () => {
  turnO = true;
  count = 0;
  enableBoxes();
  msgContainer.classList.add("hide");
  seriesMsg.innerText = "";
  //startTimer();
};
const stopTimer = () => {
  clearInterval(moveTimer);
  timerDisplay.textContent = ""; // Hide timer when game ends
};
const gameDraw = () => {
  msg.innerText = `Game was a Draw.`;
  msgContainer.classList.remove("hide");
  disableBoxes();
  stopTimer();
  endMatch();
};

const disableBoxes = () => {
  for (let box of boxes) box.disabled = true;
};

const enableBoxes = () => {
  boxes.forEach((box) => {
    box.disabled = false;
    box.innerText = "";
    box.classList.remove("win");
  });
};

const showWinner = (winner, pattern) => {
  pattern.forEach((index) => boxes[index].classList.add("win"));
  disableBoxes();
 stopTimer();
  setTimeout(() => {
    msg.innerText = `Congratulations, Winner is ${winner}`;
    msgContainer.classList.remove("hide");
    if (winner === "O") playerOScore++;
    else playerXScore++;
    endMatch();
  }, 1000);
};

const checkWinner = () => {
  for (let pattern of winPatterns) {
    let [a, b, c] = pattern;
    if (
      boxes[a].innerText &&
      boxes[a].innerText === boxes[b].innerText &&
      boxes[a].innerText === boxes[c].innerText
    ) {stopTimer();
      showWinner(boxes[a].innerText, pattern);
      
      return true;
    }
  }
  return false;
};

const checkWinnerSilent = (symbol) => {
  return winPatterns.some(([a, b, c]) =>
    boxes[a].innerText === symbol &&
    boxes[b].innerText === symbol &&
    boxes[c].innerText === symbol
  );
};

const makeComputerMove = (index) => {
  boxes[index].innerText = "X";
  boxes[index].disabled = true;
  count++;
  if (!checkWinner() && count === 9) gameDraw();
  turnO = true;
};

// UPDATED computerMove with difficulty logic
const computerMove = () => {
  let empty = [];
  boxes.forEach((box, i) => {
    if (box.innerText === "") empty.push(i);
  });

  if (difficulty === "easy") { // NEW
    const i = empty[Math.floor(Math.random() * empty.length)];
    makeComputerMove(i);
  } 
  else if (difficulty === "medium") { // NEW
    for (let i of empty) {
      boxes[i].innerText = "X";
      if (checkWinnerSilent("X")) {
        boxes[i].innerText = "";
        makeComputerMove(i);
        return;
      }
      boxes[i].innerText = "";
    }
    for (let i of empty) {
      boxes[i].innerText = "O";
      if (checkWinnerSilent("O")) {
        boxes[i].innerText = "";
        makeComputerMove(i);
        return;
      }
      boxes[i].innerText = "";
    }
    const i = empty[Math.floor(Math.random() * empty.length)];
    makeComputerMove(i);
  } 
  else if (difficulty === "hard") { // NEW
    if (empty.length === 8) {
    // If human played first move
    if (boxes[4].innerText === "") {
      // Take center if available
      makeComputerMove(4);
    } else {
      // Otherwise take a corner
      let corners = [0, 2, 6, 8].filter(i => boxes[i].innerText === "");
      let randomCorner = corners[Math.floor(Math.random() * corners.length)];
      makeComputerMove(randomCorner);
    }
    return;
  }
    let bestScore = -Infinity;
    let bestMove;
    for (let i of empty) {
      boxes[i].innerText = "X";
      let score = minimax(boxes, 0, false);
      boxes[i].innerText = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
    makeComputerMove(bestMove);
  }
};

// NEW: Minimax algorithm
const minimax = (newBoxes, depth, isMaximizing) => {
  if (checkWinnerSilent("X")) return 10 - depth;
  if (checkWinnerSilent("O")) return depth - 10;
  if ([...newBoxes].every(box => box.innerText !== "")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    newBoxes.forEach((box, i) => {
      if (box.innerText === "") {
        box.innerText = "X";
        let score = minimax(newBoxes, depth + 1, false);
        box.innerText = "";
        bestScore = Math.max(score, bestScore);
      }
    });
    return bestScore;
  } else {
    let bestScore = Infinity;
    newBoxes.forEach((box, i) => {
      if (box.innerText === "") {
        box.innerText = "O";
        let score = minimax(newBoxes, depth + 1, true);
        box.innerText = "";
        bestScore = Math.min(score, bestScore);
      }
    });
    return bestScore;
  }
};

const endMatch = () => {
  matchesPlayed++;
  updateScoreboard();

  if (matchesPlayed >= totalMatches) {
    setTimeout(() => {
      if (playerOScore > playerXScore) {
        seriesMsg.innerText = "🏆 Player O wins the series!";
      } else if (playerXScore > playerOScore) {
        seriesMsg.innerText = `🏆 ${vsComputer ? "Computer" : "Player X"} wins the series!`;
      } else {
        seriesMsg.innerText = "🤝 The series ended in a tie!";
      }

      setTimeout(() => {
        playerOScore = 0;
        playerXScore = 0;
        matchesPlayed = 0;
        totalMatches = 0;
        gameActive = false;
        updateScoreboard();
        enableBoxes();
      }, 2500);

    }, 1000);
  } else {
    setTimeout(resetGame, 2500);
  }
};

const updateScoreboard = () => {
  scoreO.innerText = playerOScore;
  scoreX.innerText = playerXScore;
  matchesLeft.innerText = totalMatches - matchesPlayed;
};
function startTimer() {
  clearInterval(moveTimer);
  currentTime = timeLimit;
  updateTimerDisplay();

  moveTimer = setInterval(() => {
    currentTime--;
    updateTimerDisplay();

    if (currentTime <= 0) {
      clearInterval(moveTimer);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerDisplay.textContent = `Time Left: ${currentTime}s`;
}

function handleTimeout() {
  stopTimer();
  if (vsComputer) {
    // Human ran out of time
    msg.innerText = `Time's up! Computer wins!`;
    msgContainer.classList.remove("hide");
    playerXScore++; // Computer = X
  } else {
    // Determine whose turn it was
    let loser = turnO ? "O" : "X";
    let winner = turnO ? "X" : "O";
    msg.innerText = `Time's up! Player ${winner} wins!`;
    msgContainer.classList.remove("hide");
    if (winner === "O") playerOScore++;
    else playerXScore++;
  }
  disableBoxes();
  endMatch();
}
boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (!gameActive) {
      alert("Please set number of games and click Start to begin.");
      return;
    }

    if (box.innerText !== "") return;

    count++;

    if (vsComputer) {
      box.innerText = "O";
      startTimer(); // Reset timer for Computer's upcoming move
      if (!checkWinner() && count < 9) {
        setTimeout(() => {
          computerMove();
          startTimer(); // Reset timer for Human's next move after Computer plays
        }, 300);
      } else if (count === 9) {
        gameDraw();
      }
    } else {
      box.innerText = turnO ? "O" : "X";
      startTimer(); // Reset timer for the next player
      if (!checkWinner() && count === 9) {
        gameDraw();
      }
      turnO = !turnO;
    }
  });
});


window.addEventListener("DOMContentLoaded", () => {
  gameActive = false;
  enableBoxes();
});

newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);
