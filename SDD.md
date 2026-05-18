# AI 信用卡消費管家 軟體設計文件 (SDD)

## 0. 文件資訊
| 項目 | 內容 |
|------|------|
| 文件版本 | 1.0 |
| 建立日期 | 2026年5月18日 |
| 對應 PRD 版本 | 1.0 |
| 文件狀態 | 已核准 |

---

## 1. 簡介

### 1.1 文件目的
本文件詳述「AI 信用卡消費管家」的系統架構、資料結構、模組設計與 API 規範。本文件主要針對 **AI Coding Agent (如 Cursor, Claude Code)** 編寫，旨在提供清晰的實作指令，確保代碼生成的邏輯一致性。

### 1.2 專案概述
本專案為一個**本地端內部工具**，旨在協助使用者管理多張信用卡帳單。透過 PDF 解析、AI 店家名稱清理與規則引擎，自動計算回饋金額並提供消費建議，解決銀行帳單混亂與回饋難以追蹤的痛點。

### 1.3 系統範圍
*   **包含功能**：
    *   PDF 帳單自動解密與解析。
    *   AI 店家名稱清理 (Merchant Normalization) 與分類。
    *   多卡回饋規則計算引擎。
    *   本地加密密碼庫 (Vault)。
    *   消費分析儀表板與刷卡建議。
*   **不包含功能**：
    *   多使用者雲端同步。
    *   自動登入銀行官網下載帳單。
    *   金流支付功能。

### 1.4 術語與縮寫
| 術語 | 定義 |
|------|------|
| MCC | 商戶類別代碼 (Merchant Category Code) |
| Vault | 本地加密存儲空間，用於存放 PDF 開啟密碼 |
| Matching Engine | 規則媒合引擎，將交易紀錄與銀行回饋條款進行比對的邏輯 |

---

## 2. 技術架構

### 2.1 技術選型總覽
| 層級 | 技術選擇 | 版本 | 選用理由 |
|------|----------|------|----------|
| 前端框架 | React (Vite) | 18+ | 輕量快速，開發效率高 |
| 後端框架 | FastAPI (Python) | 0.100+ | 非同步處理能力強，適合 PDF 解析與 AI 調用 |
| 資料庫 | SQLite | - | 本地存儲，零部署成本，適合內部工具 |
| ORM | SQLAlchemy | 2.0+ | 強型別支援，與 FastAPI 整合度高 |
| 樣式/UI | Tailwind CSS + Shadcn UI | - | 快速建構現代化且易於修改的 UI |
| AI 模型 | OpenAI API (GPT-4o) | - | 業界最強語義辨識能力 |

### 2.2 系統架構圖
```
┌─────────────────────────────────────────────────────────────┐
│                        用戶瀏覽器 (React SPA)                 │
└─────────────────────────────────────────────────────────────┘
                              │ JSON / REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI 後端服務 (Local)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ PDF Parser  │  │ AI Processor│  │ Rule Engine │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │ SQLAlchemy ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SQLite 資料庫 (db.sqlite3)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Transactions │ │ Cards   │  │ Rules    │  │ Vault    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 目錄結構
```
ai-credit-manager/
├── backend/                # FastAPI 專案根目錄
│   ├── app/
│   │   ├── api/            # Route Handlers
│   │   ├── core/           # Security, Config, AI client
│   │   ├── models/         # SQLAlchemy Models
│   │   ├── schemas/        # Pydantic Schemas
│   │   ├── services/       # PDF Parser, Rule Engine logic
│   │   └── main.py         # Entry point
│   ├── data/               # SQLite db file storage
│   └── .env                # API Keys & Secrets
├── frontend/               # React + Vite 專案根目錄
│   ├── src/
│   │   ├── components/     # UI Components (Shadcn)
│   │   ├── hooks/          # API hooks
│   │   ├── pages/          # Dashboard, Settings
│   │   └── lib/            # Axios instance, utils
└── shared/                 # (Optional) Shared types/configs
```

---

## 3. 資料設計

### 3.1 資料庫選型
選用 **SQLite**。其為單一檔案格式，易於備份與攜帶，且對於個人內部工具之併發要求極低，是最佳選擇。

### 3.2 實體關係圖 (ER Diagram)
```
[Cards] 1 ──── * [Transactions]
    │
    └── 1 ──── * [Rules]

