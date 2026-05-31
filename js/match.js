/* ============================================================
   關係配對連連看 — 動物找食物
   ============================================================ */
(function () {
  "use strict";

  // key, 動物, 食物
  var PAIRS = [
    { key: "monkey", a: ["🐵", "猴子"], f: ["🍌", "香蕉"] },
    { key: "tiger", a: ["🐯", "老虎"], f: ["🍖", "肉肉"] },
    { key: "bird", a: ["🐦", "小鳥"], f: ["🐛", "蟲蟲"] },
    { key: "rabbit", a: ["🐰", "兔子"], f: ["🥕", "紅蘿蔔"] },
    { key: "cat", a: ["🐱", "貓咪"], f: ["🐟", "小魚"] },
    { key: "panda", a: ["🐼", "熊貓"], f: ["🎋", "竹子"] },
    { key: "dog", a: ["🐶", "小狗"], f: ["🦴", "骨頭"] },
    { key: "bear", a: ["🐻", "小熊"], f: ["🍯", "蜂蜜"] },
    { key: "mouse", a: ["🐭", "老鼠"], f: ["🧀", "起司"] },
    { key: "elephant", a: ["🐘", "大象"], f: ["🥜", "花生"] },
    { key: "giraffe", a: ["🦒", "長頸鹿"], f: ["🍃", "樹葉"] },
    { key: "bee", a: ["🐝", "蜜蜂"], f: ["🌸", "花朵"] },
  ];

  var DIFFS = { easy: 4, medium: 5, hard: 6 };
  var diff = "easy";

  var area = document.getElementById("area");
  var leftCol = document.getElementById("left");
  var rightCol = document.getElementById("right");
  var lines = document.getElementById("lines");
  var doneCountEl = document.getElementById("done-count");
  var totalCountEl = document.getElementById("total-count");

  var selected = null; // {el, key, side}
  var matchedLinks = []; // {leftEl, rightEl, color}
  var doneCount = 0;
  var total = 0;
  var lock = false;

  var LINE_COLORS = ["#ff6fae", "#ffb44d", "#7bd88f", "#69b7ff", "#b794ff", "#ff9a5c"];

  function makeCard(emoji, label, key, side) {
    var d = document.createElement("div");
    d.className = "mcard";
    d.setAttribute("data-key", key);
    d.setAttribute("data-side", side);
    d.innerHTML =
      '<span class="emj">' + emoji + "</span>" +
      '<span class="lbl">' + label + "</span>";
    d.addEventListener("click", function () {
      onCard(d, key, side);
    });
    return d;
  }

  function newGame() {
    selected = null;
    matchedLinks = [];
    doneCount = 0;
    lock = false;
    leftCol.innerHTML = "";
    rightCol.innerHTML = "";
    lines.innerHTML = "";

    var n = DIFFS[diff];
    var chosen = MLP.shuffle(PAIRS.slice()).slice(0, n);
    total = chosen.length;
    doneCountEl.textContent = "0";
    totalCountEl.textContent = total;

    // 左欄：動物（順序）；右欄：食物（打亂）
    var foods = MLP.shuffle(chosen.slice());
    chosen.forEach(function (p) {
      leftCol.appendChild(makeCard(p.a[0], p.a[1], p.key, "left"));
    });
    foods.forEach(function (p) {
      rightCol.appendChild(makeCard(p.f[0], p.f[1], p.key, "right"));
    });
  }

  function onCard(el, key, side) {
    if (lock) return;
    if (el.classList.contains("done")) return;

    if (!selected) {
      select(el, key, side);
      MLP.Sound.flip();
      return;
    }

    if (selected.el === el) {
      // 取消選取
      deselect();
      return;
    }

    if (selected.side === side) {
      // 同一邊，改選
      deselect();
      select(el, key, side);
      MLP.Sound.flip();
      return;
    }

    // 不同邊 → 判定
    lock = true;
    if (selected.key === key) {
      var leftEl = side === "left" ? el : selected.el;
      var rightEl = side === "right" ? el : selected.el;
      leftEl.classList.add("done");
      rightEl.classList.add("done");
      leftEl.classList.remove("sel");
      rightEl.classList.remove("sel");
      var color = LINE_COLORS[doneCount % LINE_COLORS.length];
      matchedLinks.push({ leftEl: leftEl, rightEl: rightEl, color: color });
      drawLines();
      MLP.Sound.correct();
      MLP.sparkleAtEl(el);
      MLP.sparkleAtEl(selected.el);
      selected = null;
      doneCount++;
      doneCountEl.textContent = doneCount;
      lock = false;
      if (doneCount === total) win();
    } else {
      // 配錯
      var a = selected.el;
      var b = el;
      MLP.Sound.wrong();
      a.classList.add("shake");
      b.classList.add("shake");
      setTimeout(function () {
        a.classList.remove("shake", "sel");
        b.classList.remove("shake");
        selected = null;
        lock = false;
      }, 550);
    }
  }

  function select(el, key, side) {
    selected = { el: el, key: key, side: side };
    el.classList.add("sel");
  }
  function deselect() {
    if (selected) selected.el.classList.remove("sel");
    selected = null;
  }

  function drawLines() {
    var ar = area.getBoundingClientRect();
    lines.setAttribute("width", ar.width);
    lines.setAttribute("height", ar.height);
    lines.setAttribute("viewBox", "0 0 " + ar.width + " " + ar.height);
    var html = "";
    matchedLinks.forEach(function (link) {
      var lr = link.leftEl.getBoundingClientRect();
      var rr = link.rightEl.getBoundingClientRect();
      var x1 = lr.right - ar.left;
      var y1 = lr.top + lr.height / 2 - ar.top;
      var x2 = rr.left - ar.left;
      var y2 = rr.top + rr.height / 2 - ar.top;
      var mx = (x1 + x2) / 2;
      html +=
        '<path d="M' + x1 + " " + y1 + " C " + mx + " " + y1 + ", " + mx +
        " " + y2 + ", " + x2 + " " + y2 +
        '" stroke="' + link.color + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
      html += '<circle cx="' + x1 + '" cy="' + y1 + '" r="5" fill="' + link.color + '"/>';
      html += '<circle cx="' + x2 + '" cy="' + y2 + '" r="5" fill="' + link.color + '"/>';
    });
    lines.innerHTML = html;
  }

  function win() {
    setTimeout(function () {
      MLP.celebrate({
        emoji: "🌟",
        title: "全部配對成功！",
        text: "你好厲害，每隻小動物都吃到最愛了！",
        actions: [
          { label: "再玩一次 🔄", cls: "green", onClick: newGame },
          {
            label: "回城堡 🏰",
            cls: "ghost",
            onClick: function () {
              location.href = "index.html";
            },
          },
        ],
      });
    }, 450);
  }

  /* ---------------- 控制 ---------------- */
  document.getElementById("diff-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    diff = b.getAttribute("data-diff");
    document.getElementById("diff-seg").querySelectorAll("button").forEach(function (x) {
      x.classList.remove("on");
    });
    b.classList.add("on");
    newGame();
  });
  document.getElementById("btn-restart").addEventListener("click", newGame);
  window.addEventListener("resize", drawLines);

  /* ---------------- 啟動 ---------------- */
  MLP.buildSky({ clouds: 5, stars: 10 });
  MLP.mountSoundToggle(document.getElementById("sound-slot"));
  MLP.wireClickSounds();
  newGame();
})();
