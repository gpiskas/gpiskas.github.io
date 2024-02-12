---
title: Refresh OAuth2 Tokens in Spring Boot and Spring Cloud Azure
description: Enhancing token management in Spring Boot with Azure Entra ID (Azure AD). Automate token refresh for better security and user experience using a servlet filter.
author: Georgios Piskas
pubDatetime: 2024-02-11T18:59:32.283Z
slug: refresh-oauth2-tokens-spring-boot-spring-cloud-azure
featured: true
draft: false
tags:
  - azure
  - oauth2
  - tokens
  - spring
  - spring boot
  - spring security
  - spring cloud azure
type: post
---

In modern web applications, security is paramount. Implementing secure authentication mechanisms ensures that only authorized users can access protected resources. Spring Boot provides robust support for security features, including OAuth2 integration for authentication with Azure Entra ID (Azure AD). However, managing OAuth2 tokens efficiently, especially token refreshing, can be challenging. In this blog post, we'll explore how to enhance token management in a Spring Boot application using Spring Cloud Azure and a simple servlet filter.

## Understanding Token Management
Before diving into implementation details, let's understand the importance of token management in OAuth2-based authentication. OAuth2 tokens, such as **access tokens** and **refresh tokens**, play a crucial role in securing APIs and resources. Access tokens grant access to protected resources, while refresh tokens are used to obtain new access tokens without requiring user credentials. Managing token **expiration and refreshing** tokens before they expire is essential for maintaining seamless user experiences and security.

This is especially relevant in connection to the expiry of a session, which is an independent procedure handled by the app server (e.g. Tomcat).

<p class="tip">You can check the contents of your tokens on <a href="https://jwt.io/">jwt.io</a><p>

## Integrating Azure Entra ID (Azure AD) with Spring Boot
Spring Boot provides integration with Azure Entra ID through [**Spring Cloud Azure**](https://learn.microsoft.com/en-us/azure/developer/java/spring-framework/configure-spring-boot-starter-java-app-with-azure-active-directory). By configuring Azure AD properties and dependencies in your Spring Boot application, you can enable OAuth2-based authentication with Azure AD. This integration simplifies the authentication process and provides seamless access to Azure resources. Here is how you can achieve this:

`pom.xml`: Add these dependencies to your maven project.
```xml
	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>com.azure.spring</groupId>
				<artifactId>spring-cloud-azure-dependencies</artifactId>
				<version>${spring-cloud-azure.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>
		<dependency>
			<groupId>com.azure.spring</groupId>
			<artifactId>spring-cloud-azure-starter-active-directory</artifactId>
		</dependency>
		<!-- Required for acting as a web application -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-oauth2-client</artifactId>
		</dependency>
		<!-- Required for acting as a resource server -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
		</dependency>
	</dependencies>
```

`application.yml`: Add these properties to your spring boot application.
```yml 
spring:
  cloud:
    azure:
      active-directory:
        enabled: true
        profile:
          tenant-id: <your-tenant-id>
        credential:
          client-id: <your-client-id>
          client-secret: <your-client-secret>
        # Use any option fits your requirements
        application-type: web-application OR web-application-and-resource-server OR ...
```


`SecurityConfig.java`: This class implements the Azure AD integration with Spring Boot. Feel free to extend it even further, also based on `@Profile`s for local testing.
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, ExpiredTokenFilter expiredTokenFilter) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                // act as a web app (login users, id tokens, ...)
                .with(AadWebApplicationHttpSecurityConfigurer.aadWebApplication(), Customizer.withDefaults())
                // act as a resource server (client credentials auth, access tokens, ...)
                .with(AadResourceServerHttpSecurityConfigurer.aadResourceServer(), Customizer.withDefaults())
                // Read the next section about this!
                .addFilterBefore(expiredTokenFilter, OAuth2AuthorizationRequestRedirectFilter.class)
                .build();
    }
}
```

## Implementing the Token Refresh Filter
To enhance token management, we'll implement the token refresh logic using a Servlet Filter. The filter intercepts incoming requests and triggers token refresh if necessary via re-authenticating. We'll leverage Spring Security's `OAuth2AuthorizedClientManager` to achieve this. For more details, check `RefreshTokenOauth2AuthorizedClientProvider`.

`ExpiredTokenFilter.java`: This is configured in the next step.
```java
@Component
@RequiredArgsConstructor // if you don't know what this is, shame on you! It's Lombok
public class ExpiredTokenFilter extends OncePerRequestFilter {

    private final OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager;

    public ExpiredTokenFilter(OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager) {
        this.oAuth2AuthorizedClientManager = oAuth2AuthorizedClientManager;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof OAuth2AuthenticationToken token) {
            validateToken(token, request, response);
        }
        filterChain.doFilter(request, response);
    }

    private void validateToken(OAuth2AuthenticationToken token, HttpServletRequest request, HttpServletResponse response) {
        OAuth2AuthorizeRequest authRequest = OAuth2AuthorizeRequest
                .withClientRegistrationId(token.getAuthorizedClientRegistrationId())
                .principal(token)
                .attributes(attrs -> {
                    attrs.put(HttpServletRequest.class.getName(), request);
                    attrs.put(HttpServletResponse.class.getName(), response);
                }).build();
        // Will trigger the refresh if the token has expired. See RefreshTokenOauth2AuthorizedClientProvider.authorize
        oAuth2AuthorizedClientManager.authorize(authRequest);
    }
}
```

By configuring the filter chain order, we'll ensure that our custom token refresh filter executes before the `OAuth2AuthorizationRequestRedirectFilter`. This ensures that token refresh logic is applied early in the request processing flow, allowing seamless token management without affecting the authentication flow.

`SecurityConfig.java`: See before for the complete example.
```java
    ...
    .addFilterBefore(expiredTokenFilter, OAuth2AuthorizationRequestRedirectFilter.class)
```

## Conclusion
Efficient token management is crucial for ensuring secure and seamless authentication in Spring Boot applications. By integrating Spring Cloud Azure and implementing custom token refresh logic with filters, developers can enhance token management capabilities, improve user experience, and bolster application security. Implementing such practices not only ensures smooth operation but also demonstrates a commitment to best practices in authentication and security.