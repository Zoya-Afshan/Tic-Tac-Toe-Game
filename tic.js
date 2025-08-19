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

modeToggle.addEventListener("change", () => {
  vsComputer = modeToggle.checked;
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
});

const resetGame = () => {
  turnO = true;
  count = 0;
  enableBoxes();
  msgContainer.classList.add("hide");
  msgContainer.classList.add("hide");
seriesMsg.innerText = ""; // clear old message

};

const gameDraw = () => {
  msg.innerText = `Game was a Draw.`;
  msgContainer.classList.remove("hide");
  disableBoxes();
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
    ) {
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

const computerMove = () => {
  let empty = [];
  boxes.forEach((box, i) => {
    if (box.innerText === "") empty.push(i);
  });

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

  if (empty.length > 0) {
    const i = empty[Math.floor(Math.random() * empty.length)];
    makeComputerMove(i);
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

      // reset scoreboard after delay
      setTimeout(() => {
        playerOScore = 0;
        playerXScore = 0;
        matchesPlayed = 0;
        totalMatches = 0;
        gameActive = false;
        updateScoreboard();
        enableBoxes();
      }, 3500);

    }, 2000);
  } else {
    setTimeout(resetGame, 2500);
  }
};


const updateScoreboard = () => {
  scoreO.innerText = playerOScore;
  scoreX.innerText = playerXScore;
  matchesLeft.innerText = totalMatches - matchesPlayed;
};

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
      if (!checkWinner() && count < 9) setTimeout(computerMove, 300);
      else if (count === 9) gameDraw();
    } else {
      box.innerText = turnO ? "O" : "X";
      if (!checkWinner() && count === 9) gameDraw();
      turnO = !turnO;
    }
  });
});

window.addEventListener("DOMContentLoaded", () => {
  gameActive = false;
  enableBoxes(); // disables boxes at load
});


newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);
