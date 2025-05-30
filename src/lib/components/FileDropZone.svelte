<script lang="ts">
	type Props = { file: File | null; disabledText?: string; title: string };
	let { file = $bindable(), disabledText, title }: Props = $props();

	let preview = $derived(file ? URL.createObjectURL(file) : null);

	function onChange(event: Event) {
		event.preventDefault();

		const input = event.target as HTMLInputElement;
		file = input.files?.[0] ?? null;
	}

	function onDelete(event: Event) {
		event.preventDefault();

		file = null;
	}
</script>

<div class="flex w-48 flex-col gap-2">
	<div class="flex justify-between">
		<p class="text-lg font-medium">{title}</p>
		{#if preview && !disabledText}
			<button name="Remove main image" onclick={onDelete}>
				<span class="not-sr-only">🗑️</span>
			</button>
		{/if}
	</div>
	<div class="relative h-48 w-48">
		{#if disabledText}
			<div
				class="absolute inset-0 flex items-center justify-center rounded-md border-2 border-dashed border-red-300 bg-red-50 p-4 text-center text-red-600"
			>
				{disabledText}
			</div>
		{:else if preview}
			<div
				class="flex h-full w-full justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-2"
			>
				<img src={preview} alt="Preview" class="max-h-full object-contain" />
			</div>
		{:else}
			<label
				class="flex h-full w-full items-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 hover:bg-gray-100 hover:text-gray-700"
			>
				Click or drag a file here to upload.
				<input type="file" accept="image/*" class="hidden" onchange={onChange} />
			</label>
		{/if}
	</div>
</div>
