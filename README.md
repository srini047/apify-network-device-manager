Network Device Manager
======================================

Execute commands on multiple remote devices via SSH and collect results in Apify.

Features
-------

- ✅ Execute commands on multiple devices concurrently
- ✅ Store results in Apify Dataset (summary table view)
- ✅ Store detailed outputs in Key-Value Store
- ✅ Track success/failure rates per device
- ✅ Handle connection errors gracefully
- ✅ Clean, readable code structure

Requirements
------------

- Python 3.8+
- Dependencies listed in `requirements.txt`

Quick start (local)
-------------------

1. Create and activate a virtual environment (recommended):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the actor locally:

```bash
apify run --input-file=<input_file.json>
```

Docker (optional)
-----------------

To create test docker containers to verify locally:

```bash
docker build -t alpine-ssh:latest -f Devices.Dockerfile .  # Create a image
docker-compose down  # Stop/Delete containers
docker-compose up -d # Create containers
```

Project layout
--------------


```
htf-final/
├── .actor/
│   ├── actor.json              # Apify Actor configuration
│   ├── input_schema.json       # Input schema
│   └── output_schema.json      # Output schema
├── src/
│   ├── __main__.py             # Main entry point
│   ├── actor/
│   │   ├── connect.py          # SSH client implementation
│   │   └── manager.py          # Command execution manager
│   ├── input/
│   │   └── loader.py           # Device configuration loader
│   ├── models/
│   │   ├── command.py          # Command result model
│   │   └── result.py           # Device result model
│   └── utils/
│       └── constants.py        # Command definitions
├── Dockerfile                  # Docker configuration
└── requirements.txt            # Python dependencies
```


Notes
-----

- To deploy to Apify platform, use `apify push` (ensure you are logged in and configured).

License
-------

MIT
