(() => {
  const GAME_DURATION = 60;
  const BEST_SCORE_KEY = "calculoYermistaBestScore";
  const TOTAL_SCORE_KEY = "calculoYermistaTotalScore";
  const LOADING_DURATION = 600; // ms

  const views = {
    lobby: document.getElementById("lobbyView"),
    game: document.getElementById("gameView"),
    result: document.getElementById("resultView"),
    confirm: document.getElementById("confirmView"),
    countdown: document.getElementById("countdownView"),
    record: document.getElementById("recordView")
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
  const confirmModeName = document.getElementById("confirmModeName");
  const confirmStartButton = document.getElementById("confirmStartButton");
  const confirmBackButton = document.getElementById("confirmBackButton");
  const countdownNumber = document.getElementById("countdownNumber");
  const countdownModeTitle = document.getElementById("countdownModeTitle");
  const explanationTitle = document.getElementById("explanationTitle");
  const explanationText = document.getElementById("explanationText");
  const exampleText = document.getElementById("exampleText");
  const exampleAnswer = document.getElementById("exampleAnswer");
  const recordButton = document.getElementById("recordButton");
  const recordBackButton = document.getElementById("recordBackButton");
  const statsContainer = document.getElementById("statsContainer");
  const confirmInstructions = document.getElementById("confirmInstructions");
  const resultInstructions = document.getElementById("resultInstructions");

  const state = {
    mode: null,
    score: 0,
    timeLeft: GAME_DURATION,
    running: false,
    currentAnswer: null,
    lastTimestamp: 0,
    animationFrame: 0,
    countdownValue: 5
  };

  const modeConfig = {
    sum: {
      label: "Sumas 1-10",
      display: "standard",
      explanation: "Suma dos números del 1 al 10. Escribe la respuesta correcta.",
      example: "4 + 5 = 9",
      nextProblem() {
        const a = randomInt(1, 10);
        const b = randomInt(1, 10);
        return { text: `${a} + ${b}`, answer: a + b };
      }
    },
    sub: {
      label: "Restas 1-10",
      display: "standard",
      explanation: "Resta dos números del 1 al 10. El segundo siempre es menor o igual que el primero.",
      example: "8 - 3 = 5",
      nextProblem() {
        const a = randomInt(1, 10);
        const b = randomInt(1, a);
        return { text: `${a} - ${b}`, answer: a - b };
      }
    },
    mul: {
      label: "Multiplicaciones 1-10",
      display: "standard",
      explanation: "Multiplica dos números del 1 al 10. Calcula el producto correctamente.",
      example: "6 x 7 = 42",
      nextProblem() {
        const a = randomInt(1, 10);
        const b = randomInt(1, 10);
        return { text: `${a} x ${b}`, answer: a * b };
      }
    },
    div: {
      label: "Divisiones 1-10",
      display: "standard",
      explanation: "Divide dos números del 1 al 10. El resultado siempre es exacto (sin decimales).",
      example: "20 / 4 = 5",
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
      explanation: "Encuentra qué número necesitas sumar para llegar a 10.",
      example: "7 + ? = 10, la respuesta es 3",
      nextProblem() {
        const fixedNumber = randomInt(1, 9);
        return {
          prefix: `${fixedNumber} +`,
          suffix: "= 10",
          answer: 10 - fixedNumber
        };
      }
    },
    comp100: {
      label: "Complemento a 100",
      display: "complement",
      explanation: "Encuentra qué número necesitas sumar para llegar a 100.",
      example: "75 + ? = 100, la respuesta es 25",
      nextProblem() {
        const fixedNumber = randomInt(1, 99);
        return {
          prefix: `${fixedNumber} +`,
          suffix: "= 100",
          answer: 100 - fixedNumber
        };
      }
    },
    mul05: {
      label: "Multiplicaciones 0-5",
      display: "standard",
      explanation: "Multiplica dos números del 0 al 5. Calcula el producto con rapidez.",
      example: "3 x 4 = 12",
      nextProblem() {
        const a = randomInt(0, 5);
        const b = randomInt(0, 5);
        return { text: `${a} x ${b}`, answer: a * b };
      }
    },
    div05: {
      label: "Divisiones 0-5",
      display: "standard",
      explanation: "Divide dos números del 0 al 5. El resultado siempre es exacto y sin decimales.",
      example: "20 / 4 = 5",
      nextProblem() {
        const divisor = randomInt(1, 5);
        const quotient = randomInt(0, 5);
        const dividend = divisor * quotient;
        return { text: `${dividend} / ${divisor}`, answer: quotient };
      }
    },
    divHalf: {
      label: "Divisiones 0.5",
      display: "standard",
      explanation: "Divide números del 20 al 50 por 0.5.",
      example: "20 / 0.5 = 40",
      nextProblem() {
        const dividend = randomInt(20, 50);
        const divisor = 0.5;
        const quotient = dividend / divisor;
        return {
          text: `${dividend} / 0.5`,
          answer: quotient
        };
      }
    }
  };

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomHalf(min, max) {
    const value = randomInt(min * 2, max * 2) / 2;
    return Number(value.toFixed(1));
  }

  function formatHalf(value) {
    return Number(value).toFixed(1).replace(/\.0$/, "");
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

  function getModuleStats(mode) {
    const stats = JSON.parse(localStorage.getItem("moduleStats") || "{}");
    return stats[mode] || { times: 0, points: 0 };
  }

  function saveModuleStats(mode, times, points) {
    const stats = JSON.parse(localStorage.getItem("moduleStats") || "{}");
    stats[mode] = { times, points };
    localStorage.setItem("moduleStats", JSON.stringify(stats));
  }

  function updateModuleStats(mode, points) {
    const current = getModuleStats(mode);
    saveModuleStats(mode, current.times + 1, current.points + points);
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

    confirmInstructions.style.display = name === "confirm" ? "block" : "none";
    resultInstructions.style.display = name === "result" ? "block" : "none";
  }

  function showViewWithLoading(name) {
    const loadingView = document.getElementById("loadingView");
    loadingView.style.display = "flex";
    
    setTimeout(() => {
      showView(name);
      loadingView.style.display = "none";
      window.history.pushState({ view: name }, "", `#${name}`);
    }, LOADING_DURATION);
  }

  function handleHistoryChange(event) {
    const state = event.state;
    if (state && state.view) {
      showView(state.view);
    }
  }

  window.addEventListener("popstate", handleHistoryChange);

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

    updateModuleStats(state.mode, state.score);
    finalScore.textContent = state.score;
    updateScoreDisplays();
    showView("result");
  }

  function showRecordView() {
    const allModes = ["sum", "sub", "mul", "div", "mul05", "div05", "divHalf", "comp10", "comp100"];
    let totalPoints = 0;
    
    let html = '<div class="stats-grid">';
    
    allModes.forEach(mode => {
      const stats = getModuleStats(mode);
      const label = modeConfig[mode].label;
      totalPoints += stats.points;
      
      html += `
        <div class="stat-card">
          <h3 class="stat-title">${label}</h3>
          <div class="stat-row">
            <span class="stat-label">Sesiones:</span>
            <span class="stat-value">${stats.times}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Puntos acumulados:</span>
            <span class="stat-value">${stats.points}</span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    html += `<div class="total-stats"><strong>Total de puntos acumulados: ${totalPoints}</strong></div>`;
    
    statsContainer.innerHTML = html;
  }

  function startCountdown() {
    state.countdownValue = 5;
    countdownModeTitle.textContent = modeConfig[state.mode].label;
    explanationText.textContent = modeConfig[state.mode].explanation;
    exampleText.textContent = modeConfig[state.mode].example;
    
    showView("countdown");
    updateCountdownDisplay();
  }

  function updateCountdownDisplay() {
    if (state.countdownValue > 0) {
      countdownNumber.textContent = state.countdownValue;
      state.countdownValue--;
      state.animationFrame = setTimeout(updateCountdownDisplay, 1000);
    } else {
      cancelAnimationFrame(state.animationFrame);
      startGame(state.mode);
    }
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
    button.addEventListener("click", () => {
      const mode = button.dataset.mode;
      state.mode = mode;
      confirmModeName.textContent = modeConfig[mode].label;
      showViewWithLoading("confirm");
    });
  });

  confirmStartButton.addEventListener("click", () => {
    if (state.mode) {
      confirmInstructions.style.display = "none";
      startCountdown();
    }
  });

  confirmBackButton.addEventListener("click", () => {
    state.mode = null;
    updateScoreDisplays();
    window.history.back();
  });

  recordButton.addEventListener("click", () => {
    showRecordView();
    showViewWithLoading("record");
  });

  recordBackButton.addEventListener("click", () => {
    updateScoreDisplays();
    window.history.back();
  });

  bindEnterSubmit(answerInput);
  bindEnterSubmit(complementInput);

  retryButton.addEventListener("click", () => {
    if (state.mode) {
      startCountdown();
    }
  });

  backToLobbyButton.addEventListener("click", () => {
    state.running = false;
    cancelAnimationFrame(state.animationFrame);
    resultInstructions.style.display = "none";
    updateScoreDisplays();
    window.history.back();
  });

  // Inicializar el primer estado del historial
  window.history.replaceState({ view: "lobby" }, "", "#lobby");
  updateScoreDisplays();
})();
