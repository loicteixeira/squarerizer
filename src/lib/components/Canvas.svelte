<script lang="ts">
	export type BackgroundOptions = {
		repeat: boolean;
		reuseForeground: boolean;
	};

	type Props = {
		background: File | null;
		backgroundOptions: BackgroundOptions;
		foreground: File | null;
	};
	let { background, backgroundOptions, foreground }: Props = $props();

	type Rect = { x: number; y: number; w: number; h: number };

	function createCanvas({
		background,
		backgroundOptions,
		foreground
	}: Pick<Props, 'background' | 'backgroundOptions' | 'foreground'>) {
		return (canvas: HTMLCanvasElement) => {
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Failed to get canvas context');
			}

			// Clear the canvas
			ctx.fillStyle = '#ccc';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Load images
			const backgroundSrc = background
				? URL.createObjectURL(new Blob([background], { type: background.type }))
				: null;
			const backgroundPromise = backgroundSrc ? loadImage(backgroundSrc) : Promise.resolve(null);

			const foregroundSrc = foreground
				? URL.createObjectURL(new Blob([foreground], { type: foreground.type }))
				: null;
			const foregroundPromise = foregroundSrc ? loadImage(foregroundSrc) : Promise.resolve(null);

			// Draw images after they have all been loaded
			Promise.all([backgroundPromise, foregroundPromise]).then(([backgroundImg, foregroundImg]) => {
				if (foregroundImg && backgroundOptions.reuseForeground) {
					const srcSize = getImageSize(foregroundImg);
					const targetSize = getImageSize(foregroundImg, {
						mode: 'cover',
						canvasWidth: canvas.width,
						canvasHeight: canvas.height
					});
					drawImage(foregroundImg, ctx, srcSize, targetSize);
				} else if (backgroundImg) {
					if (backgroundOptions.repeat) {
						drawPattern(backgroundImg, ctx, {
							x: 0,
							y: 0,
							w: canvas.width,
							h: canvas.height
						});
					} else {
						const srcSize = getImageSize(backgroundImg);
						const targetSize = getImageSize(backgroundImg, {
							mode: 'contain',
							canvasWidth: canvas.width,
							canvasHeight: canvas.height
						});
						drawImage(backgroundImg, ctx, srcSize, targetSize);
					}
				}
				if (foregroundImg) {
					const srcSize = getImageSize(foregroundImg);
					const targetSize = getImageSize(foregroundImg, {
						mode: 'contain',
						canvasWidth: canvas.width,
						canvasHeight: canvas.height
					});
					drawImage(foregroundImg, ctx, srcSize, targetSize);
				}
			});
		};
	}

	function loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = src;
		});
	}

	function getImageSize(
		img: HTMLImageElement,
		options?: {
			mode: 'contain' | 'cover';
			canvasWidth: number;
			canvasHeight: number;
		}
	): Rect {
		switch (options?.mode) {
			case 'contain': {
				const aspectRatio = img.width / img.height;

				let width, height;
				if (aspectRatio < 1) {
					// Portrait
					height = img.height > options.canvasHeight ? options.canvasHeight : img.height;
					width = height * aspectRatio;
				} else {
					// Landscape
					width = img.width > options.canvasWidth ? options.canvasWidth : img.width;
					height = width / aspectRatio;
				}

				const x = (options.canvasWidth - width) / 2;
				const y = (options.canvasHeight - height) / 2;

				return { x, y, w: width, h: height };
			}
			case 'cover': {
				const aspectRatio = img.width / img.height;

				let width, height;
				if (aspectRatio < 1) {
					// Portrait
					width = options.canvasWidth;
					height = width / aspectRatio;
				} else {
					// Landscape
					height = options.canvasHeight;
					width = img.width * aspectRatio;
				}

				return { x: 0, y: 0, w: width, h: height };
			}
			default:
				return { x: 0, y: 0, w: img.width, h: img.height };
		}
	}

	function drawImage(
		img: HTMLImageElement,
		ctx: CanvasRenderingContext2D,
		sourceRect: Rect,
		targetRect: Rect
	) {
		ctx.drawImage(
			img,
			sourceRect.x,
			sourceRect.y,
			sourceRect.w,
			sourceRect.h,
			targetRect.x,
			targetRect.y,
			targetRect.w,
			targetRect.h
		);
	}

	function drawPattern(img: HTMLImageElement, ctx: CanvasRenderingContext2D, rect: Rect) {
		const pattern = ctx.createPattern(img, 'repeat');
		if (!pattern) {
			throw new Error('Failed to create pattern');
		}
		ctx.fillStyle = pattern;
		ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
	}
</script>

<div class="inline-block rounded-md border-2 border-gray-300 p-2">
	<canvas
		{@attach createCanvas({ background, backgroundOptions, foreground })}
		width="1080"
		height="1080"
	></canvas>
</div>
