"""SQLAlchemy ORM models for FOX DONAT."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True, nullable=False)
    username = Column(String(64), nullable=True)
    first_name = Column(String(64), nullable=False, default="")
    last_name = Column(String(64), nullable=True)
    language_code = Column(String(8), default="ru")
    balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    notifications_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    orders = relationship("Order", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")


class Game(Base):
    __tablename__ = "games"

    id = Column(String(64), primary_key=True)          # e.g. "mobile-legends"
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=True)
    image_url = Column(String(256), nullable=True)
    hero_image_url = Column(String(256), nullable=True)
    is_popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    description = Column(Text, nullable=True)
    requires_zone_id = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    # API integration
    api_provider = Column(String(64), nullable=True)   # e.g. "smileone", "codashop", "midasbuy"
    api_product_code = Column(String(128), nullable=True)

    packages = relationship("GamePackage", back_populates="game", order_by="GamePackage.price")
    orders = relationship("Order", back_populates="game")


class GamePackage(Base):
    __tablename__ = "game_packages"

    id = Column(String(64), primary_key=True)          # e.g. "ml-weekly"
    game_id = Column(String(64), ForeignKey("games.id"), nullable=False)
    amount = Column(String(64), nullable=False)         # e.g. "Weekly Diamond Pass"
    price = Column(Float, nullable=False)               # in UZS
    bonus = Column(String(64), nullable=True)           # e.g. "+50 bonus"
    is_popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    game = relationship("Game", back_populates="packages")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(String(64), ForeignKey("games.id"), nullable=False)
    game_name = Column(String(128))
    package_id = Column(String(64))
    package_amount = Column(String(64))
    price = Column(Float, nullable=False)
    player_id = Column(String(64))
    zone_id = Column(String(32), nullable=True)
    payment_method = Column(String(32))                 # balance | uzcard | payme | click
    status = Column(String(32), default="processing")  # processing | success | failed | cancelled
    external_order_id = Column(String(128), nullable=True)  # ID from game provider API
    promo_code = Column(String(64), nullable=True)
    discount = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    game = relationship("Game", back_populates="orders")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(32))                           # topup | deduct | refund
    amount = Column(Float, nullable=False)
    balance_before = Column(Float)
    balance_after = Column(Float)
    description = Column(String(256), nullable=True)
    payment_provider = Column(String(64), nullable=True)
    payment_ref = Column(String(128), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions")
