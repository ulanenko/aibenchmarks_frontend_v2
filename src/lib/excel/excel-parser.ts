import * as XLSX from 'xlsx';
import {isEmpty} from '../utils';
import {NumericParser, defaultParser} from './numeric-parser';
import {numberFormatOptions} from '../formatters';

export interface DatabaseConfig {
	name: string;
	key: string;
	skipRows: number;
	headerRows: number;
	copyRight: boolean;
}
const pattern = /(.*?)(?:\()?(20\d{2})(?:\))?(.*)/;

export const supportedDatabases: Record<string, DatabaseConfig> = {
	tp_catalyst: {
		name: 'TP Catalyst (BvD)',
		key: 'bvd',
		skipRows: 0,
		headerRows: 1,
		copyRight: false,
	},
	ryan: {
		name: 'RYAN',
		key: 'ryan',
		skipRows: 0,
		headerRows: 2,
		copyRight: true,
	},
	royalty_range: {
		name: 'RoyaltyRange',
		key: 'royaltyrange',
		skipRows: 0,
		headerRows: 1,
		copyRight: false,
	},
	snp_capital_iq: {
		name: 'S&P Capital IQ',
		key: 'spcapitaliq',
		skipRows: 2,
		headerRows: 1,
		copyRight: false,
	},
};

/**
 * Loads data from an Excel file
 * @param file The Excel file to load
 * @returns A promise that resolves to the Excel data as JSON
 */
export function readExcelFileAsJson(file: File): Promise<Record<string, any[][]>> {
	return new Promise((resolve, reject) => {
		const fileExtension = file.name.split('.').pop()?.toLowerCase();

		if (!(fileExtension === 'xls' || fileExtension === 'xlsx' || fileExtension === 'xlsm')) {
			reject(new Error('Invalid file format. Please upload an Excel file (.xls, .xlsx, or .xlsm).'));
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, {type: 'array'});
				const sheetNames = workbook.SheetNames;
				const excel_as_json: Record<string, any[][]> = {};

				sheetNames.forEach((sheetName) => {
					const worksheet = workbook.Sheets[sheetName];
					excel_as_json[sheetName] = XLSX.utils.sheet_to_json(worksheet, {
						header: 1,
					});
				});

				resolve(excel_as_json);
			} catch (error) {
				reject(error);
			}
		};

		reader.onerror = (error) => {
			reject(error);
		};

		reader.readAsArrayBuffer(file);
	});
}

function prepareHeader(header: any[][], copyRight: boolean): string[] {
	if (copyRight) {
		header = header.map((row, index) => {
			for (let i = 0; i < row.length - 1; i++) {
				if (i !== 0 && !row[i] && row[i - 1]) {
					row[i] = row[i - 1];
				}
			}
			return row;
		});
	}
	// combine the header rows
	let headersCombined: string[] = [];
	for (let i = 0; i < header.length; i++) {
		if (i === 0) {
			// Create a dense array with no holes
			headersCombined = Array.from({length: (header[i] || []).length}, (_, index) => {
				// If the index exists in data[i], use that value, otherwise undefined
				return header[i] && index in header[i] ? header[i][index] : undefined;
			});
		} else {
			headersCombined = headersCombined.map((header, index) => {
				const cell = header[i]?.[index];
				if (cell === null || cell === undefined) {
					return header;
				}

				return header !== null && header !== undefined ? header + ' ' + cell : cell;
			});
		}
	}
	// replace empty headers with 'Column {index + 1}'
	const emptyReplaced = headersCombined.map((header, index) => {
		if (isEmpty(header)) {
			return `Column ${index + 1}`;
		}
		return header;
	});

	return emptyReplaced;
}

function extractHeaderItem(header: string, index: number, content: any[]): [string, HeaderGroupItem] {
	const cleanedItem = header.replace(/\r?\n/g, ' ').trim();

	const match = cleanedItem.match(pattern);
	if (match) {
		return [match[1], new HeaderGroupItem(cleanedItem, match[1], match[2], index, content)];
	}
	return [header, new HeaderGroupItem(cleanedItem, cleanedItem, null, index, content)];
}

function pivotContentRows(contentRows: any[][]): any[][] {
	// If there are no rows, return an empty array
	if (contentRows.length === 0) return [];

	const pivoted: any[][] = [];

	// Get the maximum length of any row to ensure all columns are accounted for
	const maxColumns = contentRows[0].length;

	// For each column index in the original data
	for (let colIndex = 0; colIndex < maxColumns; colIndex++) {
		// Create a new row in the pivoted data
		const newRow: any[] = [];

		// For each row in the original data
		for (let rowIndex = 0; rowIndex < contentRows.length; rowIndex++) {
			// Add the cell at the current column from the current row to the new row
			newRow.push(contentRows[rowIndex][colIndex]);
		}

		// Add the new row to the pivoted data
		pivoted.push(newRow);
	}

	return pivoted;
}

