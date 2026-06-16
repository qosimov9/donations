"""
FOX DONAT — Telegram Bot
Launches the Mini App via a WebApp button.
Run: python bot.py
"""
import asyncio
import logging
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.filters import Command
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(token="8537389707:AAFVBlyCj0F8DQ_YAKe5EtW15MngKRrnaaw")
dp = Dispatcher()

# ── URL of your deployed Mini App ─────────────────────────────────────────────
MINI_APP_URL = "https://t.me/fox_donatbot"   # ← change to your real URL


@dp.message(Command("start"))
async def cmd_start(message: Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[[
    InlineKeyboardButton(
        text="🎮 Открыть FOX DONAT",
        web_app=WebAppInfo(url="https://google.com")  # <--- Aynan shu qatorni tekshiring!
    )
]])
    await message.answer(
        "🦊 <b>FOX DONAT</b>\n\n"
        "Пополняй баланс и делай донат в любимые игры быстро и безопасно!\n\n"
        "Поддерживаемые игры:\n"
        "🎯 Mobile Legends · PUBG Mobile · Standoff 2\n"
        "🔥 Free Fire · Roblox · Clash of Clans\n"
        "⚽ eFootball · Steam\n\n"
        "Нажми кнопку ниже чтобы открыть приложение:",
        reply_markup=kb,
        parse_mode="HTML",
    )


@dp.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "📖 <b>Помощь</b>\n\n"
        "/start — открыть приложение\n"
        "/balance — проверить баланс\n"
        "/orders — история заказов\n\n"
        "Поддержка: @foxdonat_support",
        parse_mode="HTML",
    )


@dp.message(Command("balance"))
async def cmd_balance(message: Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="💰 Пополнить баланс",
            web_app=WebAppInfo(url=f"{MINI_APP_URL}?tab=topup"),
        )
    ]])
    await message.answer(
        "💳 Откройте приложение для просмотра баланса:",
        reply_markup=kb,
    )


async def main():
    logger.info("Starting FOX DONAT bot...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
