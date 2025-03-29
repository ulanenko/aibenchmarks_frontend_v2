import {CategoryColor} from '@/types/category';
import colors from 'tailwindcss/colors';

const colorMap: Record<CategoryColor, keyof typeof colors> = {
	green: 'emerald',
	red: 'rose',
	yellow: 'amber',
	blue: 'blue',
	purple: 'purple',
	pink: 'pink',
	gray: 'slate',
	orange: 'orange',
};

const elementTypes = ['bg', 'text', 'border'] as const;
type ElementType = (typeof elementTypes)[number];

type ColorIntensity = 'soft' | 'full' | 'middle';

const colorMapIntensity: Record<string, Record<ColorIntensity, string>> = {
	'default':{
		'soft': '50',
		'middle': '200',
		'full': '500',
	},
	'hover':{
		'soft': '100',
		'middle': '300',
		'full': '600',
	},
}
export const getColorClass = (color: CategoryColor, element: ElementType, intensity: ColorIntensity = 'soft') => {
	const colorName = colorMap[color];
	const shade = colorMapIntensity['default'][intensity];
	const hoverShade = colorMapIntensity['hover'][intensity];
	return `${element}-${colorName}-${shade} hover:${element}-${colorName}-${hoverShade}`;
};

export const getColorClassSimple = (color: CategoryColor, element: ElementType, intensity: ColorIntensity = 'soft', hovered: boolean = false) => {
	const colorName = colorMap[color];
	const shade = colorMapIntensity['default'][intensity];
	const hoverShade = colorMapIntensity['hover'][intensity];
	if(hovered){
		return `${element}-${colorName}-${hoverShade}`;
	}else{
		return `${element}-${colorName}-${shade}`;
	}
};

export const getColorValue = (color: CategoryColor, intensity: ColorIntensity = 'soft', hovered: boolean = false) => {
	const colorName = colorMap[color];
	const numberIntensity = colorMapIntensity[hovered ? 'hover' : 'default'][intensity];
	return colors[colorName][numberIntensity as keyof typeof colors[typeof colorName]];
};

/**
 * Get the CSS gradient string for animations based on a category color
 * @param color The category color
 * @param alpha1 First alpha value for gradient (0-1)
 * @param alpha2 Middle alpha value for gradient (0-1)
 * @param alpha3 Last alpha value for gradient (0-1)
 * @returns CSS linear gradient string
 */
export const getGradientForAnimation = (color: CategoryColor, alpha1 = 0.2, alpha2 = 0.6, alpha3 = 0.2) => {
	const colorName = colorMap[color];
	const colorValue = colors[colorName]['500']; // Use 500 shade for animation
	
	// Extract RGB components assuming hex color format
	let r, g, b;
	
	// Handle both "#fff" and "#ffffff" formats
	if (colorValue.length === 4) {
		r = parseInt(colorValue[1] + colorValue[1], 16);
		g = parseInt(colorValue[2] + colorValue[2], 16);
		b = parseInt(colorValue[3] + colorValue[3], 16);
	} else {
		r = parseInt(colorValue.slice(1, 3), 16);
		g = parseInt(colorValue.slice(3, 5), 16);
		b = parseInt(colorValue.slice(5, 7), 16);
	}
	
	return `linear-gradient(to right, rgba(${r}, ${g}, ${b}, ${alpha1}), rgba(${r}, ${g}, ${b}, ${alpha2}), rgba(${r}, ${g}, ${b}, ${alpha3}))`;
};
