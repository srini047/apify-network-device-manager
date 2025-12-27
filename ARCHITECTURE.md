# Architecture: AI-Enhanced Network Device Manager with Tech Support Collection

## Three Operating Modes

This actor operates in one of three distinct modes, selected at runtime via input parameters:

```
                        ┌──────────────────┐
                        │   Actor Input    │
                        └────────┬─────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌───────────────────┐  ┌──────────────┐  ┌─────────────────────┐
    │   MODE 1:         │  │   MODE 2:    │  │   MODE 3:           │
    │   Manual Commands │  │   AI Problem │  │   Tech Support      │
    │   Execution       │  │   Solving    │  │   Collection        │
    └─────────┬─────────┘  └──────┬───────┘  └──────────┬──────────┘
              │                   │                      │
              │                   │                      │
    ┌─────────▼─────────┐  ┌──────▼───────┐  ┌──────────▼──────────┐
    │ User provides     │  │ User provides│  │ Predefined 20+      │
    │ specific commands │  │ problem desc │  │ diagnostic commands │
    │                   │  │ AI generates │  │                     │
    │ commands: [...]   │  │ commands     │  │ techSupportCollection│
    └─────────┬─────────┘  └──────┬───────┘  └──────────┬──────────┘
              │                   │                      │
              └───────────────────┼──────────────────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │  SSH Execution   │
                        │  (All Devices)   │
                        └────────┬─────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌───────────────────┐  ┌──────────────┐  ┌─────────────────────┐
    │ Store in:         │  │ Store in:    │  │ Store in:           │
    │ - Apify Dataset   │  │ - Apify Data │  │ - MongoDB (primary) │
    │ - Apify KV Store  │  │ - Apify KV   │  │ - Apify Dataset     │
    │                   │  │ - AI metadata│  │   (visibility)      │
    └───────────────────┘  └──────────────┘  └─────────────────────┘
```

### Mode Comparison

| Aspect | Mode 1: Manual | Mode 2: AI Problem Solving | Mode 3: Tech Support |
|--------|----------------|----------------------------|---------------------|
| **Trigger** | `commands: [...]` | `problemDescription: "..."` | `techSupportCollection: true` |
| **Commands** | User-defined | AI-generated (Cohere) | 20+ predefined diagnostics |
| **Command Count** | 1-100 per device | 5-15 (AI-suggested) | 20+ per device |
| **Storage** | Apify Dataset + KV | Apify Dataset + KV | MongoDB + Apify Dataset |
| **Historical Data** | ❌ Session only | ❌ Session only | ✅ Persistent MongoDB |
| **Health Monitoring** | ❌ | ❌ | ✅ Automatic alerts |
| **Trend Analysis** | ❌ | ❌ | ✅ Time-series queries |
| **Device Registry** | ❌ | ❌ | ✅ Centralized tracking |
| **Use Case** | Specific tasks | Unknown diagnostics | Continuous monitoring |
| **AI Required** | ❌ | ✅ Cohere API key | ❌ |
| **MongoDB Required** | ❌ | ❌ | ✅ Connection string |
| **Best For** | Known commands | Problem diagnosis | Long-term monitoring |

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          APIFY ACTOR                                │
│              Network Device Manager (AI + Tech Support)             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Input
                                  ▼
                    ┌─────────────────────────┐
                    │    Input Processing     │
                    │  - Devices list         │
                    │  - Problem description  │
                    │  - Manual commands      │
                    │  - Tech support mode    │
                    │  - MongoDB config       │
                    │  - Settings             │
                    └─────────────────────────┘
                                  │
            ┌─────────────────────┴─────────────────────┐
            │                                           │
            │ techSupportCollection = true?             │
            │                                           │
    ┌───────▼───────┐                         ┌────────▼────────┐
    │  Tech Support │                         │  Standard Mode  │
    │     Mode      │                         │   (AI/Manual)   │
    └───────┬───────┘                         └────────┬────────┘
            │                                          │
            │                                          │
            ▼                                          ▼
┌───────────────────────┐              ┌──────────────────────────┐
│ Tech Support Workflow │              │   AI/Manual Workflow     │
│                       │              │                          │
│ 1. Execute 20+ cmds   │              │ 1. AI command generation │
│ 2. Parse results      │              │ 2. Manual commands       │
│ 3. Assess health      │              │ 3. Merge & deduplicate   │
│ 4. Store in MongoDB   │              │ 4. Execute commands      │
│ 5. Track devices      │              │ 5. Store in Dataset/KV   │
└───────────┬───────────┘              └──────────────┬───────────┘
            │                                         │
            │                                         │
            ▼                                         ▼
