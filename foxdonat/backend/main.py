"""
FOX DONAT — Telegram Mini App Backend
FastAPI + SQLAlchemy + SQLite (production: PostgreSQL)
"""

from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from contextlib import asynccontextmanager
import hashlib, hmac, json, urllib.parse
from datetime import datetime, timezone
from typing import Optional
import logging

from database import engine, Base, get_db
from models import User, Game, Transaction, GamePackage
from schemas import (
    UserCreate, UserOut,
    TransactionCreate, TransactionOut,
    TopUpRequest, GamePackageOut, GameOut,
    OrderRequest, OrderOut,
    VerifyPlayerRequest, VerifyPlayerOut,
    BalanceOut,
)
from crud import (
    get_or_create_user, get_user_by_telegram_id,
    create_transaction, get_user_transactions,
    top_up_balance, deduct_balance, get_balance,
    get_all_games, get_game_by_id, get_packages_for_game,
    create_order, get_order, get_user_orders,
)
from config import settings
from game_api import GameAPIClient          # ← подключается к реальному API магазина

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# LIFESPAN
# ──────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    from seed import seed_games
    seed_games()
    yield

app = FastAPI(
    title="FOX DONAT API",
    version="1.0.0",
    description="Telegram Mini App — game top-up service",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="backend/templates")
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

