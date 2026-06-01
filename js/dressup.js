/* ============================================================
   換裝舞臺 — 衣櫥資料與邏輯（公主 + 小王子）
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 場景（共用） ---------------- */
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

  /* ---------------- 膚色（共用） ---------------- */
  var SKINS = [
    { name: "白皙", color: "#ffe0bd" },
    { name: "自然", color: "#f4c79c" },
    { name: "蜜糖", color: "#d99a6c" },
    { name: "陽光", color: "#b5733f" },
  ];

  /* ---------------- 髮型 ---------------- */
  // 公主髮型
  var PRINCESS_HAIRS = [
    {
      name: "長捲髮",
      swatch: "#7a4a28",
      back:
        '<ellipse cx="180" cy="116" rx="88" ry="90" fill="#7a4a28"/>' +
        '<path d="M94 118 Q80 250 100 332 Q118 346 130 328 Q114 230 126 128 Z" fill="#7a4a28"/>' +
        '<path d="M266 118 Q280 250 260 332 Q242 346 230 328 Q246 230 234 128 Z" fill="#7a4a28"/>' +
        '<path d="M96 150 Q92 240 104 300" stroke="#9a6238" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>',
      front:
        '<path d="M106 116 Q100 48 180 46 Q260 48 254 116 Q244 90 222 98 Q212 72 194 94 Q186 68 180 92 Q174 68 166 94 Q148 72 138 98 Q116 90 106 116 Z" fill="#7a4a28"/>' +
        '<path d="M150 70 Q170 60 198 68" stroke="#9a6238" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>',
    },
    {
      name: "雙馬尾",
      swatch: "#2b2b3a",
      back:
        '<ellipse cx="180" cy="110" rx="84" ry="82" fill="#2b2b3a"/>' +
        '<ellipse cx="82" cy="212" rx="32" ry="60" fill="#2b2b3a"/>' +
        '<ellipse cx="278" cy="212" rx="32" ry="60" fill="#2b2b3a"/>' +
        '<circle cx="102" cy="148" r="10" fill="#ff6fae"/>' +
        '<circle cx="258" cy="148" r="10" fill="#ff6fae"/>',
      front:
        '<path d="M106 116 Q100 48 180 46 Q260 48 254 116 Q244 90 222 98 Q212 72 194 94 Q186 68 180 92 Q174 68 166 94 Q148 72 138 98 Q116 90 106 116 Z" fill="#2b2b3a"/>',
    },
    {
      name: "金色捲髮",
      swatch: "#e8b84a",
      back:
        '<ellipse cx="180" cy="116" rx="90" ry="88" fill="#e8b84a"/>' +
        '<path d="M94 150 Q84 226 96 280 Q112 256 124 280 Q138 256 148 282 L154 150 Z" fill="#e8b84a"/>' +
        '<path d="M266 150 Q276 226 264 280 Q248 256 236 280 Q222 256 212 282 L206 150 Z" fill="#e8b84a"/>',
      front:
        '<path d="M104 116 Q100 50 180 46 Q260 50 256 112 Q230 82 188 90 Q150 84 132 104 Q118 96 104 116 Z" fill="#e8b84a"/>' +
        '<path d="M140 72 Q176 60 214 70" stroke="#ffd87a" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>',
    },
    {
      name: "波波短髮",
      swatch: "#b5532e",
      back:
        '<ellipse cx="180" cy="120" rx="86" ry="86" fill="#b5532e"/>' +
        '<path d="M96 130 Q94 186 112 208 L124 150 Z" fill="#b5532e"/>' +
        '<path d="M264 130 Q266 186 248 208 L236 150 Z" fill="#b5532e"/>',
      front:
        '<path d="M104 118 Q100 48 180 46 Q260 48 256 118 Q244 94 220 100 Q206 76 190 96 Q180 74 170 96 Q154 76 140 100 Q116 94 104 118 Z" fill="#b5532e"/>',
    },
  ];
  // 王子髮型
  var PRINCE_HAIRS = [
    {
      name: "俏皮短髮",
      swatch: "#6b4a2e",
      back:
        '<path d="M112 108 Q108 150 122 172 L134 118 Z" fill="#6b4a2e"/>' +
        '<path d="M248 108 Q252 150 238 172 L226 118 Z" fill="#6b4a2e"/>',
      front:
        '<path d="M108 118 Q104 54 180 50 Q256 54 252 118 Q250 90 232 88 Q216 72 196 88 Q188 70 180 86 Q172 70 164 88 Q144 72 128 88 Q110 90 108 118 Z" fill="#6b4a2e"/>' +
        '<path d="M150 70 Q172 60 198 66" stroke="#8a6240" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>',
    },
    {
      name: "旁分頭",
      swatch: "#2b2b3a",
      back:
        '<path d="M112 110 Q108 148 122 168 L132 120 Z" fill="#2b2b3a"/>' +
        '<path d="M248 110 Q252 148 238 168 L228 120 Z" fill="#2b2b3a"/>',
      front:
        '<path d="M106 118 Q102 52 180 48 Q258 52 252 112 Q244 84 150 92 Q124 96 106 118 Z" fill="#2b2b3a"/>',
    },
    {
      name: "金棕捲",
      swatch: "#caa14e",
      back: '<ellipse cx="180" cy="100" rx="82" ry="58" fill="#caa14e"/>',
      front:
        '<path d="M108 116 Q106 58 180 52 Q254 58 252 116 Q240 100 228 110 Q216 96 204 108 Q192 96 180 108 Q168 96 156 108 Q144 96 132 110 Q120 100 108 116 Z" fill="#caa14e"/>',
    },
    {
      name: "翹翹頭",
      swatch: "#4a3526",
      back:
        '<path d="M114 112 Q110 144 122 162 L132 120 Z" fill="#4a3526"/>' +
        '<path d="M246 112 Q250 144 238 162 L228 120 Z" fill="#4a3526"/>',
      front:
        '<path d="M108 116 L122 70 L136 104 L150 64 L166 102 L180 56 L196 102 L210 64 L226 104 L240 70 L252 116 Q180 98 108 116 Z" fill="#4a3526"/>',
    },
  ];
  var HAIRS = [PRINCESS_HAIRS, PRINCE_HAIRS];

  /* ---------------- 服裝 ---------------- */
  // 公主禮服
  var PRINCESS_OUTFITS = [
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

  // 王子西裝產生器
  function princeSuit(c) {
    var s = "";
    // 褲子
    s += '<path d="M164 300 L162 474" stroke="' + c.pants + '" stroke-width="26" stroke-linecap="round"/>';
    s += '<path d="M196 300 L198 474" stroke="' + c.pants + '" stroke-width="26" stroke-linecap="round"/>';
    s += '<rect x="150" y="284" width="60" height="28" rx="5" fill="' + c.pants + '"/>';
    // 外套
    s += '<path d="M150 204 Q180 196 210 204 L214 302 L146 302 Z" fill="' + c.main + '"/>';
    // 襯衫 V
    s += '<path d="M168 206 L180 252 L192 206 Z" fill="' + (c.shirt || "#ffffff") + '"/>';
    // 肩帶
    if (c.sash) {
      s += '<path d="M150 214 L208 288 L199 298 L143 224 Z" fill="' + c.sash + '"/>';
    }
    // 鈕扣
    s += '<circle cx="180" cy="232" r="3.2" fill="#ffd24d"/><circle cx="180" cy="252" r="3.2" fill="#ffd24d"/><circle cx="180" cy="272" r="3.2" fill="#ffd24d"/>';
    // 領子
    s += '<path d="M166 206 Q180 220 194 206 L194 215 Q180 227 166 215 Z" fill="' + c.trim + '"/>';
    // 袖子
    s += '<path d="M150 210 Q140 270 146 326" stroke="' + c.main + '" stroke-width="22" fill="none" stroke-linecap="round"/>';
    s += '<path d="M210 210 Q220 270 214 326" stroke="' + c.main + '" stroke-width="22" fill="none" stroke-linecap="round"/>';
    // 袖口
    s += '<circle cx="146" cy="326" r="11" fill="' + c.trim + '"/><circle cx="214" cy="326" r="11" fill="' + c.trim + '"/>';
    // 肩章
    if (c.epaulettes) {
      s += '<circle cx="150" cy="210" r="10" fill="' + c.trim + '"/><circle cx="210" cy="210" r="10" fill="' + c.trim + '"/>';
    }
    return s;
  }
  // 王子服裝
  var PRINCE_OUTFITS = [
    { name: "王子藍裝", swatch: "#4a6fd0", svg: princeSuit({ main: "#4a6fd0", trim: "#ffd24d", pants: "#ffffff", sash: "#ff5fa9", epaulettes: true }) },
    { name: "皇家紅裝", swatch: "#d24a55", svg: princeSuit({ main: "#d24a55", trim: "#ffd24d", pants: "#2b2b3a", sash: "#5a8fe0", epaulettes: true }) },
    { name: "冒險綠裝", swatch: "#3fa55a", svg: princeSuit({ main: "#3fa55a", trim: "#caa14e", pants: "#6b4a2e", shirt: "#eaffea", epaulettes: false }) },
    { name: "騎士白裝", swatch: "#e7edf5", svg: princeSuit({ main: "#eef2f7", trim: "#aab6c6", pants: "#aab6c6", sash: "#4a6fd0", epaulettes: true }) },
    { name: "休閒裝", swatch: "#ffce5a", svg: princeSuit({ main: "#ffce5a", trim: "#ff8fc7", pants: "#6b8fd0", shirt: "#fff4d6", epaulettes: false }) },
  ];
  var OUTFITS = [PRINCESS_OUTFITS, PRINCE_OUTFITS];

  /* ---------------- 鞋子（共用） ---------------- */
  var FOOT_X = [164, 196];
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
    {
      name: "運動鞋",
      swatch: "#5ec6ff",
      build: function (x) {
        return (
          '<path d="M' + (x - 18) + ' 484 q-2 10 2 14 q16 6 34 1 l1 -9 q-16 4 -31 -2 Z" fill="#ffffff" stroke="#cfd8e3" stroke-width="1.5"/>' +
          '<path d="M' + (x - 16) + ' 492 h32 l-1 5 q-16 5 -31 0 Z" fill="#5ec6ff"/>' +
          '<path d="M' + (x - 2) + ' 486 l8 3" stroke="#5ec6ff" stroke-width="2.5"/>'
        );
      },
    },
    { name: "赤腳", swatch: "#ffe0bd", build: function () { return ""; } },
  ];

  /* ---------------- 頭飾（共用） ---------------- */
  var HEADWEAR = [
    { name: "不戴", emoji: "🚫", svg: "" },
    {
      name: "公主皇冠",
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
    {
      name: "王子皇冠",
      emoji: "🤴",
      svg:
        '<path d="M156 60 L156 40 L170 54 L180 30 L190 54 L204 40 L204 60 Z" fill="#ffd24d" stroke="#e0a800" stroke-width="2" stroke-linejoin="round"/>' +
        '<rect x="154" y="58" width="52" height="9" rx="3" fill="#ffcf4d"/>' +
        '<rect x="178" y="18" width="4" height="12" fill="#ffd24d"/>' +
        '<rect x="174" y="22" width="12" height="4" rx="1" fill="#ffd24d"/>' +
        '<circle cx="180" cy="49" r="4.5" fill="#ff5fa9"/>' +
        '<circle cx="164" cy="48" r="3" fill="#7bd8ff"/>' +
        '<circle cx="196" cy="48" r="3" fill="#7bd8ff"/>',
    },
    {
      name: "羽毛帽",
      emoji: "🪶",
      svg:
        '<path d="M150 64 Q180 38 210 64 Q180 56 150 64 Z" fill="#2f7d44"/>' +
        '<path d="M156 60 Q180 30 204 60 Q180 48 156 60 Z" fill="#3fa55a"/>' +
        '<path d="M198 54 Q224 26 216 56 Q208 48 198 54 Z" fill="#ff5fa9"/>' +
        '<rect x="152" y="60" width="56" height="7" rx="3" fill="#caa14e"/>',
    },
  ];

  /* ---------------- 角色 ---------------- */
  var CHARS = [
    { name: "公主", emoji: "👸" },
    { name: "王子", emoji: "🤴" },
  ];
  var DEFAULT_HEAD = [1, 5]; // 公主→公主皇冠, 王子→王子皇冠
  var DEFAULT_SHOES = [0, 3]; // 公主→芭蕾舞鞋, 王子→棕色短靴

  /* ---------------- 分類 ---------------- */
  var CATS = [
    { key: "char", label: "🧒 角色", kind: "emoji" },
    { key: "hair", label: "💇 髮型", kind: "swatch" },
    { key: "outfit", label: "👗 服裝", kind: "swatch" },
    { key: "shoes", label: "👟 鞋子", kind: "swatch" },
    { key: "head", label: "👑 頭飾", kind: "emoji" },
    { key: "skin", label: "🎨 膚色", kind: "skincolor" },
    { key: "scene", label: "🏰 場景", kind: "emoji" },
  ];

  var DEFAULTS = { char: 0, hair: 0, outfit: 0, shoes: 0, head: 1, skin: 0, scene: 0 };
  var state = Object.assign({}, DEFAULTS);
  var activeCat = "char";

  var doll = document.getElementById("doll");

  function curHairs() { return HAIRS[state.char]; }
  function curOutfits() { return OUTFITS[state.char]; }
  function getData(key) {
    switch (key) {
      case "char": return CHARS;
      case "hair": return curHairs();
      case "outfit": return curOutfits();
      case "shoes": return SHOES;
      case "head": return HEADWEAR;
      case "skin": return SKINS;
      case "scene": return SCENES;
    }
    return [];
  }

  /* ---------------- 渲染娃娃 ---------------- */
  function setLayer(id, html) { document.getElementById(id).innerHTML = html; }
  function renderScene() { setLayer("scene", SCENES[state.scene].svg); }
  function renderHair() {
    var h = curHairs()[state.hair];
    setLayer("backhair", h.back);
    setLayer("fronthair", h.front);
  }
  function renderOutfit() { setLayer("dress", curOutfits()[state.outfit].svg); }
  function renderShoes() {
    var s = SHOES[state.shoes];
    setLayer("shoes", s.build(FOOT_X[0]) + s.build(FOOT_X[1]));
  }
  function renderHead() { setLayer("crown", HEADWEAR[state.head].svg); }
  function renderSkin() { doll.style.setProperty("--skin", SKINS[state.skin].color); }
  function renderAll() {
    renderScene();
    renderHair();
    renderOutfit();
    renderShoes();
    renderHead();
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
    var cat = CATS.filter(function (c) { return c.key === activeCat; })[0];
    var data = getData(cat.key);
    optsEl.innerHTML = "";
    data.forEach(function (item, i) {
      var div = document.createElement("div");
      div.className = "opt" + (state[cat.key] === i ? " sel" : "");
      var swatchHtml;
      if (cat.kind === "emoji") {
        swatchHtml = '<div class="swatch" style="background:#fff">' + item.emoji + "</div>";
      } else if (cat.kind === "skincolor") {
        swatchHtml = '<div class="swatch" style="background:' + item.color + '"></div>';
      } else {
        swatchHtml = '<div class="swatch" style="background:' + item.swatch + '"></div>';
      }
      div.innerHTML = swatchHtml + '<div class="nm">' + item.name + "</div>";
      div.addEventListener("click", function (e) {
        selectOption(cat.key, i);
        MLP.Sound.sparkle();
        MLP.sparkleAt(e.clientX, e.clientY);
      });
      optsEl.appendChild(div);
    });
  }

  function selectOption(key, i) {
    if (key === "char") {
      state.char = i;
      // 切換角色 → 重設成該角色的預設造型
      state.hair = 0;
      state.outfit = 0;
      state.head = DEFAULT_HEAD[i];
      state.shoes = DEFAULT_SHOES[i];
      renderAll();
    } else {
      state[key] = i;
      applyCategory(key);
    }
    buildOptions();
    bounce();
  }

  function applyCategory(key) {
    switch (key) {
      case "scene": renderScene(); break;
      case "hair": renderHair(); break;
      case "outfit": renderOutfit(); break;
      case "shoes": renderShoes(); break;
      case "head": renderHead(); break;
      case "skin": renderSkin(); break;
    }
  }

  /* ---------------- 工具列 ---------------- */
  function rand(n) { return (Math.random() * n) | 0; }

  document.getElementById("btn-random").addEventListener("click", function () {
    state.char = rand(CHARS.length);
    state.hair = rand(curHairs().length);
    state.outfit = rand(curOutfits().length);
    state.shoes = rand(SHOES.length);
    state.head = rand(HEADWEAR.length);
    state.skin = rand(SKINS.length);
    state.scene = rand(SCENES.length);
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
          a.download = "我的" + CHARS[state.char].name + "造型.png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          MLP.Sound.win();
          MLP.confetti(60);
        });
      };
      img.onerror = function () { alert("拍照失敗了，再試一次吧！"); };
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
