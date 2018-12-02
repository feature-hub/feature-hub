
@feature-hub/core
=================

[![Package Version](https://img.shields.io/npm/v/@feature-hub/core.svg)](https://www.npmjs.com/package/@feature-hub/core)

The core functionality of the Feature Hub.

**This package is part of the [Feature Hub](https://github.com/sinnerschrader/feature-hub) monorepo.**

Getting started
---------------

Install `@feature-hub/core` as a dependency:

```sh
# Install using Yarn
yarn add @feature-hub/core
```

```sh
# Install using npm
npm install @feature-hub/core
```

* * *

Copyright (c) 2018 SinnerSchrader Deutschland GmbH. Released under the terms of the [MIT License](https://github.com/sinnerschrader/feature-hub/blob/master/LICENSE).

## Index

### Classes

* [AsyncValue](classes/asyncvalue.md)
* [FeatureAppManager](classes/featureappmanager.md)
* [FeatureServiceRegistry](classes/featureserviceregistry.md)

### Interfaces

* [FeatureAppDefinition](interfaces/featureappdefinition.md)
* [FeatureAppManagerLike](interfaces/featureappmanagerlike.md)
* [FeatureAppModule](interfaces/featureappmodule.md)
* [FeatureAppScope](interfaces/featureappscope.md)
* [FeatureServiceBinding](interfaces/featureservicebinding.md)
* [FeatureServiceBindings](interfaces/featureservicebindings.md)
* [FeatureServiceConsumerConfigs](interfaces/featureserviceconsumerconfigs.md)
* [FeatureServiceConsumerDefinition](interfaces/featureserviceconsumerdefinition.md)
* [FeatureServiceConsumerDependencies](interfaces/featureserviceconsumerdependencies.md)
* [FeatureServiceConsumerEnvironment](interfaces/featureserviceconsumerenvironment.md)
* [FeatureServiceProviderDefinition](interfaces/featureserviceproviderdefinition.md)
* [FeatureServiceRegistryLike](interfaces/featureserviceregistrylike.md)
* [FeatureServices](interfaces/featureservices.md)
* [SharedFeatureService](interfaces/sharedfeatureservice.md)

### Type aliases

* [FeatureServiceBinder](#featureservicebinder)
* [ModuleLoader](#moduleloader)

---

## Type aliases

<a id="featureservicebinder"></a>

###  FeatureServiceBinder

**Ƭ FeatureServiceBinder**: *`function`*

*Defined in [feature-service-registry.ts:32](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-service-registry.ts#L32)*

#### Type declaration
▸(uniqueConsumerId: *`string`*): [FeatureServiceBinding](interfaces/featureservicebinding.md)<`TFeatureService`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| uniqueConsumerId | `string` |

**Returns:** [FeatureServiceBinding](interfaces/featureservicebinding.md)<`TFeatureService`>

___
<a id="moduleloader"></a>

###  ModuleLoader

**Ƭ ModuleLoader**: *`function`*

*Defined in [feature-app-manager.ts:21](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L21)*

#### Type declaration
▸(url: *`string`*): `Promise`<`unknown`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |

**Returns:** `Promise`<`unknown`>

___

