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
		foreground?: { file: File | null; options: ForegroundOptions };
		class?: string;
	};

	let {
		background = { file: null, options: defaultBackgroundOptions },
		foreground = { file: null, options: defaultForegroundOptions },
		class: klass
	}: Props = $props();

	let canvasRef: HTMLCanvasElement | null = null;

	export function getDataURL() {
		if (!canvasRef) return null;
		return canvasRef.toDataURL('image/png');
	}
</script>

<canvas
	bind:this={canvasRef}
	{@attach createCanvas({
		background: background.file,
		backgroundOptions: background.options,
		foreground: foreground.file,
		foregroundOptions: foreground.options
	})}
	width="1080"
	height="1080"
	class={klass}
></canvas>
