import * as d3 from 'd3';
import type { SimPoint, SimResult } from '$lib/sim/types';

export interface ChartOptions {
	xLabel?: string;
	yLabel?: string;
	yDomain?: [number, number];
	lineLabels?: string[];
	// Additional features (matching driftChart capabilities)
	showMeanLine?: boolean;
	showReferenceLine?: number; // Y-value to draw horizontal reference line
	referenceLineLabel?: string;
	thinLines?: boolean; // Thinner lines for many trajectories
	// Overlay support for comparing saved runs
	overlayData?: SimResult;
	overlayLabels?: string[];
}

const VIZ_VARS = [
	'--viz-1', '--viz-2', '--viz-3', '--viz-4',
	'--viz-5', '--viz-6', '--viz-7', '--viz-8'
];

function computeMeanTrajectory(data: SimResult): SimPoint[] {
	if (data.length === 0) return [];

	const maxGen = Math.max(...data.map(s => s.length));
	const mean: SimPoint[] = [];

	for (let gen = 0; gen < maxGen; gen++) {
		let sum = 0;
		let count = 0;
		data.forEach((series) => {
			if (series[gen]) {
				sum += series[gen].frequency;
				count++;
			}
		});
		if (count > 0) {
			mean.push({ generation: gen, frequency: sum / count });
		}
	}

	return mean;
}

