# AI 信用卡消費管家 軟體設計文件 (SDD) V1

## 0. 文件資訊
| 項目 | 內容 |
|------|------|
| 文件版本 | V1.0 (As-Built) |
| 建立日期 | 2026年5月18日 |
| 最後更新 | 2026年5月18日 |
| 文件狀態 | 已開發完成 |

---

## 1. 系統架構

### 1.1 目錄結構
```
Credit-card-manager/
├── backend/                # FastAPI 後端
│   ├── app/
│   │   ├── api/            # 路由模組 (upload, dashboard, suggest, vault, cards, transactions)
│   │   ├── core/           # 安全加密 (security.py)
│   │   ├── models/         # SQLAlchemy 模型 (models.py, database.py)
│   │   ├── schemas/        # Pydantic 驗證
│   │   └── services/       # 核心邏輯 (pdf_handler, ai_service, rule_engine)
│   ├── data/               # SQLite 資料庫儲存
│   ├── tests/              # 單元與整合測試
│   └── .env                # 環境變數 (含 GOOGLE_API_KEY)
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # UI 組件 (Sidebar, Layout, TopBar)
│   │   ├── lib/            # 工具類與 Axios 實例 (api.ts, utils.ts)
│   │   └── pages/          # 頁面 (Overview, BillImport, SmartSuggestions, SpendingAnalysis, Settings)
```

### 1.2 落地技術選型
*   **後端框架**：FastAPI。
*   **AI 引擎**：Google Gemini (`gemma-4-31b-it`) 搭配 `google-genai` SDK。
*   **資料庫**：SQLite，透過 `aiosqlite` 實現非同步操作。
*   **ORM**：SQLAlchemy 2.0 (Declarative Base)。
*   **安全性**：使用 `cryptography.fernet` 進行 AES-256 加解密。

---

## 2. 資料設計 (Data Schema)

### 2.1 資料表實作細節

**Table: `cards`**
*   `id`: INTEGER (PK)
*   `bank_name`: VARCHAR (銀行代碼)
*   `card_name`: VARCHAR (卡片顯示名稱)
*   `last_four`: VARCHAR (卡號末四碼，用於識別帳單)
*   `bill_date`: INTEGER (結帳日)

**Table: `rules`**
*   `id`: INTEGER (PK)
*   `card_id`: INTEGER (FK)
*   `name`: VARCHAR (規則描述)
*   `rate`: FLOAT (回饋比例，如 0.03 代表 3%)
*   `cap`: FLOAT (回饋上限，可為 NULL)
*   `rule_json`: JSON (存儲邏輯，如 `{"categories": ["食"], "keywords": ["蝦皮"]}`)

**Table: `transactions`**
*   `id`: INTEGER (PK)
*   `card_id`: INTEGER (FK)
*   `raw_name`: VARCHAR (PDF 原始名稱)
*   `clean_name`: VARCHAR (AI 清理後名稱)
*   `category`: VARCHAR (AI 分類)
*   `amount`: FLOAT (交易金額)
*   `trans_date`: DATE (交易日期)
*   `cashback`: FLOAT (計算出的回饋金)

**Table: `vault`**
*   `bank_name`: VARCHAR (PK, 銀行代碼)
*   `enc_pwd`: TEXT (Fernet 加密後的密碼字串)

---

## 3. 模組設計

### 3.1 PDF 解析器 (`pdf_handler.py`)
*   支援使用密碼嘗試開啟加密 PDF。
*   具備 `_extract_ctbc`, `_extract_taishin` 與 `_extract_generic` 三種解析策略。
*   使用 Regex 擷取交易日期、描述與金額。

### 3.2 AI 服務 (`ai_service.py`)
*   **模型**：`gemma-4-31b-it`。
*   **機制**：強制要求 Gemini 回傳 `application/json` 格式，包含 `clean_name`, `category`, `is_online` 三個欄位。
*   **安全性**：僅將非敏感的「店家名稱」傳送至 AI，金額與日期保留在本地。

### 3.3 規則引擎 (`rule_engine.py`)
*   **計算邏輯**：逐一比對卡片關聯的所有規則，取回饋金額最高者。
*   **匹配方式**：
    1.  類別匹配：檢查 `transaction.category` 是否在 `rule.categories` 列表中。
    2.  關鍵字匹配：檢查 `rule.keywords` 是否出現在 `raw_name` 或 `clean_name` 中。
*   **上限處理**：若規則設定了 `cap`，計算出的回饋金將不超過該上限值。

---

## 4. API 規範 (API Endpoints)

| 方法 | 端點 | 功能描述 |
|------|------|----------|
| POST | `/api/upload` | 上傳 PDF 並啟動解析與 AI 分類流程。 |
| GET | `/api/dashboard` | 獲取 KPI (總消費、總回饋) 與圖表數據。 |
| GET | `/api/suggest` | 根據關鍵字搜尋回饋率最高的卡片。 |
| POST | `/api/vault` | 存儲或更新銀行的加密 PDF 密碼。 |
| GET | `/api/vault` | 查詢已存儲密碼的銀行列表。 |
| GET | `/api/transactions`| 獲取所有交易明細，支援日期排序。 |
| GET | `/api/cards` | 獲取持卡清單。 |

---

## 5. 安全架構細節
*   **加密金鑰**：`SECRET_KEY` 儲存於 `.env`，不得提交至 Git。
*   **保險箱流程**：
    1.  使用者輸入明文密碼。
    2.  後端使用 `Fernet(SECRET_KEY).encrypt()`。
    3.  加密結果存入 `vault` 表。
    4.  上傳 PDF 時，後端 `decrypt()` 後傳給 `pdfplumber` 進行解鎖。
*   **CORS 設定**：已配置 FastAPI Middleware 允許前端開發環境 (`localhost:3000`) 的跨網域請求。