┌───────────────────────┐              ┌──────────────────────────┐
│  MongoDB Collections  │              │    Apify Storage         │
│                       │              │                          │
│ - tech_support_data   │              │ - Dataset (table view)   │
│ - devices             │              │ - KV Store (details)     │
│ - collection_runs     │              │ - Summary & metadata     │
└───────────────────────┘              └──────────────────────────┘
```

## Component Architecture

### Input Layer

```
┌────────────────────────────────────────┐
│              Input Schema              │
├────────────────────────────────────────┤
│  devices[]                   REQUIRED  │
│    - ip                      REQUIRED  │
│    - username                OPTIONAL  │
│    - password                OPTIONAL  │
│    - port                    OPTIONAL  │
│                                        │
│  MODE SELECTION:                       │
│  ┌─────────────────────────────────┐  │
│  │ techSupportCollection  OPTIONAL │  │
│  │   - Boolean (default: false)    │  │
│  └─────────────────────────────────┘  │
│                                        │
│  TECH SUPPORT MODE (if enabled):      │
│  ┌─────────────────────────────────┐  │
│  │ mongodbConnectionString REQUIRED│  │
│  │ databaseName            OPTIONAL│  │
│  │   - default: network_techsupport│  │
│  └─────────────────────────────────┘  │
│                                        │
│  STANDARD MODE (if tech support off): │
│  ┌─────────────────────────────────┐  │
│  │ commands[]              OPTIONAL│  │
│  │ problemDescription      OPTIONAL│  │
│  │ includeWarnCommands     OPTIONAL│  │
│  │ cohereApiKey            OPTIONAL│  │
│  └─────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### 2. Tech Support Collection Module

```
┌─────────────────────────────────────────────────────┐
│              src/actor/tech_support.py              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │     run_tech_support_collection()            │  │
│  ├──────────────────────────────────────────────┤  │
│  │  1. Validate MongoDB connection              │  │
│  │  2. Initialize collections & indexes         │  │
│  │  3. Execute TECH_SUPPORT_COMMANDS            │  │
│  │     (20+ diagnostic commands)                │  │
│  │  4. Parse results into structured data       │  │
│  │  5. Assess health (CPU, Memory, Disk, etc.)  │  │
│  │  6. Store in MongoDB                         │  │
│  │  7. Update device registry                   │  │
│  │  8. Track run summary                        │  │
│  │  9. Report statistics                        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         Data Parsing Functions               │  │
│  ├──────────────────────────────────────────────┤  │
│  │  parse_device_result()                       │  │
│  │    ├─ _parse_system()    → SystemInfo        │  │
│  │    ├─ _parse_hardware()  → CPU, Memory, Disk │  │
│  │    ├─ _parse_network()   → Interfaces, Ports │  │
│  │    ├─ _parse_processes() → Process stats     │  │
│  │    ├─ _parse_services()  → Active services   │  │
│  │    ├─ _parse_security()  → Users, logins     │  │
│  │    ├─ _parse_logs()      → Errors, warnings  │  │
│  │    └─ _assess_health()   → Generate alerts   │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         Helper Functions                     │  │
│  ├──────────────────────────────────────────────┤  │
│  │  _get_output()         → Safe output access  │  │
│  │  _parse_size()         → Parse disk sizes    │  │
│  │  _extract_number()     → Extract from text   │  │
│  │  _create_run_summary() → Build run metadata  │  │
│  │  _log_final_summary()  → Report results      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### MongoDB Storage Layer

```
┌─────────────────────────────────────────────────────┐
│                   src/db/                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────┐               │
│  │      connect.py                  │               │
│  ├──────────────────────────────────┤               │
│  │  MongoDBClient                   │               │
│  │  ├─ connect()                    │               │
│  │  ├─ get_database()               │               │
│  │  ├─ get_collection()             │               │
│  │  ├─ ensure_collections_indexes() │               │
│  │  │   Creates indexes on:         │               │
│  │  │   - device_ip + collected_at  │               │
│  │  │   - health.status             │               │
│  │  │   - ip_address (devices)      │               │
│  │  └─ close()                      │               │
│  └──────────────────────────────────┘               │
│                                                     │
│  ┌──────────────────────────────────┐               │
│  │      storage.py                  │               │
│  ├──────────────────────────────────┤               │
│  │  TechSupportStorage              │               │
│  │  ├─ initialize()                 │               │
│  │  │   Sets up collections         │               │
│  │  ├─ store_tech_support()         │               │
│  │  │   Inserts TechSupportData     │               │
│  │  ├─ _update_device_registry()    │               │
│  │  │   Upserts device info         │               │
│  │  │   Tracks last_seen, health    │               │
│  │  └─ store_run_summary()          │               │
│  │      Saves collection metadata   │               │
│  └──────────────────────────────────┘               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Data Models (Pydantic)

