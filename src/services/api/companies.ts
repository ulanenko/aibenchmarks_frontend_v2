import {CompanyDTO, UpdateCompanyDTO} from '@/lib/company';
import {Company} from '@/lib/company/company';

export async function getCompanies(benchmarkId: number): Promise<Company[]> {
	const response = await fetch(`/api/benchmarks/${benchmarkId}/companies`);
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || 'Failed to load companies');
	}

	return data.companies;
}

export async function saveCompanies(benchmarkId: number, companies: UpdateCompanyDTO[]): Promise<CompanyDTO[]> {
	const response = await fetch(`/api/benchmarks/${benchmarkId}/companies`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({companies}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || 'Failed to save companies');
	}

	return data.companies;
}
