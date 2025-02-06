/**
 * Sets a value at a nested path within an object, creating intermediate objects if they don't exist.
 * @param obj - The target object to modify
 * @param path - The path to the property, using dot notation (e.g., 'a.b.c')
 * @param value - The value to set at the specified path
 */
export const setValueForPath = (obj: any, path: string, value: any): void => {
	const keys = path.split('.');
	let current = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		if (!current[keys[i]]) {
			current[keys[i]] = {};
		}
		current = current[keys[i]];
	}
	current[keys[keys.length - 1]] = value;
};

/**
 * Gets a value at a nested path within an object
 * @param obj - The source object to retrieve from
 * @param path - The path to the property, using dot notation (e.g., 'a.b.c')
 * @returns The value at the specified path, or undefined if the path doesn't exist
 */
export const getValueForPath = (obj: any, path: string) => {
	const keys = path.split('.');
	let current = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		if (!current[keys[i]]) {
			return undefined;
		}
		current = current[keys[i]];
	}
	return current[keys[keys.length - 1]];
};
