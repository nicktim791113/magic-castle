/* ============================================================
   貝兒數字挑戰 — 撲克牌累加心算（美女與野獸主題）
   翻牌把點數加進總和，全部加完要等於目標數。
   A=1, J=11, Q=12, K=13。難度＝牌數（13/26/52，目標 91/182/364）。
   ============================================================ */
(function () {
  "use strict";

  var SUITS = ["♠", "♥", "♦", "♣"];
  var VALUES = [
    { rank: "A", value: 1 }, { rank: "2", value: 2 }, { rank: "3", value: 3 },
    { rank: "4", value: 4 }, { rank: "5", value: 5 }, { rank: "6", value: 6 },
    { rank: "7", value: 7 }, { rank: "8", value: 8 }, { rank: "9", value: 9 },
    { rank: "10", value: 10 }, { rank: "J", value: 11 }, { rank: "Q", value: 12 },
    { rank: "K", value: 13 },
  ];
  var DIFFS = { easy: 1, medium: 2, hard: 4 }; // 花色套數

  var diff = DIFFS[MLP.load("mlp-cards-diff", "easy")] ? MLP.load("mlp-cards-diff", "easy") : "easy";
  var deck = [], idx = 0, sum = 0, target = 91, playing = false;
  var startTime = 0, elapsed = 0, timer = null;

  var $ = function (id) { return document.getElementById(id); };
  var menuEl = $("menu"), gameEl = $("game");
  var inputEl = $("answer");

  function fmtTime(s) {
    var m = (s / 60) | 0, ss = s % 60;
    return m + "分 " + (ss < 10 ? "0" : "") + ss + "秒";
  }

  // 最佳時間（依難度），顯示在選單
  var bestEl = document.createElement("div");
  bestEl.style.cssText = "font-weight:800;color:#b8860b;margin:10px 0 0";
  $("diff-seg").insertAdjacentElement("afterend", bestEl);
  function bestKey() { return "mlp-cards-best-" + diff; }
  function renderBest() {
    var b = MLP.loadNum(bestKey(), 0);
    bestEl.textContent = b > 0 ? "🏅 這個難度最快：" + fmtTime(b) : "🏅 還沒有紀錄，快來挑戰！";
  }

  function buildDeck(suitsCount) {
    var d = [];
    for (var s = 0; s < suitsCount; s++) {
      for (var v = 0; v < VALUES.length; v++) {
        d.push({
          suit: SUITS[s], rank: VALUES[v].rank, value: VALUES[v].value,
          red: SUITS[s] === "♥" || SUITS[s] === "♦",
        });
      }
    }
    return MLP.shuffle(d);
  }

  function startGame() {
    deck = buildDeck(DIFFS[diff]);
    idx = 0; sum = 0; target = 91 * DIFFS[diff]; playing = true;
    startTime = Date.now(); elapsed = 0;
    menuEl.style.display = "none";
    gameEl.style.display = "block";
    $("target").textContent = target;
    startTimer();
    renderCard();
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(function () {
      elapsed = ((Date.now() - startTime) / 1000) | 0;
      $("time").textContent = fmtTime(elapsed);
    }, 1000);
  }

  function renderCard() {
    var card = deck[idx];
    var color = card.red ? "#e0556b" : "#33334d";
    $("card").className = "pcard";
    $("card").style.color = color;
    $("card").innerHTML =
      '<div class="corner tl"><span>' + card.rank + "</span><span>" + card.suit + "</span></div>" +
      '<div class="pip">' + card.suit + "</div>" +
      '<div class="corner br"><span>' + card.rank + "</span><span>" + card.suit + "</span></div>";
    $("sum").textContent = sum;
    $("add").textContent = card.value;
    $("add").style.color = color;
    $("progress").textContent = idx + 1 + " / " + deck.length;
    inputEl.value = "";
    inputEl.focus();
  }

  function check() {
    if (!playing) return;
    var v = inputEl.value.trim();
    if (v === "") return;
    var guess = parseInt(v, 10);
    var card = deck[idx];
    if (guess === sum + card.value) {
      sum += card.value;
      MLP.Sound.correct();
      var c = $("card");
      c.classList.add("ok");
      MLP.sparkleAtEl(c);
      if (idx >= deck.length - 1) {
        win();
        return;
      }
      setTimeout(function () {
        idx++;
        renderCard();
      }, 380);
    } else {
      MLP.Sound.wrong();
      var card2 = $("card");
      card2.classList.remove("shake");
      void card2.offsetWidth;
      card2.classList.add("shake");
      inputEl.value = "";
      inputEl.focus();
    }
  }

  function win() {
    playing = false;
    clearInterval(timer);
    var avg = (elapsed / deck.length).toFixed(1);
    var prevBest = MLP.loadNum(bestKey(), 0);
    var isNewBest = prevBest === 0 || elapsed < prevBest;
    if (isNewBest) { MLP.save(bestKey(), elapsed); renderBest(); }
    setTimeout(function () {
      MLP.celebrate({
        emoji: "🌹",
        title: "挑戰成功！",
        text: "總和正好是 " + target + "！用了 " + fmtTime(elapsed) + "（平均每張 " + avg + " 秒）" +
          (isNewBest ? "　🏅 最快紀錄！" : ""),
        actions: [
          { label: "再挑戰 🔄", cls: "gold", onClick: startGame },
          { label: "回城堡 🏰", cls: "ghost", onClick: function () { location.href = "index.html"; } },
        ],
      });
    }, 450);
  }

  /* ---------- 數字鍵盤 ---------- */
  document.querySelectorAll(".numpad [data-k]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-k");
      if (k === "del") inputEl.value = inputEl.value.slice(0, -1);
      else if (k === "ok") check();
      else if (inputEl.value.length < 4) inputEl.value += k;
      inputEl.focus();
    });
  });

  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); check(); }
  });
  // 只允許數字
  inputEl.addEventListener("input", function () {
    inputEl.value = inputEl.value.replace(/[^0-9]/g, "").slice(0, 4);
  });

  /* ---------- 提示 ---------- */
  $("btn-hint").addEventListener("click", function () {
    var h = $("hint");
    h.style.display = h.style.display === "block" ? "none" : "block";
  });

  /* ---------- 控制 ---------- */
  $("diff-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    diff = b.getAttribute("data-diff");
    document.querySelectorAll("#diff-seg button").forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
    MLP.save("mlp-cards-diff", diff); renderBest();
  });
  $("btn-start").addEventListener("click", startGame);
  $("btn-restart").addEventListener("click", function () {
    clearInterval(timer);
    playing = false;
    gameEl.style.display = "none";
    menuEl.style.display = "block";
  });

  /* ---------- 啟動 ---------- */
  MLP.buildSky({ clouds: 4, stars: 8 });
  MLP.mountSoundToggle($("sound-slot"));
  MLP.wireClickSounds();
  MLP.selectSeg($("diff-seg"), "data-diff", diff);
  renderBest();
})();
