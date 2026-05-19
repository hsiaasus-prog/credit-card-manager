import asyncio
from app.services.ai_service import clean_merchant_data

async def test_ai_cleaning():
    test_cases = [
        "PX-MART 0123456",
        "SHOPEE-TW 7-11 PAY",
        "UBER   *EATS PENDING",
        "STARBUCKS TAIPEI 101"
    ]
    
    print("=== Testing Google Gemini AI Merchant Cleaning ===")
    for raw in test_cases:
        result = await clean_merchant_data(raw)
        print(f"Raw: {raw}")
        print(f"Clean: {result.clean_name}")
        print(f"Category: {result.category}")
        print(f"Online: {result.is_online}")
        print("-" * 20)

if __name__ == "__main__":
    asyncio.run(test_ai_cleaning())
