[@feature-hub/core](../README.md) > [FeatureAppDefinition](../interfaces/featureappdefinition.md)

# Interface: FeatureAppDefinition

## Type parameters
#### TFeatureApp 
## Hierarchy

 [FeatureServiceConsumerDefinition](featureserviceconsumerdefinition.md)

**↳ FeatureAppDefinition**

## Index

### Properties

* [dependencies](featureappdefinition.md#dependencies)
* [id](featureappdefinition.md#id)
* [ownFeatureServiceDefinitions](featureappdefinition.md#ownfeatureservicedefinitions)

### Methods

* [create](featureappdefinition.md#create)

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
<a id="ownfeatureservicedefinitions"></a>

### `<Optional>` ownFeatureServiceDefinitions

**● ownFeatureServiceDefinitions**: *[FeatureServiceProviderDefinition](featureserviceproviderdefinition.md)[]*

*Defined in [feature-app-manager.ts:12](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L12)*

___

## Methods

<a id="create"></a>

###  create

▸ **create**(env: *[FeatureServiceConsumerEnvironment](featureserviceconsumerenvironment.md)*): `TFeatureApp`

*Defined in [feature-app-manager.ts:14](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/feature-app-manager.ts#L14)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| env | [FeatureServiceConsumerEnvironment](featureserviceconsumerenvironment.md) |

**Returns:** `TFeatureApp`

___

