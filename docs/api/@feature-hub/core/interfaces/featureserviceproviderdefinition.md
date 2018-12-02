[@feature-hub/core](../README.md) > [FeatureServiceProviderDefinition](../interfaces/featureserviceproviderdefinition.md)

# Interface: FeatureServiceProviderDefinition

## Hierarchy

 [FeatureServiceConsumerDefinition](featureserviceconsumerdefinition.md)

**↳ FeatureServiceProviderDefinition**

## Index

### Properties

* [dependencies](featureserviceproviderdefinition.md#dependencies)
* [id](featureserviceproviderdefinition.md#id)

### Methods

* [create](featureserviceproviderdefinition.md#create)

---

## Properties

<a id="dependencies"></a>

### `<Optional>` dependencies

**● dependencies**: *[FeatureServiceConsumerDependencies](featureserviceconsumerdependencies.md)*

*Inherited from [FeatureServiceConsumerDefinition](featureserviceconsumerdefinition.md).[dependencies](featureserviceconsumerdefinition.md#dependencies)*

*Defined in [feature-service-registry.ts:10](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-service-registry.ts#L10)*

___
<a id="id"></a>

###  id

**● id**: *`string`*

*Inherited from [FeatureServiceConsumerDefinition](featureserviceconsumerdefinition.md).[id](featureserviceconsumerdefinition.md#id)*

*Defined in [feature-service-registry.ts:9](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-service-registry.ts#L9)*

___

## Methods

<a id="create"></a>

###  create

▸ **create**(env: *[FeatureServiceConsumerEnvironment](featureserviceconsumerenvironment.md)*): [SharedFeatureService](sharedfeatureservice.md)

*Defined in [feature-service-registry.ts:42](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-service-registry.ts#L42)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| env | [FeatureServiceConsumerEnvironment](featureserviceconsumerenvironment.md) |

**Returns:** [SharedFeatureService](sharedfeatureservice.md)

___

