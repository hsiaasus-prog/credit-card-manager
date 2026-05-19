from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
model_name = "gemma-4-31b-it"

print(f"Testing with API Key: {api_key[:10]}...")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=model_name,
        contents="Hello, identify yourself."
    )
    print("Success!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
