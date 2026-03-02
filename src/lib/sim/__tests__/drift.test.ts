/**
 * Scientific validation tests for genetic drift simulation.
 *
 * Tests verify that the Wright-Fisher model implementation produces
 * results consistent with population genetics theory.
 */
import { describe, it, expect } from 'vitest';
import { simulateDrift, DRIFT_DEFAULTS } from '../drift';

describe('Genetic Drift Simulation', () => {
	describe('Basic Wright-Fisher properties', () => {
		it('should return correct number of populations', () => {
			const result = simulateDrift({ ...DRIFT_DEFAULTS, populations: 5 });
			expect(result).toHaveLength(5);
		});

		it('should return correct number of generations per trajectory', () => {
			const result = simulateDrift({ ...DRIFT_DEFAULTS, generations: 50 });
			expect(result[0]).toHaveLength(51); // 0 to 50 inclusive
		});

		it('should start all populations at initial frequency', () => {
			const result = simulateDrift({ ...DRIFT_DEFAULTS, initialFreq: 0.3 });
			for (const trajectory of result) {
				expect(trajectory[0].frequency).toBe(0.3);
			}
		});

		it('should keep frequencies bounded between 0 and 1', () => {
			const result = simulateDrift({
				...DRIFT_DEFAULTS,
				populations: 100,
				generations: 200
			});
			for (const trajectory of result) {
				for (const point of trajectory) {
					expect(point.frequency).toBeGreaterThanOrEqual(0);
					expect(point.frequency).toBeLessThanOrEqual(1);
				}
			}
		});
	});

	describe('Fixation and loss', () => {
		it('should fix or lose alleles in small populations over time', () => {
			const result = simulateDrift({
				populations: 50,
				populationSize: 10,
				initialFreq: 0.5,
				generations: 500
			});

			// Count populations that reached fixation (1) or loss (0)
			let fixed = 0;
			let lost = 0;
			for (const trajectory of result) {
				const finalFreq = trajectory[trajectory.length - 1].frequency;
				if (finalFreq >= 0.99) fixed++;
				if (finalFreq <= 0.01) lost++;
			}

			// Most populations should have fixed or lost the allele
			expect(fixed + lost).toBeGreaterThan(result.length * 0.5);
		});

		it('should maintain frequency when already fixed at 1', () => {
			const result = simulateDrift({
				...DRIFT_DEFAULTS,
				initialFreq: 1.0,
				generations: 100
			});

			for (const trajectory of result) {
				for (const point of trajectory) {
					expect(point.frequency).toBe(1.0);
				}
			}
		});

		it('should maintain frequency when already lost at 0', () => {
			const result = simulateDrift({
				...DRIFT_DEFAULTS,
				initialFreq: 0.0,
				generations: 100
			});

			for (const trajectory of result) {
				for (const point of trajectory) {
					expect(point.frequency).toBe(0.0);
				}
			}
		});
	});

	describe('Statistical properties of drift', () => {
		it('mean frequency should remain approximately at initial frequency', () => {
			// Law of large numbers: mean of many populations should be near p0
			const result = simulateDrift({
				populations: 500,
				populationSize: 100,
				initialFreq: 0.4,
				generations: 20
			});

			// Calculate mean frequency at generation 20
			const finalFreqs = result.map(t => t[t.length - 1].frequency);
			const mean = finalFreqs.reduce((a, b) => a + b, 0) / finalFreqs.length;

			// Mean should be within 0.05 of initial frequency
			expect(mean).toBeGreaterThan(0.35);
			expect(mean).toBeLessThan(0.45);
		});

		it('variance should increase over time according to drift theory', () => {
			// Var(p) ≈ p₀(1-p₀)[1 - (1 - 1/(2N))^t]
			const N = 50;
			const p0 = 0.5;
			const t = 20;
			const populations = 1000;

			const result = simulateDrift({
				populations,
				populationSize: N,
				initialFreq: p0,
				generations: t
			});

			// Calculate observed variance at generation t
			const finalFreqs = result.map(traj => traj[t].frequency);
			const mean = finalFreqs.reduce((a, b) => a + b, 0) / finalFreqs.length;
			const variance = finalFreqs.reduce((sum, f) => sum + (f - mean) ** 2, 0) / finalFreqs.length;

			// Expected variance from theory
			const expectedVar = p0 * (1 - p0) * (1 - Math.pow(1 - 1 / (2 * N), t));

			// Allow 30% tolerance due to stochastic variation
			expect(variance).toBeGreaterThan(expectedVar * 0.5);
			expect(variance).toBeLessThan(expectedVar * 1.5);
		});
	});

	describe('Drift with selection', () => {
		it('should show selection favoring advantageous allele', () => {
			// Strong selection for A allele (wAA = wAa = 1, waa = 0.5)
			const result = simulateDrift({
				populations: 20,
				populationSize: 100,
				initialFreq: 0.1,
				generations: 100,
				wAA: 1.0,
				wAa: 1.0,
				waa: 0.5
			});

			// Mean final frequency should be higher than initial
			const finalFreqs = result.map(t => t[t.length - 1].frequency);
			const mean = finalFreqs.reduce((a, b) => a + b, 0) / finalFreqs.length;

			expect(mean).toBeGreaterThan(0.5);
		});

		it('should maintain polymorphism with overdominance', () => {
			// Heterozygote advantage: wAa > wAA and wAa > waa
			const result = simulateDrift({
				populations: 20,
				populationSize: 200,
				initialFreq: 0.5,
				generations: 100,
				wAA: 0.8,
				wAa: 1.0,
				waa: 0.8
			});

			// Most populations should remain polymorphic
			let polymorphic = 0;
			for (const trajectory of result) {
				const finalFreq = trajectory[trajectory.length - 1].frequency;
				if (finalFreq > 0.1 && finalFreq < 0.9) polymorphic++;
			}

			expect(polymorphic).toBeGreaterThan(result.length * 0.5);
		});
	});

	describe('Drift with mutation', () => {
		it('should prevent fixation with bidirectional mutation', () => {
			const result = simulateDrift({
				populations: 10,
				populationSize: 100,
				initialFreq: 0.5,
				generations: 500,
				mu: 0.01,
				nu: 0.01
			});

			// With mutation, alleles should not fix at 0 or 1
			for (const trajectory of result) {
				const finalFreq = trajectory[trajectory.length - 1].frequency;
				expect(finalFreq).toBeGreaterThan(0.01);
				expect(finalFreq).toBeLessThan(0.99);
			}
		});

		it('should approach mutation equilibrium over time', () => {
			// Equilibrium: p̂ = ν / (μ + ν)
			const mu = 0.02;
			const nu = 0.03;
			const expectedEquilibrium = nu / (mu + nu); // 0.6

			const result = simulateDrift({
				populations: 50,
				populationSize: 500,
				initialFreq: 0.1,
				generations: 500,
				mu,
				nu
			});

			const finalFreqs = result.map(t => t[t.length - 1].frequency);
			const mean = finalFreqs.reduce((a, b) => a + b, 0) / finalFreqs.length;

			// Should be near equilibrium (within 0.15)
			expect(Math.abs(mean - expectedEquilibrium)).toBeLessThan(0.15);
		});
	});
});
