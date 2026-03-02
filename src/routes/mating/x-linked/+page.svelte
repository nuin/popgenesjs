<script lang="ts">
	import SimLayout from '$lib/components/SimLayout.svelte';
	import ParamInput from '$lib/components/ParamInput.svelte';
	import Chart from '$lib/components/Chart.svelte';
	import { simulateXLinked, XLINKED_DEFAULTS } from '$lib/sim/mating';
	import { runs } from '$lib/stores/runs';
	import type { SimResult } from '$lib/sim/types';

	let pFemale = $state(XLINKED_DEFAULTS.pFemale);
	let pMale = $state(XLINKED_DEFAULTS.pMale);
	let generations = $state(XLINKED_DEFAULTS.generations);

	let data: SimResult = $state([]);

	let currentParams = $derived({
		'p♀': pFemale,
		'p♂': pMale,
		Gen: generations
	});

	let overlayData = $derived(
		$runs
			.filter(r => r.module === '/mating/x-linked' && r.visible)
			.flatMap(r => r.data)
	);

	function run() {
		data = simulateXLinked({ pFemale, pMale, generations });
	}

	function reset() {
		pFemale = XLINKED_DEFAULTS.pFemale;
		pMale = XLINKED_DEFAULTS.pMale;
		generations = XLINKED_DEFAULTS.generations;
		data = [];
	}
</script>

<SimLayout
	title="X-Linked Locus"
	onrun={run}
	onreset={reset}
	helpKey="/mating/x-linked"
	moduleKey="/mating/x-linked"
	{currentParams}
	currentData={data}
>
	{#snippet controls()}
		<ParamInput label="p♀" bind:value={pFemale} step={0.01} min={0} max={1} />
		<ParamInput label="p♂" bind:value={pMale} step={0.01} min={0} max={1} />
		<ParamInput label="Gen" bind:value={generations} min={1} />
	{/snippet}
	{#snippet chart()}
		<Chart {data} {overlayData} />
	{/snippet}
</SimLayout>
