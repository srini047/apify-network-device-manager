"""
Tech Support Collection - Complete Workflow

This module handles:
- Command execution
- Data parsing
- MongoDB storage
- Health assessment
"""

import re
import time
import uuid
from datetime import datetime
from typing import List, Dict
from apify import Actor

from src.models.device import Device
from src.models.result import DeviceResult
from src.db.model import (
    TechSupportData,
    SystemInfo,
    HardwareInfo,
    CPUInfo,
    MemoryInfo,
    DiskInfo,
    NetworkInfo,
    NetworkInterface,
    Route,
    ConnectionStats,
    ProcessStats,
    ProcessInfo,
    SecurityInfo,
    LoginInfo,
    LogInfo,
    LogEntry,
    HealthInfo,
    HealthAlert,
)
from src.actor.manager import execute_on_all_devices
from src.utils.constants import TECH_SUPPORT_COMMANDS
from src.db.connect import MongoDBClient
from src.db.storage import TechSupportStorage


# ============================================================================
# MAIN WORKFLOW
# ============================================================================

async def run_tech_support_collection(
    devices: List[Device],
    mongodb_connection_string: str,
    database_name: str = "network_techsupport"
) -> Dict:
    """
    Complete tech support data collection workflow
    
    Args:
        devices: List of Device objects to collect from
        mongodb_connection_string: MongoDB connection string
        database_name: MongoDB database name
        
    Returns:
        Dictionary with collection summary
    """
    run_id = str(uuid.uuid4())
    run_start = time.time()
    
    Actor.log.info(f"\n{'='*60}")
    Actor.log.info(f"🚀 TECH SUPPORT COLLECTION STARTED")
    Actor.log.info(f"{'='*60}")
    Actor.log.info(f"Run ID: {run_id}")
    Actor.log.info(f"Devices: {len(devices)}")
    Actor.log.info(f"Database: {database_name}")
    Actor.log.info(f"{'='*60}\n")
    
    mongo_client = None
    storage = None
    
    try:
        # Connect to MongoDB
        Actor.log.info("🗄️ Connecting to MongoDB...")
        mongo_client = MongoDBClient(
            mongodb_connection_string=mongodb_connection_string,
            database_name=database_name,
            connect_timeout_ms=5000
        )
        mongo_client.connect()
        
        # Initialize storage
        storage = TechSupportStorage(mongo_client)
        storage.initialize()
        
        # Get commands
        commands = TECH_SUPPORT_COMMANDS
        Actor.log.info(f"📋 Commands per device: {len(commands)}")
        
        # Execute commands on all devices
        Actor.log.info(f"⚡ Executing commands on {len(devices)} device(s) concurrently...")
        results: List[DeviceResult] = await execute_on_all_devices(devices, commands)
        Actor.log.info("✓ Command execution completed")
        
        # Process and store results
        summary = await _process_and_store_results(
            results=results,
            storage=storage,
            run_id=run_id
        )
        
        # Store run summary
        run_duration = time.time() - run_start
        run_summary = _create_run_summary(
            run_id=run_id,
            devices_count=len(devices),
            summary=summary,
            duration=run_duration
        )
        storage.store_run_summary(run_summary)
        
        # Log final summary
        _log_final_summary(summary, len(devices), run_duration, database_name)
        
        return summary
        
    except Exception as e:
        Actor.log.error(f"❌ Tech support collection failed: {e}")
        import traceback
        Actor.log.error(traceback.format_exc())
        raise
        
    finally:
        if mongo_client:
            mongo_client.close()


