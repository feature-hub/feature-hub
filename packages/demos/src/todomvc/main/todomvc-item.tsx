import * as React from 'react';
import styled from 'styled-components';
import {Todo} from '../todo-manager';
import checkboxCompleted from './images/checkbox-completed.svg';
import checkbox from './images/checkbox.svg';

export interface TodoMvcItemProps extends Todo {
  onToggle(id: string, checked: boolean): void;
  onDestroy(id: string): void;
  onEdit(id: string, title: string): void;
}

export interface TodoMvcItemState {
  readonly editing: boolean;
  readonly editText: string;
}

interface ListItemProps {
  readonly completed: boolean;
  readonly editing: boolean;
}

interface LabelProps {
  readonly completed: boolean;
}

interface ViewProps {
  readonly editing: boolean;
}

interface EditInputProps {
  readonly editing: boolean;
}

const DestroyButton = styled.button`
  display: none;
  position: absolute;
  top: 0;
  right: 10px;
  bottom: 0;
  width: 40px;
  height: 40px;
  margin: auto 0;
  font-size: 30px;
  color: #cc9a9a;
  margin-bottom: 11px;
  transition: color 0.2s ease-out;

  :hover {
    color: #af5b5e;
  }

  :after {
    content: '×';
  }
`;

const ListItem = styled.li<ListItemProps>`
  position: relative;
  font-size: 24px;
  border-bottom: ${(props) => (props.editing ? 'none' : '1px solid #ededed')};

  :last-child {
    border-bottom: none;
    margin-bottom: ${(props) => (props.editing ? '-1px' : '0')};
  }

  :hover {
    ${DestroyButton} {
      display: block;
    }
  }
`;

const View = styled.div<ViewProps>`
  display: ${(props) => (props.editing ? 'none' : 'initial')};
`;

const Label = styled.label<LabelProps>`
  word-break: break-all;
  padding: 15px 15px 15px 60px;
  display: block;
  line-height: 1.2;
  transition: color 0.4s;
  color: ${(props) => (props.completed ? '#d9d9d9' : 'inherit')};
  text-decoration: ${(props) => (props.completed ? 'line-through' : 'none')};
  background-image: ${(props) =>
    props.completed ? `url(${checkboxCompleted})` : `url(${checkbox})`};
  background-repeat: no-repeat;
  background-position: center left;
`;

const Toggle = styled.input`
  text-align: center;
  width: 40px;
  /* auto, since non-WebKit browsers doesn't support input styling */
  height: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
  border: none; /* Mobile Safari */
  -webkit-appearance: none;
  appearance: none;
  opacity: 0;
`;

const EditInput = styled.input<EditInputProps>`
  display: ${(props) => (props.editing ? 'block' : 'none')};
  position: relative;
  font-size: 24px;
  font-family: inherit;
  font-weight: inherit;
  line-height: 1.4em;
  color: inherit;
  border: 1px solid #999;
  box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  width: 506px;
  padding: 12px 16px;
  margin: 0 0 0 43px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

export class TodoMvcItem extends React.PureComponent<
  TodoMvcItemProps,
  TodoMvcItemState
> {
  public static getDerivedStateFromProps(
    props: TodoMvcItemProps,
    state: TodoMvcItemState
  ): Partial<TodoMvcItemState> | null {
    if (state.editing || state.editText === props.title) {
      return null;
    }

    return {editText: props.title};
  }

  public readonly state = {editing: false, editText: this.props.title};

  private readonly editInputRef: React.RefObject<
    HTMLInputElement
  > = React.createRef();

  public render(): JSX.Element {
    const {editing, editText} = this.state;
    const {completed, id, onToggle, onDestroy, title} = this.props;

    return (
      <ListItem editing={editing} completed={completed}>
        <View editing={editing}>
          <Toggle
            type="checkbox"
            checked={completed}
            onChange={(event) => onToggle(id, event.currentTarget.checked)}
          />
          <Label
            completed={completed}
            onDoubleClick={this.handleLabelDoubleClick}
          >
            {title}
          </Label>
          <DestroyButton onClick={() => onDestroy(id)} />
        </View>
        <EditInput
          editing={editing}
          value={editText}
          ref={this.editInputRef}
          onBlur={() => this.setState({editing: false})}
          onChange={this.handleEditInputChange}
          onKeyDown={this.handleEditInputKeyDown}
        />
      </ListItem>
    );
  }

  private readonly handleLabelDoubleClick = () => {
    this.setState({editing: true}, () => {
      if (this.editInputRef.current) {
        this.editInputRef.current.focus();
      }
    });
  };

  private readonly handleEditInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({editText: event.currentTarget.value});
  };

  private readonly handleEditInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      this.props.onEdit(this.props.id, event.currentTarget.value.trim());
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      this.setState({editing: false, editText: this.props.title});
    }
  };
}
