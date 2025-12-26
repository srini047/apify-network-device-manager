# Architecture: AI-Enhanced Network Device Manager

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          APIFY ACTOR                                │
│                   Network Device Manager (AI).                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Input
                                  ▼
                    ┌─────────────────────────┐
                    │    Input Processing     │
                    │  - Devices list         │
                    │  - Problem description  │
                    │  - Manual commands      │
                    │  - Settings             │
                    └─────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
         ┌──────────▼─────────┐      ┌─────────▼──────────┐
         │  AI Path (Optional) │      │  Manual Path       │
         │                     │      │  (Traditional)     │
         └──────────┬─────────┘      └─────────┬──────────┘
                    │                           │
                    │                           │
    ┌───────────────▼──────────────┐           │
    │   Cohere API Integration     │           │
    │   ai_command_generator.py    │           │
    │                              │           │
    │  1. Build prompt             │           │
    │  2. Call Cohere API          │           │
    │  3. Parse response           │           │
    │  4. Generate commands        │           │
    │  5. Classify severity        │           │
    └───────────────┬──────────────┘           │
                    │                           │
                    │ Generated Commands        │
                    │                           │
    ┌───────────────▼──────────────┐           │
    │   Severity Filtering         │           │
    │                              │           │
    │  if includeWarnCommands:     │           │
    │    → All commands            │           │
    │  else:                       │           │
    │    → SAFE commands only      │           │
    └───────────────┬──────────────┘           │
                    │                           │
                    │ Filtered Commands         │ Manual Commands
                    └────────────┬──────────────┘
                                 │
                                 │ Merge & Remove duplicates
                                 ▼
                    ┌─────────────────────────┐
                    │   Command Execution     │
                    │   execute_on_all_devices│
                    │                         │
                    │  For each device:       │
                    │    1. SSH connect       │
                    │    2. Run commands      │
                    │    3. Collect results   │
                    └─────────────┬───────────┘
                                  │
                                  │ Results
                                  ▼
                    ┌─────────────────────────┐
                    │   Storage & Output      │
                    │                         │
                    │  1. Dataset (table)     │
                    │  2. Key-Value Store:    │
                    │     - device_*          │
                    │     - execution_summary │
                    │     - ai_generated_*    │
                    └─────────────────────────┘
```

## Component Architecture

### 1. Input Layer

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
│  commands[]                  OPTIONAL  │
│    - Manual command strings            │
│                                        │
│  problemDescription          OPTIONAL  │
│    - Problem text for AI               │
│                                        │
│  includeWarnCommands         OPTIONAL  │
│    - Boolean (default: false)          │
│                                        │
│  cohereApiKey                OPTIONAL  │
│    - API key (or from env var)         │
└────────────────────────────────────────┘
```

### 2. AI Command Generation Module

```
┌─────────────────────────────────────────────────────┐
│                  ai_command_generator.py            │
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

### 3. Execution Flow

```
┌──────────────────────────────────────────────────────────┐
│                    main.py Logic                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Load Input                                           │
│     ├─ Parse devices                                     │
│     ├─ Extract problem description                       │
│     ├─ Get manual commands                               │
│     └─ Get settings                                      │
│                                                          │
│  2. Command Assembly                                     │
│     ├─ IF problemDescription exists:                     │
│     │   ├─ Call generate_ai_commands()                   │
│     │   ├─ Filter by severity                            │
│     │   └─ Add to final_commands                         │
│     │                                                    │
│     ├─ Add manual commands                               │
│     └─ Remove duplicates                                 │
│                                                          │
│  3. Execute Commands                                     │
│     ├─ For each device:                                  │
│     │   ├─ SSH connect                                   │
│     │   ├─ Execute commands sequentially                 │
│     │   ├─ Capture stdout/stderr/exit_code               │
│     │   └─ Build DeviceResult                            │
│     │                                                    │
│     └─ Collect all results                               │
│                                                          │
│  4. Store Results                                        │
│     ├─ store_device_summary_table()                      │
│     │   └─ Dataset: device summaries                     │
│     │                                                    │
│     ├─ store_command_outputs_kv()                        │
│     │   └─ KV Store: detailed outputs                    │
│     │                                                    │
│     ├─ store_ai_generated_commands()                     │
│     │   └─ KV Store: AI metadata                         │
│     │                                                    │
│     └─ store_overall_summary()                           │
│         └─ KV Store: execution summary                   │
│                                                          │
│  5. Report Results                                       │
│     ├─ Log execution summary                             │
│     └─ Charge per device                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

### AI Command Generation Flow

```
Problem Description
        │
        ▼
┌───────────────────┐
│  Build Prompt     │  "You are a network diagnostics expert..."
│                   │  + Problem description
│                   │  + Severity requirements
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Cohere API Call  │  POST https://api.cohere.ai/v1/chat
│                   │  Model: command-r-plus
│                   │  Format: JSON
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Parse Response   │  Extract JSON from response
│                   │  Validate structure
│                   │  Create GeneratedCommand objects
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Filter by Severity│  if includeWarnCommands:
│                   │    return all
│                   │  else:
│                   │    return only "safe"
└────────┬──────────┘
         │
         ▼
    Command List
```

