import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';

export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
}

export interface Todos {
  readonly [id: string]: Todo | undefined;
}

export interface TodoBucketState {
  readonly byId: Todos;
  readonly allIds: string[];
}

export interface TodoBucketV1 {
  getTodos(): TodoBucketState;
  add(title: string): void;
  remove(id: string): void;
  setCompleted(id: string, completed: boolean): void;
  editTitle(id: string, title: string): void;
}

export interface SharedTodoBucket extends SharedFeatureService {
  readonly '1.0': FeatureServiceBinder<TodoBucketV1>;
}

class Id {
  private value = 0;

  public next(): string {
    return String(this.value++);
  }
}

class TodoBucketV1Impl implements TodoBucketV1 {
  public constructor(private todos: TodoBucketState, private readonly id: Id) {}

  public getTodos(): TodoBucketState {
    return this.todos;
  }

  public add(title: string): void {
    const id = this.id.next();
    const todo = {id, title, completed: false};

    this.todos = {
      byId: {...this.todos.byId, [id]: todo},
      allIds: [...this.todos.allIds, id]
    };

    console.info('Added todo:', todo);
  }

  public remove(id: string): void {
    const {[id]: todo, ...byId} = this.todos.byId;

    if (!todo) {
      return;
    }

    this.todos = {
      byId,
      allIds: this.todos.allIds.filter(currentId => currentId !== id)
    };

    console.info('Removed todo:', todo);
  }

  public setCompleted(id: string, completed: boolean): void {
    const oldTodo = this.todos.byId[id];

    if (!oldTodo || oldTodo.completed === completed) {
      return;
    }

    const newTodo = {...oldTodo, completed};

    this.todos = {
      ...this.todos,
      byId: {...this.todos.byId, [id]: newTodo}
    };

    console.info('Changed todo from:', oldTodo, 'to:', newTodo);
  }

  public editTitle(id: string, title: string): void {
    const oldTodo = this.todos.byId[id];

    if (!oldTodo || oldTodo.title === title) {
      return;
    }

    const newTodo = {...oldTodo, title};

    this.todos = {
      ...this.todos,
      byId: {...this.todos.byId, [id]: newTodo}
    };

    console.info('Changed todo from:', oldTodo, 'to:', newTodo);
  }
}

function create(): SharedTodoBucket {
  const todos = {byId: {}, allIds: []};
  const todoBucket = new TodoBucketV1Impl(todos, new Id());

  return {
    '1.0': () => ({featureService: todoBucket})
  };
}

export const todoBucketDefinition: FeatureServiceProviderDefinition = {
  id: 's2:todomvc-todo-manager',
  create
};
