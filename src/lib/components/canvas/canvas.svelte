<script lang="ts">
	import 'context-filter-polyfill';

	import {
		createCanvas,
		defaultBackgroundOptions,
		defaultForegroundOptions
	} from './canvas-builder';
	import { type BackgroundOptions, type ForegroundOptions } from './canvas-types';

	type Props = {
		background?: { file: File | null; options: BackgroundOptions };
		class?: string;
		foreground?: {
			file: File | null;
			options: Omit<ForegroundOptions, 'rotationInDegrees'> & { allowRotation?: boolean };
		};
	};

	let {
		background = { file: null, options: defaultBackgroundOptions },
		class: klass,
		foreground = { file: null, options: { ...defaultForegroundOptions, allowRotation: false } }
	}: Props = $props();

	let rotationInDegrees = $state<ForegroundOptions['rotationInDegrees']>(0 as const);

	let canvasRef: HTMLCanvasElement | null = null;

	export function getDataURL() {
		if (!canvasRef) return null;
		return canvasRef.toDataURL('image/png');
	}
</script>

<div class="flex flex-col items-center gap-2">
	<canvas
		bind:this={canvasRef}
		{@attach createCanvas({
			background: background.file,
			backgroundOptions: background.options,
			foreground: foreground.file,
			foregroundOptions: { ...foreground.options, rotationInDegrees: rotationInDegrees }
		})}
		width="1080"
		height="1080"
		class={klass}
	></canvas>

	<!-- {#if foreground.options.allowRotation} -->
	<!-- Temporary disable rotation feature -->
	{#if false}
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
