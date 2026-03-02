# Runs Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add save/compare/export functionality for simulation runs via a slide-out panel.

**Architecture:** Svelte store manages localStorage persistence, RunsPanel component handles UI, export utilities generate CSV/JSON downloads. Chart components accept overlay data for comparison rendering.

**Tech Stack:** SvelteKit (Svelte 5 runes), TypeScript, localStorage, D3.js for chart overlays

---

### Task 1: Create Runs Store

**Files:**
- Create: `src/lib/stores/runs.ts`

**Step 1: Create the store file**

```typescript
import { writable, derived, get } from 'svelte/store';
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
```

**Step 2: Verify no TypeScript errors**

Run: `npm run check 2>&1 | grep -E "(runs\.ts|Error:)" | head -10`
Expected: No new errors related to runs.ts

**Step 3: Commit**

```bash
git add src/lib/stores/runs.ts
git commit -m "feat: Add runs store for localStorage persistence"
```

---

### Task 2: Create Export Utilities

**Files:**
- Create: `src/lib/utils/export.ts`

**Step 1: Create the export utilities file**

```typescript
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
```

**Step 2: Verify no TypeScript errors**

Run: `npm run check 2>&1 | grep -E "(export\.ts|Error:)" | head -10`
Expected: No new errors related to export.ts

**Step 3: Commit**

```bash
git add src/lib/utils/export.ts
git commit -m "feat: Add CSV/JSON export utilities"
```

---

### Task 3: Create RunsPanel Component

**Files:**
- Create: `src/lib/components/RunsPanel.svelte`

**Step 1: Create the panel component**

