---
title: How to use the Microsoft Graph API Java SDK (v6)
description: Learn how to interact with the Microsoft Graph API using Java and the latest MS Graph SDK, with practical examples.
author: Georgios Piskas
pubDatetime: 2024-06-15T08:34:31.844Z
slug: how-to-microsoft-graph-api-java-sdk-v6
featured: false
draft: false
tags:
    - graph api
    - java
    - spring
    - azure
    - oauth2
type: post
---
 
The [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/use-the-api) provides a unified endpoint (https://graph.microsoft.com) for accessing all kinds of Microsoft services on Azure, Outlook, Teams, Office 365 and more. Through these APIs and the accompanying Java library developers can access and manage data across several platforms in a coherent fashion. 

In order to use the MS Graph API, you need an app registration in Azure Entra ID that will have permissions for the required endpoints. After authenticating with OAuth 2.0, users (via delegated permissions) or the application itself (via application permissions) will be able to access the required set of features.

To get a taste of the MS Graph API you can use the [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) which provides real samples and live interaction.


## Table of Contents

## Setting up the Microsoft Graph Java SDK (v6) in Spring

First, we need to include the following maven dependency. Note that this guide is written for version 6 and higher since a major redesign of the API took place.

```xml
<dependency>
    <groupId>com.microsoft.graph</groupId>
    <artifactId>microsoft-graph</artifactId>
    <version>6.13.0</version> <!-- Use the latest available -->
</dependency>
```

Then, we need to create an instance of `GraphServiceClient`. Creating it as a Bean in Spring comes handy to autowire it and reuse where necessary, but this can also be done in any other Java framework or vanilla runtime.

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.azure.spring.cloud.autoconfigure.implementation.context.properties.AzureGlobalProperties;
import com.microsoft.graph.serviceclient.GraphServiceClient;

@Configuration
public class GraphConfiguration {

    private static final String SCOPE = "https://graph.microsoft.com/.default";

    @Bean
    public GraphServiceClient getClientCredentialsToken(AzureGlobalProperties properties) {
        ClientSecretCredential credential = new ClientSecretCredentialBuilder()
                .tenantId(properties.getProfile().getTenantId())
                .clientId(properties.getCredential().getClientId())
                .clientSecret(properties.getCredential().getClientSecret())
                .build();
        return new GraphServiceClient(credential, SCOPE);
    }
}
```

## Using the GraphServiceClient to interact with the MS Graph API

In the following examples we demonstrate how to read user info and interact with email messages. These examples require either [delegated or application permissions](https://learn.microsoft.com/en-us/entra/identity-platform/permissions-consent-overview) according to the use case.

These basic examples can be further extended by reading the documentation links in the code.


```java
import java.util.List;

import org.springframework.stereotype.Service;

import com.microsoft.graph.serviceclient.GraphServiceClient;
import com.microsoft.graph.models.Message;
import com.microsoft.graph.models.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GraphService {

    private final GraphServiceClient graphClient;

    // Reads the current logged in user information (Delegated Permission) 
    // Docs: https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
    public User getLoggedInUserInfo() {
        return graphClient
                .me()
                .get();
    }

    // Search for users with the given display name, as a daemon process (Application Permission) 
    // Docs: https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http
    public List<User> searchUsersByName(String displayName, int resultCount) {
        return graphClient
                .users()
                .get(request -> {
                    request.queryParameters.top = resultCount;
                    request.queryParameters.search = "\"displayName:%s\"".formatted(displayName);
                })
                .getValue();
    }

    // Read the inbox messages of the current logged in user, including attachments (Delegated Permission) 
    // Docs: https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0
    // Docs: https://learn.microsoft.com/en-us/graph/api/resources/mailfolder?view=graph-rest-1.0
    public List<Message> getLoggedInUserInboxMessagesWithAttachments() {
        return graphClient
                .me()
                .mailFolders()
                .byMailFolderId("inbox")
                .messages()
                .get(request -> {
                    request.queryParameters.top = 10;
                    request.queryParameters.expand = new String[] { "attachments" };
                })
                .getValue();
    }

    // Mark the given message as read (Delegated Permission)
    // Docs: https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0
    public Message markMessageAsRead(Message message) {
        message.setIsRead(true);
        return graphClient
                .me()
                .messages()
                .byMessageId(message.getId())
                .patch(message);
    }
}
```