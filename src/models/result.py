from typing import List, Optional
from pydantic import BaseModel, Field

from src.models.command import CommandResult


class DeviceResult(BaseModel):
    """Store results for a single device."""

    ip: str = Field(..., description="IP address of the device")
    port: int = Field(default=22, description="SSH port")
    username: str = Field(..., description="SSH username")
    connected: bool = Field(default=False, description="Whether connection succeeded")
    connection_error: Optional[str] = Field(
        default=None, description="Error message if connection failed"
    )
    commands: List[CommandResult] = Field(
        default_factory=list, description="Results of executed commands"
    )

    class Config:
        extra = "forbid"
