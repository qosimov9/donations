"""
Game API Client — integration layer for external game top-up providers.

Replace the stub implementations with real provider SDKs:
  - Smile One  (Mobile Legends, Free Fire)
  - Midasbuy   (PUBG Mobile)
  - Codashop   (multiple games)
  - Xsolla     (Steam Wallet, etc.)
  - Custom APIs per game publisher

Each provider typically requires:
  1. API key / merchant credentials (set in .env)
  2. POST request to create an order
  3. Webhook or polling to confirm delivery
"""

import httpx
import logging
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)


class GameAPIClient:
    """
    Unified client for all game top-up providers.
    Dispatches to the correct provider based on game_id.
    """

    # Map game_id → provider name (configure in DB or settings)
    PROVIDER_MAP = {
        "mobile-legends": "smileone",
        "free-fire":      "smileone",
        "pubg-mobile":    "midasbuy",
        "standoff-2":     "gaijin",
        "roblox":         "xsolla",
        "clash-of-clans": "supercell",
        "e-football":     "konami",
        "steam":          "xsolla",
    }

    def __init__(self, game_id: str):
        self.game_id = game_id
        self.provider = self.PROVIDER_MAP.get(game_id, "generic")

    # ─────────────────────────────────────────────────────────────────────────
    # PUBLIC METHODS
    # ─────────────────────────────────────────────────────────────────────────
    async def verify_player(self, player_id: str, zone_id: Optional[str] = None) -> dict:
        """
        Verify a player exists in the game.
        Returns dict: { found: bool, player_name: str, region: str }
        """
        if self.provider == "smileone":
            return await self._smileone_verify(player_id, zone_id)
        if self.provider == "midasbuy":
            return await self._midasbuy_verify(player_id, zone_id)
        # Fallback stub for unimplemented providers
        return self._stub_verify(player_id, zone_id)

    async def deliver(
        self,
        player_id: str,
        package_id: str,
        zone_id: Optional[str] = None,
        promo_code: Optional[str] = None,
    ) -> dict:
        """
        Deliver a game package to a player.
        Returns dict: { status: str, order_id: str }
        """
        if self.provider == "smileone":
            return await self._smileone_deliver(player_id, zone_id, package_id, promo_code)
        if self.provider == "midasbuy":
            return await self._midasbuy_deliver(player_id, zone_id, package_id)
        return self._stub_deliver(player_id, package_id)

    async def check_status(self, external_order_id: str) -> str:
        """Poll delivery status from provider. Returns: processing | success | failed"""
        if self.provider == "smileone":
            return await self._smileone_status(external_order_id)
        return "success"   # stub

    # ─────────────────────────────────────────────────────────────────────────
    # SMILE ONE  (Mobile Legends, Free Fire)
    # https://www.smile.one/merchant/
    # ─────────────────────────────────────────────────────────────────────────
    async def _smileone_verify(self, player_id: str, zone_id: Optional[str]) -> dict:
        """
        POST https://www.smile.one/merchant/api/roleid
        Required: uid, zoneid, productid, merchant_code, sign
        """
        # TODO: implement real Smile.One signature & POST
        # Stub response for development:
        return {
            "found": True,
            "player_name": "AIZEN",
            "region": "UZ",
            "message": None,
        }

    async def _smileone_deliver(self, player_id, zone_id, package_id, promo_code) -> dict:
        """
        POST https://www.smile.one/merchant/api/order
        Required: uid, zoneid, productid, num, merchant_code, sign
        """
        # TODO: implement real Smile.One order creation
        return {"status": "processing", "order_id": f"SMO-{player_id}-{package_id}"}

    async def _smileone_status(self, order_id: str) -> str:
        """GET https://www.smile.one/merchant/api/getorder"""
        # TODO: implement real status check
        return "success"

    # ─────────────────────────────────────────────────────────────────────────
    # MIDASBUY  (PUBG Mobile)
    # https://www.midasbuy.com/midasbuy/ug/partner/
    # ─────────────────────────────────────────────────────────────────────────
    async def _midasbuy_verify(self, player_id: str, zone_id: Optional[str]) -> dict:
        """
        Midasbuy: verify player via their partner API.
        Endpoint & signature scheme documented in Midasbuy Partner Portal.
        """
        # TODO: implement real Midasbuy verification
        return {
            "found": True,
            "player_name": f"Player_{player_id[-4:]}",
            "region": "UZ",
            "message": None,
        }

    async def _midasbuy_deliver(self, player_id, zone_id, package_id) -> dict:
        """TODO: implement real Midasbuy order"""
        return {"status": "processing", "order_id": f"MDB-{player_id}-{package_id}"}

    # ─────────────────────────────────────────────────────────────────────────
    # STUB (fallback for games without a real integration yet)
    # ─────────────────────────────────────────────────────────────────────────
    def _stub_verify(self, player_id: str, zone_id: Optional[str]) -> dict:
        logger.warning(f"[STUB] verify_player called for provider={self.provider} game={self.game_id}")
        return {
            "found": len(player_id) >= 6,
            "player_name": f"User_{player_id[-4:]}",
            "region": "UZ",
            "message": "Stub mode — configure real API in game_api.py",
        }

    def _stub_deliver(self, player_id: str, package_id: str) -> dict:
        logger.warning(f"[STUB] deliver called for provider={self.provider} game={self.game_id}")
        return {
            "status": "processing",
            "order_id": f"STUB-{self.game_id}-{player_id}-{package_id}",
        }
