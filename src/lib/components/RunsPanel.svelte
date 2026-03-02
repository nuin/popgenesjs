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
			<button class="close-btn" onclick={() => open = false} aria-label="Close">&times;</button>
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
								>&#8942;</button>

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
