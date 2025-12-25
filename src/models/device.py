import os
from typing import Optional

from pydantic import BaseModel, Field


class Device(BaseModel):
    """Represents a network device details."""

    ip: str = Field(..., description="IP of device")
    port: int = Field(default=22, ge=1, le=65535)
    username: str = Field(default=os.environ.get("DEVICE_DEFAULT_USERNAME", "root"))
    password: Optional[str] = Field(
        default=os.environ.get("DEVICE_DEFAULT_PASSWORD", "root")
    )

    class Config:
        extra = "forbid"
