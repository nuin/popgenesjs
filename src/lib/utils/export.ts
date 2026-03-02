import type { SimResult } from '$lib/sim/types';
import type { SavedRun } from '$lib/stores/runs';

export interface ExportableRun {
	name: string;
	module: string;
	params: Record<string, number | string>;
	data: SimResult;
}

export function toCSV(runs: ExportableRun[]): string {
	const lines: string[] = ['run,generation,frequency,line'];

	runs.forEach(run => {
		run.data.forEach((trajectory, lineIdx) => {
			trajectory.forEach(point => {
				const runName = `"${run.name.replace(/"/g, '""')}"`;
				lines.push(`${runName},${point.generation},${point.frequency},${lineIdx + 1}`);
			});
		});
	});

	return lines.join('\n');
}

export function toJSON(runs: ExportableRun[]): string {
	const output = {
		exported: new Date().toISOString(),
		runs: runs.map(r => ({
			name: r.name,
			module: r.module,
			params: r.params,
			data: r.data
		}))
	};

	return JSON.stringify(output, null, 2);
}

export function download(content: string, filename: string, type: 'csv' | 'json') {
	const mimeType = type === 'csv' ? 'text/csv' : 'application/json';
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export function exportRuns(runs: ExportableRun[], format: 'csv' | 'json') {
	const module = runs[0]?.module.split('/').pop() || 'simulation';
	const timestamp = Date.now();
	const filename = `popgenes-${module}-${timestamp}.${format}`;

	const content = format === 'csv' ? toCSV(runs) : toJSON(runs);
	download(content, filename, format);
}

export function savedRunToExportable(run: SavedRun): ExportableRun {
	return {
		name: run.name,
		module: run.module,
		params: run.params,
		data: run.data
	};
}
