from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, JSON, Text
from sqlalchemy.orm import relationship
from .database import Base

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    bank_name = Column(String, nullable=False)
    card_name = Column(String, nullable=False)
    last_four = Column(String, nullable=False)
    bill_date = Column(Integer, default=1)

    rules = relationship("Rule", back_populates="card", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="card", cascade="all, delete-orphan")

class Rule(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    name = Column(String, nullable=False)
    rate = Column(Float, default=0.0)
    cap = Column(Float, nullable=True)
    rule_json = Column(JSON, nullable=False)

    card = relationship("Card", back_populates="rules")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    raw_name = Column(String, nullable=False)
    clean_name = Column(String, nullable=True)
    category = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    trans_date = Column(Date, nullable=False)
    cashback = Column(Float, default=0.0)

    card = relationship("Card", back_populates="transactions")

class Vault(Base):
    __tablename__ = "vault"

    bank_name = Column(String, primary_key=True)
    enc_pwd = Column(Text, nullable=False)
