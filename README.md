Network Device Manager with AI Command Generation & Tech Support Collection
======================================

An Apify Actor for managing and monitoring network devices with optional AI-powered diagnostic command generation using Cohere, plus comprehensive tech support data collection with MongoDB storage.

Features
-------

### Core Features (Minimum usecase)
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

### 🆕 Tech Support Collection (Optional)
- 💾 **Comprehensive data collection**: 25+ diagnostic commands per device
- 🗄️ **MongoDB storage**: Persistent historical data with structured schema
- 🏥 **Health assessment**: Automatic CPU, memory, disk, and network monitoring
- 📈 **Trend analysis**: Track device health over time
- 🚨 **Alert system**: Automatic detection of critical issues
- 📋 **Device registry**: Centralized tracking of all network devices

Three Operating Modes
---------------------

This actor supports three distinct operating modes:

### 1️⃣ Plain Command Execution (Manual Mode)
Execute predefined commands across multiple devices without AI assistance.

**Use Case:** Run specific diagnostic or configuration commands on a fleet of devices.

**Example:** Check disk space, verify services, or retrieve configurations.

```json
{
  "devices": [...],
  "commands": ["df -h", "systemctl status nginx", "cat /etc/hosts"]
}
```

### 2️⃣ AI-Powered Command Generation (Problem-Solving Mode)
Describe a problem and let AI generate appropriate diagnostic commands.

**Use Case:** Don't know which commands to run? Describe the issue and get AI-suggested commands.

**Example:** "Server responding slowly" → AI generates CPU, memory, network diagnostics.

```json
{
  "devices": [...],
  "problemDescription": "Server experiencing high CPU and slow response times",
  "includeWarnCommands": false
}
```

### 3️⃣ Tech Support Collection (Monitoring Mode)
Collect comprehensive diagnostic data (25+ commands) and store in MongoDB for historical analysis.

**Use Case:** Continuous monitoring, trend analysis, capacity planning, incident investigation.

**Example:** Automated hourly collection with health alerts and historical tracking.

```json
{
  "devices": [...],
  "techSupportCollection": true,
  "mongodbConnectionString": "mongodb+srv://..."
}
```

| Feature | Manual Mode | AI Mode | Tech Support Mode |
|---------|-------------|---------|-------------------|
| **Commands** | User-defined | AI-generated | 25+ predefined |
| **Storage** | Apify Dataset/KV | Apify Dataset/KV | MongoDB + Apify |
| **History** | ❌ | ❌ | ✅ Long-term |
| **Health Alerts** | ❌ | ❌ | ✅ Automatic |
| **Use Case** | Ad-hoc tasks | Problem diagnosis | Continuous monitoring |
| **AI Required** | ❌ | ✅ Cohere API | ❌ |
| **MongoDB Required** | ❌ | ❌ | ✅ |

Requirements
------------

- Python 3.8+
- Dependencies listed in `requirements.txt`
- Cohere API key (optional, for AI features)
- MongoDB connection string (optional, for tech support collection)

Quick start (local)
-------------------

1. Create and activate a virtual environment (recommended):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Set environment variables (optional):

