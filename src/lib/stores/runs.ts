import { writable, get } from 'svelte/store';
import type { SimResult } from '$lib/sim/types';

export interface SavedRun {
	id: string;
	name: string;
	module: string;
	timestamp: number;
	params: Record<string, number | string>;
	data: SimResult;
	visible: boolean;
}

const STORAGE_KEY = 'popgenes-runs';
const MAX_RUNS_PER_MODULE = 20;

function loadRuns(): SavedRun[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function saveRuns(runs: SavedRun[]) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

function createRunsStore() {
	const { subscribe, set, update } = writable<SavedRun[]>(loadRuns());

	return {
		subscribe,

		add(run: Omit<SavedRun, 'id' | 'timestamp' | 'visible'>) {
			update(runs => {
				const moduleRuns = runs.filter(r => r.module === run.module);
				let newRuns = runs;

				// Remove oldest if at limit
				if (moduleRuns.length >= MAX_RUNS_PER_MODULE) {
					const oldest = moduleRuns.sort((a, b) => a.timestamp - b.timestamp)[0];
					newRuns = runs.filter(r => r.id !== oldest.id);
				}

				const newRun: SavedRun = {
					...run,
					id: crypto.randomUUID(),
					timestamp: Date.now(),
					visible: false
				};

				const result = [...newRuns, newRun];
				saveRuns(result);
				return result;
			});
		},

		remove(id: string) {
			update(runs => {
				const result = runs.filter(r => r.id !== id);
				saveRuns(result);
				return result;
			});
		},

		rename(id: string, name: string) {
			update(runs => {
				const result = runs.map(r => r.id === id ? { ...r, name } : r);
				saveRuns(result);
				return result;
			});
		},

		toggleVisible(id: string) {
			update(runs => {
				const result = runs.map(r => r.id === id ? { ...r, visible: !r.visible } : r);
				saveRuns(result);
				return result;
			});
		},

		setVisible(id: string, visible: boolean) {
			update(runs => {
				const result = runs.map(r => r.id === id ? { ...r, visible } : r);
				saveRuns(result);
				return result;
			});
		},

		hideAll(module: string) {
			update(runs => {
				const result = runs.map(r => r.module === module ? { ...r, visible: false } : r);
				saveRuns(result);
				return result;
			});
		},

		getByModule(module: string): SavedRun[] {
			return get({ subscribe }).filter(r => r.module === module);
		},

		getVisible(module: string): SavedRun[] {
			return get({ subscribe }).filter(r => r.module === module && r.visible);
		}
	};
}

export const runs = createRunsStore();

export function generateRunName(
	module: string,
	params: Record<string, number | string>
): string {
	const moduleName = module.split('/').pop() || module;
	const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

	const keyParams = Object.entries(params)
		.slice(0, 3)
		.map(([k, v]) => `${k}=${typeof v === 'number' ? v.toFixed(2).replace(/\.?0+$/, '') : v}`)
		.join(' ');

	const time = new Date().toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});

	return `${capitalizedModule} ${keyParams} @ ${time}`;
}
