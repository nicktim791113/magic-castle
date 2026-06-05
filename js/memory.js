/* ============================================================
   記憶配對消除 — 邏輯
   兩種模式：memory(翻面記憶) / visual(正面視覺)
   20 種圖案；支援 assets/img 圖片，缺圖自動退回 emoji。
   ============================================================ */
(function () {
  "use strict";

  // 20 種：emoji + 圖片 slug（assets/img/<slug>.png）
  var POOL = [
    { e: "🦊", img: "m-fox" }, { e: "🐰", img: "m-rabbit" }, { e: "🐱", img: "m-cat" },
    { e: "🐶", img: "m-dog" }, { e: "🐼", img: "m-panda" }, { e: "🐯", img: "m-tiger" },
    { e: "🦁", img: "m-lion" }, { e: "🐸", img: "m-frog" }, { e: "🐵", img: "m-monkey" },
    { e: "🐨", img: "m-koala" }, { e: "🦄", img: "m-unicorn" }, { e: "🐥", img: "m-chick" },
    { e: "🦋", img: "m-butterfly" }, { e: "🐠", img: "m-fish" }, { e: "🍓", img: "m-strawberry" },
    { e: "🍌", img: "m-banana" }, { e: "🍎", img: "m-apple" }, { e: "🍇", img: "m-grapes" },
    { e: "🌈", img: "m-rainbow" }, { e: "⭐", img: "m-star" },
  ];

  var DIFFS = {
    easy: { pairs: 3, cols: 3 },
    medium: { pairs: 6, cols: 4 },
    hard: { pairs: 8, cols: 4 },
    super: { pairs: 10, cols: 5 },
  };

  var mode = "memory";
  var diff = "easy";

  var board = document.getElementById("board");
  var movesEl = document.getElementById("moves");
  var timeEl = document.getElementById("time");
  var hintEl = document.getElementById("hint");

  var state = {
    first: null, lock: false, moves: 0, matched: 0, totalPairs: 0,
    started: false, timer: null, seconds: 0,
  };

  function fmt(s) {
    var m = (s / 60) | 0, ss = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (ss < 10 ? "0" : "") + ss;
  }
  function startTimer() {
    if (state.started) return;
    state.started = true;
    state.timer = setInterval(function () { state.seconds++; timeEl.textContent = fmt(state.seconds); }, 1000);
  }
  function stopTimer() { clearInterval(state.timer); state.timer = null; }

  function makeDeck() {
    var pool = MLP.shuffle(POOL.slice());
    var n = DIFFS[diff].pairs;
    var chosen = pool.slice(0, n);
    var deck = chosen.concat(chosen);
    return MLP.shuffle(deck);
  }

  function newGame() {
    stopTimer();
    state.first = null; state.lock = false; state.moves = 0; state.matched = 0;
    state.started = false; state.seconds = 0;
    movesEl.textContent = "0"; timeEl.textContent = "00:00";

    var deck = makeDeck();
    state.totalPairs = deck.length / 2;
    board.innerHTML = "";
    board.style.gridTemplateColumns = "repeat(" + DIFFS[diff].cols + ", 1fr)";

    hintEl.textContent = mode === "memory"
      ? "翻開兩張一樣的卡片就能消除它們！🧠"
      : "找出兩張一樣的圖案，點一點消除它們！👀";

    deck.forEach(function (item, idx) {
      var card = document.createElement("button");
      card.className = "card" + (mode === "visual" ? " flipped" : "");
      card.setAttribute("data-emoji", item.e);
      card.setAttribute("data-idx", idx);
      var inner = document.createElement("div"); inner.className = "card-inner";
      var back = document.createElement("div"); back.className = "card-face card-back"; back.textContent = "❄️";
      var front = document.createElement("div"); front.className = "card-face card-front";
      front.appendChild(MLP.iconEl("assets/img/" + item.img + ".png", item.e));
      inner.appendChild(back); inner.appendChild(front);
      card.appendChild(inner);
      card.addEventListener("click", function () { onCard(card); });
      board.appendChild(card);
    });
  }

  function onCard(card) {
    if (state.lock) return;
    if (card.classList.contains("matched")) return;
    if (card === state.first) return;
    if (mode === "memory" && card.classList.contains("flipped") && card !== state.first) return;

    startTimer();
    if (mode === "memory") { card.classList.add("flipped"); MLP.Sound.flip(); }
    else { card.classList.add("sel"); MLP.Sound.flip(); }

    if (!state.first) { state.first = card; return; }

    state.moves++; movesEl.textContent = state.moves;
    var a = state.first, b = card; state.first = null;

    if (a.getAttribute("data-emoji") === b.getAttribute("data-emoji")) {
      state.lock = true;
      setTimeout(function () {
        a.classList.add("matched"); b.classList.add("matched");
        a.classList.remove("sel"); b.classList.remove("sel");
        MLP.Sound.correct(); MLP.sparkleAtEl(a); MLP.sparkleAtEl(b);
        state.matched++; state.lock = false;
        if (state.matched === state.totalPairs) win();
      }, 320);
    } else {
      state.lock = true; MLP.Sound.wrong();
      a.classList.add("shake"); b.classList.add("shake");
      setTimeout(function () {
        if (mode === "memory") { a.classList.remove("flipped"); b.classList.remove("flipped"); }
        a.classList.remove("sel", "shake"); b.classList.remove("sel", "shake");
        state.lock = false;
      }, 750);
    }
  }

  function win() {
    stopTimer();
    var msg = "你用了 " + state.moves + " 步、" + fmt(state.seconds) + " 完成！";
    setTimeout(function () {
      MLP.celebrate({
        emoji: "🏆", title: "全部消除囉！", text: msg,
        actions: [
          { label: "再玩一次 🔄", cls: "ice", onClick: newGame },
          { label: "回城堡 🏰", cls: "ghost", onClick: function () { location.href = "index.html"; } },
        ],
      });
    }, 500);
  }

  document.getElementById("mode-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    mode = b.getAttribute("data-mode"); setSeg("mode-seg", b); newGame();
  });
  document.getElementById("diff-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    diff = b.getAttribute("data-diff"); setSeg("diff-seg", b); newGame();
  });
  document.getElementById("btn-restart").addEventListener("click", newGame);

  function setSeg(id, btn) {
    document.getElementById(id).querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
    btn.classList.add("on");
  }

  MLP.buildSky({ clouds: 5, stars: 12 });
  MLP.mountSoundToggle(document.getElementById("sound-slot"));
  MLP.wireClickSounds();
  newGame();
})();
