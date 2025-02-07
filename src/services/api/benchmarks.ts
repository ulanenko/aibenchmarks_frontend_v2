import {BenchmarkDTO, CreateBenchmarkDTO, UpdateBenchmarkDTO} from '@/lib/benchmark/type';

const BASE_URL = '/api/benchmarks';

type APIResponse<T> = {
	error?: string;
} & T;

export async function getAllBenchmarks(): Promise<BenchmarkDTO[]> {
	const response = await fetch(BASE_URL);
	const data = (await response.json()) as APIResponse<{benchmarks: BenchmarkDTO[]}>;

	if (!response.ok) {
		throw new Error(data.error || 'Failed to fetch benchmarks');
	}

	return data.benchmarks;
}

export async function createBenchmark(data: CreateBenchmarkDTO): Promise<BenchmarkDTO> {
	const response = await fetch(BASE_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(data),
	});

	const result = (await response.json()) as APIResponse<{benchmark: BenchmarkDTO}>;

	if (!response.ok) {
		throw new Error(result.error || 'Failed to create benchmark');
	}

	return result.benchmark;
}

export async function updateBenchmark(updateBenchmarkDTO: UpdateBenchmarkDTO): Promise<BenchmarkDTO> {
	const response = await fetch(`${BASE_URL}/${updateBenchmarkDTO.id}`, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(updateBenchmarkDTO),
	});

	const result = (await response.json()) as APIResponse<{benchmark: BenchmarkDTO}>;

	if (!response.ok) {
		throw new Error(result.error || 'Failed to update benchmark');
	}

	return result.benchmark;
}

export async function deleteBenchmark(id: number): Promise<BenchmarkDTO> {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: 'DELETE',
	});

	const data = (await response.json()) as APIResponse<{benchmark: BenchmarkDTO}>;

	if (!response.ok) {
		throw new Error(data.error || 'Failed to delete benchmark');
	}

	return data.benchmark;
}

export async function getBenchmark(id: number): Promise<BenchmarkDTO> {
	const response = await fetch(`${BASE_URL}/${id}`);
	const data = (await response.json()) as APIResponse<{benchmark: BenchmarkDTO}>;

	if (!response.ok) {
		throw new Error(data.error || 'Failed to fetch benchmark');
	}

	return data.benchmark;
}
