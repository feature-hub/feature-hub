import {DomFeatureApp} from '@feature-hub/react';
import {TodoBucketV1} from '@vwa/feature-services';
import {html, render} from 'lit-html/lib/lit-extended';

export class TodoMvcHeader implements DomFeatureApp {
	public readonly kind = 'react-container';

	public constructor(private readonly todoBucket: TodoBucketV1) {}

	public attachTo(container: Element): void {
		const header = html`
			<header class="header">
				<h1>todos</h1>
				<input
					class="new-todo"
					placeholder="What needs to be done?"
					on-keypress="${this.handleKeypress}"
					autofocus
				/>
			</header>
		`;

		render(header, container);
	}

	private readonly handleKeypress = (event: KeyboardEvent): void => {
		if (event.key === 'Enter') {
			const input = event.target as HTMLInputElement;
			const title = input.value.trim();

			this.todoBucket.add(title);

			input.value = '';
		}
	};
}
