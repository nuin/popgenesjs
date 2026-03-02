# PopGeneJS

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Live Site](https://img.shields.io/badge/Live-popgenejs.bioinformat.org-green)](https://popgenejs.bioinformat.org)

A web-based population genetics simulation suite for teaching and research. Runs entirely in the browser — no server, no installation, no data uploaded.

**Live**: [popgenejs.bioinformat.org](https://popgenejs.bioinformat.org)

## Background

PopGeneJS is a complete reimplementation of [PopGene.S](https://github.com/nuin/popgenes2/tree/master/PopGene.S), a Visual Basic .NET desktop application originally developed for population genetics education. The web version preserves the same models and pedagogical approach while making them accessible from any modern browser on any device.

All simulations run client-side as pure TypeScript functions. Visualizations are rendered with D3.js and respond to theme changes and window resizes in real time.

## Installation

```bash
# Clone the repository
git clone https://github.com/nuin/popgenesjs.git
cd popgenesjs

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Simulation Modules

32 interactive modules across 8 categories:

### Allele & Genotype Frequencies
| Module | Description |
|--------|-------------|
| **De Finetti Parabola** | Plot genotype frequencies on a ternary diagram against the Hardy-Weinberg equilibrium parabola |
| **Genotype Frequencies** | Calculate expected genotype frequencies from allele frequencies under HWE |
| **Chi-Square HWE Test** | Test observed genotype counts against Hardy-Weinberg expectations |

### Genetic Drift
| Module | Description |
|--------|-------------|
| **Pure Drift** | Wright-Fisher model — binomial sampling of alleles across generations |
| **Drift + Selection** | Drift with deterministic selection (fitness coefficients wAA, wAa, waa) |
| **Drift + Mutation** | Drift with forward and reverse mutation pressure |
| **Drift + Selection + Mutation** | Combined model with all three evolutionary forces |
| **Markov Chain Drift** | Transition matrix approach showing absorption probabilities |
| **Heterozygosity Decline** | Track expected heterozygosity loss over generations (H_t = H_0 × (1 - 1/2N)^t) |
| **Bottleneck** | Population crash and recovery demonstrating genetic diversity loss |
| **Founder Effect** | Multiple independent colonization events showing variance among founded populations |

### Natural Selection
| Module | Description |
|--------|-------------|
| **Natural Selection** | Deterministic allele frequency change under selection with equilibrium lines for overdominance/underdominance |
| **Frequency-Dependent** | Selection where fitness depends on allele frequency in the population |
| **Dominance and Selection** | Explore dominance coefficient (h) effects with multi-trajectory comparison |

### Mutation
| Module | Description |
|--------|-------------|
| **Two-Way Mutation** | Reversible mutation (A↔a) with equilibrium frequency p̂ = ν/(μ+ν) |
| **Irreversible Mutation** | One-way mutation (A→a) showing exponential decay of the dominant allele |
| **Neutral Mutations** | Infinite-sites neutral mutation accumulation |
| **Muller's Ratchet** | Irreversible accumulation of deleterious mutations in finite asexual populations |

### Mating Models
| Module | Description |
|--------|-------------|
| **Autosomal Locus** | Genotype frequency changes under different mating systems |
| **X-Linked Locus** | Allele frequency dynamics for X-linked loci with sex-specific inheritance |
| **Assortative Mating** | Positive and negative assortative mating effects on genotype frequencies |
| **Assortative Matrix** | Full mating-type matrix showing all possible crosses and offspring frequencies |

### Gene Flow & Population Structure
| Module | Description |
|--------|-------------|
| **Continent-Island Model** | One-way migration from a large source to a smaller population |
| **Island-Island Model** | Symmetric migration between two populations |
| **Stepping-Stone Model** | Migration between adjacent populations in a linear array |
| **F-Statistics** | Wright's F_ST, F_IS, and F_IT with drift and migration |
| **Wahlund Effect** | Heterozygote deficiency from population subdivision |

### Gametic Disequilibrium
| Module | Description |
|--------|-------------|
| **Linkage Disequilibrium** | Measure and visualize D, D', and r² between two loci |
| **Magnitude of D** | Maximum and minimum values of D given allele frequencies |
| **Linkage Histogram** | Distribution of D values across replicate populations |

### Advanced
| Module | Description |
|--------|-------------|
| **Molecular Pop Gen** | Summary statistics from sequence data: Watterson's θ, π, Tajima's D |
| **Quantitative Trait Loci** | Multi-locus trait evolution with environmental variance and stabilizing selection |

## Features

- **No installation required** — runs entirely in the browser
- **Cross-platform** — works on Windows, macOS, Linux, tablets, and smartphones
- **Dark and light themes** — automatic chart adaptation
- **Run comparison system** — save parameter sets and overlay multiple trajectories
- **Export capabilities** — download charts and data
- **Offline support** — works without internet once cached
- **Privacy-preserving** — all computation happens client-side

## Tech Stack

- **[SvelteKit](https://svelte.dev/docs/kit)** — Framework with file-based routing and static prerendering
- **[Svelte 5](https://svelte.dev/docs/svelte)** — Runes reactivity system (`$state`, `$derived`, `$effect`, `$props`)
- **[D3.js v7](https://d3js.org/)** — SVG chart rendering with animated line drawing
- **[TypeScript](https://www.typescriptlang.org/)** — Strict mode throughout
- **[Vite](https://vite.dev/)** — Build tool and dev server
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — Static hosting

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot module replacement |
| `npm run build` | Production build (static output to `build/`) |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Run TypeScript type checking |
| `npm run check:watch` | Type checking in watch mode |
| `npm run deploy` | Build and deploy to Cloudflare Pages |

## Project Structure

```
src/
  lib/
    sim/          Pure simulation functions (no DOM, no Svelte)
    charts/       D3 chart renderers (line, drift, De Finetti, curve, histogram)
    components/   Shared Svelte 5 components
    help/         Educational content for each module
    theme.ts      Dark/light theme store
  routes/         SvelteKit file-based routing (one directory per module)
  app.css         Design tokens for dark and light themes
  app.html        HTML shell
PopGene.S/        Original VB.NET desktop application (reference)
docs/paper/       Manuscript and figures
```

### Architecture

The codebase follows a strict three-layer separation:

1. **Simulation layer** (`lib/sim/*.ts`) — Pure functions that accept parameter objects and return arrays of trajectories (`SimPoint[][]`). No DOM access, no framework imports. Each module exports a typed params interface, a defaults constant, and a simulation function.

2. **Visualization layer** (`lib/charts/*.ts`) — D3 rendering functions that take a DOM container and data. They read theme colors from CSS custom properties at render time, so charts automatically adapt to dark/light mode.

3. **UI layer** (`routes/*/+page.svelte`) — Thin page components that wire reactive state to simulation functions and chart components. All pages share the same `SimLayout` component which provides the topbar controls, Run/Reset buttons, and full-bleed chart area.

This separation enables potential reuse of simulation code in other contexts such as R packages or command-line tools.

### Theming

Two themes (dark default, light toggle) defined entirely through CSS custom properties in `app.css`. Eight visualization colors (`--viz-1` through `--viz-8`) cycle for multi-series charts. D3 renderers read these at render time via `getComputedStyle`, so switching themes re-renders all charts without page reload.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- **Report bugs**: Open an issue describing the problem and steps to reproduce
- **Request features**: Open an issue describing the desired functionality
- **Submit changes**: Fork the repo, create a branch, and submit a pull request

## Citation

If you use PopGeneJS in your teaching or research, please cite:

```bibtex
@article{nuin2026popgenejs,
  author = {Nuin, Paulo A. S.},
  title = {{PopGeneJS}: A Browser-Based Platform for Population Genetics Education},
  journal = {Journal of Open Source Software},
  year = {2026},
  note = {Software available at https://popgenejs.bioinformat.org}
}
```

## Related Work

- **WinPop 2.5** — Original desktop application (Nuin, 2005)
- **[Genie](https://cartwrig.ht/apps/genie/)** — Interactive genetic drift simulation (Castillo et al., 2022)
- **[HHMI Population Genetics Explorer](https://www.biointeractive.org/classroom-resources/population-genetics-explorer)** — Hardy-Weinberg focused teaching tool

## License

[MIT](LICENSE)

## Author

**Paulo A. S. Nuin**
Bioinformat, Edmonton, Alberta, Canada
Email: nuin@genedrift.org
