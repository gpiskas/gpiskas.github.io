---
title: From Java 8 to Java 21, New Language Features & Highlights
description: Upgrade your skills with this Java 8 to Java 21 breakdown. Discover major new features from all intermediate LTS versions, including code snippets and examples.
author: Georgios Piskas
pubDatetime: 2024-02-24T10:01:08.819Z
slug: java-8-to-java-21-new-language-features-highlights
featured: true
draft: false
tags:
  - java
  - features
  - upgrade
  - spring
type: post
---
In this blog post we will find out the major new language features and other important changes introduced since Java 8 and up to Java 21 while revisiting LTS versions in-between. We go through the important JEPs (JDK Enhancement Proposals) and illustrate the changes with code snippets and examples. Read on and get a taste of what's in it for you when you upgrade!

## Table of Contents

## From Java 8 To Java 11
For a complete list check out the documentation for [Java 9](https://openjdk.org/projects/jdk9/), [Java 10](https://openjdk.org/projects/jdk/10/) and [Java 11](https://openjdk.org/projects/jdk/11/).

### Private Methods in Interfaces
With the finalization of **Project Coin** in Java 9, five small amendments were introduced, the most practically useful of which is the support for **private methods in interfaces**. For the rest of the smaller changes, [read here](https://openjdk.org/jeps/213).
```java
public interface MyInterface {

    // Must be implemented by the concrete class
    boolean implementMe();

    // Can be used by the concrete class
    default boolvoidean myDefaultMethod() {
        System.out.println("I am already implemented (default)");
    }

    // Can only be used within the interface
    private void myPrivateMethod() {
        System.out.println("I am already implemented (privately)");
    }
}
```

### Local-Variable Type Inference
Since Java 10, developers can declare local variables using the `var` keyword, allowing the compiler to [infer](https://openjdk.org/jeps/286) the type from the assigned value, thereby enhancing code readability and reducing verbosity while maintaining static type safety.
```java
var instanceCounter = new HashMap<String, Integer>(); // inferred HashMap<String, Integer>
var keys = instanceCounter.keySet();                  // inferred Set<String>
var counts = instanceCounter.values();                // inferred Collection<Integer>
```


### Local-Variable Syntax for Lambda Parameters
Building upon the previous improvement, support for the `var` type inference was added to [lambda](https://openjdk.org/jeps/323) parameters in Java 11. Here is a practical example:
```java
// The following definitions are (almost) equivalent
x -> 2 * x;
(Integer x) -> 2 * x;
(var x) -> 2 * x;
(@NonNull var x) -> 2 * x;
```

### Removal of the Java EE and CORBA Modules
To support the evolution and modularity of the Java ecosystem, the [Java EE and CORBA Modules](https://openjdk.org/jeps/320) were removed from Java 11 onwards. In practice, if you use any of the modules below you will now have to introduce them as dependencies (e.g. in Maven). 
- `java.xml.ws` (JAX-WS, plus the related technologies SAAJ and -Web Services Metadata)
- `java.xml.bind` (JAXB)
- `java.activation` (JAF)
- `java.xml.ws.annotation` (Common Annotations)
- `java.corba` (CORBA)
- `java.transaction` (JTA)
- `java.se.ee` (Aggregator module for the six modules above)
- `jdk.xml.ws` (Tools for JAX-WS)
- `jdk.xml.bind` (Tools for JAXB)



## From Java 11 To Java 17
The complete list of features added up until Java 17 since Java 11 [can be found here](https://openjdk.org/projects/jdk/17/jeps-since-jdk-11).

### Switch Expressions
Finalized in [Java 14](https://openjdk.org/jeps/361), `switch` expressions make switch statements more powerful, enabling them to return values, use lambda-like cases and more. This change paved the way for [pattern matching for switch, later introduced in Java 21](https://gpiskas.com/posts/what-is-new-java-21-lts-with-practical-examples/#pattern-matching-for-switch).
```java
int code = switch (color) {
    case "Red", "Green", "Blue" -> {
        System.out.println("RGB!");
        yield 1;
    }
    case "White" -> 2;
    case "Black" -> 3;
    default -> 0;
};
```

### Helpful NullPointerExceptions
Also part of [Java 14](https://openjdk.org/jeps/358) was the much anticipated helpful NPEs, which now provide additional information in the stack trace. 
```bash
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.toLowerCase()"
        because the return value of "Demo.getNullString()" is null
        at Demo.main(Demo.java:15)
```

### Text Blocks
Since [Java 15](https://openjdk.org/jeps/378) we can finally natively define strings with multiple lines without using `\n`, `StringBuilder` or other techniques. This is achieved with text blocks, using `"""`.
```java
var str = """
    I am
    multi
    line!
    """;
```

### Pattern Matching for instanceof
Starting with [Java 16](https://openjdk.org/jeps/394) we can avoid casting after using `instanceof` to check the type in an if branch by combining both requirements in one, as follows.
```java
if (animal instanceof Cat kitty) {
    System.out.println(kitty.meow());
}
```

### Records
Also part of [Java 16](https://openjdk.org/jeps/395) was the introduction of `Records`, which are classes that act as immutable data containers. Developers simply need to define the contents, the rest of the usual POJO methods, such as a `constructor`, `getters`, `equals`, `hashCode`, `toString` are provided automatically. Static variables and static methods can still be included in Records for additional flexibility (e.g. builders or defaults).
```java
public record Department (String name, String address) {
    public static Department HQ = new Department("HQ", "1st Street");
}
public record Employee (String name, int id, Department department) {}

...

var employee = new Employee("Joe", 1, Department.HQ);
System.out.println(employee); // Employee[name=Joe, id=1, department=Department[name=HQ, address=1st Street]]
System.out.println(employee.department()); // Department[name=HQ, address=1st Street]
```

### Sealed Classes
In [Java 17](https://openjdk.org/jeps/409), sealed classes and interfaces became a finalized feature. They are used to restrict which other classes or interfaces may extend or implement them by using the `sealed` and `permits` keyword. Further down the hierarchy, a subclass can also use `non-sealed`, effectively allowing again extension by unknown subclasses.
```java
public sealed interface Shape permits Square, Triangle {...} // sealed interface
public abstract sealed class Tool permits Hammer, Screwdriver {...} // sealed class
public non-sealed class UnsealedHammer extends Hammer {...} // unsealed class based on Hammer
```

## From Java 17 To Java 21
For a more in-depth Java 21 breakdown, check out "[What is New in Java 21 (LTS), with Practical Examples](https://gpiskas.com/posts/what-is-new-java-21-lts-with-practical-examples/)". The complete list of features added up until Java 21 since Java 17 [can be found here](https://openjdk.org/projects/jdk/21/jeps-since-jdk-17).

### Pattern Matching for switch
Since [Java 21](https://openjdk.org/jeps/441), we can use type matching instead of `instanceof`, including for null checks. You can also expand composite types, such as the `Point` record in the example below. For blocks of code you can use `yield`. A switch statement can immediately return a result.
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

### Record Patterns
Also in [Java 21](https://openjdk.org/jeps/440), record patterns were finally delivered. Records can be deconstructed by listing their components as follows. This can be done in many nested levels of records.
```java
int recordPattern(Point point) {
    return switch (point) {
        case Point(int x, int y) -> x + y;
        case null -> 0;
    };
}
```

### Virtual Threads
A major feature in [Java 21](https://openjdk.org/jeps/444) is the finalization of Virtual Threads, enabling developers to develop more performant solutions but still using the familiar thread-per-request model. [Check out this article for more details](https://gpiskas.com/posts/what-is-new-java-21-lts-with-practical-examples/#virtual-threads). Using virtual threads is as easy as changing the `Executor` in use.

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

### Sequenced Collections
Lastly [Java 21](https://openjdk.org/jeps/431) also introduced the `SequencedCollection` interface in order to “fix” inconsistencies such as the ones below across Collection APIs regarding accessing elements in a well defined order. [Read more here](https://gpiskas.com/posts/what-is-new-java-21-lts-with-practical-examples/#sequenced-collections).
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