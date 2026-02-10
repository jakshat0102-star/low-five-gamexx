// ================== GLOBAL STATE ==================
let words = [];
let originalWords = [];
let draggedIndex = null;

let round = 1;

// Round data
let round1Guess = [];
let round1Truth = [];
let round2Guess = [];
let round2Truth = [];

let scoreA = 0;
let scoreB = 0;

// ================== START ==================
function saveWords() {
  words = [];
  document.querySelectorAll(".word").forEach(input => {
    words.push(input.value);
  });

  originalWords = [...words];

  document.getElementById("inputArea").style.display = "none";
  document.getElementById("lockBtn").style.display = "block";

  renderGuessScreen();
}

// ================== GUESS SCREEN ==================
function renderGuessScreen() {
  const title =
    round === 1
      ? "Player A: Guess Player B’s order"
      : "Player B: Guess Player A’s order";

  renderCards(title, false);
}

// ================== LOCK GUESS ==================
function lockGuess() {
  if (round === 1) {
    round1Guess = [...words];
  } else {
    round2Guess = [...words];
  }

  document.getElementById("lockBtn").style.display = "none";
  renderTruthScreen();
}

// ================== TRUTH SCREEN ==================
function renderTruthScreen() {
  words = [...originalWords];

  const title =
    round === 1
      ? "Player B: Arrange YOUR real order"
      : "Player A: Arrange YOUR real order";

  renderCards(title, true);
}

// ================== CARD RENDER ==================
function renderCards(title, showScoreButton) {
  const gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = `<h2>${title}</h2>`;

  words.forEach((word, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = word;
    card.draggable = true;

    card.addEventListener("dragstart", () => {
      draggedIndex = index;
    });

    card.addEventListener("dragover", e => e.preventDefault());

    card.addEventListener("drop", () => {
      moveCard(draggedIndex, index, showScoreButton);
    });

    gameArea.appendChild(card);
  });

  if (showScoreButton) {
    const btn = document.createElement("button");
    btn.textContent = "See Score";
    btn.onclick = showScore;
    gameArea.appendChild(btn);
  }
}

// ================== MOVE CARD ==================
function moveCard(from, to, showScoreButton) {
  if (from === to) return;

  const item = words.splice(from, 1)[0];
  words.splice(to, 0, item);

  renderCards(document.querySelector("h2").textContent, showScoreButton);
}

// ================== SCORE ==================
function showScore() {
  const gameArea = document.getElementById("gameArea");
  let truth = [...words];
  let guess = round === 1 ? round1Guess : round2Guess;

  let score = 0;
  for (let i = 0; i < truth.length; i++) {
    if (guess[i] === truth[i]) score++;
  }

  function renderTable(guessedOrder, realOrder, guessLabel, realLabel) {
    let html = `
      <table style="width:100%; border-collapse:collapse; margin-top:16px;">
        <tr>
          <th>${guessLabel}</th>
          <th>Word</th>
          <th>${realLabel}</th>
          <th>Match</th>
        </tr>
    `;

    guessedOrder.forEach((word, index) => {
      const guessedPos = index + 1;
      const realPos = realOrder.indexOf(word) + 1;
      const matched = guessedPos === realPos;

      html += `
        <tr>
          <td>${guessedPos}</td>
          <td>${word}</td>
          <td>${realPos}</td>
          <td>${matched ? "✅" : "❌"}</td>
        </tr>
      `;
    });

    html += `</table>`;
    return html;
  }

  if (round === 1) {
    round1Truth = [...truth];
    scoreA = score;

    gameArea.innerHTML = `
      <h2>Round 1 — Player A guessing Player B</h2>

      ${renderTable(
        round1Guess,
        round1Truth,
        "A guessed position",
        "B’s real position"
      )}

      <p><strong>Score:</strong> ${scoreA} / 5</p>
      <button onclick="startRoundTwo()">Switch roles</button>
    `;
  } else {
    round2Truth = [...truth];
    scoreB = score;

    gameArea.innerHTML = `
      <h2>Round 2 — Player B guessing Player A</h2>

      ${renderTable(
        round2Guess,
        round2Truth,
        "B guessed position",
        "A’s real position"
      )}

      <p><strong>Score:</strong> ${scoreB} / 5</p>

      <button onclick="playAgain()">Play again</button>
      <button onclick="shareGame()">Share with friends</button>
    `;
  }
}




// ================== ROUND TWO ==================
function startRoundTwo() {
  round = 2;
  words = [...originalWords];
  document.getElementById("lockBtn").style.display = "block";
  renderGuessScreen();
}

