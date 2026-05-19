from google import genai
from google.genai import types
import os
import json
from dotenv import load_dotenv
from ..schemas.schemas import MerchantInfo

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
client = None
if api_key and api_key != "your_google_api_key_here":
    client = genai.Client(api_key=api_key)

async def clean_merchant_data(raw_name: str) -> MerchantInfo:
    """
    Use Google Gemini to clean merchant name and categorize it.
    """
    if not client:
        # Mock response if API key is not set
        return MerchantInfo(clean_name=raw_name, category="其他", is_online=False)

    prompt = f"""你是一個台灣信用卡專家，請將以下信用卡交易紀錄中的店家名稱進行清理與分類：
店家原始名稱：{raw_name}

請回傳 JSON 格式，包含以下欄位：
- clean_name: 清理後的店家品牌名稱 (例如 "PX-MART 0123" -> "全聯福利中心")
- category: 分類 (例如 "食", "衣", "住", "行", "育", "樂", "網購", "其他")
- is_online: 是否為網購 (boolean)

範例輸出：
{{"clean_name": "全聯福利中心", "category": "食", "is_online": false}}
"""

    try:
        response = client.models.generate_content(
            model="gemma-4-31b-it", # User specified model
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        # Parse JSON from response
        # The new SDK response object has a text attribute
        data = json.loads(response.text)
        return MerchantInfo(**data)
    except Exception as e:
        print(f"Gemini Service Error: {e}")
        return MerchantInfo(clean_name=raw_name, category="其他", is_online=False)
