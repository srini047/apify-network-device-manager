Network Device Manager with AI Command Generation
======================================

An Apify Actor for managing and monitoring network devices with optional AI-powered diagnostic command generation using Cohere.

Features
-------

### Core Features
- ✅ Execute commands on multiple network devices via SSH
- ✅ Store results in Apify Dataset (tabular view) and Key-Value Store (detailed outputs)
- ✅ Track command execution success/failure rates
- ✅ Support for concurrent device execution
- ✅ Handle connection errors gracefully

### 🆕 AI Command Generation (Optional)
- 🤖 **Automatic command generation** based on problem descriptions
- 🔒 **Safety levels**: SAFE (read-only) vs WARN (potentially disruptive)
- 🎯 **Smart diagnostics**: AI analyzes your problem and suggests relevant commands
- 📊 **Command metadata**: Each generated command includes description and reasoning

Requirements
------------

- Python 3.8+
- Dependencies listed in `requirements.txt`
- Cohere API key (optional, for AI features)

Quick start (local)
-------------------

1. Create and activate a virtual environment (recommended):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Set environment variables (optional, for AI features or set via `input.json`):

```bash
export COHERE_API_KEY="your-cohere-api-key"
```

3. Run the actor locally:

```bash
apify run --input-file=<input_file.json>
```

Usage Examples
--------------

### Basic Usage (Manual Commands)

```json
{
  "devices": [
    {
      "ip": "192.168.1.1",
      "username": "admin",
      "password": "password",
      "port": 22
    }
  ],
  "commands": [
    "whoami"
  ]
}
```

### AI-Powered Usage (Problem Description)

```json
{
  "devices": [
    {
      "ip": "192.168.1.1",
      "username": "admin",
      "password": "password"
    }
  ],
  "problemDescription": "Server experiencing high CPU usage and slow response times",
  "includeWarnCommands": false
}
```

### Combined Usage (AI + Manual Commands)

```json
{
  "devices": [
    {
      "ip": "192.168.1.1",
      "username": "admin",
      "password": "password"
    }
  ],
  "problemDescription": "Network connectivity issues",
  "commands": ["cat /etc/resolv.conf"],
  "includeWarnCommands": false
}
```

Input Schema
------------

### Required Fields

- **`devices`** (array): List of network devices
  - `ip` (string, required): Device IP address
  - `username` (string, optional): SSH username
  - `password` (string, optional): SSH password
  - `port` (integer, optional): SSH port (default: 22)

### Optional Fields

- **`commands`** (array of strings): Manual commands to execute
- **`problemDescription`** (string): Problem description for AI command generation
- **`includeWarnCommands`** (boolean, default: false): Include potentially dangerous commands
- **`cohereApiKey`** (string): Cohere API key (or use `COHERE_API_KEY` env var)

Command Severity Levels
-----------------------

### SAFE Commands (Always Included)
Read-only operations: `ps`, `netstat`, `df`, `free`, `cat /proc/*`, `ip addr`, `uptime`

### WARN Commands (Optional)
Potentially disruptive: `systemctl restart`, `killall`, `iptables -F`, `ifdown/ifup`, `rm -rf`

⚠️ **WARN commands require `includeWarnCommands: true`** to be executed

Output Structure
----------------

### Dataset (OUTPUT Tab)
- Device IP and port
- Connection status
- Command statistics (total/successful/failed)
- Success rate percentage
- Nested command details

### Key-Value Store
- `device_{ip}_{port}` - Detailed command outputs per device
- `execution_summary` - Overall execution statistics
- `ai_generated_commands` - AI generation metadata (when AI is used)

Docker (optional)
-----------------

To create test docker containers to verify locally:

```bash
docker build -t alpine-ssh:latest -f Devices.Dockerfile .
docker-compose down
docker-compose up -d
```

Project layout
--------------

```
network-device-manager/
├── .actor/
│   ├── actor.json              # Apify Actor configuration
│   ├── input_schema.json       # Input schema
│   └── output_schema.json      # Output schema
|   └── dataset_schema.json     # Dataset Schema
├── src/
│   ├── __main__.py             # Main entry point
│   ├── actor/
│   │   ├── command_generator.py # AI command generation
│   │   ├── connect.py          # SSH client implementation
│   │   └── manager.py          # Command execution manager
│   ├── input/
│   │   └── loader.py           # Device configuration loader
│   ├── models/
│   │   ├── command.py          # Command result model
│   │   ├── command.py          # Device model
│   │   └── result.py           # Device result model
│   └── utils/
│       └── constants.py        # Command definitions
├── Dockerfile                  # Docker configuration
├── requirements.txt            # Python dependencies
└── README.md            # Project Documentation
```

AI Command Generation
---------------------

When a `problemDescription` is provided, the actor uses Cohere's AI to generate relevant diagnostic commands:

1. **Problem Analysis**: AI analyzes the description
2. **Command Generation**: Generates 5-10 diagnostic commands
3. **Severity Classification**: Marks each as SAFE or WARN
4. **Filtering**: Applies based on `includeWarnCommands` setting
5. **Execution**: Runs filtered commands on devices
6. **Metadata Storage**: Saves generation details

Example AI-generated commands for "High CPU usage":
- `top -bn1 | head -20` - Show top processes
- `ps aux --sort=-%cpu | head -15` - CPU-sorted processes
- `mpstat 1 5` - CPU statistics
- `vmstat 1 5` - Virtual memory stats

Best Practices
--------------

### Security
1. Start with `includeWarnCommands: false`
2. Review AI-generated commands before enabling WARN
3. Use read-only commands for SAFE operations

### Problem Descriptions
- ✅ Be specific: "95% CPU usage, Apache consuming most resources"
- ✅ Include symptoms: "eth0 dropping packets, high error rate"
- ❌ Avoid vague: "Server is slow"
- ❌ Avoid generic: "Fix the network"

Environment Variables
--------------------

- `COHERE_API_KEY`: Your Cohere API key (for AI features)

Notes
-----

- To deploy to Apify platform, use `apify push`
- AI features are optional - actor works in just normal mode itself
- WARN commands require explicit opt-in for safety
- All outputs are stored in Apify Dataset and Key-Value Store


License
-------

MIT

**Note**: This Actor requires network access to target devices. AI features require a Cohere API key.