```
┌─────────────────────────────────────────────────────┐
│              src/models/techsupport.py              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TechSupportData                                    │
│  ├─ device_ip: str                                  │
│  ├─ device_label: str                               │
│  ├─ hostname: str                                   │
│  ├─ collected_at: datetime                          │
│  ├─ collection_duration_ms: int                     │
│  │                                                  │
│  ├─ system: SystemInfo                              │
│  │   ├─ hostname, kernel, os_release               │
│  │   └─ uptime_seconds, uptime_human               │
│  │                                                  │
│  ├─ hardware: HardwareInfo                          │
│  │   ├─ cpu: CPUInfo                                │
│  │   │   ├─ usage_percent                           │
│  │   │   ├─ load_average (1/5/15 min)              │
│  │   │   └─ cores                                   │
│  │   ├─ memory: MemoryInfo                          │
│  │   │   ├─ total_mb, used_mb, free_mb             │
│  │   │   ├─ usage_percent                           │
│  │   │   └─ swap (total, used, free)               │
│  │   └─ disk: List[DiskInfo]                        │
│  │       ├─ filesystem, mount_point                │
│  │       ├─ size_gb, used_gb, available_gb         │
│  │       └─ usage_percent                           │
│  │                                                  │
│  ├─ network: NetworkInfo                            │
│  │   ├─ interfaces: List[NetworkInterface]          │
│  │   │   ├─ name, state, ip_addresses              │
│  │   │   ├─ mac_address, mtu                       │
│  │   │   └─ rx/tx (bytes, packets, errors)        │
│  │   ├─ routing_table: List[Route]                  │
│  │   ├─ connections: ConnectionStats                │
│  │   ├─ dns_servers: List[str]                      │
│  │   └─ open_ports: List[int]                       │
│  │                                                  │
│  ├─ processes: ProcessStats                         │
│  │   ├─ total_count                                 │
│  │   ├─ top_cpu_processes: List[ProcessInfo]       │
│  │   └─ top_memory_processes: List[ProcessInfo]    │
│  │                                                  │
│  ├─ services: Dict[str, str]                        │
│  │   (service_name → status)                       │
│  │                                                  │
│  ├─ security: SecurityInfo                          │
│  │   ├─ users_logged_in                            │
│  │   ├─ last_logins: List[LoginInfo]               │
│  │   └─ failed_login_attempts                      │
│  │                                                  │
│  ├─ logs: LogInfo                                   │
│  │   ├─ error_count, warning_count                 │
│  │   ├─ recent_errors: List[LogEntry]              │
│  │   └─ recent_warnings: List[LogEntry]            │
│  │                                                  │
│  └─ health: HealthInfo                              │
│      ├─ status: "healthy"|"warning"|"critical"     │
│      ├─ issues: List[str]                          │
│      └─ alerts: List[HealthAlert]                   │
│          ├─ level: "info"|"warning"|"critical"     │
│          └─ message: str                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### AI Command Generation Module (AI Mode)

```
┌─────────────────────────────────────────────────────┐
│            src/actor/command_generator.py           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────┐               │
│  │        AICommandGenerator         │               │
│  ├──────────────────────────────────┤               │
│  │  + __init__(api_key)              │               │
│  │  + generate_commands()            │               │
│  │  - _build_prompt()                │               │
│  │  - _parse_cohere_response()       │               │
│  └──────────────────────────────────┘               │
│                                                     │
│  ┌──────────────────────────────────┐               │
│  │        GeneratedCommand           │               │
│  ├──────────────────────────────────┤               │
│  │  - command: str                   │               │
│  │  - severity: "safe" | "warn"      │               │
│  │  - description: str               │               │
│  │  - reasoning: str                 │               │
│  └──────────────────────────────────┘               │
│                                                     │
│  ┌──────────────────────────────────┐               │
│  │        Helper Functions           │               │
│  ├──────────────────────────────────┤               │
│  │  + filter_commands_by_severity()  │               │
│  └──────────────────────────────────┘               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Execution Flows

### Tech Support Collection Flow

