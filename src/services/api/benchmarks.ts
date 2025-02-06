import {BenchmarkDTO, CreateBenchmarkDTO, UpdateBenchmarkDTO} from '@/lib/benchmark/type';

export async function getAllBenchmarks(): Promise<BenchmarkDTO[]> {
	const response = await fetch('/api/benchmark');
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || 'Failed to fetch benchmarks');
	}

	return data;
}

export async function createBenchmark(data: CreateBenchmarkDTO): Promise<BenchmarkDTO> {
	const response = await fetch('/api/benchmark', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(data),
	});

	const result = await response.json();

	if (!response.ok) {
		throw new Error(result.error || 'Failed to create benchmark');
	}

	return result;
}

export async function updateBenchmark(updateBenchmarkDTO: UpdateBenchmarkDTO): Promise<BenchmarkDTO> {
	const response = await fetch(`/api/benchmark/${updateBenchmarkDTO.id}`, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(updateBenchmarkDTO),
	});

	const result = await response.json();

	if (!response.ok) {
		throw new Error(result.error || 'Failed to update benchmark');
	}

	return result;
}

export async function deleteBenchmark(id: number): Promise<void> {
	const response = await fetch(`/api/benchmark/${id}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to delete benchmark');
	}
}

export async function getBenchmark(id: number): Promise<BenchmarkDTO> {
	const response = await fetch(`/api/benchmark/${id}`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to fetch benchmark');
	}

	const json = await response.json();
	return json as BenchmarkDTO;
}
