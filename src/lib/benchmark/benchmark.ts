import {BenchmarkDTO, CreateBenchmarkDTO, UpdateBenchmarkDTO} from './type';
import {benchmarkSchema, BenchmarkFields, type BenchmarkSchemaType} from './schema-and-fields';

export {benchmarkSchema, BenchmarkFields};
export type {BenchmarkSchemaType};

export class Benchmark implements BenchmarkDTO {
	private static tempIdCounter = -1;

	id: number;
	name: string;
	createdAt: Date;
	updatedAt: Date | null;
	clientId: number | null;
	userId: number;
	year: number;
	lang: string | null;
	clientName: string | null;
	userName: string | null;

	// Track changes for optimistic updates
	changes: Record<
		string,
		{
			value: any;
			oldValue: any;
		}
	> = {};

	constructor(data?: BenchmarkDTO) {
		this.id = data && 'id' in data ? data.id : Benchmark.getNextTempId();
		this.name = data?.name ?? '';
		this.createdAt = data && 'createdAt' in data ? data.createdAt : new Date();
		this.updatedAt = data && 'updatedAt' in data ? data.updatedAt : null;
		this.clientId = data?.clientId ?? null;
		this.userId = data?.userId ?? 0;
		this.year = data?.year ?? new Date().getFullYear();
		this.lang = data?.lang ?? null;
		this.clientName = data?.clientName ?? null;
		this.userName = data?.userName ?? null;
	}

	private static getNextTempId(): number {
		return this.tempIdCounter--;
	}

	// Helper method to check if the entity is new
	isNew(): boolean {
		return this.id < 0;
	}

	// Method to update benchmark data
	update(changes: Record<string, any>) {
		this.updatedAt = new Date();
		Object.entries(changes).forEach(([key, value]) => {
			(this as any)[key] = value;
			if (this.changes[key]?.oldValue === value) {
				delete this.changes[key];
			} else {
				this.changes[key] = {value, oldValue: this.changes[key]?.value ?? value};
			}
		});
	}

	// Static method to create from database type
	static fromDB(data: BenchmarkDTO): Benchmark {
		return new Benchmark(data);
	}
}
