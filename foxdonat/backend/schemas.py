"""Pydantic request/response schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── User ─────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: str = ""
    last_name: Optional[str] = None
    language_code: str = "ru"


class UserOut(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str]
    first_name: str
    last_name: Optional[str]
    balance: float
    notifications_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class BalanceOut(BaseModel):
    balance: float
    currency: str = "UZS"


# ── Games ────────────────────────────────────────────────────────────────────
class GamePackageOut(BaseModel):
    id: str
    game_id: str
    amount: str
    price: float
    bonus: Optional[str]
    is_popular: bool

    class Config:
        from_attributes = True


class GameOut(BaseModel):
    id: str
    name: str
    category: Optional[str]
    image_url: Optional[str]
    hero_image_url: Optional[str]
    is_popular: bool
    description: Optional[str]
    requires_zone_id: bool
    packages: list[GamePackageOut] = []

    class Config:
        from_attributes = True


# ── Player Verify ─────────────────────────────────────────────────────────────
class VerifyPlayerRequest(BaseModel):
    player_id: str
    zone_id: Optional[str] = None


class VerifyPlayerOut(BaseModel):
    found: bool
    player_name: Optional[str] = None
    region: Optional[str] = None
    message: Optional[str] = None


# ── Top-up ────────────────────────────────────────────────────────────────────
class TopUpRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in UZS")
    payment_method: str = Field("uzcard", description="humo | uzcard | payme | click | visa")


# ── Orders ────────────────────────────────────────────────────────────────────
class OrderRequest(BaseModel):
    game_id: str
    package_id: str
    player_id: str
    zone_id: Optional[str] = None
    payment_method: str = "balance"   # balance | uzcard | payme | click
    promo_code: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    game_id: str
    game_name: str
    package_id: str
    package_amount: str
    price: float
    player_id: str
    zone_id: Optional[str]
    payment_method: str
    status: str
    external_order_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Transactions ──────────────────────────────────────────────────────────────
class TransactionCreate(BaseModel):
    type: str
    amount: float
    description: Optional[str] = None


class TransactionOut(BaseModel):
    id: int
    type: str
    amount: float
    balance_before: float
    balance_after: float
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
