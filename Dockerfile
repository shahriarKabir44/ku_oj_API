# Dockerfile
FROM ubuntu:latest

# Install Python, g++, OpenJDK-11, curl (to install Node.js), and clean up
RUN apt-get update && \
    apt-get install -y python3 g++ openjdk-11-jdk curl && \
    curl -sL https://deb.nodesource.com/setup_21.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in package.json
RUN npm install

# Make port 80 available to the world outside this container
EXPOSE 8080

# Run index.js when the container launches
CMD ["node", "server.js"]
