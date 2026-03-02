import type { HelpContent } from './types';

export const driftContent: Record<string, HelpContent> = {
	'/drift': {
		title: 'Genetic Drift',
		category: 'Drift',
		description:
			'Simulates random changes in allele frequency due to finite population size. Each generation, alleles are sampled from the parent population using binomial sampling, mimicking the stochastic nature of reproduction in real populations. This is the foundational null model in population genetics against which other evolutionary forces are measured.',
		formulas: [
			{
				label: 'Binomial sampling',
				html: 'Number of A alleles in next generation: <var>k</var> ~ Binomial(2<var>N</var>, <var>p</var>), then <var>p</var><sub>t+1</sub> = <var>k</var> / 2<var>N</var>'
			},
			{
				label: 'Variance in allele frequency',
				html: 'σ<sup>2</sup> = <span class="frac"><span class="frac-num"><var>p</var>(1 − <var>p</var>)</span><span class="frac-den">2<var>N</var></span></span>'
			}
		],
		parameters: [
			{
				name: 'Pop',
				description: 'Number of replicate populations to simulate independently'
			},
			{
				name: 'Ne',
				description: 'Effective population size — the number of diploid individuals contributing to the gene pool each generation'
			},
			{
				name: 'P(A)',
				description: 'Initial frequency of allele A (range 0 to 1)'
			},
			{
				name: 'Gen',
				description: 'Number of generations to simulate'
			}
		],
		insights: [
			'Smaller populations experience stronger genetic drift, causing larger random fluctuations in allele frequency per generation.',
			'Given enough time, drift alone will drive every allele to fixation (frequency 1) or loss (frequency 0) in every finite population.',
			'Genetic drift is the null model in population genetics: all departures from neutral expectations must be evaluated against drift.',
			'The expected time to fixation of a neutral allele starting at frequency p is approximately −4N(p log p + (1−p) log(1−p)) generations.'
		],
		references: [
			{
				authors: 'Wright, S.',
				title: 'Evolution in Mendelian populations',
				journal: 'Genetics',
				year: 1931,
				doi: '10.1093/genetics/16.2.97'
			},
			{
				authors: 'Kimura, M.',
				title: 'Solution of a process of random genetic drift with a continuous model',
				journal: 'Proceedings of the National Academy of Sciences',
				year: 1955,
				doi: '10.1073/pnas.41.3.144'
			},
			{
				authors: 'Hartl, D.L. & Clark, A.G.',
				title: 'Principles of Population Genetics',
				year: 2007
			},
			{
				authors: 'Charlesworth, B. & Charlesworth, D.',
				title: 'Population genetics from 1966 to 2016',
				journal: 'Heredity',
				year: 2017,
				doi: '10.1038/hdy.2016.55'
			},
			{
				authors: 'Buffalo, V.',
				title: 'Quantifying the relationship between genetic diversity and population size suggests natural selection cannot explain Lewontin\'s Paradox',
				journal: 'eLife',
				year: 2021,
				doi: '10.7554/eLife.67509'
			}
		]
	},

	'/drift/with-selection': {
		title: 'Drift + Selection',
		category: 'Drift',
		description:
			'Combines stochastic genetic drift with deterministic natural selection. Each generation, selection shifts the expected allele frequency according to genotype fitness values, and then binomial sampling introduces random drift. This model demonstrates the tension between adaptive and random evolutionary forces.',
		formulas: [
			{
				label: 'Selection (change in allele frequency)',
				html: 'Δ<var>p</var> = <span class="frac"><span class="frac-num"><var>p</var> · <var>q</var> · [<var>p</var>(<var>w</var><sub>11</sub> − <var>w</var><sub>12</sub>) + <var>q</var>(<var>w</var><sub>12</sub> − <var>w</var><sub>22</sub>)]</span><span class="frac-den"><span class="overline"><var>w</var></span></span></span>'
			},
			{
				label: 'Mean fitness',
				html: '<span class="overline"><var>w</var></span> = <var>p</var><sup>2</sup><var>w</var><sub>11</sub> + 2<var>p</var><var>q</var><var>w</var><sub>12</sub> + <var>q</var><sup>2</sup><var>w</var><sub>22</sub>'
			},
			{
				label: 'Post-selection frequency',
				html: '<var>p</var>′ = <span class="frac"><span class="frac-num"><var>p</var><sup>2</sup><var>w</var><sub>11</sub> + <var>p</var><var>q</var><var>w</var><sub>12</sub></span><span class="frac-den"><span class="overline"><var>w</var></span></span></span>, then <var>k</var> ~ Binomial(2<var>N</var>, <var>p</var>′)'
			}
		],
		parameters: [
			{
				name: 'Pop',
				description: 'Number of replicate populations to simulate independently'
			},
			{
				name: 'Ne',
				description: 'Effective population size'
			},
			{
				name: 'P(A)',
				description: 'Initial frequency of allele A (range 0 to 1)'
			},
			{
				name: 'Gen',
				description: 'Number of generations to simulate'
			},
			{
				name: 'wAA',
				description: 'Fitness of the AA homozygote genotype (range 0 to 1)'
			},
			{
				name: 'wAa',
				description: 'Fitness of the Aa heterozygote genotype (range 0 to 1)'
			},
			{
				name: 'waa',
				description: 'Fitness of the aa homozygote genotype (range 0 to 1)'
			}
		],
		insights: [
			'Selection is more effective in large populations where drift is weak relative to the selective advantage.',
			'When 4<var>N<sub>e</sub></var><var>s</var> < 1 (where <var>s</var> is the selection coefficient), drift can overcome selection and an advantageous allele may be lost.',
			'The balance between drift and selection determines the fate of alleles: beneficial alleles can be lost in small populations, and deleterious alleles can fix.',
			'Heterozygote advantage (overdominance, w12 > w11 and w12 > w22) creates a stable equilibrium that drift continually perturbs.'
		],
		references: [
			{
				authors: 'Fisher, R.A.',
				title: 'The Genetical Theory of Natural Selection',
				year: 1930
			},
			{
				authors: 'Wright, S.',
				title: 'Evolution in Mendelian populations',
				journal: 'Genetics',
				year: 1931,
				doi: '10.1093/genetics/16.2.97'
			},
			{
				authors: 'Kimura, M.',
				title: 'On the probability of fixation of mutant genes in a population',
				journal: 'Genetics',
				year: 1962,
				doi: '10.1093/genetics/47.6.713'
			},
			{
				authors: 'Müller, R., Kaj, I. & Mugal, C.F.',
				title: 'A nearly neutral model of molecular signatures of natural selection after change in population size',
				journal: 'Genome Biology and Evolution',
				year: 2022,
				doi: '10.1093/gbe/evac058'
			}
		]
	},

	'/drift/with-mutation': {
		title: 'Drift + Mutation',
		category: 'Drift',
		description:
			'Combines genetic drift with bidirectional mutation between two alleles. Mutation introduces new variation each generation while drift removes it stochastically. The interplay between these two forces determines the level of genetic variation maintained in a population.',
		formulas: [
			{
				label: 'Mutation (before drift)',
				html: '<var>p</var>′ = <var>p</var>(1 − μ) + (1 − <var>p</var>)ν'
			},
			{
				label: 'Equilibrium frequency',
				html: '<var>p̂</var> = <span class="frac"><span class="frac-num">ν</span><span class="frac-den">μ + ν</span></span>'
			},
			{
				label: 'Drift sampling',
				html: '<var>k</var> ~ Binomial(2<var>N</var>, <var>p</var>′), then <var>p</var><sub>t+1</sub> = <var>k</var> / 2<var>N</var>'
			}
		],
		parameters: [
			{
				name: 'Pop',
				description: 'Number of replicate populations to simulate independently'
			},
			{
				name: 'Ne',
				description: 'Effective population size'
			},
			{
				name: 'P(A)',
				description: 'Initial frequency of allele A (range 0 to 1)'
			},
			{
				name: 'Gen',
				description: 'Number of generations to simulate'
			},
			{
				name: 'μ',
				description: 'Forward mutation rate from allele A to allele a per generation'
			},
			{
				name: 'ν',
				description: 'Back mutation rate from allele a to allele A per generation'
			}
		],
		insights: [
			'Mutation prevents permanent fixation or loss of alleles by continuously reintroducing variation, unlike pure drift where absorbing barriers are inevitable.',
			'The mutation-drift balance maintains genetic variation at a level determined by both population size and mutation rates.',
			'The equilibrium allele frequency depends only on the ratio of mutation rates (ν/(μ+ν)), not on population size.',
			'When mutation rates are very small relative to drift (4Nμ << 1), most populations will be near fixation or loss at any given time, with occasional transitions between states.'
		],
		references: [
			{
				authors: 'Wright, S.',
				title: 'Evolution in Mendelian populations',
				journal: 'Genetics',
				year: 1931,
				doi: '10.1093/genetics/16.2.97'
			},
			{
				authors: 'Crow, J.F. & Kimura, M.',
				title: 'An Introduction to Population Genetics Theory',
				year: 1970
			},
			{
				authors: 'Lynch, M., Ackerman, M.S., Gout, J.-F., Long, H., Sung, W., Thomas, W.K. & Foster, P.L.',
				title: 'Genetic drift, selection and the evolution of the mutation rate',
				journal: 'Nature Reviews Genetics',
				year: 2016,
				doi: '10.1038/nrg.2016.104'
			}
		]
	},

	'/drift/combined': {
		title: 'Drift + Selection + Mutation',
		category: 'Drift',
		description:
			'The full Wright-Fisher model combining all three fundamental evolutionary forces: genetic drift, natural selection, and bidirectional mutation. Mutation introduces variation, selection biases allele frequency changes toward higher fitness, and drift adds stochastic noise. This is the most complete single-locus model of microevolution.',
		formulas: [
			{
				label: 'Step 1: Selection',
				html: '<var>p</var>* = <span class="frac"><span class="frac-num"><var>p</var><sup>2</sup><var>w</var><sub>11</sub> + <var>p</var><var>q</var><var>w</var><sub>12</sub></span><span class="frac-den"><span class="overline"><var>w</var></span></span></span>'
			},
			{
				label: 'Step 2: Mutation',
				html: '<var>p</var>′ = <var>p</var>*(1 − μ) + (1 − <var>p</var>*)ν'
			},
			{
				label: 'Step 3: Drift',
				html: '<var>k</var> ~ Binomial(2<var>N</var>, <var>p</var>′), then <var>p</var><sub>t+1</sub> = <var>k</var> / 2<var>N</var>'
			}
		],
		parameters: [
			{
				name: 'Pop',
				description: 'Number of replicate populations to simulate independently'
			},
			{
				name: 'Ne',
				description: 'Effective population size'
			},
			{
				name: 'P(A)',
				description: 'Initial frequency of allele A (range 0 to 1)'
			},
			{
				name: 'Gen',
				description: 'Number of generations to simulate'
			},
			{
				name: 'wAA',
				description: 'Fitness of the AA homozygote genotype (range 0 to 1)'
			},
			{
				name: 'wAa',
				description: 'Fitness of the Aa heterozygote genotype (range 0 to 1)'
			},
			{
				name: 'waa',
				description: 'Fitness of the aa homozygote genotype (range 0 to 1)'
			},
			{
				name: 'μ',
				description: 'Forward mutation rate from allele A to allele a per generation'
			},
			{
				name: 'ν',
				description: 'Back mutation rate from allele a to allele A per generation'
			}
		],
		insights: [
			'All three forces interact simultaneously to determine allele frequency trajectories: mutation supplies raw material, selection shapes it, and drift adds randomness.',
			'Wright\'s shifting balance theory arises from this interplay: drift can move populations between adaptive peaks in a fitness landscape that selection alone cannot traverse.',
			'In small populations, drift dominates and allele trajectories appear nearly neutral regardless of selection strength. In large populations, selection dominates and trajectories converge toward the deterministic equilibrium.',
			'Mutation-selection-drift balance is the most realistic single-locus model for understanding how natural populations maintain or lose genetic variation.'
		],
		references: [
			{
				authors: 'Wright, S.',
				title: 'Evolution in Mendelian populations',
				journal: 'Genetics',
				year: 1931,
				doi: '10.1093/genetics/16.2.97'
			},
			{
				authors: 'Wright, S.',
				title: 'The roles of mutation, inbreeding, crossbreeding and selection in evolution',
				journal: 'Proceedings of the Sixth International Congress of Genetics',
				year: 1932
			},
			{
				authors: 'Berg, J.J., Li, X., Riall, K., Hayward, L.K. & Sella, G.',
				title: 'Mutation–selection–drift balance models of complex diseases',
				journal: 'Genetics',
				year: 2025,
				doi: '10.1093/genetics/iyaf220'
			}
		]
	},

	'/drift/markov': {
		title: 'Markov Chain Drift',
		category: 'Drift',
		description:
			'Models the full probability distribution of allele frequencies over time using a Markov chain transition matrix. Instead of simulating individual stochastic trajectories, this approach computes the exact probability of every possible allele count at each generation. The state space consists of 2N+1 states representing 0 to 2N copies of the allele.',
		formulas: [
			{
				label: 'Transition probability',
				html: '<var>P</var>(<var>j</var> | <var>i</var>) = C(2<var>N</var>, <var>j</var>) · (<var>i</var> / 2<var>N</var>)<sup><var>j</var></sup> · (1 − <var>i</var> / 2<var>N</var>)<sup>2<var>N</var> − <var>j</var></sup>'
			},
			{
				label: 'State vector evolution',
				html: '<strong>v</strong><sub>t+1</sub>(<var>j</var>) = Σ<sub><var>i</var></sub> <strong>v</strong><sub>t</sub>(<var>i</var>) · <var>P</var>(<var>j</var> | <var>i</var>)'
			}
		],
		parameters: [
			{
				name: 'Ne',
				description: 'Effective population size (diploid); the state space has 2Ne + 1 states representing 0 to 2Ne allele copies'
			},
			{
				name: 'State',
				description: 'Initial allele count (number of A allele copies, from 0 to 2Ne)'
			},
			{
				name: 'Gen',
				description: 'Number of generations to evolve the probability distribution'
			}
		],
		insights: [
			'This visualization shows the full probability distribution of allele frequencies, not just individual sample paths.',
			'States 0 and 2N are absorbing barriers: once all copies of an allele are lost or fixed, the population remains in that state permanently.',
			'Over time, probability mass accumulates at the absorbing states (fixation and loss), with the interior distribution flattening and eventually vanishing.',
			'For large N, the Markov chain converges to Kimura\'s diffusion approximation, which provides elegant analytical solutions.'
		],
		references: [
			{
				authors: 'Ewens, W.J.',
				title: 'Mathematical Population Genetics I: Theoretical Introduction',
				year: 2004
			},
			{
				authors: 'Kimura, M.',
				title: 'Solution of a process of random genetic drift with a continuous model',
				journal: 'Proceedings of the National Academy of Sciences',
				year: 1955,
				doi: '10.1073/pnas.41.3.144'
			},
			{
				authors: 'Tataru, P., Simonsen, M., Bataillon, T. & Hobolth, A.',
				title: 'Statistical inference in the Wright–Fisher model using allele frequency data',
				journal: 'Systematic Biology',
				year: 2017,
				doi: '10.1093/sysbio/syw056'
			},
			{
				authors: 'Krukov, I., de Sanctis, B. & de Koning, A.P.J.',
				title: 'Wright–Fisher exact solver (WFES): scalable analysis of population genetic models without simulation or diffusion theory',
				journal: 'Bioinformatics',
				year: 2017,
				doi: '10.1093/bioinformatics/btw802'
			}
		]
	},

	'/drift/bottleneck': {
		title: 'Bottleneck Effect',
		category: 'Drift',
		description:
			'Visualizes a population bottleneck — a severe reduction in population size followed by recovery. During a bottleneck, genetic drift operates intensely on the small surviving population, causing dramatic changes in allele frequencies and loss of genetic diversity. The founder effect is a special case where a small group establishes a new population.',
		formulas: [
			{
				label: 'Heterozygosity after bottleneck',
				html: '<var>H</var><sub>b</sub> = <var>H</var><sub>0</sub> · (1 − <span class="frac"><span class="frac-num">1</span><span class="frac-den">2<var>N</var><sub>b</sub></span></span>)'
			},
			{
				label: 'Expected allele frequency change',
				html: 'σ<sup>2</sup>(<var>p</var>) = <span class="frac"><span class="frac-num"><var>p</var>(1 − <var>p</var>)</span><span class="frac-den">2<var>N</var><sub>b</sub></span></span>'
			},
			{
				label: 'Effective population size during bottleneck',
				html: '<span class="frac"><span class="frac-num">1</span><span class="frac-den"><var>N</var><sub>e</sub></span></span> ≈ <span class="frac"><span class="frac-num">1</span><span class="frac-den"><var>t</var></span></span> Σ <span class="frac"><span class="frac-num">1</span><span class="frac-den"><var>N</var><sub>i</sub></span></span>'
			}
		],
		parameters: [
			{
				name: 'Initial N',
				description: 'Population size before the bottleneck event'
			},
			{
				name: 'Survivors',
				description: 'Number of individuals surviving the bottleneck (the genetic sample)'
			},
			{
				name: 'Initial p',
				description: 'Initial frequency of allele A in the population'
			},
			{
				name: 'Recovery N',
				description: 'Target population size after recovery'
			}
		],
		insights: [
			'A bottleneck is essentially an extreme sampling event: the survivors are a random sample from the original population, and their gene pool becomes the foundation for recovery.',
			'Even brief bottlenecks can have lasting genetic consequences because allele frequencies established during the crash persist as the population recovers.',
			'The smaller the bottleneck, the greater the variance in post-bottleneck allele frequencies — rare alleles may be lost or become common purely by chance.',
			'Real-world bottlenecks (disease outbreaks, habitat destruction, founding events) have shaped the genetic structure of many species, including humans.'
		],
		references: [
			{
				authors: 'Nei, M., Maruyama, T. & Chakraborty, R.',
				title: 'The bottleneck effect and genetic variability in populations',
				journal: 'Evolution',
				year: 1975,
				doi: '10.2307/2407137'
			},
			{
				authors: 'Tajima, F.',
				title: 'The effect of change in population size on DNA polymorphism',
				journal: 'Genetics',
				year: 1989,
				doi: '10.1093/genetics/123.3.597'
			},
			{
				authors: 'Hartl, D.L. & Clark, A.G.',
				title: 'Principles of Population Genetics',
				year: 2007
			},
			{
				authors: 'Palkopoulou, E. et al.',
				title: 'Complete genomes reveal signatures of demographic and genetic declines in the woolly mammoth',
				journal: 'Current Biology',
				year: 2015,
				doi: '10.1016/j.cub.2015.04.007'
			}
		]
	},

	'/drift/founder': {
		title: 'Founder Effect',
		category: 'Drift',
		description:
			'Demonstrates the founder effect — when a small group of individuals establishes a new population, carrying only a sample of the original genetic diversity. The founding population\'s allele frequencies, which may differ substantially from the source population by chance, become the baseline for the new population. This sampling error can establish rare alleles at high frequencies or eliminate common ones entirely.',
		formulas: [
			{
				label: 'Expected loss of heterozygosity',
				html: 'ΔH = <span class="frac"><span class="frac-num"><var>H</var><sub>0</sub></span><span class="frac-den">2<var>N</var><sub>f</sub></span></span>'
			},
			{
				label: 'Variance in founder allele frequency',
				html: 'Var(<var>p</var><sub>f</sub>) = <span class="frac"><span class="frac-num"><var>p</var>(1 − <var>p</var>)</span><span class="frac-den">2<var>N</var><sub>f</sub></span></span>'
			},
			{
				label: 'Probability of allele loss',
				html: 'P(loss) = (1 − <var>p</var>)<sup>2<var>N</var><sub>f</sub></sup>'
			}
		],
		parameters: [
			{
				name: 'Source N',
				description: 'Size of the source population from which founders are drawn'
			},
			{
				name: 'Founders',
				description: 'Number of individuals founding the new population'
			},
			{
				name: 'Initial p',
				description: 'Allele frequency in the source population'
			},
			{
				name: 'Target N',
				description: 'Population size the new colony will grow to'
			}
		],
		insights: [
			'The founder effect is a special case of a bottleneck where the surviving group colonizes new territory, establishing a population genetically distinct from its source.',
			'Human populations show clear signatures of founder effects from migrations out of Africa: each successive migration carried only a subset of genetic diversity.',
			'Founder effects can elevate rare disease alleles to high frequencies in isolated populations (e.g., Ellis-van Creveld syndrome in Amish communities).',
			'Island populations, both literal and cultural, frequently exhibit founder effects due to limited initial colonizers.'
		],
		references: [
			{
				authors: 'Mayr, E.',
				title: 'Change of genetic environment and evolution',
				journal: 'Evolution as a Process (Huxley, Hardy & Ford, eds.)',
				year: 1954
			},
			{
				authors: 'Templeton, A.R.',
				title: 'The theory of speciation via the founder principle',
				journal: 'Genetics',
				year: 1980,
				doi: '10.1093/genetics/94.4.1011'
			},
			{
				authors: 'Ramachandran, S. et al.',
				title: 'Support from the relationship of genetic and geographic distance in human populations for a serial founder effect originating in Africa',
				journal: 'Proceedings of the National Academy of Sciences',
				year: 2005,
				doi: '10.1073/pnas.0507611102'
			},
			{
				authors: 'Lohmueller, K.E.',
				title: 'The impact of population demography and selection on the genetic architecture of complex traits',
				journal: 'PLoS Genetics',
				year: 2014,
				doi: '10.1371/journal.pgen.1004379'
			}
		]
	},

	'/drift/heterozygosity': {
		title: 'Heterozygosity Decay',
		category: 'Drift',
		description:
			'Tracks the decline of heterozygosity over time due to genetic drift. Heterozygosity (H = 2pq) measures genetic diversity at a locus and decays predictably in finite populations. The simulation overlays the deterministic expected decay curve with stochastic drift trajectories to illustrate the variability around the theoretical prediction.',
		formulas: [
			{
				label: 'Initial heterozygosity',
				html: '<var>H</var><sub>0</sub> = 2<var>p</var><sub>0</sub>(1 − <var>p</var><sub>0</sub>)'
			},
			{
				label: 'Expected heterozygosity at generation t',
				html: '<var>H</var>(<var>t</var>) = <var>H</var><sub>0</sub> · (1 − <span class="frac"><span class="frac-num">1</span><span class="frac-den">2<var>N</var></span></span>)<sup><var>t</var></sup>'
			},
			{
				label: 'Half-life of heterozygosity',
				html: '<var>t</var><sub>1/2</sub> = <span class="frac"><span class="frac-num">ln 2</span><span class="frac-den">ln(2<var>N</var>) − ln(2<var>N</var> − 1)</span></span> ≈ 1.4 <var>N</var>'
			}
		],
		parameters: [
			{
				name: 'Ne',
				description: 'Effective population size — determines the rate of heterozygosity decay'
			},
			{
				name: 'p',
				description: 'Initial frequency of allele A (range 0.01 to 0.5); determines initial heterozygosity H0 = 2p(1-p)'
			},
			{
				name: 'Gen',
				description: 'Number of generations to simulate'
			},
			{
				name: 'Drift',
				description: 'Number of stochastic drift trajectories to overlay on the deterministic expected curve (0 for deterministic only)'
			}
		],
		insights: [
			'Heterozygosity decays approximately exponentially, losing a fraction 1/(2N) of its current value each generation.',
			'The effective population size 2N is the characteristic timescale: larger populations retain heterozygosity for proportionally longer.',
			'Loss of heterozygosity is equivalent to loss of genetic variation and increasing homozygosity (inbreeding) within the population.',
			'The deterministic curve represents the expected value averaged over many populations; individual stochastic trajectories fluctuate around this expectation and eventually reach zero when one allele fixes.'
		],
		references: [
			{
				authors: 'Wright, S.',
				title: 'Evolution in Mendelian populations',
				journal: 'Genetics',
				year: 1931,
				doi: '10.1093/genetics/16.2.97'
			},
			{
				authors: 'Nei, M.',
				title: 'Analysis of gene diversity in subdivided populations',
				journal: 'Proceedings of the National Academy of Sciences',
				year: 1973,
				doi: '10.1073/pnas.70.12.3321'
			},
			{
				authors: 'Hedrick, P.W.',
				title: 'Genetics of Populations',
				year: 2011
			},
			{
				authors: 'Allendorf, F.W., Hössjer, O. & Ryman, N.',
				title: 'What does effective population size tell us about loss of allelic variation?',
				journal: 'Evolutionary Applications',
				year: 2024,
				doi: '10.1111/eva.13733'
			},
			{
				authors: 'Pinto, A.V., Hansson, B., Patramanis, I., Morales, H.E. & van Oosterhout, C.',
				title: 'The impact of habitat loss and population fragmentation on genomic erosion',
				journal: 'Conservation Genetics',
				year: 2024,
				doi: '10.1007/s10592-023-01548-9'
			}
		]
	}
};
