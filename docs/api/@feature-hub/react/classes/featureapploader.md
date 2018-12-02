[@feature-hub/react](../README.md) > [FeatureAppLoader](../classes/featureapploader.md)

# Class: FeatureAppLoader

## Type parameters
#### SS 
## Hierarchy

 `PureComponent`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md), `FeatureAppLoaderState`>

**↳ FeatureAppLoader**

## Index

### Constructors

* [constructor](featureapploader.md#constructor)

### Properties

* [state](featureapploader.md#state)

### Methods

* [UNSAFE_componentWillMount](featureapploader.md#unsafe_componentwillmount)
* [UNSAFE_componentWillReceiveProps](featureapploader.md#unsafe_componentwillreceiveprops)
* [UNSAFE_componentWillUpdate](featureapploader.md#unsafe_componentwillupdate)
* [componentDidCatch](featureapploader.md#componentdidcatch)
* [componentDidMount](featureapploader.md#componentdidmount)
* [componentDidUpdate](featureapploader.md#componentdidupdate)
* [componentWillMount](featureapploader.md#componentwillmount)
* [componentWillReceiveProps](featureapploader.md#componentwillreceiveprops)
* [componentWillUnmount](featureapploader.md#componentwillunmount)
* [componentWillUpdate](featureapploader.md#componentwillupdate)
* [getSnapshotBeforeUpdate](featureapploader.md#getsnapshotbeforeupdate)
* [render](featureapploader.md#render)
* [shouldComponentUpdate](featureapploader.md#shouldcomponentupdate)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new FeatureAppLoader**(props: *[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)*): [FeatureAppLoader](featureapploader.md)

*Defined in [feature-app-loader.tsx:37](https://github.com/sinnerschrader/feature-hub/blob/master/packages/react/src/feature-app-loader.tsx#L37)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| props | [FeatureAppLoaderProps](../interfaces/featureapploaderprops.md) |

**Returns:** [FeatureAppLoader](featureapploader.md)

___

## Properties

<a id="state"></a>

###  state

**● state**: *`FeatureAppLoaderState`*

*Defined in [feature-app-loader.tsx:34](https://github.com/sinnerschrader/feature-hub/blob/master/packages/react/src/feature-app-loader.tsx#L34)*

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

▸ **UNSAFE_componentWillReceiveProps**(nextProps: *`Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)>*, nextContext: *`any`*): `void`

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
| nextProps | `Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)> |
| nextContext | `any` |

**Returns:** `void`

___
<a id="unsafe_componentwillupdate"></a>

### `<Optional>` UNSAFE_componentWillUpdate

▸ **UNSAFE_componentWillUpdate**(nextProps: *`Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)>*, nextState: *`Readonly`<`FeatureAppLoaderState`>*, nextContext: *`any`*): `void`

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
| nextProps | `Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)> |
| nextState | `Readonly`<`FeatureAppLoaderState`> |
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

▸ **componentDidMount**(): `Promise`<`void`>

*Overrides ComponentLifecycle.componentDidMount*

*Defined in [feature-app-loader.tsx:65](https://github.com/sinnerschrader/feature-hub/blob/master/packages/react/src/feature-app-loader.tsx#L65)*

**Returns:** `Promise`<`void`>

___
<a id="componentdidupdate"></a>

### `<Optional>` componentDidUpdate

▸ **componentDidUpdate**(prevProps: *`Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)>*, prevState: *`Readonly`<`FeatureAppLoaderState`>*, snapshot?: *[SS]()*): `void`

*Inherited from NewLifecycle.componentDidUpdate*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:570*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

**Parameters:**

| Name | Type |
| ------ | ------ |
| prevProps | `Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)> |
| prevState | `Readonly`<`FeatureAppLoaderState`> |
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

▸ **componentWillReceiveProps**(nextProps: *`Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)>*, nextContext: *`any`*): `void`

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
| nextProps | `Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)> |
| nextContext | `any` |

**Returns:** `void`

___
<a id="componentwillunmount"></a>

###  componentWillUnmount

▸ **componentWillUnmount**(): `void`

*Overrides ComponentLifecycle.componentWillUnmount*

*Defined in [feature-app-loader.tsx:92](https://github.com/sinnerschrader/feature-hub/blob/master/packages/react/src/feature-app-loader.tsx#L92)*

**Returns:** `void`

___
<a id="componentwillupdate"></a>

### `<Optional>` componentWillUpdate

▸ **componentWillUpdate**(nextProps: *`Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)>*, nextState: *`Readonly`<`FeatureAppLoaderState`>*, nextContext: *`any`*): `void`

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
| nextProps | `Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)> |
| nextState | `Readonly`<`FeatureAppLoaderState`> |
| nextContext | `any` |

**Returns:** `void`

___
<a id="getsnapshotbeforeupdate"></a>

### `<Optional>` getSnapshotBeforeUpdate

▸ **getSnapshotBeforeUpdate**(prevProps: *`Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)>*, prevState: *`Readonly`<`FeatureAppLoaderState`>*):  `SS` &#124; `null`

*Inherited from NewLifecycle.getSnapshotBeforeUpdate*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:564*

Runs before React applies the result of `render` to the document, and returns an object to be given to componentDidUpdate. Useful for saving things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated lifecycle events from running.

**Parameters:**

| Name | Type |
| ------ | ------ |
| prevProps | `Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)> |
| prevState | `Readonly`<`FeatureAppLoaderState`> |

**Returns:**  `SS` &#124; `null`

___
<a id="render"></a>

###  render

▸ **render**(): `React.ReactNode`

*Defined in [feature-app-loader.tsx:96](https://github.com/sinnerschrader/feature-hub/blob/master/packages/react/src/feature-app-loader.tsx#L96)*

**Returns:** `React.ReactNode`

___
<a id="shouldcomponentupdate"></a>

### `<Optional>` shouldComponentUpdate

▸ **shouldComponentUpdate**(nextProps: *`Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)>*, nextState: *`Readonly`<`FeatureAppLoaderState`>*, nextContext: *`any`*): `boolean`

*Inherited from ComponentLifecycle.shouldComponentUpdate*

*Defined in /Users/marneb/Documents/oss/feature-hub/node_modules/@types/react/index.d.ts:518*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true. `PureComponent` implements a shallow comparison on props and state and returns true if any props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate` and `componentDidUpdate` will not be called.

**Parameters:**

| Name | Type |
| ------ | ------ |
| nextProps | `Readonly`<[FeatureAppLoaderProps](../interfaces/featureapploaderprops.md)> |
| nextState | `Readonly`<`FeatureAppLoaderState`> |
| nextContext | `any` |

**Returns:** `boolean`

___

