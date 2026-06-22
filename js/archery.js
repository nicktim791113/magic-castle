/* ============================================================
   射箭樂園 — 第一人稱拉弓射靶（顏色／英文／數字／動物）
   題目顯示在上方，瞄準並放開射出箭，命中正確的靶心才得分，
   並念出／播放對應的聲音。難度：簡單 / 中等(會移動) / 困難(更小更難)。
   ============================================================ */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var canvas = $("stage");
  var ctx = canvas.getContext("2d");
  var promptEl = $("prompt");
  var scoreEl = $("score");
  var bestEl = $("best");
  var toastEl = $("toast");

  var W = 480, H = 520;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------------- 題庫資料 ---------------- */
  var COLORS = {
    red: { n: "紅色", hex: "#e8453c" }, blue: { n: "藍色", hex: "#3f7be0" },
    yellow: { n: "黃色", hex: "#ffd21f" }, green: { n: "綠色", hex: "#46b86a" },
    orange: { n: "橘色", hex: "#ff8a34" }, purple: { n: "紫色", hex: "#a05cd6" },
    pink: { n: "粉紅色", hex: "#ff8fc7" }, lightblue: { n: "淺藍色", hex: "#9ad8ff" },
    white: { n: "白色", hex: "#ffffff" },
  };
  var MIX = [
    { a: "red", b: "blue", r: "purple" }, { a: "red", b: "yellow", r: "orange" },
    { a: "blue", b: "yellow", r: "green" }, { a: "red", b: "white", r: "pink" },
    { a: "blue", b: "white", r: "lightblue" },
  ];
  var COLOR_KEYS = Object.keys(COLORS);

  // 英文：物品 → 開頭字母
  var WORDS = [
    { L: "A", emoji: "🍎", w: "Apple" }, { L: "B", emoji: "🍌", w: "Banana" },
    { L: "C", emoji: "🐱", w: "Cat" }, { L: "D", emoji: "🐶", w: "Dog" },
    { L: "E", emoji: "🥚", w: "Egg" }, { L: "F", emoji: "🐟", w: "Fish" },
    { L: "G", emoji: "🍇", w: "Grape" }, { L: "S", emoji: "☀️", w: "Sun" },
    { L: "T", emoji: "🌳", w: "Tree" }, { L: "M", emoji: "🌙", w: "Moon" },
    { L: "U", emoji: "☂️", w: "Umbrella" }, { L: "R", emoji: "🌈", w: "Rainbow" },
  ];
  var ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // 動物 → 愛吃的食物
  var EATS = [
    { a: "🐰", an: "兔子", f: "🥕", fn: "紅蘿蔔" }, { a: "🐵", an: "猴子", f: "🍌", fn: "香蕉" },
    { a: "🐱", an: "貓咪", f: "🐟", fn: "魚", snd: "cat" }, { a: "🐶", an: "小狗", f: "🦴", fn: "骨頭", snd: "dog" },
    { a: "🐼", an: "熊貓", f: "🎋", fn: "竹子" }, { a: "🐻", an: "小熊", f: "🍯", fn: "蜂蜜" },
    { a: "🐭", an: "老鼠", f: "🧀", fn: "起司" }, { a: "🐷", an: "小豬", f: "🌽", fn: "玉米", snd: "pig" },
    { a: "🐴", an: "馬", f: "🌾", fn: "牧草" }, { a: "🐿️", an: "松鼠", f: "🌰", fn: "栗子" },
  ];
  // 食物鏈：誰想吃誰（單一正解）
  var CHAIN = [
    { pred: "🦁", pn: "獅子", prey: "🦓", pyn: "斑馬" }, { pred: "🐱", pn: "貓咪", prey: "🐭", pyn: "老鼠", snd: "cat" },
    { pred: "🦊", pn: "狐狸", prey: "🐰", pyn: "兔子" }, { pred: "🐸", pn: "青蛙", prey: "🐛", pyn: "蟲蟲" },
    { pred: "🦅", pn: "老鷹", prey: "🐍", pyn: "蛇" }, { pred: "🐺", pn: "狼", prey: "🐑", pyn: "綿羊", snd: "sheep" },
    { pred: "🐔", pn: "母雞", prey: "🐛", pyn: "蟲蟲", snd: "rooster" }, { pred: "🦉", pn: "貓頭鷹", prey: "🐭", pyn: "老鼠" },
  ];
  var SND_FILE = {
    cat: "assets/sound/cat.wav", dog: "assets/sound/dog.mp3", cow: "assets/sound/cow.mp3",
    duck: "assets/sound/duck.mp3", rooster: "assets/sound/rooster.mp3", pig: "assets/sound/pig.mp3", sheep: "assets/sound/sheep.mp3",
  };

  /* ---------------- 工具 ---------------- */
  function rnd(n) { return (Math.random() * n) | 0; }
  function pick(arr) { return arr[rnd(arr.length)]; }
  function sample(arr, k) { return MLP.shuffle(arr.slice()).slice(0, k); }
  function uniq(arr) { var s = []; arr.forEach(function (x) { if (s.indexOf(x) < 0) s.push(x); }); return s; }

  /* ---------------- 出題 ---------------- */
  // 回傳 { html, choices:[{key,kind,label,fill,correct,speak,lang,snd}] }
  function genQuestion(cat, diff) {
    var nChoices = diff === "easy" ? 3 : diff === "medium" ? 4 : 5;
    if (cat === "color") return qColor(diff, nChoices);
    if (cat === "letter") return qLetter(diff, nChoices);
    if (cat === "number") return qNumber(diff, nChoices);
    return qAnimal(diff, nChoices);
  }

  function colorChoice(key, correct) {
    var c = COLORS[key];
    return { key: key, kind: "color", fill: c.hex, correct: correct, speak: c.n, lang: "zh-TW" };
  }
  function qColor(diff, n) {
    if (diff === "easy") {
      var keys = sample(COLOR_KEYS.filter(function (k) { return k !== "white"; }), n);
      var ans = pick(keys);
      return {
        html: "射中 <b style='color:" + COLORS[ans].hex + ";-webkit-text-stroke:1px #0003'>" + COLORS[ans].n + "</b> 的靶！🎯",
        choices: keys.map(function (k) { return colorChoice(k, k === ans); }),
      };
    }
    var m = pick(MIX);
    var others = sample(COLOR_KEYS.filter(function (k) { return k !== m.r && k !== "white"; }), n - 1);
    var keys2 = MLP.shuffle([m.r].concat(others));
    return {
      html: "<span style='color:" + COLORS[m.a].hex + "'>●</span> " + COLORS[m.a].n +
        " ＋ <span style='color:" + COLORS[m.b].hex + "'>●</span> " + COLORS[m.b].n + " ＝ 什麼顏色？🎨",
      choices: keys2.map(function (k) { return colorChoice(k, k === m.r); }),
    };
  }

  function qLetter(diff, n) {
    if (diff === "easy") {
      var ls = sample(ALPHA.slice(0, 14), n);
      var ans = pick(ls);
      return {
        html: "射中字母 <b>" + ans + "</b>！🔤",
        choices: ls.map(function (L) { return { key: L, kind: "text", label: L, correct: L === ans, speak: L, lang: "en-US" }; }),
      };
    }
    var word = pick(WORDS);
    var decoys = sample(ALPHA.filter(function (L) { return L !== word.L; }), n - 1);
    var ls2 = MLP.shuffle([word.L].concat(decoys));
    return {
      html: word.emoji + " <b>" + word.w + "</b> 是哪個字母開頭？🔤",
      choices: ls2.map(function (L) { return { key: L, kind: "text", label: L, correct: L === word.L, speak: L, lang: "en-US" }; }),
    };
  }

  function numChoice(v, correct) { return { key: "n" + v, kind: "text", label: String(v), correct: correct, speak: String(v), lang: "zh-TW" }; }
  function qNumber(diff, n) {
    if (diff === "easy") {
      var pool = []; for (var i = 1; i <= 9; i++) pool.push(i);
      var ns = sample(pool, n); var ans = pick(ns);
      return { html: "射中數字 <b>" + ans + "</b>！🔢", choices: ns.map(function (v) { return numChoice(v, v === ans); }) };
    }
    var a, b, ans2, q;
    if (diff === "medium") { a = 1 + rnd(5); b = 1 + rnd(4); ans2 = a + b; q = a + " ＋ " + b + " ＝ ？"; }
    else { a = 5 + rnd(10); b = 1 + rnd(a - 1); ans2 = a - b; q = a + " － " + b + " ＝ ？"; }
    var set = [ans2];
    var guard = 0;
    while (set.length < n && guard++ < 200) { var d = ans2 + (rnd(7) - 3); if (d >= 0 && set.indexOf(d) < 0) set.push(d); }
    return { html: q + " 🔢", choices: MLP.shuffle(set).map(function (v) { return numChoice(v, v === ans2); }) };
  }

  function qAnimal(diff, n) {
    if (diff === "easy") {
      var e = pick(EATS);
      var others = sample(EATS.filter(function (x) { return x.f !== e.f; }), n - 1);
      var arr = MLP.shuffle([e].concat(others));
      return {
        html: e.a + " <b>" + e.an + "</b> 最愛吃什麼？🍽️",
        choices: arr.map(function (x) {
          return { key: x.f, kind: "emoji", label: x.f, correct: x.f === e.f, speak: x.fn, lang: "zh-TW", snd: x.f === e.f ? e.snd : null };
        }),
      };
    }
    var c = pick(CHAIN);
    var preyPool = uniq(CHAIN.map(function (x) { return x.prey; }).filter(function (p) { return p !== c.prey; }));
    var decoys = sample(preyPool, n - 1);
    var arr2 = MLP.shuffle([c.prey].concat(decoys));
    return {
      html: c.pred + " <b>" + c.pn + "</b> 會想吃誰？🍖",
      choices: arr2.map(function (p) {
        return { key: p, kind: "emoji", label: p, correct: p === c.prey, speak: c.pyn, lang: "zh-TW", snd: p === c.prey ? c.snd : null };
      }),
    };
  }

  /* ---------------- 遊戲狀態 ---------------- */
  var cat = MLP.load("mlp-arch-cat", "color");
  if (["color", "letter", "number", "animal"].indexOf(cat) < 0) cat = "color";
  var diff = MLP.load("mlp-arch-diff", "easy");
  if (["easy", "medium", "hard"].indexOf(diff) < 0) diff = "easy";

  var score = 0, streak = 0;
  var targets = [], q = null;
  var aim = { x: W / 2, y: H * 0.5 }, aiming = false;
  var arrow = null; // {x,y,tx,ty,t}
  var busy = false; // 命中後短暫鎖定換題
  var bowX = W / 2, bowY = H - 34;

  function bestKey() { return "mlp-arch-best-" + cat + "-" + diff; }
  function renderBest() { bestEl.textContent = "🏅 最佳 " + MLP.loadNum(bestKey(), 0); }

  function targetR() { return diff === "easy" ? 46 : diff === "medium" ? 40 : 34; }
  function targetSpeed() { return diff === "easy" ? 0 : diff === "medium" ? 0.9 : 1.5; }

  function newQuestion() {
    busy = false; arrow = null; aiming = false;
    q = genQuestion(cat, diff);
    promptEl.innerHTML = q.html;
    var n = q.choices.length;
    var r = targetR();
    var margin = r + 14;
    targets = q.choices.map(function (c, i) {
      var x = margin + (W - 2 * margin) * (n === 1 ? 0.5 : i / (n - 1));
      var y = 96 + rnd(150);
      var sp = targetSpeed();
      return { x: x, y: y, r: r, choice: c, vx: sp ? (Math.random() < 0.5 ? -sp : sp) : 0, hit: false, pop: 0 };
    });
  }

  /* ---------------- 繪製 ---------------- */
  function setupCanvas() { canvas.width = W * DPR; canvas.height = H * DPR; }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // 背景：天空 + 草地
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#bfe9ff"); sky.addColorStop(0.6, "#e3f6ff"); sky.addColorStop(1, "#d6f3dd");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#aee0a0"; ctx.beginPath(); ctx.ellipse(W / 2, H + 40, W * 0.9, 130, 0, 0, 7); ctx.fill();
    // 靶
    targets.forEach(drawTarget);
    // 瞄準線與準心
    if (aiming) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,90,140,0.5)"; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(bowX, bowY); ctx.lineTo(aim.x, aim.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "#ff5a8c"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(aim.x, aim.y, 16, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(aim.x - 22, aim.y); ctx.lineTo(aim.x + 22, aim.y);
      ctx.moveTo(aim.x, aim.y - 22); ctx.lineTo(aim.x, aim.y + 22); ctx.stroke();
      ctx.restore();
    }
    // 飛行中的箭
    if (arrow) drawArrow(arrow.x, arrow.y, Math.atan2(arrow.ty - bowY, arrow.tx - bowX));
    // 弓
    drawBow();
  }

  function drawTarget(t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    var s = 1 + t.pop * 0.4;
    ctx.scale(s, s);
    if (t.hit) ctx.globalAlpha = Math.max(0, 1 - t.pop);
    ctx.beginPath(); ctx.arc(0, 0, t.r, 0, 7); ctx.fillStyle = "#fff"; ctx.fill();
    ctx.lineWidth = t.r * 0.18; ctx.strokeStyle = "#ff5a5a"; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, t.r * 0.64, 0, 7); ctx.lineWidth = t.r * 0.1; ctx.strokeStyle = "#ffd24d"; ctx.stroke();
    var c = t.choice;
    if (c.kind === "color") {
      ctx.beginPath(); ctx.arc(0, 0, t.r * 0.46, 0, 7); ctx.fillStyle = c.fill; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.stroke();
    } else {
      ctx.fillStyle = c.kind === "text" ? "#3a2b5e" : "#000";
      ctx.font = "900 " + (t.r * (c.kind === "emoji" ? 0.92 : 0.82)) + "px 'Segoe UI Emoji','Apple Color Emoji','Microsoft JhengHei',sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(c.label, 0, t.r * 0.04);
    }
    ctx.restore();
  }

  function drawBow() {
    ctx.save();
    ctx.translate(bowX, bowY);
    var pull = aiming ? 10 : 0;
    // 弓身
    ctx.strokeStyle = "#9c6b3f"; ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(0, 18, 40, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
    // 弓弦
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
    var lx = 40 * Math.cos(Math.PI * 1.18), ly = 18 + 40 * Math.sin(Math.PI * 1.18);
    var rx = 40 * Math.cos(Math.PI * 1.82), ry = 18 + 40 * Math.sin(Math.PI * 1.82);
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(0, -8 + pull); ctx.lineTo(rx, ry); ctx.stroke();
    // 待射的箭
    if (!arrow) drawArrow(0, -8 + pull, -Math.PI / 2, true);
    ctx.restore();
  }
  function drawArrow(x, y, ang, local) {
    ctx.save();
    if (!local) ctx.translate(0, 0);
    ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2);
    ctx.strokeStyle = "#7a4a28"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, -20); ctx.stroke();
    ctx.fillStyle = "#e8453c"; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(-6, -16); ctx.lineTo(6, -16); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#ff8fc7"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(-6, 26); ctx.moveTo(0, 20); ctx.lineTo(6, 26); ctx.stroke();
    ctx.restore();
  }

  /* ---------------- 迴圈 ---------------- */
  function loop() {
    var sp = targetSpeed();
    targets.forEach(function (t) {
      if (sp && !t.hit) {
        t.x += t.vx;
        if (t.x < t.r + 8) { t.x = t.r + 8; t.vx *= -1; }
        if (t.x > W - t.r - 8) { t.x = W - t.r - 8; t.vx *= -1; }
      }
      if (t.hit) t.pop = Math.min(1, t.pop + 0.08);
    });
    if (arrow) {
      arrow.t += 0.09;
      arrow.x = bowX + (arrow.tx - bowX) * arrow.t;
      arrow.y = bowY + (arrow.ty - bowY) * arrow.t;
      if (arrow.t >= 1) { var ax = arrow.tx, ay = arrow.ty; arrow = null; resolveShot(ax, ay); }
    }
    draw();
    requestAnimationFrame(loop);
  }

  /* ---------------- 射擊判定 ---------------- */
  function resolveShot(x, y) {
    var hit = null;
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      if (t.hit) continue;
      if ((x - t.x) * (x - t.x) + (y - t.y) * (y - t.y) <= t.r * t.r) { hit = t; break; }
    }
    if (!hit) { MLP.Sound.flip(); return; }
    if (hit.choice.correct) onHit(hit); else onWrong(hit);
  }

  function onHit(t) {
    busy = true; t.hit = true; t.pop = 0;
    MLP.Sound.correct();
    MLP.sparkleAt(canvasX(t.x), canvasY(t.y));
    if (t.choice.snd && SND_FILE[t.choice.snd]) {
      MLP.playClip(SND_FILE[t.choice.snd]);
      setTimeout(function () { MLP.speak(t.choice.speak, t.choice.lang); }, 650);
    } else {
      MLP.speak(t.choice.speak, t.choice.lang);
    }
    score++; streak++;
    scoreEl.textContent = score;
    if (score > MLP.loadNum(bestKey(), 0)) { MLP.save(bestKey(), score); renderBest(); }
    if (streak > 0 && streak % 5 === 0) { MLP.confetti(70); toast("連續命中 " + streak + " 次！好棒！🎉"); }
    setTimeout(newQuestion, 1000);
  }
  function onWrong(t) {
    streak = 0;
    MLP.Sound.wrong();
    toast("不是這個哦～再瞄準看看！");
    t.pop = -0.3; // 縮一下
    setTimeout(function () { t.pop = 0; }, 200);
  }

  /* ---------------- 指標 → 座標 ---------------- */
  function pointerXY(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width * W, y: (e.clientY - rect.top) / rect.height * H };
  }
  // 畫布座標 → 視窗座標（給彩帶星星用）
  function canvasX(cx) { var r = canvas.getBoundingClientRect(); return r.left + cx / W * r.width; }
  function canvasY(cy) { var r = canvas.getBoundingClientRect(); return r.top + cy / H * r.height; }

  function onDown(e) {
    if (busy || arrow) return;
    aiming = true; aim = pointerXY(e);
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    e.preventDefault();
  }
  function onMove(e) { if (aiming) { aim = pointerXY(e); e.preventDefault(); } }
  function onUp(e) {
    if (!aiming) return;
    aiming = false;
    var p = pointerXY(e);
    aim = p;
    arrow = { x: bowX, y: bowY, tx: p.x, ty: p.y, t: 0 };
    MLP.Sound.pop();
    e.preventDefault();
  }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", function () { aiming = false; });

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1600);
  }

  /* ---------------- 控制列 ---------------- */
  function setSeg(id, attr, val) {
    document.getElementById(id).querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.getAttribute(attr) === val); });
  }
  $("cat-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    cat = b.getAttribute("data-cat"); MLP.save("mlp-arch-cat", cat);
    setSeg("cat-seg", "data-cat", cat); score = 0; streak = 0; scoreEl.textContent = "0"; renderBest(); newQuestion();
  });
  $("diff-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    diff = b.getAttribute("data-diff"); MLP.save("mlp-arch-diff", diff);
    setSeg("diff-seg", "data-diff", diff); score = 0; streak = 0; scoreEl.textContent = "0"; renderBest(); newQuestion();
  });
  $("btn-skip").addEventListener("click", function () { if (!busy) newQuestion(); });

  /* ---------------- 測試接口 ---------------- */
  window.__archery = {
    state: function () {
      return { cat: cat, diff: diff, score: score, streak: streak, busy: busy,
        nTargets: targets.length, correctKey: (q && q.choices.filter(function (c) { return c.correct; })[0] || {}).key };
    },
    shoot: function (key) {
      var t = null;
      for (var i = 0; i < targets.length; i++) if (!targets[i].hit && targets[i].choice.key === key) { t = targets[i]; break; }
      if (!t) return false;
      resolveShot(t.x, t.y); return true;
    },
    shootCorrect: function () { var s = this.state(); return this.shoot(s.correctKey); },
  };

  /* ---------------- 啟動 ---------------- */
  MLP.buildSky({ clouds: 4, stars: 8 });
  MLP.mountSoundToggle($("sound-slot"));
  MLP.wireClickSounds();
  setSeg("cat-seg", "data-cat", cat);
  setSeg("diff-seg", "data-diff", diff);
  renderBest();
  setupCanvas();
  newQuestion();
  requestAnimationFrame(loop);
})();
