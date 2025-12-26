import asyncio
from typing import List

from apify import Actor

from src.input.loader import Device
from src.actor.connect import SSHClient
from src.utils.constants import RUN_COMMANDS
from src.models.command import CommandResult
from src.models.result import DeviceResult


async def execute_commands_on_device(device: Device, commands: List[str]) -> DeviceResult:
    """
    Execute all commands on a single device
    """
    result = DeviceResult(ip=device.ip, port=device.port, username=device.username)

    try:
        Actor.log.info(f"Connecting to {device.ip}:{device.port}...")

        async with SSHClient(device) as client:
            result.connected = True
            Actor.log.info(f"✓ Connected to {device.ip}")

            for command in commands:
                try:
                    Actor.log.info(f"Running on {device.ip}: {command}")
                    stdout, stderr, exit_code = await client.run_command(command)

                    cmd_result = CommandResult(
                        command=command,
                        stdout=stdout.strip(),
                        stderr=stderr.strip(),
                        exit_code=exit_code,
                        success=exit_code == 0,
                    )
                    result.commands.append(cmd_result)

                    if exit_code == 0:
                        Actor.log.info(f"✓ Command succeeded on {device.ip}: {command}")
                    else:
                        Actor.log.warning(
                            f"✗ Command failed on {device.ip}: {command} "
                            f"(exit code: {exit_code})"
                        )

                except asyncio.TimeoutError:
                    error_msg = f"Command timed out: {command}"
                    Actor.log.error(f"{device.ip}: {error_msg}")
                    result.commands.append(
                        CommandResult(
                            command=command,
                            stdout="",
                            stderr=error_msg,
                            exit_code=-1,
                            success=False,
                        )
                    )

                except Exception as e:
                    error_msg = f"Command error: {str(e)}"
                    Actor.log.error(f"{device.ip}: {error_msg}")
                    result.commands.append(
                        CommandResult(
                            command=command,
                            stdout="",
                            stderr=error_msg,
                            exit_code=-1,
                            success=False,
                        )
                    )

    except asyncio.TimeoutError:
        result.connection_error = "Connection timeout"
        Actor.log.error(f"✗ Connection timeout for {device.ip}")

    except Exception as e:
        result.connection_error = f"Connection error: {str(e)}"
        Actor.log.error(f"✗ Connection error for {device.ip}: {str(e)}")

    return result


async def execute_on_all_devices(devices: List[Device], commands: List[str]) -> List[DeviceResult]:
    """Execute commands on all devices concurrently."""
    Actor.log.info(f"Starting execution on {len(devices)} device(s)...")

    # Run all device tasks concurrently
    tasks = [execute_commands_on_device(device, commands) for device in devices]
    results = await asyncio.gather(*tasks, return_exceptions=False)

    Actor.log.info(f"Completed execution on {len(devices)} device(s)")
    return list(results)  # Ensure it returns List[DeviceResult]
