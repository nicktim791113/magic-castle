/* ============================================================
   迷宮闖關 — 走迷宮 + 對應關係配對
   主題：動物找食物 / 字母找發音物件 / 形狀配對
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 主題資料 ---------------- */
  var THEMES = {
    animal: {
      name: "動物找食物",
      isLetter: false,
      prompt: function (s) { return "帶 " + s + " 走迷宮，找到牠最愛吃的東西！"; },
      pairs: [
        { subj: "🐰", obj: "🥕" },
        { subj: "🐵", obj: "🍌" },
        { subj: "🐱", obj: "🐟" },
        { subj: "🐶", obj: "🦴" },
        { subj: "🐼", obj: "🎋" },
        { subj: "🐻", obj: "🍯" },
        { subj: "🐭", obj: "🧀" },
        { subj: "🐯", obj: "🍖" },
      ],
    },
    letter: {
      name: "字母發音",
      isLetter: true,
      prompt: function (s) { return "帶字母 " + s + " 走迷宮，找到 " + s + " 開頭的東西！"; },
      pairs: [
        { subj: "A", obj: "🍎" },
        { subj: "B", obj: "⚽" },
        { subj: "C", obj: "🐱" },
        { subj: "D", obj: "🐶" },
        { subj: "E", obj: "🥚" },
        { subj: "F", obj: "🐟" },
        { subj: "G", obj: "🍇" },
        { subj: "S", obj: "☀️" },
        { subj: "T", obj: "🌳" },
        { subj: "M", obj: "🌙" },
      ],
    },
    shape: {
      name: "形狀配對",
      isLetter: false,
      prompt: function (s) { return "帶 " + s + " 走迷宮，找到一樣的形狀！"; },
      pairs: [
        { subj: "🔺", obj: "🔺" },
        { subj: "🟦", obj: "🟦" },
        { subj: "⭐", obj: "⭐" },
        { subj: "🔵", obj: "🔵" },
        { subj: "❤️", obj: "❤️" },
        { subj: "🔶", obj: "🔶" },
        { subj: "🟢", obj: "🟢" },
        { subj: "🟣", obj: "🟣" },
      ],
    },
  };

  var DIFFS = {
    easy: { N: 8, decoys: 1 },
    medium: { N: 11, decoys: 2 },
    hard: { N: 14, decoys: 3 },
  };

  /* ---------------- 狀態 ---------------- */
  var SIZE = 540;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var canvas = document.getElementById("maze");
  var ctx = canvas.getContext("2d");

  var themeKey = "animal";
  var diffKey = "easy";
  var N = DIFFS.easy.N;
  var cells = []; // 每格 {n,e,s,w}
  var player = { r: 0, c: 0 };
  var items = []; // {r,c,obj,correct,tried}
  var subjectText = "";
  var subjectIsLetter = false;
  var won = false;
  var moves = 0;
  var level = 1;

  var promptEl = document.getElementById("prompt");
  var toastEl = document.getElementById("toast");
  var levelEl = document.getElementById("level");
  var movesEl = document.getElementById("moves");

  /* ---------------- 迷宮生成（遞迴回溯） ---------------- */
  var DIRS = [
    { d: "n", dr: -1, dc: 0, opp: "s" },
    { d: "e", dr: 0, dc: 1, opp: "w" },
    { d: "s", dr: 1, dc: 0, opp: "n" },
    { d: "w", dr: 0, dc: -1, opp: "e" },
  ];

  function genMaze(n) {
    var arr = [];
    for (var i = 0; i < n * n; i++) arr.push({ n: true, e: true, s: true, w: true, v: false });
    var stack = [0];
    arr[0].v = true;
    while (stack.length) {
      var cur = stack[stack.length - 1];
      var r = (cur / n) | 0, c = cur % n;
      var nbrs = [];
      for (var k = 0; k < 4; k++) {
        var D = DIRS[k];
        var nr = r + D.dr, nc = c + D.dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
          var ni = nr * n + nc;
          if (!arr[ni].v) nbrs.push({ ni: ni, D: D });
        }
      }
      if (nbrs.length) {
        var pick = nbrs[(Math.random() * nbrs.length) | 0];
        arr[cur][pick.D.d] = false;
        arr[pick.ni][pick.D.opp] = false;
        arr[pick.ni].v = true;
        stack.push(pick.ni);
      } else {
        stack.pop();
      }
    }
    return arr;
  }

  function deadEnds(arr, n) {
    var de = [];
    for (var i = 0; i < arr.length; i++) {
      var c = arr[i];
      var w = (c.n ? 1 : 0) + (c.e ? 1 : 0) + (c.s ? 1 : 0) + (c.w ? 1 : 0);
      if (w === 3 && i !== 0) de.push(i);
    }
    return de;
  }

  /* ---------------- 開新迷宮 ---------------- */
  function newRound() {
    won = false;
    moves = 0;
    N = DIFFS[diffKey].N;
    cells = genMaze(N);
    player = { r: 0, c: 0 };

    // 選題目
    var theme = THEMES[themeKey];
    subjectIsLetter = theme.isLetter;
    var pool = theme.pairs.slice();
    MLP.shuffle(pool);
    var answer = pool[0];
    subjectText = answer.subj;
    var numDecoys = DIFFS[diffKey].decoys;
    var decoyObjs = [];
    for (var i = 1; i < pool.length && decoyObjs.length < numDecoys; i++) {
      if (pool[i].obj !== answer.obj && decoyObjs.indexOf(pool[i].obj) < 0)
        decoyObjs.push(pool[i].obj);
    }

    // 找放置點：優先死路，不夠就隨機非起點格
    var spots = deadEnds(cells, N);
    MLP.shuffle(spots);
    var need = 1 + decoyObjs.length;
    var chosen = spots.slice(0, need);
    while (chosen.length < need) {
      var rnd = (Math.random() * cells.length) | 0;
      if (rnd !== 0 && chosen.indexOf(rnd) < 0) chosen.push(rnd);
    }

    items = [];
    // 第一個放正解
    items.push({ r: (chosen[0] / N) | 0, c: chosen[0] % N, obj: answer.obj, correct: true, tried: false });
    for (var j = 0; j < decoyObjs.length; j++) {
      var idx = chosen[j + 1];
      items.push({ r: (idx / N) | 0, c: idx % N, obj: decoyObjs[j], correct: false, tried: false });
    }

    promptEl.textContent = theme.prompt(subjectText);
    updateStats();
    render();
  }

  function updateStats() {
    levelEl.textContent = level;
    movesEl.textContent = moves;
  }

  /* ---------------- 繪製 ---------------- */
  function setupCanvas() {
    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
  }

  function render() {
    var cell = SIZE / N;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    // 背景
    ctx.fillStyle = "#f4eeff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    // 起點格淡色
    ctx.fillStyle = "#e7f7ea";
    ctx.fillRect(0, 0, cell, cell);

    // 牆
    ctx.strokeStyle = "#a98fe0";
    ctx.lineWidth = Math.max(2.5, cell * 0.1);
    ctx.lineCap = "round";
    ctx.beginPath();
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        var cellObj = cells[r * N + c];
        var x = c * cell, y = r * cell;
        if (cellObj.n) { ctx.moveTo(x, y); ctx.lineTo(x + cell, y); }
        if (cellObj.w) { ctx.moveTo(x, y); ctx.lineTo(x, y + cell); }
        if (cellObj.e && c === N - 1) { ctx.moveTo(x + cell, y); ctx.lineTo(x + cell, y + cell); }
        if (cellObj.s && r === N - 1) { ctx.moveTo(x, y + cell); ctx.lineTo(x + cell, y + cell); }
      }
    }
    ctx.stroke();

    // 目標物
    items.forEach(function (it) {
      var cx = (it.c + 0.5) * cell, cy = (it.r + 0.5) * cell;
      ctx.beginPath();
      ctx.fillStyle = it.tried ? "rgba(200,180,170,0.35)" : "rgba(255,214,120,0.5)";
      ctx.arc(cx, cy, cell * 0.42, 0, Math.PI * 2);
      ctx.fill();
      drawText(it.obj, cx, cy, cell * 0.56, it.tried ? 0.4 : 1);
    });

    // 玩家
    var px = (player.c + 0.5) * cell, py = (player.r + 0.5) * cell;
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(px, py, cell * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = Math.max(2, cell * 0.06);
    ctx.strokeStyle = "#ff5fa9";
    ctx.stroke();
    if (subjectIsLetter) {
      ctx.fillStyle = "#7a4bd0";
      ctx.font = "900 " + cell * 0.5 + 'px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(subjectText, px, py + cell * 0.02);
    } else {
      drawText(subjectText, px, py, cell * 0.52, 1);
    }
  }

  function drawText(t, cx, cy, fs, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.font = fs + 'px "Segoe UI Emoji", "Apple Color Emoji", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t, cx, cy);
    ctx.restore();
  }

  /* ---------------- 移動 ---------------- */
  function tryMove(dir) {
    if (won) return;
    var i = player.r * N + player.c;
    if (cells[i][dir]) { return; } // 撞牆
    var off = { n: [-1, 0], e: [0, 1], s: [1, 0], w: [0, -1] }[dir];
    player.r += off[0];
    player.c += off[1];
    moves++;
    updateStats();
    MLP.Sound.flip();
    render();
    checkItem();
  }

  function checkItem() {
    var hit = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].r === player.r && items[i].c === player.c) { hit = items[i]; break; }
    }
    if (!hit) return;
    if (hit.correct) {
      win();
    } else {
      hit.tried = true;
      MLP.Sound.wrong();
      shake();
      toast("這個不對哦～再找找看！");
      render();
    }
  }

  function win() {
    won = true;
    MLP.sparkleAtEl(canvas);
    setTimeout(function () {
      MLP.celebrate({
        emoji: "🏁",
        title: "走到囉！",
        text: "你帶 " + subjectText + " 找到正確的目標，闖關成功！",
        actions: [
          { label: "下一關 ➡️", cls: "purple", onClick: function () { level++; newRound(); } },
          { label: "回城堡 🏰", cls: "ghost", onClick: function () { location.href = "index.html"; } },
        ],
      });
    }, 400);
  }

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1400);
  }

  function shake() {
    canvas.classList.remove("shake");
    void canvas.offsetWidth;
    canvas.classList.add("shake");
  }

  /* ---------------- 控制：鍵盤 ---------------- */
  window.addEventListener("keydown", function (e) {
    var map = {
      ArrowUp: "n", ArrowDown: "s", ArrowLeft: "w", ArrowRight: "e",
      w: "n", s: "s", a: "w", d: "e", W: "n", S: "s", A: "w", D: "e",
    };
    var dir = map[e.key];
    if (dir) { e.preventDefault(); tryMove(dir); }
  });

  /* ---------------- 控制：方向鍵按鈕 ---------------- */
  document.querySelectorAll(".dpad [data-dir]").forEach(function (b) {
    b.addEventListener("click", function () { tryMove(b.getAttribute("data-dir")); });
  });

  /* ---------------- 控制：滑動 ---------------- */
  var ts = null;
  canvas.addEventListener("touchstart", function (e) {
    var t = e.changedTouches[0];
    ts = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  canvas.addEventListener("touchend", function (e) {
    if (!ts) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - ts.x, dy = t.clientY - ts.y;
    ts = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) tryMove(dx > 0 ? "e" : "w");
    else tryMove(dy > 0 ? "s" : "n");
  }, { passive: true });

  /* ---------------- 控制列 ---------------- */
  document.getElementById("theme-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    themeKey = b.getAttribute("data-theme");
    setSeg("theme-seg", b);
    level = 1;
    newRound();
  });
  document.getElementById("diff-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    diffKey = b.getAttribute("data-diff");
    setSeg("diff-seg", b);
    level = 1;
    newRound();
  });
  document.getElementById("btn-new").addEventListener("click", function () { newRound(); });

  function setSeg(id, btn) {
    document.getElementById(id).querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
    btn.classList.add("on");
  }

  /* ---------------- 測試用接口 ---------------- */
  window.__maze = {
    state: function () {
      return {
        N: N, player: { r: player.r, c: player.c }, won: won, level: level,
        items: items.map(function (it) { return { r: it.r, c: it.c, correct: it.correct, obj: it.obj }; }),
      };
    },
    walls: function () { return cells.map(function (x) { return { n: x.n, e: x.e, s: x.s, w: x.w }; }); },
    move: function (dir) { tryMove(dir); },
  };

  /* ---------------- 啟動 ---------------- */
  MLP.buildSky({ clouds: 4, stars: 10 });
  MLP.mountSoundToggle(document.getElementById("sound-slot"));
  MLP.wireClickSounds();
  setupCanvas();
  newRound();
})();
