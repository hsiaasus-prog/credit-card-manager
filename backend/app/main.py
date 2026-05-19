from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .models.database import engine, Base
from .api import upload, dashboard, suggest, vault, cards, transactions

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup on shutdown
    await engine.dispose()

app = FastAPI(title="AI Credit Card Manager", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "AI Credit Card Manager API is running"}

# Include routers
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(suggest.router, prefix="/api", tags=["suggest"])
app.include_router(vault.router, prefix="/api", tags=["vault"])
app.include_router(cards.router, prefix="/api", tags=["cards"])
app.include_router(transactions.router, prefix="/api", tags=["transactions"])