// ================== FINAL RESULT ==================
// ================== SPLIT HEAT GRAPH ==================
function renderSplitHeat(words, aGuess, bGuess, truth) {
  let html = `
    <div class="split-heat">
      <div class="split-heat-header">
        <div>A → B</div>
        <div>B → A</div>
      </div>
  `;

  words.forEach(word => {
    const truthIndex = truth.indexOf(word);
    const aIndex = aGuess.indexOf(word);
    const bIndex = bGuess.indexOf(word);

    const aDist = Math.abs(aIndex - truthIndex);
    const bDist = Math.abs(bIndex - truthIndex);

    const aHeat = Math.max(20, 100 - aDist * 20);
    const bHeat = Math.max(20, 100 - bDist * 20);

    html += `
      <div class="split-row">
        <div class="split-word">${word}</div>
        <div class="split-bars">
          <div class="heat-bar">
            <div class="heat-fill-a" style="--w:${aHeat}%"></div>
          </div>
          <div class="heat-bar">
            <div class="heat-fill-b" style="--w:${bHeat}%"></div>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  return html;
}

// ================== ENTER KEY ==================
document.addEventListener("keydown", function (event) {
  if (event.key !== "Enter") return;

  const inputArea = document.getElementById("inputArea");
  if (!inputArea || inputArea.style.display === "none") return;

  const inputs = document.querySelectorAll(".word");
  if (document.activeElement === inputs[inputs.length - 1]) {
    event.preventDefault();
    saveWords();
  }
});
function playAgain() {
  // reset all state
  words = [];
  originalWords = [];
  round1Guess = [];
  round1Truth = [];
  round2Guess = [];
  round2Truth = [];
  scoreA = 0;
  scoreB = 0;
  round = 1;

  // reset UI
  document.getElementById("inputArea").style.display = "block";
  document.getElementById("lockBtn").style.display = "none";
  document.getElementById("gameArea").innerHTML = "";
}
// ---------- PLAY AGAIN ----------
function playAgain() {
  // reset game state
  words = [];
  originalWords = [];
  round1Guess = [];
  round1Truth = [];
  round2Guess = [];
  round2Truth = [];
  scoreA = 0;
  scoreB = 0;
  round = 1;

  // clear input fields
  document.querySelectorAll(".word").forEach(input => {
    input.value = "";
  });

  // reset UI
  document.getElementById("inputArea").style.display = "block";
  document.getElementById("lockBtn").style.display = "none";
  document.getElementById("gameArea").innerHTML = "";
}


// ---------- SHARE GAME ----------
function shareGame() {
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: "5 Things",
      text: "Play this fun game with me",
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Link copied! Send it to your friend.");
  }
}
// ---------- FINAL SCREEN BUTTONS ----------
const originalShowFinalResult = showFinalResult;

function showFinalResult() {
  const gameArea = document.getElementById("gameArea");

  let html = `<h2>Final Results</h2>`;

  html += `<h3>How you placed things</h3>`;

  originalWords.forEach(word => {
    const aPos = round1Guess.indexOf(word) + 1;
    const bPos = round2Guess.indexOf(word) + 1;
    const matched = aPos === bPos;

    html += `
      <div class="card">
        <strong>${word}</strong>
        <p>Player A placed it at: <strong>${aPos}</strong></p>
        <p>Player B placed it at: <strong>${bPos}</strong></p>
        <p>${matched ? "✅ Matched" : "❌ Didn’t match"}</p>
      </div>
    `;
  });

  html += `
    <div class="divider"></div>
    <p><strong>Final scores</strong></p>
    <p>Player A: ${scoreA} / 5</p>
    <p>Player B: ${scoreB} / 5</p>

    <button onclick="playAgain()">Play again</button>
    <button onclick="shareGame()">Share with friends</button>
  `;

  gameArea.innerHTML = html;
}
function renderResultTable(guessedOrder, realOrder, guessLabel, realLabel) {
  let html = `
    <table style="width:100%; border-collapse:collapse; margin-top:16px;">
      <tr>
        <th style="text-align:left;">${guessLabel}</th>
        <th style="text-align:left;">Word</th>
        <th style="text-align:left;">${realLabel}</th>
      </tr>
  `;

  guessedOrder.forEach((word, index) => {
    const guessedPos = index + 1;
    const realPos = realOrder.indexOf(word) + 1;

    html += `
      <tr>
        <td>${guessedPos}</td>
        <td>${word}</td>
        <td>${realPos}</td>
      </tr>
    `;
  });

  html += `</table>`;
  return html;
}

