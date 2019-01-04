// tslint:disable:no-implicit-dependencies

import {
  FeatureAppDefinition,
  FeatureAppManagerLike,
  FeatureAppScope
} from '@feature-hub/core';
import {mount, shallow} from 'enzyme';
import * as React from 'react';
import {FeatureAppContainer} from '..';

describe('FeatureAppContainer', () => {
  let mockManager: FeatureAppManagerLike;
  let mockGetFeatureAppScope: jest.Mock;
  let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;
  let mockFeatureAppScope: FeatureAppScope<unknown>;
  let spyConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockFeatureAppDefinition = {id: 'testId', create: jest.fn()};
    mockFeatureAppScope = {featureApp: {}, destroy: jest.fn()};
    mockGetFeatureAppScope = jest.fn(() => mockFeatureAppScope);

    mockManager = {
      getAsyncFeatureAppDefinition: jest.fn(),
      getFeatureAppScope: mockGetFeatureAppScope,
      preloadFeatureApp: jest.fn(),
      destroy: jest.fn()
    };

    spyConsoleError = jest.spyOn(console, 'error');
    spyConsoleError.mockImplementation(jest.fn());
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  it('calls the manager with the given Feature App definition and id specifier', () => {
    shallow(
      <FeatureAppContainer
        manager={mockManager}
        featureAppDefinition={mockFeatureAppDefinition}
        idSpecifier="testIdSpecifier"
      />
    );

    expect(mockGetFeatureAppScope.mock.calls).toEqual([
      [mockFeatureAppDefinition, 'testIdSpecifier']
    ]);
  });

  describe('with a React Feature App', () => {
    beforeEach(() => {
      mockFeatureAppScope = {
        featureApp: {
          render: () => <div>This is the React Feature App.</div>
        },
        destroy: jest.fn()
      };
    });

    it('renders the React element', () => {
      const wrapper = shallow(
        <FeatureAppContainer
          manager={mockManager}
          featureAppDefinition={mockFeatureAppDefinition}
        />
      );

      expect(wrapper).toMatchInlineSnapshot(`
<div>
  This is the React Feature App.
</div>
`);
    });

    describe('when unmounted', () => {
      it('calls destroy() on the Feature App scope', () => {
        const wrapper = shallow(
          <FeatureAppContainer
            manager={mockManager}
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(mockFeatureAppScope.destroy).not.toHaveBeenCalled();

        wrapper.unmount();

        expect(mockFeatureAppScope.destroy).toHaveBeenCalledTimes(1);
      });

      describe('when the Feature App scope throws an error while being destroyed', () => {
        let mockError: Error;

        beforeEach(() => {
          mockError = new Error('Failed to destroy Feature App scope');

          mockFeatureAppScope.destroy = () => {
            throw mockError;
          };
        });

        it('logs the error', () => {
          const wrapper = shallow(
            <FeatureAppContainer
              manager={mockManager}
              featureAppDefinition={mockFeatureAppDefinition}
            />
          );

          wrapper.unmount();

          expect(spyConsoleError.mock.calls).toEqual([[mockError]]);
        });
      });
    });
  });

  describe('with a DOM Feature App', () => {
    beforeEach(() => {
      mockFeatureAppScope = {
        featureApp: {
          attachTo(container: HTMLElement): void {
            container.innerHTML = 'This is the DOM Feature App.';
          }
        },
        destroy: jest.fn()
      };
    });

    it("renders a container and passes it to the Feature App's render method", () => {
      const wrapper = mount(
        <FeatureAppContainer
          manager={mockManager}
          featureAppDefinition={mockFeatureAppDefinition}
        />
      );

      expect(wrapper.html()).toMatchInlineSnapshot(
        '"<div>This is the DOM Feature App.</div>"'
      );
    });

    describe('when unmounted', () => {
      it('calls destroy() on the Feature App scope', () => {
        const wrapper = shallow(
          <FeatureAppContainer
            manager={mockManager}
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(mockFeatureAppScope.destroy).not.toHaveBeenCalled();

        wrapper.unmount();

        expect(mockFeatureAppScope.destroy).toHaveBeenCalledTimes(1);
      });

      describe('when the Feature App scope throws an error while being destroyed', () => {
        let mockError: Error;

        beforeEach(() => {
          mockError = new Error('Failed to destroy Feature App scope');

          mockFeatureAppScope.destroy = () => {
            throw mockError;
          };
        });

        it('logs the error', () => {
          const wrapper = shallow(
            <FeatureAppContainer
              manager={mockManager}
              featureAppDefinition={mockFeatureAppDefinition}
            />
          );

          wrapper.unmount();

          expect(spyConsoleError.mock.calls).toEqual([[mockError]]);
        });
      });
    });
  });

  for (const invalidFeatureApp of [
    undefined,
    null,
    {},
    {attachTo: 'foo'},
    {render: 'foo'}
  ]) {
    describe(`when an invalid Feature App (${JSON.stringify(
      invalidFeatureApp
    )}) is created`, () => {
      beforeEach(() => {
        mockFeatureAppScope = {
          featureApp: invalidFeatureApp,
          destroy: jest.fn()
        };
      });

      it('renders nothing and logs an error', () => {
        const wrapper = shallow(
          <FeatureAppContainer
            manager={mockManager}
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(wrapper.isEmptyRender()).toBe(true);

        const expectedError = new Error(
          'Invalid Feature App found. The Feature App must be an object with either 1) a `render` method that returns a React element, or 2) an `attachTo` method that accepts a container DOM element.'
        );

        expect(spyConsoleError.mock.calls).toEqual([[expectedError]]);
      });
    });
  }

  describe('when a Feature App scope fails to be created', () => {
    let mockError: Error;

    beforeEach(() => {
      mockError = new Error('Failed to create Feature App scope.');

      mockGetFeatureAppScope.mockImplementation(() => {
        throw mockError;
      });
    });

    it('renders nothing and logs an error', () => {
      const wrapper = shallow(
        <FeatureAppContainer
          manager={mockManager}
          featureAppDefinition={mockFeatureAppDefinition}
        />
      );

      expect(wrapper.isEmptyRender()).toBe(true);

      expect(spyConsoleError.mock.calls).toEqual([[mockError]]);
    });

    describe('when unmounted', () => {
      it('does nothing', () => {
        const wrapper = shallow(
          <FeatureAppContainer
            manager={mockManager}
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        wrapper.unmount();
      });
    });
  });
});
