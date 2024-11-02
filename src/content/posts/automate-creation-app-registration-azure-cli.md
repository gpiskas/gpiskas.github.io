---
title: Automate the creation of an App Registration using Azure CLI
description: Discover useful Azure CLI commands and Graph API endpoints to automate the creation of App Registrations and Enterprise Applications on Azure.
author: Georgios Piskas
pubDatetime: 2024-07-14T17:00:03.284Z
slug: automate-creation-app-registration-azure-cli
featured: false
draft: false
tags:
    - azure
    - oauth2
    - graph api
type: post
---
In order to avoid error prone manual work when dealing with App Registrations in the Azure portal, it's always prudent to use scripts instead of clicking through a bunch of screens dozens of times. This article will help you get started with the Azure CLI and even show you how to interact with the Microsoft Graph API.

## Table of Contents

## Creating and Modifying the App Registration
The first step is to create the app registration using the [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/ad/app). Here we provide a name, as well as some redirect URIs that are used during interactive user login. In addition, we have created a file adjacent to the executing script called `roles.json` which contains the role definitions to be added upon creation. As an output of the script we extract the ID of the created app registration so that we can use it later on.

```powershell
$appId = az ad app create `
  --display-name 'hello-world-app' `
  --web-redirect-uris http://localhost:8080/helloworld/login/oauth2/code/ https://mydomainname.com/helloworld/login/oauth2/code/ `
  --app-roles '@roles.json' `
  --query appId `
  --output tsv
```

Roles defined in `roles.json` are of the following format. For the sake of this example we are creating an **Admin** and a **Reader** role. These will appear under the `App roles` blade in the Azure portal.

```json
[
    {
        "allowedMemberTypes": [
            "User",
            "Application"
        ],
        "description": "Readers can access the application data",
        "displayName": "Reader",
        "isEnabled": "true",
        "value": "reader"
    },
    {
        "allowedMemberTypes": [
            "User"
        ],
        "description": "Admins can modify the application data",
        "displayName": "Admin",
        "isEnabled": "true",
        "value": "admin"
    }
]
```

After creating the app registration we can use the [`update` command subgroup](https://learn.microsoft.com/en-us/cli/azure/ad/app?view=azure-cli-latest#az-ad-app-update) to perform any changes, such as the one below which will add the `Application ID URI` under the `Expose an API` blade

```powershell
az ad app update `
  --id $appId `
  --identifier-uris "api://$appId"
```


## Creating and Modifying the Enterprise Application
An Enterprise Application (Service Principal) represents the App Registration in Microsoft Entra ID.
To create it and link it to the previously created App Registration we simply need to use the `az ad sp create` command as follows. We similarly store the ID for future use.

```powershell
$spId = az ad sp create `
  --id $appId `
  --query id `
  --output tsv
```

Not all operations are supported through the Azure CLI. In this case we need to use the Microsoft Graph API REST endpoints. In the example below we are sending a PATCH request to the [Service Principals resource](https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal) to update the `notes` section.


```powershell
az rest `
  --method PATCH `
  --url https://graph.microsoft.com/v1.0/servicePrincipals/$spId `
  --headers "Content-Type=application/json" `
  --body "{'notes':'hello world added using patch'}"
```

## Adding an Owner
To add an owner to the App Registration and to the Enterprise Application we need to get a reference to the owner's object ID first.

```powershell
$ownerId = az ad user show `
  --id "john.doe@example.com" `
  --query id `
  --output tsv
```

For the App registration, we can simply use Azure CLI commands, but for the Enterprise Application we once again resort to the Graph API.

```powershell
az ad app owner add `
 --id $appId `
 --owner-object-id $ownerId

az rest `
  --method POST `
  --url https://graph.microsoft.com/v1.0/servicePrincipals/$spId/owners/`$ref `
  --headers "Content-Type=application/json" `
  --body "{'@odata.id':'https://graph.microsoft.com/v1.0/directoryObjects/$ownerId'}"
```

## Adding a Client Secret
Last but not least, we can add a [client secret](https://gpiskas.com/posts/creating-non-expiring-secrets-azure-app-registration/) to the App Registration via Azure CLI.

```powershell
az ad app credential reset `
 --id $appId `
 --display-name "client-secret" `
 --years 2
```

<p class="tip">Immediately copy and store the generated client secret!<p>

## Complete Script

`appRegistration.ps1`
```powershell
# Creating the App Registration with the given name
# See https://learn.microsoft.com/en-us/cli/azure/ad/app
$appId = az ad app create `
  --display-name 'hello-world-app' `
  --web-redirect-uris http://localhost:8080/helloworld/login/oauth2/code/ https://mydomainname.com/helloworld/login/oauth2/code/ `
  --app-roles '@roles.json' `
  --query appId `
  --output tsv

# Adding the "Application ID URI" under "Expose an API" blade
# See https://learn.microsoft.com/en-us/cli/azure/ad/app#az-ad-app-update
az ad app update `
  --id $appId `
  --identifier-uris "api://$appId"

# Creating the linked Enterprise Application (Service Principal)
# See https://learn.microsoft.com/en-us/cli/azure/ad/sp
$spId = az ad sp create `
  --id $appId `
  --query id `
  --output tsv

# An example of modifying information of the Service Principal using the Graph API
# See https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal
az rest `
  --method PATCH `
  --url https://graph.microsoft.com/v1.0/servicePrincipals/$spId `
  --headers "Content-Type=application/json" `
  --body "{'notes':'hello world added using patch'}"

# To add an owner, we need to find the object Id first
# See https://learn.microsoft.com/en-us/cli/azure/ad/user
$ownerId = az ad user show `
  --id "john.doe@example.com" `
  --query id `
  --output tsv

# Adding an owner to the App Registration
# See https://learn.microsoft.com/en-us/cli/azure/ad/app/owner
az ad app owner add `
 --id $appId `
 --owner-object-id $ownerId

# Adding an owner to the Enterprise Application requires using the Graph API
# See https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal
az rest `
  --method POST `
  --url https://graph.microsoft.com/v1.0/servicePrincipals/$spId/owners/`$ref `
  --headers "Content-Type=application/json" `
  --body "{'@odata.id':'https://graph.microsoft.com/v1.0/directoryObjects/$ownerId'}"

# Adding a Client Secret. Putting it last to remember to copy and save the output password!
# See https://learn.microsoft.com/en-us/cli/azure/ad/app/credential
az ad app credential reset `
 --id $appId `
 --display-name "client-secret" `
 --years 2
```

`roles.json`
```json
[
    {
        "allowedMemberTypes": [
            "User"
        ],
        "description": "Readers can access the application data",
        "displayName": "Reader",
        "isEnabled": "true",
        "value": "reader"
    },
    {
        "allowedMemberTypes": [
            "User",
            "Application"
        ],
        "description": "Admins can modify the application data",
        "displayName": "Admin",
        "isEnabled": "true",
        "value": "admin"
    }
]
```