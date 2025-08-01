<script lang="ts">
	import 'context-filter-polyfill';

	export type BackgroundOptions = {
		blur: number;
		brightness: number;
		repeat: boolean;
		reuseForeground: boolean;
		scale: number;
	};

	type Props = {
		background: File | null;
		backgroundOptions: BackgroundOptions;
		class?: string;
		foreground: File | null;
	};
	let { background, backgroundOptions, class: klass, foreground }: Props = $props();

	let canvasRef: HTMLCanvasElement | null = null;

	type Rect = { x: number; y: number; w: number; h: number };

	function createCanvas({
		background,
		backgroundOptions,
		foreground
	}: Pick<Props, 'background' | 'backgroundOptions' | 'foreground'>) {
		return (canvas: HTMLCanvasElement) => {
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('Failed to get canvas context');

			// Load the images first (async), and only then draw them to avoid out of order painting
			const imagePromises = [loadImage(background), loadImage(foreground)];
			Promise.all(imagePromises).then(([backgroundImg, foregroundImg]) => {
				// Clear the canvas
				ctx.fillStyle = '#ccc';
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				// Draw images
				drawBackground(
					backgroundOptions.reuseForeground ? foregroundImg : backgroundImg,
					ctx,
					backgroundOptions
				);
				drawForeground(foregroundImg, ctx);
			});
		};
	}

	function loadImage(file: File | null): Promise<HTMLImageElement | null> {
		if (!file) return Promise.resolve(null);

		const src = URL.createObjectURL(new Blob([file], { type: file.type }));
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = src;
		});
	}

	function drawForeground(image: HTMLImageElement | null, ctx: CanvasRenderingContext2D) {
		if (!image) return;

		const srcSize = getImageSize(image);
		const targetSize = getImageSize(image, {
			mode: 'contain',
			maxWidth: ctx.canvas.width,
			maxHeight: ctx.canvas.height
		});
		drawImage(image, ctx, srcSize, targetSize);
	}

	function drawBackground(
		image: HTMLImageElement | null,
		ctx: CanvasRenderingContext2D,
		options: BackgroundOptions
	) {
		if (!image) return;

		// Apply background filter
		const prevFilter = ctx.filter;

		const filters: string[] = [];
		if (backgroundOptions.blur !== 0) {
			filters.push(`blur(${backgroundOptions.blur.toFixed(0)}px)`);
		}
		if (backgroundOptions.brightness !== 100) {
			filters.push(`brightness(${backgroundOptions.brightness}%)`);
		}
		ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';

		// Draw the image
		if (options.repeat) {
			drawPattern(
				image,
				ctx,
				{
					x: 0,
					y: 0,
					w: ctx.canvas.width,
					h: ctx.canvas.height
				},
				options.scale
			);
		} else {
			const srcSize = getImageSize(image);
			const targetSize = getImageSize(image, {
				mode: options.reuseForeground ? 'cover' : 'contain',
				maxWidth: ctx.canvas.width,
				maxHeight: ctx.canvas.height
			});
			drawImage(image, ctx, srcSize, targetSize, options.scale);
		}

		// Reset filter before drawing foreground
		ctx.filter = prevFilter;
	}

	function getImageSize(
		img: HTMLImageElement,
		options?: {
			mode: 'contain' | 'cover';
			maxWidth: number;
			maxHeight: number;
		}
	): Rect {
		switch (options?.mode) {
			case 'contain': {
				const aspectRatio = img.width / img.height;

				let width, height;
				if (aspectRatio < 1) {
					// Portrait
					height = img.height > options.maxHeight ? options.maxHeight : img.height;
					width = height * aspectRatio;
				} else {
					// Landscape
					width = img.width > options.maxWidth ? options.maxWidth : img.width;
					height = width / aspectRatio;
				}

				const x = (options.maxWidth - width) / 2;
				const y = (options.maxHeight - height) / 2;

				return { x, y, w: width, h: height };
			}
			case 'cover': {
				const aspectRatio = img.width / img.height;

				let width, height;
				if (aspectRatio < 1) {
					// Portrait
					width = options.maxWidth;
					height = width / aspectRatio;
				} else {
					// Landscape
					height = options.maxHeight;
					width = img.width * aspectRatio;
				}

				const x = (options.maxWidth - width) / 2;
				const y = (options.maxHeight - height) / 2;

				return { x, y, w: width, h: height };
			}
			default:
				return { x: 0, y: 0, w: img.width, h: img.height };
		}
	}

	function drawImage(
		img: HTMLImageElement,
		ctx: CanvasRenderingContext2D,
		sourceRect: Rect,
		targetRect: Rect,
		scale: number = 1
	) {
		const centerX = targetRect.x + targetRect.w / 2;
		const centerY = targetRect.y + targetRect.h / 2;

		ctx.save();
		ctx.translate(centerX, centerY);
		ctx.scale(scale, scale);
		ctx.drawImage(
			img,
			sourceRect.x,
			sourceRect.y,
			sourceRect.w,
			sourceRect.h,
			-targetRect.w / 2,
			-targetRect.h / 2,
			targetRect.w,
			targetRect.h
		);
		ctx.restore();
	}

	function drawPattern(
		img: HTMLImageElement,
		ctx: CanvasRenderingContext2D,
		rect: Rect,
		scale: number = 1
	) {
		// Prepare the pattern
		const pattern = ctx.createPattern(img, 'repeat');
		if (!pattern) throw new Error('Failed to create pattern');

		// Apply scaling to the pattern
		const matrix = new DOMMatrix();
		matrix.a = scale;
		matrix.d = scale;
		pattern.setTransform(matrix);

		// Draw the pattern
		ctx.save();
		ctx.fillStyle = pattern;
		ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
		ctx.restore();
	}

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
			{@attach createCanvas({ background, backgroundOptions, foreground })}
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
