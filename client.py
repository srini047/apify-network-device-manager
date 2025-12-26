from apify_client import ApifyClient

# Initialize the ApifyClient with your API token
client = ApifyClient("YOUR_API_TOKEN")

# Prepare the Actor input
run_input = {
    "devices": [
        {"ip": "192.168.107.4", "username": "root", "password": "root", "port": 22},
    ],
    "commands": [
        "cat /etc/hostname",
    ],
}

# Run the Actor and wait for it to finish
run = client.actor("vMJSTjEps2zDrzsA5").call(run_input=run_input)

print("run: ", run)