export function renderLineChart(
	container: HTMLElement,
	data: SimResult,
	options: ChartOptions = {}
) {
	const {
		xLabel = 'Generations',
		yLabel = 'Allele Frequency',
		yDomain,
		lineLabels,
		showMeanLine = false,
		showReferenceLine,
		referenceLineLabel,
		thinLines = false,
		overlayData = [],
		overlayLabels = []
	} = options;

	// Auto-compute yDomain if not provided
	let computedYDomain: [number, number] = yDomain ?? [0, 1];
	if (!yDomain && data.length > 0) {
		const allValues = data.flat().map(d => d.frequency);
		const minVal = Math.min(...allValues);
		const maxVal = Math.max(...allValues);
		const padding = (maxVal - minVal) * 0.1 || 0.1;
		computedYDomain = [Math.max(0, minVal - padding), maxVal + padding];
	}

	d3.select(container).selectAll('*').remove();

	const rect = container.getBoundingClientRect();
	const w = rect.width;
	const h = rect.height;
	if (w < 10 || h < 10) return;

	const style = getComputedStyle(document.body);
	const axisColor = style.getPropertyValue('--axis').trim();
	const gridColor = style.getPropertyValue('--grid').trim();
	const labelColor = style.getPropertyValue('--label').trim();
	const textColor = style.getPropertyValue('--text').trim();
	const bgColor = style.getPropertyValue('--bg').trim();
	const baseLineOpacity = parseFloat(style.getPropertyValue('--line-opacity').trim()) || 0.8;
	const lineOpacity = thinLines ? 0.5 : baseLineOpacity;
	const lineWidth = thinLines ? 1.2 : 1.8;
	const accentColor = style.getPropertyValue('--accent').trim();

	const colors = VIZ_VARS.map((v) => style.getPropertyValue(v).trim());

	const margin = { top: 24, right: 32, bottom: 52, left: 60 };
	const iw = w - margin.left - margin.right;
	const ih = h - margin.top - margin.bottom;

	const maxGen = data.length > 0
		? d3.max(data, (line) => d3.max(line, (d) => d.generation)) ?? 100
		: 100;

	const svg = d3.select(container)
		.append('svg')
		.attr('width', w)
		.attr('height', h);

	const g = svg.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`);

	const x = d3.scaleLinear().domain([0, maxGen]).range([0, iw]);
	const y = d3.scaleLinear().domain(computedYDomain).range([ih, 0]);

	// Grid lines
	const yTicks = y.ticks(5);
	const xTicks = x.ticks(5);

	g.selectAll('.grid-y')
		.data(yTicks)
		.enter().append('line')
		.attr('x1', 0).attr('x2', iw)
		.attr('y1', (d) => y(d)).attr('y2', (d) => y(d))
		.attr('stroke', gridColor)
		.attr('stroke-dasharray', '2,4');

	g.selectAll('.grid-x')
		.data(xTicks)
		.enter().append('line')
		.attr('x1', (d) => x(d)).attr('x2', (d) => x(d))
		.attr('y1', 0).attr('y2', ih)
		.attr('stroke', gridColor)
		.attr('stroke-dasharray', '2,4');

	// Reference line (horizontal)
	if (showReferenceLine !== undefined) {
		g.append('line')
			.attr('x1', 0)
			.attr('x2', iw)
			.attr('y1', y(showReferenceLine))
			.attr('y2', y(showReferenceLine))
			.attr('stroke', accentColor)
			.attr('stroke-width', 1)
			.attr('stroke-dasharray', '6,4')
			.attr('opacity', 0.6);

		if (referenceLineLabel) {
			g.append('text')
				.attr('x', iw + 4)
				.attr('y', y(showReferenceLine) + 3)
				.attr('font-family', 'Inter, sans-serif')
				.attr('font-size', '9px')
				.attr('fill', accentColor)
				.attr('opacity', 0.8)
				.text(referenceLineLabel);
		}
	}

	// Axes
	g.append('g')
		.attr('transform', `translate(0,${ih})`)
		.call(d3.axisBottom(x).ticks(5));

	g.append('g')
		.call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2f')));

	svg.selectAll('.domain').attr('stroke', axisColor);
	svg.selectAll('.tick line').attr('stroke', axisColor);
	svg.selectAll('.tick text')
		.attr('fill', labelColor)
		.attr('font-family', 'Inter, sans-serif')
		.attr('font-size', '10px');

	// Data lines
	const line = d3.line<SimPoint>()
		.x((d) => x(d.generation))
		.y((d) => y(d.frequency))
		.curve(d3.curveCatmullRom.alpha(0.5));

	data.forEach((series, i) => {
		const path = g.append('path')
			.datum(series)
			.attr('fill', 'none')
			.attr('stroke', colors[i % colors.length])
			.attr('stroke-width', lineWidth)
			.attr('opacity', lineOpacity)
			.attr('d', line);

		const totalLength = (path.node() as SVGPathElement).getTotalLength();
		path
			.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
			.attr('stroke-dashoffset', totalLength)
			.transition()
			.duration(1200)
			.delay(i * 60)
			.ease(d3.easeQuadOut)
			.attr('stroke-dashoffset', 0);
	});

	// Overlay data lines (saved runs for comparison)
	if (overlayData.length > 0) {
		const colorOffset = data.length; // Start after primary data colors
		overlayData.forEach((series, i) => {
			g.append('path')
				.datum(series)
				.attr('fill', 'none')
				.attr('stroke', colors[(colorOffset + i) % colors.length])
				.attr('stroke-width', lineWidth * 0.8)
				.attr('stroke-dasharray', '4,2')
				.attr('opacity', 0.5)
				.attr('d', line);
		});
	}

	// Mean trajectory line
	if (showMeanLine && data.length > 1) {
		const meanData = computeMeanTrajectory(data);

		g.append('path')
			.datum(meanData)
			.attr('fill', 'none')
			.attr('stroke', textColor)
			.attr('stroke-width', 2.5)
			.attr('opacity', 0)
			.attr('d', line)
			.transition()
			.delay(1400)
			.duration(600)
			.attr('opacity', 0.9);

		// Label for mean line
		if (meanData.length > 0) {
			const lastMean = meanData[meanData.length - 1];
			g.append('text')
				.attr('x', x(lastMean.generation) + 4)
				.attr('y', y(lastMean.frequency) + 3)
				.attr('font-family', 'Inter, sans-serif')
				.attr('font-size', '9px')
				.attr('font-weight', '600')
				.attr('fill', textColor)
				.attr('opacity', 0)
				.text('μ')
				.transition()
				.delay(1800)
				.duration(300)
				.attr('opacity', 0.9);
		}
	}

	// Axis labels
	svg.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', margin.left + iw / 2)
		.attr('y', h - 10)
		.attr('font-family', 'Inter, sans-serif')
		.attr('font-size', '11px')
		.attr('font-weight', '500')
		.attr('fill', labelColor)
		.text(xLabel);

	svg.append('text')
		.attr('text-anchor', 'middle')
		.attr('transform', 'rotate(-90)')
		.attr('y', 16)
		.attr('x', -(margin.top + ih / 2))
		.attr('font-family', 'Inter, sans-serif')
		.attr('font-size', '11px')
		.attr('font-weight', '500')
		.attr('fill', labelColor)
		.text(yLabel);

	// --- Crosshair interaction ---
	if (data.length === 0) return;

	// Create crosshair group
	const crosshairGroup = g.append('g')
		.attr('class', 'crosshair')
		.style('opacity', 0);

	// Vertical line
	const crosshairLine = crosshairGroup.append('line')
		.attr('y1', 0)
		.attr('y2', ih)
		.attr('stroke', gridColor)
		.attr('stroke-width', 1)
		.attr('stroke-dasharray', '4,4');

	// Generation label at top
	const genLabel = crosshairGroup.append('text')
		.attr('y', -8)
		.attr('text-anchor', 'middle')
		.attr('font-family', 'Inter, sans-serif')
		.attr('font-size', '10px')
		.attr('font-weight', '600')
		.attr('fill', textColor);

	// Create dots for each series
	const crosshairDots = data.map((_, i) => {
		return crosshairGroup.append('circle')
			.attr('r', 4)
			.attr('fill', colors[i % colors.length])
			.attr('stroke', bgColor)
			.attr('stroke-width', 1.5);
	});

	// Info panel
	const panelWidth = 100;
	const panelHeight = Math.min(20 + data.length * 16, 120);

	const infoPanel = crosshairGroup.append('g')
		.attr('class', 'info-panel');

	infoPanel.append('rect')
		.attr('width', panelWidth)
		.attr('height', panelHeight)
		.attr('rx', 3)
		.attr('fill', bgColor)
		.attr('stroke', gridColor)
		.attr('stroke-width', 1)
		.attr('opacity', 0.95);

	// Text elements for each series
	const infoTexts = data.map((_, i) => {
		return infoPanel.append('text')
			.attr('x', 8)
			.attr('y', 14 + i * 16)
			.attr('font-family', 'Inter, sans-serif')
			.attr('font-size', '10px')
			.attr('fill', colors[i % colors.length]);
	});

	// Binary search to find closest generation
	function findClosestPoint(series: SimPoint[], targetGen: number): SimPoint | null {
		if (series.length === 0) return null;

		let left = 0;
		let right = series.length - 1;

		while (left < right) {
			const mid = Math.floor((left + right) / 2);
			if (series[mid].generation < targetGen) {
				left = mid + 1;
			} else {
				right = mid;
			}
		}

		// Check if left-1 is closer
		if (left > 0) {
			const diffLeft = Math.abs(series[left].generation - targetGen);
			const diffLeftMinus = Math.abs(series[left - 1].generation - targetGen);
			if (diffLeftMinus < diffLeft) {
				left = left - 1;
			}
		}

		return series[left];
	}

	// Create overlay rect for mouse events
	g.append('rect')
		.attr('class', 'overlay')
		.attr('width', iw)
		.attr('height', ih)
		.attr('fill', 'transparent')
		.style('cursor', 'crosshair')
		.on('mouseenter', () => {
			crosshairGroup.style('opacity', 1);
		})
		.on('mouseleave', () => {
			crosshairGroup.style('opacity', 0);
		})
		.on('mousemove', function(event) {
			const [mouseX] = d3.pointer(event, this);
			const generation = x.invert(mouseX);
			const clampedGen = Math.max(0, Math.min(maxGen, generation));
			const roundedGen = Math.round(clampedGen);

			// Update crosshair line position
			crosshairLine.attr('x1', x(roundedGen)).attr('x2', x(roundedGen));

			// Update generation label
			genLabel
				.attr('x', x(roundedGen))
				.text(`Gen ${roundedGen}`);

			// Update dots and info text for each series
			data.forEach((series, i) => {
				const point = findClosestPoint(series, roundedGen);
				if (point) {
					crosshairDots[i]
						.attr('cx', x(point.generation))
						.attr('cy', y(point.frequency));

					const label = lineLabels && lineLabels[i] ? lineLabels[i] : `#${i + 1}`;
					infoTexts[i].text(`${label}: ${point.frequency.toFixed(4)}`);
				}
			});

			// Position info panel
			let panelX = x(roundedGen) + 12;
			let panelY = 10;

			// Keep panel inside visible area
			if (panelX + panelWidth > iw) {
				panelX = x(roundedGen) - panelWidth - 12;
			}

			infoPanel.attr('transform', `translate(${panelX}, ${panelY})`);
		});
}
