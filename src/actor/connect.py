import asyncio
from typing import Optional

import asyncssh

from src.utils.constants import SSH_CONNECTION_TIMEOUT
from src.input.loader import Device


class SSHClient:
    """
    An asynchronous SSH client for connecting to remote devices
    """

    def __init__(self, device: Device):
        self.device = device
        self._conn: Optional[asyncssh.SSHClientConnection] = None

    async def connect(self, timeout: int = SSH_CONNECTION_TIMEOUT):
        """Establish SSH connection."""
        if self._conn and not self._conn.is_closed():
            return

        self._conn = await asyncio.wait_for(
            asyncssh.connect(
                host=self.device.ip,
                port=self.device.port,
                username=self.device.username,
                password=self.device.password,
                known_hosts=None,
            ),
            timeout=timeout,
        )

    async def disconnect(self):
        """Close SSH connection."""
        if self._conn and not self._conn.is_closed():
            self._conn.close()
            await self._conn.wait_closed()
        self._conn = None

    async def run_command(
        self, command: str, timeout: int = SSH_CONNECTION_TIMEOUT
    ) -> tuple[str, str, int]:
        """Execute a command and return (stdout, stderr, exit_code)."""
        if not self._conn or self._conn.is_closed():
            raise RuntimeError("Not connected. Call connect() first.")

        result = await asyncio.wait_for(self._conn.run(command), timeout=timeout)
        return result.stdout, result.stderr, result.exit_status

    async def __aenter__(self):
        """Context manager entry."""
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        await self.disconnect()
