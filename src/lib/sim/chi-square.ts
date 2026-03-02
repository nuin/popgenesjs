export interface ChiSquareInput {
	nAA: number;
	nAa: number;
	naa: number;
}

export interface ChiSquareResult {
	total: number;
	p: number;
	q: number;
	obsFreq: [number, number, number];
	expFreq: [number, number, number];
	expCount: [number, number, number];
	chiParts: [number, number, number];
	chiTotal: number;
	df: number;
	critical: number;
	significant: boolean;
}

/**
 * Chi-square test for Hardy-Weinberg equilibrium.
 * df = 1, critical value = 3.841 (α = 0.05)
 */
export function computeChiSquare(input: ChiSquareInput): ChiSquareResult {
	const { nAA, nAa, naa } = input;
	const total = nAA + nAa + naa;

	// Allele frequency: p = (2*AA + Aa) / (2*total)
	// Each AA contributes 2 A alleles, each Aa contributes 1
	const p = (2 * nAA + nAa) / (2 * total);
	const q = 1 - p;

	const obsFreq: [number, number, number] = [nAA / total, nAa / total, naa / total];
	const expFreq: [number, number, number] = [p * p, 2 * p * q, q * q];
	const expCount: [number, number, number] = [
		p * p * total,
		2 * p * q * total,
		q * q * total
	];

	// Guard against division by zero when expected count is 0
	const chiParts: [number, number, number] = [
		expCount[0] > 0 ? (nAA - expCount[0]) ** 2 / expCount[0] : 0,
		expCount[1] > 0 ? (nAa - expCount[1]) ** 2 / expCount[1] : 0,
		expCount[2] > 0 ? (naa - expCount[2]) ** 2 / expCount[2] : 0
	];

	const chiTotal = chiParts[0] + chiParts[1] + chiParts[2];

	return {
		total,
		p,
		q,
		obsFreq,
		expFreq,
		expCount,
		chiParts,
		chiTotal,
		df: 1,
		critical: 3.841,
		significant: chiTotal > 3.841
	};
}
