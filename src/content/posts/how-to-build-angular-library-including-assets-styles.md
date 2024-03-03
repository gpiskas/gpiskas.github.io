---
title: How to Build an Angular Library (Including Assets & Styles)
description: Learn the process of creating, packaging, and sharing Angular libraries, including assets and styles, for enhanced collaboration across your projects.
author: Georgios Piskas
pubDatetime: 2024-03-03T11:16:44.170Z
slug: how-to-build-angular-library-including-assets-styles
featured: true
draft: false
tags:
  - angular
  - library
type: post
---
Creating an Angular library involves packaging reusable components, services, assets and utilities that can be shared across different Angular applications. Angular provides tools and conventions to make this process straightforward. Below is a step-by-step guide on how to achieve this, including setting a custom scope and publishing the library.

## Table of Contents

## Setting up the Angular Development Environment

Ensure you have `Node.js` and `npm` installed. You'll also need `Angular CLI` to create and manage your Angular projects. [Read more here regarding versions to use](https://angular.io/guide/releases). Once `node` and `npm` are installed, install the `Angular CLI` as follows.

```sh
npm install -g @angular/cli
```

## Creating a New Angular Library

Next, we use the Angular CLI to generate a new workspace for our library, called `my-scope`. Of course, you can name it according to your needs. Navigate into the root directory and create a library under this workspace, called `my-lib`. The goal is to create a package called `@my-scope/my-lib`. More libraries can be created under the same workspace/scope using `ng generate library`.

```sh
ng new my-scope --no-create-application
cd my-scope
ng generate library my-lib
```

In order to customize the scope/name of the library, modify `my-lib/package.json` by changing the name property from `my-lib` to `@my-scope/my-lib`.

## Developing the Library

At this point most of the scaffolding is complete. Proceed with adding components, modules, services and utilities to your library under `projects/my-lib/src/lib/*`. Do not forget to also update `projects/my-lib/src/lib/public-api.ts` in order to expose components to consumers.

<p class="tip">Based on how advanced your use case is, you might need to make modifications to some tsconfig.json files.<p>

## Adding Assets and Static Files

Static assets can also be part of the library. Create a new `assets` folder in  `projects/my-lib/src/`, inside of which you can add `styles.css`, `logo.png`, `favicon.ico` or whatever else you would like to share.

To expose those assets, add the following property to `projects/my-lib/ng-package.json`.
```json
"assets": [
  "./assets/**"
]
```

Exposing `styles.css` also requires adding a new property to `projects/my-lib/package.json`.
```json
"exports": {
  "./assets/styles.css": "./assets/styles.css"
}
```

## Building the Library

From either the root directory or the library directory run `ng build my-lib` to build `my-lib`. The build artifacts will be stored in the `dist/my-lib` directory, located at the root. If you have multiple libraries under the same workspace/scope, simply run `ng build my-other-lib` from the root directory for each library. The builds are always located in `dist` subdirectories.

## Using the Library Locally

The most convenient way to develop and test the library locally is to use the `ng build --watch` command, which will rebuild the library automatically in case of changes.

In your consumer project, simply point to the `dist` directory instead of using a version in your `package.json`.
```json
"dependencies": {
  "@my-scope/my-lib": "/absolute/path/to/dist/my-lib"
}
```

## Publishing the Library

After building your library with `ng build my-lib`, go to the dist folder `dist/my-lib` and run `npm publish`. You will need to be connected to a npm registry, or alternatively write this step as part of your release pipeline. 