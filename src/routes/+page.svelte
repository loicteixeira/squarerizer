<script lang="ts">
	import Canvas, { type BackgroundOptions } from '$lib/components/Canvas.svelte';
	import FileDropZone from '$lib/components/FileDropZone.svelte';

	let backgroundImageFile = $state<File | null>(null);
	let backgroundOptions = $state<BackgroundOptions>({
		blur: 0,
		brightness: 100,
		repeat: false,
		reuseForeground: false
	});
	let foregroundImageFile = $state<File | null>(null);
</script>

<header class="prose mb-8">
	<h1>Squarerizer</h1>
</header>

<div class="mb-8 flex gap-8">
	<FileDropZone bind:file={foregroundImageFile} title="Main Image" />
	<FileDropZone bind:file={backgroundImageFile} title="Background Image" />
	<div class="flex w-48 flex-col gap-2">
		<p class="text-lg font-medium">Background Options</p>
		<label class="flex items-center gap-2">
			Blur
			<input
				id="input"
				type="range"
				min="0"
				max="16"
				step="2"
				bind:value={backgroundOptions.blur}
			/>
		</label>
		<label class="flex items-center gap-2">
			Darken/Brighten
			<input
				id="input"
				type="range"
				min="70"
				max="130"
				step="5"
				bind:value={backgroundOptions.brightness}
			/>
		</label>
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={backgroundOptions.repeat} /> Repeat
		</label>
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={backgroundOptions.reuseForeground} /> Reuse Foreground
		</label>
	</div>
</div>

<div style="zoom: 0.5">
	<Canvas
		background={backgroundImageFile}
		backgroundOptions={{ ...backgroundOptions }}
		foreground={foregroundImageFile}
	/>
</div>
