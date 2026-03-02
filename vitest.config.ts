import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.ts'],
		environment: 'node',
		coverage: {
			provider: 'v8',
			include: ['src/lib/sim/**/*.ts'],
			exclude: ['src/lib/sim/types.ts']
		}
	}
});
