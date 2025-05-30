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
	<div class="flex flex-col gap-2">
		<p class="text-lg font-medium">Background Options</p>
		<label class="relative mb-4 flex justify-between gap-4">
			Blur
			<div class="relative">
				<input
					id="input"
					type="range"
					min="0"
					max="16"
					step="2"
					bind:value={backgroundOptions.blur}
				/>
				<span class="absolute start-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400">0px</span>
				<span class="absolute end-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400">16px</span>
			</div>
		</label>
		<label class="mb-4 flex justify-between gap-4">
			Brightness
			<div class="relative">
				<input
					id="input"
					type="range"
					min="70"
					max="130"
					step="5"
					bind:value={backgroundOptions.brightness}
				/>
				<span class="absolute start-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400">-30%</span
				>
				<span class="absolute end-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400">+30%</span>
			</div>
		</label>
		<label class="flex cursor-pointer justify-between gap-4">
			Repeat
			<input type="checkbox" bind:checked={backgroundOptions.repeat} class="peer sr-only" />
			<div
				class="peer relative h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800"
			></div>
		</label>
		<label class="flex cursor-pointer justify-between gap-4">
			Reuse Foreground
			<input
				type="checkbox"
				bind:checked={backgroundOptions.reuseForeground}
				class="peer sr-only"
			/>
			<div
				class="peer relative h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800"
			></div>
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
