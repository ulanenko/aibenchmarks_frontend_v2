/**
 * Checks if a value is a valid number
 * @param value The value to check
 * @returns True if the value is a valid number
 */
export function isNumber(value: any): boolean {
	return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Parser for handling numeric values with different decimal and thousand separators
 */
export class NumericParser {
	private readonly defaultDecimalSep: string;

	/**
	 * Creates a new NumericParser
	 * @param defaultDecimalSep The default decimal separator to use ('.' or ',')
	 */
	constructor(defaultDecimalSep: '.' | ',' = '.') {
		this.defaultDecimalSep = defaultDecimalSep;
	}

	/**
	 * Parses a string value into a number, handling different formats:
	 * - Negative numbers with minus sign or parentheses
	 * - Thousands separators (both ',' and '.')
	 * - Different decimal separators
	 *
	 * @param value The value to parse
	 * @returns The parsed number or the original value if parsing fails
	 */
	parseNumericValue(value: any): number | any {
		// Return original value if null, undefined, or already a number
		if (!value || isNumber(value)) return value;

		// Convert to string if not already
		let strValue = String(value);

		// Handle negative numbers (minus sign or parentheses)
		let minus = '';
		if (strValue.match(/^-|-$|^\(.+\)$/)) {
			minus = '-';
		}

		// Remove all non-numeric characters except . and ,
		strValue = minus + strValue.replace(/[^\d,.]+/g, '');

		// Handle thousand separators
		if (strValue.match(/^\d{1,3}(,\d{3})+(\.|$)/) && !(this.defaultDecimalSep === ',' && strValue.match(/^\d+,\d+$/))) {
			// Format: 1,234.56 (comma as thousand separator)
			strValue = strValue.replace(/,/g, '');
		} else if (
			strValue.match(/^\d{1,3}(\.\d{3})+(,|$)/) &&
			!(this.defaultDecimalSep === '.' && strValue.match(/^\d+\.\d+$/))
		) {
			// Format: 1.234,56 (dot as thousand separator)
			strValue = strValue.replace(/\./g, '');
		}

		// Convert decimal separator to standard format (.)
		if (strValue.match(/^\d+,\d+$/)) {
			strValue = strValue.replace(',', '.');
		}

		// Ensure minus sign is at the start
		if (strValue.match('-')) {
			strValue = strValue.replace('-', '');
			strValue = '-' + strValue;
		}

		// Parse to float, return 0 if parsing fails
		try {
			return parseFloat(strValue);
		} catch (error) {
			return 0;
		}
	}
}

// Export default instance with '.' as decimal separator
export const defaultParser = new NumericParser('.');
