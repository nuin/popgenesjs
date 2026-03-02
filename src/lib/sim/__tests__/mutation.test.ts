/**
 * Scientific validation tests for mutation simulations.
 *
 * Tests verify that mutation models produce results consistent
 * with classical population genetics theory.
 */
import { describe, it, expect } from 'vitest';
import {
	simulateMutation,
	simulateIrreversibleMutation,
	MUTATION_DEFAULTS,
	IRREVERSIBLE_DEFAULTS
} from '../mutation';

describe('Two-Way Mutation Simulation', () => {
	describe('Basic properties', () => {
		it('should return trajectory and equilibrium line', () => {
			const result = simulateMutation(MUTATION_DEFAULTS);
			expect(result.length).toBe(2);
		});

		it('should start at initial frequency', () => {
			const result = simulateMutation({ ...MUTATION_DEFAULTS, initialFreq: 0.7 });
			expect(result[0][0].frequency).toBe(0.7);
		});

		it('should keep frequencies bounded between 0 and 1', () => {
			const result = simulateMutation(MUTATION_DEFAULTS);
			for (const point of result[0]) {
				expect(point.frequency).toBeGreaterThanOrEqual(0);
				expect(point.frequency).toBeLessThanOrEqual(1);
			}
		});
	});

	describe('Mutation equilibrium', () => {
		it('should converge to equilibrium p̂ = ν / (μ + ν)', () => {
			const mu = 0.01;
			const nu = 0.02;
			const expectedEquilibrium = nu / (mu + nu); // 0.667

			const result = simulateMutation({
				mu,
				nu,
				initialFreq: 0.1,
				generations: 1000
			});

			const finalFreq = result[0][result[0].length - 1].frequency;
			expect(finalFreq).toBeCloseTo(expectedEquilibrium, 2);
		});

		it('should return correct equilibrium line', () => {
			const mu = 0.001;
			const nu = 0.003;
			const expectedEquilibrium = nu / (mu + nu); // 0.75

			const result = simulateMutation({
				mu,
				nu,
				initialFreq: 0.5,
				generations: 100
			});

			// Second trajectory should be equilibrium line
			expect(result[1][0].frequency).toBeCloseTo(expectedEquilibrium, 10);
		});

		it('should converge from above equilibrium', () => {
			const mu = 0.005;
			const nu = 0.005;
			const expectedEquilibrium = 0.5;

			const result = simulateMutation({
				mu,
				nu,
				initialFreq: 0.9,
				generations: 2000
			});

			const finalFreq = result[0][result[0].length - 1].frequency;
			expect(Math.abs(finalFreq - expectedEquilibrium)).toBeLessThan(0.05);
		});

		it('should converge from below equilibrium', () => {
			const mu = 0.005;
			const nu = 0.005;
			const expectedEquilibrium = 0.5;

			const result = simulateMutation({
				mu,
				nu,
				initialFreq: 0.1,
				generations: 2000
			});

			const finalFreq = result[0][result[0].length - 1].frequency;
			expect(Math.abs(finalFreq - expectedEquilibrium)).toBeLessThan(0.05);
		});
	});

	describe('Asymmetric mutation rates', () => {
		it('should favor allele with higher back-mutation rate', () => {
			// Higher ν means more a→A, so A accumulates
			const result = simulateMutation({
				mu: 0.001,
				nu: 0.01,
				initialFreq: 0.5,
				generations: 5000
			});

			const finalFreq = result[0][result[0].length - 1].frequency;
			expect(finalFreq).toBeGreaterThan(0.8);
		});

		it('should disfavor allele with higher forward-mutation rate', () => {
			// Higher μ means more A→a, so A decreases
			const result = simulateMutation({
				mu: 0.01,
				nu: 0.001,
				initialFreq: 0.5,
				generations: 5000
			});

			const finalFreq = result[0][result[0].length - 1].frequency;
			expect(finalFreq).toBeLessThan(0.2);
		});
	});

	describe('Rate of approach to equilibrium', () => {
		it('higher mutation rates should reach equilibrium faster', () => {
			const generations = 500;

			// Low rates
			const lowResult = simulateMutation({
				mu: 0.001,
				nu: 0.001,
				initialFreq: 0.1,
				generations
			});

			// High rates
			const highResult = simulateMutation({
				mu: 0.01,
				nu: 0.01,
				initialFreq: 0.1,
				generations
			});

			const lowDist = Math.abs(lowResult[0][generations].frequency - 0.5);
			const highDist = Math.abs(highResult[0][generations].frequency - 0.5);

			// High rates should be closer to equilibrium
			expect(highDist).toBeLessThan(lowDist);
		});
	});
});

describe('Irreversible Mutation Simulation', () => {
	describe('Basic properties', () => {
		it('should return single trajectory', () => {
			const result = simulateIrreversibleMutation(IRREVERSIBLE_DEFAULTS);
			expect(result.length).toBe(1);
		});

		it('should start at initial frequency', () => {
			const result = simulateIrreversibleMutation({ ...IRREVERSIBLE_DEFAULTS, initialFreq: 0.8 });
			expect(result[0][0].frequency).toBe(0.8);
		});
	});

	describe('Exponential decay', () => {
		it('should follow p(t) = p₀(1-μ)^t', () => {
			const mu = 0.01;
			const p0 = 1.0;
			const generations = 100;

			const result = simulateIrreversibleMutation({
				mu,
				initialFreq: p0,
				generations
			});

			// Check at several time points
			for (const t of [10, 50, 100]) {
				const expected = p0 * Math.pow(1 - mu, t);
				const actual = result[0][t].frequency;
				expect(actual).toBeCloseTo(expected, 10);
			}
		});

		it('should approach zero over time', () => {
			const result = simulateIrreversibleMutation({
				mu: 0.01,
				initialFreq: 0.9,
				generations: 1000
			});

			const finalFreq = result[0][result[0].length - 1].frequency;
			expect(finalFreq).toBeLessThan(0.001);
		});

		it('should decay faster with higher mutation rate', () => {
			const generations = 100;
			const p0 = 0.9;

			const slowResult = simulateIrreversibleMutation({
				mu: 0.001,
				initialFreq: p0,
				generations
			});

			const fastResult = simulateIrreversibleMutation({
				mu: 0.01,
				initialFreq: p0,
				generations
			});

			expect(fastResult[0][generations].frequency).toBeLessThan(slowResult[0][generations].frequency);
		});
	});

	describe('Half-life calculation', () => {
		it('should reach half initial frequency at t = ln(2)/μ', () => {
			const mu = 0.01;
			const p0 = 1.0;
			// Half-life: t_half = ln(2) / (-ln(1-μ)) ≈ ln(2) / μ for small μ
			const halfLife = Math.round(Math.log(2) / mu);

			const result = simulateIrreversibleMutation({
				mu,
				initialFreq: p0,
				generations: halfLife + 10
			});

			const freqAtHalfLife = result[0][halfLife].frequency;
			// Should be approximately 0.5
			expect(freqAtHalfLife).toBeCloseTo(0.5, 1);
		});
	});
});