### Storage Structure

```
Key-Value Store
├── device_192_168_1_1_22         (Device-specific results)
│   ├── metadata
│   │   ├── ip, port, username
│   │   ├── connected: true/false
│   │   └── timestamp
│   └── commands[]
│       ├── command, success, exit_code
│       └── stdout, stderr
│
├── execution_summary              (Overall statistics)
│   ├── execution_time
│   ├── devices {total, connected, failed}
│   ├── commands {total, successful, failed}
│   └── device_list[]
│
└── ai_generated_commands          (AI metadata, if AI used)
    ├── problem_description
    ├── generation_time
    ├── total_generated
    ├── commands_executed
    └── generated_commands[]
        ├── command, severity
        └── description, reasoning

Dataset (Tabular)
├── Row 1: Device 192.168.1.1
├── Row 2: Device 192.168.1.2
├── ...
└── Row N: OVERALL SUMMARY
```

## Integration Points

### External Services

```
┌──────────────────┐
│  Cohere API      │  ← AI command generation
│  api.cohere.ai   │     Model: command-r-plus
└──────────────────┘

┌──────────────────┐
│  Apify Platform  │  ← Execution environment
│  - Dataset       │     Storage, logging, charging
│  - KV Store      │
│  - Logging       │
└──────────────────┘

┌──────────────────┐
│  Network Devices │  ← SSH connections
│  - SSH servers   │     Command execution
│  - Port 22       │
└──────────────────┘
```

## Error Handling Strategy

```
┌─────────────────────────────────────────┐
│         Error Recovery Flow             │
├─────────────────────────────────────────┤
│                                         │
│  AI Generation Failed                   │
│  ├─ Log error                           │
│  ├─ Return empty command list           │
│  └─ Continue with manual commands       │
│                                         │
│  SSH Connection Failed                  │
│  ├─ Log connection error                │
│  ├─ Mark device as failed               │
│  ├─ Continue with other devices         │
│  └─ Store partial results               │
│                                         │
│  Command Execution Failed               │
│  ├─ Capture stderr and exit code        │
│  ├─ Mark command as failed              │
│  ├─ Continue with next command          │
│  └─ Store all results (success + fail)  │
│                                         │
│  No Commands to Execute                 │
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
│  AI Command Generation                     │
│  ├─ One-time per problem description       │
│                                            │
│  SSH Connections                           │
│  ├─ Parallel execution per device          │
│  ├─ Sequential commands per device         │
│                                            │
│  Storage Operations                        │
│  ├─ Async, non-blocking                    │
│  ├─ Parallel dataset writes                │
│  └─ Fast KV store access                   │
│                                            │
│  Scalability                               │
│  ├─ Devices: 1-100+                        │
│  ├─ Commands: 1-50 per device              │
│  └─ Total: 1000+ command executions        │
│                                            │
└────────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌─────────────────────────────────────────┐
│         Logging & Monitoring            │
├─────────────────────────────────────────┤
│                                         │
│  Actor Logs                             │
│  ├─ Device connection status            │
│  ├─ Command execution progress          │
│  ├─ AI generation details               │
│  ├─ Error messages with context         │
│  └─ Execution summary                   │
│                                         │
│  Key-Value Store                        │
│  ├─ ai_generated_commands               │
│  │   └─ Full AI metadata for debugging  │
│  ├─ device_* keys                       │
│  │   └─ Complete command outputs        │
│  └─ execution_summary                   │
│      └─ Aggregate statistics            │
│                                         │
│  Dataset                                │
│  ├─ Table view for quick analysis       │
│  ├─ Success/failure metrics             │
│  └─ Per-device summaries                │
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
│  │  │  Python Runtime                         │ │ │
│  │  │  ├─ apify SDK                           │ │ │
│  │  │  ├─ asyncssh                            │ │ │
│  │  │  ├─ aiohttp                             │ │ │
│  │  │  └─ Actor code                          │ │ │
│  │  │     ├─ main.py                          │ │ │
│  │  │     └─ src/                             │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  Environment Variables:                       │ │
│  │  └─ COHERE_API_KEY                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Storage:                                           │
│  ├─ Dataset (structured data)                      │
│  └─ Key-Value Store (detailed outputs)             │
│                                                     │
└─────────────────────────────────────────────────────┘
         │                              │
         │ SSH                          │ HTTPS
         ▼                              ▼
┌──────────────┐              ┌──────────────────┐
│   Network    │              │   Cohere API     │
│   Devices    │              │                  │
└──────────────┘              └──────────────────┘
```

---

## Summary

This architecture provides:

- **Modularity**: Clear separation between AI, execution, and storage
- **Flexibility**: Supports AI-only, manual-only, or hybrid modes
- **Safety**: Command severity classification with user control
- **Reliability**: Comprehensive error handling and fallback mechanisms
- **Observability**: Detailed logging and storage of all operations
- **Scalability**: Parallel execution, efficient storage

The system is designed to be both powerful for advanced AI-powered diagnostics and simple for traditional manual command execution.
