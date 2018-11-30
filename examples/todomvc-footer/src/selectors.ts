import {TodoManagerState} from '@feature-hub/todomvc-todo-manager';

export function getIncompletedTodoCount(todos: TodoManagerState): number {
  return todos.allIds.filter(id => {
    const todo = todos.byId[id];

    return todo ? !todo.completed : false;
  }).length;
}
