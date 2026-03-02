/**
 * Scientific validation tests for Hardy-Weinberg equilibrium and F-statistics.
 *
 * Tests verify that HWE calculations and F-statistics produce results
 * consistent with classical population genetics theory.
 */
import { describe, it, expect } from 'vitest';
import { computeChiSquare } from '../chi-square';
import { computeWahlund } from '../wahlund';
import { simulateHtime } from '../htime';

describe('Chi-Square HWE Test', () => {
	describe('Basic calculations', () => {
		it('should calculate correct allele frequencies', () => {
			// 100 AA, 200 Aa, 100 aa → p = (100 + 100) / 400 = 0.5
			const result = computeChiSquare({ nAA: 100, nAa: 200, naa: 100 });

			expect(result.p).toBeCloseTo(0.5, 10);
			expect(result.q).toBeCloseTo(0.5, 10);
			expect(result.total).toBe(400);
		});

		it('should calculate expected HWE frequencies correctly', () => {
			const result = computeChiSquare({ nAA: 100, nAa: 200, naa: 100 });

			// p = 0.5, q = 0.5
			// Expected: p² = 0.25, 2pq = 0.5, q² = 0.25
			expect(result.expFreq[0]).toBeCloseTo(0.25, 10);
			expect(result.expFreq[1]).toBeCloseTo(0.5, 10);
			expect(result.expFreq[2]).toBeCloseTo(0.25, 10);
		});

		it('should calculate expected counts correctly', () => {
			const result = computeChiSquare({ nAA: 100, nAa: 200, naa: 100 });

			// Total = 400, p = q = 0.5
			// Expected: 100 AA, 200 Aa, 100 aa
			expect(result.expCount[0]).toBeCloseTo(100, 10);
			expect(result.expCount[1]).toBeCloseTo(200, 10);
			expect(result.expCount[2]).toBeCloseTo(100, 10);
		});
	});

	describe('Chi-square statistic', () => {
		it('should return χ² = 0 for perfect HWE', () => {
			// Exactly at HWE: 25 AA, 50 Aa, 25 aa (p = 0.5)
			const result = computeChiSquare({ nAA: 25, nAa: 50, naa: 25 });

			expect(result.chiTotal).toBeCloseTo(0, 10);
			expect(result.significant).toBe(false);
		});

		it('should detect heterozygote excess', () => {
			// Excess heterozygotes: 20 AA, 60 Aa, 20 aa
			// p = (20 + 30) / 100 = 0.5
			// Expected: 25 AA, 50 Aa, 25 aa
			const result = computeChiSquare({ nAA: 20, nAa: 60, naa: 20 });

			expect(result.chiTotal).toBeGreaterThan(0);
			// χ² = (20-25)²/25 + (60-50)²/50 + (20-25)²/25 = 1 + 2 + 1 = 4
			expect(result.chiTotal).toBeCloseTo(4, 5);
			expect(result.significant).toBe(true); // 4 > 3.841
		});

		it('should detect heterozygote deficiency', () => {
			// Deficient heterozygotes: 30 AA, 40 Aa, 30 aa
			// p = (30 + 20) / 100 = 0.5
			// Expected: 25 AA, 50 Aa, 25 aa
			const result = computeChiSquare({ nAA: 30, nAa: 40, naa: 30 });

			expect(result.chiTotal).toBeGreaterThan(0);
			// χ² = (30-25)²/25 + (40-50)²/50 + (30-25)²/25 = 1 + 2 + 1 = 4
			expect(result.chiTotal).toBeCloseTo(4, 5);
			expect(result.significant).toBe(true);
		});

		it('should use df = 1 and critical value 3.841', () => {
			const result = computeChiSquare({ nAA: 100, nAa: 200, naa: 100 });

			expect(result.df).toBe(1);
			expect(result.critical).toBe(3.841);
		});
	});

	describe('Edge cases', () => {
		it('should handle extreme allele frequencies', () => {
			// p close to 1
			const result = computeChiSquare({ nAA: 90, nAa: 9, naa: 1 });

			expect(result.p).toBeCloseTo(0.945, 2);
			expect(result.q).toBeCloseTo(0.055, 2);
		});
	});
});

