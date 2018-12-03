import {
  FeatureServiceBinder,
  FeatureServiceConsumerEnvironment
} from '@feature-hub/core';
import {TodoManagerState, TodoManagerV1, todoManagerDefinition} from '..';

describe('todoManagerDefinition', () => {
  let mockEnv: FeatureServiceConsumerEnvironment;
  let spyConsoleInfo: jest.SpyInstance;

  beforeEach(() => {
    mockEnv = {featureServices: {}, config: {}};

    spyConsoleInfo = jest.spyOn(console, 'info');
    spyConsoleInfo.mockImplementation(jest.fn());
  });

  afterEach(() => {
    spyConsoleInfo.mockRestore();
  });

  it('defines a todo manager', () => {
    expect(todoManagerDefinition.id).toBe('s2:todomvc-todo-manager');
    expect(todoManagerDefinition.dependencies).toBeUndefined();
  });

  describe('#create', () => {
    it('creates a shared todo manager containing version 1.0', () => {
      const sharedTodoManager = todoManagerDefinition.create(mockEnv);

      expect(sharedTodoManager['1.0']).toBeDefined();
    });
  });

  describe('TodoManagerV1', () => {
    let todoManagerV1: TodoManagerV1;

    beforeEach(() => {
      const sharedTodoManager = todoManagerDefinition.create(mockEnv);

      todoManagerV1 = (sharedTodoManager['1.0'] as FeatureServiceBinder<
        TodoManagerV1
      >)('test:consumer').featureService;
    });

    describe('#add', () => {
      describe('with no initial todos', () => {
        it('adds the todo', () => {
          todoManagerV1.add('test');

          const expectedTodos: TodoManagerState = {
            allIds: ['0'],
            byId: {
              0: {id: '0', title: 'test', completed: false}
            }
          };

          expect(todoManagerV1.getTodos()).toEqual(expectedTodos);
        });
      });

      describe('with multiple todos', () => {
        it('adds the todos', () => {
          todoManagerV1.add('test 1');
          todoManagerV1.add('test 2');
          todoManagerV1.add('test 3');

          const expectedTodos: TodoManagerState = {
            byId: {
              0: {id: '0', title: 'test 1', completed: false},
              1: {id: '1', title: 'test 2', completed: false},
              2: {id: '2', title: 'test 3', completed: false}
            },
            allIds: ['0', '1', '2']
          };

          expect(todoManagerV1.getTodos()).toEqual(expectedTodos);
        });
      });

      it('logs the added todo', () => {
        todoManagerV1.add('test');

        expect(spyConsoleInfo).toHaveBeenCalledWith('Added todo:', {
          id: '0',
          title: 'test',
          completed: false
        });
      });

      it('does not mutate the current todos instance', () => {
        todoManagerV1.add('test 1');

        const actualTodos = todoManagerV1.getTodos();

        const expectedTodos: TodoManagerState = {
          byId: {
            0: {id: '0', title: 'test 1', completed: false}
          },
          allIds: ['0']
        };

        expect(actualTodos).toEqual(expectedTodos);

        todoManagerV1.add('test 2');

        expect(actualTodos).toEqual(expectedTodos);
      });
    });

    describe('#remove', () => {
      describe('with a single todo', () => {
        it('removes the todo', () => {
          todoManagerV1.add('test');
          todoManagerV1.remove('0');

          const expectedTodos: TodoManagerState = {allIds: [], byId: {}};

          expect(todoManagerV1.getTodos()).toEqual(expectedTodos);
        });
      });

      describe('with multiple todos', () => {
        it('removes the todo', () => {
          todoManagerV1.add('test 1');
          todoManagerV1.add('test 2');
          todoManagerV1.add('test 3');
          todoManagerV1.remove('1');

          const expectedTodos: TodoManagerState = {
            byId: {
              0: {id: '0', title: 'test 1', completed: false},
              2: {id: '2', title: 'test 3', completed: false}
            },
            allIds: ['0', '2']
          };

          expect(todoManagerV1.getTodos()).toEqual(expectedTodos);
        });
      });

      it('logs the removed todo', () => {
        todoManagerV1.add('test');
        spyConsoleInfo.mockClear();
        todoManagerV1.remove('0');

        expect(spyConsoleInfo).toHaveBeenCalledWith('Removed todo:', {
          id: '0',
          title: 'test',
          completed: false
        });
      });

      it('does not mutate the current todos instance', () => {
        todoManagerV1.add('test 1');

        const actualTodos = todoManagerV1.getTodos();

        const expectedTodos: TodoManagerState = {
          byId: {
            0: {id: '0', title: 'test 1', completed: false}
          },
          allIds: ['0']
        };

        expect(actualTodos).toEqual(expectedTodos);

        todoManagerV1.remove('0');

        expect(actualTodos).toEqual(expectedTodos);
      });
    });

    describe('#setCompleted', () => {
      it('updates the completed property of the todo with the given id', () => {
        todoManagerV1.add('test');
        todoManagerV1.setCompleted('0', true);

        const expectedTodos: TodoManagerState = {
          allIds: ['0'],
          byId: {
            0: {id: '0', title: 'test', completed: true}
          }
        };

        expect(todoManagerV1.getTodos()).toEqual(expectedTodos);
      });

      it('logs the changed todo', () => {
        todoManagerV1.add('test');
        spyConsoleInfo.mockClear();
        todoManagerV1.setCompleted('0', true);

        expect(spyConsoleInfo).toHaveBeenCalledWith(
          'Changed todo from:',
          {
            id: '0',
            title: 'test',
            completed: false
          },
          'to:',
          {
            id: '0',
            title: 'test',
            completed: true
          }
        );
      });

      it('does not mutate the current todos instance', () => {
        todoManagerV1.add('test 1');

        const actualTodos = todoManagerV1.getTodos();

        const expectedTodos: TodoManagerState = {
          byId: {
            0: {id: '0', title: 'test 1', completed: false}
          },
          allIds: ['0']
        };

        expect(actualTodos).toEqual(expectedTodos);

        todoManagerV1.setCompleted('0', true);

        expect(actualTodos).toEqual(expectedTodos);
      });
    });

    describe('#editTitle', () => {
      it('updates the title property of the todo with the given id', () => {
        todoManagerV1.add('foo');
        todoManagerV1.editTitle('0', 'bar');

        const expectedTodos: TodoManagerState = {
          allIds: ['0'],
          byId: {
            0: {id: '0', title: 'bar', completed: false}
          }
        };

        expect(todoManagerV1.getTodos()).toEqual(expectedTodos);
      });

      it('logs the changed todo', () => {
        todoManagerV1.add('foo');
        spyConsoleInfo.mockClear();
        todoManagerV1.editTitle('0', 'bar');

        expect(spyConsoleInfo).toHaveBeenCalledWith(
          'Changed todo from:',
          {
            id: '0',
            title: 'foo',
            completed: false
          },
          'to:',
          {
            id: '0',
            title: 'bar',
            completed: false
          }
        );
      });

      it('does not mutate the current todos instance', () => {
        todoManagerV1.add('foo');

        const actualTodos = todoManagerV1.getTodos();

        const expectedTodos: TodoManagerState = {
          byId: {
            0: {id: '0', title: 'foo', completed: false}
          },
          allIds: ['0']
        };

        expect(actualTodos).toEqual(expectedTodos);

        todoManagerV1.editTitle('0', 'bar');

        expect(actualTodos).toEqual(expectedTodos);
      });
    });
  });
});
