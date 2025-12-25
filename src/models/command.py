from pydantic import BaseModel, Field


class CommandResult(BaseModel):
    """Result of a single command execution."""

    command: str = Field(..., description="The command that was executed")
    stdout: str = Field(default="", description="Standard output from command")
    stderr: str = Field(default="", description="Standard error from command")
    exit_code: int = Field(..., description="Command exit code")
    success: bool = Field(..., description="Whether command succeeded")
