from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.database import get_db
from ..models.models import Transaction
from ..schemas.schemas import Transaction as TransactionSchema
from typing import List

router = APIRouter()

@router.get("/transactions", response_model=List[TransactionSchema])
async def get_transactions(db: AsyncSession = Depends(get_db)):
    stmt = select(Transaction).order_by(Transaction.trans_date.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
