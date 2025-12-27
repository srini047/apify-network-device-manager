## Constants for SSH connections and commands
SSH_RETRY_ATTEMPTS = 3
SSH_CONNECTION_TIMEOUT = 10

## Commands to run on the remote device
RUN_COMMANDS = ["hostname", "uptime", "whoami", "df -h", "free -m"]

TECH_SUPPORT_COMMANDS = [
    # ============================================
    # System Information
    # ============================================
    'hostname',
    'uname -r',
    'cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d \\"',
    'cat /proc/uptime',
    'uptime -p 2>/dev/null || uptime',
    
    # ============================================
    # CPU & Load
    # ============================================
    'nproc',
    'top -bn1 | grep "Cpu(s)" | head -1',
    'cat /proc/loadavg',
    
    # ============================================
    # Memory
    # ============================================
    'free -m',
    
    # ============================================
    # Disk
    # ============================================
    'df -h',
    
    # ============================================
    # Network Interfaces
    # ============================================
    'ip -j addr show 2>/dev/null || ip addr show',
    'cat /proc/net/dev',
    'ip -j route show 2>/dev/null || ip route show',
    'cat /etc/resolv.conf | grep nameserver',
    'ss -s 2>/dev/null || netstat -s 2>/dev/null | head -20',
    'ss -tuln 2>/dev/null || netstat -tuln',
    
    # ============================================
    # Processes
    # ============================================
    'ps aux | wc -l',
    'ps -eo stat | tail -n +2 | cut -c1 | sort | uniq -c',
    'ps aux --sort=-%cpu | head -11',
    'ps aux --sort=-%mem | head -11',
    
    # ============================================
    # Services (systemd)
    # ============================================
    'systemctl list-units --type=service --state=running --no-pager 2>/dev/null | head -20',
    
    # ============================================
    # Security
    # ============================================
    'w -h | wc -l',
    'last -n 10 -w',
    'grep "Failed password" /var/log/auth.log 2>/dev/null | tail -5 || echo "N/A"',
    
    # ============================================
    # Logs (Recent Errors and Warnings)
    # ============================================
    'journalctl -p err -n 20 --no-pager 2>/dev/null || tail -100 /var/log/syslog 2>/dev/null | grep -i error | tail -20',
    'journalctl -p warning -n 20 --no-pager 2>/dev/null || tail -100 /var/log/syslog 2>/dev/null | grep -i warn | tail -20',
]