```
┌──────────────────────────────────────────────────────────┐
│              Tech Support Collection Flow                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Validate Input                                       │
│     ├─ Check techSupportCollection = true               │
│     ├─ Verify mongodbConnectionString                   │
│     └─ Load device list                                  │
│                                                          │
│  2. Initialize MongoDB                                   │
│     ├─ Connect to MongoDB cluster                       │
│     ├─ Create/verify collections:                       │
│     │   ├─ tech_support_data                            │
│     │   ├─ devices (registry)                           │
│     │   └─ collection_runs                              │
│     ├─ Create indexes for performance                   │
│     └─ Get collection handles                           │
│                                                          │
│  3. Execute Commands (Concurrent)                        │
│     ├─ Load TECH_SUPPORT_COMMANDS (20+ commands)        │
│     │   From src/utils/constants.py                     │
│     ├─ Execute on all devices in parallel               │
│     │   Via src/actor/manager.py                        │
│     └─ Collect DeviceResult for each device             │
│                                                          │
│  4. Parse & Assess (Per Device)                          │
│     ├─ Parse system info                                │
│     │   → hostname, kernel, OS, uptime                  │
│     ├─ Parse hardware metrics                           │
│     │   → CPU, memory, disk usage                       │
│     ├─ Parse network info                               │
│     │   → interfaces, routes, connections, ports        │
│     ├─ Parse processes & services                       │
│     │   → running processes, active services            │
│     ├─ Parse security info                              │
│     │   → logged users, login history, failures         │
│     ├─ Parse system logs                                │
│     │   → recent errors and warnings                    │
│     └─ Assess health                                    │
│         → Generate alerts based on thresholds           │
│                                                          │
│  5. Store in MongoDB                                     │
│     ├─ Insert TechSupportData document                  │
│     │   → Complete diagnostic snapshot                  │
│     ├─ Update device registry (upsert)                  │
│     │   ├─ Update last_seen timestamp                   │
│     │   ├─ Update hostname                              │
│     │   ├─ Track health status                          │
│     │   ├─ Store last_collection_id                     │
│     │   └─ Increment collection count                   │
│     └─ Store in Apify Dataset                           │
│         → Per-device summary for visibility             │
│                                                          │
│  6. Track Run Summary                                    │
│     ├─ Generate unique run_id (UUID)                    │
│     ├─ Count successful/failed devices                  │
│     ├─ Count total alerts across all devices            │
│     ├─ Identify critical devices                        │
│     ├─ Calculate total duration                         │
│     └─ Store run summary in collection_runs             │
│                                                          │
│  7. Report & Cleanup                                     │
│     ├─ Log final summary to console                     │
│     │   ├─ Success/failure counts                       │
│     │   ├─ Alert summary                                │
│     │   ├─ Critical device list                         │
│     │   └─ Total duration                               │
│     ├─ Close MongoDB connection                         │
│     └─ Charge per device                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Standard Mode Flow (AI/Manual)

```
┌──────────────────────────────────────────────────────────┐
│                  Standard Mode Flow                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Load Input                                           │
│     ├─ Parse devices                                     │
│     ├─ Extract problem description                       │
│     ├─ Get manual commands                               │
│     └─ Get settings (includeWarnCommands, etc.)          │
│                                                          │
│  2. Command Assembly                                     │
│     ├─ IF problemDescription exists:                     │
│     │   ├─ Initialize AICommandGenerator                 │
│     │   ├─ Call Cohere API                               │
│     │   ├─ Parse AI response                             │
│     │   ├─ Filter by severity                            │
│     │   └─ Add to final_commands                         │
│     │                                                    │
│     ├─ Add manual commands                               │
│     ├─ Add default RUN_COMMANDS                          │
│     └─ Remove duplicates (preserve order)                │
│                                                          │
│  3. Execute Commands                                     │
│     ├─ For each device (parallel):                       │
│     │   ├─ SSH connect                                   │
│     │   ├─ Execute commands sequentially                 │
│     │   ├─ Capture stdout/stderr/exit_code               │
│     │   └─ Build DeviceResult                            │
│     └─ Collect all results                               │
│                                                          │
│  4. Store Results (Apify Platform)                       │
│     ├─ Dataset: device summaries (table view)            │
│     │   ├─ Device info & connection status               │
│     │   ├─ Command statistics                            │
│     │   └─ Success/failure rates                         │
│     ├─ KV Store: detailed outputs per device             │
│     │   └─ Key: device_{ip}_{port}                       │
│     ├─ KV Store: execution summary                       │
│     │   └─ Key: execution_summary                        │
│     └─ KV Store: AI metadata (if AI used)                │
│         └─ Key: ai_generated_commands                    │
│                                                          │
│  5. Report Results                                       │
│     ├─ Log execution summary to console                  │
│     │   ├─ Device counts                                 │
│     │   ├─ Command statistics                            │
│     │   └─ Success rates                                 │
│     └─ Charge per device                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## MongoDB Database Schema

### Database: `network_techsupport`

