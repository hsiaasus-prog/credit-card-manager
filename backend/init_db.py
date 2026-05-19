import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.models.database import Base, DATABASE_URL
from app.models.models import Card, Rule

async def init_data():
    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        # Add sample cards
        cards = [
            Card(bank_name="esun", card_name="玉山 U Bear", last_four="1234"),
            Card(bank_name="ctbc", card_name="中信 LINE Pay", last_four="5678"),
            Card(bank_name="taishin", card_name="台新 @GoGo", last_four="9012"),
        ]
        session.add_all(cards)
        await session.flush()
        
        # Add sample rules
        rules = [
            Rule(card_id=cards[0].id, name="網購加碼", rate=0.03, rule_json={"categories": ["網購"], "keywords": ["蝦皮", "PChome"]}),
            Rule(card_id=cards[1].id, name="一般消費", rate=0.01, rule_json={"categories": ["其他"]}),
            Rule(card_id=cards[2].id, name="數位通路", rate=0.038, rule_json={"categories": ["網購", "樂"], "keywords": ["Netflix", "Spotify"]}),
        ]
        session.add_all(rules)
        await session.commit()
    print("Initial data seeded.")

if __name__ == "__main__":
    asyncio.run(init_data())
