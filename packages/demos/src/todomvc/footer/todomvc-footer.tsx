import * as React from 'react';
import {Todo, TodoManagerV1} from '../todo-manager';
import styles from './styles.css';

export interface TodoMvcFooterProps {
  readonly todoManager: TodoManagerV1;
}

export interface TodoMvcFooterState {
  readonly todos: Todo[];
}

export class TodoMvcFooter extends React.Component<
  TodoMvcFooterProps,
  TodoMvcFooterState
> {
  public readonly state = {todos: this.props.todoManager.getTodos()};

  public componentDidMount(): void {
    this.props.todoManager.subscribe(() => {
      this.setState({todos: this.props.todoManager.getTodos()});
    });
  }

  public render(): JSX.Element | null {
    const {todos} = this.state;

    if (todos.length === 0) {
      return null;
    }

    const itemsLeft = todos.filter((todo) => !todo.completed).length;
    const hasCompletedTodos = todos.length - itemsLeft > 0;

    return (
      <footer className={styles.footer}>
        <span className={styles.todoCount}>
          <strong>{itemsLeft}</strong> {itemsLeft === 1 ? 'item' : 'items'} left
        </span>
        {hasCompletedTodos && (
          <button
            className={styles.clearCompleted}
            onClick={this.handleClearCompletedClick}
          >
            Clear completed
          </button>
        )}
      </footer>
    );
  }

  private readonly handleClearCompletedClick = () => {
    for (const todo of this.state.todos) {
      if (todo && todo.completed) {
        this.props.todoManager.remove(todo.id);
      }
    }
  };
}
