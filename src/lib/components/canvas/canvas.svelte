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

	function handleDownload(e: Event) {
		e.preventDefault();
		if (!canvasRef) return;
		const url = canvasRef.toDataURL('image/png');
		const a = document.createElement('a');
		a.href = url;
		a.download = 'squarerizer.png';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<div class="inline-flex flex-col items-end gap-4">
	<div class="inline-block w-[560px] rounded-md border-2 border-gray-300 p-2">
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
	</div>
	<button
		type="button"
		class="mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
		onclick={handleDownload}>Download</button
	>
</div>
