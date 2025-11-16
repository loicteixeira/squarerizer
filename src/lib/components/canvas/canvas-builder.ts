import type { BackgroundOptions, ForegroundOptions, Rect, WatermarkOptions } from './canvas-types';

export const defaultBackgroundOptions: BackgroundOptions = {
	blur: 0,
	brightness: 100,
	repeat: false,
	reuseForeground: false,
	scale: 1
};

export const defaultForegroundOptions: ForegroundOptions = {
	mode: 'contain',
	position: 'center'
};

export const defaultWatermarkOptions = {
	opacity: 0.8,
	position: 'bottom-right' as const,
	scale: 1
};

export function createCanvas({
	background,
	backgroundOptions,
	foreground,
	foregroundOptions,
	watermark,
	watermarkOptions
}: {
	background: File | null;
	backgroundOptions: BackgroundOptions;
	foreground: File | null;
	foregroundOptions: ForegroundOptions;
	watermark: File | null;
	watermarkOptions: WatermarkOptions;
}) {
	return (canvas: HTMLCanvasElement) => {
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Failed to get canvas context');

		// Load the images first (async), and only then draw them to avoid out of order painting
		const imagePromises = [loadImage(background), loadImage(foreground), loadImage(watermark)];
		Promise.all(imagePromises).then(([backgroundImg, foregroundImg, watermarkImg]) => {
			// Clear the canvas
			ctx.fillStyle = '#ccc';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw images
			drawBackground(
				backgroundOptions.reuseForeground ? foregroundImg : backgroundImg,
				ctx,
				backgroundOptions
			);
			drawForeground(foregroundImg, ctx, foregroundOptions);

			// Draw watermark on top if provided
			if (watermarkImg) {
				drawWatermark(watermarkImg, ctx, watermarkOptions);
			}
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

function drawForeground(
	image: HTMLImageElement | null,
	ctx: CanvasRenderingContext2D,
	options: ForegroundOptions
) {
	if (!image) return;

	const srcSize = getImageSize(image);
	const targetSize = getImageSize(image, {
		...options,
		maxWidth: ctx.canvas.width,
		maxHeight: ctx.canvas.height
	});

	const rotationInRadians = (options.rotationInDegrees ?? 0) * (Math.PI / 180);
	drawImage(image, ctx, srcSize, targetSize, 1, rotationInRadians);
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
	if (options.blur !== 0) {
		filters.push(`blur(${options.blur.toFixed(0)}px)`);
	}
	if (options.brightness !== 100) {
		filters.push(`brightness(${options.brightness}%)`);
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
			position: 'center',
			maxWidth: ctx.canvas.width,
			maxHeight: ctx.canvas.height
		});
		console.log({ srcSize, targetSize });
		drawImage(image, ctx, srcSize, targetSize, options.scale);
	}

	// Reset filter before drawing foreground
	ctx.filter = prevFilter;
}

function getImageSize(
	img: HTMLImageElement,
	options?:
		| {
				mode: 'cover';
				position: 'start' | 'center' | 'end';
				maxWidth: number;
				maxHeight: number;
		  }
		| {
				mode: 'contain';
				maxWidth: number;
				maxHeight: number;
		  }
): Rect {
	switch (options?.mode) {
		case 'contain': {
			// Fit the image into the target rectangle without cropping.
			// Do not upscale: if the image is smaller than the target, keep its natural size.
			const widthScale = options.maxWidth / img.width;
			const heightScale = options.maxHeight / img.height;
			const scale = Math.min(1, Math.min(widthScale, heightScale));

			const width = img.width * scale;
			const height = img.height * scale;

			const x = (options.maxWidth - width) / 2;
			const y = (options.maxHeight - height) / 2;

			return { x, y, w: width, h: height };
		}
		case 'cover': {
			// Fill the target rectangle; image may be cropped.
			// Always scale so both dimensions cover the target.
			const widthScale = options.maxWidth / img.width;
			const heightScale = options.maxHeight / img.height;
			const scale = Math.max(widthScale, heightScale);

			const width = img.width * scale;
			const height = img.height * scale;

			let x: number;
			let y: number;
			switch (options.position) {
				case 'start':
					x = 0;
					y = 0;
					break;
				case 'end':
					x = options.maxWidth - width;
					y = options.maxHeight - height;
					break;
				case 'center':
				default:
					x = (options.maxWidth - width) / 2;
					y = (options.maxHeight - height) / 2;
					break;
			}

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
	scale: number = 1,
	rotationInRadians: number = 0
) {
	const centerX = targetRect.x + targetRect.w / 2;
	const centerY = targetRect.y + targetRect.h / 2;

	ctx.save();
	ctx.translate(centerX, centerY);
	ctx.rotate(rotationInRadians);
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
	// Scale from the center of the canvas instead of the top-left.
	// Translate the pattern coordinate system to the canvas center,
	// scale, then translate back so scaling is performed around the center.
	const centerX = ctx.canvas.width / 2;
	const centerY = ctx.canvas.height / 2;

	const matrix = new DOMMatrix();
	matrix.translateSelf(centerX, centerY);
	matrix.scaleSelf(scale, scale);
	matrix.translateSelf(-centerX, -centerY);
	pattern.setTransform(matrix);

	// Draw the pattern
	ctx.save();
	ctx.fillStyle = pattern;
	ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
	ctx.restore();
}

function drawWatermark(
	img: HTMLImageElement,
	ctx: CanvasRenderingContext2D,
	options: WatermarkOptions
) {
	// Compute size, using options.scale as a multiplier of the base size
	const srcWidth = img.width;
	const srcHeight = img.height;

	const targetWidth = srcWidth * options.scale;
	const targetHeight = srcHeight * options.scale;

	// Compute position with some padding
	const shorterSide = Math.min(ctx.canvas.width, ctx.canvas.height);
	const padding = Math.round(shorterSide * 0.03);

	let x = 0;
	let y = 0;
	switch (options.position) {
		case 'top-left':
			x = padding;
			y = padding;
			break;
		case 'top-right':
			x = ctx.canvas.width - padding - targetWidth;
			y = padding;
			break;
		case 'bottom-left':
			x = padding;
			y = ctx.canvas.height - padding - targetHeight;
			break;
		case 'bottom-right':
		default:
			x = ctx.canvas.width - padding - targetWidth;
			y = ctx.canvas.height - padding - targetHeight;
			break;
	}

	// Draw the watermark
	ctx.save();
	ctx.globalAlpha = Math.max(0, Math.min(options.opacity, 1));
	ctx.drawImage(img, 0, 0, srcWidth, srcHeight, x, y, targetWidth, targetHeight);
	ctx.restore();
}
