"""
Pytest configuration and fixtures for command generator tests
"""

import os
import pytest
from unittest.mock import Mock, AsyncMock, MagicMock
from typing import Optional


# Mock Actor for testing without Apify
class MockActor:
    """Mock Actor class for testing without Apify SDK"""
    
    class log:
        """Mock logging"""
        
        @staticmethod
        def info(msg):
            print(f"[INFO] {msg}")
        
        @staticmethod
        def warning(msg):
            print(f"[WARNING] {msg}")
        
        @staticmethod
        def error(msg):
            print(f"[ERROR] {msg}")


@pytest.fixture(scope="session")
def mock_actor(monkeypatch_session):
    """Mock the Apify Actor for all tests"""
    import sys
    sys.modules['apify'] = MagicMock()
    sys.modules['apify'].Actor = MockActor
    return MockActor


@pytest.fixture(scope="session")
def monkeypatch_session():
    """Session-scoped monkeypatch"""
    from _pytest.monkeypatch import MonkeyPatch
    m = MonkeyPatch()
    yield m
    m.undo()


@pytest.fixture
def cohere_api_key():
    """Get Cohere API key from environment"""
    api_key = os.environ.get("COHERE_API_KEY")
    if not api_key:
        pytest.skip("COHERE_API_KEY environment variable not set")
    return api_key


@pytest.fixture
def mock_cohere_response():
    """Create a mock Cohere API response"""
    
    def create_response(num_commands=5, include_warn=False):
        """Create mock response with specified parameters"""
        commands = []
        
        # Generate SAFE commands
        safe_commands = [
            {
                "command": "top -bn1 | head -20",
                "severity": "safe",
                "description": "Display top CPU-consuming processes",
                "reasoning": "Identifies which processes are using the most CPU"
            },
            {
                "command": "ps aux --sort=-%cpu | head -15",
                "severity": "safe",
                "description": "List processes sorted by CPU usage",
                "reasoning": "Shows CPU usage breakdown per process"
            },
            {
                "command": "free -m",
                "severity": "safe",
                "description": "Display memory usage in megabytes",
                "reasoning": "Shows available and used memory"
            },
            {
                "command": "df -h",
                "severity": "safe",
                "description": "Display disk usage",
                "reasoning": "Shows disk space utilization"
            },
            {
                "command": "netstat -tulpn",
                "severity": "safe",
                "description": "Show network connections",
                "reasoning": "Lists active network connections"
            },
        ]
        
        # Generate WARN commands
        warn_commands = [
            {
                "command": "systemctl restart apache2",
                "severity": "warn",
                "description": "Restart Apache web server",
                "reasoning": "May fix hanging Apache processes"
            },
            {
                "command": "killall -9 python",
                "severity": "warn",
                "description": "Kill all Python processes",
                "reasoning": "Terminates stuck Python processes"
            },
        ]
        
        # Build command list based on parameters
        commands = safe_commands[:min(num_commands, len(safe_commands))]
        if include_warn and num_commands > len(commands):
            commands.extend(warn_commands[:num_commands - len(commands)])
        
        # Create mock response object
        mock_response = Mock()
        mock_response.message = Mock()
        
        # Create content blocks
        text_block = Mock()
        text_block.text = str({
            "commands": commands
        }).replace("'", '"')  # Convert to JSON-like string
        
        mock_response.message.content = [text_block]
        
        return mock_response
    
    return create_response


@pytest.fixture
def mock_cohere_client(mock_cohere_response):
    """Create a mock Cohere client"""
    
    async def mock_chat(*args, **kwargs):
        """Mock chat method"""
        # Determine if WARN commands should be included based on prompt
        messages = kwargs.get('messages', [])
        include_warn = False
        
        if messages and 'content' in messages[0]:
            prompt = messages[0]['content']
            include_warn = 'Include both SAFE and WARN commands' in prompt
        
        return mock_cohere_response(num_commands=7, include_warn=include_warn)
    
    mock_client = Mock()
    mock_client.chat = AsyncMock(side_effect=mock_chat)
    
    return mock_client


@pytest.fixture
def sample_problems():
    """Sample problem descriptions for testing"""
    return {
        "cpu": "Server experiencing high CPU usage and slow response times",
        "memory": "High memory usage, applications being killed by OOM killer",
        "network": "Network interface eth0 keeps dropping connections",
        "disk": "Disk I/O is extremely slow, high iowait",
        "apache": "Apache web server not responding to requests on port 80",
    }


@pytest.fixture
def expected_command_types():
    """Expected command types for different problems"""
    return {
        "cpu": ["top", "ps", "mpstat", "vmstat"],
        "memory": ["free", "ps", "vmstat", "cat /proc/meminfo"],
        "network": ["ip addr", "netstat", "ethtool", "ping"],
        "disk": ["df", "iostat", "iotop", "lsblk"],
        "apache": ["systemctl", "netstat", "curl", "tail"],
    }


@pytest.fixture(autouse=True)
def reset_environment():
    """Reset environment before each test"""
    yield
    # Cleanup code here if needed


def pytest_configure(config):
    """Pytest configuration hook"""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test (requires API key)"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test (no external dependencies)"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
