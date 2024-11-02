---
title: How to extend CMD and ENTRYPOINT from a base Docker image
description: Learn how to extend CMD and ENTRYPOINT commands from a base Docker image, run your custom scripts and background processes, including examples and code.
author: Georgios Piskas
pubDatetime: 2024-11-02T11:51:22.660Z
slug: extend-cmd-entrypoint-base-docker-image
featured: false
draft: false
tags:
    - docker
    - filebeat
    - logstash
    - bash
type: post
---

In this blog post we will find out how to "extend" or "inherit" the [`CMD` and `ENTRYPOINT`](https://www.docker.com/blog/docker-best-practices-choosing-between-run-cmd-and-entrypoint/) commands of an existing docker image.

You might have come across a situation where you need to extend a base docker image (parent) with additional commands that need to execute at startup, or potentially run a background process. For example, let's assume you have been provided with a custom image from a third party, and in addition you need to have a daemon process running in parallel. You don't have access to the original `Dockerfile` or the build pipeline, and you certainly don't want to rewrite it from scratch.

## Table of Contents

## Possible Solutions

It is important to remember that only the last `CMD` and `ENTRYPOINT` command is effective in a `Dockerfile`. All previous declarations are ignored.

### Option 1: Writing new `CMD`/`ENTRYPOINT` commands
One option is to overwrite these in your `Dockerfile` altogether. We first need to find out what the parent commands do, and then write a new script to do what we need along with the original purpose.

### Option 2: Modifying `CMD`/`ENTRYPOINT` scripts
If the parent commands are already using some script, such as `CMD ["./startup.sh"]` or similar, then we could edit `startup.sh` in-place to do what we need, without overwriting the base image commands.

## Inspecting the Base Image

In any case, the first step is to find out how `CMD` or `ENTRYPOINT` are configured in the base image.  

Let's assume we want to spin up a [Tomcat server](https://tomcat.apache.org/) and add some logging instrumentation to it. We will use [Filebeat](https://www.elastic.co/beats/filebeat) to send Tomcat logs to [Logstash](https://www.elastic.co/logstash). Filebeat is a log shipper utility, which we will run in the background alongside Tomcat. We will pull and use `tomcat:latest` as our base image for this example.


```sh
docker pull tomcat:latest
```

The `inspect` command will print low-level information on the target image. In the truncated output below, we can see the configuration we are looking for.

```sh
docker inspect tomcat:latest
```
```json
...
"Cmd": ["catalina.sh", "run"],
"Entrypoint": null,
...
```

Alternatively, the `history` command will print out an output closer to the original `Dockerfile`. If the output is truncated, use the flag `--no-trunc`. The output is sorted in reverse definition order.
```sh
docker history tomcat:latest
```
```plaintext
IMAGE          CREATED       CREATED BY                  SIZE  COMMENT
228690642041   3 weeks ago   CMD ["catalina.sh" "run"]   0B    buildkit.dockerfile.v0
<missing>      3 weeks ago   ENTRYPOINT []               0B    buildkit.dockerfile.v0
...
```

## Writing a New Startup Script

By inspecting the base image we found out that we need to run `catalina.sh run` in order to start up Tomcat. One approach would be to modify `catalina.sh` directly, by editing it in inside the `Dockerfile`. However, in this case it is easier and more maintainable to create our own startup script, called `bootstrap.sh` as shown below.

In this script we first start up `filebeat` in the background and finally execute `exec catalina.sh run` as originally intended. Note that `exec` was added so that the Tomcat process takes over and is able to receive signals (such as Ctrl+C).

 ```sh
#!/bin/sh
set -e

echo "Checking filebeat config..."
./filebeat/filebeat test config

echo "Starting filebeat in the background..."
nohup ./filebeat/filebeat &

echo "Starting Tomcat..."
exec catalina.sh run
```

This script is then used in `CMD ["./bootstrap.sh"]` below, the last command of our `Dockerfile`, which uses `tomcat:latest` as base. The rest of the commands take care of installing `filebeat` and copying necessary files.

 ```dockerfile
FROM tomcat:latest

# Install filebeat
ARG FILEBEAT_VERSION=8.15.3
ARG FILEBEAT=filebeat-${FILEBEAT_VERSION}-linux-x86_64
RUN curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/${FILEBEAT}.tar.gz && \
    tar xzf ${FILEBEAT}.tar.gz && \
    rm ${FILEBEAT}.tar.gz && \
    mv ${FILEBEAT} filebeat

# Copy filebeat configuration
COPY filebeat.yml .

# Copy bootstrap script and overwrite CMD from base image
COPY --chmod=0755 bootstrap.sh .
CMD ["./bootstrap.sh"]
```

For completeness, `filebeat.yml` is a simple configuration file for Filebeat that reads logs from `/usr/local/tomcat/*.log` and sends them over to our defined Logstash instance.

 ```yml
filebeat.inputs:
 - type: filestream
   id: TomcatLogs
   paths:
    - /usr/local/tomcat/*.log

output.logstash:
  hosts: ["127.0.0.1:5044"]
```

## Building & Running

We can finally `build` our image. The Filebeat version can be dynamically controlled by passing a `--build-arg` to the command and override the hardcoded version.
```sh
docker build -t tomcat-filebeat:latest .
docker build --build-arg FILEBEAT_VERSION=8.15.0 -t tomcat-filebeat:latest .
```

When we run the image, the logs indicate that our startup sequence worked successfully.

```sh
docker run tomcat-filebeat:latest
```

```log
Checking filebeat config...
Config OK
Starting filebeat in the background...
Starting Tomcat...
02-Nov-2024 15:13:38.386 INFO [main] org.apache.catalina.startup.VersionLoggerListener.log Server version name:   Apache Tomcat/11.0.0
...
```
To verify that filebeat is actually running, we can connect to the live container and check the running processes. The following command will list running containers.
```sh
docker ps
```
```txt
CONTAINER ID   IMAGE                    COMMAND            CREATED          STATUS          PORTS      NAMES
5409b3b1df83   tomcat-filebeat:latest   "./bootstrap.sh"   25 minutes ago   Up 25 minutes   8080/tcp   mystifying_einstein
```
To start a shell, we use the container id as follows. Then, we can use a command like `top` to check the running processes (Or run directly top instead of sh).
```sh
docker exec -it 5409b3b1df83 sh
```


When you are finished with this example, you can remove unused docker images and volumes to release space using the following prune command. The flag `--all` will remove all unused images and `--volumes` will prune anonymous volumes.
```sh
docker system prune --all --volumes
```