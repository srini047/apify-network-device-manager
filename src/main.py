from __future__ import annotations

from datetime import datetime
from typing import List

from apify import Actor

from src.input.loader import DeviceLoader
from src.actor.manager import execute_on_all_devices
from src.models.result import DeviceResult


async def store_device_summary_table(results: List[DeviceResult]) -> None:
    """
    Store device results as summary rows in Apify Dataset (visible in OUTPUT tab)
    """
    for result in results:
        # Build command details for nested view
        command_details = [
            {
                "command": cmd.command,
                "status": "✓" if cmd.success else "✗",
                "exit_code": cmd.exit_code,
                "output_preview": cmd.stdout[:100] if cmd.stdout else "",
            }
            for cmd in result.commands
        ]

        # Calculate success rate
        success_count = sum(1 for cmd in result.commands if cmd.success)
        total_count = len(result.commands)
        success_rate = (success_count / total_count * 100) if total_count > 0 else 0

        # Create summary row for this device
        summary_row = {
            "device": f"{result.ip}:{result.port}",
            "username": result.username,
            "status": "✓ Connected" if result.connected else "✗ Failed",
            "total_commands": total_count,
            "successful": success_count,
            "failed": total_count - success_count,
            "success_rate": f"{success_rate:.1f}%",
            "error": result.connection_error or "",
            "commands_details": command_details,
        }

        await Actor.push_data(summary_row)
        Actor.log.info(f"✓ Stored summary for device {result.ip}")


async def store_command_outputs_kv(results: List[DeviceResult]) -> None:
    """
    Store detailed command outputs in Apify Key-Value Store

    Each device gets its own key with full command outputs
    Format: device_{ip}_{port}
    """
    for result in results:
        # Create a unique key for this device
        device_key = f"device_{result.ip.replace('.', '_')}_{result.port}"

        # Build detailed output structure
        device_output = {
            "metadata": {
                "ip": result.ip,
                "port": result.port,
                "username": result.username,
                "connected": result.connected,
                "connection_error": result.connection_error,
                "timestamp": datetime.now().isoformat(),
            },
            "commands": [
                {
                    "command": cmd.command,
                    "success": cmd.success,
                    "exit_code": cmd.exit_code,
                    "stdout": cmd.stdout,
                    "stderr": cmd.stderr,
                }
                for cmd in result.commands
            ],
        }

        # Store in Key-Value Store
        await Actor.set_value(device_key, device_output)
        Actor.log.info(
            f"✓ Stored detailed output for {result.ip} with key: {device_key}"
        )


async def store_overall_summary(results: List[DeviceResult]) -> None:
    """
    Store overall execution summary in Dataset and Key-Value Store
    """
    # Calculate overall statistics
    total_devices = len(results)
    connected_devices = sum(1 for r in results if r.connected)
    failed_devices = total_devices - connected_devices

    total_commands = sum(len(r.commands) for r in results)
    successful_commands = sum(
        sum(1 for cmd in r.commands if cmd.success) for r in results
    )
    failed_commands = total_commands - successful_commands

    overall_success_rate = (
        (successful_commands / total_commands * 100) if total_commands > 0 else 0
    )

    # Store in Dataset as final summary row
    summary_row = {
        "device": "═══ OVERALL SUMMARY ═══",
        "username": "",
        "status": f"{connected_devices}/{total_devices} connected",
        "total_commands": total_commands,
        "successful": successful_commands,
        "failed": failed_commands,
        "success_rate": f"{overall_success_rate:.1f}%",
        "error": "",
        "commands_details": [],
    }
    await Actor.push_data(summary_row)

    # Store detailed summary in Key-Value Store
    detailed_summary = {
        "execution_time": datetime.now().isoformat(),
        "devices": {
            "total": total_devices,
            "connected": connected_devices,
            "failed": failed_devices,
            "success_rate": f"{(connected_devices / total_devices * 100):.1f}%",
        },
        "commands": {
            "total": total_commands,
            "successful": successful_commands,
            "failed": failed_commands,
            "success_rate": f"{overall_success_rate:.1f}%",
        },
        "device_list": [
            {
                "ip": r.ip,
                "port": r.port,
                "connected": r.connected,
                "commands_executed": len(r.commands),
                "commands_succeeded": sum(1 for cmd in r.commands if cmd.success),
            }
            for r in results
        ],
    }
    await Actor.set_value("execution_summary", detailed_summary)

    Actor.log.info("✓ Stored overall summary")


def log_execution_summary(results: List[DeviceResult]) -> None:
    """
    Log execution summary to console
    """
    successful_devices = sum(1 for r in results if r.connected)
    failed_devices = len(results) - successful_devices
    total_commands = sum(len(r.commands) for r in results)
    successful_commands = sum(
        sum(1 for cmd in r.commands if cmd.success) for r in results
    )

    Actor.log.info(f"\n{'=' * 50}")
    Actor.log.info("EXECUTION SUMMARY:")
    Actor.log.info(
        f"  Devices: {successful_devices} connected, {failed_devices} failed"
    )
    Actor.log.info(f"  Commands: {successful_commands}/{total_commands} succeeded")
    Actor.log.info(f"{'=' * 50}\n")


async def main() -> None:
    """
    Main entry point for the Apify Actor
    """
    async with Actor:
        # Load input configuration
        input_data = await Actor.get_input() or {}
        raw_devices = input_data.get("devices", [])
        commands = input_data.get("commands", [])

        if not raw_devices:
            Actor.log.warning("No devices provided in input")
            return

        # Parse device configurations
        devices = DeviceLoader.from_input(raw_devices)
        Actor.log.info(f"Loaded {len(devices)} device(s) from input")

        for device in devices:
            Actor.log.info(f"  → {device.ip}:{device.port} (user={device.username})")

        # Execute commands on all devices
        Actor.log.info("\nStarting command execution on all devices...")
        results = await execute_on_all_devices(devices, commands)
        Actor.log.info("✓ Command execution completed\n")

        # Store results in Dataset (visible in OUTPUT tab as table)
        Actor.log.info("Storing results in Dataset...")
        await store_device_summary_table(results)

        # Store detailed command outputs in Key-Value Store
        Actor.log.info("Storing detailed outputs in Key-Value Store...")
        await store_command_outputs_kv(results)

        # Store overall summary
        Actor.log.info("\nStoring overall summary...")
        await store_overall_summary(results)

        # Log summary to console
        log_execution_summary(results)
        
        # Pay per event
        await Actor.charge(event_name="device-execution", count=len(results))

        Actor.log.info("✓ Results stored successfully!")
