<script lang="ts">
	import 'context-filter-polyfill';

	import {
		createCanvas,
		defaultBackgroundOptions,
		defaultForegroundOptions,
		defaultWatermarkOptions
	} from './canvas-builder';
	import {
		type BackgroundOptions,
		type ForegroundOptions,
		type GeneralOptions,
		type WatermarkOptions
	} from './canvas-types';

	type Props = {
		background?: { file: File | null; options: BackgroundOptions };
		caption?: string;
		class?: string;
		foreground: {
			file: File | null;
			options: Omit<ForegroundOptions, 'rotationInDegrees'> & { allowRotation?: boolean };
		};
		generalOptions: GeneralOptions;
		watermark?: { file: File | null; options: WatermarkOptions };
	};

	let {
		background = { file: null, options: defaultBackgroundOptions },
		caption,
		class: klass,
		foreground = { file: null, options: { ...defaultForegroundOptions, allowRotation: false } },
		generalOptions,
		watermark = { file: null, options: defaultWatermarkOptions }
	}: Props = $props();

	let rotationInDegrees = $state<ForegroundOptions['rotationInDegrees']>(0 as const);

	let canvasRef: HTMLCanvasElement | null = null;

	let size = $derived.by(() => {
		switch (generalOptions.format) {
			case '1:1-1080x1080px':
				return { width: 1080, height: 1080 };
			case '4:5-1080x1350px':
			default:
				return { width: 1080, height: 1350 };
		}
	});

	export function getDataURL() {
		if (!canvasRef) return null;
		return canvasRef.toDataURL('image/png');
	}
</script>

<div class="flex flex-col items-center gap-1">
	{#if caption}
		<p class="text-center text-sm text-gray-600">{caption}</p>
	{/if}
	<canvas
		bind:this={canvasRef}
		{@attach createCanvas({
			background: background.file,
			backgroundOptions: background.options,
			foreground: foreground.file,
			foregroundOptions: { ...foreground.options, rotationInDegrees: rotationInDegrees },
			size,
			watermark: watermark.file,
			watermarkOptions: watermark.options
		})}
		width={size.width}
		height={size.height}
		class={klass}
	></canvas>

	{#if foreground.options.allowRotation}
		<div class="flex gap-4">
			<button
				class="-rotate-90 rounded text-black hover:text-blue-700"
				title="Rotate left"
				type="button"
				onclick={() => (rotationInDegrees = (rotationInDegrees! - 90) % 360)}
			>
				↺</button
			>
			<button
				class="rotate-90 rounded text-black hover:text-blue-700"
				title="Rotate right"
				type="button"
				onclick={() => (rotationInDegrees = (rotationInDegrees! + 90) % 360)}
			>
				↻</button
			>
		</div>
	{/if}
</div>
