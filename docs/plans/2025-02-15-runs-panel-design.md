# Runs Panel Design

Save, compare, and export simulation runs.

## Overview

Add a slide-out panel (like HelpPanel) that allows users to:
- Save simulation runs with parameters to localStorage
- Compare multiple runs by overlaying them on the same chart
- Export data as CSV or JSON

## Data Model

```typescript
interface SavedRun {
  id: string;                              // crypto.randomUUID()
  name: string;                            // auto-generated, editable
  module: string;                          // route key, e.g., "/drift"
  timestamp: number;                       // Date.now()
  params: Record<string, number | string>; // { N: 100, p: 0.5, ... }
  data: SimResult;                         // trajectory data
  visible: boolean;                        // toggled for comparison
}
```

**Storage:** `localStorage` key `popgenes-runs` containing `SavedRun[]`.

**Limits:** Max 20 runs per module. Oldest auto-deleted when limit reached.

## Component Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/lib/stores/runs.ts` | localStorage CRUD + Svelte store |
| `src/lib/components/RunsPanel.svelte` | Slide-out panel UI |
| `src/lib/utils/export.ts` | CSV/JSON generation + download |

### Modified Files

| File | Changes |
|------|---------|
| `SimLayout.svelte` | Add `⊞` button, bind panel, accept `moduleKey` + `currentRun` props |
| `Chart.svelte` | Accept optional `overlayData: SimResult[]` prop |
| `DriftChart.svelte` | Same overlay support |
| Route pages | Pass params object to SimLayout |

## UI Design

### Topbar Button

Add `⊞` button next to existing `?` (help) button. Opens/closes RunsPanel.

### Panel Layout

```
┌─────────────────────────────┐
│ Runs                    [×] │
├─────────────────────────────┤
│ [Save Current Run]         │
├─────────────────────────────┤
│ ☑ Drift N=100 @ 2:34pm  ⋮  │
│ ☐ Drift N=50 @ 2:30pm   ⋮  │
│ ☐ Drift N=200 @ 2:25pm  ⋮  │
├─────────────────────────────┤
│ Export: [CSV] [JSON]       │
└─────────────────────────────┘
```

- Checkbox toggles overlay visibility
- `⋮` menu: Rename, Export CSV, Export JSON, Delete
- Footer exports all visible runs

### Auto-naming

Format: `{Module} {key params} @ {time}`

Example: `Drift N=100 p=0.5 @ 2:34pm`

Users can rename via `⋮` menu.

## Chart Overlay Behavior

### Visual Distinction

| Run Type | Opacity | Style |
|----------|---------|-------|
| Current (unsaved) | 100% | solid lines |
| Saved runs | 50% | dashed lines |

Colors cycle through `--viz-1` to `--viz-8`.

### Info Panel

Hover shows run name + value:
- `Drift N=100: 0.4523`
- `Drift N=50: 0.6812`

### Limits

Max 4 runs visible simultaneously (including current).

### Chart Type Support

| Chart | Overlay Method |
|-------|----------------|
| lineChart / driftChart | Multiple trajectories |
| histogramChart | Skip comparison (future: grouped bars) |
| deFinettiChart / curveChart | Overlay with different colors |

## Export Formats

### CSV

```csv
run,generation,frequency,line
"Drift N=100 @ 2:34pm",0,0.5,1
"Drift N=100 @ 2:34pm",1,0.48,1
```

- One row per data point
- `line` column for multi-trajectory simulations
- Multiple runs concatenated with `run` column

### JSON

```json
{
  "exported": "2025-02-15T...",
  "runs": [
    {
      "name": "Drift N=100 @ 2:34pm",
      "module": "/drift",
      "params": { "N": 100, "p": 0.5, "generations": 200 },
      "data": [[{ "generation": 0, "frequency": 0.5 }, ...]]
    }
  ]
}
```

### Filenames

`popgenes-{module}-{timestamp}.csv` or `.json`

## Scope

### Included

- Save runs to localStorage
- Compare runs within same module
- Export CSV/JSON
- Rename/delete saved runs
- Max 4 visible, 20 stored per module

### Not Included (Future)

- Cross-module comparison
- Chart image export (PNG/SVG)
- Cloud sync / sharing URLs
- Import runs from file

## Estimated Effort

~400-500 lines across 3-4 new files + modifications to existing components.
