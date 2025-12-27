"""
Tech Support Data Models
"""

from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class SystemInfo(BaseModel):
    hostname: str = "unknown"
    kernel: str = "unknown"
    os_release: str = "unknown"
    uptime_seconds: int = 0
    uptime_human: str = "unknown"


class CPUInfo(BaseModel):
    usage_percent: float = 0.0
    load_average_1min: float = 0.0
    load_average_5min: float = 0.0
    load_average_15min: float = 0.0
    cores: int = 0


class MemoryInfo(BaseModel):
    total_mb: int = 0
    used_mb: int = 0
    free_mb: int = 0
    available_mb: int = 0
    usage_percent: float = 0.0
    swap_total_mb: int = 0
    swap_used_mb: int = 0
    swap_free_mb: int = 0


class DiskInfo(BaseModel):
    filesystem: str
    mount_point: str
    size_gb: float = 0.0
    used_gb: float = 0.0
    available_gb: float = 0.0
    usage_percent: int = 0


class HardwareInfo(BaseModel):
    cpu: CPUInfo = Field(default_factory=CPUInfo)
    memory: MemoryInfo = Field(default_factory=MemoryInfo)
    disk: List[DiskInfo] = Field(default_factory=list)


class NetworkInterface(BaseModel):
    name: str
    state: str = "unknown"
    ip_addresses: List[str] = Field(default_factory=list)
    mac_address: str = ""
    mtu: int = 0
    rx_bytes: int = 0
    tx_bytes: int = 0
    rx_packets: int = 0
    tx_packets: int = 0
    rx_errors: int = 0
    tx_errors: int = 0
    rx_dropped: int = 0
    tx_dropped: int = 0


class Route(BaseModel):
    destination: str
    gateway: str
    interface: str
    metric: int = 0


class ConnectionStats(BaseModel):
    tcp_established: int = 0
    tcp_listen: int = 0
    udp_open: int = 0
    total_connections: int = 0


class NetworkInfo(BaseModel):
    interfaces: List[NetworkInterface] = Field(default_factory=list)
    routing_table: List[Route] = Field(default_factory=list)
    connections: ConnectionStats = Field(default_factory=ConnectionStats)
    dns_servers: List[str] = Field(default_factory=list)
    open_ports: List[int] = Field(default_factory=list)


class ProcessInfo(BaseModel):
    pid: int
    user: str
    cpu_percent: float
    mem_percent: float
    command: str


class ProcessStats(BaseModel):
    total_count: int = 0
    running: int = 0
    sleeping: int = 0
    top_cpu_processes: List[ProcessInfo] = Field(default_factory=list)
    top_memory_processes: List[ProcessInfo] = Field(default_factory=list)


class LoginInfo(BaseModel):
    user: str
    from_host: str = "local"
    login_time: str = "unknown"


class SecurityInfo(BaseModel):
    users_logged_in: int = 0
    last_logins: List[LoginInfo] = Field(default_factory=list)
    failed_login_attempts: int = 0
    open_ports: List[int] = Field(default_factory=list)
    firewall_active: bool = False


class LogEntry(BaseModel):
    timestamp: Optional[str] = None
    severity: str = "INFO"
    message: str


class LogInfo(BaseModel):
    error_count: int = 0
    warning_count: int = 0
    recent_errors: List[LogEntry] = Field(default_factory=list)
    recent_warnings: List[LogEntry] = Field(default_factory=list)


class HealthAlert(BaseModel):
    level: str  # "info", "warning", "critical"
    message: str


class HealthInfo(BaseModel):
    status: str = "healthy"  # "healthy", "warning", "critical"
    issues: List[str] = Field(default_factory=list)
    alerts: List[HealthAlert] = Field(default_factory=list)


class TechSupportData(BaseModel):
    # Device identification
    device_ip: str
    device_label: str = ""
    hostname: str = "unknown"
    
    # Collection metadata
    collected_at: datetime = Field(default_factory=datetime.utcnow)
    collection_duration_ms: int = 0
    
    # Data sections
    system: SystemInfo = Field(default_factory=SystemInfo)
    hardware: HardwareInfo = Field(default_factory=HardwareInfo)
    network: NetworkInfo = Field(default_factory=NetworkInfo)
    processes: ProcessStats = Field(default_factory=ProcessStats)
    services: Dict[str, str] = Field(default_factory=dict)
    security: SecurityInfo = Field(default_factory=SecurityInfo)
    logs: LogInfo = Field(default_factory=LogInfo)
    health: HealthInfo = Field(default_factory=HealthInfo)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
