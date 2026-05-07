(() => {
  const GAME_DURATION = 60;
  const BEST_SCORE_KEY = "calculoYermistaBestScore";
  const TOTAL_SCORE_KEY = "calculoYermistaTotalScore";

  const views = {
    lobby: document.getElementById("lobbyView"),
    game: document.getElementById("gameView"),
    result: document.getElementById("resultView")
  };

  const lobbyBestScore = document.getElementById("lobbyBestScore");
  const lobbyTotalScore = document.getElementById("lobbyTotalScore");
  const modeName = document.getElementById("modeName");
  const liveScore = document.getElementById("liveScore");
  const operationText = document.getElementById("operationText");
  const standardOperation = document.getElementById("standardOperation");
  const complementOperation = document.getElementById("complementOperation");
  const answerInput = document.getElementById("answerInput");
  const complementPrefix = document.getElementById("complementPrefix");
  const complementSuffix = document.getElementById("complementSuffix");
  const complementInput = document.getElementById("complementInput");
  const timerFill = document.getElementById("timerFill");
  const timeLeftText = document.getElementById("timeLeftText");
  const finalScore = document.getElementById("finalScore");
  const bestScore = document.getElementById("bestScore");
  const totalScore = document.getElementById("totalScore");
  const retryButton = document.getElementById("retryButton");
  const backToLobbyButton = document.getElementById("backToLobbyButton");
  const modeButtons = document.querySelectorAll(".mode-button");

  const state = {
    mode: null,
    score: 0,
    timeLeft: GAME_DURATION,
    running: false,
    currentAnswer: null,
    lastTimestamp: 0,
    animationFrame: 0
  };

  const modeConfig = {
    sum: {
      label: "Sumas 1-10",
      display: "standard",
      nextProblem() {
        const a = randomInt(1, 10);
        const b = randomInt(1, 10);
        return { text: `${a} + ${b}`, answer: a + b };
      }
    },
    sub: {
      label: "Restas 1-10",
      display: "standard",
      nextProblem() {
        const a = randomInt(1, 10);
        const b = randomInt(1, a);
        return { text: `${a} - ${b}`, answer: a - b };
      }
    },
    mul: {
      label: "Multiplicaciones 1-10",
      display: "standard",
      nextProblem() {
        const a = randomInt(1, 10);
        const b = randomInt(1, 10);
        return { text: `${a} x ${b}`, answer: a * b };
      }
    },
    div: {
      label: "Divisiones 1-10",
      display: "standard",
      nextProblem() {
        const divisor = randomInt(1, 10);
        const quotient = randomInt(1, 10);
        const dividend = divisor * quotient;
        return { text: `${dividend} / ${divisor}`, answer: quotient };
      }
    },
    comp10: {
      label: "Complemento a 10",
      display: "complement",
      nextProblem() {
        const fixedNumber = randomInt(1, 9);
        return {
          prefix: `${fixedNumber} +`,
          suffix: "= 10",
          answer: 10 - fixedNumber
        };
      }
    }
  };

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getBestScore() {
    return Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
  }

  function getTotalScore() {
    return Number(localStorage.getItem(TOTAL_SCORE_KEY) || 0);
  }

  function setBestScore(score) {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  }

  function setTotalScore(score) {
    localStorage.setItem(TOTAL_SCORE_KEY, String(score));
  }

  function updateScoreDisplays() {
    const storedBest = getBestScore();
    const storedTotal = getTotalScore();
    lobbyBestScore.textContent = storedBest;
    bestScore.textContent = storedBest;
    lobbyTotalScore.textContent = storedTotal;
    totalScore.textContent = storedTotal;
  }

  function showView(name) {
    Object.entries(views).forEach(([key, element]) => {
      element.classList.toggle("active", key === name);
    });
  }

  function getActiveInput() {
    return state.mode === "comp10" ? complementInput : answerInput;
  }

  function getActiveTextElements() {
    if (state.mode === "comp10") {
      return [complementPrefix, complementSuffix];
    }
    return [operationText];
  }

  function clearFeedback() {
    answerInput.classList.remove("correct", "wrong");
    complementInput.classList.remove("correct", "wrong");
    getActiveTextElements().forEach((element) => {
      element.classList.remove("correct", "wrong");
    });
  }

  function triggerFeedback(isCorrect) {
    clearFeedback();
    const className = isCorrect ? "correct" : "wrong";
    getActiveInput().classList.add(className);
    getActiveTextElements().forEach((element) => {
      element.classList.add(className);
    });
  }

  function setDisplayMode(mode) {
    const isComplement = modeConfig[mode].display === "complement";
    standardOperation.classList.toggle("active", !isComplement);
    complementOperation.classList.toggle("active", isComplement);
    answerInput.value = "";
    complementInput.value = "";
    clearFeedback();
  }

  function nextProblem() {
    const problem = modeConfig[state.mode].nextProblem();
    state.currentAnswer = problem.answer;

    if (modeConfig[state.mode].display === "complement") {
      complementPrefix.textContent = problem.prefix;
      complementSuffix.textContent = problem.suffix;
      complementInput.value = "";
    } else {
      operationText.textContent = problem.text;
      answerInput.value = "";
    }
  }

  function refreshScore() {
    liveScore.textContent = state.score;
  }

  function updateTimerVisual() {
    const ratio = Math.max(0, state.timeLeft / GAME_DURATION);
    timerFill.style.width = `${ratio * 100}%`;
    timerFill.classList.toggle("low", ratio < 0.25);
    timeLeftText.textContent = state.timeLeft.toFixed(1);
  }

  function endGame() {
    state.running = false;
    cancelAnimationFrame(state.animationFrame);
    getActiveInput().blur();

    if (state.score > getBestScore()) {
      setBestScore(state.score);
    }

    finalScore.textContent = state.score;
    updateScoreDisplays();
    showView("result");
  }

  function tick(timestamp) {
    if (!state.running) {
      return;
    }

    if (!state.lastTimestamp) {
      state.lastTimestamp = timestamp;
    }

    const elapsed = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;
    state.timeLeft = Math.max(0, state.timeLeft - elapsed);
    updateTimerVisual();

    if (state.timeLeft <= 0) {
      endGame();
      return;
    }

    state.animationFrame = requestAnimationFrame(tick);
  }

  function startGame(mode) {
    state.mode = mode;
    state.score = 0;
    state.timeLeft = GAME_DURATION;
    state.running = true;
    state.lastTimestamp = 0;

    modeName.textContent = modeConfig[mode].label;
    setDisplayMode(mode);
    refreshScore();
    updateTimerVisual();
    nextProblem();
    showView("game");

    requestAnimationFrame(() => {
      const input = getActiveInput();
      input.focus();
      input.select();
    });

    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = requestAnimationFrame(tick);
  }

  function handleSubmit() {
    if (!state.running) {
      return;
    }

    const input = getActiveInput();
    const value = input.value.trim();

    if (value === "" || value === "-" || value === "+") {
      return;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return;
    }

    const isCorrect = numericValue === state.currentAnswer;

    if (isCorrect) {
      state.score += 1;
      setTotalScore(getTotalScore() + 1);
      refreshScore();
      updateScoreDisplays();
    }

    triggerFeedback(isCorrect);
    nextProblem();

    requestAnimationFrame(() => {
      triggerFeedback(isCorrect);
      const nextInput = getActiveInput();
      nextInput.focus();
      nextInput.select();
    });
  }

  function bindEnterSubmit(input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
      }
    });
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => startGame(button.dataset.mode));
  });

  bindEnterSubmit(answerInput);
  bindEnterSubmit(complementInput);

  retryButton.addEventListener("click", () => {
    if (state.mode) {
      startGame(state.mode);
    }
  });

  backToLobbyButton.addEventListener("click", () => {
    state.running = false;
    cancelAnimationFrame(state.animationFrame);
    updateScoreDisplays();
    showView("lobby");
  });

  updateScoreDisplays();
})();
