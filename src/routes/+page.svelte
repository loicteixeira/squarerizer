<script lang="ts">
	import {
		Canvas,
		defaultBackgroundOptions,
		defaultForegroundOptions,
		type BackgroundOptions
	} from '$lib/components/canvas';
	import { defaultWatermarkOptions } from '$lib/components/canvas/canvas-builder';
	import type { WatermarkOptions } from '$lib/components/canvas/canvas-types';
	import FileDropZone from '$lib/components/FileDropZone.svelte';

	const BACKGROUND_SCALE_VALUES = [
		1 / 10,
		1 / 9,
		1 / 8,
		1 / 7,
		1 / 6,
		1 / 5,
		1 / 4,
		1 / 3,
		1 / 2,
		1,
		2,
		3
	];
	const WATERMARK_OPACITY_VALUES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
	const WATERMARK_SCALE_VALUES = [1 / 3, 1 / 2, 1, 2, 3];
	const WATERMARK_POSITIONS = [
		{ value: 'top-left', label: 'Top Left' },
		{ value: 'top-right', label: 'Top Right' },
		{ value: 'bottom-left', label: 'Bottom Left' },
		{ value: 'bottom-right', label: 'Bottom Right' }
	];

	let backgroundImageFile = $state<File | null>(null);
	let backgroundOptions = $state<BackgroundOptions>(defaultBackgroundOptions);
	let foregroundImageFile = $state<File | null>(null);
	let watermarkImageFile = $state<File | null>(null);
	let watermarkOptions = $state<WatermarkOptions>(defaultWatermarkOptions);

	let disabledBackgroundWarning = $derived(
		backgroundOptions.reuseForeground
			? 'Not applicable with “Reuse Foreground” option selected'
			: ''
	);
	let disableDownload = $derived(!foregroundImageFile && !backgroundImageFile);

	let mainCanvasRef: Canvas | null = null;
	let detailStartCanvasRef: Canvas | null = null;
	let detailCenterCanvasRef: Canvas | null = null;
	let detailEndCanvasRef: Canvas | null = null;

	function handleDownload(e: Event) {
		e.preventDefault();

		downloadCanvas(mainCanvasRef, 0);
		downloadCanvas(detailStartCanvasRef, 1);
		downloadCanvas(detailCenterCanvasRef, 2);
		downloadCanvas(detailEndCanvasRef, 3);
	}

	function downloadCanvas(canvas: Canvas | null, idx: number) {
		if (!canvas) return;

		const url = canvas.getDataURL();
		if (!url) return;

		const a = document.createElement('a');
		a.href = url;
		a.download = `squarerizer_${idx}.png`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<header class="prose mb-8">
	<h1>Squarerizer</h1>
</header>

<div class="mb-8 flex flex-wrap gap-24">
	<FileDropZone bind:file={foregroundImageFile} title="Foreground Image" />
	<div class="flex gap-8">
		<FileDropZone
			bind:file={backgroundImageFile}
			title="Background Image"
			disabledText={disabledBackgroundWarning}
		/>
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
					<span class="absolute start-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400"
						>0px</span
					>
					<span class="absolute end-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400">16px</span
					>
				</div>
			</label>
			<label class="mb-4 flex justify-between gap-4">
				Brightness
				<div class="relative">
					<input
						id="input"
						type="range"
						min="50"
						max="150"
						step="5"
						bind:value={backgroundOptions.brightness}
					/>
					<span class="absolute start-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400"
						>-50%</span
					>
					<span class="absolute end-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400">+50%</span
					>
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
			<label class="relative mb-4 flex justify-between gap-4">
				Scale
				<div class="relative">
					<input
						id="input"
						type="range"
						min="0"
						max={BACKGROUND_SCALE_VALUES.length - 1}
						step="1"
						bind:value={
							() => BACKGROUND_SCALE_VALUES.findIndex((v) => v === backgroundOptions.scale),
							(v) => (backgroundOptions.scale = BACKGROUND_SCALE_VALUES[v])
						}
					/>
					<span class="absolute start-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400"
						>÷{1 / BACKGROUND_SCALE_VALUES[0]}</span
					>
					<span class="absolute end-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400"
						>x{BACKGROUND_SCALE_VALUES[BACKGROUND_SCALE_VALUES.length - 1]}</span
					>
				</div>
			</label>
		</div>
	</div>
	<div class="flex gap-8">
		<FileDropZone bind:file={watermarkImageFile} title="Watermark Image" />
		<div class="flex flex-col gap-2">
			<p class="text-lg font-medium">Watermark Options</p>
			<label class="relative mb-4 flex justify-between gap-4">
				Opacity
				<div class="relative">
					<input
						id="input"
						type="range"
						min="0"
						max={WATERMARK_OPACITY_VALUES.length - 1}
						step="1"
						bind:value={
							() => WATERMARK_OPACITY_VALUES.findIndex((v) => v === watermarkOptions.opacity),
							(v) => (watermarkOptions.opacity = WATERMARK_OPACITY_VALUES[v])
						}
					/>
					<span class="absolute start-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400"
						>{WATERMARK_OPACITY_VALUES[0] * 100}%</span
					>
					<span class="absolute end-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400"
						>{WATERMARK_OPACITY_VALUES[WATERMARK_OPACITY_VALUES.length - 1] * 100}%</span
					>
				</div>
			</label>
			<fieldset>
				<legend>Position</legend>
				<div class="ml-2 flex flex-col">
					{#each WATERMARK_POSITIONS as { value, label }}
						<label>
							<input type="radio" bind:group={watermarkOptions.position} {value} />
							{label}
						</label>
					{/each}
				</div>
			</fieldset>
			<label class="relative mb-4 flex justify-between gap-4">
				Scale
				<div class="relative">
					<input
						id="input"
						type="range"
						min="0"
						max={WATERMARK_SCALE_VALUES.length - 1}
						step="1"
						bind:value={
							() => WATERMARK_SCALE_VALUES.findIndex((v) => v === watermarkOptions.scale),
							(v) => (watermarkOptions.scale = WATERMARK_SCALE_VALUES[v])
						}
					/>
					<span class="absolute start-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400"
						>÷{1 / WATERMARK_SCALE_VALUES[0]}</span
					>
					<span class="absolute end-0 -bottom-4 text-sm text-gray-500 dark:text-gray-400"
						>x{WATERMARK_SCALE_VALUES[WATERMARK_SCALE_VALUES.length - 1]}</span
					>
				</div>
			</label>
		</div>
	</div>
</div>

<div class="flex w-[560px] flex-col gap-4">
	<div class=" rounded-md border-2 border-gray-300 p-2">
		<Canvas
			background={{ file: backgroundImageFile, options: { ...backgroundOptions } }}
			foreground={{ file: foregroundImageFile, options: defaultForegroundOptions }}
			watermark={{ file: watermarkImageFile, options: { ...watermarkOptions } }}
			class="zoom-half"
			bind:this={mainCanvasRef}
		/>
	</div>
	<div class="flex gap-2">
		<Canvas
			foreground={{
				file: foregroundImageFile,
				options: { allowRotation: true, mode: 'cover', position: 'start' }
			}}
			watermark={{ file: watermarkImageFile, options: { ...watermarkOptions } }}
			class="zoom-sixth"
			bind:this={detailStartCanvasRef}
		/>
		<Canvas
			foreground={{
				file: foregroundImageFile,
				options: { allowRotation: true, mode: 'cover', position: 'center' }
			}}
			watermark={{ file: watermarkImageFile, options: { ...watermarkOptions } }}
			class="zoom-sixth"
			bind:this={detailCenterCanvasRef}
		/>
		<Canvas
			foreground={{
				file: foregroundImageFile,
				options: { allowRotation: true, mode: 'cover', position: 'end' }
			}}
			watermark={{ file: watermarkImageFile, options: { ...watermarkOptions } }}
			class="zoom-sixth"
			bind:this={detailEndCanvasRef}
		/>
	</div>
	<button
		type="button"
		class="mb-2 self-end rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
		onclick={handleDownload}
		disabled={disableDownload}>Download</button
	>
</div>
