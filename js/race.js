/* ============================================================
   皇宮賽車 — 第一人稱酷跑（三線道透視公路）
   左右切換閃避障礙、往上跳躍飛越障礙；撞到「指定目標」得增益效果
   （指定目標顯示在左上角），撞到時念出對應聲音。
   難度：簡單 / 中等 / 困難（速度與障礙密度）。
   ============================================================ */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var canvas = $("stage");
  var ctx = canvas.getContext("2d");
  var scoreEl = $("score");
  var bestEl = $("best");
  var heartsEl = $("hearts");
  var goalEl = $("goal");
  var toastEl = $("toast");

  var W = 480, H = 560;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var horizonY = H * 0.30;
  var roadTopHalf = 26, roadBotHalf = W * 0.46;
  var laneTopSpacing = 17, laneBotSpacing = W * 0.27;

  var DIFFS = {
    easy: { speed: 0.0070, spawnEvery: 0.70, obstacle: 0.5 },
    medium: { speed: 0.0100, spawnEvery: 0.56, obstacle: 0.6 },
    hard: { speed: 0.0140, spawnEvery: 0.44, obstacle: 0.7 },
  };
  var BUFFS = {
    star: { e: "⭐", n: "無敵星星", say: "無敵" },
    bolt: { e: "⚡", n: "加速閃電", say: "加速" },
    gem: { e: "💎", n: "寶石", say: "寶石加分" },
  };
  var BUFF_KEYS = ["star", "bolt", "gem"];
  var OBSTACLES = ["🚧", "🛢️", "🪨", "🌵"];

  /* ---------------- 狀態 ---------------- */
  var diff = MLP.load("mlp-race-diff", "easy");
  if (!DIFFS[diff]) diff = "easy";

  var running = false, score = 0, dist = 0, hearts = 3;
  var lane = 1, visLane = 1;             // 0,1,2
  var jump = { on: false, t: 0 };        // 跳躍弧線
  var invuln = 0, boost = 0;             // 剩餘幀數
  var objs = [], spawnAcc = 0, designated = "star";
  var desigTimer = 0;

  function bestKey() { return "mlp-race-best-" + diff; }
  function renderBest() { bestEl.textContent = "🏅 最佳 " + MLP.loadNum(bestKey(), 0); }
  function renderHearts() { heartsEl.textContent = "❤️".repeat(hearts) + "🤍".repeat(Math.max(0, 3 - hearts)); }
  function renderGoal() {
    var b = BUFFS[designated];
    goalEl.innerHTML = "🎯 目標：撞 <b style='font-size:22px'>" + b.e + "</b> 得「" + b.n + "」";
  }

  function reset() {
    running = true; score = 0; dist = 0; hearts = 3;
    lane = 1; visLane = 1; jump = { on: false, t: 0 };
    invuln = 0; boost = 0; objs = []; spawnAcc = 0;
    designated = BUFF_KEYS[(Math.random() * BUFF_KEYS.length) | 0]; desigTimer = 0;
    removeModal();
    renderHearts(); renderGoal(); scoreEl.textContent = "0";
  }

  /* ---------------- 透視投影 ---------------- */
  function project(laneF, d) {
    var t = d;
    var y = horizonY + (H - horizonY) * t;
    var spacing = laneTopSpacing + (laneBotSpacing - laneTopSpacing) * t;
    var x = W / 2 + (laneF - 1) * spacing;
    var scale = 0.16 + t * 1.05;
    return { x: x, y: y, scale: scale };
  }

  /* ---------------- 生成物件 ---------------- */
  function spawn() {
    var d = DIFFS[diff];
    var ln = (Math.random() * 3) | 0;
    if (Math.random() < d.obstacle) {
      objs.push({ kind: "obs", lane: ln, d: 0, emoji: OBSTACLES[(Math.random() * OBSTACLES.length) | 0], done: false });
    } else {
      // 多數時候生成「指定目標」，偶爾生成其他增益
      var key = Math.random() < 0.7 ? designated : BUFF_KEYS[(Math.random() * BUFF_KEYS.length) | 0];
      objs.push({ kind: "buff", buff: key, lane: ln, d: 0, emoji: BUFFS[key].e, done: false });
    }
  }

  /* ---------------- 繪製 ---------------- */
  function setupCanvas() { canvas.width = W * DPR; canvas.height = H * DPR; }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // 天空
    var sky = ctx.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, "#bfe9ff"); sky.addColorStop(1, "#e7f6ff");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, horizonY);
    // 遠方城堡剪影
    ctx.fillStyle = "#cdbdf0";
    ctx.fillRect(W / 2 - 40, horizonY - 30, 80, 30);
    ctx.beginPath(); ctx.moveTo(W / 2 - 40, horizonY - 30); ctx.lineTo(W / 2, horizonY - 52); ctx.lineTo(W / 2 + 40, horizonY - 30); ctx.fill();
    // 草地
    ctx.fillStyle = "#9bdc84"; ctx.fillRect(0, horizonY, W, H - horizonY);
    // 公路梯形
    ctx.fillStyle = "#6f7480";
    ctx.beginPath();
    ctx.moveTo(W / 2 - roadTopHalf, horizonY); ctx.lineTo(W / 2 + roadTopHalf, horizonY);
    ctx.lineTo(W / 2 + roadBotHalf, H); ctx.lineTo(W / 2 - roadBotHalf, H); ctx.closePath(); ctx.fill();
    // 速度橫紋（往前衝的感覺）
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 2;
    for (var k = 0; k < 8; k++) {
      var dd = ((k / 8) + (dist * 0.6 % 1)) % 1;
      var hw = roadTopHalf + (roadBotHalf - roadTopHalf) * dd;
      var yy = horizonY + (H - horizonY) * dd;
      ctx.beginPath(); ctx.moveTo(W / 2 - hw, yy); ctx.lineTo(W / 2 + hw, yy); ctx.stroke();
    }
    // 車道分隔虛線（兩條）
    ctx.strokeStyle = "rgba(255,236,150,0.9)"; ctx.setLineDash([14, 16]); ctx.lineWidth = 3;
    [-0.5, 0.5].forEach(function (off) {
      ctx.beginPath();
      var top = project(1 + off, 0), bot = project(1 + off, 1);
      ctx.moveTo(top.x, top.y); ctx.lineTo(bot.x, bot.y); ctx.stroke();
    });
    ctx.setLineDash([]);

    // 物件（遠→近排序）
    objs.slice().sort(function (a, b) { return a.d - b.d; }).forEach(function (o) {
      var p = project(o.lane, o.d);
      var size = 16 + p.scale * 52;
      if (o.done && o.kind === "buff") return;
      ctx.font = size + "px 'Segoe UI Emoji','Apple Color Emoji',sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.globalAlpha = Math.min(1, 0.3 + p.scale);
      ctx.fillText(o.emoji, p.x, p.y);
      ctx.globalAlpha = 1;
    });

    // 玩家車（底部）
    var pp = project(visLane, 1);
    var jumpH = jump.on ? Math.sin(jump.t * Math.PI) : 0;
    drawCar(pp.x, H - 64 - jumpH * 90, 1 + jumpH * 0.12, invuln > 0 && (invuln % 10 < 5));
  }

  function drawCar(x, y, s, flash) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    if (flash) ctx.globalAlpha = 0.45;
    // 影子
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.ellipse(0, 40, 42, 12, 0, 0, 7); ctx.fill();
    // 車身
    ctx.fillStyle = "#ff5fa9";
    roundRect(-40, -6, 80, 46, 14); ctx.fill();
    ctx.fillStyle = "#ff8fc7"; roundRect(-34, -30, 68, 34, 14); ctx.fill();
    // 後窗
    ctx.fillStyle = "#bfe9ff"; roundRect(-26, -24, 52, 22, 8); ctx.fill();
    // 尾燈
    ctx.fillStyle = "#ffd24d"; ctx.beginPath(); ctx.arc(-30, 18, 6, 0, 7); ctx.arc(30, 18, 6, 0, 7); ctx.fill();
    // 輪子
    ctx.fillStyle = "#3a2b3e"; roundRect(-46, 26, 16, 18, 6); ctx.fill(); roundRect(30, 26, 16, 18, 6); ctx.fill();
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ---------------- 更新 ---------------- */
  function update() {
    if (!running) return;
    var d = DIFFS[diff];
    var sp = d.speed * (boost > 0 ? 1.7 : 1);
    dist += sp;
    score = (dist * 6) | 0;
    if (invuln > 0) invuln--;
    if (boost > 0) boost--;
    // 視覺車道平滑移動
    visLane += (lane - visLane) * 0.25;
    // 跳躍
    if (jump.on) { jump.t += 0.045; if (jump.t >= 1) { jump.on = false; jump.t = 0; } }
    var airborne = jump.on && Math.sin(jump.t * Math.PI) > 0.35;
    // 指定目標輪換
    desigTimer++;
    if (desigTimer > 60 * 14) { desigTimer = 0; designated = BUFF_KEYS[(Math.random() * BUFF_KEYS.length) | 0]; renderGoal(); }
    // 生成
    spawnAcc += sp;
    if (spawnAcc >= d.spawnEvery) { spawnAcc = 0; spawn(); }
    // 物件前進 + 碰撞
    for (var i = objs.length - 1; i >= 0; i--) {
      var o = objs[i];
      o.d += sp;
      if (!o.done && o.d >= 0.84 && o.d <= 1.02 && o.lane === lane) {
        if (o.kind === "obs") {
          if (airborne || invuln > 0) { o.done = true; MLP.Sound.flip(); }
          else { o.done = true; crash(); }
        } else {
          o.done = true; collect(o);
        }
      }
      if (o.d > 1.1) objs.splice(i, 1);
    }
    if (score > MLP.loadNum(bestKey(), 0)) MLP.save(bestKey(), score);
    scoreEl.textContent = score;
  }

  function crash() {
    hearts--; renderHearts();
    MLP.Sound.wrong();
    invuln = 70;
    toast("撞到了！小心一點 💥");
    if (hearts <= 0) gameOver();
  }
  function collect(o) {
    MLP.sparkleAt(canvasX(project(o.lane, 1).x), canvasY(H - 90));
    if (o.buff === designated) {
      MLP.Sound.correct();
      applyBuff(o.buff);
      var b = BUFFS[o.buff];
      MLP.speak(b.say, "zh-TW");
      score += 12; scoreEl.textContent = score;
      MLP.confetti(40);
      toast("拿到「" + b.n + "」！" + b.e);
    } else {
      MLP.Sound.pop();
      score += 3;
      MLP.speak(BUFFS[o.buff].say, "zh-TW");
    }
    if (score > MLP.loadNum(bestKey(), 0)) { MLP.save(bestKey(), score); renderBest(); }
  }
  function applyBuff(key) {
    if (key === "star") invuln = Math.max(invuln, 260);
    else if (key === "bolt") boost = 200;
    else if (key === "gem") score += 10;
  }

  /* ---------------- 結束畫面 ---------------- */
  function removeModal() { var m = $("race-result"); if (m) m.remove(); }
  function gameOver() {
    running = false;
    var best = MLP.loadNum(bestKey(), 0);
    var mask = document.createElement("div");
    mask.className = "modal-mask show"; mask.id = "race-result";
    mask.innerHTML =
      '<div class="modal"><span class="big-emoji">🏁</span>' +
      "<h2>抵達終點！</h2><p>這趟跑了 <b>" + score + "</b> 分！🏅 最佳 " + best + "</p>" +
      '<div class="modal-actions">' +
      '<button class="btn red" data-a="again">再玩一次 🔄</button>' +
      '<button class="btn ghost" data-a="home">回城堡 🏰</button></div></div>';
    document.body.appendChild(mask);
    MLP.confetti(90);
    mask.querySelectorAll("button[data-a]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        MLP.Sound.click();
        if (btn.getAttribute("data-a") === "again") { renderBest(); reset(); }
        else location.href = "index.html";
      });
    });
  }

  /* ---------------- 迴圈 ---------------- */
  function loop() { update(); draw(); requestAnimationFrame(loop); }

  /* ---------------- 控制 ---------------- */
  function moveLane(dir) { if (!running) return; lane = Math.max(0, Math.min(2, lane + dir)); MLP.Sound.flip(); }
  function doJump() { if (!running || jump.on) return; jump.on = true; jump.t = 0; MLP.Sound.pop(); }

  window.addEventListener("keydown", function (e) {
    if (["ArrowLeft", "a", "A"].indexOf(e.key) >= 0) { e.preventDefault(); moveLane(-1); }
    else if (["ArrowRight", "d", "D"].indexOf(e.key) >= 0) { e.preventDefault(); moveLane(1); }
    else if (["ArrowUp", "w", "W", " "].indexOf(e.key) >= 0) { e.preventDefault(); doJump(); }
  });
  $("btn-left").addEventListener("click", function () { moveLane(-1); });
  $("btn-right").addEventListener("click", function () { moveLane(1); });
  $("btn-jump").addEventListener("click", doJump);

  // 滑動手勢：左右滑＝換道，上滑或點一下＝跳
  var sw = null;
  canvas.addEventListener("pointerdown", function (e) { sw = { x: e.clientX, y: e.clientY }; e.preventDefault(); });
  canvas.addEventListener("pointerup", function (e) {
    if (!sw) return;
    var dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) moveLane(dx > 0 ? 1 : -1);
    else if (dy < -30 || (Math.abs(dx) < 16 && Math.abs(dy) < 16)) doJump();
  });

  function canvasX(cx) { var r = canvas.getBoundingClientRect(); return r.left + cx / W * r.width; }
  function canvasY(cy) { var r = canvas.getBoundingClientRect(); return r.top + cy / H * r.height; }

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1400);
  }

  function setSeg(val) {
    $("diff-seg").querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-diff") === val); });
  }
  $("diff-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    diff = b.getAttribute("data-diff"); MLP.save("mlp-race-diff", diff);
    setSeg(diff); renderBest(); reset();
  });
  $("btn-restart").addEventListener("click", function () { renderBest(); reset(); });

  /* ---------------- 測試接口 ---------------- */
  window.__race = {
    state: function () {
      return { running: running, score: score, hearts: hearts, lane: lane, designated: designated,
        invuln: invuln, boost: boost, nObjs: objs.length, diff: diff };
    },
    left: function () { moveLane(-1); }, right: function () { moveLane(1); }, jump: doJump,
    spawnObstacle: function (ln, d) { objs.push({ kind: "obs", lane: ln == null ? lane : ln, d: d == null ? 0.5 : d, emoji: "🚧", done: false }); },
    spawnTarget: function (ln, key) { objs.push({ kind: "buff", buff: key || designated, lane: ln == null ? lane : ln, d: 0.5, emoji: BUFFS[key || designated].e, done: false }); },
    setDesignated: function (k) { designated = k; renderGoal(); },
  };

  /* ---------------- 啟動 ---------------- */
  MLP.buildSky({ clouds: 4, stars: 6 });
  MLP.mountSoundToggle($("sound-slot"));
  MLP.wireClickSounds();
  setSeg(diff);
  renderBest();
  setupCanvas();
  reset();
  requestAnimationFrame(loop);
})();
