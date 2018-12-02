[@feature-hub/core](../README.md) > [FeatureAppManagerLike](../interfaces/featureappmanagerlike.md)

# Interface: FeatureAppManagerLike

## Hierarchy

**FeatureAppManagerLike**

## Implemented by

* [FeatureAppManager](../classes/featureappmanager.md)

## Index

### Methods

* [destroy](featureappmanagerlike.md#destroy)
* [getAsyncFeatureAppDefinition](featureappmanagerlike.md#getasyncfeatureappdefinition)
* [getFeatureAppScope](featureappmanagerlike.md#getfeatureappscope)
* [preloadFeatureApp](featureappmanagerlike.md#preloadfeatureapp)

---

## Methods

<a id="destroy"></a>

###  destroy

▸ **destroy**(): `void`

*Defined in [feature-app-manager.ts:40](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L40)*

**Returns:** `void`

___
<a id="getasyncfeatureappdefinition"></a>

###  getAsyncFeatureAppDefinition

▸ **getAsyncFeatureAppDefinition**(url: *`string`*): [AsyncValue](../classes/asyncvalue.md)<[FeatureAppDefinition](featureappdefinition.md)<`unknown`>>

*Defined in [feature-app-manager.ts:30](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L30)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |

**Returns:** [AsyncValue](../classes/asyncvalue.md)<[FeatureAppDefinition](featureappdefinition.md)<`unknown`>>

___
<a id="getfeatureappscope"></a>

###  getFeatureAppScope

▸ **getFeatureAppScope**(featureAppDefinition: *[FeatureAppDefinition](featureappdefinition.md)<`unknown`>*, idSpecifier?: * `undefined` &#124; `string`*): [FeatureAppScope](featureappscope.md)<`unknown`>

*Defined in [feature-app-manager.ts:34](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L34)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| featureAppDefinition | [FeatureAppDefinition](featureappdefinition.md)<`unknown`> |
| `Optional` idSpecifier |  `undefined` &#124; `string`|

**Returns:** [FeatureAppScope](featureappscope.md)<`unknown`>

___
<a id="preloadfeatureapp"></a>

###  preloadFeatureApp

▸ **preloadFeatureApp**(url: *`string`*): `Promise`<`void`>

*Defined in [feature-app-manager.ts:39](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L39)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |

**Returns:** `Promise`<`void`>

___

