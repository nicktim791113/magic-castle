# CLAUDE.md — 魔法小皇宮

給 AI 協作者的專案規則。**每次開發都必須遵守。** 完整版見 [`開發規範.md`](docs/開發規範.md)。

## ✅ 每次修改完都要做（不分大小）
1. 更新 `docs/更新紀錄.md`（最上面新增一段，格式見開發規範）。
2. 需要時更新 `README.md` 與 `docs/開發文件.md`。
3. 完成後 `git add -A && git commit -m "..." && git push`（會自動部署到 GitHub Pages）。

## 🔴 備份規則（動手前判斷）
- **小型修改**（單一檔案、加一筆資料、改文字/顏色/數值）→ **免備份**。
- **大型修改**（牽動多檔、改共用檔 `common.js`/`style.css`/`sw.js`/`manifest.webmanifest`、新增遊戲/頁面、重構、改結構或路徑）→ **動手前先備份**：把整個專案複製到 `backups/YYYY-MM-DD_HHMM__描述/`（排除 `.git` 與 `backups`）。
- 拿不準 → 當作大型。

## 🔄 開發流程
判斷規模 →（大型先備份）→ 修改 → 實際測試 → 更新紀錄與文件 → 推送 → 確認線上更新。

## 📌 專案重點
- 純 HTML/CSS/原生 JS，無建置工具；圖形用 emoji + 手繪 SVG，音效用 Web Audio。
- **全部使用相對路徑**（部署在 `/magic-castle/` 子路徑，這是 Pages 正常運作的關鍵）。
- 改 `sw.js` 後把快取版本 `mlp-cache-v1` +1；增刪檔案要同步 `sw.js` 的 `ASSETS` 清單。
- 驗證用 headless Edge 截圖／CDP（本機預覽截圖工具會逾時）。
- 線上：https://nicktim791113.github.io/magic-castle/ ｜ 儲存庫：`nicktim791113/magic-castle`
