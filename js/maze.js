/* ============================================================
   迷宮闖關 — 走迷宮 + 對應關係配對
   主題：動物找食物 / 字母找發音物件 / 形狀配對
   操作：鍵盤方向鍵、螢幕方向鍵、用滑鼠/手指「拖曳」移動（留下彩虹軌跡）
   幼兒等級：運筆描繪（直線/S形/曲線/弧形/形狀輪廓/長短），沿著虛線描繪。
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 主題資料 ---------------- */
  var THEMES = {
    animal: {
      name: "動物找食物", isLetter: false,
      prompt: function (s) { return "帶 " + s + " 走迷宮，找到牠最愛吃的東西！"; },
      pairs: [
        { subj: "🐰", obj: "🥕" }, { subj: "🐵", obj: "🍌" }, { subj: "🐱", obj: "🐟" },
        { subj: "🐶", obj: "🦴" }, { subj: "🐼", obj: "🎋" }, { subj: "🐻", obj: "🍯" },
        { subj: "🐭", obj: "🧀" }, { subj: "🐯", obj: "🍖" },
      ],
    },
    letter: {
      name: "字母發音", isLetter: true,
      prompt: function (s) { return "帶字母 " + s + " 走迷宮，找到 " + s + " 開頭的東西！"; },
      pairs: [
        { subj: "A", obj: "🍎" }, { subj: "B", obj: "⚽" }, { subj: "C", obj: "🐱" },
        { subj: "D", obj: "🐶" }, { subj: "E", obj: "🥚" }, { subj: "F", obj: "🐟" },
        { subj: "G", obj: "🍇" }, { subj: "S", obj: "☀️" }, { subj: "T", obj: "🌳" }, { subj: "M", obj: "🌙" },
      ],
    },
    shape: {
      name: "形狀配對", isLetter: false,
      prompt: function (s) { return "帶 " + s + " 走迷宮，找到一樣的形狀！"; },
      pairs: [
        { subj: "🔺", obj: "🔺" }, { subj: "🟦", obj: "🟦" }, { subj: "⭐", obj: "⭐" },
        { subj: "🔵", obj: "🔵" }, { subj: "❤️", obj: "❤️" }, { subj: "🔶", obj: "🔶" },
        { subj: "🟢", obj: "🟢" }, { subj: "🟣", obj: "🟣" },
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

  var mode = "maze"; // maze / trace
  var themeKey = "animal";
  var diffKey = "easy";
  var N = DIFFS.easy.N;
  var cells = [], items = [];
  var player = { r: 0, c: 0 };
  var trailCells = [];
  var subjectText = "", subjectIsLetter = false;
  var won = false, moves = 0, level = 1;

  // 幼兒描繪
  var tracePts = [], gems = [], traceStroke = [], traceShapeName = "";

  var dragging = false;

  var promptEl = document.getElementById("prompt");
  var toastEl = document.getElementById("toast");
  var levelEl = document.getElementById("level");
  var movesEl = document.getElementById("moves");
  var themeSeg = document.getElementById("theme-seg");
  var dpadEl = document.getElementById("dpad");
  var statsEl = document.getElementById("stats");

  /* ---------------- 迷宮生成 ---------------- */
  var DIRS = [
    { d: "n", dr: -1, dc: 0, opp: "s" }, { d: "e", dr: 0, dc: 1, opp: "w" },
    { d: "s", dr: 1, dc: 0, opp: "n" }, { d: "w", dr: 0, dc: -1, opp: "e" },
  ];
  function genMaze(n) {
    var arr = [];
    for (var i = 0; i < n * n; i++) arr.push({ n: true, e: true, s: true, w: true, v: false });
    var stack = [0]; arr[0].v = true;
    while (stack.length) {
      var cur = stack[stack.length - 1], r = (cur / n) | 0, c = cur % n, nbrs = [];
      for (var k = 0; k < 4; k++) {
        var D = DIRS[k], nr = r + D.dr, nc = c + D.dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n) { var ni = nr * n + nc; if (!arr[ni].v) nbrs.push({ ni: ni, D: D }); }
      }
      if (nbrs.length) {
        var pick = nbrs[(Math.random() * nbrs.length) | 0];
        arr[cur][pick.D.d] = false; arr[pick.ni][pick.D.opp] = false; arr[pick.ni].v = true; stack.push(pick.ni);
      } else stack.pop();
    }
    return arr;
  }
  function deadEnds(arr, n) {
    var de = [];
    for (var i = 0; i < arr.length; i++) {
      var c = arr[i], w = (c.n ? 1 : 0) + (c.e ? 1 : 0) + (c.s ? 1 : 0) + (c.w ? 1 : 0);
      if (w === 3 && i !== 0) de.push(i);
    }
    return de;
  }

  /* ---------------- 開新一關 ---------------- */
  function clearModal() { var m = document.querySelector(".modal-mask"); if (m) m.remove(); }
  function newRound() {
    clearModal();
    if (mode === "trace") { newTrace(); return; }
    won = false; moves = 0; N = DIFFS[diffKey].N;
    cells = genMaze(N); player = { r: 0, c: 0 }; trailCells = [{ r: 0, c: 0 }];

    var theme = THEMES[themeKey];
    subjectIsLetter = theme.isLetter;
    var pool = MLP.shuffle(theme.pairs.slice());
    var answer = pool[0]; subjectText = answer.subj;
    var numDecoys = DIFFS[diffKey].decoys, decoyObjs = [];
    for (var i = 1; i < pool.length && decoyObjs.length < numDecoys; i++) {
      if (pool[i].obj !== answer.obj && decoyObjs.indexOf(pool[i].obj) < 0) decoyObjs.push(pool[i].obj);
    }
    var spots = MLP.shuffle(deadEnds(cells, N)), need = 1 + decoyObjs.length, chosen = spots.slice(0, need);
    while (chosen.length < need) { var rnd = (Math.random() * cells.length) | 0; if (rnd !== 0 && chosen.indexOf(rnd) < 0) chosen.push(rnd); }
    items = [{ r: (chosen[0] / N) | 0, c: chosen[0] % N, obj: answer.obj, correct: true, tried: false }];
    for (var j = 0; j < decoyObjs.length; j++) {
      var idx = chosen[j + 1];
      items.push({ r: (idx / N) | 0, c: idx % N, obj: decoyObjs[j], correct: false, tried: false });
    }
    promptEl.innerHTML = theme.prompt(subjectText) + ' <span style="font-size:13px;opacity:.7">（也可以用手指拖著走 ✏️）</span>';
    updateStats(); render();
  }

  function updateStats() { levelEl.textContent = level; movesEl.textContent = moves; }
  function setupCanvas() { canvas.width = SIZE * DPR; canvas.height = SIZE * DPR; }

  /* ---------------- 迷宮繪製 ---------------- */
  function cellCenter(rc, cell) { return { x: (rc.c + 0.5) * cell, y: (rc.r + 0.5) * cell }; }

  function render() {
    if (mode === "trace") { renderTrace(); return; }
    var cell = SIZE / N;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#f4eeff"; ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#e7f7ea"; ctx.fillRect(0, 0, cell, cell);
    // 牆
    ctx.strokeStyle = "#a98fe0"; ctx.lineWidth = Math.max(2.5, cell * 0.1); ctx.lineCap = "round";
    ctx.beginPath();
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      var co = cells[r * N + c], x = c * cell, y = r * cell;
      if (co.n) { ctx.moveTo(x, y); ctx.lineTo(x + cell, y); }
      if (co.w) { ctx.moveTo(x, y); ctx.lineTo(x, y + cell); }
      if (co.e && c === N - 1) { ctx.moveTo(x + cell, y); ctx.lineTo(x + cell, y + cell); }
      if (co.s && r === N - 1) { ctx.moveTo(x, y + cell); ctx.lineTo(x + cell, y + cell); }
    }
    ctx.stroke();
    // 軌跡
    if (trailCells.length > 1) drawGlowTrail(trailCells.map(function (rc) { return cellCenter(rc, cell); }), cell * 0.3);
    // 目標物
    items.forEach(function (it) {
      var cx = (it.c + 0.5) * cell, cy = (it.r + 0.5) * cell;
      ctx.beginPath(); ctx.fillStyle = it.tried ? "rgba(200,180,170,0.35)" : "rgba(255,214,120,0.5)";
      ctx.arc(cx, cy, cell * 0.42, 0, Math.PI * 2); ctx.fill();
      drawText(it.obj, cx, cy, cell * 0.56, it.tried ? 0.4 : 1);
    });
    // 玩家
    var px = (player.c + 0.5) * cell, py = (player.r + 0.5) * cell;
    ctx.beginPath(); ctx.fillStyle = "#ffffff"; ctx.arc(px, py, cell * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = Math.max(2, cell * 0.06); ctx.strokeStyle = "#ff5fa9"; ctx.stroke();
    if (subjectIsLetter) {
      ctx.fillStyle = "#7a4bd0"; ctx.font = "900 " + cell * 0.5 + 'px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(subjectText, px, py + cell * 0.02);
    } else drawText(subjectText, px, py, cell * 0.52, 1);
  }

  function drawText(t, cx, cy, fs, alpha) {
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.font = fs + 'px "Segoe UI Emoji", "Apple Color Emoji", serif';
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(t, cx, cy); ctx.restore();
  }

  /* ---------------- 彩虹發光軌跡（特色效果） ---------------- */
  function drawGlowTrail(pts, width) {
    if (!pts.length) return;
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    // 發光底層
    ctx.shadowColor = "rgba(255,120,220,0.9)"; ctx.shadowBlur = 16;
    ctx.strokeStyle = "rgba(255,150,230,0.5)"; ctx.lineWidth = width + 6;
    ctx.beginPath();
    pts.forEach(function (p, i) { i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
    if (pts.length === 1) ctx.lineTo(pts[0].x + 0.1, pts[0].y);
    ctx.stroke();
    ctx.shadowBlur = 0;
    // 彩虹段
    for (var i = 1; i < pts.length; i++) {
      var hue = (i * 14) % 360;
      ctx.strokeStyle = "hsl(" + hue + ",92%,60%)"; ctx.lineWidth = width;
      ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
    }
    ctx.restore();
    var h = pts[pts.length - 1];
    drawText("✨", h.x, h.y, Math.max(18, width * 0.9), 1);
  }

  /* ---------------- 移動 ---------------- */
  function tryMove(dir) {
    if (won || mode !== "maze") return;
    var i = player.r * N + player.c;
    if (cells[i][dir]) return;
    var off = { n: [-1, 0], e: [0, 1], s: [1, 0], w: [0, -1] }[dir];
    player.r += off[0]; player.c += off[1];
    pushTrail(); moves++; updateStats(); MLP.Sound.flip(); render(); checkItem();
  }
  function pushTrail() {
    var last = trailCells[trailCells.length - 1];
    // 若回到上一格則收回軌跡（橡皮擦效果），否則延伸
    var prev = trailCells[trailCells.length - 2];
    if (prev && prev.r === player.r && prev.c === player.c) trailCells.pop();
    else if (!last || last.r !== player.r || last.c !== player.c) trailCells.push({ r: player.r, c: player.c });
  }
  function checkItem() {
    var hit = null;
    for (var i = 0; i < items.length; i++) if (items[i].r === player.r && items[i].c === player.c) { hit = items[i]; break; }
    if (!hit) return;
    if (hit.correct) win();
    else { hit.tried = true; MLP.Sound.wrong(); shake(); toast("這個不對哦～再找找看！"); render(); }
  }
  function win() {
    won = true; MLP.sparkleAtEl(canvas);
    setTimeout(function () {
      MLP.celebrate({
        emoji: "🏁", title: "走到囉！",
        text: "你帶 " + subjectText + " 找到正確的目標，闖關成功！",
        actions: [
          { label: "下一關 ➡️", cls: "purple", onClick: function () { level++; newRound(); } },
          { label: "回城堡 🏰", cls: "ghost", onClick: function () { location.href = "index.html"; } },
        ],
      });
    }, 400);
  }

  /* ============================================================
     幼兒運筆描繪模式
     ============================================================ */
  var M = 84;
  function linePts(x1, y1, x2, y2, n) { var p = []; n = n || 20; for (var i = 0; i <= n; i++) { var t = i / n; p.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t }); } return p; }
  function samplePts(fn, n) { var p = []; for (var i = 0; i <= n; i++) p.push(fn(i / n)); return p; }
  function polyPts(corners) {
    var p = [];
    for (var k = 0; k < corners.length; k++) {
      var a = corners[k], b = corners[(k + 1) % corners.length];
      for (var i = 0; i < 12; i++) { var t = i / 12; p.push({ x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t }); }
    }
    p.push({ x: corners[0][0], y: corners[0][1] }); return p;
  }
  var TRACE = [
    { name: "長橫線", make: function () { return linePts(M, SIZE / 2, SIZE - M, SIZE / 2); } },
    { name: "短橫線", make: function () { return linePts(SIZE * 0.32, SIZE / 2, SIZE * 0.68, SIZE / 2); } },
    { name: "直線", make: function () { return linePts(SIZE / 2, M, SIZE / 2, SIZE - M); } },
    { name: "斜線", make: function () { return linePts(M, SIZE - M, SIZE - M, M); } },
    { name: "波浪", make: function () { return samplePts(function (t) { return { x: M + t * (SIZE - 2 * M), y: SIZE / 2 + 92 * Math.sin(t * Math.PI * 3) }; }, 44); } },
    { name: "S 形", make: function () { return samplePts(function (t) { return { x: SIZE / 2 + 112 * Math.sin(t * Math.PI * 2), y: M + t * (SIZE - 2 * M) }; }, 44); } },
    { name: "彩虹弧", make: function () { return samplePts(function (t) { var a = Math.PI * (1 - t); return { x: SIZE / 2 - 185 * Math.cos(a), y: SIZE - M - 30 - 175 * Math.sin(a) }; }, 40); } },
    { name: "圓形", make: function () { return samplePts(function (t) { var a = t * Math.PI * 2 - Math.PI / 2; return { x: SIZE / 2 + 168 * Math.cos(a), y: SIZE / 2 + 168 * Math.sin(a) }; }, 52); }, closed: true },
    { name: "方形", make: function () { return polyPts([[M, M], [SIZE - M, M], [SIZE - M, SIZE - M], [M, SIZE - M]]); }, closed: true },
    { name: "三角形", make: function () { return polyPts([[SIZE / 2, M], [SIZE - M, SIZE - M], [M, SIZE - M]]); }, closed: true },
  ];
  var traceIdx = 0;

  function pathLen(p) { var L = 0; for (var i = 1; i < p.length; i++) L += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); return L; }
  function makeGems(p) {
    var count = Math.min(9, Math.max(6, Math.round(pathLen(p) / 130))), g = [];
    for (var i = 0; i < count; i++) { var idx = Math.round((i / (count - 1)) * (p.length - 1)); g.push({ x: p[idx].x, y: p[idx].y, got: false }); }
    return g;
  }
  function newTrace() {
    clearModal();
    won = false;
    var shape = TRACE[traceIdx % TRACE.length];
    tracePts = shape.make(); gems = makeGems(tracePts); traceStroke = []; traceShapeName = shape.name;
    promptEl.innerHTML = "用手指或滑鼠，沿著虛線從 🟢 描到 ⭐ ✏️ —— <b>" + shape.name + "</b>";
    render();
  }
  function renderTrace() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#fff8ef"; ctx.fillRect(0, 0, SIZE, SIZE);
    // 虛線導引
    ctx.save();
    ctx.setLineDash([11, 15]); ctx.lineWidth = 32; ctx.strokeStyle = "#e4d7f7"; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); tracePts.forEach(function (p, i) { i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }); ctx.stroke();
    ctx.restore();
    // 小朋友的筆跡
    if (traceStroke.length) drawGlowTrail(traceStroke, 16);
    // 寶石
    gems.forEach(function (g, i) {
      ctx.beginPath();
      if (g.got) { ctx.fillStyle = "#ffd24d"; ctx.arc(g.x, g.y, 17, 0, Math.PI * 2); ctx.fill(); }
      else {
        ctx.fillStyle = "#fff"; ctx.arc(g.x, g.y, 17, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = i === nextGem() ? "#ff5fa9" : "#cdbbef"; ctx.stroke();
      }
    });
    // 起點/終點
    drawText("🟢", gems[0].x, gems[0].y, 26, 1);
    drawText("⭐", gems[gems.length - 1].x, gems[gems.length - 1].y, 28, 1);
  }
  function nextGem() { for (var i = 0; i < gems.length; i++) if (!gems[i].got) return i; return gems.length; }
  function collectAt(x, y) {
    if (won) return;
    var i = nextGem();
    if (i >= gems.length) return;
    var g = gems[i];
    if (Math.hypot(x - g.x, y - g.y) < 58) {
      g.got = true; MLP.Sound.sparkle();
      if (nextGem() >= gems.length) traceWin();
    }
  }
  function traceWin() {
    won = true; MLP.sparkleAtEl(canvas); render();
    setTimeout(function () {
      MLP.celebrate({
        emoji: "✏️", title: "描得好棒！",
        text: "你完成了「" + traceShapeName + "」的運筆，再描一個吧！",
        actions: [
          { label: "下一個 ➡️", cls: "purple", onClick: function () { traceIdx++; newTrace(); } },
          { label: "回城堡 🏰", cls: "ghost", onClick: function () { location.href = "index.html"; } },
        ],
      });
    }, 400);
  }

  /* ---------------- 指標 → 座標 ---------------- */
  function pointerXY(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width * SIZE, y: (e.clientY - rect.top) / rect.height * SIZE };
  }
  function stepToward(tr, tc) {
    var guard = 0;
    while ((player.r !== tr || player.c !== tc) && guard++ < 3) {
      var dr = tr - player.r, dc = tc - player.c, i = player.r * N + player.c, dir = null;
      var hor = Math.abs(dc) >= Math.abs(dr);
      var a = hor ? (dc > 0 ? "e" : dc < 0 ? "w" : null) : (dr > 0 ? "s" : dr < 0 ? "n" : null);
      var b = hor ? (dr > 0 ? "s" : dr < 0 ? "n" : null) : (dc > 0 ? "e" : dc < 0 ? "w" : null);
      if (a && !cells[i][a]) dir = a; else if (b && !cells[i][b]) dir = b;
      if (!dir) break;
      tryMove(dir);
      if (won) break;
    }
  }

  /* ---------------- 指標事件（滑鼠/觸控統一） ---------------- */
  function onDown(e) {
    dragging = true;
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    var p = pointerXY(e);
    if (mode === "trace") { traceStroke.push(p); collectAt(p.x, p.y); render(); }
    else { stepToward((p.y / (SIZE / N)) | 0, (p.x / (SIZE / N)) | 0); }
    e.preventDefault();
  }
  function onMove(e) {
    if (!dragging) return;
    var p = pointerXY(e);
    if (mode === "trace") {
      var last = traceStroke[traceStroke.length - 1];
      if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 6) { traceStroke.push(p); collectAt(p.x, p.y); render(); }
    } else {
      stepToward((p.y / (SIZE / N)) | 0, (p.x / (SIZE / N)) | 0);
    }
    e.preventDefault();
  }
  function onUp() { dragging = false; }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  /* ---------------- 鍵盤 / 方向鍵 ---------------- */
  window.addEventListener("keydown", function (e) {
    var map = { ArrowUp: "n", ArrowDown: "s", ArrowLeft: "w", ArrowRight: "e", w: "n", s: "s", a: "w", d: "e", W: "n", S: "s", A: "w", D: "e" };
    var dir = map[e.key];
    if (dir) { e.preventDefault(); tryMove(dir); }
  });
  document.querySelectorAll(".dpad [data-dir]").forEach(function (b) {
    b.addEventListener("click", function () { tryMove(b.getAttribute("data-dir")); });
  });

  /* ---------------- 控制列 ---------------- */
  function applyModeUI() {
    var trace = mode === "trace";
    themeSeg.style.display = trace ? "none" : "";
    dpadEl.style.display = trace ? "none" : "";
    statsEl.style.display = trace ? "none" : "";
  }
  document.getElementById("theme-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    themeKey = b.getAttribute("data-theme"); setSeg("theme-seg", b); level = 1; newRound();
  });
  document.getElementById("diff-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    diffKey = b.getAttribute("data-diff");
    mode = diffKey === "toddler" ? "trace" : "maze";
    setSeg("diff-seg", b); applyModeUI(); level = 1; newRound();
  });
  document.getElementById("btn-new").addEventListener("click", function () {
    if (mode === "trace") { traceIdx++; newTrace(); } else newRound();
  });
  function setSeg(id, btn) {
    document.getElementById(id).querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
    btn.classList.add("on");
  }

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1400);
  }
  function shake() { canvas.classList.remove("shake"); void canvas.offsetWidth; canvas.classList.add("shake"); }

  /* ---------------- 測試接口 ---------------- */
  window.__maze = {
    state: function () {
      return {
        mode: mode, N: N, player: { r: player.r, c: player.c }, won: won, level: level,
        trailLen: trailCells.length,
        items: items.map(function (it) { return { r: it.r, c: it.c, correct: it.correct, obj: it.obj }; }),
        gems: gems.length ? { total: gems.length, collected: gems.filter(function (g) { return g.got; }).length } : null,
        shape: traceShapeName,
      };
    },
    walls: function () { return cells.map(function (x) { return { n: x.n, e: x.e, s: x.s, w: x.w }; }); },
    tracePts: function () { return tracePts.map(function (p) { return { x: p.x, y: p.y }; }); },
    move: function (dir) { tryMove(dir); },
    collectAllGems: function () { for (var i = 0; i < gems.length; i++) collectAt(gems[i].x, gems[i].y); },
  };

  /* ---------------- 啟動 ---------------- */
  MLP.buildSky({ clouds: 4, stars: 10 });
  MLP.mountSoundToggle(document.getElementById("sound-slot"));
  MLP.wireClickSounds();
  setupCanvas();
  applyModeUI();
  newRound();
})();
