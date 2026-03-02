<script lang="ts">
	import SimLayout from '$lib/components/SimLayout.svelte';
	import ParamInput from '$lib/components/ParamInput.svelte';
	import Chart from '$lib/components/Chart.svelte';
	import { simulateIrreversibleMutation, IRREVERSIBLE_DEFAULTS } from '$lib/sim/mutation';
	import { runs } from '$lib/stores/runs';
	import type { SimResult } from '$lib/sim/types';

	let mu = $state(IRREVERSIBLE_DEFAULTS.mu);
	let initialFreq = $state(IRREVERSIBLE_DEFAULTS.initialFreq);
	let generations = $state(IRREVERSIBLE_DEFAULTS.generations);

	let data: SimResult = $state([]);

	let currentParams = $derived({
		'P(A)': initialFreq,
		μ: mu,
		Gen: generations
	});

	let overlayData = $derived(
		$runs
			.filter(r => r.module === '/mutation/irreversible' && r.visible)
			.flatMap(r => r.data)
	);

	function run() {
		data = simulateIrreversibleMutation({ mu, initialFreq, generations });
	}

	function reset() {
		mu = IRREVERSIBLE_DEFAULTS.mu;
		initialFreq = IRREVERSIBLE_DEFAULTS.initialFreq;
		generations = IRREVERSIBLE_DEFAULTS.generations;
		data = [];
	}
</script>

<SimLayout
	title="Irreversible Mutation"
	onrun={run}
	onreset={reset}
	helpKey="/mutation/irreversible"
	moduleKey="/mutation/irreversible"
	{currentParams}
	currentData={data}
>
	{#snippet controls()}
		<ParamInput label="P(A)" bind:value={initialFreq} step={0.01} min={0} max={1} />
		<ParamInput label="μ" bind:value={mu} step={0.0001} min={0} max={1} />
		<ParamInput label="Gen" bind:value={generations} min={1} />
	{/snippet}
	{#snippet chart()}
		<Chart {data} {overlayData} />
	{/snippet}
</SimLayout>
