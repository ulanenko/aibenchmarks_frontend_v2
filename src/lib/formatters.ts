const formatterPercentage = new Intl.NumberFormat('en-US', {
	style: 'percent',
	minimumFractionDigits: 1,
	maximumFractionDigits: 1,
});
const formatterNumber = new Intl.NumberFormat('en-US', {
	style: 'decimal',
	minimumFractionDigits: 0,
	maximumFractionDigits: 0,
});

/**
 * Type definition for the Handsontable pattern format
 */
interface HotPattern {
	pattern: string;
	culture: string;
}

/**
 * Class representing a custom number format configuration.
 * This class bundles a JavaScript International Number Format object with a custom pattern used specifically for Handsontable (HOT).
 *
 * @class
 */
class NumberFormatter {
	numberFormatter: Intl.NumberFormat;
	hotPattern: HotPattern;

	/**
	 * Create a BmNumberFormat.
	 * @param {Intl.NumberFormat} numberFormatter - An instance of Intl.NumberFormat to format numbers.
	 * @param {HotPattern} hotPattern - A pattern object used specifically for formatting in Handsontable.
	 */
	constructor(numberFormatter: Intl.NumberFormat, hotPattern: HotPattern) {
		this.numberFormatter = numberFormatter;
		this.hotPattern = hotPattern;
	}

	format(value: number): string {
		return this.numberFormatter.format(value);
	}
}

export const numberFormatOptions = {
	percentage: new NumberFormatter(formatterPercentage, {
		pattern: '0.0%',
		culture: 'en-US',
	}),
	number: new NumberFormatter(formatterNumber, {
		pattern: '0,0.0',
		culture: 'en-US',
	}),
};
