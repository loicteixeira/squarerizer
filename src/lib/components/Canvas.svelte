<script lang="ts">
	export type BackgroundOptions = {
		repeat: boolean;
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
				if (backgroundImg) {
					console.log(backgroundOptions.repeat);
					if (backgroundOptions.repeat) {
						drawPattern(backgroundImg, ctx, {
							x: 0,
							y: 0,
							w: canvas.width,
							h: canvas.height
						});
					} else {
						drawImage(backgroundImg, canvas, ctx);
					}
				}
				if (foregroundImg) {
					drawImage(foregroundImg, canvas, ctx);
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

	function drawImage(
		img: HTMLImageElement,
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D
	) {
		const aspectRatio = img.width / img.height;

		let targetWidth, targetHeight;
		if (aspectRatio < 1) {
			// Portrait
			targetHeight = img.height > canvas.height ? canvas.height : img.height;
			targetWidth = targetHeight * aspectRatio;
		} else {
			// Landscape
			targetWidth = img.width > canvas.width ? canvas.width : img.width;
			targetHeight = targetWidth / aspectRatio;
		}

		const targetX = canvas.width / 2 - targetWidth / 2;
		const targetY = canvas.height / 2 - targetHeight / 2;

		ctx.drawImage(img, 0, 0, img.width, img.height, targetX, targetY, targetWidth, targetHeight);
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
