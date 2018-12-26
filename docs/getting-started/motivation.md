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
- Multiple micro frontends need a way to safely interact with singleton browser
  APIs like the URL/history or localStorage.
- Micro frontends must be able to share state to facilitate a consistent UX.
  - Examples for features needing shared state are: a manager for ensuring only
    one modal is open at a time, or multiple micro frontends that display
    information about the same product selected in one of the micro frontends.
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
- It should be possible to compose micro frontends without deployment of the
  integration environment.

[sinnerschrader]: https://sinnerschrader.com
