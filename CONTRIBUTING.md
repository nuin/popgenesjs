# Contributing to PopGeneJS

Thank you for your interest in contributing to PopGeneJS! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/popgenesjs.git
   cd popgenesjs
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development

Start the development server:
```bash
npm run dev
```

Run type checking:
```bash
npm run check
```

Build for production:
```bash
npm run build
```

## Code Style

- **TypeScript**: Strict mode is enabled. All code must pass type checking.
- **Svelte 5**: Use runes (`$state`, `$derived`, `$effect`, `$props`) instead of legacy reactive syntax.
- **Formatting**: Follow existing code style. Use tabs for indentation.

## Architecture Guidelines

PopGeneJS follows a strict three-layer separation:

1. **Simulation functions** (`src/lib/sim/*.ts`)
   - Pure TypeScript functions with no DOM or Svelte dependencies
   - Export a params interface, defaults constant, and simulation function
   - Return `SimPoint[][]` (array of trajectories)

2. **Chart renderers** (`src/lib/charts/*.ts`)
   - D3.js functions that take a DOM element and data
   - Read theme colors from CSS custom properties at render time

3. **Page components** (`src/routes/*/+page.svelte`)
   - Thin wrappers composing simulation logic and UI components
   - Use `SimLayout` for consistent page structure

## Adding a New Simulation Module

1. Create the simulation function in `src/lib/sim/`:
   ```typescript
   export interface MySimParams {
     // parameters
   }

   export const MYSIM_DEFAULTS: MySimParams = {
     // default values
   };

   export function simulateMySim(params: MySimParams): SimResult {
     // implementation
   }
   ```

2. Create the route page in `src/routes/my-sim/+page.svelte`

3. Add help content in `src/lib/help/` (see existing files for structure)

4. Add the module to the landing page in `src/routes/+page.svelte`

## Reporting Bugs

Open an issue with:
- A clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information

## Requesting Features

Open an issue describing:
- The proposed feature
- Why it would be useful for population genetics education
- Any relevant references or prior art

## Submitting Changes

1. Ensure your code passes type checking: `npm run check`
2. Test your changes in both dark and light themes
3. Test responsive behavior (resize browser window)
4. Commit with a clear message describing the change
5. Push to your fork and open a pull request

## Questions?

Open an issue or contact the maintainer at nuin@genedrift.org.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
