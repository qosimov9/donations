# 🦊 FOX DONAT — Telegram Mini App

O'yinlarga donat qilish uchun professional Telegram Mini App.

## Arxitektura

```
foxdonat/
├── backend/
│   ├── main.py          ← FastAPI app (API + Mini App server)
│   ├── bot.py           ← Telegram bot (aiogram 3)
│   ├── models.py        ← SQLAlchemy models
│   ├── schemas.py       ← Pydantic schemas
│   ├── crud.py          ← Database operations
│   ├── game_api.py      ← Game API integrations
│   ├── config.py        ← Settings (.env)
│   ├── database.py      ← DB engine & sessions
│   ├── seed.py          ← Initial games & packages
│   ├── templates/
│   │   └── index.html   ← Mini App HTML
│   └── static/
│       ├── css/app.css  ← All styles (FOX DONAT design)
│       └── js/app.js    ← Frontend logic + API calls
├── docker-compose.yml
└── .env.example
```

## Tez ishga tushirish (dev mode)

```bash
cd backend

# 1. Virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Dependencies
pip install -r requirements.txt

# 3. Environment
cp ../.env.example .env
# .env faylini oching va BOT_TOKEN ni to'ldiring

# 4. Run
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs  
Mini App: http://localhost:8000/

## Botni ishga tushirish

```bash
python bot.py
```

## Docker (production)

```bash
cp .env.example .env
# .env ni to'ldiring

docker compose up -d
```

## API yo'llari

| Method | URL | Tavsif |
|--------|-----|--------|
| GET  | /api/me | Joriy foydalanuvchi |
| GET  | /api/me/balance | Balans |
| GET  | /api/games | Barcha o'yinlar |
| GET  | /api/games/{id}/packages | O'yin paketlari |
| POST | /api/games/{id}/verify-player | Oyinchi ID tekshirish |
| POST | /api/topup | Balans to'ldirish |
| POST | /api/topup/webhook | To'lov webhook |
| POST | /api/orders | Buyurtma qo'shish |
| GET  | /api/orders | Buyurtmalar tarixi |
| GET  | /api/orders/{id}/status | Buyurtma holati |

## O'yin API integratsiyasi

`backend/game_api.py` faylida har bir provider uchun joy bor:

- **Smile.One** → Mobile Legends, Free Fire  
  https://www.smile.one/merchant/ → ro'yxatdan o'ting, `SMILEONE_MERCHANT_CODE` va `SMILEONE_MERCHANT_KEY` ni oling

- **Midasbuy** → PUBG Mobile  
  https://www.midasbuy.com/midasbuy/ug/partner/

- **Xsolla** → Steam, Roblox
- **Codashop** → ko'p o'yinlar

Hozircha stub (demo) rejimda ishlaydi — real API kalitlarini `.env` ga qo'shganingizdan so'ng `game_api.py` ichidagi `# TODO` qismlarini to'ldiring.

## To'lov tizimlari

`main.py` → `/api/topup` endpointiga Payme yoki Click SDK integratsiyasini qo'shing:

- **Payme**: https://developer.payme.uz
- **Click**: https://docs.click.uz
- **Uzcard/HUMO**: to'g'ridan-to'g'ri bank API (litsenziya talab qiladi)

## Rasmlar

`backend/static/images/games/` papkasiga o'yin logolarini qo'shing:
- `moba.png` — Mobile Legends
- `battle-royale.png` — PUBG Mobile
- `fps.png` — Standoff 2
- `survival.png` — Free Fire
- `sandbox.png` — Roblox
- `strategy.png` — Clash of Clans
- `football.png` — eFootball
- `store.png` — Steam
