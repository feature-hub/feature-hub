import {TodoBucketState} from '@vwa/feature-services';

export function areAllTodosCompleted(todos: TodoBucketState): boolean {
	return todos.allIds.every(id => {
		const todo = todos.byId[id];

		return todo ? todo.completed : false;
	});
}
