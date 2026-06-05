/* ============================================================
   魔法小皇宮 — 共用工具：音效、彩帶、星星、慶祝彈窗、背景
   不需要任何音檔，全部用 Web Audio 即時合成。
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 偏好儲存（file:// 下 localStorage 可能不可用） ---------------- */
  function lsGet(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }
  function lsSet(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  }

  /* ---------------- 音效 ---------------- */
  var actx = null;
  var muted = lsGet("mlp-muted") === "1";

  function ensureCtx() {
    if (!actx) {
      try {
        actx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        actx = null;
      }
    }
    if (actx && actx.state === "suspended") actx.resume();
    return actx;
  }

  // 播放一個音符
  function tone(freq, start, dur, type, vol) {
    var ctx = ensureCtx();
    if (!ctx || muted) return;
    var t0 = ctx.currentTime + start;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol == null ? 0.18 : vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function melody(notes, type, vol) {
    for (var i = 0; i < notes.length; i++) {
      tone(notes[i][0], notes[i][1], notes[i][2], type, vol);
    }
  }

  var Sound = {
    click: function () {
      tone(660, 0, 0.12, "triangle", 0.16);
    },
    pop: function () {
      tone(880, 0, 0.09, "sine", 0.18);
      tone(1320, 0.04, 0.09, "sine", 0.12);
    },
    correct: function () {
      melody(
        [
          [659, 0, 0.14],
          [880, 0.1, 0.18],
        ],
        "triangle",
        0.18
      );
    },
    wrong: function () {
      tone(220, 0, 0.18, "sawtooth", 0.12);
      tone(160, 0.08, 0.22, "sawtooth", 0.1);
    },
    flip: function () {
      tone(520, 0, 0.07, "square", 0.08);
    },
    sparkle: function () {
      melody(
        [
          [880, 0, 0.08],
          [1175, 0.06, 0.08],
          [1568, 0.12, 0.1],
        ],
        "sine",
        0.12
      );
    },
    win: function () {
      melody(
        [
          [523, 0, 0.16],
          [659, 0.14, 0.16],
          [784, 0.28, 0.16],
          [1047, 0.42, 0.34],
        ],
        "triangle",
        0.2
      );
      melody(
        [
          [392, 0.42, 0.34],
          [523, 0.42, 0.34],
        ],
        "sine",
        0.12
      );
    },
  };

  function setMuted(m) {
    muted = m;
    lsSet("mlp-muted", m ? "1" : "0");
  }
  function isMuted() {
    return muted;
  }

  /* ---------------- 彩帶與星星 ---------------- */
  function fxLayer() {
    var el = document.querySelector(".fx-layer");
    if (!el) {
      el = document.createElement("div");
      el.className = "fx-layer";
      document.body.appendChild(el);
    }
    return el;
  }

  var CONFETTI_COLORS = [
    "#ff6fae",
    "#ffd24d",
    "#7bd88f",
    "#69b7ff",
    "#b794ff",
    "#ff9a5c",
  ];

  function confetti(count) {
    var layer = fxLayer();
    count = count || 80;
    for (var i = 0; i < count; i++) {
      var c = document.createElement("div");
      c.className = "confetti";
      var x = Math.random() * 100;
      var delay = Math.random() * 0.5;
      var dur = 1.6 + Math.random() * 1.6;
      var size = 7 + Math.random() * 10;
      c.style.left = x + "vw";
      c.style.top = "-20px";
      c.style.width = size + "px";
      c.style.height = size * (0.4 + Math.random()) + "px";
      c.style.background =
        CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0];
      c.style.borderRadius = Math.random() < 0.5 ? "50%" : "2px";
      c.style.animation =
        "confetti-fall " + dur + "s linear " + delay + "s forwards";
      layer.appendChild(c);
      (function (node) {
        setTimeout(function () {
          node.remove();
        }, (dur + delay) * 1000 + 200);
      })(c);
    }
  }

  // 在某個畫面座標冒出星星
  function sparkleAt(x, y, emojis) {
    var layer = fxLayer();
    emojis = emojis || ["✨", "⭐", "💖", "🌟"];
    for (var i = 0; i < 6; i++) {
      var s = document.createElement("div");
      s.className = "spark";
      s.textContent = emojis[(Math.random() * emojis.length) | 0];
      var dx = (Math.random() - 0.5) * 90;
      var dy = (Math.random() - 0.5) * 90;
      s.style.left = x + dx + "px";
      s.style.top = y + dy + "px";
      s.style.fontSize = 18 + Math.random() * 18 + "px";
      layer.appendChild(s);
      (function (node) {
        setTimeout(function () {
          node.remove();
        }, 800);
      })(s);
    }
  }

  function sparkleAtEl(el, emojis) {
    var r = el.getBoundingClientRect();
    sparkleAt(r.left + r.width / 2, r.top + r.height / 2, emojis);
  }

  /* ---------------- 背景天空裝飾 ---------------- */
  function buildSky(opts) {
    opts = opts || {};
    var sky = document.createElement("div");
    sky.className = "sky-decor";
    // 雲
    var clouds = opts.clouds == null ? 5 : opts.clouds;
    for (var i = 0; i < clouds; i++) {
      var cl = document.createElement("div");
      cl.className = "cloud";
      var w = 70 + Math.random() * 90;
      cl.style.width = w + "px";
      cl.style.height = w * 0.6 + "px";
      cl.style.top = 5 + Math.random() * 60 + "%";
      cl.style.animationDuration = 28 + Math.random() * 34 + "s";
      cl.style.animationDelay = -Math.random() * 30 + "s";
      sky.appendChild(cl);
    }
    // 星星
    var stars = opts.stars == null ? 14 : opts.stars;
    for (var j = 0; j < stars; j++) {
      var st = document.createElement("div");
      st.className = "twinkle";
      st.textContent = Math.random() < 0.5 ? "✦" : "✧";
      st.style.left = Math.random() * 100 + "%";
      st.style.top = Math.random() * 70 + "%";
      st.style.fontSize = 10 + Math.random() * 16 + "px";
      st.style.animationDelay = -Math.random() * 3 + "s";
      sky.appendChild(st);
    }
    document.body.insertBefore(sky, document.body.firstChild);
  }

  /* ---------------- 音效開關按鈕 ---------------- */
  function mountSoundToggle(container) {
    var b = document.createElement("button");
    b.className = "sound-toggle";
    b.type = "button";
    function render() {
      b.textContent = muted ? "🔇" : "🔊";
      b.setAttribute("aria-label", muted ? "開啟音效" : "關閉音效");
    }
    render();
    b.addEventListener("click", function () {
      setMuted(!muted);
      render();
      if (!muted) Sound.pop();
    });
    container.appendChild(b);
    return b;
  }

  /* ---------------- 慶祝彈窗 ---------------- */
  function celebrate(opts) {
    opts = opts || {};
    Sound.win();
    confetti(120);
    var mask = document.createElement("div");
    mask.className = "modal-mask show";
    var actions = (opts.actions || [])
      .map(function (a, i) {
        return (
          '<button class="btn ' +
          (a.cls || "") +
          '" data-idx="' +
          i +
          '">' +
          a.label +
          "</button>"
        );
      })
      .join("");
    mask.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
      '<span class="big-emoji">' +
      (opts.emoji || "🎉") +
      "</span>" +
      "<h2>" +
      (opts.title || "太棒了！") +
      "</h2>" +
      "<p>" +
      (opts.text || "") +
      "</p>" +
      '<div class="modal-actions">' +
      actions +
      "</div>" +
      "</div>";
    document.body.appendChild(mask);
    mask.querySelectorAll("button[data-idx]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = +btn.getAttribute("data-idx");
        var a = opts.actions[idx];
        Sound.click();
        if (a && a.onClick) a.onClick();
        if (!a || a.close !== false) mask.remove();
      });
    });
    // 持續灑彩帶幾秒
    var bursts = 3;
    var iv = setInterval(function () {
      confetti(40);
      if (--bursts <= 0) clearInterval(iv);
    }, 700);
    return mask;
  }

  /* ---------------- 全域點擊音效（給按鈕/卡片用） ---------------- */
  function wireClickSounds() {
    document.addEventListener(
      "pointerdown",
      function (e) {
        var t = e.target.closest(".btn, .sound-toggle, [data-click-sound]");
        if (t && !t.hasAttribute("data-no-sound")) {
          if (!t.classList.contains("sound-toggle")) Sound.click();
        }
        ensureCtx(); // 首次互動解鎖音訊
      },
      true
    );
  }

  /* ---------------- 對外 API ---------------- */
  window.MLP = {
    Sound: Sound,
    setMuted: setMuted,
    isMuted: isMuted,
    confetti: confetti,
    sparkleAt: sparkleAt,
    sparkleAtEl: sparkleAtEl,
    buildSky: buildSky,
    mountSoundToggle: mountSoundToggle,
    celebrate: celebrate,
    wireClickSounds: wireClickSounds,
    // 圖片元素：載入 assets 圖片，失敗就退回 emoji（漸進式美術升級）
    iconEl: function (src, emoji, cls) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.draggable = false;
      img.className = "mlp-icon" + (cls ? " " + cls : "");
      img.addEventListener("error", function () {
        var sp = document.createElement("span");
        sp.className = "mlp-emoji" + (cls ? " " + cls : "");
        sp.textContent = emoji;
        if (img.parentNode) img.parentNode.replaceChild(sp, img);
      });
      return img;
    },
    // 覆蓋式背景圖：載入成功就蓋住底圖，失敗就自我移除（露出 SVG fallback）
    coverImg: function (src) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.draggable = false;
      img.className = "mlp-cover";
      img.addEventListener("error", function () {
        if (img.parentNode) img.parentNode.removeChild(img);
      });
      return img;
    },
    // 播放音效片段（mp3/wav），尊重靜音設定
    playClip: function (src, vol) {
      if (muted) return null;
      try {
        var a = new Audio(src);
        a.volume = vol == null ? 0.95 : vol;
        a.play().catch(function () {});
        return a;
      } catch (e) { return null; }
    },
    shuffle: function (arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = (Math.random() * (i + 1)) | 0;
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
      return arr;
    },
  };

  /* ---------------- 註冊 Service Worker（PWA 離線／可安裝） ----------------
     在 file:// 直接開啟時 SW 無法註冊（非安全環境），catch 掉即可，
     遊戲本身仍可正常離線遊玩。在 https（GitHub Pages）下才會啟用。 */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
  }

  /* ---------------- 鎖定縮放（避免小朋友誤觸放大畫面） ----------------
     雙擊放大與雙指縮放主要交給 CSS 的 touch-action: pan-x pan-y 處理；
     這裡再加上 iOS 手勢、雙指 touchmove 與桌機 Ctrl 縮放的攔截做雙保險。
     刻意不攔「雙擊」，以免擋到數字鍵連按同一鍵（例如輸入 11）。 */
  (function lockZoom() {
    var vp = document.querySelector('meta[name="viewport"]');
    if (vp)
      vp.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover"
      );
    ["gesturestart", "gesturechange", "gestureend"].forEach(function (ev) {
      document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
    });
    document.addEventListener(
      "touchmove",
      function (e) { if (e.touches && e.touches.length > 1) e.preventDefault(); },
      { passive: false }
    );
    document.addEventListener(
      "wheel",
      function (e) { if (e.ctrlKey) e.preventDefault(); },
      { passive: false }
    );
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].indexOf(e.key) >= 0) e.preventDefault();
    });
  })();
})();