# ──────────────────────────────────────────────────────────────────────────────
# TELEGRAM AUTH
# ──────────────────────────────────────────────────────────────────────────────
def verify_telegram_init_data(init_data: str) -> dict:
    """Validate Telegram Web App initData signature."""
    parsed = dict(urllib.parse.parse_qsl(init_data, keep_blank_values=True))
    hash_str = parsed.pop("hash", "")
    data_check = "\n".join(f"{k}={v}" for k, v in sorted(parsed.items()))
    secret = hmac.new(b"WebAppData", settings.BOT_TOKEN.encode(), hashlib.sha256).digest()
    computed = hmac.new(secret, data_check.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(computed, hash_str):
        raise HTTPException(status_code=401, detail="Invalid Telegram signature")
    user_data = json.loads(parsed.get("user", "{}"))
    return user_data


async def get_current_user(
    x_init_data: Optional[str] = Header(None),
    db=Depends(get_db),
):
    if settings.DEBUG and not x_init_data:
        # Dev mode: return test user
        return get_or_create_user(db, telegram_id=999999, username="dev_user", first_name="Dev")
    if not x_init_data:
        raise HTTPException(status_code=401, detail="Missing X-Init-Data header")
    tg_user = verify_telegram_init_data(x_init_data)
    return get_or_create_user(
        db,
        telegram_id=tg_user["id"],
        username=tg_user.get("username"),
        first_name=tg_user.get("first_name", ""),
        last_name=tg_user.get("last_name"),
        language_code=tg_user.get("language_code", "ru"),
    )


# ──────────────────────────────────────────────────────────────────────────────
# MINI APP FRONTEND
# ──────────────────────────────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def serve_mini_app(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# ──────────────────────────────────────────────────────────────────────────────
# USER
# ──────────────────────────────────────────────────────────────────────────────
@app.get("/api/me", response_model=UserOut, tags=["User"])
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@app.get("/api/me/balance", response_model=BalanceOut, tags=["User"])
async def get_my_balance(current_user=Depends(get_current_user), db=Depends(get_db)):
    bal = get_balance(db, current_user.id)
    return {"balance": bal, "currency": "UZS"}


# ──────────────────────────────────────────────────────────────────────────────
# GAMES
# ──────────────────────────────────────────────────────────────────────────────
@app.get("/api/games", response_model=list[GameOut], tags=["Games"])
async def list_games(db=Depends(get_db)):
    return get_all_games(db)


@app.get("/api/games/{game_id}", response_model=GameOut, tags=["Games"])
async def get_game(game_id: str, db=Depends(get_db)):
    game = get_game_by_id(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@app.get("/api/games/{game_id}/packages", response_model=list[GamePackageOut], tags=["Games"])
async def list_packages(game_id: str, db=Depends(get_db)):
    return get_packages_for_game(db, game_id)


# ──────────────────────────────────────────────────────────────────────────────
# VERIFY PLAYER  (calls external game API)
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/api/games/{game_id}/verify-player", response_model=VerifyPlayerOut, tags=["Games"])
async def verify_player(
    game_id: str,
    body: VerifyPlayerRequest,
    current_user=Depends(get_current_user),
):
    """
    Verify a player ID via the game's API.
    Replace GameAPIClient logic in game_api.py with real provider SDK.
    """
    client = GameAPIClient(game_id)
    result = await client.verify_player(body.player_id, body.zone_id)
    return result


# ──────────────────────────────────────────────────────────────────────────────
# TOP-UP BALANCE
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/api/topup", tags=["Payments"])
async def request_topup(
    body: TopUpRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Initiate balance top-up. In production, integrate Payme / Click / Uzcard
    payment gateway here and return a redirect URL or payment token.
    """
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    # PLACEHOLDER: real payment gateway integration goes here
    # e.g. payme_url = await payme_client.create_transaction(amount=body.amount, user_id=current_user.id)
    # For now: immediately credit (dev mode)
    if settings.DEBUG:
        new_balance = top_up_balance(db, current_user.id, body.amount)
        return {"status": "credited", "balance": new_balance, "amount": body.amount}
    return {
        "status": "pending",
        "payment_url": f"https://checkout.example.com/pay?amount={body.amount}&user={current_user.telegram_id}",
        "amount": body.amount,
    }


@app.post("/api/topup/webhook", tags=["Payments"])
async def topup_webhook(request: Request, db=Depends(get_db)):
    """
    Payment gateway webhook. Verify signature and credit balance.
    Implement provider-specific logic here.
    """
    payload = await request.json()
    # TODO: verify webhook signature from payment provider
    user_id = payload.get("user_id")
    amount = payload.get("amount")
    status = payload.get("status")
    if status == "success" and user_id and amount:
        new_balance = top_up_balance(db, user_id, amount)
        return {"ok": True, "balance": new_balance}
    return {"ok": False}


# ──────────────────────────────────────────────────────────────────────────────
# ORDERS  (purchase game items)
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/api/orders", response_model=OrderOut, tags=["Orders"])
async def place_order(
    body: OrderRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Purchase a game package.
    1. Validates package & balance
    2. Deducts balance (or marks as card-payment)
    3. Calls game API to deliver items
    4. Records transaction
    """
    game = get_game_by_id(db, body.game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    packages = get_packages_for_game(db, body.game_id)
    pkg = next((p for p in packages if p.id == body.package_id), None)
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    if body.payment_method == "balance":
        if current_user.balance < pkg.price:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        deduct_balance(db, current_user.id, pkg.price)

    # Call game API to deliver
    client = GameAPIClient(body.game_id)
    delivery = await client.deliver(
        player_id=body.player_id,
        zone_id=body.zone_id,
        package_id=body.package_id,
        promo_code=body.promo_code,
    )

    order = create_order(db, {
        "user_id": current_user.id,
        "game_id": body.game_id,
        "game_name": game.name,
        "package_id": body.package_id,
        "package_amount": pkg.amount,
        "price": pkg.price,
        "player_id": body.player_id,
        "zone_id": body.zone_id,
        "payment_method": body.payment_method,
        "status": delivery.get("status", "processing"),
        "external_order_id": delivery.get("order_id"),
    })
    return order


@app.get("/api/orders", response_model=list[OrderOut], tags=["Orders"])
async def list_orders(current_user=Depends(get_current_user), db=Depends(get_db)):
    return get_user_orders(db, current_user.id)


@app.get("/api/orders/{order_id}", response_model=OrderOut, tags=["Orders"])
async def get_order_detail(
    order_id: int,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    order = get_order(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.get("/api/orders/{order_id}/status", tags=["Orders"])
async def check_order_status(
    order_id: int,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Poll the game API for delivery status."""
    order = get_order(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.external_order_id:
        client = GameAPIClient(order.game_id)
        status = await client.check_status(order.external_order_id)
        return {"order_id": order_id, "status": status}
    return {"order_id": order_id, "status": order.status}


# ──────────────────────────────────────────────────────────────────────────────
# HEALTH
# ──────────────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "service": "fox-donat", "timestamp": datetime.now(timezone.utc).isoformat()}
