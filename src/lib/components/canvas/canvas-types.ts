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
};

export type Rect = { x: number; y: number; w: number; h: number };
