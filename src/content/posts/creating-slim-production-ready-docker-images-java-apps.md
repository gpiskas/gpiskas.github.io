---
title: Creating Slim, Production-Ready Docker Images for Java Apps
description: Containerize your Java applications by following the best practices described in this guide along with the most essential docker commands.
author: Georgios Piskas
pubDatetime: 2024-03-01T19:08:20.043Z
slug: creating-slim-production-ready-docker-images-java-apps
featured: false
draft: false
tags:
  - docker
  - spring
  - java
type: post
---
Creating a slim and production-ready Docker image for a Java application involves only a few steps. In this blog post we are focusing on a basic but complete `Dockerfile` which you can use as a starting point for dockerizing your production workloads. This is an ideal setup for running containerized Spring Boot applications, irrespective of the Java version. We also demonstrate a few essential docker commands for building an image and starting/stopping a container.

## Table of Contents

## Project Structure & Dockerfile

Let's assume that you just built your application and your project looks as follows. The `app.jar` is ready to be consumed by the `Dockerfile`, which is located at the project root.

```fs
project/
  app/
    src/
    target/
      app.jar
    pom.xml
  Dockerfile
```

The following `Dockerfile` should be adjusted according to your needs. Go through the comments and commands below.

```dockerfile
# BEST PRACTICE: Use the lightest jre base image that can run your workload. In this case it's 21-jre-alpine
# Adjust the Java version to your requirements (Change 21 to the version you need)
FROM eclipse-temurin:21-jre-alpine

# OPTIONAL: Set up proxies and any other environment variables
ENV FOO_BAR="foobar"
ENV HTTP_PROXY="http://foo.bar:8080"
ENV HTTPS_PROXY="http://foo.bar:9443"

# BEST PRACTICE: Update and patch the base image.
# Workaround to make alpine apk work (http vs https). Read https://github.com/alpinelinux/docker-alpine/issues/98
RUN sed -i -e 's/https/http/' /etc/apk/repositories \
    && apk update --no-cache \
    && apk upgrade --no-cache \
    && apk add --no-cache --upgrade curl ca-certificates

# OPTIONAL: Update and install CA certificates (environment-specific)
RUN mkdir -p /usr/local/share/ca-certificates/ /etc/ssl/certs \
    && cd /usr/local/share/ca-certificates \
    && curl -sk https://curl.se/ca/cacert.pem -o cacert.crt \
    && curl -sO http://my.custom.certificates/myCert.crt \ 
    && cp cacert.crt /etc/ssl/certs/ca-certificates.crt \
    && cat myCert.crt >> /etc/ssl/certs/ca-certificates.crt \
    && update-ca-certificates

# OPTIONAL: import any custom certificates to the java keystore
RUN cd /usr/local/share/ca-certificates/ \
    && keytool -import -keystore $JAVA_HOME/lib/security/cacerts -trustcacerts -storepass changeit -noprompt -file myCert.crt -alias myCert

# BEST PRACTICE: Create a user and group to run the app other than the root
RUN addgroup -S executor && adduser -S executor -G executor

# Copy the app and relevant files
RUN mkdir -p /opt/app
RUN chown executor:executor /opt/app/
COPY app/target/app.jar /opt/app/app.jar

# BEST PRACTICE: Switch user, run the app and expose it
# BEST PRACTICE: adjust jvm memory settings, use docker run --memory option for container memory limits.
EXPOSE 8080
USER executor
WORKDIR /opt/app
ENTRYPOINT ["java", \
            "-XX:InitialRAMPercentage=80",
            "-XX:MinRAMPercentage=80",
            "-XX:MaxRAMPercentage=80",
            "-jar",
            "app.jar"]
```

## Build the Docker Image

Building the docker image is as simple as running the following command at the project root. We also tag the image using `-t` for future reference.
```sh
docker build -t app:latest .
```

## Run the Docker Container

Running is also quite simple, but in most cases you need to pass some environment variables to your container, such as passwords and connection strings. The easiest way is to write the environment variables in a file and pass it as an argument, as follows.

```sh
app.env:
USERNAME=abcd1234
PASSWORD=supersecret
FOO_BAR_ENV=hello
```
```sh
docker run --rm --name app --env-file app.env -p 8080:8080 app:latest
```

The `--rm` option above is used to clean up the container after usage, as it's only meant for locally running the image we just created. [Read more here](https://docs.docker.com/engine/reference/run/). `-p` is used to expose ports, and we are referring to the image tag built before (`app:latest`).


We can stop the container, conveniently named `app`, with the following command.
```sh
docker kill app
```
