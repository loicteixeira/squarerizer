export type BackgroundOptions = {
	blur: number;
	brightness: number;
	repeat: boolean;
	reuseForeground: boolean;
	scale: number;
};

export type ForegroundOptions = {
	mode: 'contain' | 'cover';
	position: 'start' | 'center' | 'end';
	rotationInDegrees?: 0 | 90 | 180 | 270;
};

export type WatermarkOptions = {
	opacity: number;
	position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	scale: number;
};

export type Rect = { x: number; y: number; w: number; h: number };
