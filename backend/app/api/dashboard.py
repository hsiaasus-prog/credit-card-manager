from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..models.database import get_db
from ..models.models import Transaction, Card

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    # Total Spending
    stmt = select(func.sum(Transaction.amount))
    result = await db.execute(stmt)
    total_spending = result.scalar() or 0.0

    # Total Cashback
    stmt = select(func.sum(Transaction.cashback))
    result = await db.execute(stmt)
    total_cashback = result.scalar() or 0.0

    # Spending by Category
    stmt = select(Transaction.category, func.sum(Transaction.amount)).group_by(Transaction.category)
    result = await db.execute(stmt)
    category_spending = [{"category": row[0] or "Other", "amount": row[1]} for row in result.all()]

    # Cashback by Card
    stmt = select(Card.card_name, func.sum(Transaction.cashback)).join(Transaction).group_by(Card.card_name)
    result = await db.execute(stmt)
    card_cashback = [{"card_name": row[0], "cashback": row[1]} for row in result.all()]

    return {
        "total_spending": total_spending,
        "total_cashback": total_cashback,
        "category_spending": category_spending,
        "card_cashback": card_cashback
    }
