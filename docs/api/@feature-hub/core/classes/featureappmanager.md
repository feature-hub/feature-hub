[@feature-hub/core](../README.md) > [FeatureAppManager](../classes/featureappmanager.md)

# Class: FeatureAppManager

## Hierarchy

**FeatureAppManager**

## Implements

* [FeatureAppManagerLike](../interfaces/featureappmanagerlike.md)

## Index

### Constructors

* [constructor](featureappmanager.md#constructor)

### Methods

* [destroy](featureappmanager.md#destroy)
* [getAsyncFeatureAppDefinition](featureappmanager.md#getasyncfeatureappdefinition)
* [getFeatureAppScope](featureappmanager.md#getfeatureappscope)
* [preloadFeatureApp](featureappmanager.md#preloadfeatureapp)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new FeatureAppManager**(featureServiceRegistry: *[FeatureServiceRegistryLike](../interfaces/featureserviceregistrylike.md)*, loadModule: *[ModuleLoader](../#moduleloader)*): [FeatureAppManager](featureappmanager.md)

*Defined in [feature-app-manager.ts:59](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L59)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| featureServiceRegistry | [FeatureServiceRegistryLike](../interfaces/featureserviceregistrylike.md) |
| loadModule | [ModuleLoader](../#moduleloader) |

**Returns:** [FeatureAppManager](featureappmanager.md)

___

## Methods

<a id="destroy"></a>

###  destroy

▸ **destroy**(): `void`

*Implementation of [FeatureAppManagerLike](../interfaces/featureappmanagerlike.md).[destroy](../interfaces/featureappmanagerlike.md#destroy)*

*Defined in [feature-app-manager.ts:111](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L111)*

**Returns:** `void`

___
<a id="getasyncfeatureappdefinition"></a>

###  getAsyncFeatureAppDefinition

▸ **getAsyncFeatureAppDefinition**(url: *`string`*): [AsyncValue](asyncvalue.md)<[FeatureAppDefinition](../interfaces/featureappdefinition.md)<`unknown`>>

*Implementation of [FeatureAppManagerLike](../interfaces/featureappmanagerlike.md).[getAsyncFeatureAppDefinition](../interfaces/featureappmanagerlike.md#getasyncfeatureappdefinition)*

*Defined in [feature-app-manager.ts:66](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L66)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |

**Returns:** [AsyncValue](asyncvalue.md)<[FeatureAppDefinition](../interfaces/featureappdefinition.md)<`unknown`>>

___
<a id="getfeatureappscope"></a>

###  getFeatureAppScope

▸ **getFeatureAppScope**(featureAppDefinition: *[FeatureAppDefinition](../interfaces/featureappdefinition.md)<`unknown`>*, idSpecifier?: * `undefined` &#124; `string`*): [FeatureAppScope](../interfaces/featureappscope.md)<`unknown`>

*Implementation of [FeatureAppManagerLike](../interfaces/featureappmanagerlike.md).[getFeatureAppScope](../interfaces/featureappmanagerlike.md#getfeatureappscope)*

*Defined in [feature-app-manager.ts:80](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L80)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| featureAppDefinition | [FeatureAppDefinition](../interfaces/featureappdefinition.md)<`unknown`> |
| `Optional` idSpecifier |  `undefined` &#124; `string`|

**Returns:** [FeatureAppScope](../interfaces/featureappscope.md)<`unknown`>

___
<a id="preloadfeatureapp"></a>

###  preloadFeatureApp

▸ **preloadFeatureApp**(url: *`string`*): `Promise`<`void`>

*Implementation of [FeatureAppManagerLike](../interfaces/featureappmanagerlike.md).[preloadFeatureApp](../interfaces/featureappmanagerlike.md#preloadfeatureapp)*

*Defined in [feature-app-manager.ts:107](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L107)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |

**Returns:** `Promise`<`void`>

___

