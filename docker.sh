#!/bin/bash

# Remove bad images
docker rmi $(docker images -f "dangling=true" -q)

# Remove old container
docker rm webapp

# Build docker container
docker build -t maggnus/webapp webapp/

# Run container in interactive mode
docker run -it --rm -p 3000:3000 -v /opt/upload:/usr/src/app/public/upload --name webapp maggnus/webapp

