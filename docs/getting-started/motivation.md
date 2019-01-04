---
id: motivation
title: Motivation
sidebar_label: Motivation
---

The Feature Hub has been created by [SinnerSchrader][sinnerschrader] as part of
our client work. In order to facilitate collaboration and reusability, we
decided to publish the core functionality of our micro frontend solution as open
source.

## Our Requirements for Micro Frontends

The Feature Hub was designed with the following specific requirements in mind:

- Multiple teams with different technologies and knowledge should be able to
  own, develop, and deploy composable features independently.
- Micro frontends need a way to share browser APIs and resources not intended
  for shared use (e.g. History, Local Storage).
- Micro frontends must be able to share state to facilitate a consistent UX.
- It should be possible to integrate new micro frontends without deployment of
  the integration environment.
- For SEO purposes, and to operate existing fat client frontend apps which need
  to fetch great amounts of data on boot, server-side rendering must be
  supported.
  - Because of asynchronous data fetching and shared state changes, the
    server-side rendering engine needs to be able to determine the point in time
    at which it can send the fully rendered UI and its corresponding state to
    the client.
  - The server-side rendered UI and its corresponding state must be hydrated on
    the client without visual impact.
- Micro frontends that are incompatible with the integration environment should
  fail early, and not just when the user interacts with the specific
  incompatible feature.

[sinnerschrader]: https://sinnerschrader.com
