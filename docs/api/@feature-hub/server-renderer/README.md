
@feature-hub/server-renderer
============================

[![Package Version](https://img.shields.io/npm/v/@feature-hub/server-renderer.svg)](https://www.npmjs.com/package/@feature-hub/server-renderer)

A Feature Service to manage server-side rendering.

**Note:** This Feature Service is under active development (see [#25](https://github.com/sinnerschrader/feature-hub/issues/25)). It currently doesn't implement everything necessary for server-side rendering, but instead only provides read-access to the incoming request.

**This package is part of the [Feature Hub](https://github.com/sinnerschrader/feature-hub) monorepo.**

Getting started
---------------

Install `@feature-hub/server-renderer` as a dependency:

```sh
# Install using Yarn
yarn add @feature-hub/server-renderer
```

```sh
# Install using npm
npm install @feature-hub/server-renderer
```

* * *

Copyright (c) 2018 SinnerSchrader Deutschland GmbH. Released under the terms of the [MIT License](https://github.com/sinnerschrader/feature-hub/blob/master/LICENSE).

## Index

### Interfaces

* [ServerRendererV1](interfaces/serverrendererv1.md)
* [ServerRequest](interfaces/serverrequest.md)
* [SharedServerRenderer](interfaces/sharedserverrenderer.md)

### Functions

* [defineServerRenderer](#defineserverrenderer)

---

## Functions

<a id="defineserverrenderer"></a>

###  defineServerRenderer

▸ **defineServerRenderer**(serverRequest: * [ServerRequest](interfaces/serverrequest.md) &#124; `undefined`*): `FeatureServiceProviderDefinition`

*Defined in [index.ts:21](https://github.com/sinnerschrader/feature-hub/blob/master/packages/server-renderer/src/index.ts#L21)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| serverRequest |  [ServerRequest](interfaces/serverrequest.md) &#124; `undefined`|

**Returns:** `FeatureServiceProviderDefinition`

___