```bash
export COHERE_API_KEY="your-cohere-api-key"
export MONGODB_CONNECTION_STRING="mongodb+srv://user:pass@cluster.mongodb.net/"
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
    "whoami",
    "uptime",
    "df -h"
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

### 🆕 Tech Support Collection (MongoDB Storage)

```json
{
  "devices": [
    {
      "ip": "192.168.1.1",
      "username": "root",
      "password": "password"
    },
    {
      "ip": "192.168.1.2",
      "username": "admin",
      "password": "password"
    }
  ],
  "techSupportCollection": true,
  "mongodbConnectionString": "mongodb+srv://user:pass@cluster.mongodb.net/",
  "databaseName": "network_techsupport"
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
  - `username` (string, optional): SSH username (default: "root")
  - `password` (string, optional): SSH password (default: "root")
  - `port` (integer, optional): SSH port (default: 22)

### Mode Selection

Choose one of two operating modes:

#### **Standard Mode** (Default)
Execute manual or AI-generated commands, store in Apify Dataset/KV Store.

Optional fields:
- **`commands`** (array of strings): Manual commands to execute
- **`problemDescription`** (string): Problem description for AI command generation
- **`includeWarnCommands`** (boolean, default: false): Include potentially dangerous commands
- **`cohereApiKey`** (string): Cohere API key (or use `COHERE_API_KEY` env var)

#### **Tech Support Collection Mode**
Collect comprehensive diagnostic data, store in MongoDB.

Required fields:
- **`techSupportCollection`** (boolean): Set to `true` to enable
- **`mongodbConnectionString`** (string): MongoDB connection string

Optional fields:
- **`databaseName`** (string, default: "network_techsupport"): MongoDB database name

Command Severity Levels (Standard Mode)
-----------------------

### SAFE Commands (Always Included)
Read-only operations: `ps`, `netstat`, `df`, `free`, `cat /proc/*`, `ip addr`, `uptime`

### WARN Commands (Optional)
Potentially disruptive: `systemctl restart`, `killall`, `iptables -F`, `ifdown/ifup`, `rm -rf`

⚠️ **WARN commands require `includeWarnCommands: true`** to be executed

Tech Support Collection Details
--------------------------------

### Data Collected (20+ Commands)

**System Information:**
- Hostname, kernel version, OS release
- Uptime and system load

**Hardware Metrics:**
- CPU usage, cores, load average
- Memory (total, used, free, swap)
- Disk usage per partition

**Network Information:**
- Interface details (IP, MAC, state, MTU)
- Network statistics (bytes, packets, errors)
- Routing table, DNS servers, open ports
- Active connections (TCP/UDP)

**Process & Services:**
- Total process count
- Top CPU and memory consumers
- Active systemd services

**Security:**
- Logged-in users
- Recent login history
- Failed login attempts

**Logs:**
- Recent errors from syslog/journalctl
- Recent warnings

### Health Assessment

Automatic health checks with alerting:

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| CPU Usage | > 80% | > 90% |
| Memory Usage | > 85% | > 95% |
| Disk Usage | > 85% | > 95% |
| Load Average | > (cores × 2) | - |
| Network Errors | > 100 errors | - |

**Health Status:**
- `healthy` - No alerts
- `warning` - One or more warning-level alerts
- `critical` - One or more critical-level alerts

### MongoDB Schema

#### Collection: `tech_support_data`
Stores complete diagnostic snapshots for each device.

```javascript
{
  device_ip: "192.168.1.1",
  hostname: "web-server-01",
  collected_at: ISODate("2024-12-27T10:30:00Z"),
  system: { /* OS, kernel, uptime */ },
  hardware: { /* CPU, memory, disk */ },
  network: { /* interfaces, routes, ports */ },
  processes: { /* process stats */ },
  services: { /* active services */ },
  security: { /* users, logins */ },
  logs: { /* errors, warnings */ },
  health: {
    status: "healthy",
    alerts: [
      { level: "warning", message: "High CPU usage: 85%" }
    ]
  }
}
```

#### Collection: `devices`
Device registry tracking all monitored devices.

```javascript
{
  ip_address: "192.168.1.1",
  hostname: "web-server-01",
  first_seen: ISODate("2024-01-01T00:00:00Z"),
  last_seen: ISODate("2024-12-27T10:30:00Z"),
  status: "active",
  last_health_status: "healthy",
  total_collections: 156
}
```

#### Collection: `collection_runs`
Tracks each collection run with summary statistics.

```javascript
{
  run_id: "uuid",
  started_at: ISODate("2024-12-27T10:30:00Z"),
  duration_seconds: 300,
  devices_processed: 50,
  devices_successful: 48,
  devices_failed: 2,
  total_alerts: 15,
  critical_devices: ["192.168.1.5"]
}
```


Output Structure
----------------

### Standard Mode

**Dataset (OUTPUT Tab):**
- Device IP and port
- Connection status
- Command statistics (total/successful/failed)
- Success rate percentage
- Nested command details

**Key-Value Store:**
- `device_{ip}_{port}` - Detailed command outputs per device
- `execution_summary` - Overall execution statistics
- `ai_generated_commands` - AI generation metadata (when AI is used)

### Tech Support Collection Mode

**Apify Dataset:**
- Per-device summary (IP, status, health, alerts, MongoDB document ID)
- Real-time visibility into collection progress

**MongoDB:**
- Complete tech support data in `tech_support_data` collection
- Device registry in `devices` collection
- Run summaries in `collection_runs` collection

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
│   └── dataset_schema.json     # Dataset Schema
├── src/
│   ├── __main__.py             # Main entry point
│   ├── main.py                 # Main actor logic
│   ├── actor/
│   │   ├── command_generator.py # AI command generation
│   │   ├── connect.py          # SSH client implementation
│   │   ├── manager.py          # Command execution manager
│   │   └── tech_support.py     # Tech support collection workflow
│   ├── input/
│   │   └── loader.py           # Device configuration loader
│   ├── models/
│   │   ├── command.py          # Command result model
│   │   ├── device.py           # Device model
│   │   ├── result.py           # Device result model
│   │   └── techsupport.py      # Tech support data models
│   ├── db/
│   │   ├── connect.py          # MongoDB client
│   │   └── storage.py          # Tech support storage layer
│   └── utils/
│       └── constants.py        # Command definitions
├── Dockerfile                  # Docker configuration
├── requirements.txt            # Python dependencies
├── README.md                   # Project Documentation
└── ARCHITECTURE.md             # Architecture documentation
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
1. Start with `includeWarnCommands: false` in standard mode
2. Review AI-generated commands before enabling WARN
3. Use read-only commands for SAFE operations
4. Store MongoDB credentials securely (use secrets)

### Problem Descriptions (AI Mode)
- ✅ Be specific: "95% CPU usage, Apache consuming most resources"
- ✅ Include symptoms: "eth0 dropping packets, high error rate"
- ❌ Avoid vague: "Server is slow"
- ❌ Avoid generic: "Fix the network"

### Tech Support Collection
- Run on a schedule (hourly/daily) for continuous monitoring
- Set up MongoDB with proper indexes (handled automatically)
- Monitor the `critical_devices` array in collection runs
- Use health status for alerting integration
- Retain data based on your compliance requirements (configure TTL index if needed)

Use Cases
---------

### Standard Mode
- **Ad-hoc diagnostics**: Quickly investigate issues with AI-generated commands
- **Batch operations**: Execute commands across multiple devices
- **Testing**: Validate configurations or connectivity

### Tech Support Collection Mode
- **Continuous monitoring**: Track device health over time
- **Capacity planning**: Analyze resource usage trends
- **Incident investigation**: Query historical data during outages
- **Compliance**: Maintain audit trail of device configurations
- **Proactive maintenance**: Detect issues before they become critical

Environment Variables
--------------------

- `COHERE_API_KEY`: Your Cohere API key (for AI features)
- `MONGODB_CONNECTION_STRING`: MongoDB connection string (for tech support collection)

Notes
-----

- To deploy to Apify platform, use `apify push`
- AI features are optional - actor works in normal mode without AI
- Tech support collection is a separate mode from standard command execution
- WARN commands require explicit opt-in for safety (standard mode only)
- MongoDB is required only for tech support collection mode
- All standard mode outputs are stored in Apify Dataset and Key-Value Store
- Tech support data is stored in MongoDB with Apify Dataset for visibility

Performance
-----------

### Standard Mode
- Concurrent device execution
- Sequential command execution per device
- AI generation: 1-3 seconds (one-time per problem)

### Tech Support Collection
- 25+ commands per device
- Concurrent device processing
- Parsing: ~50-100ms per device
- Total time: ~5 seconds for 10 devices
- MongoDB operations: ~100ms per device

Troubleshooting
---------------

### MongoDB Connection Issues
- Verify connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/`
- Check network access (whitelist Apify IPs if using MongoDB Atlas)
- Ensure database user has read/write permissions

### SSH Connection Failures
- Verify device IP, port, username, password
- Check firewall rules on target devices
- Ensure SSH service is running on target devices

### AI Generation Failures
- Verify Cohere API key is valid
- Check API quota/rate limits
- Falls back to manual commands on failure

Future Scope
------------

| Feature | Current | Future Scope 1 | Future Scope 2 | Future Scope 3 |
|---------|---------|----------------|----------------|----------------|
| **Detection** | Static thresholds | ML anomaly detection | Real-time dashboard | Automated remediation |
| **Response** | Manual | Predictive alerts | Visual alerts | Auto-fix with approval |
| **Value** | Basic monitoring | Proactive maintenance | Better visibility | Self-healing infrastructure |
| **Effort** | - | Medium (ML training) | High (full dashboard) | High (playbook engine) |
| **Impact** | - | High (prevent outages) | Medium (UX improvement) | Very High (reduce MTTR) |


Problems Faced and Resolution
-----------------------------
- Apify Actor O/P schema rendering (Friction is high as compared to Input Schema)
- Keeping Code Readable/Reusable (Interaction with Clients (MongoDB, Cohere, etc...) => Made use of Singleton Design Pattern, Used Pydantic & TS types whereever applicable)
- Keeping the command executable irrespective of the Linux Distro
- Stats Not Updating from MongoDB (Translated TS to Python, found RC in just 5 lines of code)
- Vercel Deployment (Not been successfuly though `npm run build` works fine locally. The reason for this friction is definitely the project structure i.e. using a Next.JS framework for a Python <> Apify codebase)
- Interact with TS Collect Data (Speak, Text, MultiLingual WIP - For sure will be doable with some more)

License
-------

MIT

**Note**: This Actor requires network access to target devices. AI features require a Cohere API key. Tech support collection requires MongoDB connection.