```
┌─────────────────────────────────────────────────────────┐
│           Collection: tech_support_data                 │
├─────────────────────────────────────────────────────────┤
│  Purpose: Store complete diagnostic snapshots           │
│                                                         │
│  Document Structure:                                    │
│  {                                                      │
│    _id: ObjectId("..."),                                │
│    device_ip: "10.1.1.1",                               │
│    device_label: "root@10.1.1.1",                       │
│    hostname: "web-server-01",                           │
│    collected_at: ISODate("2024-12-27T10:30:00Z"),       │
│    collection_duration_ms: 4523,                        │
│                                                         │
│    system: {                                            │
│      hostname: "web-server-01",                         │
│      kernel: "5.15.0-91-generic",                       │
│      os_release: "Ubuntu 22.04.3 LTS",                  │
│      uptime_seconds: 8640000,                           │
│      uptime_human: "100 days, 3:45:23"                  │
│    },                                                   │
│                                                         │
│    hardware: {                                          │
│      cpu: {                                             │
│        usage_percent: 23.5,                             │
│        load_average_1min: 0.45,                         │
│        load_average_5min: 0.52,                         │
│        load_average_15min: 0.48,                        │
│        cores: 4                                         │
│      },                                                 │
│      memory: {                                          │
│        total_mb: 8192,                                  │
│        used_mb: 4096,                                   │
│        free_mb: 2048,                                   │
│        available_mb: 4096,                              │
│        usage_percent: 50.0,                             │
│        swap_total_mb: 2048,                             │
│        swap_used_mb: 0,                                 │
│        swap_free_mb: 2048                               │
│      },                                                 │
│      disk: [                                            │
│        {                                                │
│          filesystem: "/dev/sda1",                       │
│          mount_point: "/",                              │
│          size_gb: 100.0,                                │
│          used_gb: 45.0,                                 │
│          available_gb: 50.0,                            │
│          usage_percent: 47                              │
│        }                                                │
│      ]                                                  │
│    },                                                   │
│                                                         │
│    network: {                                           │
│      interfaces: [                                      │
│        {                                                │
│          name: "eth0",                                  │
│          state: "UP",                                   │
│          ip_addresses: ["192.168.1.10/24"],             │
│          mac_address: "00:0c:29:3a:5f:1e",              │
│          mtu: 1500,                                     │
│          rx_bytes: 123456789,                           │
│          tx_bytes: 987654321,                           │
│          rx_packets: 1234567,                           │
│          tx_packets: 9876543,                           │
│          rx_errors: 0,                                  │
│          tx_errors: 0,                                  │
│          rx_dropped: 5,                                 │
│          tx_dropped: 2                                  │
│        }                                                │
│      ],                                                 │
│      routing_table: [                                   │
│        {                                                │
│          destination: "0.0.0.0",                        │
│          gateway: "192.168.1.1",                        │
│          interface: "eth0",                             │
│          metric: 0                                      │
│        }                                                │
│      ],                                                 │
│      connections: {                                     │
│        tcp_established: 45,                             │
│        tcp_listen: 12,                                  │
│        udp_open: 8,                                     │
│        total_connections: 65                            │
│      },                                                 │
│      dns_servers: ["8.8.8.8", "1.1.1.1"],               │
│      open_ports: [22, 80, 443, 3306]                    │
│    },                                                   │
│                                                         │
│    processes: {                                         │
│      total_count: 156,                                  │
│      running: 2,                                        │
│      sleeping: 154,                                     │
│      top_cpu_processes: [                               │
│        {                                                │
│          pid: 1234,                                     │
│          user: "root",                                  │
│          cpu_percent: 5.2,                              │
│          mem_percent: 2.1,                              │
│          command: "nginx"                               │
│        }                                                │
│      ],                                                 │
│      top_memory_processes: [...]                        │
│    },                                                   │
│                                                         │
│    services: {                                          │
│      "ssh": "active",                                   │
│      "nginx": "active",                                 │
│      "mysql": "active"                                  │
│    },                                                   │
│                                                         │
│    security: {                                          │
│      users_logged_in: 2,                                │
│      last_logins: [                                     │
│        {                                                │
│          user: "admin",                                 │
│          from_host: "192.168.1.100",                    │
│          login_time: "2024-12-26 09:15:00"              │
│        }                                                │
│      ],                                                 │
│      failed_login_attempts: 3                           │
│    },                                                   │
│                                                         │
│    logs: {                                              │
│      error_count: 2,                                    │
│      warning_count: 5,                                  │
│      recent_errors: [                                   │
│        {                                                │
│          timestamp: "2024-12-26 10:25:00",              │
│          severity: "ERROR",                             │
│          message: "Failed to connect to backup server"  │
│        }                                                │
│      ],                                                 │
│      recent_warnings: [...]                             │
│    },                                                   │
│                                                         │
│    health: {                                            │
│      status: "warning",  // "healthy"|"warning"|"critical" │
│      issues: [],                                        │
│      alerts: [                                          │
│        {                                                │
│          level: "warning",                              │
│          message: "High CPU usage: 85%"                 │
│        },                                               │
│        {                                                │
│          level: "warning",                              │
│          message: "High memory usage: 87%"              │
│        }                                                │
│      ]                                                  │
│    }                                                    │
│  }                                                      │
│                                                         │
│  Indexes:                                               │
│  ├─ { device_ip: 1, collected_at: -1 }  [compound]     │
│  ├─ { collected_at: -1 }                [single]       │
│  ├─ { health.status: 1 }                [single]       │
│  └─ { device_ip: 1 }                    [single]       │
│                                                         │
│  Optional TTL Index (for auto-cleanup):                 │
│  └─ { collected_at: 1 }, expireAfterSeconds: 7776000   │
│      (Expires docs after 90 days)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Collection: devices                        │
├─────────────────────────────────────────────────────────┤
│  Purpose: Device registry (one doc per device)          │
│                                                         │
│  Document Structure:                                    │
│  {                                                      │
│    _id: ObjectId("..."),                                │
│    ip_address: "10.1.1.1",              [unique]       │
│    label: "root@10.1.1.1",                              │
│    hostname: "web-server-01",                           │
│    first_seen: ISODate("2024-01-01T00:00:00Z"),         │
│    last_seen: ISODate("2024-12-27T10:30:00Z"),          │
│    status: "active",  // "active"|"inactive"|"error"    │
│    last_health_status: "healthy",                       │
│    last_collection_id: ObjectId("..."),                 │
│    total_collections: 156                               │
│  }                                                      │
│                                                         │
│  Indexes:                                               │
│  ├─ { ip_address: 1 }    [unique via upsert logic]     │
│  ├─ { last_seen: -1 }    [for recent devices]          │
│  ├─ { status: 1 }        [for filtering]               │
│  └─ { last_health_status: 1 }  [for health queries]    │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           Collection: collection_runs                   │
├─────────────────────────────────────────────────────────┤
│  Purpose: Track each collection run (batch execution)   │
│                                                         │
│  Document Structure:                                    │
│  {                                                      │
│    _id: ObjectId("..."),                                │
│    run_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",      │
│    started_at: ISODate("2024-12-27T10:30:00Z"),         │
│    completed_at: ISODate("2024-12-27T10:35:00Z"),       │
│    duration_seconds: 300,                               │
│                                                         │
│    devices_processed: 50,                               │
│    devices_successful: 48,                              │
│    devices_failed: 2,                                   │
│                                                         │
│    total_alerts: 15,                                    │
│    critical_devices: ["10.1.1.5", "10.1.1.23"],         │
│                                                         │
│    failed_devices: [                                    │
│      {                                                  │
│        ip: "10.1.1.99",                                 │
│        error: "Connection timeout"                      │
│      },                                                 │
│      {                                                  │
│        ip: "10.1.1.88",                                 │
│        error: "Authentication failed"                   │
│      }                                                  │
│    ]                                                    │
│  }                                                      │
│                                                         │
│  Indexes:                                               │
│  ├─ { run_id: 1 }        [unique identifier]           │
│  └─ { started_at: -1 }   [for recent runs]             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Health Assessment Logic

```
┌─────────────────────────────────────────────────────────┐
│              Health Assessment Rules                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CPU Usage:                                             │
│  ├─ > 90% → CRITICAL alert                              │
│  ├─ > 80% → WARNING alert                               │
│  └─ ≤ 80% → OK                                          │
│                                                         │
│  Memory Usage:                                          │
│  ├─ > 95% → CRITICAL alert                              │
│  ├─ > 85% → WARNING alert                               │
│  └─ ≤ 85% → OK                                          │
│                                                         │
│  Disk Usage (per partition):                            │
│  ├─ > 95% → CRITICAL alert                              │
│  ├─ > 85% → WARNING alert                               │
│  └─ ≤ 85% → OK                                          │
│                                                         │
│  Load Average (relative to cores):                      │
│  ├─ > (cores × 2) → WARNING alert                       │
│  │   Example: 4 cores → alert if load > 8.0            │
│  └─ ≤ (cores × 2) → OK                                  │
│                                                         │
│  Network Errors (per interface):                        │
│  ├─ (rx_errors + tx_errors) > 100 → WARNING alert      │
│  └─ ≤ 100 errors → OK                                   │
│                                                         │
│  Overall Health Status:                                 │
│  ├─ Any CRITICAL alert → status = "critical"            │
│  ├─ Any WARNING alert (no critical) → status = "warning"│
│  └─ No alerts → status = "healthy"                      │
│                                                         │
│  Alert Structure:                                       │
│  {                                                      │
│    level: "warning" | "critical",                       │
│    message: "High CPU usage: 85%"                       │
│  }                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Tech Support Commands

