---
id: introduction
title: Introduction
sidebar_label: Introduction
---

The **Feature Hub** is an [opinionated][our-requirements-for-micro-frontends]
JavaScript implementation of the micro frontends approach to creating scalable
web applications with multiple teams and different technologies.

> We've seen many teams create front-end **monoliths** — a single, large and
> sprawling browser application — on top of their back-end services. Our
> preferred (and proven) approach is to split the browser-based code into
> **micro frontends**. In this approach, the web application is broken down into
> its features, and each feature is owned, frontend to backend, by a different
> team. This ensures that every feature is developed, tested and deployed
> independently from other features. — [thoughtworks.com][thoughtworks]

The Feature Hub includes a collection of npm packages that can be used together
as a full-fledged solution for composing micro frontends. It supports React
micro frontends as first-class citizens, but also allows the integration of
micro frontends that are built with any other frontend technology (e.g. Vue.js,
Angular, Web Components).

## Feature Apps and Feature Services

In the context of the Feature Hub, a micro frontend is referred to as a
**Feature App**. Such a Feature App encapsulates a composable and reusable UI
feature. It may have the need to share state with other Feature Apps.

A **Feature Service** provides shared state and functionality to consumers, e.g.
Feature Apps. While simple code sharing should be achieved by creating
libraries, there are features that can only, or more easily, be achieved by
creating Feature Services:

- Share state across Feature Apps to ensure a consistent user experience.
- Share browser APIs and resources not intended for shared use (e.g. History,
  Local Storage).
- Share configuration across Feature Apps, but only maintain it once.

Furthermore, Feature Services provide a [versioned
API][providing-a-versioned-api] to allow backward compatibility and thus
flexible and decoupled deployments of different consumers.

## Integrator, Provider, and Consumer

There are three different roles in a Feature Hub integration environment:

1.  The **integrator** initializes the Feature Hub, registers Feature Services,
    and composes Feature Apps.
2.  A **provider** implements a Feature Service.
3.  A **consumer** is everyone who consumes Feature Services. This can be a
    Feature App, other Feature Services, or even the integrator.

[our-requirements-for-micro-frontends]:
  /docs/getting-started/motivation#our-requirements-for-micro-frontends
[providing-a-versioned-api]:
  /docs/guides/writing-a-feature-service#providing-a-versioned-api
[thoughtworks]: https://www.thoughtworks.com/de/radar/techniques/micro-frontends
