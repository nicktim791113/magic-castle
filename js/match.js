/* ============================================================
   關係配對 — 兩種模式
   ① 連連看：動物 ↔ 食物（20 組）
   ② 聲音配對：聽動物叫聲，選出是哪隻動物（5 組）
   物件支援 assets/img 圖片，缺圖自動退回 emoji。
   ============================================================ */
(function () {
  "use strict";

  // 20 組：key, 動物[emoji,名], 食物[emoji,名]
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
    { key: "horse", a: ["🐴", "馬"], f: ["🌾", "牧草"] },
    { key: "pig", a: ["🐷", "小豬"], f: ["🌽", "玉米"] },
    { key: "cow", a: ["🐮", "乳牛"], f: ["🌿", "青草"] },
    { key: "duck", a: ["🦆", "鴨子"], f: ["🍞", "麵包"] },
    { key: "fox", a: ["🦊", "狐狸"], f: ["🍇", "葡萄"] },
    { key: "koala", a: ["🐨", "無尾熊"], f: ["🌱", "嫩葉"] },
    { key: "turtle", a: ["🐢", "烏龜"], f: ["🥬", "青菜"] },
    { key: "squirrel", a: ["🐿️", "松鼠"], f: ["🌰", "栗子"] },
  ];

  // 聲音配對：動物叫聲（CC0 音檔在 assets/sound/）
  var SOUND = [
    { key: "cat", name: "貓咪", emoji: "🐱", file: "assets/sound/cat.wav" },
    { key: "dog", name: "小狗", emoji: "🐶", file: "assets/sound/dog.mp3" },
    { key: "cow", name: "乳牛", emoji: "🐮", file: "assets/sound/cow.mp3" },
    { key: "duck", name: "鴨子", emoji: "🦆", file: "assets/sound/duck.mp3" },
    { key: "rooster", name: "公雞", emoji: "🐓", file: "assets/sound/rooster.mp3" },
    { key: "pig", name: "小豬", emoji: "🐷", file: "assets/sound/pig.mp3" },
    { key: "sheep", name: "綿羊", emoji: "🐑", file: "assets/sound/sheep.mp3" },
  ];

  var DIFFS_MATCH = { easy: 4, medium: 5, hard: 6 };
  var DIFFS_SOUND = { easy: 3, medium: 4, hard: 5 };

  var mode = MLP.load("mlp-match-mode", "match") === "sound" ? "sound" : "match"; // match / sound
  var diff = DIFFS_MATCH[MLP.load("mlp-match-diff", "easy")] ? MLP.load("mlp-match-diff", "easy") : "easy";

  var $ = function (id) { return document.getElementById(id); };
  var area = $("area"), leftCol = $("left"), rightCol = $("right"), lines = $("lines");
  var doneCountEl = $("done-count"), totalCountEl = $("total-count");
  var soundArea = $("sound-area"), soundChoices = $("sound-choices");
  var scoreEl = $("sound-score"), promptEl = $("prompt");

  // 聲音配對最高答對徽章（只在聲音模式顯示）
  var bestEl = document.createElement("span");
  bestEl.className = "badge";
  bestEl.style.display = "none";
  $("sound-counter").insertAdjacentElement("afterend", bestEl);
  function renderSoundBest() {
    bestEl.textContent = "🏅 最佳 " + MLP.loadNum("mlp-match-sound-best", 0) + " 題";
  }

  var LINE_COLORS = ["#ff6fae", "#ffb44d", "#7bd88f", "#69b7ff", "#b794ff", "#ff9a5c"];

  /* ---------- 圖示（圖片或 emoji） ---------- */
  function iconBox(emoji, slug, cls) {
    var box = document.createElement("span");
    box.className = "emj" + (cls ? " " + cls : "");
    box.appendChild(MLP.iconEl("assets/img/" + slug + ".png", emoji));
    return box;
  }

  /* ============================================================
     模式①：連連看
     ============================================================ */
  var selected = null, matchedLinks = [], doneCount = 0, total = 0, lock = false;
  var drag = null; // 拖曳連線狀態
  var DRAG_THRESHOLD = 8;

  function makeCard(p, side) {
    var emoji = side === "left" ? p.a[0] : p.f[0];
    var label = side === "left" ? p.a[1] : p.f[1];
    var slug = (side === "left" ? "a-" : "f-") + p.key;
    var d = document.createElement("div");
    d.className = "mcard";
    d.setAttribute("data-key", p.key);
    d.setAttribute("data-side", side);
    var lbl = document.createElement("span");
    lbl.className = "lbl";
    lbl.textContent = label;
    d.appendChild(iconBox(emoji, slug));
    d.appendChild(lbl);
    d.addEventListener("pointerdown", function (e) { onCardDown(d, p.key, side, e); });
    return d;
  }

  function newMatch() {
    selected = null; drag = null; matchedLinks = []; doneCount = 0; lock = false;
    leftCol.innerHTML = ""; rightCol.innerHTML = ""; lines.innerHTML = "";
    var n = DIFFS_MATCH[diff];
    var chosen = MLP.shuffle(PAIRS.slice()).slice(0, n);
    total = chosen.length;
    doneCountEl.textContent = "0"; totalCountEl.textContent = total;
    promptEl.textContent = "用手指把小動物連到牠愛吃的東西！拖一條線過去 🐾";
    var foods = MLP.shuffle(chosen.slice());
    chosen.forEach(function (p) { leftCol.appendChild(makeCard(p, "left")); });
    foods.forEach(function (p) { rightCol.appendChild(makeCard(p, "right")); });
  }

  /* ---- 幾何與畫線 ---- */
  function sizeLines() {
    var ar = area.getBoundingClientRect();
    lines.setAttribute("width", ar.width); lines.setAttribute("height", ar.height);
    lines.setAttribute("viewBox", "0 0 " + ar.width + " " + ar.height);
  }
  function cardAnchor(el) {
    var ar = area.getBoundingClientRect(), r = el.getBoundingClientRect();
    var x = (el.getAttribute("data-side") === "left" ? r.right : r.left) - ar.left;
    return { x: x, y: r.top + r.height / 2 - ar.top };
  }
  function pointerToArea(e) { var ar = area.getBoundingClientRect(); return { x: e.clientX - ar.left, y: e.clientY - ar.top }; }
  function bezier(a, b, color, dashed) {
    var mx = (a.x + b.x) / 2;
    return '<path d="M' + a.x + " " + a.y + " C " + mx + " " + a.y + ", " + mx + " " + b.y + ", " + b.x + " " + b.y +
      '" stroke="' + color + '" stroke-width="' + (dashed ? 6 : 5) + '" fill="none" stroke-linecap="round"' +
      (dashed ? ' stroke-dasharray="2 12"' : "") + "/>";
  }
  function renderLines(liveStr) {
    sizeLines();
    var html = "";
    matchedLinks.forEach(function (link) {
      var a = cardAnchor(link.leftEl), b = cardAnchor(link.rightEl);
      html += bezier(a, b, link.color, false);
      html += '<circle cx="' + a.x + '" cy="' + a.y + '" r="5" fill="' + link.color + '"/><circle cx="' + b.x + '" cy="' + b.y + '" r="5" fill="' + link.color + '"/>';
    });
    if (liveStr) html += liveStr;
    lines.innerHTML = html;
  }
  function drawLines() { renderLines(); } // resize 時重畫

  /* ---- 配對結果 ---- */
  function doMatch(leftEl, rightEl) {
    leftEl.classList.add("done"); rightEl.classList.add("done");
    leftEl.classList.remove("sel", "over"); rightEl.classList.remove("sel", "over");
    var color = LINE_COLORS[doneCount % LINE_COLORS.length];
    matchedLinks.push({ leftEl: leftEl, rightEl: rightEl, color: color });
    MLP.Sound.correct(); MLP.sparkleAtEl(leftEl); MLP.sparkleAtEl(rightEl);
    doneCount++; doneCountEl.textContent = doneCount;
    renderLines();
    if (doneCount === total) matchWin();
  }
  function doWrong(a, b) {
    MLP.Sound.wrong();
    a.classList.add("shake"); b.classList.add("shake");
    setTimeout(function () { a.classList.remove("shake"); b.classList.remove("shake"); }, 550);
  }
  // 把兩張卡嘗試配對（任意先後／任意側）
  function tryPair(elA, elB) {
    if (!elA || !elB || elA === elB) return false;
    if (elA.classList.contains("done") || elB.classList.contains("done")) return false;
    if (elA.getAttribute("data-side") === elB.getAttribute("data-side")) return false;
    var leftEl = elA.getAttribute("data-side") === "left" ? elA : elB;
    var rightEl = leftEl === elA ? elB : elA;
    if (leftEl.getAttribute("data-key") === rightEl.getAttribute("data-key")) { doMatch(leftEl, rightEl); return true; }
    doWrong(elA, elB); return false;
  }

  /* ---- 指標：拖曳連線（主），無移動則退回點選兩下 ---- */
  function cardUnder(cx, cy) { var el = document.elementFromPoint(cx, cy); return el ? el.closest(".mcard") : null; }
  function clearOver() { area.querySelectorAll(".mcard.over").forEach(function (x) { x.classList.remove("over"); }); }

  function onCardDown(el, key, side, e) {
    if (el.classList.contains("done")) return;
    deselect();
    drag = { key: key, side: side, fromEl: el, anchor: cardAnchor(el), moved: false, x0: e.clientX, y0: e.clientY };
    el.classList.add("sel");
    try { el.setPointerCapture(e.pointerId); } catch (x) {}
    e.preventDefault();
  }
  function onDocMove(e) {
    if (!drag) return;
    if (!drag.moved && Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) > DRAG_THRESHOLD) {
      drag.moved = true; MLP.Sound.flip();
    }
    if (!drag.moved) return;
    clearOver();
    var t = cardUnder(e.clientX, e.clientY);
    if (t && t !== drag.fromEl && t.getAttribute("data-side") !== drag.side && !t.classList.contains("done")) t.classList.add("over");
    renderLines(bezier(drag.anchor, pointerToArea(e), "#ff9a3c", true));
  }
  function onDocUp(e) {
    if (!drag) return;
    var d = drag; drag = null;
    clearOver();
    if (d.moved) {
      d.fromEl.classList.remove("sel");
      var t = cardUnder(e.clientX, e.clientY);
      renderLines();
      tryPair(d.fromEl, t);
    } else {
      onTap(d.fromEl, d.key, d.side);
    }
  }

  function onTap(el, key, side) {
    if (el.classList.contains("done")) return;
    if (!selected) { select(el, key, side); MLP.Sound.flip(); return; }
    if (selected.el === el) { deselect(); return; }
    if (selected.side === side) { deselect(); select(el, key, side); MLP.Sound.flip(); return; }
    var first = selected.el; deselect();
    tryPair(first, el);
  }
  function select(el, key, side) { selected = { el: el, key: key, side: side }; el.classList.add("sel"); }
  function deselect() { if (selected) selected.el.classList.remove("sel"); selected = null; }

  document.addEventListener("pointermove", onDocMove);
  document.addEventListener("pointerup", onDocUp);
  document.addEventListener("pointercancel", function () {
    if (!drag) return;
    drag.fromEl.classList.remove("sel"); drag = null; clearOver(); renderLines();
  });

  function matchWin() {
    setTimeout(function () {
      MLP.celebrate({
        emoji: "🌟", title: "全部配對成功！", text: "你好厲害，每隻小動物都吃到最愛了！",
        actions: [
          { label: "再玩一次 🔄", cls: "green", onClick: newMatch },
          { label: "回城堡 🏰", cls: "ghost", onClick: function () { location.href = "index.html"; } },
        ],
      });
    }, 450);
  }

  /* ============================================================
     模式②：聲音配對
     ============================================================ */
  var sTarget = null, sScore = 0, sLock = false;

  function newSound() {
    sLock = false;
    var n = DIFFS_SOUND[diff];
    var pool = MLP.shuffle(SOUND.slice());
    sTarget = pool[0];
    var choices = pool.slice(0, n);
    MLP.shuffle(choices);
    promptEl.textContent = "點 🔊 聽聲音，再選出是哪隻動物！🔊";
    soundChoices.innerHTML = "";
    choices.forEach(function (an) {
      var b = document.createElement("button");
      b.className = "schoice";
      b.appendChild(iconBox(an.emoji, "a-" + an.key, "big"));
      var nm = document.createElement("span");
      nm.className = "snm"; nm.textContent = an.name;
      b.appendChild(nm);
      b.addEventListener("click", function () { onSoundPick(an, b); });
      soundChoices.appendChild(b);
    });
    setTimeout(playTarget, 250);
  }
  function playTarget() { if (sTarget) MLP.playClip(sTarget.file); }

  function onSoundPick(an, btn) {
    if (sLock) return;
    if (an.key === sTarget.key) {
      sLock = true; btn.classList.add("ok"); MLP.Sound.correct(); MLP.sparkleAtEl(btn);
      sScore++; scoreEl.textContent = sScore;
      if (sScore > MLP.loadNum("mlp-match-sound-best", 0)) { MLP.save("mlp-match-sound-best", sScore); renderSoundBest(); }
      if (sScore % 5 === 0) MLP.confetti(60);
      setTimeout(newSound, 950);
    } else {
      MLP.Sound.wrong(); btn.classList.remove("bad"); void btn.offsetWidth; btn.classList.add("bad");
      setTimeout(playTarget, 300);
    }
  }

  /* ---------- 模式切換 ---------- */
  function applyModeUI() {
    var sound = mode === "sound";
    area.style.display = sound ? "none" : "";
    $("match-counter").style.display = sound ? "none" : "";
    soundArea.style.display = sound ? "" : "none";
    $("sound-counter").style.display = sound ? "" : "none";
    bestEl.style.display = sound ? "" : "none";
    if (sound) { renderSoundBest(); newSound(); } else newMatch();
  }

  $("mode-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    mode = b.getAttribute("data-mode"); setSeg("mode-seg", b);
    MLP.save("mlp-match-mode", mode); applyModeUI();
  });
  $("diff-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    diff = b.getAttribute("data-diff"); setSeg("diff-seg", b);
    MLP.save("mlp-match-diff", diff);
    if (mode === "sound") newSound(); else newMatch();
  });
  $("btn-restart").addEventListener("click", function () {
    if (mode === "sound") newSound(); else newMatch();
  });
  $("btn-play-sound").addEventListener("click", playTarget);
  function setSeg(id, btn) {
    $(id).querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
    btn.classList.add("on");
  }
  window.addEventListener("resize", function () { if (mode === "match") drawLines(); });

  /* ---------- 測試接口 ---------- */
  window.__match = {
    state: function () {
      return { mode: mode, total: total, doneCount: doneCount, sScore: sScore,
        sTarget: sTarget ? sTarget.key : null, soundCount: SOUND.length, pairCount: PAIRS.length };
    },
    pickSound: function (key) {
      var btns = soundChoices.querySelectorAll(".schoice");
      var choices = soundChoices.__choices;
      for (var i = 0; i < btns.length; i++) {
        var nm = btns[i].querySelector(".snm").textContent;
        var an = SOUND.filter(function (s) { return s.name === nm; })[0];
        if (an && an.key === key) { btns[i].click(); return true; }
      }
      return false;
    },
    // 測試用：直接把某 key 的左右卡連起來（驗證連線邏輯）
    connect: function (key) {
      var l = leftCol.querySelector('.mcard[data-key="' + key + '"]');
      var r = rightCol.querySelector('.mcard[data-key="' + key + '"]');
      return tryPair(l, r);
    },
    linkCount: function () { return matchedLinks.length; },
  };

  /* ---------- 啟動 ---------- */
  MLP.buildSky({ clouds: 5, stars: 10 });
  MLP.mountSoundToggle($("sound-slot"));
  MLP.wireClickSounds();
  MLP.selectSeg($("mode-seg"), "data-mode", mode);
  MLP.selectSeg($("diff-seg"), "data-diff", diff);
  applyModeUI();
})();
