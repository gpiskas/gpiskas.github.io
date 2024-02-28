---
title: Creating Non-Expiring Secrets for an Azure App Registration
description: Learn how to create secrets that do not expire for Azure App Registrations using Azure CLI, ensuring long-lived credentials for testing and experimentation.
author: Georgios Piskas
pubDatetime: 2024-02-28T19:01:08.819Z
slug: creating-non-expiring-secrets-azure-app-registration
featured: false
draft: false
tags:
    - azure
    - oauth2
    - tokens
type: post
---
One common requirement for Azure App Registrations during application development is the need for long-lived credentials. While Azure App Registration Secrets typically have an expiration date, there's a workaround to create non-expiring keys using the [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/?view=azure-cli-latest). However, this should only be a temporary solution, typically used until a more secure one is in place such as the use of certificates. For more information refer to [the official announcement from Microsoft](https://devblogs.microsoft.com/microsoft365dev/client-secret-expiration-now-limited-to-a-maximum-of-two-years/) which explains why the non-expiring option was removed and describes alternatives.

The following command will create a secret lasting for 100 years for the given App Registration. Specify the Client Id, which you can find under `Essentials` in the `Overview` blade in the Azure Portal.
```sh
# optionally add --append to avoid overwriting existing secrets
az ad app credential reset --id $appClientId --display-name client-secret --years 100
```
<p class="tip">Do not forget to copy the generated secret as it will not be visible again.<p>
 
 While this approach offers greater flexibility in managing secrets, it's essential to adhere to security best practices and periodically review and rotate keys to mitigate potential risks, or use alternative methods such as certificates.

Read more about the [az ad app credential](https://learn.microsoft.com/en-us/cli/azure/ad/app/credential?view=azure-cli-latest#az-ad-app-credential-reset) command.