```
┌─────────────────────────────────────────────────────────┐
│      TECH_SUPPORT_COMMANDS (src/utils/constants.py)    │
│                    20+ Commands                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  System Information (5 commands):                       │
│  ├─ hostname                                            │
│  ├─ uname -r                                            │
│  ├─ cat /etc/os-release | grep PRETTY_NAME | ...       │
│  ├─ cat /proc/uptime                                    │
│  └─ uptime -p || uptime                                 │
│                                                         │
│  CPU & Load (3 commands):                               │
│  ├─ nproc                                               │
│  ├─ top -bn1 | grep "Cpu(s)" | head -1                  │
│  └─ cat /proc/loadavg                                   │
│                                                         │
│  Memory (1 command):                                    │
│  └─ free -m                                             │
│                                                         │
│  Disk (1 command):                                      │
│  └─ df -h                                               │
│                                                         │
│  Network (6 commands):                                  │
│  ├─ ip -j addr show || ip addr show                     │
│  ├─ cat /proc/net/dev                                   │
│  ├─ ip -j route show || ip route show                   │
│  ├─ cat /etc/resolv.conf | grep nameserver              │
│  ├─ ss -s || netstat -s | head -20                      │
│  └─ ss -tuln || netstat -tuln                           │
│                                                         │
│  Processes (4 commands):                                │
│  ├─ ps aux | wc -l                                      │
│  ├─ ps -eo stat | tail -n +2 | cut -c1 | sort | uniq -c│
│  ├─ ps aux --sort=-%cpu | head -11                      │
│  └─ ps aux --sort=-%mem | head -11                      │
│                                                         │
│  Services (1 command):                                  │
│  └─ systemctl list-units --type=service --state=running │
│                                                         │
│  Security (3 commands):                                 │
│  ├─ w -h | wc -l                                        │
│  ├─ last -n 10 -w                                       │
│  └─ grep "Failed password" /var/log/auth.log | tail -5  │
│                                                         │
│  Logs (2 commands):                                     │
│  ├─ journalctl -p err -n 20 --no-pager || ...           │
│  └─ journalctl -p warning -n 20 --no-pager || ...       │
│                                                         │
│  Characteristics:                                       │
│  ├─ All commands are read-only (SAFE)                   │
│  ├─ Work on most Linux distributions                    │
│  ├─ Fallback alternatives for compatibility             │
│  └─ Executed sequentially per device                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Integration Points

```
┌──────────────────┐
│  Cohere API      │  ← AI command generation (Standard Mode only)
│  api.cohere.ai   │     Model: command-r-plus
│                  │     Used for: Problem → Commands
└──────────────────┘

