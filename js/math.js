/* ============================================================
   數數樂園 — 數學認知（數量 ↔ 數字）
   不同主題背景：魚在海洋、花在花園、星星在夜空…
   數一數有幾個，選出正確的阿拉伯數字。
   ============================================================ */
(function () {
  "use strict";

  var THEMES = [
    { name: "海洋", bg: "ocean", objs: ["🐟", "🐠", "🐡"], q: "海裡有幾隻魚" },
    { name: "花園", bg: "garden", objs: ["🌷", "🌸", "🌻"], q: "花園裡有幾朵花" },
    { name: "天空", bg: "sky", objs: ["🦋", "🐦"], q: "天空中有幾隻" },
    { name: "夜空", bg: "night", objs: ["⭐", "🌟"], q: "夜空有幾顆星星" },
    { name: "果園", bg: "orchard", objs: ["🍎", "🍊"], q: "樹上有幾顆果子" },
    { name: "池塘", bg: "pond", objs: ["🦆", "🐢"], q: "池塘裡有幾隻" },
  ];
  var DIFFS = {
    easy: { min: 1, max: 5, choices: 3 },
    medium: { min: 1, max: 10, choices: 4 },
    hard: { min: 1, max: 20, choices: 4 },
  };

  var diff = "easy";
  var theme, objEmoji, count, choices, score = 0, locked = false, counted = 0;

  var $ = function (id) { return document.getElementById(id); };
  var sceneEl = $("scene"), choicesEl = $("choices"), promptEl = $("prompt");
  var counterEl = $("counter"), scoreEl = $("score");
  var toastEl = $("toast");

  function rand(min, max) { return min + ((Math.random() * (max - min + 1)) | 0); }

  function placeN(n) {
    var cols = Math.ceil(Math.sqrt(n * 1.5)), rows = Math.ceil(n / cols), pts = [];
    for (var i = 0; i < n; i++) {
      var r = (i / cols) | 0, c = i % cols, cw = 100 / cols, ch = 100 / rows;
      pts.push({ x: c * cw + cw * (0.28 + Math.random() * 0.44), y: r * ch + ch * (0.28 + Math.random() * 0.44) });
    }
    return MLP.shuffle(pts);
  }

  function makeChoices(n, range, k) {
    var set = [n];
    var guard = 0;
    while (set.length < k && guard++ < 200) {
      var d = rand(range.min, range.max);
      if (set.indexOf(d) < 0) set.push(d);
    }
    return MLP.shuffle(set);
  }

  function newRound() {
    locked = false; counted = 0;
    theme = THEMES[(Math.random() * THEMES.length) | 0];
    objEmoji = theme.objs[(Math.random() * theme.objs.length) | 0];
    var d = DIFFS[diff];
    count = rand(d.min, d.max);
    choices = makeChoices(count, d, d.choices);

    promptEl.innerHTML = theme.q + "呢？數數看，選出正確的數字！🔢";
    counterEl.textContent = "0";

    // 場景背景
    sceneEl.className = "scene " + theme.bg;
    sceneEl.innerHTML = decorFor(theme.bg);
    var pts = placeN(count);
    pts.forEach(function (p) {
      var s = document.createElement("button");
      s.className = "obj";
      s.style.left = p.x + "%";
      s.style.top = p.y + "%";
      s.textContent = objEmoji;
      s.addEventListener("click", function () {
        if (s.classList.contains("counted")) return;
        s.classList.add("counted");
        counted++;
        counterEl.textContent = counted;
        MLP.Sound.pop();
      });
      sceneEl.appendChild(s);
    });

    // 數字選項
    choicesEl.innerHTML = "";
    choices.forEach(function (n) {
      var b = document.createElement("button");
      b.className = "choice";
      b.textContent = n;
      b.addEventListener("click", function () { pick(n, b); });
      choicesEl.appendChild(b);
    });
  }

  function decorFor(bg) {
    if (bg === "ocean") return '<span class="decor" style="left:6%;bottom:4%">🌊</span><span class="decor" style="right:6%;bottom:4%">🌊</span>';
    if (bg === "garden") return '<span class="decor" style="right:6%;top:6%">☀️</span>';
    if (bg === "sky") return '<span class="decor" style="left:8%;top:8%">☁️</span><span class="decor" style="right:10%;bottom:10%">☁️</span>';
    if (bg === "night") return '<span class="decor" style="right:8%;top:8%">🌙</span>';
    if (bg === "orchard") return '<span class="decor" style="right:7%;top:7%">☀️</span>';
    if (bg === "pond") return '<span class="decor" style="left:7%;bottom:6%">🌿</span>';
    return "";
  }

  function pick(n, btn) {
    if (locked) return;
    if (n === count) {
      locked = true;
      btn.classList.add("ok");
      MLP.Sound.correct();
      MLP.sparkleAtEl(btn);
      score++;
      scoreEl.textContent = score;
      if (score % 5 === 0) { MLP.confetti(60); toast("好厲害！已經答對 " + score + " 題！🎉"); }
      setTimeout(newRound, 950);
    } else {
      MLP.Sound.wrong();
      btn.classList.remove("bad");
      void btn.offsetWidth;
      btn.classList.add("bad");
      toast("再數數看～ 你可以點點看每一個 👆");
    }
  }

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1600);
  }

  /* ---------- 控制 ---------- */
  $("diff-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    diff = b.getAttribute("data-diff");
    document.querySelectorAll("#diff-seg button").forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
    newRound();
  });
  $("btn-new").addEventListener("click", newRound);

  /* ---------- 測試接口 ---------- */
  window.__math = {
    state: function () { return { theme: theme.name, obj: objEmoji, count: count, choices: choices.slice(), score: score }; },
    answer: function () { return count; },
    pick: function (n) {
      var btns = choicesEl.querySelectorAll(".choice");
      for (var i = 0; i < btns.length; i++) if (+btns[i].textContent === n) { btns[i].click(); return; }
    },
  };

  /* ---------- 啟動 ---------- */
  MLP.buildSky({ clouds: 3, stars: 8 });
  MLP.mountSoundToggle($("sound-slot"));
  MLP.wireClickSounds();
  newRound();
})();
