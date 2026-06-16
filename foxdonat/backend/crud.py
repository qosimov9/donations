"""CRUD database operations."""
from sqlalchemy.orm import Session
from models import User, Game, GamePackage, Order, Transaction
from typing import Optional


# ── Users ─────────────────────────────────────────────────────────────────────
def get_or_create_user(
    db: Session,
    telegram_id: int,
    username: Optional[str] = None,
    first_name: str = "",
    last_name: Optional[str] = None,
    language_code: str = "ru",
) -> User:
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if user:
        # update fields that may change
        user.username = username
        user.first_name = first_name
        user.last_name = last_name
        db.commit()
        db.refresh(user)
        return user
    user = User(
        telegram_id=telegram_id,
        username=username,
        first_name=first_name,
        last_name=last_name,
        language_code=language_code,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_telegram_id(db: Session, telegram_id: int) -> Optional[User]:
    return db.query(User).filter(User.telegram_id == telegram_id).first()


def get_balance(db: Session, user_id: int) -> float:
    user = db.query(User).filter(User.id == user_id).first()
    return user.balance if user else 0.0


def top_up_balance(db: Session, user_id: int, amount: float) -> float:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    before = user.balance
    user.balance += amount
    db.commit()
    # record transaction
    tx = Transaction(
        user_id=user_id,
        type="topup",
        amount=amount,
        balance_before=before,
        balance_after=user.balance,
        description=f"Пополнение баланса на {amount:,.0f} UZS",
    )
    db.add(tx)
    db.commit()
    return user.balance


def deduct_balance(db: Session, user_id: int, amount: float) -> float:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    before = user.balance
    user.balance = max(0, user.balance - amount)
    tx = Transaction(
        user_id=user_id,
        type="deduct",
        amount=amount,
        balance_before=before,
        balance_after=user.balance,
        description=f"Списание {amount:,.0f} UZS",
    )
    db.add(tx)
    db.commit()
    return user.balance


# ── Games ─────────────────────────────────────────────────────────────────────
def get_all_games(db: Session) -> list[Game]:
    return (
        db.query(Game)
        .filter(Game.is_active == True)
        .order_by(Game.sort_order, Game.name)
        .all()
    )


def get_game_by_id(db: Session, game_id: str) -> Optional[Game]:
    return db.query(Game).filter(Game.id == game_id, Game.is_active == True).first()


def get_packages_for_game(db: Session, game_id: str) -> list[GamePackage]:
    return (
        db.query(GamePackage)
        .filter(GamePackage.game_id == game_id, GamePackage.is_active == True)
        .order_by(GamePackage.sort_order, GamePackage.price)
        .all()
    )


# ── Orders ────────────────────────────────────────────────────────────────────
def create_order(db: Session, data: dict) -> Order:
    order = Order(**data)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_order(db: Session, order_id: int) -> Optional[Order]:
    return db.query(Order).filter(Order.id == order_id).first()


def get_user_orders(db: Session, user_id: int) -> list[Order]:
    return (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .limit(50)
        .all()
    )


# ── Transactions ──────────────────────────────────────────────────────────────
def create_transaction(db: Session, data: dict) -> Transaction:
    tx = Transaction(**data)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


def get_user_transactions(db: Session, user_id: int, limit: int = 30) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .limit(limit)
        .all()
    )
