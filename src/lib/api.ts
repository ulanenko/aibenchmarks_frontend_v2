/**
 * Simple API utility for making HTTP requests
 */
export const api = {
	/**
	 * Make a GET request
	 * @param url The URL to request
	 * @param options Optional fetch options
	 * @returns Promise with the parsed response data
	 */
	async get<T>(url: string, options?: RequestInit): Promise<T> {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			...options,
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	},

	/**
	 * Make a POST request
	 * @param url The URL to request
	 * @param data The data to send
	 * @param options Optional fetch options
	 * @returns Promise with the parsed response data
	 */
	async post<T>(url: string, data: any, options?: RequestInit): Promise<T> {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			...options,
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	},

	/**
	 * Make a PUT request
	 * @param url The URL to request
	 * @param data The data to send
	 * @param options Optional fetch options
	 * @returns Promise with the parsed response data
	 */
	async put<T>(url: string, data: any, options?: RequestInit): Promise<T> {
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			...options,
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	},

	/**
	 * Make a DELETE request
	 * @param url The URL to request
	 * @param options Optional fetch options
	 * @returns Promise with the parsed response data
	 */
	async delete<T>(url: string, options?: RequestInit): Promise<T> {
		const response = await fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			...options,
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	},
};
