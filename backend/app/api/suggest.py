from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..models.database import get_db
from ..models.models import Card, Rule
from ..services.rule_engine import RuleEngine

router = APIRouter()
rule_engine = RuleEngine()

@router.get("/suggest")
async def suggest_card(merchant: str, db: AsyncSession = Depends(get_db)):
    # Fetch all cards and their rules
    stmt = select(Card).options(selectinload(Card.rules))
    result = await db.execute(stmt)
    cards = result.scalars().all()
    
    cards_with_rules = [{"card": c, "rules": c.rules} for c in cards]
    
    suggestion = rule_engine.suggest_best_card(merchant, cards_with_rules)
    return suggestion
