docker build -t alpine-ssh:latest -f Devices.Dockerfile .
docker-compose down
docker-compose up -d