┌──────────────────┐
│  MongoDB         │  ← Tech support data storage
│  Atlas/Self-host │     Database: network_techsupport
│                  │     Collections: tech_support_data, devices, runs
│                  │     Used for: Historical data, trend analysis
└──────────────────┘

┌──────────────────┐
│  Apify Platform  │  ← Execution environment & storage
│  - Actor Runtime │     Used in both modes
│  - Dataset       │     Tech Support: device summaries
│  - KV Store      │     Standard: detailed outputs, metadata
│  - Logging       │     Both: execution logs
│  - Charging      │     Both: per-device charging
└──────────────────┘

┌──────────────────┐
│  Network Devices │  ← SSH connections (both modes)
│  - Linux servers │     Port: 22 (default)
│  - Routers       │     Auth: username/password
│  - Switches      │     Protocol: SSH
└──────────────────┘
```

## Error Handling Strategy

```
┌─────────────────────────────────────────┐
│         Error Recovery Flow             │
├─────────────────────────────────────────┤
│                                         │
│  MongoDB Connection Failed              │
│  ├─ Log error with full details         │
│  ├─ Exit tech support mode gracefully   │
│  ├─ Do not proceed with collection      │
│  └─ Return error to user                │
│                                         │
│  AI Generation Failed (Standard Mode)   │
│  ├─ Log error and API response          │
│  ├─ Return empty command list           │
│  ├─ Continue with manual commands       │
│  └─ No impact on execution              │
│                                         │
│  SSH Connection Failed                  │
│  ├─ Log connection error with details   │
│  ├─ Mark device as failed               │
│  ├─ Store failure reason                │
│  ├─ Continue with other devices         │
│  └─ Include in failed_devices list      │
│                                         │
│  Command Execution Failed               │
│  ├─ Capture stderr and exit code        │
│  ├─ Mark command as failed              │
│  ├─ Use empty string for parsing        │
│  ├─ Continue with next command          │
│  └─ Store all results (success + fail)  │
│                                         │
│  Parsing Failed (Tech Support)          │
│  ├─ Log warning with context            │
│  ├─ Use default values                  │
│  │   Example: cpu_usage = 0.0           │
│  ├─ Continue with other sections        │
│  └─ Partial data is still useful        │
│                                         │
│  MongoDB Storage Failed                 │
│  ├─ Log error with traceback            │
│  ├─ Mark device as failed               │
│  ├─ Attempt to continue                 │
│  └─ Critical: may abort run             │
│                                         │
│  No Commands to Execute (Standard)      │
│  ├─ Log warning                         │
│  ├─ Exit gracefully                     │
│  └─ No charges applied                  │
│                                         │
└─────────────────────────────────────────┘
```

## Performance Characteristics

```
┌────────────────────────────────────────────┐
│         Performance Metrics                │
├────────────────────────────────────────────┤
│                                            │
│  Tech Support Collection:                  │
│  ├─ 20+ commands per device                │
│  ├─ Parallel device execution              │
│  │   (All devices run concurrently)        │
│  ├─ Sequential commands per device         │
│  ├─ Parsing: ~50-100ms per device          │
│  ├─ MongoDB insert: ~50-100ms per device   │
│  └─ Total time estimates:                  │
│      ├─ 1 device: ~10 seconds              │
│      ├─ 10 devices: ~15 seconds            │
│      ├─ 50 devices: ~30 seconds            │
│      └─ 100 devices: ~60 seconds           │
│                                            │
│  Standard Mode (AI):                       │
│  ├─ AI Generation: 1-3 seconds (one-time)  │
│  ├─ Parallel device execution              │
│  ├─ Sequential commands per device         │
│  ├─ Storage: Async, non-blocking           │
│  └─ Similar timing to Tech Support         │
│                                            │
│  Standard Mode (Manual):                   │
│  ├─ No AI overhead                         │
│  ├─ Parallel device execution              │
│  ├─ Depends on command count               │
│  └─ Fastest mode                           │
│                                            │
│  Scalability Limits:                       │
│  ├─ Devices: 1-200+ concurrent             │
│  │   (Limited by SSH connection pool)      │
│  ├─ Commands: 1-100 per device             │
│  │   (Tech Support: 25 commands)           │
│  ├─ MongoDB: Handles 1000s of docs/sec     │
│  └─ Total throughput: 5000+ cmd exec/min   │
│                                            │
│  Bottlenecks:                              │
│  ├─ SSH connection establishment           │
│  ├─ Device response time                   │
│  └─ Network latency                        │
│                                            │
└────────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌─────────────────────────────────────────┐
│         Logging & Monitoring            │
├─────────────────────────────────────────┤
│                                         │
│  Tech Support Mode Logs:                │
│  ├─ Run ID (UUID) for correlation       │
│  ├─ MongoDB connection status           │
│  ├─ Device connection progress          │
│  │   [1/50] Processing: 192.168.1.1     │
│  ├─ Command execution stats             │
│  │   Commands: 24/25 successful         │
│  ├─ Health alerts (real-time)           │
│  │   ⚠️  High CPU usage: 85%            │
│  ├─ MongoDB document IDs                │
│  │   ✅ MongoDB Document ID: 5f8a9...   │
│  ├─ Collection duration per device      │
│  │   ⏱️  Parsing time: 87ms             │
│  ├─ Final summary                       │
│  │   ✅ Successful: 48/50               │
│  │   ❌ Failed: 2/50                    │
│  │   ⚠️  Total alerts: 15               │
│  │   🚨 Critical devices: 2             │
│  └─ Performance metrics                 │
│      ⏱️  Total time: 45s (0m 45s)       │
│                                         │
│  Standard Mode Logs:                    │
│  ├─ AI generation details               │
│  │   🤖 Claude suggested 8 commands     │
│  ├─ Device connection status            │
│  ├─ Command execution progress          │
│  ├─ Error messages with context         │
│  └─ Execution summary                   │
│                                         │
│  Storage Locations:                     │
│                                         │
│  MongoDB (Tech Support only):           │
│  ├─ tech_support_data                   │
│  │   └─ Complete historical data        │
│  ├─ devices                             │
│  │   └─ Device registry & metadata      │
│  └─ collection_runs                     │
│      └─ Run summaries & statistics      │
│                                         │
│  Apify Dataset (Both modes):            │
│  ├─ Tech Support: device summaries      │
│  │   ├─ IP, status, health              │
│  │   ├─ MongoDB document ID             │
│  │   └─ Alert counts                    │
│  └─ Standard: command execution table   │
│      ├─ Success/failure rates           │
│      └─ Per-device statistics           │
│                                         │
│  Apify Key-Value Store (Standard only): │
│  ├─ device_* keys                       │
│  │   └─ Full command outputs            │
│  ├─ execution_summary                   │
│  │   └─ Aggregate statistics            │
│  └─ ai_generated_commands               │
│      └─ AI metadata                     │
│                                         │
│  Query Examples (MongoDB):              │
│  ├─ Latest per device                   │
│  ├─ Health trends over time             │
│  ├─ Devices with issues                 │
│  ├─ Historical comparisons              │
│  └─ Compliance reports                  │
│                                         │
└─────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│              Apify Platform                         │
│  ┌───────────────────────────────────────────────┐ │
│  │          Docker Container                     │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │  Python 3.8+ Runtime                    │ │ │
│  │  │  ├─ apify SDK                           │ │ │
│  │  │  ├─ paramiko (SSH)                      │ │ │
│  │  │  ├─ pymongo                             │ │ │
│  │  │  ├─ pydantic (data validation)          │ │ │
│  │  │  ├─ aiohttp (Cohere API)                │ │ │
│  │  │  └─ Actor code                          │ │ │
│  │  │     ├─ main.py                          │ │ │
│  │  │     └─ src/                             │ │ │
│  │  │         ├─ actor/                       │ │ │
│  │  │         │   ├─ tech_support.py          │ │ │
│  │  │         │   ├─ command_generator.py     │ │ │
│  │  │         │   ├─ manager.py               │ │ │
│  │  │         │   └─ connect.py               │ │ │
│  │  │         ├─ db/                          │ │ │
│  │  │         │   ├─ connect.py               │ │ │
│  │  │         │   └─ storage.py               │ │ │
│  │  │         ├─ models/                      │ │ │
│  │  │         │   ├─ techsupport.py           │ │ │
│  │  │         │   ├─ device.py                │ │ │
│  │  │         │   ├─ command.py               │ │ │
│  │  │         │   └─ result.py                │ │ │
│  │  │         └─ utils/                       │ │ │
│  │  │             └─ constants.py             │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  Environment Variables:                       │ │
│  │  ├─ COHERE_API_KEY (optional)                │ │
│  │  └─ MONGODB_CONNECTION_STRING (optional)     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Storage:                                           │
│  ├─ Dataset (structured data - both modes)         │
│  └─ Key-Value Store (detailed outputs - standard)  │
│                                                     │
└─────────────────────────────────────────────────────┘
         │                    │                │
         │ SSH                │ HTTPS          │ HTTPS
         ▼                    ▼                ▼
┌──────────────┐    ┌──────────────────┐  ┌───────────┐
│   Network    │    │   Cohere API     │  │  MongoDB  │
│   Devices    │    │  (Standard Mode) │  │  (Tech    │
│              │    │                  │  │  Support) │
└──────────────┘    └──────────────────┘  └───────────┘
```

---

## Summary

This architecture provides:

### Modularity
- Clear separation between Tech Support and Standard modes
- Independent AI, execution, and storage layers
- Pluggable database backends

### Flexibility
- **Tech Support Mode**: Historical monitoring, trend analysis
- **Standard Mode**: Ad-hoc diagnostics, AI-assisted or manual
- Can run either mode independently

### Reliability
- Comprehensive error handling with graceful degradation
- Partial results stored even on failures
- Automatic retries and fallback mechanisms

### Observability
- Detailed logging at each step
- Multiple storage targets for different use cases
- Real-time progress tracking
- Historical query capabilities (Tech Support)

### Scalability
- Parallel device execution (100+ devices)
- MongoDB for large-scale historical data
- Efficient indexing for fast queries
- Suitable for continuous monitoring

### Safety
- Read-only commands in Tech Support mode
- Severity classification in Standard mode
- User control over dangerous operations
- Validated and type-safe data models