[Vault] (獨立加密表)
```

### 3.3 資料表設計

**Table: `cards` (信用卡)**
| 欄位名稱 | 資料型態 | 允許 NULL | 預設值 | 說明 |
|----------|----------|-----------|--------|------|
| id | INTEGER | NO | PK | 主鍵 |
| bank_name | VARCHAR | NO | - | 銀行名稱 (如: 台新) |
| card_name | VARCHAR | NO | - | 卡片名稱 (如: FlyGo) |
| last_four | VARCHAR | NO | - | 卡號末四碼 (辨識帳單用) |
| bill_date | INTEGER | NO | 1 | 結帳日 (1-31) |

**Table: `rules` (回饋規則)**
| 欄位名稱 | 資料型態 | 允許 NULL | 預設值 | 說明 |
|----------|----------|-----------|--------|------|
| id | INTEGER | NO | PK | 主鍵 |
| card_id | INTEGER | NO | FK | 關聯 cards.id |
| name | VARCHAR | NO | - | 規則描述 (如: 網購加碼) |
| rate | FLOAT | NO | 0.0 | 回饋趴數 (0.03 = 3%) |
| cap | FLOAT | YES | NULL | 回饋上限 (NULL = 無上限) |
| rule_json | JSON | NO | - | 判斷邏輯 (關鍵字、分類等) |

**Table: `transactions` (消費明細)**
| 欄位名稱 | 資料型態 | 允許 NULL | 預設值 | 說明 |
|----------|----------|-----------|--------|------|
| id | INTEGER | NO | PK | 主鍵 |
| card_id | INTEGER | NO | FK | 關聯 cards.id |
| raw_name | VARCHAR | NO | - | PDF 原始店家名稱 |
| clean_name| VARCHAR | YES | - | AI 清理後的名稱 |
| category | VARCHAR | YES | - | AI 分類 (食/衣/住/行) |
| amount | FLOAT | NO | - | 金額 |
| trans_date| DATE | NO | - | 消費日期 |
| cashback | FLOAT | NO | 0.0 | 計算出的回饋金額 |

**Table: `vault` (加密保險箱)**
| 欄位名稱 | 資料型態 | 允許 NULL | 預設值 | 說明 |
|----------|----------|-----------|--------|------|
| bank_name | VARCHAR | NO | PK | 銀行名稱 |
| enc_pwd | TEXT | NO | - | AES-256 加密後的 PDF 密碼 |

---

## 4. 模組設計

### 4.1 模組總覽
| 模組名稱 | 檔案路徑 | 職責 | 依賴 |
|----------|----------|------|----------|
| PDF Parser | `services/pdf_handler.py` | 負責 PDF 解密與文字提取 | `pdfplumber`, `cryptography` |
| AI Engine | `services/ai_service.py` | 店家名稱清理、自動分類 | OpenAI API |
| Rule Engine | `services/rule_engine.py` | 根據規則計算回饋 | 資料庫 `rules` 表 |
| Security | `core/security.py` | 負責 Vault 加解密邏輯 | `cryptography` |

### 4.2 PDF Parser 模組 (`pdf_handler.py`)
**職責**：處理不同銀行的 PDF 結構適配。
```python
class PDFProcessor:
    def decrypt_pdf(self, file_path: str, password: str) -> bool:
        """嘗試使用密碼解密 PDF"""
    
    def extract_data(self, bank_type: str) -> List[Dict]:
        """
        根據 bank_type 調用對應 adapter (如: ctb_adapter, tsin_adapter)
        使用 regex 或 table extraction 抓取交易紀錄
        """
```

### 4.3 AI Engine 模組 (`ai_service.py`)
**核心邏輯**：使用 OpenAI `gpt-4o-mini` (成本考量) 進行結構化輸出。
```python
def clean_merchant_data(raw_name: str) -> dict:
    """
    Prompt: "你是一個台灣信用卡專家，請將以下店家名稱進行清理：{raw_name}。
    請回傳 JSON: {'clean_name': str, 'category': str, 'is_online': bool}"
    """
