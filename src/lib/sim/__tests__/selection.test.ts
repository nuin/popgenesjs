/**
 * Scientific validation tests for natural selection simulation.
 *
 * Tests verify that selection models produce results consistent
 * with classical population genetics theory.
 */
import { describe, it, expect } from 'vitest';
import { simulateSelection, SELECTION_DEFAULTS } from '../selection';

describe('Natural Selection Simulation', () => {
	describe('Basic selection properties', () => {
		it('should return at least one trajectory', () => {
			const result = simulateSelection(SELECTION_DEFAULTS);
			expect(result.length).toBeGreaterThanOrEqual(1);
		});

		it('should start at initial frequency', () => {
			const result = simulateSelection({ ...SELECTION_DEFAULTS, initialFreq: 0.3 });
			expect(result[0][0].frequency).toBe(0.3);
		});

		it('should keep frequencies bounded between 0 and 1', () => {
			const result = simulateSelection(SELECTION_DEFAULTS);
			for (const point of result[0]) {
				expect(point.frequency).toBeGreaterThanOrEqual(0);
				expect(point.frequency).toBeLessThanOrEqual(1);
			}
		});
	});

	describe('Directional selection', () => {
		it('should increase frequency when A is favored (wAA = wAa > waa)', () => {
			const result = simulateSelection({
				wAA: 1.0,
				wAa: 1.0,
				waa: 0.8,
				initialFreq: 0.1,
				generations: 200
			});

			const trajectory = result[0];
			const finalFreq = trajectory[trajectory.length - 1].frequency;

			// A should approach fixation
			expect(finalFreq).toBeGreaterThan(0.9);
		});

		it('should decrease frequency when A is disfavored (waa > wAA = wAa)', () => {
			const result = simulateSelection({
				wAA: 0.8,
				wAa: 0.8,
				waa: 1.0,
				initialFreq: 0.9,
				generations: 200
			});

			const trajectory = result[0];
			const finalFreq = trajectory[trajectory.length - 1].frequency;

			// A should approach loss
			expect(finalFreq).toBeLessThan(0.1);
		});

		it('should fix dominant advantageous allele', () => {
			// Complete dominance: wAA = wAa > waa
			const result = simulateSelection({
				wAA: 1.0,
				wAa: 1.0,
				waa: 0.5,
				initialFreq: 0.01,
				generations: 500
			});

			const trajectory = result[0];
			const finalFreq = trajectory[trajectory.length - 1].frequency;

			expect(finalFreq).toBeGreaterThan(0.95);
		});
	});

	describe('Equilibrium with overdominance', () => {
		it('should converge to equilibrium with heterozygote advantage', () => {
			// Overdominance: wAa > wAA and wAa > waa
			// Equilibrium: p̂ = (wAa - waa) / (2wAa - wAA - waa)
			const wAA = 0.8;
			const wAa = 1.0;
			const waa = 0.6;
			const expectedEquilibrium = (wAa - waa) / (2 * wAa - wAA - waa);
			// (1.0 - 0.6) / (2.0 - 0.8 - 0.6) = 0.4 / 0.6 = 0.667

			const result = simulateSelection({
				wAA,
				wAa,
				waa,
				initialFreq: 0.1,
				generations: 300
			});

			const trajectory = result[0];
			const finalFreq = trajectory[trajectory.length - 1].frequency;

			// Should converge to equilibrium
			expect(Math.abs(finalFreq - expectedEquilibrium)).toBeLessThan(0.01);
		});

		it('should return equilibrium line for overdominance case', () => {
			const wAA = 0.8;
			const wAa = 1.0;
			const waa = 0.6;
			const expectedEquilibrium = (wAa - waa) / (2 * wAa - wAA - waa);

			const result = simulateSelection({
				wAA,
				wAa,
				waa,
				initialFreq: 0.5,
				generations: 100
			});

			// Should have two trajectories: main + equilibrium line
			expect(result.length).toBe(2);

			// Equilibrium line should be at correct frequency
			const eqLine = result[1];
			expect(eqLine[0].frequency).toBeCloseTo(expectedEquilibrium, 5);
			expect(eqLine[1].frequency).toBeCloseTo(expectedEquilibrium, 5);
		});

		it('should converge from different starting points', () => {
			const wAA = 0.7;
			const wAa = 1.0;
			const waa = 0.8;
			const expectedEquilibrium = (wAa - waa) / (2 * wAa - wAA - waa);

			// Start from low frequency
			const resultLow = simulateSelection({
				wAA,
				wAa,
				waa,
				initialFreq: 0.1,
				generations: 500
			});

			// Start from high frequency
			const resultHigh = simulateSelection({
				wAA,
				wAa,
				waa,
				initialFreq: 0.9,
				generations: 500
			});

			const finalLow = resultLow[0][resultLow[0].length - 1].frequency;
			const finalHigh = resultHigh[0][resultHigh[0].length - 1].frequency;

			// Both should converge to same equilibrium
			expect(Math.abs(finalLow - expectedEquilibrium)).toBeLessThan(0.02);
			expect(Math.abs(finalHigh - expectedEquilibrium)).toBeLessThan(0.02);
		});
	});

	describe('Underdominance (unstable equilibrium)', () => {
		it('should fix at 1 when starting above equilibrium', () => {
			// Underdominance: wAa < wAA and wAa < waa
			const wAA = 1.0;
			const wAa = 0.7;
			const waa = 1.0;
			const equilibrium = (wAa - waa) / (2 * wAa - wAA - waa); // 0.5

			const result = simulateSelection({
				wAA,
				wAa,
				waa,
				initialFreq: 0.6, // above equilibrium
				generations: 200
			});

			const finalFreq = result[0][result[0].length - 1].frequency;
			expect(finalFreq).toBeGreaterThan(0.95);
		});

		it('should fix at 0 when starting below equilibrium', () => {
			const wAA = 1.0;
			const wAa = 0.7;
			const waa = 1.0;

			const result = simulateSelection({
				wAA,
				wAa,
				waa,
				initialFreq: 0.4, // below equilibrium
				generations: 200
			});

			const finalFreq = result[0][result[0].length - 1].frequency;
			expect(finalFreq).toBeLessThan(0.05);
		});
	});

	describe('Neutral evolution', () => {
		it('should maintain frequency when all fitnesses are equal', () => {
			const result = simulateSelection({
				wAA: 1.0,
				wAa: 1.0,
				waa: 1.0,
				initialFreq: 0.5,
				generations: 100
			});

			// Frequency should remain constant
			for (const point of result[0]) {
				expect(point.frequency).toBeCloseTo(0.5, 10);
			}
		});

		it('should not add equilibrium line when no overdominance/underdominance', () => {
			// Directional selection case
			const result = simulateSelection({
				wAA: 1.0,
				wAa: 1.0,
				waa: 0.8,
				initialFreq: 0.5,
				generations: 100
			});

			// Should only have main trajectory, no equilibrium line
			// (equilibrium p̂ = (1.0 - 0.8) / (2.0 - 1.0 - 0.8) = 0.2/0.2 = 1.0, outside 0-1)
			expect(result.length).toBe(1);
		});
	});

	describe('Selection coefficient relationships', () => {
		it('stronger selection should lead to faster frequency change', () => {
			// Weak selection
			const weakResult = simulateSelection({
				wAA: 1.0,
				wAa: 1.0,
				waa: 0.95,
				initialFreq: 0.1,
				generations: 50
			});

			// Strong selection
			const strongResult = simulateSelection({
				wAA: 1.0,
				wAa: 1.0,
				waa: 0.5,
				initialFreq: 0.1,
				generations: 50
			});

			const weakFinal = weakResult[0][50].frequency;
			const strongFinal = strongResult[0][50].frequency;

			// Strong selection should increase frequency more
			expect(strongFinal).toBeGreaterThan(weakFinal);
		});
	});
});