```svelte
<script lang="ts">
	import { runs, generateRunName, type SavedRun } from '$lib/stores/runs';
	import { exportRuns, savedRunToExportable, type ExportableRun } from '$lib/utils/export';
	import type { SimResult } from '$lib/sim/types';

	let {
		open = $bindable(false),
		moduleKey,
		currentParams,
		currentData
	}: {
		open: boolean;
		moduleKey: string;
		currentParams: Record<string, number | string>;
		currentData: SimResult;
	} = $props();

	let moduleRuns = $derived($runs.filter(r => r.module === moduleKey));
	let visibleCount = $derived(moduleRuns.filter(r => r.visible).length);

	let editingId: string | null = $state(null);
	let editName: string = $state('');
	let menuOpenId: string | null = $state(null);

	function saveCurrentRun() {
		if (currentData.length === 0) return;

		runs.add({
			name: generateRunName(moduleKey, currentParams),
			module: moduleKey,
			params: { ...currentParams },
			data: currentData
		});
	}

	function toggleRun(id: string) {
		const run = moduleRuns.find(r => r.id === id);
		if (!run) return;

		// Limit to 3 visible (4 total including current)
		if (!run.visible && visibleCount >= 3) {
			return;
		}
		runs.toggleVisible(id);
	}

	function startRename(run: SavedRun) {
		editingId = run.id;
		editName = run.name;
		menuOpenId = null;
	}

	function confirmRename() {
		if (editingId && editName.trim()) {
			runs.rename(editingId, editName.trim());
		}
		editingId = null;
		editName = '';
	}

	function cancelRename() {
		editingId = null;
		editName = '';
	}

	function deleteRun(id: string) {
		runs.remove(id);
		menuOpenId = null;
	}

	function exportSingleRun(run: SavedRun, format: 'csv' | 'json') {
		exportRuns([savedRunToExportable(run)], format);
		menuOpenId = null;
	}

	function exportVisible(format: 'csv' | 'json') {
		const visibleRuns = moduleRuns.filter(r => r.visible);

		// Include current run if there's data
		const toExport: ExportableRun[] = [];
		if (currentData.length > 0) {
			toExport.push({
				name: generateRunName(moduleKey, currentParams) + ' (current)',
				module: moduleKey,
				params: currentParams,
				data: currentData
			});
		}

		visibleRuns.forEach(r => toExport.push(savedRunToExportable(r)));

		if (toExport.length > 0) {
			exportRuns(toExport, format);
		}
	}

	function toggleMenu(id: string) {
		menuOpenId = menuOpenId === id ? null : id;
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}
</script>

{#if open}
	<aside class="panel">
		<header class="panel-header">
			<h3>Runs</h3>
			<button class="close-btn" onclick={() => open = false} aria-label="Close">×</button>
		</header>

		<div class="panel-content">
			<button
				class="save-btn"
				onclick={saveCurrentRun}
				disabled={currentData.length === 0}
			>
				Save Current Run
			</button>

			{#if moduleRuns.length === 0}
				<p class="empty">No saved runs yet</p>
			{:else}
				<ul class="runs-list">
					{#each moduleRuns.sort((a, b) => b.timestamp - a.timestamp) as run (run.id)}
						<li class="run-item">
							{#if editingId === run.id}
								<input
									type="text"
									class="rename-input"
									bind:value={editName}
									onkeydown={(e) => e.key === 'Enter' && confirmRename()}
									onblur={confirmRename}
								/>
							{:else}
								<label class="run-label">
									<input
										type="checkbox"
										checked={run.visible}
										onchange={() => toggleRun(run.id)}
										disabled={!run.visible && visibleCount >= 3}
									/>
									<span class="run-name" title={run.name}>
										{run.name}
									</span>
								</label>
							{/if}

							<div class="run-actions">
								<button
									class="menu-btn"
									onclick={() => toggleMenu(run.id)}
									aria-label="Actions"
								>⋮</button>

								{#if menuOpenId === run.id}
									<div class="menu-dropdown">
										<button onclick={() => startRename(run)}>Rename</button>
										<button onclick={() => exportSingleRun(run, 'csv')}>Export CSV</button>
										<button onclick={() => exportSingleRun(run, 'json')}>Export JSON</button>
										<button class="delete" onclick={() => deleteRun(run.id)}>Delete</button>
									</div>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<footer class="panel-footer">
			<span class="footer-label">Export visible:</span>
			<button class="export-btn" onclick={() => exportVisible('csv')}>CSV</button>
			<button class="export-btn" onclick={() => exportVisible('json')}>JSON</button>
		</footer>
	</aside>
	<button class="backdrop" onclick={() => open = false} aria-label="Close panel"></button>
{/if}

<style>
	.panel {
		position: fixed;
		top: 0;
		right: 0;
		width: 280px;
		height: 100vh;
		background: var(--bg);
		border-left: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		z-index: 1000;
		box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		background: transparent;
		z-index: 999;
		cursor: default;
		border: none;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
	}

	.panel-header h3 {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.2rem;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
	}

	.close-btn:hover {
		color: var(--text);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 0.75rem;
	}

	.save-btn {
		width: 100%;
		padding: 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		background: var(--accent);
		color: var(--accent-text);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		margin-bottom: 0.75rem;
	}

	.save-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.save-btn:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.empty {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.75rem;
		padding: 1rem;
	}

	.runs-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.run-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border-radius: 4px;
		position: relative;
	}

	.run-item:hover {
		background: var(--chart-bg);
	}

	.run-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
		cursor: pointer;
	}

	.run-label input[type="checkbox"] {
		cursor: pointer;
	}

	.run-label input[type="checkbox"]:disabled {
		cursor: not-allowed;
	}

	.run-name {
		font-size: 0.7rem;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.rename-input {
		flex: 1;
		font-size: 0.7rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--accent);
		border-radius: 3px;
		background: var(--bg);
		color: var(--text);
	}

	.run-actions {
		position: relative;
	}

	.menu-btn {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.25rem;
		font-size: 0.9rem;
		line-height: 1;
	}

	.menu-btn:hover {
		color: var(--text);
	}

	.menu-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 10;
		min-width: 100px;
	}

	.menu-dropdown button {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.7rem;
		text-align: left;
		background: none;
		border: none;
		color: var(--text);
		cursor: pointer;
	}

	.menu-dropdown button:hover {
		background: var(--chart-bg);
	}

	.menu-dropdown button.delete {
		color: #ef4444;
	}

	.panel-footer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-top: 1px solid var(--border);
	}

	.footer-label {
		font-size: 0.65rem;
		color: var(--text-muted);
	}

	.export-btn {
		padding: 0.35rem 0.6rem;
		font-size: 0.65rem;
		font-weight: 500;
		background: transparent;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 3px;
		cursor: pointer;
	}

	.export-btn:hover {
		color: var(--text);
		border-color: var(--text-muted);
	}
</style>
```

**Step 2: Verify no TypeScript errors**

Run: `npm run check 2>&1 | grep -E "(RunsPanel|Error:)" | head -10`
Expected: No new errors related to RunsPanel

**Step 3: Commit**

```bash
git add src/lib/components/RunsPanel.svelte
git commit -m "feat: Add RunsPanel component for save/compare UI"
```

---

### Task 4: Modify SimLayout to Add Runs Button and Panel

**Files:**
- Modify: `src/lib/components/SimLayout.svelte`

**Step 1: Add imports and props**

Add after existing imports:
```typescript
import RunsPanel from './RunsPanel.svelte';
import type { SimResult } from '$lib/sim/types';
```

Add to props interface:
```typescript
moduleKey?: string;
currentParams?: Record<string, number | string>;
currentData?: SimResult;
```

**Step 2: Add runsOpen state**

After `let helpOpen = $state(false);` add:
```typescript
let runsOpen = $state(false);
```

**Step 3: Add runs button in topbar**

After the help button `{#if helpData}...{/if}` block, add:
```svelte
{#if moduleKey}
	<button
		class="btn-runs"
		onclick={() => (runsOpen = !runsOpen)}
		aria-label="Saved runs"
		aria-expanded={runsOpen}
	>⊞</button>
{/if}
```

