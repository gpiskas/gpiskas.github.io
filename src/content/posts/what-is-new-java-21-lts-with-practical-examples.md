---
title: What is New in Java 21 (LTS), with Practical Examples
description: Discover all new features introduced in Java 21, including practical examples and code snippets for developers. Also includes notable features since Java 17.
author: Georgios Piskas
pubDatetime: 2024-02-17T15:24:56.631Z
modDatetime: 2024-06-05T17:29:08.590Z
slug: what-is-new-java-21-lts-with-practical-examples
featured: false
draft: false
tags:
    - java
    - features
    - upgrade
    - spring
type: post
---

In this blog post, we will find out what is new in Java 21 which is a **Long-Term Support (LTS)** version that reached **General Availability (GA) on 19.09.2023**, but also what has been released since Java 17. Special focus is given to developer-oriented features.

## Table of Contents

## Features Overview

### Finalized Features
- [Pattern Matching for switch](https://openjdk.org/jeps/441)
- [Record Patterns](https://openjdk.org/jeps/440)
- [Virtual Threads](https://openjdk.org/jeps/444)
- [Sequenced Collections](https://openjdk.org/jeps/431)
- [Generational ZGC](https://openjdk.org/jeps/439)
- [Key Encapsulation Mechanism API](https://openjdk.org/jeps/452)
- [Prepare to Disallow the Dynamic Loading of Agents](https://openjdk.org/jeps/451)
- [Deprecate the Windows 32-bit x86 Port for Removal](https://openjdk.org/jeps/449)

### Preview And Incubator Features
- [String Templates (Preview)](https://openjdk.org/jeps/430)
- [Foreign Function & Memory API (Third Preview)](https://openjdk.org/jeps/442)
- [Unnamed Patterns and Variables (Preview)](https://openjdk.org/jeps/443)
- [Unnamed Classes and Instance Main Methods (Preview)](https://openjdk.org/jeps/445)
- [Scoped Values (Preview)](https://openjdk.org/jeps/446)
- [Structured Concurrency (Preview)](https://openjdk.org/jeps/453)
- [Vector API (Sixth Incubator)](https://openjdk.org/jeps/448)


## Finalized Features Breakdown
We will be focusing on finalized features, especially those that have a more practical application and are targeted towards developers.


### Pattern Matching for switch
Use type matching instead of `instanceof`, including for null checks. You can also expand composite types, such as the `Point` record in the example below. For blocks of code you can use `yield`. A switch statement can immediately return a result.

Before Java 21:
```java
record Point(int x, int y) {};

String format(Object obj) {
    if (obj == null) {
        return "Null!";
    }
    if (obj instanceof Integer i) {
        System.out.println("Test extra line!");
        return String.format("int %d", i);
    }
    if (obj instanceof String s) {
        return String.format("String %s", s);
    }
    if (obj instanceof Point p) {
        return String.format("Point(%d,%d)", p.x, p.y);
    }
    return "Unknown!";
}
```

In Java 21:
```java
String formatUsingPatternMatching(Object obj) {
    return switch (obj) {
        case null -> "Null!";
        case Integer i -> {
            System.out.println("Test extra line!");
            yield String.format("int %d", i);
        }
        case String s -> String.format("String %s", s);
        case Point(int x, int y) -> String.format("Point(%d,%d)", x, y);
        case "foo", "FOO" -> "Foo!";
        default -> "Unknown!";
        // could also do: case null, default -> "Unknown or null!";
    };
}
```

You can further refine the cases by using the `when` keyword. Unused variables can be replaced with a `_` if you enable the preview feature.

```java
void refineCaseWithWhen(Point point) {
    switch (point) {
        case Point p when isZero(p) -> System.out.println("Zero Point");
        case Point(int x, int _) -> System.out.println("Point X: " + x);
        case null -> System.out.println("There is no Point!");
    }
}

boolean isZero(Point p) {
    return p.x == 0 && p.y == 0;
}
```

### Record Patterns
Records can be deconstructed by listing their components as follows. This can be done in many nested levels of records.
```java
int recordPattern(Point point) {
    return switch (point) {
        case Point(int x, int y) -> x + y;
        case null -> 0;
    };
}
```

### Virtual Threads
Virtual threads preserve the familiar and easy to debug **thread-per-request** programming model, without being limited to the number of OS threads. The name virtual means that they are not tied to a particular OS thread, in contrast to platform threads.

Code running on a virtual thread will occupy the OS thread only when necessary. This allows for other virtual threads to take over when it's blocked (`work-stealing`), resulting in scalability comparable to asynchronous or reactive style programming. This is completely transparent to developers while optimally using the available hardware capacity.

In practice, using virtual threads is as simple as changing the `Executor` implementation in existing code. Note that they should never be pooled because they are cheap and ideal for short-lived operations.

```java
void run(List<Runnable> runnables) {
    // Before: Execute runnables with platform threads (bounded)
    int threads = Runtime.getRuntime().availableProcessors();
    try (var executor = Executors.newFixedThreadPool(threads)) {
        runnables.forEach(runnable -> executor.submit(runnable));
    }
    // Java 21: Execute runnables with virtual threads (unbounded)
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        runnables.forEach(runnable -> executor.submit(runnable));
    }
}
```

<p class="tip">If you are using Spring Boot 3.2 or higher, you can simply enable them by setting the new property <b>spring.threads.virtual.enabled</b> to <b>true</b>.</p>


### Sequenced Collections
In order to "fix" inconsistencies such as the ones below across Collection APIs regarding accessing elements in a well defined order, Sequenced Collections are introduced (new interfaces).
```java
               First element	                Last element
List	       list.get(0)	                    list.get(list.size() - 1)
Deque	       deque.getFirst()             	deque.getLast()
SortedSet	   sortedSet.first()	            sortedSet.last()
LinkedHashSet  linkedHashSet.iterator().next()	// missing

Using Sequenced Collections:
               list.getFirst()	                list.getLast()
               // See the rest of the methods in the interfaces below
```

The following diagram and implementations from ["JEP 431: Sequenced Collections"](https://openjdk.org/jeps/431) demonstrates how three new interfaces have been integrated into the existing `Collections` ecosystem.

![JEP 431: Sequenced Collections](../../assets/images/posts/sequencedCollections.png)

```java
interface SequencedCollection<E> extends Collection<E> {
    // new method
    SequencedCollection<E> reversed();
    // methods promoted from Deque
    void addFirst(E);
    void addLast(E);
    E getFirst();
    E getLast();
    E removeFirst();
    E removeLast();
}

interface SequencedSet<E> extends Set<E>, SequencedCollection<E> {
    SequencedSet<E> reversed();    // covariant override
}

interface SequencedMap<K,V> extends Map<K,V> {
    // new methods
    SequencedMap<K,V> reversed();
    SequencedSet<K> sequencedKeySet();
    SequencedCollection<V> sequencedValues();
    SequencedSet<Entry<K,V>> sequencedEntrySet();
    V putFirst(K, V);
    V putLast(K, V);
    // methods promoted from NavigableMap
    Entry<K, V> firstEntry();
    Entry<K, V> lastEntry();
    Entry<K, V> pollFirstEntry();
    Entry<K, V> pollLastEntry();
}
```

## Other Finalized Features
For completeness, I am listing here the rest of the finalized features that are not practically or immediately applicable for the majority of Java developers. Please read the official specification for further details.

### Generational ZGC
[The specification](https://openjdk.org/jeps/439) promises:
- Lower risks of allocations stalls,
- Lower required heap memory overhead, and
- Lower garbage collection CPU overhead.
<p class="tip">Generational ZGC is not yet the default, but that is the goal of a future release. If you would like to enable it, use the following command-line option: <b>java -XX:+UseZGC -XX:+ZGenerational</b></p>

### Key Encapsulation Mechanism API
If you are developing security libraries or tools, or you are curious about [Post-Quantum Cryptography](https://en.wikipedia.org/wiki/Post-quantum_cryptography), read more [here](https://openjdk.org/jeps/452).

### Prepare to Disallow the Dynamic Loading of Agents
If you are using dynamically loaded agents, read more [here](https://openjdk.org/jeps/451).

### Deprecate the Windows 32-bit x86 Port for Removal
Java keeps evolving. Read more [here](https://openjdk.org/jeps/449).

## Notable Features Since Java 17 (LTS)
If you are upgrading from Java 17, keep reading for the most relevant changes, or have a look [here](https://openjdk.org/projects/jdk/21/jeps-since-jdk-17).

### Simple Web Server
All you need to do is run `jwebserver`. Use `--help` for usage instructions.
```bash
$ jwebserver
  Binding to loopback by default. For all interfaces use "-b 0.0.0.0" or "-b ::".
  Serving /cwd and subdirectories on 127.0.0.1 port 8000
  URL: http://127.0.0.1:8000/
```

### Code Snippets in Java API Documentation
Improve your documentation using `@snippet` as in the following example.
```java
/**
 * This is how you can use the {@code Point} record:
 * {@snippet :
 * boolean isZero(Point p) {
 *  return p.x == 0 && p.y == 0;
 * }
 * }
 */
```

### UTF-8 by Default
- Make Java programs more predictable and portable when their code relies on the default charset.
- Clarify where the standard Java API uses the default charset.
- Standardize on UTF-8 throughout the standard Java APIs, except for console I/O.

### Deprecate Finalization for Removal
- Help developers understand the dangers of finalization.
- Prepare developers for the removal of finalization in a future version of Java.
- Provide simple tooling to help detect reliance upon finalization.