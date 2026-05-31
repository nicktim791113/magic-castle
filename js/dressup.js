/* ============================================================
   公主換裝 — 衣櫥資料與邏輯
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 場景 ---------------- */
  var SCENES = [
    {
      name: "夢幻城堡",
      emoji: "🏰",
      svg:
        '<rect width="360" height="520" fill="#bfe3ff"/>' +
        '<circle cx="300" cy="78" r="38" fill="#fff3b0"/>' +
        '<ellipse cx="80" cy="92" rx="42" ry="22" fill="#ffffff" opacity=".9"/>' +
        '<ellipse cx="150" cy="66" rx="30" ry="16" fill="#ffffff" opacity=".8"/>' +
        '<rect y="470" width="360" height="50" fill="#bfe6a8"/>' +
        '<g fill="#d9c7f0" opacity=".85">' +
        '<rect x="34" y="380" width="40" height="90"/><polygon points="34,380 54,348 74,380"/>' +
        '<rect x="286" y="380" width="40" height="90"/><polygon points="286,380 306,348 326,380"/>' +
        '<rect x="150" y="356" width="60" height="114"/><polygon points="150,356 180,320 210,356"/>' +
        "</g>",
    },
    {
      name: "花園",
      emoji: "🌷",
      svg:
        '<rect width="360" height="520" fill="#d6f1ff"/>' +
        '<circle cx="58" cy="70" r="34" fill="#fff0a8"/>' +
        '<ellipse cx="250" cy="80" rx="40" ry="20" fill="#fff" opacity=".85"/>' +
        '<rect y="452" width="360" height="68" fill="#a8e89a"/>' +
        '<text x="20" y="500" font-size="28">🌷</text>' +
        '<text x="70" y="508" font-size="24">🌼</text>' +
        '<text x="280" y="502" font-size="28">🌸</text>' +
        '<text x="320" y="510" font-size="22">🌷</text>',
    },
    {
      name: "海邊",
      emoji: "🏖️",
      svg:
        '<rect width="360" height="520" fill="#cdeeff"/>' +
        '<circle cx="296" cy="72" r="34" fill="#ffe08a"/>' +
        '<rect y="430" width="360" height="90" fill="#7fd0ff"/>' +
        '<rect y="478" width="360" height="42" fill="#ffe6b0"/>' +
        '<text x="24" y="510" font-size="24">🐚</text>' +
        '<text x="300" y="508" font-size="24">⭐</text>',
    },
    {
      name: "星空",
      emoji: "🌙",
      svg:
        '<rect width="360" height="520" fill="#3a3470"/>' +
        '<rect y="0" width="360" height="280" fill="#4a3f86" opacity=".6"/>' +
        '<circle cx="296" cy="72" r="30" fill="#fff7d6"/>' +
        '<circle cx="284" cy="66" r="26" fill="#3a3470"/>' +
        '<g fill="#fff">' +
        '<circle cx="40" cy="60" r="2.5"/><circle cx="110" cy="40" r="2"/>' +
        '<circle cx="170" cy="80" r="2.5"/><circle cx="60" cy="140" r="2"/>' +
        '<circle cx="220" cy="50" r="2"/><circle cx="320" cy="150" r="2.5"/>' +
        "</g>" +
        '<text x="120" y="60" font-size="16">✨</text>' +
        '<rect y="470" width="360" height="50" fill="#5a4f8a"/>',
    },
  ];

  /* ---------------- 髮型 ---------------- */
  var HAIRS = [
    {
      name: "長直髮",
      swatch: "#7a4a28",
      back:
        '<ellipse cx="180" cy="118" rx="86" ry="88" fill="#7a4a28"/>' +
        '<path d="M96 120 Q84 250 104 330 Q120 342 130 326 Q116 230 126 130 Z" fill="#7a4a28"/>' +
        '<path d="M264 120 Q276 250 256 330 Q240 342 230 326 Q244 230 234 130 Z" fill="#7a4a28"/>',
      front:
        '<path d="M108 116 Q102 50 180 48 Q258 50 252 116 Q244 92 224 98 Q214 74 196 96 Q188 70 180 94 Q172 70 164 96 Q146 74 136 98 Q116 92 108 116 Z" fill="#7a4a28"/>',
    },
    {
      name: "雙馬尾",
      swatch: "#2b2b3a",
      back:
        '<ellipse cx="180" cy="112" rx="82" ry="80" fill="#2b2b3a"/>' +
        '<ellipse cx="86" cy="214" rx="30" ry="58" fill="#2b2b3a"/>' +
        '<ellipse cx="274" cy="214" rx="30" ry="58" fill="#2b2b3a"/>' +
        '<circle cx="104" cy="150" r="9" fill="#ff6fae"/>' +
        '<circle cx="256" cy="150" r="9" fill="#ff6fae"/>',
      front:
        '<path d="M108 116 Q102 50 180 48 Q258 50 252 116 Q244 92 224 98 Q214 74 196 96 Q188 70 180 94 Q172 70 164 96 Q146 74 136 98 Q116 92 108 116 Z" fill="#2b2b3a"/>',
    },
    {
      name: "金色捲髮",
      swatch: "#e8b84a",
      back:
        '<ellipse cx="180" cy="118" rx="88" ry="86" fill="#e8b84a"/>' +
        '<path d="M96 150 Q86 224 96 276 Q112 254 122 276 Q136 254 146 278 L152 150 Z" fill="#e8b84a"/>' +
        '<path d="M264 150 Q274 224 264 276 Q248 254 238 276 Q224 254 214 278 L208 150 Z" fill="#e8b84a"/>',
      front:
        '<path d="M104 116 Q100 52 180 48 Q260 52 256 112 Q230 84 188 92 Q150 86 132 104 Q118 96 104 116 Z" fill="#e8b84a"/>',
    },
    {
      name: "短髮",
      swatch: "#b5532e",
      back:
        '<ellipse cx="180" cy="120" rx="84" ry="84" fill="#b5532e"/>' +
        '<path d="M98 132 Q96 184 112 204 L122 150 Z" fill="#b5532e"/>' +
        '<path d="M262 132 Q264 184 248 204 L238 150 Z" fill="#b5532e"/>',
      front:
        '<path d="M104 118 Q100 50 180 48 Q260 50 256 118 Q244 96 220 100 Q206 78 190 96 Q180 76 170 96 Q154 78 140 100 Q116 96 104 118 Z" fill="#b5532e"/>',
    },
  ];

  /* ---------------- 禮服 ---------------- */
  var DRESSES = [
    {
      name: "粉紅蓬裙",
      swatch: "#ff8fc7",
      svg:
        '<path d="M150 292 L210 292 L246 372 Q180 392 114 372 Z" fill="#ff8fc7"/>' +
        '<path d="M114 372 Q180 392 246 372 L242 362 Q180 380 118 362 Z" fill="#ffd6e8"/>' +
        '<path d="M152 206 Q180 196 208 206 L210 294 L150 294 Z" fill="#ff8fc7"/>' +
        '<path d="M152 206 Q180 220 208 206 L208 216 Q180 230 152 216 Z" fill="#ffd6e8"/>' +
        '<circle cx="150" cy="214" r="17" fill="#ff8fc7"/>' +
        '<circle cx="210" cy="214" r="17" fill="#ff8fc7"/>' +
        '<circle cx="180" cy="250" r="5" fill="#ffd6e8"/>',
    },
    {
      name: "冰藍禮服",
      swatch: "#8fd4ff",
      svg:
        '<path d="M156 292 L204 292 L216 396 Q180 408 144 396 Z" fill="#8fd4ff"/>' +
        '<path d="M144 396 Q180 408 216 396 L212 388 Q180 400 148 388 Z" fill="#e8f7ff"/>' +
        '<path d="M154 206 Q180 196 206 206 L206 294 L154 294 Z" fill="#8fd4ff"/>' +
        '<path d="M154 206 Q180 218 206 206 L206 214 Q180 226 154 214 Z" fill="#e8f7ff"/>' +
        '<path d="M156 208 q-8 28 -2 56" stroke="#cfeeff" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path d="M204 208 q8 28 2 56" stroke="#cfeeff" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<text x="171" y="332" font-size="13">❄️</text>',
    },
    {
      name: "鵝黃舞裙",
      swatch: "#ffd95e",
      svg:
        '<path d="M148 290 L212 290 L262 378 Q180 402 98 378 Z" fill="#ffd95e"/>' +
        '<path d="M98 378 Q180 402 262 378 L256 366 Q180 388 104 366 Z" fill="#fff3c0"/>' +
        '<path d="M152 206 Q180 196 208 206 L212 292 L148 292 Z" fill="#ffd95e"/>' +
        '<path d="M152 206 Q180 222 208 206 L208 216 Q180 232 152 216 Z" fill="#fff3c0"/>' +
        '<circle cx="148" cy="214" r="16" fill="#ffd95e"/>' +
        '<circle cx="212" cy="214" r="16" fill="#ffd95e"/>' +
        '<path d="M180 300 Q156 336 132 372 M180 300 Q204 336 228 372" stroke="#fff3c0" stroke-width="2" fill="none"/>',
    },
    {
      name: "蘋果紅裙",
      swatch: "#e0556b",
      svg:
        '<path d="M154 294 L206 294 L236 366 Q180 384 124 366 Z" fill="#e0556b"/>' +
        '<path d="M124 366 Q180 384 236 366 L232 358 Q180 374 128 358 Z" fill="#ffffff"/>' +
        '<path d="M154 208 Q180 198 206 208 L206 296 L154 296 Z" fill="#e0556b"/>' +
        '<path d="M156 206 Q180 226 204 206 Q196 224 180 226 Q164 224 156 206 Z" fill="#ffffff"/>' +
        '<circle cx="150" cy="214" r="14" fill="#e0556b"/>' +
        '<circle cx="210" cy="214" r="14" fill="#e0556b"/>' +
        '<circle cx="180" cy="250" r="4.5" fill="#ffffff"/>' +
        '<circle cx="180" cy="270" r="4.5" fill="#ffffff"/>',
    },
    {
      name: "夢幻紫紗",
      swatch: "#b18cff",
      svg:
        '<path d="M152 292 L208 292 L240 372 Q180 390 120 372 Z" fill="#b18cff"/>' +
        '<path d="M126 350 Q180 372 234 350 Q210 364 180 366 Q150 364 126 350 Z" fill="#e6d6ff"/>' +
        '<path d="M134 326 Q180 346 226 326 Q204 340 180 342 Q156 340 134 326 Z" fill="#cdb3ff"/>' +
        '<path d="M152 206 Q180 196 208 206 L208 294 L152 294 Z" fill="#b18cff"/>' +
        '<path d="M152 206 Q180 220 208 206 L208 214 Q180 226 152 214 Z" fill="#e6d6ff"/>' +
        '<circle cx="150" cy="212" r="14" fill="#cdb3ff"/>' +
        '<circle cx="210" cy="212" r="14" fill="#cdb3ff"/>',
    },
  ];

  /* ---------------- 鞋子（per-foot 建構） ---------------- */
  var SHOES = [
    {
      name: "芭蕾舞鞋",
      swatch: "#ff8fc7",
      build: function (x) {
        return (
          '<ellipse cx="' + x + '" cy="491" rx="18" ry="8" fill="#ff8fc7"/>' +
          '<path d="M' + (x - 16) + ' 487 a16 13 0 0 1 32 0 Z" fill="#ff8fc7"/>' +
          '<rect x="' + (x - 17) + '" y="481" width="34" height="4" rx="2" fill="#ff5fa9"/>'
        );
      },
    },
    {
      name: "玻璃高跟",
      swatch: "#bfe6ff",
      build: function (x) {
        return (
          '<path d="M' + (x - 16) + ' 485 q16 -8 32 0 l-3 12 q-13 6 -26 0 Z" fill="#cdeeff" stroke="#9fd0ff" stroke-width="1.5"/>' +
          '<rect x="' + (x + 7) + '" y="491" width="5" height="15" rx="2" fill="#cdeeff"/>'
        );
      },
    },
    {
      name: "紅色皮鞋",
      swatch: "#e0556b",
      build: function (x) {
        return (
          '<ellipse cx="' + x + '" cy="491" rx="18" ry="8" fill="#e0556b"/>' +
          '<path d="M' + (x - 16) + ' 487 a16 13 0 0 1 32 0 Z" fill="#e0556b"/>' +
          '<rect x="' + (x - 17) + '" y="482" width="34" height="4" rx="2" fill="#b83a52"/>' +
          '<circle cx="' + (x - 10) + '" cy="484" r="2.5" fill="#ffd24d"/>'
        );
      },
    },
    {
      name: "棕色短靴",
      swatch: "#9c6b3f",
      build: function (x) {
        return (
          '<rect x="' + (x - 14) + '" y="432" width="28" height="60" rx="10" fill="#9c6b3f"/>' +
          '<ellipse cx="' + x + '" cy="492" rx="19" ry="8" fill="#7a4f29"/>' +
          '<rect x="' + (x - 15) + '" y="438" width="30" height="6" fill="#c98a5e"/>'
        );
      },
    },
    { name: "赤腳", swatch: "#ffe0bd", build: function () { return ""; } },
  ];

  /* ---------------- 皇冠 / 頭飾 ---------------- */
  var CROWNS = [
    {
      name: "黃金皇冠",
      emoji: "👑",
      svg:
        '<path d="M146 66 L152 42 L166 60 L180 36 L194 60 L208 42 L214 66 Z" fill="#ffd24d" stroke="#e0a800" stroke-width="2" stroke-linejoin="round"/>' +
        '<rect x="146" y="64" width="68" height="8" rx="3" fill="#ffcf4d"/>' +
        '<circle cx="152" cy="44" r="3.5" fill="#ff7aa8"/>' +
        '<circle cx="180" cy="38" r="4" fill="#ff5fa9"/>' +
        '<circle cx="208" cy="44" r="3.5" fill="#7bd8ff"/>',
    },
    {
      name: "小皇冠",
      emoji: "♕",
      svg:
        '<path d="M156 64 L164 46 L180 60 L196 46 L204 64 Z" fill="#ffe08a" stroke="#e0a800" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="180" cy="49" r="4" fill="#ff5fa9"/>',
    },
    {
      name: "蝴蝶結",
      emoji: "🎀",
      svg:
        '<g transform="translate(138,58)">' +
        '<path d="M0 0 L-24 -13 L-24 13 Z" fill="#ff5fa9"/>' +
        '<path d="M0 0 L24 -13 L24 13 Z" fill="#ff5fa9"/>' +
        '<circle r="7" fill="#ff8fc7"/></g>',
    },
    {
      name: "花環",
      emoji: "🌸",
      svg:
        '<text x="116" y="74" font-size="20">🌸</text>' +
        '<text x="142" y="66" font-size="20">🌼</text>' +
        '<text x="170" y="62" font-size="20">🌷</text>' +
        '<text x="198" y="66" font-size="20">🌸</text>' +
        '<text x="224" y="74" font-size="18">🌼</text>',
    },
    { name: "不戴", emoji: "🚫", svg: "" },
  ];

  /* ---------------- 膚色 ---------------- */
  var SKINS = [
    { name: "白皙", color: "#ffe0bd" },
    { name: "自然", color: "#f4c79c" },
    { name: "蜜糖", color: "#d99a6c" },
    { name: "陽光", color: "#b5733f" },
  ];

  /* ---------------- 設定 ---------------- */
  var CATS = [
    { key: "scene", label: "🏞️ 場景", data: SCENES, kind: "emoji" },
    { key: "hair", label: "💇 髮型", data: HAIRS, kind: "swatch" },
    { key: "dress", label: "👗 禮服", data: DRESSES, kind: "swatch" },
    { key: "shoes", label: "👠 鞋子", data: SHOES, kind: "swatch" },
    { key: "crown", label: "👑 頭飾", data: CROWNS, kind: "emoji" },
    { key: "skin", label: "🎨 膚色", data: SKINS, kind: "skincolor" },
  ];

  var DEFAULTS = { scene: 0, hair: 0, dress: 0, shoes: 0, crown: 0, skin: 0 };
  var state = Object.assign({}, DEFAULTS);
  var activeCat = "dress";

  var doll = document.getElementById("doll");
  var FOOT_X = [164, 196];

  /* ---------------- 渲染娃娃 ---------------- */
  function setLayer(id, html) {
    document.getElementById(id).innerHTML = html;
  }
  function renderScene() {
    setLayer("scene", SCENES[state.scene].svg);
  }
  function renderHair() {
    setLayer("backhair", HAIRS[state.hair].back);
    setLayer("fronthair", HAIRS[state.hair].front);
  }
  function renderDress() {
    setLayer("dress", DRESSES[state.dress].svg);
  }
  function renderShoes() {
    var s = SHOES[state.shoes];
    setLayer("shoes", s.build(FOOT_X[0]) + s.build(FOOT_X[1]));
  }
  function renderCrown() {
    setLayer("crown", CROWNS[state.crown].svg);
  }
  function renderSkin() {
    doll.style.setProperty("--skin", SKINS[state.skin].color);
  }
  function renderAll() {
    renderScene();
    renderHair();
    renderDress();
    renderShoes();
    renderCrown();
    renderSkin();
  }

  function bounce() {
    doll.classList.remove("bounce");
    void doll.offsetWidth;
    doll.classList.add("bounce");
  }

  /* ---------------- 衣櫥 UI ---------------- */
  var tabsEl = document.getElementById("tabs");
  var optsEl = document.getElementById("options");

  function buildTabs() {
    tabsEl.innerHTML = "";
    CATS.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "tab" + (c.key === activeCat ? " active" : "");
      b.textContent = c.label;
      b.addEventListener("click", function () {
        activeCat = c.key;
        buildTabs();
        buildOptions();
        MLP.Sound.flip();
      });
      tabsEl.appendChild(b);
    });
  }

  function buildOptions() {
    var cat = CATS.filter(function (c) {
      return c.key === activeCat;
    })[0];
    optsEl.innerHTML = "";
    cat.data.forEach(function (item, i) {
      var div = document.createElement("div");
      div.className = "opt" + (state[cat.key] === i ? " sel" : "");
      var swatchHtml;
      if (cat.kind === "emoji") {
        swatchHtml =
          '<div class="swatch" style="background:#fff">' + item.emoji + "</div>";
      } else if (cat.kind === "skincolor") {
        swatchHtml =
          '<div class="swatch" style="background:' + item.color + '"></div>';
      } else {
        swatchHtml =
          '<div class="swatch" style="background:' + item.swatch + '"></div>';
      }
      div.innerHTML = swatchHtml + '<div class="nm">' + item.name + "</div>";
      div.addEventListener("click", function (e) {
        state[cat.key] = i;
        applyCategory(cat.key);
        buildOptions();
        bounce();
        MLP.Sound.sparkle();
        MLP.sparkleAt(e.clientX, e.clientY);
      });
      optsEl.appendChild(div);
    });
  }

  function applyCategory(key) {
    switch (key) {
      case "scene":
        renderScene();
        break;
      case "hair":
        renderHair();
        break;
      case "dress":
        renderDress();
        break;
      case "shoes":
        renderShoes();
        break;
      case "crown":
        renderCrown();
        break;
      case "skin":
        renderSkin();
        break;
    }
  }

  /* ---------------- 工具列按鈕 ---------------- */
  document.getElementById("btn-random").addEventListener("click", function () {
    CATS.forEach(function (c) {
      state[c.key] = (Math.random() * c.data.length) | 0;
    });
    renderAll();
    buildOptions();
    bounce();
    MLP.Sound.sparkle();
    MLP.confetti(40);
  });

  document.getElementById("btn-reset").addEventListener("click", function () {
    state = Object.assign({}, DEFAULTS);
    renderAll();
    buildOptions();
    bounce();
  });

  document.getElementById("btn-photo").addEventListener("click", savePhoto);

  function savePhoto() {
    try {
      var clone = doll.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      var data = new XMLSerializer().serializeToString(clone);
      var svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
      var url = URL.createObjectURL(svgBlob);
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = 720;
        canvas.height = 1040;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "我的公主造型.png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          MLP.Sound.win();
          MLP.confetti(60);
        });
      };
      img.onerror = function () {
        alert("拍照失敗了，再試一次吧！");
      };
      img.src = url;
    } catch (e) {
      alert("拍照失敗了，再試一次吧！");
    }
  }

  /* ---------------- 啟動 ---------------- */
  MLP.buildSky({ clouds: 4, stars: 10 });
  MLP.mountSoundToggle(document.getElementById("sound-slot"));
  MLP.wireClickSounds();
  renderAll();
  buildTabs();
  buildOptions();
})();
