import * as XLSX from 'xlsx';
import {isEmpty} from '../utils';

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
): {headers: string[]; content: any[][]} {
	// Skip the specified number of rows
	let data = content.slice(skipRows);

	// Optional: Fill empty header cells to the right with the value from the left
	if (copyRight) {
		data = data.map((row, index) => {
			if (index < headerRows) {
				for (let i = 0; i < row.length - 1; i++) {
					if (i !== 0 && !row[i] && row[i - 1]) {
						row[i] = row[i - 1];
					}
				}
			}
			return row;
		});
	}

	// Combine header rows after copying data to the right
	let headers: string[] = [];
	for (let i = 0; i < headerRows; i++) {
		if (i === 0) {
			// Create a dense array with no holes
			headers = Array.from({length: (data[i] || []).length}, (_, index) => {
				// If the index exists in data[i], use that value, otherwise undefined
				return data[i] && index in data[i] ? data[i][index] : undefined;
			});
		} else {
			headers = headers.map((header, index) => {
				const cell = data[i]?.[index];
				if (cell === null || cell === undefined) {
					return header;
				}

				return header !== null && header !== undefined ? header + ' ' + cell : cell;
			});
		}
	}

	// Create a new dense array with no holes, using the original isEmpty function
	const headersEmptyReplaced = headers.map((header, index) => {
		if (isEmpty(header)) {
			return `Column ${index + 1}`;
		}
		return header;
	});

	const headerIsYear = headersEmptyReplaced.map((header) => pattern.test(header));

	// Drop the header rows to get the content rows
	let contentRows = data.slice(headerRows);
	// only return the rows that have no year
	contentRows = contentRows.map((row) => {
		return row.filter((cell, index) => !headerIsYear[index]);
	});
	headers = headersEmptyReplaced.filter((header, index) => !headerIsYear[index]);
	// Return the result as an object with 'header' and 'content' keys

	return {
		headers: headers,
		content: contentRows,
	};
}

/**
 * Class representing a header item
 */
export class ExcelColumnHeader {
	name: string;
	year: string | null;
	header: string;
	index: number;
	samples: any[];

	constructor(name: string, year: string | null, header: string, index: number, samples: any[]) {
		this.name = name;
		this.year = year;
		this.header = header;
		this.index = index;
		this.samples = samples;
	}
}

/**
 * Calculates the interquartile range for an array of numbers
 * @param values Array of numbers
 * @returns Object with quartile information
 */
function calculateInterquartileRange(values: number[]): {range?: {lowerQuartile: number; upperQuartile: number}} {
	if (!values.length) return {};

	const sorted = [...values].sort((a, b) => a - b);
	const q1Index = Math.floor(sorted.length / 4);
	const q3Index = Math.floor((sorted.length * 3) / 4);

	return {
		range: {
			lowerQuartile: sorted[q1Index],
			upperQuartile: sorted[q3Index],
		},
	};
}

/**
 * Extracts headers with years and organizes them into general and financial categories
 * @param headers Array of headers
 * @param content Array of content rows
 * @returns Object with general and financial headers
 */
export function categorizeHeadersByYear(
	headers: string[],
	content: any[][],
): {generalHeaders: ExcelColumnHeader[]; financialHeaders: ExcelColumnHeader[]} {
	// Pattern to match year (with or without brackets) anywhere in the string
	const result = {
		generalHeaders: [] as ExcelColumnHeader[],
		financialHeaders: [] as ExcelColumnHeader[],
	};

	const countByFinancialType: Record<string, number> = {};
	const sampleContent = content.slice(0, 5);
	const dataByColumn: any[][] = [];

	sampleContent.forEach((row) => {
		row.forEach((colVal, colIndex) => {
			dataByColumn[colIndex] = [...(dataByColumn[colIndex] ?? []), colVal];
		});
	});

	headers.forEach((item, index) => {
		if (typeof item === 'string') {
			// Preprocess: replace newlines with spaces and trim
			const cleanedItem = item.replace(/\r?\n/g, ' ').trim();
			const match = cleanedItem.match(pattern);

			if (match) {
				// Using standard capturing groups: match[1] = name, match[2] = year, match[3] = remainder
				const name = (match[1] + (match[3] || '')).trim();
				const year = match[2];

				result.financialHeaders.push(new ExcelColumnHeader(name, year, item, index, dataByColumn[index] || []));
				countByFinancialType[name] = 1 + (countByFinancialType[name] ?? 0);
			} else {
				result.generalHeaders.push(new ExcelColumnHeader(item, null, item, index, dataByColumn[index] || []));
			}
		}
	});

	const statistics = calculateInterquartileRange(Object.values(countByFinancialType));
	if (!statistics.range) {
		return result;
	}

	const {lowerQuartile, upperQuartile} = statistics.range;

	// Find the outliers and move them from financialHeaders to generalHeaders
	Object.entries(countByFinancialType).forEach(([name, value]) => {
		if (value < lowerQuartile || value > upperQuartile) {
			result.financialHeaders = result.financialHeaders.filter((headerObj) => {
				if (headerObj.name === name) {
					result.generalHeaders.push(headerObj);
					return false;
				}
				return true;
			});
		}
	});

	return result;
}

/**
 * Parses a numeric value from a string or number
 * @param value The value to parse
 * @returns The parsed number or undefined
 */
export function cleanAndParseNumber(value: any): number | undefined {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}

	if (typeof value === 'number') {
		return value;
	}

	// Convert to string and clean it
	const stringValue = String(value).replace(/[^\d.-]/g, '');
	const parsedValue = parseFloat(stringValue);

	return isNaN(parsedValue) ? undefined : parsedValue;
}
