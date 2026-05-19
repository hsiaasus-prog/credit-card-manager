from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.database import get_db
from ..models.models import Vault
from ..schemas.schemas import VaultEntry
from ..core.security import encrypt_password

router = APIRouter()

@router.post("/vault")
async def update_vault(entry: VaultEntry, db: AsyncSession = Depends(get_db)):
    # Check if exists
    stmt = select(Vault).where(Vault.bank_name == entry.bank_name)
    result = await db.execute(stmt)
    db_entry = result.scalar_one_or_none()
    
    enc_pwd = encrypt_password(entry.password)
    
    if db_entry:
        db_entry.enc_pwd = enc_pwd
    else:
        db_entry = Vault(bank_name=entry.bank_name, enc_pwd=enc_pwd)
        db.add(db_entry)
    
    await db.commit()
    return {"message": "Vault updated successfully"}

@router.get("/vault")
async def get_vault_banks(db: AsyncSession = Depends(get_db)):
    stmt = select(Vault.bank_name)
    result = await db.execute(stmt)
    return result.scalars().all()
