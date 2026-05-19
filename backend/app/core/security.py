from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not found in environment variables")

cipher_suite = Fernet(SECRET_KEY.encode())

def encrypt_password(password: str) -> str:
    """Encrypt a password using Fernet."""
    return cipher_suite.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    """Decrypt a password using Fernet."""
    return cipher_suite.decrypt(encrypted_password.encode()).decode()
