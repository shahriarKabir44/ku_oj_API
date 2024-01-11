# Dockerfile

FROM ubuntu:latest



FROM node:latest

# Install Python

# Set the working directory in the container to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

RUN apt-get update  -y && \
    apt-get upgrade  -y 


RUN curl -O https://download.java.net/java/GA/jdk11/9/GPL/openjdk-11.0.2_linux-x64_bin.tar.gz && \
    tar -xvf openjdk-11.0.2_linux-x64_bin.tar.gz && \
    mv jdk-11.0.2/* /usr/bin/ && \
    rm openjdk-11.0.2_linux-x64_bin.tar.gz




RUN    apt-get install -y python3  && \
    apt-get install -y g++ 

# Install any needed packages specified in package.json
RUN npm install

# Make port 80 available to the world outside this container
EXPOSE 8080

# Run app.js when the container launches
CMD ["node", "server.js"]
