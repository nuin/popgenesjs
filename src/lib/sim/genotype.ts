import type { CurveData } from '$lib/charts/curveChart';

const STEPS = 200;

/**
 * Generate Hardy-Weinberg genotype frequency curves.
 * Returns 3 curves: p² (AA), 2pq (Aa), q² (aa)
 * as functions of allele frequency p from 0 to 1.
 */
export function generateGenotypeCurves(): CurveData[] {
	const curveAA: CurveData = { points: [], label: 'p² (AA)' };
	const curveAa: CurveData = { points: [], label: '2pq (Aa)' };
	const curveaa: CurveData = { points: [], label: 'q² (aa)' };

	for (let i = 0; i <= STEPS; i++) {
		const p = i / STEPS;
		const q = 1 - p;
		curveAA.points.push({ x: p, y: p * p });
		curveAa.points.push({ x: p, y: 2 * p * q });
		curveaa.points.push({ x: p, y: q * q });
	}

	return [curveAA, curveAa, curveaa];
}
