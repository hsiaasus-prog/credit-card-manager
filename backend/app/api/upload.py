from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import shutil
import os
from ..models.database import get_db
from ..models.models import Card, Transaction, Vault
from ..services.pdf_handler import PDFProcessor
from ..services.ai_service import clean_merchant_data
from ..core.security import decrypt_password

from ..services.rule_engine import RuleEngine

router = APIRouter()
pdf_processor = PDFProcessor()
rule_engine = RuleEngine()

@router.post("/upload")
async def upload_pdf(
    bank_name: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # Save uploaded file temporarily
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Get password from Vault
        stmt = select(Vault).where(Vault.bank_name == bank_name)
        result = await db.execute(stmt)
        vault_entry = result.scalar_one_or_none()
        password = decrypt_password(vault_entry.enc_pwd) if vault_entry else None

        # Extract data
        raw_transactions = pdf_processor.extract_data(file_path, bank_name, password)
        
        if not raw_transactions:
            return {"message": "No transactions found or decryption failed", "count": 0}

        # Find card or create a default one for this bank
        from sqlalchemy.orm import selectinload
        stmt = select(Card).where(Card.bank_name == bank_name).options(selectinload(Card.rules))
        result = await db.execute(stmt)
        card = result.scalar_one_or_none()
        if not card:
            # Create a dummy card if none exists
            card = Card(bank_name=bank_name, card_name="Default", last_four="0000")
            db.add(card)
            await db.flush() # Get card ID
            card_rules = []
        else:
            card_rules = card.rules

        new_transactions = []
        for raw in raw_transactions:
            # Clean with AI
            ai_info = await clean_merchant_data(raw["raw_name"])
            
            # Create a temporary transaction object for calculation
            temp_trans = Transaction(
                card_id=card.id,
                raw_name=raw["raw_name"],
                clean_name=ai_info.clean_name,
                category=ai_info.category,
                amount=raw["amount"],
                trans_date=raw["trans_date"]
            )
            
            # Calculate cashback
            cashback = rule_engine.calculate_cashback(temp_trans, card_rules)
            temp_trans.cashback = cashback
            
            db.add(temp_trans)
            new_transactions.append(temp_trans)

        await db.commit()
        return {
            "message": f"Successfully processed {len(new_transactions)} transactions",
            "count": len(new_transactions)
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
