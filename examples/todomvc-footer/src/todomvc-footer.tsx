import {
  TodoManagerState,
  TodoManagerV1
} from '@feature-hub/todomvc-todo-manager';
import * as React from 'react';
import {getIncompletedTodoCount} from './selectors';
import styles from './styles.css';

export interface TodoMvcFooterProps {
  readonly todoManager: TodoManagerV1;
}

export interface TodoMvcFooterState {
  readonly todos: TodoManagerState;
}

export class TodoMvcFooter extends React.Component<
  TodoMvcFooterProps,
  TodoMvcFooterState
> {
  public readonly state = {todos: this.props.todoManager.getTodos()};

  public componentDidMount(): void {
    // TODO: reactivate when subscribe has been re-added
    // this.props.todoManager.subscribe(() => {
    //   this.setState({todos: this.props.todoManager.getTodos()});
    // });
  }

  public render(): JSX.Element | null {
    const {todos} = this.state;

    if (todos.allIds.length === 0) {
      return null;
    }

    const itemsLeft = getIncompletedTodoCount(todos);
    const hasCompletedTodos = todos.allIds.length - itemsLeft > 0;

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
    for (const id of this.state.todos.allIds) {
      const todo = this.state.todos.byId[id];

      if (todo && todo.completed) {
        this.props.todoManager.remove(id);
      }
    }
  };
}
