[@feature-hub/react](../README.md) > [FeatureAppContainer](../classes/featureappcontainer.md)

# Class: FeatureAppContainer

## Type parameters
#### S 
#### SS 
## Hierarchy

 `PureComponent`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)>

**↳ FeatureAppContainer**

## Index

### Constructors

* [constructor](featureappcontainer.md#constructor)

### Methods

* [UNSAFE_componentWillMount](featureappcontainer.md#unsafe_componentwillmount)
* [UNSAFE_componentWillReceiveProps](featureappcontainer.md#unsafe_componentwillreceiveprops)
* [UNSAFE_componentWillUpdate](featureappcontainer.md#unsafe_componentwillupdate)
* [componentDidCatch](featureappcontainer.md#componentdidcatch)
* [componentDidMount](featureappcontainer.md#componentdidmount)
* [componentDidUpdate](featureappcontainer.md#componentdidupdate)
* [componentWillMount](featureappcontainer.md#componentwillmount)
* [componentWillReceiveProps](featureappcontainer.md#componentwillreceiveprops)
* [componentWillUnmount](featureappcontainer.md#componentwillunmount)
* [componentWillUpdate](featureappcontainer.md#componentwillupdate)
* [getSnapshotBeforeUpdate](featureappcontainer.md#getsnapshotbeforeupdate)
* [render](featureappcontainer.md#render)
* [shouldComponentUpdate](featureappcontainer.md#shouldcomponentupdate)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new FeatureAppContainer**(props: *[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)*): [FeatureAppContainer](featureappcontainer.md)

*Defined in [feature-app-container.tsx:37](https://github.com/sinnerschrader/feature-hub/blob/master/packages/react/src/feature-app-container.tsx#L37)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| props | [FeatureAppContainerProps](../interfaces/featureappcontainerprops.md) |

**Returns:** [FeatureAppContainer](featureappcontainer.md)

___

## Methods

<a id="unsafe_componentwillmount"></a>

### `<Optional>` UNSAFE_componentWillMount

▸ **UNSAFE_componentWillMount**(): `void`

*Inherited from DeprecatedLifecycle.UNSAFE_componentWillMount*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:599*

Called immediately before mounting occurs, and before `Component#render`. Avoid introducing any side-effects or subscriptions in this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps prevents this from being invoked.
*__deprecated__*: 16.3, use componentDidMount or the constructor instead

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state)

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

**Returns:** `void`

___
<a id="unsafe_componentwillreceiveprops"></a>

### `<Optional>` UNSAFE_componentWillReceiveProps

▸ **UNSAFE_componentWillReceiveProps**(nextProps: *`Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)>*, nextContext: *`any`*): `void`

*Inherited from DeprecatedLifecycle.UNSAFE_componentWillReceiveProps*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:631*

Called when the component may be receiving new props. React may call this even if props have not changed, so be sure to compare new and existing props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps prevents this from being invoked.
*__deprecated__*: 16.3, use static getDerivedStateFromProps instead

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props)

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

**Parameters:**

| Name | Type |
| ------ | ------ |
| nextProps | `Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)> |
| nextContext | `any` |

**Returns:** `void`

___
<a id="unsafe_componentwillupdate"></a>

### `<Optional>` UNSAFE_componentWillUpdate

▸ **UNSAFE_componentWillUpdate**(nextProps: *`Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)>*, nextState: *`Readonly`<`S`>*, nextContext: *`any`*): `void`

*Inherited from DeprecatedLifecycle.UNSAFE_componentWillUpdate*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:659*

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps prevents this from being invoked.
*__deprecated__*: 16.3, use getSnapshotBeforeUpdate instead

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update)

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

**Parameters:**

| Name | Type |
| ------ | ------ |
| nextProps | `Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)> |
| nextState | `Readonly`<`S`> |
| nextContext | `any` |

**Returns:** `void`

___
<a id="componentdidcatch"></a>

### `<Optional>` componentDidCatch

▸ **componentDidCatch**(error: *`Error`*, errorInfo: *`ErrorInfo`*): `void`

*Inherited from ComponentLifecycle.componentDidCatch*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:528*

Catches exceptions generated in descendant components. Unhandled exceptions will cause the entire component tree to unmount.

**Parameters:**

| Name | Type |
| ------ | ------ |
| error | `Error` |
| errorInfo | `ErrorInfo` |

**Returns:** `void`

___
<a id="componentdidmount"></a>

###  componentDidMount

▸ **componentDidMount**(): `void`

*Overrides ComponentLifecycle.componentDidMount*

*Defined in [feature-app-container.tsx:67](https://github.com/sinnerschrader/feature-hub/blob/master/packages/react/src/feature-app-container.tsx#L67)*

**Returns:** `void`

___
<a id="componentdidupdate"></a>

### `<Optional>` componentDidUpdate

▸ **componentDidUpdate**(prevProps: *`Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)>*, prevState: *`Readonly`<`S`>*, snapshot?: *[SS]()*): `void`

*Inherited from NewLifecycle.componentDidUpdate*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:570*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

**Parameters:**

| Name | Type |
| ------ | ------ |
| prevProps | `Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)> |
| prevState | `Readonly`<`S`> |
| `Optional` snapshot | [SS]() |

**Returns:** `void`

___
<a id="componentwillmount"></a>

### `<Optional>` componentWillMount

▸ **componentWillMount**(): `void`

*Inherited from DeprecatedLifecycle.componentWillMount*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:585*

Called immediately before mounting occurs, and before `Component#render`. Avoid introducing any side-effects or subscriptions in this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps prevents this from being invoked.
*__deprecated__*: 16.3, use componentDidMount or the constructor instead; will stop working in React 17

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state)

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

**Returns:** `void`

___
<a id="componentwillreceiveprops"></a>

### `<Optional>` componentWillReceiveProps

▸ **componentWillReceiveProps**(nextProps: *`Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)>*, nextContext: *`any`*): `void`

*Inherited from DeprecatedLifecycle.componentWillReceiveProps*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:614*

Called when the component may be receiving new props. React may call this even if props have not changed, so be sure to compare new and existing props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps prevents this from being invoked.
*__deprecated__*: 16.3, use static getDerivedStateFromProps instead; will stop working in React 17

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props)

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

**Parameters:**

| Name | Type |
| ------ | ------ |
| nextProps | `Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)> |
| nextContext | `any` |

**Returns:** `void`

___
<a id="componentwillunmount"></a>

###  componentWillUnmount

▸ **componentWillUnmount**(): `void`

*Overrides ComponentLifecycle.componentWillUnmount*

*Defined in [feature-app-container.tsx:75](https://github.com/sinnerschrader/feature-hub/blob/master/packages/react/src/feature-app-container.tsx#L75)*

**Returns:** `void`

___
<a id="componentwillupdate"></a>

### `<Optional>` componentWillUpdate

▸ **componentWillUpdate**(nextProps: *`Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)>*, nextState: *`Readonly`<`S`>*, nextContext: *`any`*): `void`

*Inherited from DeprecatedLifecycle.componentWillUpdate*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:644*

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps prevents this from being invoked.
*__deprecated__*: 16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update)

*__see__*: [https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

**Parameters:**

| Name | Type |
| ------ | ------ |
| nextProps | `Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)> |
| nextState | `Readonly`<`S`> |
| nextContext | `any` |

**Returns:** `void`

___
<a id="getsnapshotbeforeupdate"></a>

### `<Optional>` getSnapshotBeforeUpdate

▸ **getSnapshotBeforeUpdate**(prevProps: *`Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)>*, prevState: *`Readonly`<`S`>*):  `SS` &#124; `null`

*Inherited from NewLifecycle.getSnapshotBeforeUpdate*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:564*

Runs before React applies the result of `render` to the document, and returns an object to be given to componentDidUpdate. Useful for saving things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated lifecycle events from running.

**Parameters:**

| Name | Type |
| ------ | ------ |
| prevProps | `Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)> |
| prevState | `Readonly`<`S`> |

**Returns:**  `SS` &#124; `null`

___
<a id="render"></a>

###  render

▸ **render**(): `React.ReactNode`

*Defined in [feature-app-container.tsx:85](https://github.com/sinnerschrader/feature-hub/blob/master/packages/react/src/feature-app-container.tsx#L85)*

**Returns:** `React.ReactNode`

___
<a id="shouldcomponentupdate"></a>

### `<Optional>` shouldComponentUpdate

▸ **shouldComponentUpdate**(nextProps: *`Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)>*, nextState: *`Readonly`<`S`>*, nextContext: *`any`*): `boolean`

*Inherited from ComponentLifecycle.shouldComponentUpdate*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:518*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true. `PureComponent` implements a shallow comparison on props and state and returns true if any props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate` and `componentDidUpdate` will not be called.

**Parameters:**

| Name | Type |
| ------ | ------ |
| nextProps | `Readonly`<[FeatureAppContainerProps](../interfaces/featureappcontainerprops.md)> |
| nextState | `Readonly`<`S`> |
| nextContext | `any` |

**Returns:** `boolean`

___

