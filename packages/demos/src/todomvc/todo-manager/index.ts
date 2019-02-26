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

class TodoManagerV1Impl implements TodoManagerV1 {
  private readonly listeners = new Set<ListenerCallback>();
  private todos: Todo[] = [];
  private idCount = 0;

  public getTodos(): Todo[] {
    return this.todos;
  }

  public add(title: string): Todo {
    const id = this.nextId();
    const todo = {id, title, completed: false};

    this.todos = [...this.todos, todo];

    console.info('Added todo:', todo);
    this.notifyListeners();

    return todo;
  }

  public remove(id: string): void {
    const index = this.todos.findIndex(todo => todo.id === id);
    const deletedTodo = this.todos[index];

    if (!deletedTodo) {
      return;
    }

    this.todos = [
      ...this.todos.slice(0, index),
      ...this.todos.slice(index + 1)
    ];

    console.info('Removed todo:', deletedTodo);
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
    this.listeners.forEach(listener => listener());
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
    const index = this.todos.findIndex(todo => todo.id === id);
    const oldTodo = this.todos[index];

    if (!oldTodo || oldTodo[key] === value) {
      return;
    }

    const newTodo = {...oldTodo, [key]: value};

    this.todos = [
      ...this.todos.slice(0, index),
      newTodo,
      ...this.todos.slice(index + 1)
    ];

    console.info('Changed todo from:', oldTodo, 'to:', newTodo);
    this.notifyListeners();
  }
}

export const todoManagerDefinition: FeatureServiceProviderDefinition<
  SharedTodoManager
> = {
  id: 'test:todomvc-todo-manager',

  create: () => {
    const todoManager = new TodoManagerV1Impl();

    return {
      '1.0.0': () => ({featureService: todoManager})
    };
  }
};
