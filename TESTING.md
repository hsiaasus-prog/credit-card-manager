# AI 信用卡消費管家 測試說明文件

## 1. 後端測試 (Python)

### A. 規則引擎測試 (單元測試)
驗證回饋計算邏輯、分類匹配及上限功能。
```bash
cd backend
python tests/test_rules.py
```

### B. AI 清理測試 (整合測試)
驗證 Google Gemini 模型是否能正確解析台灣店家名稱。
```bash
cd backend
python tests/test_ai.py
```

### C. API 互動式測試
啟動後端後訪問 Swagger UI：
- **URL**: http://localhost:8000/docs
- **重點測試項目**:
  - `POST /api/vault`: 存入測試密碼。
  - `GET /api/vault`: 確認銀行列表已更新。
  - `GET /api/suggest?merchant=蝦皮`: 確認 AI 能即時給出刷卡建議。

---

## 2. 前端測試 (Manual QA)

### A. 上傳功能測試
1. 前往「帳單匯入」。
2. 選擇「中國信託」。
3. 拖入一個範例 PDF (若手邊無 PDF，可先測試 UI 反應)。
4. 觀察是否出現「解析中」動畫。

### B. 保險箱功能測試
1. 前往「系統設定」。
2. 選擇「玉山銀行」。
3. 輸入測試密碼 `A123456789` 並儲存。
4. 確認下方清單出現「玉山銀行」且標記為「已加密儲存」。

### C. 數據總覽測試
1. 在執行過 `python init_db.py` 後。
2. 前往「總覽面板」。
3. 確認「本月總消費」與「累積回饋」非為 0（應顯示初始化數據）。
4. 查看「近期交易」表格是否正確渲染。

---

## 3. 測試資料準備
- **初始化資料庫**: `python init_db.py` (已完成)
- **環境變數**: 確保 `backend/.env` 已填入有效的 `GOOGLE_API_KEY`。
