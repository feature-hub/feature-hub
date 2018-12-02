[@feature-hub/core](../README.md) > [AsyncValue](../classes/asyncvalue.md)

# Class: AsyncValue

## Type parameters
#### TValue 
## Hierarchy

**AsyncValue**

## Index

### Constructors

* [constructor](asyncvalue.md#constructor)

### Properties

* [error](asyncvalue.md#error)
* [promise](asyncvalue.md#promise)
* [value](asyncvalue.md#value)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new AsyncValue**(promise: *`Promise`<`TValue`>*, value?: *[TValue]()*, error?: *`Error`*): [AsyncValue](asyncvalue.md)

*Defined in [async-value.ts:1](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/async-value.ts#L1)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| promise | `Promise`<`TValue`> |
| `Optional` value | [TValue]() |
| `Optional` error | `Error` |

**Returns:** [AsyncValue](asyncvalue.md)

___

## Properties

<a id="error"></a>

### `<Optional>` error

**● error**: *`Error`*

*Defined in [async-value.ts:5](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/async-value.ts#L5)*

___
<a id="promise"></a>

###  promise

**● promise**: *`Promise`<`TValue`>*

*Defined in [async-value.ts:3](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/async-value.ts#L3)*

___
<a id="value"></a>

### `<Optional>` value

**● value**: *[TValue]()*

*Defined in [async-value.ts:4](https://github.com/sinnerschrader/feature-hub/blob/master/packages/core/src/async-value.ts#L4)*

___