```

---

## 5. 介面設計

### 5.1 API 設計 (FastAPI)

| 方法 | 端點 | 功能 | 備註 |
|------|------|------|----------|
| POST | `/api/upload` | 上傳 PDF 並啟動解析流程 | 需帶 `bank_name` |
| GET | `/api/dashboard` | 獲取當月總覽 (支出、回饋) | |
| GET | `/api/suggest` | 根據店家名稱建議最優卡片 | `?merchant=蝦皮` |
| POST | `/api/vault` | 儲存/更新銀行帳單密碼 | 存入前需加密 |

### 5.2 前端頁面設計 (React)
1.  **Dashboard (/)**:
    *   圓餅圖：消費類別佔比。
    *   卡片列表：各卡回饋累積進度條 (Progress Bar，顯示是否達上限)。
2.  **Transactions (/history)**:
    *   可過濾的資料表格 (DataTable)。
    *   允許手動修正 AI 分類錯誤。
3.  **Vault (/settings)**:
    *   管理各銀行 PDF 密碼。

---

## 6. 安全設計
*   **密碼存儲**：使用 `cryptography` 套件的 `Fernet` (AES-128) 或 `AES-256-GCM`。
*   **Key 管理**：加密金鑰存儲於本地 `.env` 的 `SECRET_KEY`。
*   **資料隱私**：所有帳單明細僅存儲於使用者的 `db.sqlite3` 檔案中，不對外傳輸，僅店家名稱發送至 OpenAI 進行分類。

---

## 7. 實作路徑 (Implementation Roadmap)

### 階段 1: 後端骨架與資料庫 (Day 1)
1.  **環境初始化**：建立 FastAPI 專案，配置 `requirements.txt` (`fastapi`, `sqlalchemy`, `pydantic`, `pdfplumber`, `openai`, `cryptography`, `python-dotenv`)。
2.  **Model 定義**：實作 `models/` 內的 SQLAlchemy 表結構。
3.  **Vault 實作**：完成 `core/security.py` 的加密與解密函數。

### 階段 2: PDF 與 AI 解析模組 (Day 2)
1.  **適配器模式**：實作 `pdf_handler.py`，先完成一家主要銀行 (如: 中信或台新) 的解析邏輯。
2.  **AI 整合**：實作 `ai_service.py`，串接 OpenAI API 並設計完善的 Prompt。
3.  **上傳端點**：實作 `/api/upload`，整合「解密 -> 解析 -> AI 清理 -> 入庫」。

### 階段 3: 規則引擎與建議系統 (Day 3)
1.  **計算邏輯**：實作 `rule_engine.py`。
    *   需處理「排除項目」(如：稅款、保費)。
    *   需處理「累計上限」：計算前需先 Query 資料庫當月已累積之回饋。
2.  **建議 API**：實作 `/api/suggest`，模擬「若在此店家消費，哪張卡回饋最高」。

### 階段 4: 前端開發 (Day 4)
1.  **Vite 初始化**：建立 React 專案並安裝 Tailwind 與 Shadcn UI。
2.  **上傳組件**：開發帶有密碼輸入框的檔案上傳 UI。
3.  **圖表開發**：使用 `recharts` 實作消費分類與回饋趨勢圖。

### 階段 5: 優化與測試 (Day 5)
1.  **數據去重**：確保重複上傳同一份 PDF 時，不會產生重複的消費紀錄。
2.  **邊際測試**：測試加密 PDF 密碼錯誤、AI 回傳異常 JSON 等情境。

---

## 8. 運作指令 (供 AI Agent 參考)

```bash
# 後端啟動 (FastAPI)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 前端啟動 (Vite)
cd frontend
npm install
npm run dev
```

**請 AI Coding Agent 依照「實作路徑」分階段執行。在開始每一階段前，請確認前一階段的資料庫 Schema 與 API 定義是否已正確載入。**