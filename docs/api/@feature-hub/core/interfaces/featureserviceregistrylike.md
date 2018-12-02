[@feature-hub/core](../README.md) > [FeatureServiceRegistryLike](../interfaces/featureserviceregistrylike.md)

# Interface: FeatureServiceRegistryLike

## Hierarchy

**FeatureServiceRegistryLike**

## Implemented by

* [FeatureServiceRegistry](../classes/featureserviceregistry.md)

## Index

### Methods

* [bindFeatureServices](featureserviceregistrylike.md#bindfeatureservices)
* [registerProviders](featureserviceregistrylike.md#registerproviders)

---

## Methods

<a id="bindfeatureservices"></a>

###  bindFeatureServices

▸ **bindFeatureServices**(consumerDefinition: *[FeatureServiceConsumerDefinition](featureserviceconsumerdefinition.md)*, consumerIdSpecifier?: * `undefined` &#124; `string`*): [FeatureServiceBindings](featureservicebindings.md)

*Defined in [feature-service-registry.ts:55](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-service-registry.ts#L55)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| consumerDefinition | [FeatureServiceConsumerDefinition](featureserviceconsumerdefinition.md) |
| `Optional` consumerIdSpecifier |  `undefined` &#124; `string`|

**Returns:** [FeatureServiceBindings](featureservicebindings.md)

___
<a id="registerproviders"></a>

###  registerProviders

▸ **registerProviders**(providerDefinitions: *[FeatureServiceProviderDefinition](featureserviceproviderdefinition.md)[]*, consumerId: *`string`*): `void`

*Defined in [feature-service-registry.ts:50](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-service-registry.ts#L50)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| providerDefinitions | [FeatureServiceProviderDefinition](featureserviceproviderdefinition.md)[] |
| consumerId | `string` |

**Returns:** `void`

___

