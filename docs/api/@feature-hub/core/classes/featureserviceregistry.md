[@feature-hub/core](../README.md) > [FeatureServiceRegistry](../classes/featureserviceregistry.md)

# Class: FeatureServiceRegistry

## Hierarchy

**FeatureServiceRegistry**

## Implements

* [FeatureServiceRegistryLike](../interfaces/featureserviceregistrylike.md)

## Index

### Constructors

* [constructor](featureserviceregistry.md#constructor)

### Methods

* [bindFeatureServices](featureserviceregistry.md#bindfeatureservices)
* [registerProviders](featureserviceregistry.md#registerproviders)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new FeatureServiceRegistry**(consumerConfigs: *[FeatureServiceConsumerConfigs](../interfaces/featureserviceconsumerconfigs.md)*): [FeatureServiceRegistry](featureserviceregistry.md)

*Defined in [feature-service-registry.ts:69](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-service-registry.ts#L69)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| consumerConfigs | [FeatureServiceConsumerConfigs](../interfaces/featureserviceconsumerconfigs.md) |

**Returns:** [FeatureServiceRegistry](featureserviceregistry.md)

___

## Methods

<a id="bindfeatureservices"></a>

###  bindFeatureServices

▸ **bindFeatureServices**(consumerDefinition: *[FeatureServiceConsumerDefinition](../interfaces/featureserviceconsumerdefinition.md)*, consumerIdSpecifier?: * `undefined` &#124; `string`*): [FeatureServiceBindings](../interfaces/featureservicebindings.md)

*Implementation of [FeatureServiceRegistryLike](../interfaces/featureserviceregistrylike.md).[bindFeatureServices](../interfaces/featureserviceregistrylike.md#bindfeatureservices)*

*Defined in [feature-service-registry.ts:117](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-service-registry.ts#L117)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| consumerDefinition | [FeatureServiceConsumerDefinition](../interfaces/featureserviceconsumerdefinition.md) |
| `Optional` consumerIdSpecifier |  `undefined` &#124; `string`|

**Returns:** [FeatureServiceBindings](../interfaces/featureservicebindings.md)

___
<a id="registerproviders"></a>

###  registerProviders

▸ **registerProviders**(providerDefinitions: *[FeatureServiceProviderDefinition](../interfaces/featureserviceproviderdefinition.md)[]*, consumerId: *`string`*): `void`

*Implementation of [FeatureServiceRegistryLike](../interfaces/featureserviceregistrylike.md).[registerProviders](../interfaces/featureserviceregistrylike.md#registerproviders)*

*Defined in [feature-service-registry.ts:75](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-service-registry.ts#L75)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| providerDefinitions | [FeatureServiceProviderDefinition](../interfaces/featureserviceproviderdefinition.md)[] |
| consumerId | `string` |

**Returns:** `void`

___

