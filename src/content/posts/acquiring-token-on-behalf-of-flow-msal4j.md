---
title: Acquiring a Token for On Behalf Of Flow (MSAL4J)
description: Learn how to obtain an OAuth 2.0 On Behalf Of Flow Access Token using the Microsoft Authentication Library for Java (msal4j).
author: Georgios Piskas
pubDatetime: 2024-05-26T15:44:28.887Z
slug: acquiring-token-on-behalf-of-flow-msal4j
featured: false
draft: false
tags:
  - azure
  - oauth2
  - tokens
  - spring
  - java
type: post
---

The [On Behalf Of Flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-on-behalf-of-flow) is an OAuth 2.0 authentication flow that allows an application, such as a web service or a backend, to request an access token and perform subsequent service calls on behalf of the logged in user (or another web service), as the name suggests. This is possible using delegated permissions and scopes.


The easiest way to acquire a token for the On Behalf Of Flow when using Microsoft Entra ID (Azure AD) and Java is to use the [MSAL (Microsoft Authentication Library) for Java library (msal4j)](https://learn.microsoft.com/en-us/entra/msal/java/).

## Table of Contents

## App Registration & the MSAL4J Library

[My similar post on Client Credentials Flow](https://gpiskas.com/posts/acquiring-token-client-credentials-flow-msal4j/#creating-an-app-registration) explains how to create an app registration that you will need to perform the required calls. It also gives an overview of the MSAL4J library. Please have a quick look before proceeding.

## Using the MSAL4J Library in Java

First, we need to include the following maven dependency.

```xml
<dependency>
    <groupId>com.microsoft.azure</groupId>
    <artifactId>msal4j</artifactId>
    <version>1.15.0</version> <!-- Use the latest available -->
</dependency>
```

Then, the following classes can be used to fetch an access token. If using [Spring Cloud Azure](https://spring.io/projects/spring-cloud-azure) with Spring Boot, the task is even easier as there are beans already containing all necessary properties.

```java
import com.azure.spring.cloud.autoconfigure.implementation.context.properties.AzureGlobalProperties;
import com.microsoft.aad.msal4j.ClientCredentialFactory;
import com.microsoft.aad.msal4j.ConfidentialClientApplication;
import com.microsoft.aad.msal4j.OnBehalfOfParameters;

...

// Autowired in a Spring Boot app using spring-cloud-azure
// Otherwise, you can define the following manually
AzureGlobalProperties properties = ...; 

// STEP 1: Create a ConfidentialClientApplication
String clientId = properties.getCredential().getClientId();
String clientSecret = properties.getCredential().getClientSecret();
String tenantId = properties.getProfile().getTenantId();
ConfidentialClientApplication app = ConfidentialClientApplication.builder(
        clientId,
        ClientCredentialFactory.createFromSecret(clientSecret))
        .authority("https://login.microsoftonline.com/" + tenantId)
        .build();

// STEP 2: Set up the target scope(s) as well the users' token to request access on behalf of
Set<String> scopes = Set.of("api://target_scope_goes_here/.default");
UserAssertion userAssertion = new UserAssertion(userAccessToken);
OnBehalfOfParameters parameters = OnBehalfOfParameters.builder(scopes, userAssertion).build();

// STEP 3: Fetch the access token
String accessToken = app.acquireToken(parameters).get().accessToken();

// STEP 4: Use the access token in HTTP Headers or other libraries
...header("authorization", "Bearer " + accessToken)
```

## Content of the Tokens

You can [decoded tokens using JWT.io](https://jwt.io/) to understand more about them. [My post on Client Credentials Flow](https://gpiskas.com/posts/acquiring-token-client-credentials-flow-msal4j/#understanding-token-contents) explains a few of those claims, otherwise you can [consult this comprehensive list](https://learn.microsoft.com/en-us/entra/identity-platform/access-token-claims-reference).