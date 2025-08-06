---
title: "Spring Boot Tip: Importing a Single JPA Entity in your app"
description: Learn how to import a single JPA entity in Spring Boot without scanning entire packages.
author: Georgios Piskas
pubDatetime: 2025-08-06T18:47:33.528Z
slug: import-single-jpa-entity-spring-boot
featured: false
draft: false
tags:
  - spring
  - java
type: post
---

When building large-scale Spring Boot applications, it’s common to modularize your codebase by extracting JPA (`@Entity`) classes into separate library JARs. A typical pattern involves creating a shared core library that contains common components such as `Entities`, `Repositories`, and `Services`. This library can then be reused across multiple teams working within the same domain.

However, there are scenarios where you don't want to import all entities from the shared library into your application. Instead, you might only need to include a few specific entities. This selective import avoids the overhead of loading dozens of unused entities and prevents potential conflicts or schema overlaps that can arise from performing an `@EntityScan` over an entire library.

## Table of Contents

## Spring Boot JPA Autoconfiguration and Entity Scanning

Spring Boot’s JPA autoconfiguration, specifically in the [`JpaBaseConfiguration`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/autoconfigure/orm/jpa/JpaBaseConfiguration.html) class, automatically scans for all `@Entity` classes within specified base packages. Under the hood, a [`PersistenceManagedTypesScanner`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/orm/jpa/persistenceunit/PersistenceManagedTypesScanner.html) performs this scan to discover all managed entity classes.

An interesting feature of this scanner is that it can accept an optional [`ManagedClassNameFilter`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/orm/jpa/persistenceunit/ManagedClassNameFilter.html) bean from the Spring context. This interface lets you filter entities by their fully qualified class names during the scanning phase.

## The `ManagedClassNameFilter` Interface: Fine-Grained Control Over Entities

By providing a `ManagedClassNameFilter` bean, you gain fine-grained control over which entities are included in your application’s persistence context based on their class names.

For example, suppose you want to scan your entire application under the parent package `com.myapp` but only want to selectively include two entities — `SingleEntity` and `FooBar` — from an external library package `com.somelibrary.entities`. Suppose that this library contains dozens of other entities you want to exclude.

Here's how you can configure this:

```java
// other imports skipped
import com.somelibrary.entities.SingleEntity;
import com.somelibrary.entities.FooBar;

@Configuration
@EntityScan(basePackages = {"com.myapp", "com.somelibrary.entities"})
public class JpaEntityConfiguration {

  // Tests if the given class name (fully qualified) matches the filter.
  // Only matching classes are included in the persistence unit.
  @Bean
  public ManagedClassNameFilter managedClassNameFilter() {
    return className -> className.startsWith("com.myapp")
                       || className.equals(SingleEntity.class.getName())
                       || className.equals(FooBar.class.getName());
  }
}
```

In this example, Spring Boot will:

- Include all `@Entity` classes under `com.myapp.*`.
- Include only the specific `@Entity` classes `SingleEntity` and `FooBar` from `com.somelibrary.entities`.
- Ignore all other `@Entity` classes from the `com.somelibrary.entities` package.

 Why Use `ManagedClassNameFilter`?

- Avoid unnecessary overhead: Importing only needed entities improves startup time and memory usage.
- Prevent schema conflicts: Excluding irrelevant or legacy entities helps avoid clashes in database schema generation.
- Maintain clean domain models: Only relevant entities are part of your application’s persistence context.
- Improve modularity: Supports large, multi-team projects with shared domain libraries.

## Conclusion

Spring Boot’s JPA autoconfiguration makes entity scanning easy but can sometimes be too broad, especially when working with shared libraries containing many entities. The `ManagedClassNameFilter` provides a simple yet powerful way to fine-tune entity registration, allowing selective inclusion based on fully qualified class names.

This approach gives you the best of both worlds: the convenience of Spring Boot autoconfiguration and the precision of manual entity selection.
