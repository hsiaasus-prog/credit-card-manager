from pydantic import BaseModel
from datetime import date
from typing import Optional, List, Dict

class TransactionBase(BaseModel):
    card_id: int
    raw_name: str
    clean_name: Optional[str] = None
    category: Optional[str] = None
    amount: float
    trans_date: date
    cashback: float = 0.0

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int

    class Config:
        from_attributes = True

class CardBase(BaseModel):
    bank_name: str
    card_name: str
    last_four: str
    bill_date: int = 1

class CardCreate(CardBase):
    pass

class Card(CardBase):
    id: int
    
    class Config:
        from_attributes = True

class RuleBase(BaseModel):
    card_id: int
    name: str
    rate: float
    cap: Optional[float] = None
    rule_json: Dict

class RuleCreate(RuleBase):
    pass

class Rule(RuleBase):
    id: int

    class Config:
        from_attributes = True

class VaultEntry(BaseModel):
    bank_name: str
    password: str

class MerchantInfo(BaseModel):
    clean_name: str
    category: str
    is_online: bool
