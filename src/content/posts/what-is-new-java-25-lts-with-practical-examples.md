---
title: What is New in Java 25 (LTS), with Practical Examples
description: Discover all new features introduced in Java 25, including practical examples and code snippets for developers. Also includes notable features since Java 21.
author: Georgios Piskas
pubDatetime: 2025-11-27T19:32:03.853Z
slug: what-is-new-java-25-lts-with-practical-examples
featured: false
draft: false
tags:
    - java
    - features
    - upgrade
    - spring
type: post
---

In this blog post, we will find out what is new in Java 25 which is a **Long-Term Support (LTS)** version that reached **General Availability (GA) on 16.09.2025**, but also what has been released since Java 21. Special focus is given to developer-oriented features.

## Table of Contents

## Features Overview

### Finalized Features

- [Scoped Values](https://openjdk.org/jeps/506)
- [Flexible Constructor Bodies](https://openjdk.org/jeps/513)
- [Generational Shenandoah](https://openjdk.org/jeps/521)
- [Compact Object Headers](https://openjdk.org/jeps/519)
- [Module Import Declarations](https://openjdk.org/jeps/511)
- [Ahead-of-Time Command-Line Ergonomics](https://openjdk.org/jeps/514)
- [Ahead-of-Time Method Profiling](https://openjdk.org/jeps/515)
- [Compact Source Files and Instance Main Methods](https://openjdk.org/jeps/512)
- [JFR Method Timing & Tracing](https://openjdk.org/jeps/520)
- [JFR Cooperative Sampling](https://openjdk.org/jeps/518)
- [Key Derivation Function API](https://openjdk.org/jeps/510)
- [Remove the 32-bit x86 Port](https://openjdk.org/jeps/503)

### Preview And Incubator Features

- [Stable Values (Preview)](https://openjdk.org/jeps/502)
- [Primitive Types in Patterns, instanceof, and switch (Third Preview)](https://openjdk.org/jeps/507)
- [Structured Concurrency (Fifth Preview)](https://openjdk.org/jeps/505)
- [Vector API (Tenth Incubator)](https://openjdk.org/jeps/508)
- [JFR CPU-Time Profiling (Experimental)](https://openjdk.org/jeps/509)
- [PEM Encodings of Cryptographic Objects (Preview)](https://openjdk.org/jeps/470)

## Finalized Features Breakdown
We will be focusing on finalized features, especially those that have a more practical application and are targeted towards developers.

### Scoped Values
Scoped Values let you safely share immutable data between threads instead of using [ThreadLocal](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html), and without risking accidental mutation. They also offer better space and time performance. Using ThreadLocal has proven to be problematic because its implicit, long-lived, and mutable thread-bound state can leak, propagate incorrectly, especially with virtual threads, and is hard to manage and reason about safely. Below is an example of a [ScopedValue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html) in use.

```java
// Creates a typed key for storing a value during a scope
private static final ScopedValue<String> FOOD = ScopedValue.newInstance();

public scopedValueExample()) {
    // "where" defines a scope where that value is available
    ScopedValue.where(FOOD, "Pizza").run(() -> {
        log.info("Processing {}", FOOD.get());
        processFood();
    });
}

private void processFood() {
    log.info("Received food to process {}", FOOD.get()); // will be Pizza in this scope

    // You can nest/crete new scopes
    ScopedValue.where(FOOD, "Cheese").run(() -> {
        log.info("Nested task, proccessing {}", FOOD.get()); // will be Cheese in the nested
    });

    log.info("Finished {}", FOOD.get()); // will be Pizza again
}
```

### Flexible Constructor Bodies
Constructors no longer require super(...) or this(...) to be the first statement, allowing validation and field initialization beforehand. They still forbid using this (e.g., calling instance methods) before the superclass constructor runs, ensuring object safety.

```java
class Car extends Vehicle {
    private final String brand;
    Car(int wheels, String brand) {
        if (wheels < 4) throw new IllegalArgumentException(); // now allowed before super()
        this.brand = brand;                                   // now allowed before super()
        super(wheels);                                        // no longer must be first
    }
}
```

### Generational Shenandoah
Generational Shenandoah GC reduces pause times by collecting young and old generations concurrently, keeping applications responsive even with large heaps. It improves throughput for short-lived objects and provides predictable latency, making it ideal for memory-intensive or latency-sensitive applications. Use the following command to enable it `-XX:+UseShenandoahGC` and read more [here](https://wiki.openjdk.org/display/shenandoah/Main).


### Compact Object Headers
This new finalized feature reduces the memory footprint of Java objects, improving cache efficiency and lowering garbage collection pressure. This leads to better performance and higher throughput, especially in memory-intensive applications. To enable this, use `-XX:+UseCompactObjectHeaders`, and read more [here](https://openjdk.org/jeps/519).


## Other Finalized Features
For completeness, I am listing here the rest of the finalized features that are not practically or immediately applicable for the majority of Java developers. Please read the official specification for further details.

### Module Import Declarations
Module Import Declarations simplify modular programming by allowing modules to be imported directly in source code, reducing reliance on long command-line flags and improving readability. Read more [here](https://openjdk.org/jeps/511).

### Ahead-of-Time Command-Line Ergonomics
Java automatically chooses an AOT-enhanced startup mode when appropriate with no special flags needed anymore. The runtime may transparently use an AOT-optimized startup profile, giving accelerated application startup with zero extra configuration. More details and commands [here](https://openjdk.org/jeps/514).

### Ahead-of-Time Method Profiling
The JVM can now load precomputed method-profiling data at startup so it can optimize code immediately, instead of waiting for warm-up. To create the precomuted data, use the commands explained [here](https://openjdk.org/jeps/514).

### Compact Source Files and Instance Main Methods
This change lets you run a Java file directly without creating a class first. It also allows main methods to be instance methods, making small programs and scripts simpler for beginners. Read more [here](https://openjdk.org/jeps/512).

### JFR Method Timing & Tracing
Helps automatically record method execution timing and tracing with minimal code changes, making performance monitoring easier. It reduces manual instrumentation while providing precise profiling data for analysis in tools like Java Flight Recorder. Read more [here](https://openjdk.org/jeps/520).

### JFR Cooperative Sampling
Similarly to the previous feature, provides enhances support for CPU sampling. Read more [here](https://openjdk.org/jeps/518).

### Key Derivation Function API
This JEP provides a standard API for deriving cryptographic keys from passwords or other secrets. This simplifies implementing secure key derivation in Java applications while following best practices. Read more [here](https://openjdk.org/jeps/510).

### Remove the 32-bit x86 Port
Java keeps evolving. Read more [here](https://openjdk.org/jeps/503).

## Notable Features Since Java 21 (LTS)
If you are upgrading from Java 21, keep reading for the most relevant changes, or have a look [here](https://openjdk.org/projects/jdk/25/jeps-since-jdk-21).

### Unnamed Variables & Patterns
Java finally lets you use `_` as a placeholder when you don’t need a variable. It also works with pattern matching. This feature reduces boilerplate and makes code cleaner.

```java
Person[] folks = { new Person("John", "Doe"), new Person("Foo", "Bar") };
for (Person(_, String lastName) : folks) {   // ignore firstName
    log.info("Last Name = {}", lastName);
}
```

### Stream Gatherers
Newly introduced Stream [Gatherers](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Gatherers.html) provide useful intermediate operations to stream processing, such as windowing functions, folding functions, transforming elements concurrently, etc.

```java
// windowFixed is a stateful many-to-many gatherer which groups input elements into lists of a supplied size, emitting the windows downstream when they are full.
// will contain: [[1, 2, 3], [4, 5, 6], [7, 8]]
Stream.of(1,2,3,4,5,6,7,8).gather(Gatherers.windowFixed(3)).toList();

// windowSliding is a stateful many-to-many gatherer which groups input elements into lists of a supplied size. After the first window, each subsequent window is created from a copy of its predecessor by dropping the first element and appending the next element from the input stream.
// will contain: [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 8]]
Stream.of(1,2,3,4,5,6,7,8).gather(Gatherers.windowSliding(6)).toList();


//fold is a stateful many-to-one gatherer which constructs an aggregate incrementally and emits that aggregate when no more input elements exist.
// will contain: Optional["123456789"]
Stream.of(1,2,3,4,5,6,7,8,9)
        .gather(
            Gatherers.fold(() -> "", (string, number) -> string + number)
        )
        .findFirst();

// scan is a stateful one-to-one gatherer which applies a supplied function to the current state and the current element to produce the next element, which it passes downstream.
// will contain: ["1", "12", "123", "1234", "12345", "123456", "1234567", "12345678", "123456789"]
Stream.of(1,2,3,4,5,6,7,8,9)
          .gather(
              Gatherers.scan(() -> "", (string, number) -> string + number)
           )
          .toList();

// mapConcurrent is a stateful one-to-one gatherer which invokes a supplied function for each input element concurrently, up to a supplied limit.
people.stream()
      .gather(Gatherers.mapConcurrent(10, PeopleApi::readPersonDetails))
      .forEach(System.out::println);
```

### Class-File API
This JEP provides a structured, type-safe API for reading and manipulating Java class files. It simplifies bytecode analysis and transformation while reducing errors compared to manual parsing. Read more [here](https://openjdk.org/jeps/484)

### Markdown Documentation Comments
Last but not least, this improvement allows writing Javadoc using Markdown, which is more readable and familiar than HTML.

```java
/**
 * # Calculator Utility
 * 
 * Provides basic arithmetic operations.
 * 
 * ## Example
 * ```java
 * int sum = Calculator.add(2, 3); // 5
 * ```
 */
```
