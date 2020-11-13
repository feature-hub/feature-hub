import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  FeatureServices,
  SharedFeatureService,
} from '@feature-hub/core';
import {Logger} from '@feature-hub/logger';

export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
}

export type ListenerCallback = () => void;
export type UnsubscribeCallback = () => void;

export interface TodoManagerV1 {
  getTodos(): Todo[];
  add(title: string): Todo;
  remove(id: string): void;
  setCompleted(id: string, completed: boolean): void;
  setTitle(id: string, title: string): void;
  subscribe(listener: ListenerCallback): UnsubscribeCallback;
}

export interface SharedTodoManager extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<TodoManagerV1>;
}

export interface TodoManagerDependencies extends FeatureServices {
  readonly 's2:logger': Logger;
}

class TodoManagerV1Impl implements TodoManagerV1 {
  private readonly listeners = new Set<ListenerCallback>();
  private todos: Todo[] = [];
  private idCount = 0;

  public constructor(private readonly logger: Logger) {}

  public getTodos(): Todo[] {
    return this.todos;
  }

  public add(title: string): Todo {
    const id = this.nextId();
    const todo = {id, title, completed: false};

    this.todos = [...this.todos, todo];

    this.logger.info('Added todo:', todo);
    this.notifyListeners();

    return todo;
  }

  public remove(id: string): void {
    const index = this.todos.findIndex((todo) => todo.id === id);
    const deletedTodo = this.todos[index];

    if (!deletedTodo) {
      return;
    }

    this.todos = [
      ...this.todos.slice(0, index),
      ...this.todos.slice(index + 1),
    ];

    this.logger.info('Removed todo:', deletedTodo);
    this.notifyListeners();
  }

  public setCompleted(id: string, completed: boolean): void {
    this.editTodo(id, 'completed', completed);
  }

  public setTitle(id: string, title: string): void {
    this.editTodo(id, 'title', title);
  }

  public subscribe(listener: ListenerCallback): UnsubscribeCallback {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  private nextId(): string {
    const id = String(this.idCount);

    this.idCount += 1;

    return id;
  }

  private editTodo<Key extends keyof Todo>(
    id: string,
    key: Key,
    value: Todo[Key]
  ): void {
    const index = this.todos.findIndex((todo) => todo.id === id);
    const oldTodo = this.todos[index];

    if (!oldTodo || oldTodo[key] === value) {
      return;
    }

    const newTodo = {...oldTodo, [key]: value};

    this.todos = [
      ...this.todos.slice(0, index),
      newTodo,
      ...this.todos.slice(index + 1),
    ];

    this.logger.info('Changed todo from:', oldTodo, 'to:', newTodo);
    this.notifyListeners();
  }
}

export const todoManagerDefinition: FeatureServiceProviderDefinition<
  SharedTodoManager,
  TodoManagerDependencies
> = {
  id: 'test:todomvc-todo-manager',

  dependencies: {
    featureServices: {
      's2:logger': '^1.0.0',
    },
  },

  create: (env) => {
    const logger = env.featureServices['s2:logger'];
    const todoManager = new TodoManagerV1Impl(logger);

    return {
      '1.0.0': () => ({featureService: todoManager}),
    };
  },
};
