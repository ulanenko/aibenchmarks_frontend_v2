import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isEmpty(value: any): boolean {
	if (typeof value === 'string') {
		return value.trim() === '';
	}
	return value === null || value === undefined;
}

export function checkIfValidUrl(url: string | null) {
	if (!url) {
		return false;
	}
	// Remove leading/trailing whitespace
	let urlToCheck = url.trim();

	// Add https:// if no protocol specified
	if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
		urlToCheck = 'https://' + urlToCheck;
	}

	try {
		const url = new URL(urlToCheck);
		// Check if has valid domain with at least one dot
		if (!url.hostname.includes('.')) {
			return false;
		}
	} catch (e) {
		return false;
	}
	return true;
}
