import {DTO_ValidateAndFindWebsiteRequest, DTO_ValidateAndFindWebsiteResponse} from './types';

/**
 * Validates a website and finds an alternative if needed
 * @param request The validation request
 * @returns A tuple with the response and error
 */
export async function validateAndFindWebsite(
	request: DTO_ValidateAndFindWebsiteRequest,
): Promise<[DTO_ValidateAndFindWebsiteResponse | null, string | null]> {
	try {
		// Get the API URL and auth token from environment variables
		const apiUrl = process.env.SUPPORT_SERVICES_URL;
		const authToken = process.env.SUPPORT_SERVICES_AUTH_TOKEN;

		if (!apiUrl || !authToken) {
			throw new Error('Support services configuration is missing');
		}

		// Prepare the request
		const response = await fetch(`${apiUrl}/validate_and_find_website`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authToken,
			},
			body: JSON.stringify(request),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			throw new Error(errorData ? JSON.stringify(errorData) : `HTTP error ${response.status}`);
		}

		const data = await response.json();
		return [data as DTO_ValidateAndFindWebsiteResponse, null];
	} catch (error) {
		console.error('Error in validateAndFindWebsite:', error);
		return [null, error instanceof Error ? error.message : String(error)];
	}
}
