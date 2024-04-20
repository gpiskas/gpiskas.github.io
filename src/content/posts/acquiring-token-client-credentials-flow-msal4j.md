---
title: Acquiring a Token for Client Credentials Flow (MSAL4J)
description: Discover how you can fetch an OAuth 2.0 Client Credentials Flow Access Token using the Microsoft Authentication Library for Java (msal4j).
author: Georgios Piskas
pubDatetime: 2024-04-20T13:30:03.011Z
slug: acquiring-token-client-credentials-flow-msal4j
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

The [Client Credentials Flow](https://learn.microsoft.com/en-us/entra/msal/java/getting-started/client-credentials) is an OAuth 2.0 authentication flow that allows a client application, such as a web service or a backend, to request an access token using its own credentials (client ID and client secret) instead of the resource owner's credentials. This flow is typically used when an application needs to access resources on its own rather than acting on behalf of a user.

The easiest way to acquire a token for the Client Credentials Flow when using Microsoft Entra ID (Azure AD) and Java is to use the [MSAL (Microsoft Authentication Library) for Java library (msal4j)](https://learn.microsoft.com/en-us/entra/msal/java/).

## Table of Contents

## Creating an App Registration

You need to have an app registration (**client id**) in Azure in order to proceed, as well a **client secret** configured for it. Those values are required for the implementation. [The process to get one is well documented and a comprehensive guide can be found here.](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)

## Understanding the MSAL4J Library

MSAL4J simplifies authentication and token management by abstracting away the complexity of OAuth 2.0 and OpenID Connect protocols, offering developers an [easy-to-use](https://learn.microsoft.com/en-us/entra/msal/java/getting-started/why-use-msal4j) library for integrating with Microsoft identity platforms. With features like cross-platform support, automated token handling, and seamless integration with Azure services, msal4j provides a secure and scalable solution for Java applications requiring authentication and authorization.

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
import com.microsoft.aad.msal4j.ClientCredentialParameters;
import com.microsoft.aad.msal4j.ConfidentialClientApplication;

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

// STEP 2: Set up the correct scope(s) to request access for
String scope = "api://target_scope_goes_here/.default";
ClientCredentialParameters parameters = ClientCredentialParameters.builder(Set.of(scope)).build();

// STEP 3: Fetch the access token
String accessToken = app.acquireToken(parameters).get().accessToken();

// STEP 4: Use the access token in HTTP Headers or other libraries
...header("authorization", "Bearer " + accessToken)
```

## Understanding Token Contents

The [decoded token](https://jwt.io/) looks as follows. For more information about claims listed below and more [consult this comprehensive list](https://learn.microsoft.com/en-us/entra/identity-platform/access-token-claims-reference).

```json
{
  "aud": "api://<target_client_id>", // audience: the client ID that we requested the scope for
  "iss": "https://sts.windows.net/<tenant_id>", // issuer: our tenant on Microsoft Azure
  "iat": 1713600000, // issued at: time when the token was issued
  "nbf": 1713600000, // not before: the token should only used after this timestamp
  "exp": 1713610000, // expiration time: the token is valid up to this timestamp
  "aio": "<random string>", // azure internal, ignore
  "appid": "<our own client id>", // application id: the client ID requesting the token
  "appidacr": "1", // auth method (0: public client, 1: client secret, 2: client certificate)
  "idp": "https://sts.windows.net/<tenant_id>", // identity provider: our tenant on Microsoft Azure
  "oid": "<enterprise app id>", // identity of requestor: object ID of the requestor app
  "rh": "<random string>", // azure internal, ignore
  "sub": "<enterprise app id>", // principal associated with the token.
  "tid": "<tenant_id>", // tenant ID used for the sign in
  "uti": "<random string>", // token identifier claim
  "ver": "1.0" // token version: 1.0 or 2.0
}
```