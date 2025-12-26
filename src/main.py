from datetime import datetime, timezone
from typing import List

from apify import Actor

from src.actor.manager import execute_on_all_devices
from src.actor.command_generator import (
    AICommandGenerator,
    filter_commands_by_severity,
    GeneratedCommand,
)
from src.input.loader import DeviceLoader
from src.models.result import DeviceResult
from src.utils.constants import RUN_COMMANDS


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


async def store_ai_generated_commands(
    generated_commands: List[GeneratedCommand],
    filtered_commands: List[str],
    problem_description: str,
) -> None:
    """
    Store AI-generated commands metadata in Key-Value Store
    """
    commands_metadata = {
        "problem_description": problem_description,
        "generation_time": datetime.now(timezone.utc).isoformat(),
        "total_generated": len(generated_commands),
        "commands_executed": len(filtered_commands),
        "generated_commands": [cmd.to_dict() for cmd in generated_commands],
        "executed_commands": filtered_commands,
    }

    await Actor.set_value("ai_generated_commands", commands_metadata)
    Actor.log.info("✓ Stored AI-generated commands metadata")


def log_execution_summary(
    results: List[DeviceResult], *, ai_enabled: bool = False
) -> None:
    """
    Log execution summary to console
    """
    successful_devices = sum(1 for r in results if r.connected)
    failed_devices = len(results) - successful_devices
    total_commands = sum(len(r.commands) for r in results)
    successful_commands = sum(
        sum(1 for cmd in r.commands if cmd.success) for r in results
    )

    Actor.log.info(f"{'=' * 50}")
    Actor.log.info("EXECUTION SUMMARY:")
    if ai_enabled:
        Actor.log.info("Mode: AI-Generated Commands")
    Actor.log.info(
        f"  Devices: {successful_devices} connected, {failed_devices} failed"
    )
    Actor.log.info(f"  Commands: {successful_commands}/{total_commands} succeeded")
    Actor.log.info(f"{'=' * 50}")


async def generate_ai_commands(
    problem_description: str,
    include_warn_commands: bool,
    api_key: str = None,
) -> List[str]:
    """
    Generate commands using AI based on problem description

    Returns:
        List of command strings to execute
    """
    Actor.log.info("" + "=" * 50)
    Actor.log.info("AI COMMAND GENERATION")
    Actor.log.info("=" * 50)
    Actor.log.info(f"Problem: {problem_description}")
    Actor.log.info(f"Include WARN commands: {include_warn_commands}")

    try:
        # Initialize AI command generator
        generator = AICommandGenerator(api_key=api_key)

        # Generate commands
        generated_commands = await generator.generate_commands(
            problem_description=problem_description,
            include_warn_commands=include_warn_commands,
        )

        # Filter by severity
        filtered_commands = filter_commands_by_severity(
            generated_commands,
            include_warn=include_warn_commands,
        )

        # Store AI command metadata
        await store_ai_generated_commands(
            generated_commands,
            filtered_commands,
            problem_description,
        )

        Actor.log.info(f"✓ Generated {len(filtered_commands)} commands to execute")
        Actor.log.info("=" * 50 + "")

        return filtered_commands

    except Exception as e:
        Actor.log.error(f"Failed to generate AI commands: {str(e)}")
        Actor.log.warning("Falling back to manual commands only")
        return []


async def main() -> None:
    """
    Main entry point for the Apify Actor
    """
    async with Actor:
        # Load input configuration
        input_data = await Actor.get_input() or {}
        raw_devices = input_data.get("devices", [])
        manual_commands = input_data.get("commands", [])
        problem_description = input_data.get("problemDescription", "")
        exec_warn_commands = input_data.get("includeWarnCommands", False)
        cohere_api_key = input_data.get("cohereApiKey", "")

        if not raw_devices:
            Actor.log.error("No devices provided in input")
            return

        # Parse device configurations
        devices = DeviceLoader.from_input(raw_devices)
        Actor.log.info(f"Loaded {len(devices)} device(s) from input")

        for device in devices:
            Actor.log.info(f"  → {device.ip}:{device.port} (user={device.username})")

        # Determine command source: AI-generated or manual
        ai_enabled = False
        final_commands = []

        if problem_description and problem_description.strip():
            # Use AI to generate commands
            Actor.log.info("AI Command Generation enabled")
            ai_commands = await generate_ai_commands(
                problem_description=problem_description.strip(),
                include_warn_commands=exec_warn_commands,
                api_key=cohere_api_key,
            )
            final_commands.extend(ai_commands)
            ai_enabled = True

        if manual_commands:
            Actor.log.info(f"Adding {len(manual_commands)} manual commands")
            final_commands.extend(manual_commands)

        # Always append default RUN commands irrespective of AI/manual 
        final_commands.extend(RUN_COMMANDS)

        # Remove duplicate commands while preserving order
        final_commands = list(dict.fromkeys(final_commands))

        if not final_commands:
            Actor.log.warning(
                "No commands to execute. Provide either a problem description "
                "for AI generation or manual commands."
            )
            return

        Actor.log.info(
            f"Total commands to execute (other than default commands): {len(final_commands)}"
        )
        for i, cmd in enumerate(final_commands, 1):
            Actor.log.info(f"  {i}. {cmd}")

        # Execute commands on all devices
        Actor.log.info("Starting command execution on all devices...")
        results = await execute_on_all_devices(devices, final_commands)
        Actor.log.info("✓ Command execution completed")

        # Store results in Dataset (visible in OUTPUT tab as table)
        Actor.log.info("Storing results in Dataset...")
        await store_device_summary_table(results)

        # Store detailed command outputs in Key-Value Store
        Actor.log.info("Storing detailed outputs in Key-Value Store...")
        await store_command_outputs_kv(results)

        # Store overall summary
        Actor.log.info("Storing overall summary...")
        await store_overall_summary(results)

        # Log summary to console
        log_execution_summary(results=results, ai_enabled=ai_enabled)

        # Pay per event
        await Actor.charge(event_name="device-execution", count=len(results))

        Actor.log.info("✓ Results stored successfully!")
