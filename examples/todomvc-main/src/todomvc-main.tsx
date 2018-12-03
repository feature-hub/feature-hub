import {
  TodoManagerState,
  TodoManagerV1
} from '@feature-hub/todomvc-todo-manager';
import * as React from 'react';
import styled from 'styled-components';
import {areAllTodosCompleted} from './selectors';
import {TodoMvcItem} from './todomvc-item';

export interface TodoMvcMainProps {
  readonly todoManager: TodoManagerV1;
}

export interface TodoMvcMainState {
  readonly todos: TodoManagerState;
}

interface ToggleAllProps {
  readonly checked: boolean;
}

const MainSection = styled.section`
  position: relative;
  z-index: 2;
  border-top: 1px solid #e6e6e6;
`;

const ToggleAllCheckbox = styled.input`
  width: 1px;
  height: 1px;
  border: none; /* Mobile Safari */
  opacity: 0;
  position: absolute;
  right: 100%;
  bottom: 100%;
`;

const ToggleAllLabel = styled.label<ToggleAllProps>`
  width: 60px;
  height: 34px;
  font-size: 0;
  position: absolute;
  top: -52px;
  left: -13px;
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);

  :before {
    content: '❯';
    font-size: 22px;
    color: ${props => (props.checked ? '#737373' : '#e6e6e6')};
    padding: 10px 27px 10px 27px;
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export class TodoMvcMain extends React.Component<
  TodoMvcMainProps,
  TodoMvcMainState
> {
  public readonly state = {todos: this.props.todoManager.getTodos()};

  public componentDidMount(): void {
    // TODO: reactivate when subscribe has been re-added
    // this.props.todoManager.subscribe(() => {
    //   this.setState({todos: this.props.todoManager.getTodos()});
    // });
  }

  public render(): JSX.Element | null {
    if (this.state.todos.allIds.length === 0) {
      return null;
    }

    const allCompleted = areAllTodosCompleted(this.state.todos);

    return (
      <MainSection>
        <ToggleAllCheckbox
          id="toggle-all"
          type="checkbox"
          checked={allCompleted}
          onClick={event => this.handleToggleAll(event.currentTarget.checked)}
        />
        <ToggleAllLabel htmlFor="toggle-all" checked={allCompleted}>
          Mark all as complete
        </ToggleAllLabel>
        <List>
          {this.state.todos.allIds.map(id => {
            const todo = this.state.todos.byId[id];

            return todo ? (
              <TodoMvcItem
                key={id}
                id={id}
                title={todo.title}
                completed={todo.completed}
                onToggle={this.handleTodoItemToggle}
                onDestroy={this.handleTodoItemDestroy}
                onEdit={this.handleTodoItemEditTitle}
              />
            ) : null;
          })}
        </List>
      </MainSection>
    );
  }

  private readonly handleTodoItemToggle = (id: string, checked: boolean) => {
    this.props.todoManager.setCompleted(id, checked);
  };

  private readonly handleToggleAll = (checked: boolean) => {
    this.state.todos.allIds.forEach(id => {
      this.props.todoManager.setCompleted(id, checked);
    });
  };

  private readonly handleTodoItemDestroy = (id: string) => {
    this.props.todoManager.remove(id);
  };

  private readonly handleTodoItemEditTitle = (id: string, title: string) => {
    if (title) {
      this.props.todoManager.editTitle(id, title);
    } else {
      this.props.todoManager.remove(id);
    }
  };
}
