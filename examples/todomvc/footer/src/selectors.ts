import {TodoBucketState} from '@vwa/feature-services';

export function getIncompletedTodoCount(todos: TodoBucketState): number {
	return todos.allIds.filter(id => {
		const todo = todos.byId[id];

		return todo ? !todo.completed : false;
	}).length;
}
