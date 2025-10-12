import type { BackgroundOptions, ForegroundOptions, Rect } from './canvas-types';

export const defaultBackgroundOptions: BackgroundOptions = {
	blur: 0,
	brightness: 100,
	repeat: false,
	reuseForeground: false,
	scale: 1
};

export const defaultForegroundOptions: ForegroundOptions = {
	position: 'center'
};

export function createCanvas({
	background,
	backgroundOptions,
	foreground,
	foregroundOptions
}: {
	background: File | null;
	backgroundOptions: BackgroundOptions;
	foreground: File | null;
	foregroundOptions: ForegroundOptions;
}) {
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
			drawForeground(foregroundImg, ctx, foregroundOptions);
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
