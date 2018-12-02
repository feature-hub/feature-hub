
@feature-hub/module-loader
==========================

[![Package Version](https://img.shields.io/npm/v/@feature-hub/module-loader.svg)](https://www.npmjs.com/package/@feature-hub/module-loader)

A universal module loader.

**This package is part of the [Feature Hub](https://github.com/sinnerschrader/feature-hub) monorepo.**

Getting started
---------------

Install `@feature-hub/module-loader` as a dependency:

```sh
# Install using Yarn
yarn add @feature-hub/module-loader
```

```sh
# Install using npm
npm install @feature-hub/module-loader
```

* * *

Copyright (c) 2018 SinnerSchrader Deutschland GmbH. Released under the terms of the [MIT License](https://github.com/sinnerschrader/feature-hub/blob/master/LICENSE).

## Index

### Interfaces

* [Externals](interfaces/externals.md)

### Functions

* [defineExternals](#defineexternals)
* [loadAmdModule](#loadamdmodule)
* [loadCommonJsModule](#loadcommonjsmodule)

---

## Functions

<a id="defineexternals"></a>

###  defineExternals

▸ **defineExternals**(externals: *[Externals](interfaces/externals.md)*): `void`

*Defined in [index.ts:15](https://github.com/sinnerschrader/feature-hub/blob/master/packages/module-loader/src/index.ts#L15)*

```js
import {defineExternals} from '@feature-hub/module-loader';
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| externals | [Externals](interfaces/externals.md) |

**Returns:** `void`

___
<a id="loadamdmodule"></a>

### `<Const>` loadAmdModule

▸ **loadAmdModule**(url: *`string`*): `Promise`<`unknown`>

*Defined in [index.ts:28](https://github.com/sinnerschrader/feature-hub/blob/master/packages/module-loader/src/index.ts#L28)*

```js
import {loadAmdModule} from '@feature-hub/module-loader';
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |

**Returns:** `Promise`<`unknown`>

___
<a id="loadcommonjsmodule"></a>

### `<Const>` loadCommonJsModule

▸ **loadCommonJsModule**(url: *`string`*): `Promise`<`unknown`>

*Defined in [node.ts:43](https://github.com/sinnerschrader/feature-hub/blob/master/packages/module-loader/src/node.ts#L43)*

```js
import {loadCommonJsModule} from '@feature-hub/module-loader/node';
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |

**Returns:** `Promise`<`unknown`>

___

