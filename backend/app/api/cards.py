from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.database import get_db
from ..models.models import Card, Rule
from ..schemas.schemas import CardCreate, Card as CardSchema, RuleCreate, Rule as RuleSchema
from typing import List

router = APIRouter()

@router.get("/cards", response_model=List[CardSchema])
async def get_cards(db: AsyncSession = Depends(get_db)):
    stmt = select(Card)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/cards", response_model=CardSchema)
async def create_card(card: CardCreate, db: AsyncSession = Depends(get_db)):
    db_card = Card(**card.model_dump())
    db.add(db_card)
    await db.commit()
    await db.refresh(db_card)
    return db_card

@router.post("/rules", response_model=RuleSchema)
async def create_rule(rule: RuleCreate, db: AsyncSession = Depends(get_db)):
    db_rule = Rule(**rule.model_dump())
    db.add(db_rule)
    await db.commit()
    await db.refresh(db_rule)
    return db_rule
