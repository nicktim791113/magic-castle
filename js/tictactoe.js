/* ============================================================
   花木蘭井字棋 — 經典 3×3 + 終極 9×9（巢狀井字棋）
   每步倒數計時、計分板、投降。雙人對戰（X 先手 / O 後手）。
   ============================================================ */
(function () {
  "use strict";

  var WIN = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  // 狀態
  var mode = MLP.load("mlp-ttt-mode", "classic") === "ultimate" ? "ultimate" : "classic";
  var timeLimit = [3, 5, 10, 15].indexOf(MLP.loadNum("mlp-ttt-time", 5)) >= 0 ? MLP.loadNum("mlp-ttt-time", 5) : 5;
  var status = "idle"; // idle / playing / ended
  var scores = { x: 0, o: 0, draw: 0 };
  var classicBoard = Array(9).fill(null);
  var ultimateBoards = Array(9).fill(null).map(function () { return Array(9).fill(null); });
  var mainBoard = Array(9).fill(null);
  var nextActiveBoard = null;
  var isXNext = true;
  var winner = null;
  var winningLine = [];
  var timeLeft = 5;
  var timer = null;

  var $ = function (id) { return document.getElementById(id); };
  var boardEl = $("board");

  function checkWinner(sq) {
    for (var i = 0; i < WIN.length; i++) {
      var a = WIN[i][0], b = WIN[i][1], c = WIN[i][2];
      if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return { winner: sq[a], line: WIN[i] };
    }
    return null;
  }

  /* ---------- 開始 / 重置 ---------- */
  function startGame() {
    isXNext = true; winner = null; winningLine = []; status = "playing"; timeLeft = timeLimit;
    if (mode === "classic") {
      classicBoard = Array(9).fill(null);
    } else {
      ultimateBoards = Array(9).fill(null).map(function () { return Array(9).fill(null); });
      mainBoard = Array(9).fill(null);
      nextActiveBoard = null;
    }
    removeResult();
    showGame();
    renderBoard();
    updateStatusUI();
    startTimerLoop();
  }

  function resetScores() {
    scores = { x: 0, o: 0, draw: 0 };
    MLP.Sound.pop();
    updateScoresUI();
  }

  /* ---------- 計時 ---------- */
  function startTimerLoop() {
    clearInterval(timer);
    timer = setInterval(function () {
      if (status !== "playing") return;
      timeLeft -= 0.1;
      if (timeLeft <= 0) { timeLeft = 0; updateBar(); handleTimeOut(); return; }
      updateBar();
    }, 100);
  }
  function stopTimer() { clearInterval(timer); }

  function handleTimeOut() {
    var w = isXNext ? "O" : "X";
    winner = "TimeOut-" + w; status = "ended"; stopTimer();
    MLP.Sound.wrong(); updateScore(w); showResult();
  }
  function handleSurrender() {
    var w = isXNext ? "O" : "X";
    winner = "Surrender-" + w; status = "ended"; stopTimer();
    MLP.Sound.wrong(); updateScore(w); showResult();
  }

  function updateScore(result) {
    if (result === "Draw") scores.draw++;
    else if (result === "X" || result === "TimeOut-X" || result === "Surrender-X") scores.x++;
    else if (result === "O" || result === "TimeOut-O" || result === "Surrender-O") scores.o++;
    updateScoresUI();
  }

  /* ---------- 經典模式點擊 ---------- */
  function handleClassicClick(i) {
    if (status !== "playing" || classicBoard[i] || winner) return;
    classicBoard[i] = isXNext ? "X" : "O";
    MLP.Sound.flip();
    var r = checkWinner(classicBoard);
    if (r) {
      winner = r.winner; winningLine = r.line; status = "ended"; stopTimer();
      MLP.Sound.win(); updateScore(r.winner); renderBoard(); showResult(); return;
    }
    if (classicBoard.indexOf(null) < 0) {
      winner = "Draw"; status = "ended"; stopTimer(); updateScore("Draw"); renderBoard(); showResult(); return;
    }
    isXNext = !isXNext; timeLeft = timeLimit;
    renderBoard(); updateStatusUI();
  }

  /* ---------- 終極模式點擊 ---------- */
  function handleUltimateClick(b, c) {
    if (status !== "playing" || winner) return;
    if (nextActiveBoard !== null && nextActiveBoard !== b) return;
    if (ultimateBoards[b][c]) return;
    if (mainBoard[b]) return;

    MLP.Sound.flip();
    var cur = isXNext ? "X" : "O";
    ultimateBoards[b][c] = cur;

    var small = checkWinner(ultimateBoards[b]);
    var ended = false;
    if (small) {
      mainBoard[b] = cur;
      var big = checkWinner(mainBoard);
      if (big) {
        winner = big.winner; winningLine = big.line; status = "ended"; stopTimer();
        MLP.Sound.win(); updateScore(big.winner); ended = true;
      } else if (mainBoard.every(function (x) { return x !== null; })) {
        winner = "Draw"; status = "ended"; stopTimer(); updateScore("Draw"); ended = true;
      }
    } else if (ultimateBoards[b].indexOf(null) < 0) {
      mainBoard[b] = "D";
    }

    if (!ended) {
      nextActiveBoard = mainBoard[c] ? null : c;
      isXNext = !isXNext; timeLeft = timeLimit;
    }
    renderBoard(); updateStatusUI();
    if (ended) showResult();
  }

  /* ---------- 畫面 ---------- */
  function showSettings() {
    status = "idle"; stopTimer(); removeResult();
    $("settings").style.display = "block";
    $("game").style.display = "none";
    $("title-sub").textContent = "選擇你的戰場，開始這場智慧對決";
  }
  function showGame() {
    $("settings").style.display = "none";
    $("game").style.display = "block";
    $("title-sub").textContent = "小心！時間正在流逝…";
  }

  function renderBoard() {
    if (mode === "classic") {
      boardEl.className = "ttt-classic";
      boardEl.innerHTML = classicBoard.map(function (cell, i) {
        var cls = "ttt-cell" + (winningLine.indexOf(i) >= 0 ? " win" : "") + (cell === "X" ? " x" : cell === "O" ? " o" : "");
        var dis = cell || status !== "playing" ? " disabled" : "";
        return '<button class="' + cls + '" data-i="' + i + '"' + dis + ">" + (cell || "") + "</button>";
      }).join("");
    } else {
      boardEl.className = "ttt-ultimate";
      boardEl.innerHTML = mainBoard.map(function (owner, b) {
        var isTarget = status === "playing" && (nextActiveBoard === null || nextActiveBoard === b) && !owner;
        var winB = winningLine.indexOf(b) >= 0;
        var sub = ultimateBoards[b].map(function (cell, c) {
          var cls = "ttt-scell" + (cell === "X" ? " x" : cell === "O" ? " o" : "");
          var dis = cell || owner || !isTarget || status !== "playing" ? " disabled" : "";
          return '<button class="' + cls + '" data-b="' + b + '" data-c="' + c + '"' + dis + ">" + (cell || "") + "</button>";
        }).join("");
        var big = "";
        if (owner && owner !== "D") big = '<div class="big-mark ' + (owner === "X" ? "x" : "o") + '">' + owner + "</div>";
        else if (owner === "D") big = '<div class="big-mark d">–</div>';
        return '<div class="ttt-board' + (isTarget ? " active-board" : "") + (winB ? " win" : "") + '">' +
          big + '<div class="ttt-sub' + (owner ? " dim" : "") + '">' + sub + "</div></div>";
      }).join("");
    }
  }

  function updateStatusUI() {
    $("x-side").classList.toggle("active", isXNext);
    $("o-side").classList.toggle("active", !isXNext);
    $("timer-num").textContent = Math.ceil(timeLeft);
  }
  function updateBar() {
    var pct = (timeLeft / timeLimit) * 100;
    var bar = $("timebar");
    bar.style.width = pct + "%";
    bar.style.background = pct < 30 ? "#e0556b" : pct < 60 ? "#ff9a5c" : "#4fc36a";
    $("timer-num").textContent = Math.ceil(timeLeft);
  }
  function updateScoresUI() {
    $("score-x").textContent = scores.x;
    $("score-o").textContent = scores.o;
    $("score-d").textContent = scores.draw;
  }

  function resultHeadline() {
    if (winner === "Draw") return "平分秋色！";
    if (winner && winner.indexOf("TimeOut") === 0) return "時間到！";
    if (winner && winner.indexOf("Surrender") === 0) return "有人棄權了！";
    return "勝負已分！";
  }
  function resultText() {
    if (winner === "Draw") return "雙方旗鼓相當，握手言和～";
    if (winner && winner.indexOf("TimeOut") === 0) {
      var w = winner.slice(-1);
      return "「" + w + "」因為對手超時而獲勝！⏱️";
    }
    if (winner && winner.indexOf("Surrender") === 0) {
      var w2 = winner.slice(-1);
      return "「" + w2 + "」因為對手棄權而獲勝！🏳️";
    }
    return "獲勝者是「" + winner + "」！🌸";
  }

  function removeResult() {
    var m = $("ttt-result");
    if (m) m.remove();
  }
  function showResult() {
    removeResult();
    if (winner !== "Draw") MLP.confetti(90);
    var emoji = winner === "Draw" ? "🤝" : winner && winner.indexOf("TimeOut") === 0 ? "⏰" : winner && winner.indexOf("Surrender") === 0 ? "🏳️" : "🏆";
    var mask = document.createElement("div");
    mask.className = "modal-mask show";
    mask.id = "ttt-result";
    mask.innerHTML =
      '<div class="modal"><span class="big-emoji">' + emoji + "</span>" +
      "<h2>" + resultHeadline() + "</h2><p>" + resultText() + "</p>" +
      '<div class="modal-actions">' +
      '<button class="btn red" data-a="again">再來一局</button>' +
      '<button class="btn ghost" data-a="settings">回設定</button>' +
      "</div></div>";
    document.body.appendChild(mask);
    mask.querySelectorAll("button[data-a]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        MLP.Sound.click();
        if (btn.getAttribute("data-a") === "again") startGame();
        else { removeResult(); showSettings(); }
      });
    });
  }

  /* ---------- 事件 ---------- */
  boardEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn || btn.disabled) return;
    if (mode === "classic") handleClassicClick(+btn.getAttribute("data-i"));
    else handleUltimateClick(+btn.getAttribute("data-b"), +btn.getAttribute("data-c"));
  });

  $("mode-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    mode = b.getAttribute("data-mode");
    document.querySelectorAll("#mode-seg button").forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
    MLP.save("mlp-ttt-mode", mode);
    $("mode-desc").textContent = mode === "classic" ? "純粹的速度與反應對決。" : "策略深度極高，每步棋都影響下一個戰場。";
  });
  $("time-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    timeLimit = +b.getAttribute("data-time");
    document.querySelectorAll("#time-seg button").forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
    MLP.save("mlp-ttt-time", timeLimit);
  });
  $("btn-start").addEventListener("click", startGame);
  $("btn-surrender").addEventListener("click", handleSurrender);
  $("btn-reset-scores").addEventListener("click", resetScores);
  $("btn-back-settings").addEventListener("click", showSettings);

  /* ---------- 測試接口 ---------- */
  window.__ttt = {
    state: function () {
      return { mode: mode, status: status, winner: winner, scores: scores, isXNext: isXNext,
        classicBoard: classicBoard.slice(), mainBoard: mainBoard.slice(), nextActiveBoard: nextActiveBoard };
    },
    setup: function (m, t) { mode = m; timeLimit = t || 15; },
    clickClassic: handleClassicClick,
    clickUltimate: handleUltimateClick,
    start: startGame,
  };

  /* ---------- 啟動 ---------- */
  MLP.buildSky({ clouds: 4, stars: 8 });
  MLP.mountSoundToggle($("sound-slot"));
  MLP.wireClickSounds();
  MLP.selectSeg($("mode-seg"), "data-mode", mode);
  MLP.selectSeg($("time-seg"), "data-time", String(timeLimit));
  $("mode-desc").textContent = mode === "classic" ? "純粹的速度與反應對決。" : "策略深度極高，每步棋都影響下一個戰場。";
  updateScoresUI();
  showSettings();
})();
