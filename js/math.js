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
    sceneEl.innerHTML = sceneBg(theme.bg);
    var pts = placeN(count);
    pts.forEach(function (p) {
      var s = document.createElement("button");
      s.className = "obj";
      s.style.left = p.x + "%";
      s.style.top = p.y + "%";
      s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
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

  function sceneBg(bg) {
    var s = "";
    if (bg === "ocean") {
      s =
        '<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe0ff"/><stop offset="1" stop-color="#1f6f9e"/></linearGradient></defs>' +
        '<rect width="400" height="280" fill="url(#bgg)"/>' +
        '<g fill="#ffffff" opacity="0.12"><polygon points="60,0 120,0 95,280 45,280"/><polygon points="210,0 255,0 235,280 185,280"/><polygon points="330,0 372,0 350,280 320,280"/></g>' +
        '<path d="M0,250 Q100,234 200,250 T400,248 L400,280 L0,280 Z" fill="#f1dca6"/>' +
        '<g fill="none" stroke="#3fae6a" stroke-width="10" stroke-linecap="round" opacity="0.85"><path d="M46,280 q-16,-34 4,-62 q-18,30 0,62"/><path d="M356,280 q16,-32 -4,-58 q18,28 0,58"/></g>' +
        '<g fill="#ffffff" opacity="0.5"><circle cx="80" cy="64" r="6"/><circle cx="92" cy="42" r="4"/><circle cx="316" cy="84" r="7"/><circle cx="328" cy="58" r="4"/></g>';
    } else if (bg === "garden") {
      s =
        '<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#e9f7ff"/></linearGradient></defs>' +
        '<rect width="400" height="280" fill="url(#bgg)"/>' +
        '<circle cx="344" cy="44" r="30" fill="#ffe27a"/><circle cx="344" cy="44" r="38" fill="#ffe27a" opacity="0.25"/>' +
        '<g fill="#ffffff" opacity="0.92"><ellipse cx="84" cy="50" rx="34" ry="16"/><ellipse cx="114" cy="44" rx="24" ry="13"/></g>' +
        '<path d="M0,176 Q120,138 240,176 T400,168 L400,280 L0,280 Z" fill="#94db78"/>' +
        '<path d="M0,206 Q160,178 320,206 T400,202 L400,280 L0,280 Z" fill="#6dc857"/>';
    } else if (bg === "sky") {
      s =
        '<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#eaf8ff"/></linearGradient></defs>' +
        '<rect width="400" height="280" fill="url(#bgg)"/>' +
        '<circle cx="56" cy="50" r="26" fill="#ffe27a"/>' +
        '<g fill="#ffffff" opacity="0.95"><ellipse cx="150" cy="66" rx="42" ry="18"/><ellipse cx="190" cy="58" rx="28" ry="15"/><ellipse cx="300" cy="120" rx="46" ry="20"/><ellipse cx="342" cy="112" rx="30" ry="15"/></g>';
    } else if (bg === "night") {
      s =
        '<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#23234e"/><stop offset="1" stop-color="#43386f"/></linearGradient></defs>' +
        '<rect width="400" height="280" fill="url(#bgg)"/>' +
        '<circle cx="344" cy="48" r="26" fill="#fff3c0"/><circle cx="332" cy="42" r="22" fill="#23234e"/>' +
        '<g fill="#ffffff" opacity="0.22"><ellipse cx="90" cy="58" rx="36" ry="13"/><ellipse cx="120" cy="52" rx="22" ry="11"/></g>';
    } else if (bg === "orchard") {
      s =
        '<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#e9f7ff"/></linearGradient></defs>' +
        '<rect width="400" height="280" fill="url(#bgg)"/>' +
        '<circle cx="352" cy="44" r="24" fill="#ffe27a"/>' +
        '<path d="M0,176 Q120,140 240,176 T400,168 L400,280 L0,280 Z" fill="#94db78"/>' +
        '<path d="M0,208 Q160,182 320,208 T400,204 L400,280 L0,280 Z" fill="#6dc857"/>' +
        '<rect x="40" y="150" width="16" height="86" rx="6" fill="#9c6b3f"/><ellipse cx="48" cy="138" rx="48" ry="40" fill="#5fb858"/><ellipse cx="24" cy="160" rx="30" ry="26" fill="#6dc857"/>';
    } else if (bg === "pond") {
      s =
        '<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfeede"/><stop offset="1" stop-color="#3fa0bf"/></linearGradient></defs>' +
        '<rect width="400" height="280" fill="url(#bgg)"/>' +
        '<g fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3"><ellipse cx="200" cy="150" rx="60" ry="20"/><ellipse cx="200" cy="150" rx="92" ry="30"/></g>' +
        '<g fill="#5fbf7a" opacity="0.9"><ellipse cx="70" cy="222" rx="36" ry="13"/><ellipse cx="326" cy="240" rx="40" ry="14"/></g>' +
        '<g fill="none" stroke="#3fae6a" stroke-width="7" stroke-linecap="round"><path d="M356,280 q8,-42 -2,-66"/><path d="M374,280 q-4,-36 6,-56"/></g>';
    }
    return '<svg class="scene-bg" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
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