**Step 4: Add RunsPanel at end of component**

After `<HelpPanel content={helpData} bind:open={helpOpen} />` add:
```svelte
{#if moduleKey}
	<RunsPanel
		bind:open={runsOpen}
		{moduleKey}
		currentParams={currentParams ?? {}}
		currentData={currentData ?? []}
	/>
{/if}
```

**Step 5: Add button styles**

Add to `<style>`:
```css
.btn-runs {
	padding: 0.35rem 0.5rem;
	font-size: 0.85rem;
	background: transparent;
	color: var(--text-muted);
	border: 1px solid var(--border);
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.15s;
	line-height: 1;
}

.btn-runs:hover {
	color: var(--text);
	border-color: var(--text-muted);
}
```

**Step 6: Verify no TypeScript errors**

Run: `npm run check 2>&1 | grep -E "(SimLayout|Error:)" | head -10`
Expected: No new errors

**Step 7: Commit**

```bash
git add src/lib/components/SimLayout.svelte
git commit -m "feat: Add runs button and panel to SimLayout"
```

---

### Task 5: Add Overlay Support to Chart Component

**Files:**
- Modify: `src/lib/components/Chart.svelte`

**Step 1: Read current Chart.svelte**

Check current implementation to understand structure.

**Step 2: Add overlayData prop**

Add to props:
```typescript
overlayData?: SimResult;
```

**Step 3: Pass to renderLineChart**

Modify the render call to merge overlay data with primary data when rendering. The lineChart already supports multiple trajectories - we just need to pass the overlay runs with different styling options.

**Step 4: Commit**

```bash
git add src/lib/components/Chart.svelte
git commit -m "feat: Add overlay data support to Chart component"
```

---

### Task 6: Update lineChart to Support Overlay Styling

**Files:**
- Modify: `src/lib/charts/lineChart.ts`

**Step 1: Add overlay options to ChartOptions**

```typescript
overlayData?: SimResult;
overlayLabels?: string[];
```

**Step 2: Render overlay data with dashed lines at 50% opacity**

After rendering primary data, render overlay data with:
- `stroke-dasharray: '4,2'`
- `opacity: 0.5`
- Next colors in the cycle

**Step 3: Commit**

```bash
git add src/lib/charts/lineChart.ts
git commit -m "feat: Add overlay rendering to lineChart"
```

---

### Task 7: Update Drift Route as Example

**Files:**
- Modify: `src/routes/drift/+page.svelte`

**Step 1: Import runs store**

```typescript
import { runs } from '$lib/stores/runs';
```

**Step 2: Create params object**

```typescript
let currentParams = $derived({
	N,
	populations,
	generations,
	initialFreq
});
```

**Step 3: Pass to SimLayout**

```svelte
<SimLayout
	title="Genetic Drift"
	onrun={run}
	onreset={reset}
	helpKey="/drift"
	moduleKey="/drift"
	currentParams={currentParams}
	currentData={data}
>
```

**Step 4: Get visible runs and pass to chart**

```typescript
let visibleRuns = $derived(runs.getVisible('/drift'));
let overlayData = $derived(visibleRuns.flatMap(r => r.data));
```

Pass to DriftChart:
```svelte
<DriftChart {data} {overlayData} ... />
```

**Step 5: Commit**

```bash
git add src/routes/drift/+page.svelte
git commit -m "feat: Wire up drift page to runs panel"
```

---

### Task 8: Final Integration Test

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Manual testing checklist**

- [ ] Navigate to /drift
- [ ] Run a simulation
- [ ] Click ⊞ button - panel opens
- [ ] Click "Save Current Run" - run appears in list
- [ ] Run another simulation with different params
- [ ] Save again
- [ ] Check first run checkbox - overlay appears on chart
- [ ] Export CSV - file downloads
- [ ] Export JSON - file downloads
- [ ] Rename a run via ⋮ menu
- [ ] Delete a run
- [ ] Refresh page - saved runs persist

**Step 3: Build check**

```bash
npm run build
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: Complete runs panel integration"
```

---

## Summary

| Task | Files | Estimated Lines |
|------|-------|-----------------|
| 1. Runs Store | `stores/runs.ts` | ~120 |
| 2. Export Utils | `utils/export.ts` | ~60 |
| 3. RunsPanel | `components/RunsPanel.svelte` | ~280 |
| 4. SimLayout | `components/SimLayout.svelte` | ~30 (changes) |
| 5. Chart | `components/Chart.svelte` | ~10 (changes) |
| 6. lineChart | `charts/lineChart.ts` | ~40 (changes) |
| 7. Drift Route | `routes/drift/+page.svelte` | ~20 (changes) |
| **Total** | 7 files | ~560 lines |
