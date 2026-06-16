"""Seed initial games and packages into the database."""
from database import SessionLocal
from models import Game, GamePackage


GAMES = [
    {
        "id": "mobile-legends",
        "name": "MOBILE LEGENDS",
        "category": "MOBA",
        "image_url": "/static/images/games/moba.png",
        "hero_image_url": "/static/images/games/hero-banner.png",
        "is_popular": True,
        "requires_zone_id": True,
        "description": "Пополни алмазы Mobile Legends быстро и безопасно.",
        "api_provider": "smileone",
        "api_product_code": "MOBILELEGENDS",
        "sort_order": 1,
    },
    {
        "id": "pubg-mobile",
        "name": "PUBG MOBILE",
        "category": "Battle Royale",
        "image_url": "/static/images/games/battle-royale.png",
        "is_popular": True,
        "requires_zone_id": False,
        "description": "UC для PUBG Mobile по лучшим ценам в Узбекистане.",
        "api_provider": "midasbuy",
        "api_product_code": "PUBGMOBILE",
        "sort_order": 2,
    },
    {
        "id": "standoff-2",
        "name": "STANDOFF 2",
        "category": "Шутер",
        "image_url": "/static/images/games/fps.png",
        "is_popular": True,
        "requires_zone_id": False,
        "description": "Золото Standoff 2 с мгновенной доставкой.",
        "api_provider": "gaijin",
        "sort_order": 3,
    },
    {
        "id": "free-fire",
        "name": "FREE FIRE",
        "category": "Battle Royale",
        "image_url": "/static/images/games/survival.png",
        "is_popular": True,
        "requires_zone_id": False,
        "description": "Алмазы Free Fire по выгодным ценам.",
        "api_provider": "smileone",
        "api_product_code": "FREEFIRE",
        "sort_order": 4,
    },
    {
        "id": "roblox",
        "name": "ROBLOX",
        "category": "Песочница",
        "image_url": "/static/images/games/sandbox.png",
        "is_popular": False,
        "requires_zone_id": False,
        "description": "Robux для Roblox с гарантией.",
        "api_provider": "xsolla",
        "sort_order": 5,
    },
    {
        "id": "clash-of-clans",
        "name": "CLASH OF CLANS",
        "category": "Стратегия",
        "image_url": "/static/images/games/strategy.png",
        "is_popular": False,
        "requires_zone_id": False,
        "description": "Самоцветы Clash of Clans.",
        "api_provider": "supercell",
        "sort_order": 6,
    },
    {
        "id": "e-football",
        "name": "E FOOTBALL",
        "category": "Спорт",
        "image_url": "/static/images/games/football.png",
        "is_popular": False,
        "requires_zone_id": False,
        "description": "Монеты eFootball для покупок в игре.",
        "api_provider": "konami",
        "sort_order": 7,
    },
    {
        "id": "steam",
        "name": "STEAM",
        "category": "Платформа",
        "image_url": "/static/images/games/store.png",
        "is_popular": False,
        "requires_zone_id": False,
        "description": "Пополнение Steam кошелька.",
        "api_provider": "xsolla",
        "sort_order": 8,
    },
]

PACKAGES = {
    "mobile-legends": [
        ("ml-1",  "Weekly Diamond Pass",  "38000",  None,      True,  1),
        ("ml-2",  "Twilight Pass",         "89000",  None,      False, 2),
        ("ml-3",  "275 Алмазов",           "65000",  None,      True,  3),
        ("ml-4",  "550+50 Алмазов",        "120000", "+50",     False, 4),
        ("ml-5",  "1100+150 Алмазов",      "230000", "+150",    False, 5),
        ("ml-6",  "2195+260 Алмазов",      "450000", "+260",    False, 6),
        ("ml-7",  "3688+660 Алмазов",      "720000", "+660",    False, 7),
        ("ml-8", "5532+1048 Алмазов", "1050000", "starlight", True, 8),
    ],
    "pubg-mobile": [
        ("pm-1", "60 UC",      "25000",  None,   False, 1),
        ("pm-2", "325 UC",     "115000", None,   True,  2),
        ("pm-3", "660 UC",     "225000", None,   False, 3),
        ("pm-4", "1800 UC",    "600000", None,   False, 4),
        ("pm-5", "3850+500 UC","1200000","+500", False, 5),
        ("pm-6", "8100+900 UC","2400000","+900", False, 6),
    ],
    "standoff-2": [
        ("so-1", "35 Золота",   "15000",  None,  False, 1),
        ("so-2", "120 Золота",  "45000",  None,  True,  2),
        ("so-3", "280 Золота",  "95000",  None,  False, 3),
        ("so-4", "620 Золота",  "200000", None,  False, 4),
        ("so-5", "1400 Золота", "440000", None,  False, 5),
        ("so-6", "3200 Золота", "950000", None,  False, 6),
    ],
    "free-fire": [
        ("ff-1", "100 Алмазов",  "27000",  None,  False, 1),
        ("ff-2", "310 Алмазов",  "80000",  None,  True,  2),
        ("ff-3", "520 Алмазов",  "130000", None,  False, 3),
        ("ff-4", "1060 Алмазов", "255000", None,  False, 4),
        ("ff-5", "2180 Алмазов", "500000", None,  False, 5),
    ],
    "roblox": [
        ("rb-1", "400 Robux",  "65000",  None,  False, 1),
        ("rb-2", "800 Robux",  "120000", None,  True,  2),
        ("rb-3", "1700 Robux", "240000", None,  False, 3),
        ("rb-4", "4500 Robux", "600000", None,  False, 4),
    ],
    "clash-of-clans": [
        ("coc-1", "80 Самоцветов",   "18000",  None,  False, 1),
        ("coc-2", "500 Самоцветов",  "95000",  None,  True,  2),
        ("coc-3", "1200 Самоцветов", "220000", None,  False, 3),
        ("coc-4", "2500 Самоцветов", "440000", None,  False, 4),
        ("coc-5", "6500 Самоцветов", "1100000",None,  False, 5),
    ],
    "e-football": [
        ("ef-1", "1000 Монет",  "35000",  None,  False, 1),
        ("ef-2", "2500 Монет",  "80000",  None,  True,  2),
        ("ef-3", "6000 Монет",  "180000", None,  False, 3),
    ],
    "steam": [
        ("st-1", "$5 Steam",   "65000",  None,  False, 1),
        ("st-2", "$10 Steam",  "125000", None,  True,  2),
        ("st-3", "$20 Steam",  "245000", None,  False, 3),
        ("st-4", "$50 Steam",  "610000", None,  False, 4),
        ("st-5", "$100 Steam", "1200000",None,  False, 5),
    ],
}


def seed_games():
    db = SessionLocal()
    try:
        for g in GAMES:
            if not db.query(Game).filter(Game.id == g["id"]).first():
                db.add(Game(**g))

        for game_id, pkgs in PACKAGES.items():
            for pkg in pkgs:
                pkg_id, amount, price_str, bonus, is_popular, sort = pkg
                price = float(price_str.replace(",", ""))
                if not db.query(GamePackage).filter(GamePackage.id == pkg_id).first():
                    db.add(GamePackage(
                        id=pkg_id,
                        game_id=game_id,
                        amount=amount,
                        price=price,
                        bonus=bonus,
                        is_popular=is_popular,
                        sort_order=sort,
                    ))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()