async def _process_and_store_results(
    results: List[DeviceResult],
    storage: TechSupportStorage,
    run_id: str
) -> Dict:
    """Process device results and store in MongoDB"""
    summary = {
        'successful': 0,
        'failed': 0,
        'failed_devices': [],
        'total_alerts': 0,
        'critical_devices': []
    }
    
    for idx, device_result in enumerate(results, 1):
        Actor.log.info(f"\n{'='*60}")
        Actor.log.info(f"📊 [{idx}/{len(results)}] Processing: {device_result.ip}")
        Actor.log.info(f"{'='*60}")
        
        if not device_result.connected:
            Actor.log.error(f"❌ Device not connected: {device_result.ip}")
            summary['failed'] += 1
            summary['failed_devices'].append({
                'ip': device_result.ip,
                'error': device_result.connection_error or 'Connection failed'
            })
            
            await Actor.push_data({
                'run_id': run_id,
                'device_ip': device_result.ip,
                'status': 'failed',
                'error': device_result.connection_error,
                'timestamp': datetime.utcnow().isoformat()
            })
            continue
        
        try:
            successful_commands = sum(1 for cmd in device_result.commands if cmd.success)
            total_commands = len(device_result.commands)
            
            Actor.log.info(f"📝 Commands: {successful_commands}/{total_commands} successful")
            
            # Parse tech support data
            Actor.log.info(f"🔄 Parsing tech support data...")
            tech_support_data = parse_device_result(device_result)
            
            # Store in MongoDB
            Actor.log.info(f"💾 Storing to MongoDB...")
            doc_id = storage.store_tech_support(tech_support_data)
            
            Actor.log.info(f"✅ MongoDB Document ID: {doc_id}")
            Actor.log.info(f"⏱️  Parsing time: {tech_support_data.collection_duration_ms}ms")
            Actor.log.info(f"🏥 Health status: {tech_support_data.health.status}")
            
            # Track alerts
            alerts_count = len(tech_support_data.health.alerts)
            if alerts_count > 0:
                summary['total_alerts'] += alerts_count
                Actor.log.warning(f"⚠️  {alerts_count} alert(s) detected:")
                for alert in tech_support_data.health.alerts:
                    Actor.log.warning(f"   [{alert.level.upper()}] {alert.message}")
            
            if tech_support_data.health.status == 'critical':
                summary['critical_devices'].append(device_result.ip)
                Actor.log.error(f"🚨 CRITICAL health status for {device_result.ip}")
            
            summary['successful'] += 1
            
            await Actor.push_data({
                'run_id': run_id,
                'device_ip': device_result.ip,
                'mongodb_id': doc_id,
                'status': 'success',
                'hostname': tech_support_data.hostname,
                'health_status': tech_support_data.health.status,
                'collection_duration_ms': tech_support_data.collection_duration_ms,
                'alerts_count': alerts_count,
                'commands_successful': successful_commands,
                'commands_total': total_commands,
                'timestamp': datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            Actor.log.error(f"❌ Failed to process {device_result.ip}: {e}")
            import traceback
            Actor.log.error(traceback.format_exc())
            
            summary['failed'] += 1
            summary['failed_devices'].append({
                'ip': device_result.ip,
                'error': str(e)
            })
            
            await Actor.push_data({
                'run_id': run_id,
                'device_ip': device_result.ip,
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            })
    
    return summary


def _create_run_summary(run_id: str, devices_count: int, summary: Dict, duration: float) -> Dict:
    """Create run summary document"""
    return {
        'run_id': run_id,
        'started_at': datetime.utcnow(),
        'completed_at': datetime.utcnow(),
        'duration_seconds': int(duration),
        'devices_processed': devices_count,
        'devices_successful': summary['successful'],
        'devices_failed': summary['failed'],
        'failed_devices': summary['failed_devices'],
        'total_alerts': summary['total_alerts'],
        'critical_devices': summary['critical_devices']
    }


def _log_final_summary(summary: Dict, total_devices: int, duration: float, database_name: str) -> None:
    """Log final summary"""
    Actor.log.info(f"\n{'='*60}")
    Actor.log.info(f"🎉 TECH SUPPORT COLLECTION COMPLETE")
    Actor.log.info(f"{'='*60}")
    Actor.log.info(f"✅ Successful: {summary['successful']}/{total_devices}")
    Actor.log.info(f"❌ Failed: {summary['failed']}/{total_devices}")
    
    if summary['total_alerts'] > 0:
        Actor.log.info(f"⚠️  Total alerts: {summary['total_alerts']}")
    
    if summary['critical_devices']:
        Actor.log.info(f"🚨 Critical devices: {len(summary['critical_devices'])}")
        for ip in summary['critical_devices']:
            Actor.log.info(f"   - {ip}")
    
    minutes = int(duration / 60)
    seconds = int(duration % 60)
    Actor.log.info(f"⏱️  Total time: {int(duration)}s ({minutes}m {seconds}s)")
    Actor.log.info(f"💾 Database: {database_name}")
    Actor.log.info(f"{'='*60}\n")


# ============================================================================
# DATA PARSING
# ============================================================================

def parse_device_result(device_result: DeviceResult) -> TechSupportData:
    """Parse DeviceResult into TechSupportData"""
    start_time = time.time()
    
    outputs = {}
    for cmd_result in device_result.commands:
        if cmd_result.success:
            outputs[cmd_result.command] = cmd_result.stdout
        else:
            outputs[cmd_result.command] = ""
    
    tech_data = TechSupportData(
        device_ip=device_result.ip,
        device_label=f"{device_result.username}@{device_result.ip}",
        system=_parse_system(outputs),
        hardware=_parse_hardware(outputs),
        network=_parse_network(outputs),
        processes=_parse_processes(outputs),
        services=_parse_services(outputs),
        security=_parse_security(outputs),
        logs=_parse_logs(outputs),
    )
    
    tech_data.hostname = tech_data.system.hostname
    tech_data.health = _assess_health(tech_data)
    tech_data.collection_duration_ms = int((time.time() - start_time) * 1000)
    
    return tech_data


def _get_output(outputs: Dict[str, str], command: str, default: str = "") -> str:
    """Safely get command output"""
    output = outputs.get(command, default)
    return output.strip() if output else default


def _parse_system(outputs: Dict[str, str]) -> SystemInfo:
    """Parse system information"""
    hostname = _get_output(outputs, 'hostname', 'unknown')
    kernel = _get_output(outputs, 'uname -r', 'unknown')
    os_release = _get_output(outputs, 'cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d \\"', 'unknown')
    
    uptime_raw = _get_output(outputs, 'cat /proc/uptime', '0 0').split()
    uptime_seconds = 0
    try:
        uptime_seconds = int(float(uptime_raw[0])) if uptime_raw else 0
    except (ValueError, IndexError):
        pass
    
    uptime_human = _get_output(outputs, 'uptime -p 2>/dev/null || uptime', 'unknown')
    
    return SystemInfo(
        hostname=hostname,
        kernel=kernel,
        os_release=os_release,
        uptime_seconds=uptime_seconds,
        uptime_human=uptime_human
    )


def _parse_hardware(outputs: Dict[str, str]) -> HardwareInfo:
    """Parse hardware metrics"""
    # CPU
    cpu_cores = 0
    try:
        cpu_cores_str = _get_output(outputs, 'nproc', '0')
        cpu_cores = int(cpu_cores_str) if cpu_cores_str else 0
    except ValueError:
        pass
    
    cpu_line = _get_output(outputs, 'top -bn1 | grep "Cpu(s)" | head -1', '')
    cpu_usage = 0.0
    if cpu_line and 'Cpu(s):' in cpu_line:
        try:
            match = re.search(r'(\d+\.?\d*)\s+us', cpu_line)
            if match:
                cpu_usage = float(match.group(1))
        except (ValueError, AttributeError):
            pass
    
    load_avg_str = _get_output(outputs, 'cat /proc/loadavg', '0 0 0')
    load_avg = load_avg_str.split() if load_avg_str else ['0', '0', '0']
    
    cpu_info = CPUInfo(
        usage_percent=cpu_usage,
        load_average_1min=float(load_avg[0]) if len(load_avg) > 0 else 0.0,
        load_average_5min=float(load_avg[1]) if len(load_avg) > 1 else 0.0,
        load_average_15min=float(load_avg[2]) if len(load_avg) > 2 else 0.0,
        cores=cpu_cores
    )
    
    # Memory
    memory_output = _get_output(outputs, 'free -m', '')
    memory_lines = memory_output.split('\n') if memory_output else []
    mem_info = MemoryInfo()
    
    for line in memory_lines:
        if line.startswith('Mem:'):
            parts = line.split()
            if len(parts) >= 7:
                try:
                    mem_info.total_mb = int(parts[1])
                    mem_info.used_mb = int(parts[2])
                    mem_info.free_mb = int(parts[3])
                    mem_info.available_mb = int(parts[6]) if len(parts) > 6 else int(parts[3])
                    if mem_info.total_mb > 0:
                        mem_info.usage_percent = round((mem_info.used_mb / mem_info.total_mb) * 100, 1)
                except (ValueError, ZeroDivisionError):
                    pass
        elif line.startswith('Swap:'):
            parts = line.split()
            if len(parts) >= 4:
                try:
                    mem_info.swap_total_mb = int(parts[1])
                    mem_info.swap_used_mb = int(parts[2])
                    mem_info.swap_free_mb = int(parts[3])
                except ValueError:
                    pass
    
    # Disk
    disk_output = _get_output(outputs, 'df -h', '')
    disk_lines = disk_output.split('\n')[1:] if disk_output else []
    disks = []
    
    for line in disk_lines:
        if not line.strip() or line.startswith('tmpfs') or line.startswith('devtmpfs'):
            continue
        parts = line.split()
        if len(parts) >= 6:
            try:
                disks.append(DiskInfo(
                    filesystem=parts[0],
                    mount_point=parts[5],
                    size_gb=_parse_size(parts[1]),
                    used_gb=_parse_size(parts[2]),
                    available_gb=_parse_size(parts[3]),
                    usage_percent=int(parts[4].rstrip('%'))
                ))
            except (ValueError, IndexError):
                continue
    
    return HardwareInfo(cpu=cpu_info, memory=mem_info, disk=disks)


def _parse_network(outputs: Dict[str, str]) -> NetworkInfo:
    """Parse network information"""
    interfaces = []
    iface_output = _get_output(outputs, 'ip -j addr show 2>/dev/null || ip addr show', '')
    
    if iface_output.startswith('['):
        try:
            import json
            iface_json = json.loads(iface_output)
            for iface in iface_json:
                interfaces.append(NetworkInterface(
                    name=iface.get('ifname', 'unknown'),
                    state=iface.get('operstate', 'unknown').upper(),
                    mtu=iface.get('mtu', 0),
                    mac_address=iface.get('address', ''),
                    ip_addresses=[addr.get('local', '') for addr in iface.get('addr_info', [])]
                ))
        except:
            pass
    
    # Parse stats
    stats_output = _get_output(outputs, 'cat /proc/net/dev', '')
    stats_lines = stats_output.split('\n')[2:] if stats_output else []
    
    for line in stats_lines:
        parts = line.split()
        if len(parts) >= 17:
            iface_name = parts[0].rstrip(':')
            for iface in interfaces:
                if iface.name == iface_name:
                    try:
                        iface.rx_bytes = int(parts[1])
                        iface.rx_packets = int(parts[2])
                        iface.rx_errors = int(parts[3])
                        iface.rx_dropped = int(parts[4])
                        iface.tx_bytes = int(parts[9])
                        iface.tx_packets = int(parts[10])
                        iface.tx_errors = int(parts[11])
                        iface.tx_dropped = int(parts[12])
                    except (ValueError, IndexError):
                        pass
                    break
    
    return NetworkInfo(interfaces=interfaces)


def _parse_processes(outputs: Dict[str, str]) -> ProcessStats:
    """Parse process information"""
    total_str = _get_output(outputs, 'ps aux | wc -l', '0')
    total = 0
    try:
        total = int(total_str.strip()) if total_str else 0
    except ValueError:
        pass
    
    return ProcessStats(total_count=total)


def _parse_services(outputs: Dict[str, str]) -> Dict[str, str]:
    """Parse services status"""
    services = {}
    service_output = _get_output(outputs, 'systemctl list-units --type=service --state=running --no-pager 2>/dev/null | head -20', '')
    
    for line in service_output.split('\n'):
        if '.service' in line:
            parts = line.split()
            if len(parts) >= 1:
                service_name = parts[0].replace('.service', '')
                services[service_name] = 'active'
    
    return services


def _parse_security(outputs: Dict[str, str]) -> SecurityInfo:
    """Parse security information"""
    users_str = _get_output(outputs, 'w -h | wc -l', '0')
    users = 0
    try:
        users = int(users_str.strip()) if users_str else 0
    except ValueError:
        pass
    
    return SecurityInfo(users_logged_in=users)


def _parse_logs(outputs: Dict[str, str]) -> LogInfo:
    """Parse log information"""
    errors = []
    error_output = _get_output(outputs, 'journalctl -p err -n 20 --no-pager 2>/dev/null || tail -100 /var/log/syslog 2>/dev/null | grep -i error | tail -20', '')
    
    for line in error_output.split('\n')[:5]:
        if line.strip():
            errors.append(LogEntry(severity='ERROR', message=line[:200]))
    
    return LogInfo(error_count=len(errors), recent_errors=errors)


def _assess_health(tech_data: TechSupportData) -> HealthInfo:
    """Assess device health"""
    alerts = []
    
    cpu_usage = tech_data.hardware.cpu.usage_percent
    if cpu_usage > 90:
        alerts.append(HealthAlert(level='critical', message=f'Critical CPU usage: {cpu_usage:.1f}%'))
    elif cpu_usage > 80:
        alerts.append(HealthAlert(level='warning', message=f'High CPU usage: {cpu_usage:.1f}%'))
    
    mem_usage = tech_data.hardware.memory.usage_percent
    if mem_usage > 95:
        alerts.append(HealthAlert(level='critical', message=f'Critical memory usage: {mem_usage:.1f}%'))
    elif mem_usage > 85:
        alerts.append(HealthAlert(level='warning', message=f'High memory usage: {mem_usage:.1f}%'))
    
    for disk in tech_data.hardware.disk:
        if disk.usage_percent > 95:
            alerts.append(HealthAlert(level='critical', message=f'Critical disk usage on {disk.mount_point}: {disk.usage_percent}%'))
        elif disk.usage_percent > 85:
            alerts.append(HealthAlert(level='warning', message=f'High disk usage on {disk.mount_point}: {disk.usage_percent}%'))
    
    status = 'healthy'
    if any(a.level == 'critical' for a in alerts):
        status = 'critical'
    elif alerts:
        status = 'warning'
    
    return HealthInfo(status=status, alerts=alerts)


def _parse_size(size_str: str) -> float:
    """Parse size string to GB"""
    if not size_str:
        return 0.0
    size_str = size_str.upper().strip()
    try:
        if size_str.endswith('T'):
            return float(size_str[:-1]) * 1024
        elif size_str.endswith('G'):
            return float(size_str[:-1])
        elif size_str.endswith('M'):
            return float(size_str[:-1]) / 1024
        elif size_str.endswith('K'):
            return float(size_str[:-1]) / (1024 * 1024)
        else:
            return float(size_str) / (1024 ** 3)
    except:
        return 0.0