describe('Wahlund Effect', () => {
	describe('Basic calculations', () => {
		it('should calculate correct average allele frequency', () => {
			const result = computeWahlund({
				pops: [0.2, 0.4, 0.6, 0.8],
				f: 0
			});

			expect(result.avgP).toBeCloseTo(0.5, 10);
		});

		it('should calculate correct variance in allele frequency', () => {
			// Var = [(0.2-0.5)² + (0.4-0.5)² + (0.6-0.5)² + (0.8-0.5)²] / 4
			// = [0.09 + 0.01 + 0.01 + 0.09] / 4 = 0.05
			const result = computeWahlund({
				pops: [0.2, 0.4, 0.6, 0.8],
				f: 0
			});

			expect(result.varP).toBeCloseTo(0.05, 10);
		});
	});

	describe('Wahlund principle', () => {
		it('should show heterozygote deficiency when subpopulations differ', () => {
			const result = computeWahlund({
				pops: [0.1, 0.9],
				f: 0
			});

			// Expected (from pooled p̄ = 0.5): 2pq = 0.5
			// Observed (average of subpops): 2*0.1*0.9 + 2*0.9*0.1 / 2 = 0.18
			expect(result.observedAa).toBeLessThan(result.expectedAa);
		});

		it('should show no deficiency when all subpopulations have same frequency', () => {
			const result = computeWahlund({
				pops: [0.5, 0.5, 0.5, 0.5],
				f: 0
			});

			expect(result.observedAa).toBeCloseTo(result.expectedAa, 10);
			expect(result.Fst).toBeCloseTo(0, 10);
		});
	});

	describe('F-statistics calculations', () => {
		it('should calculate Fst = Var(p) / (p̄(1-p̄))', () => {
			const result = computeWahlund({
				pops: [0.2, 0.4, 0.6, 0.8],
				f: 0
			});

			// Var(p) = 0.05, p̄ = 0.5
			// Fst = 0.05 / (0.5 * 0.5) = 0.2
			expect(result.Fst).toBeCloseTo(0.2, 10);
		});

		it('should set Fis equal to inbreeding coefficient f', () => {
			const result = computeWahlund({
				pops: [0.3, 0.7],
				f: 0.1
			});

			expect(result.Fis).toBe(0.1);
		});

		it('should calculate Fit = 1 - (1-Fst)(1-Fis)', () => {
			const result = computeWahlund({
				pops: [0.2, 0.8],
				f: 0.1
			});

			// Var(p) = 0.09, p̄ = 0.5
			// Fst = 0.09 / 0.25 = 0.36
			// Fit = 1 - (1-0.36)(1-0.1) = 1 - 0.64*0.9 = 1 - 0.576 = 0.424
			const expectedFit = 1 - (1 - result.Fst) * (1 - result.Fis);
			expect(result.Fit).toBeCloseTo(expectedFit, 10);
		});

		it('should satisfy Fit ≥ Fst when Fis ≥ 0', () => {
			const result = computeWahlund({
				pops: [0.1, 0.3, 0.5, 0.7, 0.9],
				f: 0.05
			});

			expect(result.Fit).toBeGreaterThanOrEqual(result.Fst);
		});
	});

	describe('Inbreeding effects', () => {
		it('should reduce heterozygosity with inbreeding', () => {
			const noInbreeding = computeWahlund({ pops: [0.5], f: 0 });
			const withInbreeding = computeWahlund({ pops: [0.5], f: 0.2 });

			expect(withInbreeding.observedAa).toBeLessThan(noInbreeding.observedAa);
		});

		it('should calculate genotype frequencies with inbreeding correctly', () => {
			// With f: freq(Aa) = 2pq(1-f)
			const result = computeWahlund({ pops: [0.5], f: 0.25 });

			// p = 0.5, expected Aa = 2*0.5*0.5*(1-0.25) = 0.375
			expect(result.observedAa).toBeCloseTo(0.375, 10);
		});
	});
});

describe('Heterozygosity Decline (H-time)', () => {
	describe('Deterministic curve', () => {
		it('should start at H₀ = 2p(1-p)', () => {
			const p = 0.4;
			const expectedH0 = 2 * p * (1 - p);

			const result = simulateHtime({
				Ne: 100,
				p,
				generations: 10,
				nDrift: 0
			});

			expect(result[0][0].frequency).toBeCloseTo(expectedH0, 10);
		});

		it('should follow H(t) = H₀(1 - 1/(2Ne))^t', () => {
			const Ne = 50;
			const p = 0.5;
			const generations = 100;
			const H0 = 2 * p * (1 - p);
			const factor = 1 - 1 / (2 * Ne);

			const result = simulateHtime({
				Ne,
				p,
				generations,
				nDrift: 0
			});

			// Check at several time points
			for (const t of [10, 50, 100]) {
				const expected = H0 * Math.pow(factor, t);
				expect(result[0][t].frequency).toBeCloseTo(expected, 10);
			}
		});

		it('should decline faster with smaller Ne', () => {
			const generations = 50;

			const largeNe = simulateHtime({
				Ne: 500,
				p: 0.5,
				generations,
				nDrift: 0
			});

			const smallNe = simulateHtime({
				Ne: 20,
				p: 0.5,
				generations,
				nDrift: 0
			});

			// Smaller Ne should have lower H at end
			expect(smallNe[0][generations].frequency).toBeLessThan(largeNe[0][generations].frequency);
		});
	});

	describe('Stochastic overlay', () => {
		it('should return correct number of trajectories', () => {
			const result = simulateHtime({
				Ne: 50,
				p: 0.5,
				generations: 20,
				nDrift: 5
			});

			// 1 deterministic + 5 stochastic
			expect(result.length).toBe(6);
		});

		it('stochastic trajectories should have valid heterozygosity values', () => {
			const result = simulateHtime({
				Ne: 50,
				p: 0.5,
				generations: 50,
				nDrift: 10
			});

			for (let i = 1; i < result.length; i++) {
				for (const point of result[i]) {
					expect(point.frequency).toBeGreaterThanOrEqual(0);
					expect(point.frequency).toBeLessThanOrEqual(0.5); // max H = 2*0.5*0.5 = 0.5
				}
			}
		});
	});
});