/**
 * Processes database data based on configuration
 * @param content The content of the database
 * @param skipRows The number of rows to skip
 * @param headerRows The number of header rows
 * @param copyRight Whether to copy the rightmost column to the leftmost column
 * @returns An object containing the headers and content
 */
export function extractDbTableFromSheet(
	content: any[][],
	skipRows: number,
	headerRows: number,
	copyRight: boolean = false,
): HeaderGroup[] {
	// Skip the specified number of rows
	let data = content.slice(skipRows);
	const headerRaw = data.slice(0, headerRows);
	const headers = prepareHeader(headerRaw, copyRight);

	const contentRows = data.slice(headerRows);
	const contentRowsPivoted = pivotContentRows(contentRows);

	// Extract header items for all columns
	const headerGroupsByKey = headers.reduce((acc, header, index) => {
		const [cleanHeader, headerItem] = extractHeaderItem(header, index, contentRowsPivoted[index]);
		if (!acc[cleanHeader]) {
			acc[cleanHeader] = new HeaderGroup(cleanHeader);
		}
		acc[cleanHeader].addHeaderItem(headerItem.header, headerItem.year, headerItem.index, headerItem.rawContent);
		return acc;
	}, {} as Record<string, HeaderGroup>);

	// if there is only one year, set the group as financial
	Object.values(headerGroupsByKey).forEach((group) => {
		group.setIsFinancial(group.headerItemCount > 1);
	});

	return Object.values(headerGroupsByKey);
}

export class HeaderGroupItem {
	// full header
	header: string;
	// cleaned header (without year)
	cleanHeader: string;
	// year
	year: string | null;
	// index
	index: number;
	// raw content values
	rawContent: any[];
	// parsed numeric values (only set for financial columns)
	parsedValues: (number | undefined)[] | null;

	constructor(header: string, cleanHeader: string, year: string | null, index: number, content: any[]) {
		this.header = header;
		this.cleanHeader = cleanHeader;
		this.year = year;
		this.index = index;
		this.rawContent = content;
		this.parsedValues = null;
	}

	/**
	 * Parse the raw content values using the provided parser
	 * @param parser The numeric parser to use
	 */
	parseValues(parser: NumericParser) {
		this.parsedValues = this.rawContent.map((value) => parser.parseNumericValue(value));
	}

	/**
	 * Clear parsed values, reverting to raw content only
	 */
	clearParsedValues() {
		this.parsedValues = null;
	}
}

export class HeaderGroup {
	cleanedKey: string;
	headers: HeaderGroupItem[];
	isFinancial: boolean | undefined;
	private parser: NumericParser;

	constructor(cleanedKey: string, parser: NumericParser = defaultParser) {
		this.cleanedKey = cleanedKey;
		this.headers = [];
		this.parser = parser;
		this.isFinancial = undefined;
	}

	addHeaderItem(header: string, year: string | null, index: number, content: any[]) {
		const cleanHeader = this.cleanedKey;
		this.headers.push(new HeaderGroupItem(header, cleanHeader, year, index, content));
	}

	/**
	 * Set whether this is a financial column group and parse values if needed
	 */
	setIsFinancial(isFinancial: boolean) {
		this.isFinancial = isFinancial;

		// Parse or clear values based on financial status
		this.headers.forEach((header) => {
			if (isFinancial) {
				header.parseValues(this.parser);
			} else {
				header.clearParsedValues();
			}
		});
	}

	get headerItemCount() {
		return this.headers.length;
	}

	get rowCount() {
		return this.headers[0].rawContent.length;
	}

	/**
	 * Gets all raw values for this header group
	 * @returns Array of raw values
	 */
	getRawValues(): any[] {
		return this.headers.flatMap((header) => header.rawContent);
	}

	/**
	 * Gets all parsed values for this header group
	 * If not a financial column, returns null
	 * @returns Array of parsed values or null
	 */
	getParsedValues(): (number | undefined)[] | null {
		if (!this.isFinancial) {
			return null;
		}
		return this.headers.flatMap((header) => header.parsedValues || []);
	}

	/**
	 * Gets a sample value for display purposes
	 * @returns A string representation of the sample value, or 'No sample data' if none exists
	 */
	getSampleValue(): string {
		// Try to get the first value from the raw values
		if (this.headerItemCount > 0) {
			const headerItem = this.headers[0];

			if (this.isFinancial) {
				const parsedValues = headerItem.parsedValues?.[0];
				const formattedValue = parsedValues ? numberFormatOptions.number.format(parsedValues) : 'N/A';
				return `${headerItem.year}: ${formattedValue}`;
			}

			// Fallback to direct access if getRawValues doesn't return expected data

			return headerItem.rawContent.length > 0 ? String(headerItem.rawContent[0]) : 'No sample data';
		}
		return 'No sample data';
	}
}
