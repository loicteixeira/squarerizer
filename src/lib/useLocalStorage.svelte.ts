import { browser } from '$app/environment';

export class LocalStorageStore<T> {
	#key = '';
	value = $state<T>() as T;

	constructor(key: string, initialValue: T) {
		this.#key = key;
		this.value = initialValue;

		if (browser) {
			const item = localStorage.getItem(key);
			if (item) this.value = this.#deserialize(item);
		}

		$effect(() => {
			localStorage.setItem(this.#key, this.#serialize(this.value));
		});
	}

	#serialize(value: T): string {
		return JSON.stringify(value);
	}

	#deserialize(item: string): T {
		return JSON.parse(item);
	}
}

export function useLocalStorage<T>(key: string, value: T) {
	return new LocalStorageStore(key, value);
}
