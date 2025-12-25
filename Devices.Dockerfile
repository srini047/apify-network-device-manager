# Devices.Dockerfile
FROM alpine:latest

# Install OpenSSH
RUN apk update && apk add --no-cache openssh bash sudo

# Set root password
RUN echo "root:root" | chpasswd

# Enable root login with password
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Generate SSH host keys
RUN ssh-keygen -A

# Expose SSH port
EXPOSE 22

# Start SSH server
CMD ["/usr/sbin/sshd","-D","-e"]
