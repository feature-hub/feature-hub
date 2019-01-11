// tslint:disable:no-implicit-dependencies

import {AsyncSsrManagerV1} from '@feature-hub/async-ssr-manager';
import {
  AsyncValue,
  FeatureAppDefinition,
  FeatureAppManagerLike
} from '@feature-hub/core';
import {shallow} from 'enzyme';
import * as React from 'react';
import {FeatureAppContainer, FeatureAppLoader} from '..';

interface MockAsyncSsrManager extends AsyncSsrManagerV1 {
  rerenderAfter: ((promise: Promise<unknown>) => void) & jest.Mock;
}

describe('FeatureAppLoader', () => {
  let mockFeatureAppManager: FeatureAppManagerLike;
  let mockGetAsyncFeatureAppDefinition: jest.Mock;
  let mockAsyncFeatureAppDefinition: AsyncValue<FeatureAppDefinition<unknown>>;
  let mockAsyncSsrManager: MockAsyncSsrManager;
  let spyConsoleError: jest.SpyInstance;

  beforeEach(() => {
    if (document.head) {
      document.head.innerHTML = '';
    }

    mockAsyncFeatureAppDefinition = new AsyncValue(
      new Promise<FeatureAppDefinition<unknown>>(jest.fn())
    );

    mockGetAsyncFeatureAppDefinition = jest.fn(
      () => mockAsyncFeatureAppDefinition
    );

    mockFeatureAppManager = {
      getAsyncFeatureAppDefinition: mockGetAsyncFeatureAppDefinition,
      getFeatureAppScope: jest.fn(),
      preloadFeatureApp: jest.fn(),
      destroy: jest.fn()
    };

    mockAsyncSsrManager = {
      rerenderAfter: jest.fn(),
      renderUntilCompleted: jest.fn(),
      serverRequest: undefined
    };

    spyConsoleError = jest.spyOn(console, 'error');
    spyConsoleError.mockImplementation(jest.fn());
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  it('throws an error if no src is provided', () => {
    expect(() =>
      shallow(
        <FeatureAppLoader featureAppManager={mockFeatureAppManager} src="" />
      )
    ).toThrowError(new Error('No src provided.'));
  });

  it('initially renders nothing', () => {
    const wrapper = shallow(
      <FeatureAppLoader
        featureAppManager={mockFeatureAppManager}
        src="example.js"
      />
    );

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  describe('without a css prop', () => {
    it('does not change the document head', () => {
      shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
        />
      );

      expect(document.head).toMatchSnapshot();
    });
  });

  describe('with a css prop', () => {
    it('appends link elements to the document head', () => {
      shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
          css={[{href: 'foo.css'}, {href: 'bar.css', media: 'print'}]}
        />
      );

      expect(document.head).toMatchSnapshot();
    });

    describe('when the css has already been appended', () => {
      it('does not append the css a second time', () => {
        shallow(
          <FeatureAppLoader
            featureAppManager={mockFeatureAppManager}
            src="example.js"
            css={[{href: 'foo.css'}]}
          />
        );

        shallow(
          <FeatureAppLoader
            featureAppManager={mockFeatureAppManager}
            src="example.js"
            css={[{href: 'foo.css'}]}
          />
        );

        expect(document.head).toMatchSnapshot();
      });
    });
  });

  describe('when a Feature App definition is synchronously available', () => {
    let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;

    beforeEach(() => {
      mockFeatureAppDefinition = {
        id: 'testId',
        create: jest.fn()
      };

      mockAsyncFeatureAppDefinition = new AsyncValue(
        Promise.resolve(mockFeatureAppDefinition)
      );
    });

    it('renders a FeatureAppContainer', () => {
      const wrapper = shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
          idSpecifier="testIdSpecifier"
        />
      );

      expect(wrapper.getElement()).toEqual(
        <FeatureAppContainer
          featureAppManager={mockFeatureAppManager}
          featureAppDefinition={mockFeatureAppDefinition}
          idSpecifier="testIdSpecifier"
        />
      );
    });

    it('does not trigger a rerender on the Async SSR Manager', () => {
      shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
          serverSrc="example-node.js"
          asyncSsrManager={mockAsyncSsrManager}
        />
      );

      expect(mockAsyncSsrManager.rerenderAfter).not.toHaveBeenCalled();
    });
  });

  describe('when the async Feature App definition synchronously has an error', () => {
    let mockError: Error;

    beforeEach(() => {
      mockError = new Error('Failed to load Feature App module.');

      mockAsyncFeatureAppDefinition = new AsyncValue(
        Promise.reject(mockError),
        undefined,
        mockError
      );
    });

    it('renders nothing and logs an error', () => {
      const wrapper = shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
          idSpecifier="testIdSpecifier"
        />
      );

      expect(wrapper.isEmptyRender()).toBe(true);

      expect(spyConsoleError.mock.calls).toEqual([
        [
          'The Feature App for the src "example.js" and the ID specifier "testIdSpecifier" could not be rendered.',
          mockError
        ]
      ]);
    });
  });

  describe('when a Feature App definition is loaded asynchronously', () => {
    let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;

    beforeEach(() => {
      mockFeatureAppDefinition = {
        id: 'testId',
        create: jest.fn()
      };

      mockAsyncFeatureAppDefinition = new AsyncValue(
        new Promise<FeatureAppDefinition<unknown>>(resolve =>
          // defer to next event loop turn to guarantee asynchronism
          setImmediate(() => resolve(mockFeatureAppDefinition))
        )
      );
    });

    it('initially renders nothing', () => {
      const wrapper = shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
        />
      );

      expect(wrapper.isEmptyRender()).toBe(true);
    });

    it('renders a FeatureAppContainer when loaded', async () => {
      const wrapper = shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
          idSpecifier="testIdSpecifier"
        />
      );

      await mockAsyncFeatureAppDefinition.promise;

      expect(wrapper.getElement()).toEqual(
        <FeatureAppContainer
          featureAppManager={mockFeatureAppManager}
          featureAppDefinition={mockFeatureAppDefinition}
          idSpecifier="testIdSpecifier"
        />
      );
    });

    it('does not trigger a rerender on the Async SSR Manager', () => {
      shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
          serverSrc="example-node.js"
          asyncSsrManager={mockAsyncSsrManager}
        />
      );

      expect(mockAsyncSsrManager.rerenderAfter).not.toHaveBeenCalled();
    });

    describe('when unmounted before loading has finished', () => {
      it('renders nothing', async () => {
        const wrapper = shallow(
          <FeatureAppLoader
            featureAppManager={mockFeatureAppManager}
            src="example.js"
          />
        );

        wrapper.unmount();

        await mockAsyncFeatureAppDefinition.promise;

        expect(wrapper.isEmptyRender()).toBe(true);
      });
    });
  });

  describe('when a Feature App definition fails to load asynchronously', () => {
    let mockError: Error;

    beforeEach(() => {
      mockError = new Error('Failed to load Feature App module.');

      mockAsyncFeatureAppDefinition = new AsyncValue(
        new Promise<FeatureAppDefinition<unknown>>((_, reject) =>
          // defer to next event loop turn to guarantee asynchronism
          setImmediate(() => reject(mockError))
        )
      );
    });

    it('renders nothing and logs an error', async () => {
      const wrapper = shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
          idSpecifier="testIdSpecifier"
        />
      );

      expect.assertions(3);

      try {
        await mockAsyncFeatureAppDefinition.promise;
      } catch (error) {
        expect(error).toBe(mockError);
      }

      expect(wrapper.isEmptyRender()).toBe(true);

      expect(spyConsoleError.mock.calls).toEqual([
        [
          'The Feature App for the src "example.js" and the ID specifier "testIdSpecifier" could not be rendered.',
          mockError
        ]
      ]);
    });

    describe('when unmounted before loading has finished', () => {
      it('logs an error', async () => {
        const wrapper = shallow(
          <FeatureAppLoader
            featureAppManager={mockFeatureAppManager}
            src="example.js"
          />
        );

        wrapper.unmount();

        expect.assertions(2);

        try {
          await mockAsyncFeatureAppDefinition.promise;
        } catch (error) {
          expect(error).toBe(mockError);
        }

        expect(spyConsoleError.mock.calls).toEqual([
          [
            'The Feature App for the src "example.js" could not be rendered.',
            mockError
          ]
        ]);
      });
    });
  });
});
